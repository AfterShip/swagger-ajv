# swagger-ajv &middot; [![Build Status](https://travis-ci.com/AfterShip/swagger-ajv.svg?token=UPdSqUWnAVSgurmgvqRv&branch=master)](https://travis-ci.com/AfterShip/swagger-ajv) [![codecov](https://codecov.io/gh/AfterShip/swagger-ajv/branch/master/graph/badge.svg?token=meIcepANCc)](https://codecov.io/gh/AfterShip/swagger-ajv)

The middleware for validating and documenting express and koa applications.
- Validation is done using AJV.
- Documentation is done using Swagger.

Compatible with node >= 4

## Specification

NOTE: The middleware must be applied to the router not the application when using koa.

The documentation should be written using OpenAPI 3.0 specification with the differences listed below. The differences with JSON schema can be noted [here](https://swagger.io/docs/specification/data-models/keywords). When writing schema for your application please note that the keywords must be used in a way that can be supported by both Swagger and AJV.

- `type` can be an array with `"null"` as the second element when `"nullable": true` property needs to be used as mentioned in the OpenAPI.

```
"type": "string"
```

```
"type": ["string", "null"],
"nullable": true
```

## Reference

`swaggerAjv` is used to refer to the library which would be required as `require('swagger-ajv')`

### Middlewares

swaggerAjv.middlewares.express

- docs
- validation

swaggerAjv.middlewares.koa

- docs
- validation

> docs

pass the schema object as specified by openapi

> validation

pass an object should contain `components`, `paths` and `ajvOptions`
`paths` and `components` are the schemas that can be referenced from `ajv` to use
`ajvOptions` are all the options that can be passed to initialise an `ajv` instance


### Utils

> swaggerAjv.mergeSchemas
the first parameter is a string specifying the path of the folder containing schemas
the second parameter specifies the options on how the schemas are read

1. `useDirStructre`



## Test

```
yarn test
```

## Building

```
yarn build
```

## Examples

### Define schemas for your application

> Componenet.json

schema for new component should be defined under `components.schemas` if written in separate files
```json
{
  "components": {
    "schemas": {
      "Component": {
        "type": "object"
      }
    }
  }
}
```

> swagger.json

keys other than `components` and `paths` defined in a separate file
```json
{
  "openapi": "3.0.0"
}
```

> path.json

schema for a path should be defined as under `paths` key if written in separate files
```json
{
  "paths": {
    "/post": {
      "post": {
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "body": {
                    "type": ["string", "null"]
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "content": {
              "application/json": {
                "schema": {
                  "properties": {
                    "data": {
                      "$ref": "#/components/schemas/Component"
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Write middleware in your favourite framework

- Express `examples/express.js`

```
'use strict';

const path = require('path');

const swaggerAjv = require('../src');

const {docs, validation} = swaggerAjv.middlewares.express;

const {mergeSchemas} = swaggerAjv.utils;

// load schema definitions
const schemas = mergeSchemas(
	path.resolve(__dirname, 'schemas')
);

// define ajvOptions
const ajvOptions = {};

// export middlewares for your application
exports.docs = docs(schemas.swagger);
exports.validation = validation(Object.assign({
	schemas.ajv,
	ajvOptions
}));
```

- Koa `examples/koa.js`

```
'use strict';

const path = require('path');

const swaggerAjv = require('../src');

const {docs, validation} = swaggerAjv.middlewares.koa;

const {mergeSchemas} = swaggerAjv.utils;

// load schema definitions
const schemas = mergeSchemas(
	path.resolve(__dirname, 'schemas')
);

// define ajvOptions
const ajvOptions = {};

// export middlewares for your application
exports.docs = docs(schemas.swagger);
exports.validation = validation(Object.assign({
	schemas.ajv,
	ajvOptions
}));
```

## Credits

- [AJV](https://github.com/epoberezkin/ajv)
- [Swagger](https://github.com/swagger-api/swagger-ui)

## License

[MIT](https://github.com/AfterShip/swagger-ajv/blob/master/LICENSE.md)
