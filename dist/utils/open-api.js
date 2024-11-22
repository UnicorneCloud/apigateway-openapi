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
                    200: {
                        description: "Successful response",
                        content: {
                            "application/json": {
                                schema: responseSchema,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3Blbi1hcGkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdXRpbHMvb3Blbi1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBRUEseUJBQXlCO0FBQ3pCLDZCQUE2QjtBQW1CN0IsU0FBUyxxQkFBcUIsQ0FBQyxHQUFXO0lBQ3hDLDBDQUEwQztJQUMxQyxNQUFNLEtBQUssR0FBRyxZQUFZLENBQUM7SUFFM0IsbUJBQW1CO0lBQ25CLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFakMsaURBQWlEO0lBQ2pELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLE9BQU8sRUFBRSxDQUFDO0lBQ1osQ0FBQztJQUVELDBDQUEwQztJQUMxQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFFOUQsT0FBTyxVQUFVLENBQUM7QUFDcEIsQ0FBQztBQUVNLE1BQU0sWUFBWSxHQUFHLENBQUMsSUFBVSxFQUFFLFdBQXlCLEVBQUUsRUFBRTtJQUNwRSxJQUFJLENBQUMsV0FBVyxDQUFDLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0lBQ3RFLElBQUksQ0FBQyxXQUFXLENBQUMsZ0JBQWdCLEVBQUUsV0FBVyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0lBQ2hFLElBQUksQ0FBQyxXQUFXLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixDQUFDLENBQUM7SUFDdEUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUM7QUFMVyxRQUFBLFlBQVksZ0JBS3ZCO0FBRUYsTUFBTSxtQkFBbUIsR0FBRyxDQUMxQixH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QUUsQ0FBQztnQkFDdkQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsQ0FBQztZQUMxQyxDQUFDO2lCQUFNLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO2dCQUNwRCxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsWUFBWSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUM5QyxDQUFDO2lCQUFNLENBQUM7Z0JBQ04sR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLFFBQVEsQ0FBQztZQUN0QixDQUFDO1FBQ0gsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNULENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElSZXN0QXBpIH0gZnJvbSBcImF3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5XCI7XG5pbXBvcnQgeyBIdHRwTWV0aG9kcyB9IGZyb20gXCJhd3MtY2RrLWxpYi9hd3MtczNcIjtcbmltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0IHR5cGUgeyBTY2hlbWFPYmplY3QgfSBmcm9tIFwib3BlbmFwaTMtdHMvZGlzdC9tb2RlbC9vcGVuYXBpMzBcIjtcbmltcG9ydCB7IE5vZGUgfSBmcm9tIFwiY29uc3RydWN0c1wiO1xuXG50eXBlIFBhdGggPSB7XG4gIG1ldGhvZDogSHR0cE1ldGhvZHM7XG4gIHBhdGg6IHN0cmluZztcbiAgc2NoZW1hUHJvcHM6IFNjaGVtYVByb3BzO1xufTtcblxuZXhwb3J0IHR5cGUgU2NoZW1hUGFyYW1zID0gUmVjb3JkPHN0cmluZywgU2NoZW1hT2JqZWN0PjtcblxuZXhwb3J0IGludGVyZmFjZSBTY2hlbWFQcm9wcyB7XG4gIHJlc3BvbnNlU2NoZW1hPzogc3RyaW5nO1xuICByZXNwb25zZVR5cGVJc0FycmF5PzogYm9vbGVhbjtcbiAgcXVlcnlTdHJpbmdTY2hlbWE/OiBzdHJpbmc7XG4gIHJlcXVlc3RCb2R5U2NoZW1hPzogc3RyaW5nO1xufVxuXG5mdW5jdGlvbiBleHRyYWN0UGF0aFBhcmFtZXRlcnModXJsOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gIC8vIFJlZ3VsYXIgZXhwcmVzc2lvbiB0byBtYXRjaCB7c29tZXRoaW5nfVxuICBjb25zdCByZWdleCA9IC9cXHtbXn1dK1xcfS9nO1xuXG4gIC8vIEZpbmQgYWxsIG1hdGNoZXNcbiAgY29uc3QgbWF0Y2hlcyA9IHVybC5tYXRjaChyZWdleCk7XG5cbiAgLy8gSWYgbm8gbWF0Y2hlcyBhcmUgZm91bmQsIHJldHVybiBhbiBlbXB0eSBhcnJheVxuICBpZiAoIW1hdGNoZXMpIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICAvLyBSZW1vdmUgdGhlIGN1cmx5IGJyYWNlcyBmcm9tIGVhY2ggbWF0Y2hcbiAgY29uc3QgcGFyYW1ldGVycyA9IG1hdGNoZXMubWFwKChtYXRjaCkgPT4gbWF0Y2guc2xpY2UoMSwgLTEpKTtcblxuICByZXR1cm4gcGFyYW1ldGVycztcbn1cblxuZXhwb3J0IGNvbnN0IGFkZE1ldGFkYXRhcyA9IChub2RlOiBOb2RlLCBzY2hlbWFQcm9wcz86IFNjaGVtYVByb3BzKSA9PiB7XG4gIG5vZGUuYWRkTWV0YWRhdGEoXCJyZXF1ZXN0Qm9keVNjaGVtYVwiLCBzY2hlbWFQcm9wcz8ucmVxdWVzdEJvZHlTY2hlbWEpO1xuICBub2RlLmFkZE1ldGFkYXRhKFwicmVzcG9uc2VTY2hlbWFcIiwgc2NoZW1hUHJvcHM/LnJlc3BvbnNlU2NoZW1hKTtcbiAgbm9kZS5hZGRNZXRhZGF0YShcInF1ZXJ5U3RyaW5nU2NoZW1hXCIsIHNjaGVtYVByb3BzPy5xdWVyeVN0cmluZ1NjaGVtYSk7XG4gIG5vZGUuYWRkTWV0YWRhdGEoXCJyZXNwb25zZVR5cGVJc0FycmF5XCIsIHNjaGVtYVByb3BzPy5yZXNwb25zZVR5cGVJc0FycmF5KTtcbn07XG5cbmNvbnN0IGdlbmVyYXRlT3BlbkFwaVNwZWMgPSAoXG4gIHVybDogc3RyaW5nLFxuICBtZXRob2Q6IHN0cmluZyxcbiAgc2NoZW1hUHJvcHM6IFNjaGVtYVByb3BzXG4pID0+IHtcbiAgbGV0IHJlcXVlc3RCb2R5U2NoZW1hOiBhbnkgPSBzY2hlbWFQcm9wcy5yZXF1ZXN0Qm9keVNjaGVtYTtcblxuICBjb25zdCBwYXRoUGFyYW1ldGVyc1NjaGVtYSA9IGV4dHJhY3RQYXRoUGFyYW1ldGVycyh1cmwpLm1hcCgocGFyYW0pID0+ICh7XG4gICAgbmFtZTogcGFyYW0sXG4gICAgaW46IFwicGF0aFwiLFxuICAgIGRlc2NyaXB0aW9uOiBgVVJMIHBhcmFtIGZvciAke3BhcmFtfWAsXG4gICAgcmVxdWlyZWQ6IHRydWUsXG4gICAgc2NoZW1hOiB7XG4gICAgICB0eXBlOiBcInN0cmluZ1wiLFxuICAgIH0sXG4gIH0pKTtcblxuICBsZXQgcmVzcG9uc2VTY2hlbWFSZWY6IGFueSA9IHNjaGVtYVByb3BzLnJlc3BvbnNlU2NoZW1hO1xuXG4gIGxldCByZXNwb25zZVNjaGVtYTogYW55O1xuXG4gIGlmICghcmVzcG9uc2VTY2hlbWFSZWYpIHtcbiAgICByZXNwb25zZVNjaGVtYSA9IHtcbiAgICAgIHR5cGU6IFwib2JqZWN0XCIsXG4gICAgICBwcm9wZXJ0aWVzOiB7fSxcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIGlmIChzY2hlbWFQcm9wcy5yZXNwb25zZVR5cGVJc0FycmF5KSB7XG4gICAgICByZXNwb25zZVNjaGVtYSA9IHtcbiAgICAgICAgdHlwZTogXCJhcnJheVwiLFxuICAgICAgICBpdGVtczoge1xuICAgICAgICAgICRyZWY6IGAjL2NvbXBvbmVudHMvc2NoZW1hcy8ke3Jlc3BvbnNlU2NoZW1hUmVmfWAsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXNwb25zZVNjaGVtYSA9IHtcbiAgICAgICAgJHJlZjogYCMvY29tcG9uZW50cy9zY2hlbWFzLyR7cmVzcG9uc2VTY2hlbWFSZWZ9YCxcbiAgICAgIH07XG4gICAgfVxuICB9XG5cbiAgY29uc3Qgb3BlbkFwaVNwZWMgPSB7XG4gICAgW3VybF06IHtcbiAgICAgIFttZXRob2QudG9Mb3dlckNhc2UoKV06IHtcbiAgICAgICAgLi4uKHJlcXVlc3RCb2R5U2NoZW1hICYmXG4gICAgICAgICAgbWV0aG9kLnRvTG93ZXJDYXNlKCkgIT0gXCJnZXRcIiAmJiB7XG4gICAgICAgICAgICByZXF1ZXN0Qm9keToge1xuICAgICAgICAgICAgICBjb250ZW50OiB7XG4gICAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcbiAgICAgICAgICAgICAgICAgIHNjaGVtYTogeyAkcmVmOiBgIy9jb21wb25lbnRzL3NjaGVtYXMvJHtyZXF1ZXN0Qm9keVNjaGVtYX1gIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgfSksXG4gICAgICAgIC4uLihwYXRoUGFyYW1ldGVyc1NjaGVtYSAmJiB7XG4gICAgICAgICAgcGFyYW1ldGVyczogcGF0aFBhcmFtZXRlcnNTY2hlbWEsXG4gICAgICAgIH0pLFxuICAgICAgICAvLyAuLi4ocXVlcnlTdHJpbmdQYXJhbWV0ZXJzU2NoZW1hICYmIHtcbiAgICAgICAgLy8gICBwYXJhbWV0ZXJzOiBbXG4gICAgICAgIC8vICAgICB7XG4gICAgICAgIC8vICAgICAgIGluOiBcInF1ZXJ5XCIsXG4gICAgICAgIC8vICAgICAgIHNjaGVtYToge1xuICAgICAgICAvLyAgICAgICAgICRyZWY6IGAjL2NvbXBvbmVudHMvc2NoZW1hcy8ke3F1ZXJ5U3RyaW5nUGFyYW1ldGVyc1NjaGVtYX1gLFxuICAgICAgICAvLyAgICAgICB9LFxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gICBdLFxuICAgICAgICAvLyB9KSxcbiAgICAgICAgLi4uKHJlc3BvbnNlU2NoZW1hICYmIHtcbiAgICAgICAgICAyMDA6IHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBcIlN1Y2Nlc3NmdWwgcmVzcG9uc2VcIixcbiAgICAgICAgICAgIGNvbnRlbnQ6IHtcbiAgICAgICAgICAgICAgXCJhcHBsaWNhdGlvbi9qc29uXCI6IHtcbiAgICAgICAgICAgICAgICBzY2hlbWE6IHJlc3BvbnNlU2NoZW1hLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9LFxuICAgICAgICB9KSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcblxuICByZXR1cm4gb3BlbkFwaVNwZWM7XG59O1xuXG4vKipcbiAqIEdlbmVyYXRlIE9wZW5BUEkgZmlsZVxuICogUGFzcyB0aGUgQVBJIEdhdGV3YXkgUmVzdEFQSSBhbmQgdGhlIHNjaGVtYXMgdG8gZ2VuZXJhdGUgdGhlIE9wZW5BUEkgZmlsZVxuICogQHBhcmFtIGFwaSAtIEFQSSBHYXRld2F5IFJlc3RBUElcbiAqIEBwYXJhbSBzY2hlbWFzIC0gU2NoZW1hcyB0byBiZSB1c2VkIGluIHRoZSBPcGVuQVBJIGZpbGUsIHVzdWFsbHkgdGhlIHNhbWUgYXMgdGhlIG9uZXMgdXNlZCBpbiB0aGUgQVBJIC4uLiB0aGlzIHNob3VsZCBiZSB0aGUgc2FtZSBjb250cmFjdCBhcyB0aGUgT3BlbkFQSS10cyBTY2hlbWFPYmplY3RcbiAqIEByZXR1cm5zIHZvaWRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlT3BlbkFwaUZpbGUoXG4gIGFwaTogSVJlc3RBcGksXG4gIHNjaGVtYXM6IFJlY29yZDxzdHJpbmcsIFNjaGVtYU9iamVjdD5cbikge1xuICAvLyBAdHMtaWdub3JlXG4gIGNvbnN0IGFwaVBhdGhzOiBQYXRoW10gPSBhcGkubWV0aG9kcy5yZWR1Y2UoKGFjYzogUGF0aFtdLCBtZXRob2QpID0+IHtcbiAgICBpZiAobWV0aG9kLmh0dHBNZXRob2QgPT09IFwiT1BUSU9OU1wiKSB7XG4gICAgICByZXR1cm4gYWNjO1xuICAgIH1cblxuICAgIGNvbnN0IG5vcm1hbGl6ZWRQYXRoID0gbWV0aG9kLm5vZGUuc2NvcGUucGF0aC5yZXBsYWNlKFwiL2FwaVwiLCBcIlwiKTtcblxuICAgIGNvbnN0IHJlcXVlc3RCb2R5U2NoZW1hID0gbWV0aG9kLm5vZGUubWV0YWRhdGEuZmluZChcbiAgICAgIChtZXRhZGF0YTogYW55KSA9PiBtZXRhZGF0YS50eXBlID09PSBcInJlcXVlc3RCb2R5U2NoZW1hXCJcbiAgICApO1xuXG4gICAgY29uc3QgcmVzcG9uc2VTY2hlbWEgPSBtZXRob2Qubm9kZS5tZXRhZGF0YS5maW5kKFxuICAgICAgKG1ldGFkYXRhOiBhbnkpID0+IG1ldGFkYXRhLnR5cGUgPT09IFwicmVzcG9uc2VTY2hlbWFcIlxuICAgICk7XG5cbiAgICBjb25zdCBxdWVyeVN0cmluZ1NjaGVtYSA9IG1ldGhvZC5ub2RlLm1ldGFkYXRhLmZpbmQoXG4gICAgICAobWV0YWRhdGE6IGFueSkgPT4gbWV0YWRhdGEudHlwZSA9PT0gXCJxdWVyeVN0cmluZ1NjaGVtYVwiXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3BvbnNlVHlwZUlzQXJyYXkgPSBtZXRob2Qubm9kZS5tZXRhZGF0YS5maW5kKFxuICAgICAgKG1ldGFkYXRhOiBhbnkpID0+IG1ldGFkYXRhLnR5cGUgPT09IFwicmVzcG9uc2VUeXBlSXNBcnJheVwiXG4gICAgKTtcblxuICAgIGFjYy5wdXNoKHtcbiAgICAgIHBhdGg6IG5vcm1hbGl6ZWRQYXRoLFxuICAgICAgbWV0aG9kOiBtZXRob2QuaHR0cE1ldGhvZCxcbiAgICAgIHNjaGVtYVByb3BzOiB7XG4gICAgICAgIHJlcXVlc3RCb2R5U2NoZW1hOiByZXF1ZXN0Qm9keVNjaGVtYT8uZGF0YSxcbiAgICAgICAgcmVzcG9uc2VTY2hlbWE6IHJlc3BvbnNlU2NoZW1hPy5kYXRhLFxuICAgICAgICBxdWVyeVN0cmluZ1NjaGVtYTogcXVlcnlTdHJpbmdTY2hlbWE/LmRhdGEsXG4gICAgICAgIHJlc3BvbnNlVHlwZUlzQXJyYXk6IHJlc3BvbnNlVHlwZUlzQXJyYXk/LmRhdGEsXG4gICAgICB9LFxuICAgIH0pO1xuICAgIHJldHVybiBhY2M7XG4gIH0sIFtdIGFzIFBhdGhbXSk7XG5cbiAgY29uc3QgcGF0aHMgPSBbXTtcbiAgZm9yIChjb25zdCBlbGVtZW50IG9mIGFwaVBhdGhzKSB7XG4gICAgY29uc3QgYXBpUGF0aCA9IGVsZW1lbnQ7XG4gICAgY29uc3QgcGF0aCA9IGdlbmVyYXRlT3BlbkFwaVNwZWMoXG4gICAgICBhcGlQYXRoLnBhdGgsXG4gICAgICBhcGlQYXRoLm1ldGhvZCxcbiAgICAgIGFwaVBhdGguc2NoZW1hUHJvcHNcbiAgICApO1xuICAgIHBhdGhzLnB1c2gocGF0aCk7XG4gIH1cblxuICBjb25zdCBvcGVuQXBpU3BlYyA9IHtcbiAgICBvcGVuYXBpOiBcIjMuMC4wXCIsXG4gICAgaW5mbzoge1xuICAgICAgdGl0bGU6IFwiQVBJXCIsXG4gICAgICB2ZXJzaW9uOiBcIjEuMC4wXCIsXG4gICAgfSxcbiAgICBwYXRoczogbWVyZ2VPYmplY3RzKC4uLnBhdGhzKSxcbiAgICBjb21wb25lbnRzOiB7XG4gICAgICBzY2hlbWFzLFxuICAgIH0sXG4gIH07XG5cbiAgZnMud3JpdGVGaWxlU3luYyhcbiAgICBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgXCIuL29wZW5hcGkuanNvblwiKSxcbiAgICBKU09OLnN0cmluZ2lmeShvcGVuQXBpU3BlYywgbnVsbCwgMilcbiAgKTtcbn1cblxuY29uc3QgaXNPYmplY3QgPSAob2JqOiBhbnkpID0+IG9iaiAmJiB0eXBlb2Ygb2JqID09PSBcIm9iamVjdFwiO1xuXG5jb25zdCBtZXJnZU9iamVjdHMgPSAoXG4gIC4uLm9iamVjdHM6IFJlY29yZDxzdHJpbmcsIGFueT5bXVxuKTogUmVjb3JkPHN0cmluZywgYW55PiA9PiB7XG4gIHJldHVybiBvYmplY3RzLnJlZHVjZSgoYWNjLCBvYmopID0+IHtcbiAgICBPYmplY3Qua2V5cyhvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgY29uc3QgYWNjVmFsdWUgPSBhY2Nba2V5XTtcbiAgICAgIGNvbnN0IG9ialZhbHVlID0gb2JqW2tleV07XG5cbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFjY1ZhbHVlKSAmJiBBcnJheS5pc0FycmF5KG9ialZhbHVlKSkge1xuICAgICAgICBhY2Nba2V5XSA9IGFjY1ZhbHVlLmNvbmNhdCguLi5vYmpWYWx1ZSk7XG4gICAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGFjY1ZhbHVlKSAmJiBpc09iamVjdChvYmpWYWx1ZSkpIHtcbiAgICAgICAgYWNjW2tleV0gPSBtZXJnZU9iamVjdHMoYWNjVmFsdWUsIG9ialZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjY1trZXldID0gb2JqVmFsdWU7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYWNjO1xuICB9LCB7fSk7XG59O1xuIl19