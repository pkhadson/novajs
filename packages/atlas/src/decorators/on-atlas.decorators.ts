import { Stack } from "aws-cdk-lib";
import { EventBus, IEventBus, Rule } from "aws-cdk-lib/aws-events";
import { Topic } from "aws-cdk-lib/aws-sns";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { IAtlasConfig } from "../interfaces/config.interface";

const defaultEvents = ["created", "updated", "deleted"];
const atlasEventEnum = {
  created: "insert",
  updated: "update",
  deleted: "delete",
};

let eventBusAtlas: IEventBus;

const getEventBus = (): IEventBus => {
  if (eventBusAtlas) return eventBusAtlas;

  const config = getAtlasConfig();

  if (!config.eventBusSource)
    throw new Error("You must provide a eventBusSource in the config object");

  const mainStack = Reflect.get(globalThis, "mainStack") as Stack;

  eventBusAtlas = EventBus.fromEventBusName(
    mainStack,
    "AtlasEventBus",
    config.eventBusSource
  );

  return eventBusAtlas;
};

let atlasConfig: IAtlasConfig;

const getAtlasConfig = (): IAtlasConfig => {
  if (atlasConfig) return atlasConfig;

  atlasConfig = Reflect.get(globalThis, "ATLAS.CONFIG") as IAtlasConfig;
  return atlasConfig;
};

// The below function receives a array of events (can have wildcards) and returns a array of subjects
// Exemple:
// Input: ['users.*']
// Output: ['users.created', 'users.updated', 'users.deleted']
const getSubjects = (events: string[]) => {
  return events.reduce((subjects: string[], event: string) => {
    if (event.endsWith("*")) {
      const collection = event.split(".")[0];
      subjects.push(
        ...defaultEvents.map((event): string => `${collection}.${event}`)
      );
    } else subjects.push(event);
    return subjects;
  }, []);
};

const subjectToRule = (subject: string) => {
  const [collection, action] = subject.split(".");
  const atlasOperation = atlasEventEnum[action as "updated"];

  return {
    "ns.coll": [{ prefix: collection }],
    operationType: [{ prefix: atlasOperation }],
  };
};

export function OnAtlas(events: string[]) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.set(target, `sqs_${propertyKey}`, []);
    Reflect.set(target, `rules_${propertyKey}`, []);

    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const config = getAtlasConfig();

      if (!config.eventBusSource)
        throw new Error(
          "You must provide a eventBusSource in the config object"
        );

      const response = originalMethod.apply(this, args);

      const mainStack = Reflect.get(globalThis, "mainStack") as Stack;

      const rules = Reflect.get(target, `rules_${propertyKey}`) as Rule[];

      const bus = getEventBus();

      const rule = new Rule(mainStack, `rule-atlas-${propertyKey}`, {
        eventBus: bus,
        eventPattern: {
          source: [{ prefix: "" }] as any[], // Matches all the events in the bus
          detail: {
            $or: getSubjects(events).map((subject) => subjectToRule(subject)),
          },
        },
      });

      rules.push(rule);

      Reflect.set(target, `rules_${propertyKey}`, rules);

      return response;
    };
  };
}
