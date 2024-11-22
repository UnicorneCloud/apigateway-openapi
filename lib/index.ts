// import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ApigatewayOpenapiConstructProps {
  // Define construct properties here
}

export class ApigatewayOpenapiConstruct extends Construct {

  constructor(scope: Construct, id: string, props: ApigatewayOpenapiConstructProps = {}) {
    super(scope, id);

    // Define construct contents here

    // example resource
    // const queue = new sqs.Queue(this, 'ApigatewayOpenapiConstructQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
