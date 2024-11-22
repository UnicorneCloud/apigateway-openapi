# ApiGateway OpenAPI

ApiGateway OpenAPI is a construct for generating OpenAPI documentation.

## Installation

- Install dependency `npm install apigateway-openapi`
- Instanciate the construct:
```JavaScript
import { ApigatewayOpenapiConstructv} from 'apigateway-openapi'
...

this.restApi = new apigateway.RestApi(this, "api", {
    defaultCorsPreflightOptions: {
    allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
    allowOrigins: ["*"],
    },
});
new ApiGatewayOpenApiConstruct(this, 'id', api, schemas)
```

`api` is your `RestApi` instance.

`schemas` is a key value object where key is the schema's name and value is the valid jsonschema.

```JSON
{
    "User": {...jsonschema},
    "Car": {...jsonschema}
}
```

- run a CDK diff `cdk diff`
- a file named `openapi.json` will be generated at your project root.

The construct will auto generated routes and guess path params based on the format, however it cannot create request body and response schema for you and link it to API routes.

## Generate your schemas.

We  canno't automatically discover your schemas, and we canno't generate it for you.
If you use a validator you can use a jsonschema corresponding package which will infer schema into jsonschema.

- [Class-validator-jsonschema](https://www.npmjs.com/package/class-validator-jsonschema)
- [zod-jsonschema](https://www.npmjs.com/package/zod-jsonschema)

For example, with `class-validator` you can create your annotated class then import your Input/Output validator classes in one file. Finally call `validationMetadatasToSchemas`
```JavaScript
import { validationMetadatasToSchemas } from 'class-validator-jsonschema'

import * from 'UserDto'
import * from 'CarDto'

const schemas = validationMetadatasToSchemas()
```

Schemas will be directly as the required format.

At this moment, schemas will not be linked to your api root.

## Link schemas to routes

For each route, you will map input and output schemas by adding metadatas to the ressource. The construct will parse them after.

- `requestBodySchema`: Schema used in input body
- `responseSchema`: The API will respond that schema
- `responseTypeIsArray`: The response will be an array of `responseSchema`

```JavaScript
import { addMetadatas } from 'apigateway-openapi/dist/utils/open-api'

...
// Create api ressource
const resource = currentRoute.addMethod("GET" | "PUT | "POST" | "DELETE", lambdaIntegration)

// Map your current ressource with schemas
addMetadatas(resource.node, {
  requestBodySchema: "UpdateUser"; // Input schema
  responseTypeIsArray: true; // Tell this is a listing routes
  responseSchema: "User"; // Output schema
})
```

## TODO

- Handle queryStringParameters where schemas can be a little bit tricky because no schema generator works for them. We should provide another way to handle it easily.
- Publish it on specified S3 bucket
