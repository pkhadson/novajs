import { CfnAuthorizer, CfnAuthorizerProps } from "aws-cdk-lib/aws-apigateway";
import { IAuthProvider } from "./interfaces/auth-provider.interface";
import { AuthStorage } from "./storages/auth.storage";
import { Mutable } from "@jsnova/utils";
import { COGNITO_REGEX } from "./constants/cognito-regex.constant";

export class AuthProvider {
  authorizer: CfnAuthorizer;
  constructor(public name: string, params: IAuthProvider) {
    if (!name) throw new Error("AuthProvider name is required");
    if (!params) throw new Error("AuthProvider params are required");

    const apiStack = Reflect.get(globalThis, "api");

    const opts: Mutable<CfnAuthorizerProps> = {
      restApiId: apiStack.restApiId,
      name,
      type: "TOKEN",
    };

    if (params.type === "cognito") {
      opts.type = "COGNITO_USER_POOLS";
      opts.providerArns =
        typeof params.arn === "string" ? [params.arn] : params.arn;
      opts.identitySource = "method.request.header.Authorization";

      if (opts.providerArns.find((a) => !COGNITO_REGEX.test(a)))
        throw new Error("Invalid Cognito ARN");

      // throw new Error("AuthProvider type 'cognito' is not implemented yet");
    } else {
      opts.type = "TOKEN";
      throw new Error("AuthProvider type 'lambda' is not implemented yet");
    }

    this.authorizer = new CfnAuthorizer(apiStack, name, opts);

    AuthStorage.set(this);
  }
}
