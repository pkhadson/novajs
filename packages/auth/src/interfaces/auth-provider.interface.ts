import { FunctionProps } from "aws-cdk-lib/aws-lambda";

interface IAuthProviderCognito {
  type: "cognito";
  arn: string | string[];
}

interface IAuthProviderLambda {
  type: "lambda";
  function: FunctionProps;
}

interface IAuthProviderBase {}

export type IAuthProvider = IAuthProviderBase &
  (IAuthProviderCognito | IAuthProviderLambda);
