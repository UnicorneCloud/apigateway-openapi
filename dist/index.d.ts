import { Construct } from "constructs";
import { SchemaParams } from "./utils/open-api";
import { IRestApi } from "aws-cdk-lib/aws-apigateway";
export interface ApigatewayOpenapiConstructProps {
    api: IRestApi;
    schemas: SchemaParams;
}
export declare class ApigatewayOpenapiConstruct extends Construct {
    constructor(scope: Construct, id: string, props: ApigatewayOpenapiConstructProps);
}
