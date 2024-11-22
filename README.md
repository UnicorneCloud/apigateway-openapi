# ApiGateway OpenAPI

ApiGateway OpenAPI is a construct for generating OpenAPI documentation.

## Installation

- Install dependency `npm install apigateway-openapi`
- Instanciate the construct:
```JavaScript

this.restApi = new apigateway.RestApi(this, "api", {
    defaultCorsPreflightOptions: {
    allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
    allowOrigins: ["*"],
    },
});
new ApiGatewayOpenApiConstruct(this, 'id', api, schemas)
```

`schemas` is a key value object where key is the schema's name and value is the jsonschema.

## Inject schemas

We  canno't automatically discover your schemas, and we canno't generate it for you.
If you use a validator you can use a jsonschema corresponding package which will infer schema into jsonschema.

- [Class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema)
- [zod-jsonschema](https://www.npmjs.com/package/zod-jsonschema)

If you generate all schemas
