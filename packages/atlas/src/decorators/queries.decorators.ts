import {
  LambdaIntegration,
  PassthroughBehavior,
  RestApi,
  HttpIntegration as awsHttp,
} from "aws-cdk-lib/aws-apigateway";
import { IAtlasConfig } from "../interfaces/config.interface";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "node:path";
import * as fs from "node:fs";
import { Function, InlineCode, Runtime } from "aws-cdk-lib/aws-lambda";
import { Duration } from "aws-cdk-lib";

interface IOpts {
  collection?: string;
  dataSource?: string;
  database?: string;
  emit?: boolean | string;
}

let queryHandler: NodejsFunction | undefined;

const getHander = (): NodejsFunction => {
  if (queryHandler) return queryHandler;

  const api: RestApi = Reflect.get(globalThis, "api");
  queryHandler = new Function(api, "function", {
    memorySize: 256,
    handler: "index.handler",
    code: new InlineCode(
      fs.readFileSync(path.join(__dirname, `/../lambda/handler.js`), "utf-8")
    ),
    environment: {
      time: new Date().toISOString(),
      name: "patrick",
    },
    runtime: Runtime.NODEJS_18_X,
    timeout: Duration.seconds(10),
  });

  return queryHandler;
};

const genericAction = (actionName: string, opts?: IOpts) => {
  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const fnResult = originalMethod.apply(this, args);

      const response = fnResult.response;
      delete fnResult.response;

      const atlasConfig = Reflect.get(
        globalThis,
        "ATLAS.CONFIG"
      ) as IAtlasConfig;

      const url = `https://${atlasConfig.region}.data.mongodb-api.com/app/${atlasConfig.appId}/endpoint/data/v1/action/${actionName}`;

      const params: any = {};
      params.database = atlasConfig.database;
      params.dataSource = atlasConfig.dataSource;
      Object.assign(params, fnResult);
      if (opts?.collection) params.collection = opts.collection;
      if (!actionName.startsWith("insert") && response)
        params.filter = response;
      if (opts?.emit) {
        params.url = url;
        params.apiKey = atlasConfig.apiKey;
      }

      const requestTemplates = {
        "application/json": JSON.stringify(params)

          // .replace(/\!\$/gi, "__DOL__@!")
          // .replace(/\$/gi, "\\$")
          // .replace(/__DOL__@!/g, "$")
          .replace(/"#UNCOMMA([^"]+)"/g, "$1")
          .replace(/\\n/g, "\n"),
      };

      const requestParameters = {
        "integration.request.header.api-key": `'${atlasConfig.apiKey}'`,
      };

      const integrationResponses = [
        {
          statusCode: "200",
        },
      ];

      if (opts?.emit)
        return new LambdaIntegration(getHander(), {
          passthroughBehavior: PassthroughBehavior.NEVER,
          requestTemplates,
          requestParameters: requestParameters,
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `$input.path('$.body')`,
              },
            },
          ],

          proxy: false,
        });
      else
        return new awsHttp(url, {
          httpMethod: "POST",
          options: {
            requestTemplates,
            requestParameters,
            integrationResponses,
            passthroughBehavior: PassthroughBehavior.NEVER,
          },
          proxy: false,
        });
    };

    return descriptor;
  };
};

export const FindAll = (collection: string, opts?: IOpts) =>
  genericAction("find", { collection, ...opts });

export const FindOne = (collection: string, opts?: IOpts) =>
  genericAction("findOne", { collection, ...opts });

export const InsertOne = (collection: string, opts?: IOpts) =>
  genericAction("insertOne", { collection, ...opts });
