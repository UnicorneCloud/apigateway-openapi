"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenApiFile = exports.addMetadatas = void 0;
const fs = require("fs");
const path = require("path");
function extractPathParameters(url) {
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
const addMetadatas = (node, schemaProps) => {
    node.addMetadata("requestBodySchema", schemaProps?.requestBodySchema);
    node.addMetadata("responseSchema", schemaProps?.responseSchema);
    node.addMetadata("queryStringSchema", schemaProps?.queryStringSchema);
    node.addMetadata("responseTypeIsArray", schemaProps?.responseTypeIsArray);
};
exports.addMetadatas = addMetadatas;
const generateOpenApiSpec = (url, method, schemaProps) => {
    let requestBodySchema = schemaProps.requestBodySchema;
    const pathParametersSchema = extractPathParameters(url).map((param) => ({
        name: param,
        in: "path",
        description: `URL param for ${param}`,
        required: true,
        schema: {
            type: "string",
        },
    }));
    let responseSchemaRef = schemaProps.responseSchema;
    let responseSchema;
    if (!responseSchemaRef) {
        responseSchema = {
            type: "object",
            properties: {},
        };
    }
    else {
        if (schemaProps.responseTypeIsArray) {
            responseSchema = {
                type: "array",
                items: {
                    $ref: `#/components/schemas/${responseSchemaRef}`,
                },
            };
        }
        else {
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
function generateOpenApiFile(api, schemas) {
    // @ts-ignore
    const apiPaths = api.methods.reduce((acc, method) => {
        if (method.httpMethod === "OPTIONS") {
            return acc;
        }
        const normalizedPath = method.node.scope.path.replace("/api", "");
        const requestBodySchema = method.node.metadata.find((metadata) => metadata.type === "requestBodySchema");
        const responseSchema = method.node.metadata.find((metadata) => metadata.type === "responseSchema");
        const queryStringSchema = method.node.metadata.find((metadata) => metadata.type === "queryStringSchema");
        const responseTypeIsArray = method.node.metadata.find((metadata) => metadata.type === "responseTypeIsArray");
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
    }, []);
    const paths = [];
    for (const element of apiPaths) {
        const apiPath = element;
        const path = generateOpenApiSpec(apiPath.path, apiPath.method, apiPath.schemaProps);
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
    fs.writeFileSync(path.resolve(process.cwd(), "./openapi.json"), JSON.stringify(openApiSpec, null, 2));
}
exports.generateOpenApiFile = generateOpenApiFile;
const isObject = (obj) => obj && typeof obj === "object";
const mergeObjects = (...objects) => {
    return objects.reduce((acc, obj) => {
        Object.keys(obj).forEach((key) => {
            const accValue = acc[key];
            const objValue = obj[key];
            if (Array.isArray(accValue) && Array.isArray(objValue)) {
                acc[key] = accValue.concat(...objValue);
            }
            else if (isObject(accValue) && isObject(objValue)) {
                acc[key] = mergeObjects(accValue, objValue);
            }
            else {
                acc[key] = objValue;
            }
        });
        return acc;
    }, {});
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3Blbi1hcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvb3Blbi1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQW1CN0IsU0FBUyxxQkFBcUIsQ0FBQyxHQUFXO0lBQ3hDLDBDQUEwQztJQUMxQyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7SUFFM0IsbUJBQW1CO0lBQ25CLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakMsaURBQWlEO0lBQ2pELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELDBDQUEwQztJQUMxQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVNLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBVSxFQUFFLFdBQXlCLEVBQUUsRUFBRTtJQUNwRSxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3RFLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2hFLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDdEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUM7QUFMVyxRQUFBLFlBQVksZ0JBS3ZCO0FBRUYsTUFBTSxtQkFBbUIsR0FBRyxDQUMxQixH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T0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0JBQ3ZELEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUM7WUFDMUMsQ0FBQztpQkFBTSxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQztnQkFDcEQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFlBQVksQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDOUMsQ0FBQztpQkFBTSxDQUFDO2dCQUNOLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxRQUFRLENBQUM7WUFDdEIsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxHQUFHLENBQUM7SUFDYixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDVCxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJUmVzdEFwaSB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheVwiO1xuaW1wb3J0IHsgSHR0cE1ldGhvZHMgfSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLXMzXCI7XG5pbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB0eXBlIHsgU2NoZW1hT2JqZWN0IH0gZnJvbSBcIm9wZW5hcGkzLXRzL2Rpc3QvbW9kZWwvb3BlbmFwaTMwXCI7XG5pbXBvcnQgeyBOb2RlIH0gZnJvbSBcImNvbnN0cnVjdHNcIjtcblxudHlwZSBQYXRoID0ge1xuICBtZXRob2Q6IEh0dHBNZXRob2RzO1xuICBwYXRoOiBzdHJpbmc7XG4gIHNjaGVtYVByb3BzOiBTY2hlbWFQcm9wcztcbn07XG5cbmV4cG9ydCB0eXBlIFNjaGVtYVBhcmFtcyA9IFJlY29yZDxzdHJpbmcsIFNjaGVtYU9iamVjdD47XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2NoZW1hUHJvcHMge1xuICByZXNwb25zZVNjaGVtYT86IHN0cmluZztcbiAgcmVzcG9uc2VUeXBlSXNBcnJheT86IGJvb2xlYW47XG4gIHF1ZXJ5U3RyaW5nU2NoZW1hPzogc3RyaW5nO1xuICByZXF1ZXN0Qm9keVNjaGVtYT86IHN0cmluZztcbn1cblxuZnVuY3Rpb24gZXh0cmFjdFBhdGhQYXJhbWV0ZXJzKHVybDogc3RyaW5nKTogc3RyaW5nW10ge1xuICAvLyBSZWd1bGFyIGV4cHJlc3Npb24gdG8gbWF0Y2gge3NvbWV0aGluZ31cbiAgY29uc3QgcmVnZXggPSAvXFx7W159XStcXH0vZztcblxuICAvLyBGaW5kIGFsbCBtYXRjaGVzXG4gIGNvbnN0IG1hdGNoZXMgPSB1cmwubWF0Y2gocmVnZXgpO1xuXG4gIC8vIElmIG5vIG1hdGNoZXMgYXJlIGZvdW5kLCByZXR1cm4gYW4gZW1wdHkgYXJyYXlcbiAgaWYgKCFtYXRjaGVzKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgLy8gUmVtb3ZlIHRoZSBjdXJseSBicmFjZXMgZnJvbSBlYWNoIG1hdGNoXG4gIGNvbnN0IHBhcmFtZXRlcnMgPSBtYXRjaGVzLm1hcCgobWF0Y2gpID0+IG1hdGNoLnNsaWNlKDEsIC0xKSk7XG5cbiAgcmV0dXJuIHBhcmFtZXRlcnM7XG59XG5cbmV4cG9ydCBjb25zdCBhZGRNZXRhZGF0YXMgPSAobm9kZTogTm9kZSwgc2NoZW1hUHJvcHM/OiBTY2hlbWFQcm9wcykgPT4ge1xuICBub2RlLmFkZE1ldGFkYXRhKFwicmVxdWVzdEJvZHlTY2hlbWFcIiwgc2NoZW1hUHJvcHM/LnJlcXVlc3RCb2R5U2NoZW1hKTtcbiAgbm9kZS5hZGRNZXRhZGF0YShcInJlc3BvbnNlU2NoZW1hXCIsIHNjaGVtYVByb3BzPy5yZXNwb25zZVNjaGVtYSk7XG4gIG5vZGUuYWRkTWV0YWRhdGEoXCJxdWVyeVN0cmluZ1NjaGVtYVwiLCBzY2hlbWFQcm9wcz8ucXVlcnlTdHJpbmdTY2hlbWEpO1xuICBub2RlLmFkZE1ldGFkYXRhKFwicmVzcG9uc2VUeXBlSXNBcnJheVwiLCBzY2hlbWFQcm9wcz8ucmVzcG9uc2VUeXBlSXNBcnJheSk7XG59O1xuXG5jb25zdCBnZW5lcmF0ZU9wZW5BcGlTcGVjID0gKFxuICB1cmw6IHN0cmluZyxcbiAgbWV0aG9kOiBzdHJpbmcsXG4gIHNjaGVtYVByb3BzOiBTY2hlbWFQcm9wc1xuKSA9PiB7XG4gIGxldCByZXF1ZXN0Qm9keVNjaGVtYTogYW55ID0gc2NoZW1hUHJvcHMucmVxdWVzdEJvZHlTY2hlbWE7XG5cbiAgY29uc3QgcGF0aFBhcmFtZXRlcnNTY2hlbWEgPSBleHRyYWN0UGF0aFBhcmFtZXRlcnModXJsKS5tYXAoKHBhcmFtKSA9PiAoe1xuICAgIG5hbWU6IHBhcmFtLFxuICAgIGluOiBcInBhdGhcIixcbiAgICBkZXNjcmlwdGlvbjogYFVSTCBwYXJhbSBmb3IgJHtwYXJhbX1gLFxuICAgIHJlcXVpcmVkOiB0cnVlLFxuICAgIHNjaGVtYToge1xuICAgICAgdHlwZTogXCJzdHJpbmdcIixcbiAgICB9LFxuICB9KSk7XG5cbiAgbGV0IHJlc3BvbnNlU2NoZW1hUmVmOiBhbnkgPSBzY2hlbWFQcm9wcy5yZXNwb25zZVNjaGVtYTtcblxuICBsZXQgcmVzcG9uc2VTY2hlbWE6IGFueTtcblxuICBpZiAoIXJlc3BvbnNlU2NoZW1hUmVmKSB7XG4gICAgcmVzcG9uc2VTY2hlbWEgPSB7XG4gICAgICB0eXBlOiBcIm9iamVjdFwiLFxuICAgICAgcHJvcGVydGllczoge30sXG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoc2NoZW1hUHJvcHMucmVzcG9uc2VUeXBlSXNBcnJheSkge1xuICAgICAgcmVzcG9uc2VTY2hlbWEgPSB7XG4gICAgICAgIHR5cGU6IFwiYXJyYXlcIixcbiAgICAgICAgaXRlbXM6IHtcbiAgICAgICAgICAkcmVmOiBgIy9jb21wb25lbnRzL3NjaGVtYXMvJHtyZXNwb25zZVNjaGVtYVJlZn1gLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVzcG9uc2VTY2hlbWEgPSB7XG4gICAgICAgICRyZWY6IGAjL2NvbXBvbmVudHMvc2NoZW1hcy8ke3Jlc3BvbnNlU2NoZW1hUmVmfWAsXG4gICAgICB9O1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IG9wZW5BcGlTcGVjID0ge1xuICAgIFt1cmxdOiB7XG4gICAgICBbbWV0aG9kLnRvTG93ZXJDYXNlKCldOiB7XG4gICAgICAgIC4uLihyZXF1ZXN0Qm9keVNjaGVtYSAmJlxuICAgICAgICAgIG1ldGhvZC50b0xvd2VyQ2FzZSgpICE9IFwiZ2V0XCIgJiYge1xuICAgICAgICAgICAgcmVxdWVzdEJvZHk6IHtcbiAgICAgICAgICAgICAgY29udGVudDoge1xuICAgICAgICAgICAgICAgIFwiYXBwbGljYXRpb24vanNvblwiOiB7XG4gICAgICAgICAgICAgICAgICBzY2hlbWE6IHsgJHJlZjogYCMvY29tcG9uZW50cy9zY2hlbWFzLyR7cmVxdWVzdEJvZHlTY2hlbWF9YCB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0pLFxuICAgICAgICAuLi4ocGF0aFBhcmFtZXRlcnNTY2hlbWEgJiYge1xuICAgICAgICAgIHBhcmFtZXRlcnM6IHBhdGhQYXJhbWV0ZXJzU2NoZW1hLFxuICAgICAgICB9KSxcbiAgICAgICAgLy8gLi4uKHF1ZXJ5U3RyaW5nUGFyYW1ldGVyc1NjaGVtYSAmJiB7XG4gICAgICAgIC8vICAgcGFyYW1ldGVyczogW1xuICAgICAgICAvLyAgICAge1xuICAgICAgICAvLyAgICAgICBpbjogXCJxdWVyeVwiLFxuICAgICAgICAvLyAgICAgICBzY2hlbWE6IHtcbiAgICAgICAgLy8gICAgICAgICAkcmVmOiBgIy9jb21wb25lbnRzL3NjaGVtYXMvJHtxdWVyeVN0cmluZ1BhcmFtZXRlcnNTY2hlbWF9YCxcbiAgICAgICAgLy8gICAgICAgfSxcbiAgICAgICAgLy8gICAgIH0sXG4gICAgICAgIC8vICAgXSxcbiAgICAgICAgLy8gfSksXG4gICAgICAgIC4uLihyZXNwb25zZVNjaGVtYSAmJiB7XG4gICAgICAgICAgcmVzcG9uc2VzOiB7XG4gICAgICAgICAgICAyMDA6IHtcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IFwiU3VjY2Vzc2Z1bCByZXNwb25zZVwiLFxuICAgICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcbiAgICAgICAgICAgICAgICAgIHNjaGVtYTogcmVzcG9uc2VTY2hlbWEsXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgfSksXG4gICAgICB9LFxuICAgIH0sXG4gIH07XG5cbiAgcmV0dXJuIG9wZW5BcGlTcGVjO1xufTtcblxuLyoqXG4gKiBHZW5lcmF0ZSBPcGVuQVBJIGZpbGVcbiAqIFBhc3MgdGhlIEFQSSBHYXRld2F5IFJlc3RBUEkgYW5kIHRoZSBzY2hlbWFzIHRvIGdlbmVyYXRlIHRoZSBPcGVuQVBJIGZpbGVcbiAqIEBwYXJhbSBhcGkgLSBBUEkgR2F0ZXdheSBSZXN0QVBJXG4gKiBAcGFyYW0gc2NoZW1hcyAtIFNjaGVtYXMgdG8gYmUgdXNlZCBpbiB0aGUgT3BlbkFQSSBmaWxlLCB1c3VhbGx5IHRoZSBzYW1lIGFzIHRoZSBvbmVzIHVzZWQgaW4gdGhlIEFQSSAuLi4gdGhpcyBzaG91bGQgYmUgdGhlIHNhbWUgY29udHJhY3QgYXMgdGhlIE9wZW5BUEktdHMgU2NoZW1hT2JqZWN0XG4gKiBAcmV0dXJucyB2b2lkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZU9wZW5BcGlGaWxlKFxuICBhcGk6IElSZXN0QXBpLFxuICBzY2hlbWFzOiBSZWNvcmQ8c3RyaW5nLCBTY2hlbWFPYmplY3Q+XG4pIHtcbiAgLy8gQHRzLWlnbm9yZVxuICBjb25zdCBhcGlQYXRoczogUGF0aFtdID0gYXBpLm1ldGhvZHMucmVkdWNlKChhY2M6IFBhdGhbXSwgbWV0aG9kKSA9PiB7XG4gICAgaWYgKG1ldGhvZC5odHRwTWV0aG9kID09PSBcIk9QVElPTlNcIikge1xuICAgICAgcmV0dXJuIGFjYztcbiAgICB9XG5cbiAgICBjb25zdCBub3JtYWxpemVkUGF0aCA9IG1ldGhvZC5ub2RlLnNjb3BlLnBhdGgucmVwbGFjZShcIi9hcGlcIiwgXCJcIik7XG5cbiAgICBjb25zdCByZXF1ZXN0Qm9keVNjaGVtYSA9IG1ldGhvZC5ub2RlLm1ldGFkYXRhLmZpbmQoXG4gICAgICAobWV0YWRhdGE6IGFueSkgPT4gbWV0YWRhdGEudHlwZSA9PT0gXCJyZXF1ZXN0Qm9keVNjaGVtYVwiXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlU2NoZW1hID0gbWV0aG9kLm5vZGUubWV0YWRhdGEuZmluZChcbiAgICAgIChtZXRhZGF0YTogYW55KSA9PiBtZXRhZGF0YS50eXBlID09PSBcInJlc3BvbnNlU2NoZW1hXCJcbiAgICApO1xuXG4gICAgY29uc3QgcXVlcnlTdHJpbmdTY2hlbWEgPSBtZXRob2Qubm9kZS5tZXRhZGF0YS5maW5kKFxuICAgICAgKG1ldGFkYXRhOiBhbnkpID0+IG1ldGFkYXRhLnR5cGUgPT09IFwicXVlcnlTdHJpbmdTY2hlbWFcIlxuICAgICk7XG5cbiAgICBjb25zdCByZXNwb25zZVR5cGVJc0FycmF5ID0gbWV0aG9kLm5vZGUubWV0YWRhdGEuZmluZChcbiAgICAgIChtZXRhZGF0YTogYW55KSA9PiBtZXRhZGF0YS50eXBlID09PSBcInJlc3BvbnNlVHlwZUlzQXJyYXlcIlxuICAgICk7XG5cbiAgICBhY2MucHVzaCh7XG4gICAgICBwYXRoOiBub3JtYWxpemVkUGF0aCxcbiAgICAgIG1ldGhvZDogbWV0aG9kLmh0dHBNZXRob2QsXG4gICAgICBzY2hlbWFQcm9wczoge1xuICAgICAgICByZXF1ZXN0Qm9keVNjaGVtYTogcmVxdWVzdEJvZHlTY2hlbWE/LmRhdGEsXG4gICAgICAgIHJlc3BvbnNlU2NoZW1hOiByZXNwb25zZVNjaGVtYT8uZGF0YSxcbiAgICAgICAgcXVlcnlTdHJpbmdTY2hlbWE6IHF1ZXJ5U3RyaW5nU2NoZW1hPy5kYXRhLFxuICAgICAgICByZXNwb25zZVR5cGVJc0FycmF5OiByZXNwb25zZVR5cGVJc0FycmF5Py5kYXRhLFxuICAgICAgfSxcbiAgICB9KTtcbiAgICByZXR1cm4gYWNjO1xuICB9LCBbXSBhcyBQYXRoW10pO1xuXG4gIGNvbnN0IHBhdGhzID0gW107XG4gIGZvciAoY29uc3QgZWxlbWVudCBvZiBhcGlQYXRocykge1xuICAgIGNvbnN0IGFwaVBhdGggPSBlbGVtZW50O1xuICAgIGNvbnN0IHBhdGggPSBnZW5lcmF0ZU9wZW5BcGlTcGVjKFxuICAgICAgYXBpUGF0aC5wYXRoLFxuICAgICAgYXBpUGF0aC5tZXRob2QsXG4gICAgICBhcGlQYXRoLnNjaGVtYVByb3BzXG4gICAgKTtcbiAgICBwYXRocy5wdXNoKHBhdGgpO1xuICB9XG5cbiAgY29uc3Qgb3BlbkFwaVNwZWMgPSB7XG4gICAgb3BlbmFwaTogXCIzLjAuMFwiLFxuICAgIGluZm86IHtcbiAgICAgIHRpdGxlOiBcIkFQSVwiLFxuICAgICAgdmVyc2lvbjogXCIxLjAuMFwiLFxuICAgIH0sXG4gICAgcGF0aHM6IG1lcmdlT2JqZWN0cyguLi5wYXRocyksXG4gICAgY29tcG9uZW50czoge1xuICAgICAgc2NoZW1hcyxcbiAgICB9LFxuICB9O1xuXG4gIGZzLndyaXRlRmlsZVN5bmMoXG4gICAgcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIFwiLi9vcGVuYXBpLmpzb25cIiksXG4gICAgSlNPTi5zdHJpbmdpZnkob3BlbkFwaVNwZWMsIG51bGwsIDIpXG4gICk7XG59XG5cbmNvbnN0IGlzT2JqZWN0ID0gKG9iajogYW55KSA9PiBvYmogJiYgdHlwZW9mIG9iaiA9PT0gXCJvYmplY3RcIjtcblxuY29uc3QgbWVyZ2VPYmplY3RzID0gKFxuICAuLi5vYmplY3RzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+W11cbik6IFJlY29yZDxzdHJpbmcsIGFueT4gPT4ge1xuICByZXR1cm4gb2JqZWN0cy5yZWR1Y2UoKGFjYywgb2JqKSA9PiB7XG4gICAgT2JqZWN0LmtleXMob2JqKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgIGNvbnN0IGFjY1ZhbHVlID0gYWNjW2tleV07XG4gICAgICBjb25zdCBvYmpWYWx1ZSA9IG9ialtrZXldO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhY2NWYWx1ZSkgJiYgQXJyYXkuaXNBcnJheShvYmpWYWx1ZSkpIHtcbiAgICAgICAgYWNjW2tleV0gPSBhY2NWYWx1ZS5jb25jYXQoLi4ub2JqVmFsdWUpO1xuICAgICAgfSBlbHNlIGlmIChpc09iamVjdChhY2NWYWx1ZSkgJiYgaXNPYmplY3Qob2JqVmFsdWUpKSB7XG4gICAgICAgIGFjY1trZXldID0gbWVyZ2VPYmplY3RzKGFjY1ZhbHVlLCBvYmpWYWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhY2Nba2V5XSA9IG9ialZhbHVlO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFjYztcbiAgfSwge30pO1xufTtcbiJdfQ==