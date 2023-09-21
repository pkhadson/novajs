import {
  MockIntegration as AwsMock,
  LambdaIntegration,
  PassthroughBehavior,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

export const Lambda = () => {
  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const params = originalMethod.apply(this, args) as NodejsFunctionProps & {
        policies?: PolicyStatement[];
      };

      const api: RestApi = Reflect.get(globalThis, "api");
      const name = `${target.constructor.name}_${ctx.name || ctx}`;

      const policies = params["policies"] || [];
      delete params.policies;

      require("fs").writeFileSync("/tmp/a.log", name + " - const\n", {
        flag: "a+",
      });

      const functionFn = new NodejsFunction(api, name, params);

      for (let i = 0; i < policies.length; i++) {
        const policy = policies[i];
        functionFn.addToRolePolicy(policy);
      }

      return new LambdaIntegration(functionFn);
    };

    return descriptor;
  };
};
