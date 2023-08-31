import { HttpIntegration } from "aws-cdk-lib/aws-apigateway";

export const Http = (url: string) => {
  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const params = originalMethod.apply(this, args);

      return new HttpIntegration(url, params);
    };

    return descriptor;
  };
};
