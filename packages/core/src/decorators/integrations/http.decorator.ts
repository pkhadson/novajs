import { HttpIntegration as awsHttp } from "aws-cdk-lib/aws-apigateway";

export const HttpIntegration = (url: string) => {
  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const params = originalMethod.apply(this, args);

      return new awsHttp(url, params);
    };

    return descriptor;
  };
};

class Teste {
  @HttpIntegration("https://google.com")
  aa() {
    return {
      proxy: false,
    };
  }
}

const a = new Teste();
