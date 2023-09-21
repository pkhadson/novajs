import { App, Environment, Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CfnAuthorizer,
  Cors,
  Integration,
  LambdaIntegration,
  MethodOptions,
  Model,
  RequestValidator,
  RequestValidatorProps,
  Resource,
  RestApi,
  RestApiProps,
} from "aws-cdk-lib/aws-apigateway";
import { RouteResourceFactory } from "./factories/route-resource.factory";
import { IApplicationParams } from "./interfaces/application.interface";
import { Routes } from "./interfaces/route.interface";
import { Mutable } from "@jsnova/utils";
import getResource from "./utils/getResource.util";
import { Function } from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { Queue } from "aws-cdk-lib/aws-sqs";
import logger from "./logger";
import { LambdaFunction } from "aws-cdk-lib/aws-events-targets";
import { Rule } from "aws-cdk-lib/aws-events";

const app = new App();
const mainStack = new Stack(app, "NovaJsStack");
Reflect.set(globalThis, "app", app);
Reflect.set(globalThis, "mainStack", mainStack);

class Application {
  app: App;
  api: RestApi;
  models: Record<string, Model> = {};
  methods: Map<string, Integration> = new Map();

  constructor(private params: IApplicationParams) {
    this.env();
    this.app = app;

    const paramsApi: Mutable<RestApiProps> = params.apiOptions || {};

    if (params.cors)
      paramsApi.defaultCorsPreflightOptions = {
        allowHeaders: [
          "Content-Type",
          "X-Amz-Date",
          "Authorization",
          "X-Api-Key",
          "Access-Control-Allow-Credentials",
          "Access-Control-Allow-Headers",
          "Impersonating-User-Sub",
        ],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: this.getCors(),
      };

    this.api = new RestApi(mainStack, params.name || "NovaJsApi", paramsApi);

    Reflect.set(globalThis, "api", this.api);

    this.registerUses();

    for (let i = 0; i < params.controllers.length; i++) {
      this.registerController(params.controllers[i]);
    }

    this.test();
  }
  private env() {
    const env: Environment = { region: this.params.region || "us-east-1" };
    Reflect.set(globalThis, "env", env);
  }

  public registerController(controller: any) {
    const controllerInstance = new controller();
    const routes: Routes = Reflect.get(controllerInstance, "routes");
    const controllerResource: Resource = Reflect.get(
      controllerInstance,
      "resource"
    );

    this.registerIntegrations(controllerInstance);
    this.registerEvents(controllerInstance);

    RouteResourceFactory(controllerResource, routes);
  }

  private registerIntegrations(controller: any) {
    const routes: Routes = Reflect.get(controller, "routes") || [];
    const controllerResource: Resource = Reflect.get(controller, "resource");
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const integration = this.getMethodResponse(controller, route.fn);
      const resource = getResource(controllerResource, route.route);

      const name = `${controller.constructor.name}_${route.fn}`;

      const methodOptions: Mutable<MethodOptions> = {};

      // Registring schema and query validators

      const schema = Reflect.get(controller, `schema_${route.fn}`);
      const query = Reflect.get(controller, `query_${route.fn}`);

      if (schema || query) {
        const validatorName = `validator_${name}`;
        const validatorOptions: Mutable<RequestValidatorProps> = {
          restApi: this.api,
          requestValidatorName: validatorName,
          validateRequestBody: true,
        };

        if (schema) {
          const model = this.getModel(
            Reflect.get(controller, `schema_${route.fn}`)
          );

          validatorOptions.requestValidatorName = validatorName;

          methodOptions.requestModels = {
            "application/json": model,
          };
        }

        if (query) {
          methodOptions.requestParameters = {
            "method.request.querystring.email": true,
          };
          validatorOptions.validateRequestParameters = true;
        }

        methodOptions.requestValidator = new RequestValidator(
          this.api,
          validatorName,
          validatorOptions
        );

        methodOptions.requestValidatorOptions;
      }

      // Registring authorizer

      const authorizer = Reflect.get(
        controller.constructor,
        `authorizer_fn_${route.fn}`
      );

      if (authorizer && typeof authorizer === "function") {
        const { authorizer: authorizerCfn } = authorizer() as {
          authorizer: CfnAuthorizer;
        };

        methodOptions.authorizer = {
          authorizerId: authorizerCfn.ref,
        };

        if (authorizerCfn.type === "COGNITO_USER_POOLS")
          methodOptions.authorizationType = AuthorizationType.COGNITO;

        if (authorizerCfn.type === "TOKEN")
          methodOptions.authorizationType = AuthorizationType.CUSTOM;
      }

      if (integration) {
        resource
          .addMethod(route.method, integration, methodOptions)
          .addMethodResponse({
            statusCode: "200",
          });
      }
    }
  }

  private registerEvents(controller: any) {
    const controllerPrototype = Object.getPrototypeOf(controller);

    // the line below get all method name from the class
    const methods = Object.getOwnPropertyNames(controllerPrototype);
    for (let i = 0; i < methods.length; i++) {
      if (
        methods[i] === "constructor" ||
        typeof controller[methods[i]] !== "function"
      )
        continue;
      const methodName = methods[i];
      const method = controller[methodName];
      let functionLambda: any = this.getMethodResponse(controller, methodName);
      functionLambda = functionLambda.handler as Function;
      if (!functionLambda) continue;

      if (Reflect.has(controller, `sqs_${methodName}`)) {
        logger.debug(`Registering SQS for ${methodName}`);

        const sqs = Reflect.get(controller, `sqs_${methodName}`) as Queue[];

        for (let j = 0; j < sqs.length; j++) {
          functionLambda.addEventSource(
            new SqsEventSource(sqs[j], {
              batchSize: 10,
            })
          );
        }
      }
      if (Reflect.has(controller, `rules_${methodName}`)) {
        logger.debug(`Registering Rules for ${methodName}`);
        const rules = Reflect.get(controller, `rules_${methodName}`) as Rule[];

        const target = new LambdaFunction(functionLambda);

        for (let j = 0; j < rules.length; j++) {
          const rule = rules[j];
          rule.addTarget(target);
        }
      }
    }
  }

  getModel(schema: any): Model {
    if (this.models[schema.title]) return this.models[schema.title];

    require("fs").writeFileSync("/tmp/a.log", "=== MODEL\n", { flag: "a+" });
    const validator = new Model(this.api, schema.title, {
      restApi: this.api,
      schema,
      modelName: schema.title,
    });
    this.models[schema.title] = validator;
    return validator;
  }

  test() {
    // const integration = new HttpIntegration("https://echo.zuplo.io/", {
    //   proxy: true,
    // });
    // this.api.root.getResource("user")?.addMethod("GET", integration);
  }

  getCors(): string[] {
    if (this.params.cors === true) return Cors.ALL_ORIGINS;
    if (typeof this.params.cors === "string") return [this.params.cors];
    return this.params.cors || [];
  }

  registerUses() {
    const uses = this.params.use || [];
    for (let i = 0; i < uses.length; i++) {
      const use = uses[i];
      if (use && typeof use === "function") use(this);
    }
  }

  getMethodResponse(controller: any, methodName: string): Integration {
    const name = `${
      controller.constructor.name || controller.name || controller
    }_${methodName}`;

    if (this.methods.has(name)) return this.methods.get(name)!;
    const method = controller[methodName]();
    this.methods.set(name, method);
    return method;
  }
}

export default Application;
