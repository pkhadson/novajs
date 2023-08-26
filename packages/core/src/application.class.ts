import { IApplicationParams } from "./interfaces/application.interface";
import { Environment, App, Stack } from "aws-cdk-lib";
import { Routes } from "./interfaces/route.interface";
import { RouteResourceFactory } from "./factories/route-resource.factory";
import {
  RestApi,
  Resource,
  AwsIntegration,
  HttpIntegration,
  Model,
  RequestValidator,
} from "aws-cdk-lib/aws-apigateway";
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

    this.api = new RestApi(
      mainStack,
      params.name || "NovaJsApi",
      params.apiOptions
    );

    Reflect.set(globalThis, "api", this.api);

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

      const model = this.getModel(
        Reflect.get(controller, `schema_${route.fn}`)
      );

      if (integration)
        resource
          .addMethod(route.method, integration, {
            requestValidator: new RequestValidator(this.api, name, {
              restApi: this.api,
              requestValidatorName: model.modelId,
              validateRequestBody: true,
            }),
            requestModels: {
              "application/json": model,
            },
          })
          .addMethodResponse({
            statusCode: "200",
          });
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
}

export default Application;
