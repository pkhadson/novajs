export * from "./decorators/queries.decorators";
export * from "./decorators/on-atlas.decorators";
import { Topic } from "aws-cdk-lib/aws-sns";
import { IAtlasConfig } from "./interfaces/config.interface";

export const useAtlas = (config: IAtlasConfig) => {
  Reflect.set(globalThis, "ATLAS.CONFIG", config);

  const mainStack = Reflect.get(globalThis, "mainStack");

  const sns = new Topic(mainStack, "sns-atlas");
  Reflect.set(globalThis, "ATLAS.SNS", sns);
};
