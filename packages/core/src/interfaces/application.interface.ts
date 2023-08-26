import { RestApiProps } from "aws-cdk-lib/aws-apigateway";

export interface IApplicationParams {
  name?: string;
  cors?: boolean | string | string[];
  port?: number;
  host?: string;
  controllers: any[];
  region: string;
  account?: string;
  apiOptions?: RestApiProps;
  use?: any[];
}
