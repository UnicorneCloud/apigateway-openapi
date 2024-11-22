import { IRestApi } from "aws-cdk-lib/aws-apigateway";
import { HttpMethods } from "aws-cdk-lib/aws-s3";
import * as fs from "fs";
import * as path from "path";
import type { SchemaObject } from "openapi3-ts/dist/model/openapi30";
import { Node } from "constructs";

type Path = {
  method: HttpMethods;
  path: string;
  schemaProps: SchemaProps;
};

export type SchemaParams = Record<string, SchemaObject>;

export interface SchemaProps {
  responseSchema?: string;
  responseTypeIsArray?: boolean;
  queryStringSchema?: string;
  requestBodySchema?: string;
}

function extractPathParameters(url: string): string[] {
  // Regular expression to match {something}
  const regex = /\{[^}]+\}/g;

  // Find all matches
  const matches = url.match(regex);

  // If no matches are found, return an empty array
  if (!matches) {
    return [];
  }

  // Remove the curly braces from each match
  const parameters = matches.map((match) => match.slice(1, -1));

  return parameters;
}

export const addMetadatas = (node: Node, schemaProps?: SchemaProps) => {
  node.addMetadata("requestBodySchema", schemaProps?.requestBodySchema);
  node.addMetadata("responseSchema", schemaProps?.responseSchema);
  node.addMetadata("queryStringSchema", schemaProps?.queryStringSchema);
  node.addMetadata("responseTypeIsArray", schemaProps?.responseTypeIsArray);
};

const generateOpenApiSpec = (
  url: string,
  method: string,
  schemaProps: SchemaProps
) => {
  let requestBodySchema: any = schemaProps.requestBodySchema;

  const pathParametersSchema = extractPathParameters(url).map((param) => ({
    name: param,
    in: "path",
    description: `URL param for ${param}`,
    required: true,
    schema: {
      type: "string",
    },
  }));

  let responseSchemaRef: any = schemaProps.responseSchema;

  let responseSchema: any;

  if (!responseSchemaRef) {
    responseSchema = {
      type: "object",
      properties: {},
    };
  } else {
    if (schemaProps.responseTypeIsArray) {
      responseSchema = {
        type: "array",
        items: {
          $ref: `#/components/schemas/${responseSchemaRef}`,
        },
      };
    } else {
      responseSchema = {
        $ref: `#/components/schemas/${responseSchemaRef}`,
      };
    }
  }

  const openApiSpec = {
    [url]: {
      [method.toLowerCase()]: {
        ...(requestBodySchema &&
          method.toLowerCase() != "get" && {
            requestBody: {
              content: {
                "application/json": {
                  schema: { $ref: `#/components/schemas/${requestBodySchema}` },
                },
              },
            },
          }),
        ...(pathParametersSchema && {
          parameters: pathParametersSchema,
        }),
        // ...(queryStringParametersSchema && {
        //   parameters: [
        //     {
        //       in: "query",
        //       schema: {
        //         $ref: `#/components/schemas/${queryStringParametersSchema}`,
        //       },
        //     },
        //   ],
        // }),
        ...(responseSchema && {
          responses: {
            200: {
              description: "Successful response",
              content: {
                "application/json": {
                  schema: responseSchema,
                },
              },
            },
          },
        }),
      },
    },
  };

  return openApiSpec;
};

/**
 * Generate OpenAPI file
 * Pass the API Gateway RestAPI and the schemas to generate the OpenAPI file
 * @param api - API Gateway RestAPI
 * @param schemas - Schemas to be used in the OpenAPI file, usually the same as the ones used in the API ... this should be the same contract as the OpenAPI-ts SchemaObject
 * @returns void
 */
export function generateOpenApiFile(
  api: IRestApi,
  schemas: Record<string, SchemaObject>
) {
  // @ts-ignore
  const apiPaths: Path[] = api.methods.reduce((acc: Path[], method) => {
    if (method.httpMethod === "OPTIONS") {
      return acc;
    }

    const normalizedPath = method.node.scope.path.replace("/api", "");

    const requestBodySchema = method.node.metadata.find(
      (metadata: any) => metadata.type === "requestBodySchema"
    );

    const responseSchema = method.node.metadata.find(
      (metadata: any) => metadata.type === "responseSchema"
    );

    const queryStringSchema = method.node.metadata.find(
      (metadata: any) => metadata.type === "queryStringSchema"
    );

    const responseTypeIsArray = method.node.metadata.find(
      (metadata: any) => metadata.type === "responseTypeIsArray"
    );

    acc.push({
      path: normalizedPath,
      method: method.httpMethod,
      schemaProps: {
        requestBodySchema: requestBodySchema?.data,
        responseSchema: responseSchema?.data,
        queryStringSchema: queryStringSchema?.data,
        responseTypeIsArray: responseTypeIsArray?.data,
      },
    });
    return acc;
  }, [] as Path[]);

  const paths = [];
  for (const element of apiPaths) {
    const apiPath = element;
    const path = generateOpenApiSpec(
      apiPath.path,
      apiPath.method,
      apiPath.schemaProps
    );
    paths.push(path);
  }

  const openApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "API",
      version: "1.0.0",
    },
    paths: mergeObjects(...paths),
    components: {
      schemas,
    },
  };

  fs.writeFileSync(
    path.resolve(process.cwd(), "./openapi.json"),
    JSON.stringify(openApiSpec, null, 2)
  );
}

const isObject = (obj: any) => obj && typeof obj === "object";

const mergeObjects = (
  ...objects: Record<string, any>[]
): Record<string, any> => {
  return objects.reduce((acc, obj) => {
    Object.keys(obj).forEach((key) => {
      const accValue = acc[key];
      const objValue = obj[key];

      if (Array.isArray(accValue) && Array.isArray(objValue)) {
        acc[key] = accValue.concat(...objValue);
      } else if (isObject(accValue) && isObject(objValue)) {
        acc[key] = mergeObjects(accValue, objValue);
      } else {
        acc[key] = objValue;
      }
    });

    return acc;
  }, {});
};
