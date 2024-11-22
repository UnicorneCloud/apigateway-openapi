import { IRestApi } from "aws-cdk-lib/aws-apigateway";
import type { SchemaObject } from "openapi3-ts/dist/model/openapi30";
import { Node } from "constructs";
export type SchemaParams = Record<string, SchemaObject>;
export interface SchemaProps {
    responseSchema?: string;
    responseTypeIsArray?: boolean;
    queryStringSchema?: string;
    requestBodySchema?: string;
}
export declare const addMetadatas: (node: Node, schemaProps?: SchemaProps) => void;
/**
 * Generate OpenAPI file
 * Pass the API Gateway RestAPI and the schemas to generate the OpenAPI file
 * @param api - API Gateway RestAPI
 * @param schemas - Schemas to be used in the OpenAPI file, usually the same as the ones used in the API ... this should be the same contract as the OpenAPI-ts SchemaObject
 * @returns void
 */
export declare function generateOpenApiFile(api: IRestApi, schemas: Record<string, SchemaObject>): void;
