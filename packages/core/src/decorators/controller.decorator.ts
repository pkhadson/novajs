import { RestApi } from "aws-cdk-lib/aws-apigateway";

export function Controller(controllerName: string) {
  return function bb(target: any) {
    const f: any = function aa(...args: any[]) {
      const api: RestApi = Reflect.get(globalThis, "api");
      const resource = api.root.addResource(controllerName);

      const newInstance = new target(...args);

      Reflect.set(newInstance, "controllerName", controllerName);
      Reflect.set(newInstance, "resource", resource);
      // Reflect.set(newInstance, "routes", [2]);

      return newInstance;
    };

    f.prototype = target.prototype;
    return f;
  };
}
