import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as cdk from "aws-cdk-lib";

export class CdkStarterStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 👇 create queue
    const queue = new sqs.Queue(this, "sqs-queue");

    // 👇 create sns topicz
    const topic = new sns.Topic(this, "sns-topic");

    // 👇 subscribe queue to topic
    topic.addSubscription(new subs.SqsSubscription(queue, {}));

    new cdk.CfnOutput(this, "snsTopicArn", {
      value: topic.topicArn,
      description: "The arn of the SNS topic",
    });
  }
}
