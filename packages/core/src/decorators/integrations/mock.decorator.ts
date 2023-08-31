import {
  MockIntegration as AwsMock,
  PassthroughBehavior,
} from "aws-cdk-lib/aws-apigateway";

export const Mock = (statusCode: number = 200) => {
  return function (target: any, ctx: any, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = function (...args: any[]) {
      const params = originalMethod.apply(this, args);

      return new AwsMock({
        passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
        requestTemplates: {
          "application/json": JSON.stringify({ statusCode }),
        },
        integrationResponses: [
          {
            statusCode: `${statusCode}`,
            responseTemplates: {
              "application/json": JSON.stringify(params.body),
            },
          },
        ],
      });
    };

    return descriptor;
  };
};
