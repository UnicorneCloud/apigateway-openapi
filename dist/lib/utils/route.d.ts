import { aws_apigateway as apigateway, aws_s3 as s3, aws_lambda_nodejs as lambdaNodeJs } from "aws-cdk-lib";
import { Construct } from "constructs";
import { SchemaProps } from "./open-api";
export interface RouteProps {
    scope: Construct;
    root: apigateway.IResource;
    url: string;
    lambdaProps: lambdaNodeJs.NodejsFunctionProps;
    method: s3.HttpMethods;
    authorizer?: apigateway.IAuthorizer;
    apiKeyRequired?: boolean;
    schemaProps?: SchemaProps;
}
export declare function generateRoute({ scope, root, lambdaProps, url, method, authorizer, apiKeyRequired, schemaProps, }: RouteProps): {
    lambda: lambdaNodeJs.NodejsFunction;
    path: Record<string, Record<string, Record<string, any>>> | undefined;
};
export declare const getResourceByUrl: (rootResource: apigateway.IResource, url: string) => apigateway.IResource;
