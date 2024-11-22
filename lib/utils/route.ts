import {
  aws_apigateway as apigateway,
  aws_s3 as s3,
  aws_lambda_nodejs as lambdaNodeJs,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import { addMetadatas, SchemaProps } from "./open-api";

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

export function generateRoute({
  scope,
  root,
  lambdaProps,
  url,
  method,
  authorizer,
  apiKeyRequired,
  schemaProps,
}: RouteProps) {
  const currentRoute = getResourceByUrl(root, url);

  const lambda = new lambdaNodeJs.NodejsFunction(scope, `${method}${url}`, {
    ...lambdaProps,
  });

  const lambdaIntegration = new apigateway.LambdaIntegration(lambda);
  let methodsParams: apigateway.MethodOptions = {
    requestModels: {},
  };

  if (authorizer && !apiKeyRequired) {
    methodsParams = {
      authorizer,
    };
  } else if (apiKeyRequired) {
    methodsParams = {
      apiKeyRequired: true,
    };
  }

  const methodResource = currentRoute.addMethod(
    method,
    lambdaIntegration,
    methodsParams
  );
  addMetadatas(methodResource.node, schemaProps);

  // Generate OpenAPI spec
  return lambda;
}

type Node = {
  children: { [key: string]: Node };
  resource: apigateway.IResource;
};
const resourceTree: Node = {
  children: {},
  resource: {} as apigateway.IResource,
};

export const getResourceByUrl = (
  rootResource: apigateway.IResource,
  url: string
): apigateway.IResource => {
  resourceTree.resource = rootResource;

  const segments = url.split("/");
  let currentNode = resourceTree;

  for (const segment of segments) {
    if (segment === "") {
      continue;
    }

    if (segment in currentNode.children) {
      currentNode = currentNode.children[segment];
    } else {
      const newResource = currentNode.resource.addResource(segment);
      const newNode = { children: {}, resource: newResource };
      currentNode.children[segment] = newNode;
      currentNode = newNode;
    }
  }

  return currentNode.resource;
};
