// import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { generateOpenApiFile, SchemaParams } from "./utils/open-api";
import { IRestApi } from "aws-cdk-lib/aws-apigateway";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface ApigatewayOpenapiConstructProps {
  // Define construct properties here
  api: IRestApi;
  schemas: SchemaParams;
}

export class ApigatewayOpenapiConstruct extends Construct {
  constructor(
    scope: Construct,
    id: string,
    props: ApigatewayOpenapiConstructProps
  ) {
    super(scope, id);

    generateOpenApiFile(props.api, props.schemas);
  }
}
