import { App, Environment, Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  CfnAuthorizer,
  Cors,
  MethodOptions,
  Model,
  RequestValidator,
  Resource,
  RestApi,
  RestApiProps,
} from "aws-cdk-lib/aws-apigateway";
import { RouteResourceFactory } from "./factories/route-resource.factory";
import { IApplicationParams } from "./interfaces/application.interface";
import { Routes } from "./interfaces/route.interface";
import { Mutable } from "@jsnova/utils";
import getResource from "./utils/getResource.util";

const app = new App();
const mainStack = new Stack(app, "NovaJsStack");
Reflect.set(globalThis, "app", app);

class Application {
  app: App;
  api: RestApi;
  models: Record<string, Model> = {};

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

    RouteResourceFactory(controllerResource, routes);
  }

  private registerIntegrations(controller: any) {
    const routes: Routes = Reflect.get(controller, "routes") || [];
    const controllerResource: Resource = Reflect.get(controller, "resource");
    for (let i = 0; i < routes.length; i++) {
      const route = routes[i];
      const integration = controller[route.fn]();
      const resource = getResource(controllerResource, route.route);

      const name = `${controller}_${route.fn}`;

      const methodOptions: Mutable<MethodOptions> = {};

      // Registring schema and query validators

      const schema = Reflect.get(controller, `schema_${route.fn}`);
      const query = Reflect.get(controller, `query_${route.fn}`);

      if (schema || query) {
        const validatorOptions: any = {
          restApi: this.api,
          validateRequestBody: true,
        };

        if (schema) {
          const model = this.getModel(
            Reflect.get(controller, `schema_${route.fn}`)
          );

          validatorOptions.requestValidatorName = model.modelId;

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
          name,
          validatorOptions
        );
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

  getModel(schema: any): Model {
    if (this.models[schema.title]) return this.models[schema.title];
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
}

export default Application;
