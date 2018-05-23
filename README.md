# swagger-ajv &middot; [![Build Status](https://travis-ci.com/AfterShip/swagger-ajv.svg?token=UPdSqUWnAVSgurmgvqRv&branch=master)](https://travis-ci.com/AfterShip/swagger-ajv) [![codecov](https://codecov.io/gh/AfterShip/swagger-ajv/branch/master/graph/badge.svg?token=meIcepANCc)](https://codecov.io/gh/AfterShip/swagger-ajv)

The middleware for validating and documenting express and koa applications.
- Validation is done using AJV.
- Documentation is done using Swagger.

Compatible with node >= 4

## Specification

NOTE: The middleware must be applied to the router not the application when using koa.

The documentation should be written using OpenAPI 3.0 specification with the differences listed below. The differences with JSON schema can be noted [here] (https://swagger.io/docs/specification/data-models/keywords). When writing schema for your application please note that the keywords must be used in a way that can be supported by both Swagger and AJV.

- `type` can be an array with `"null"` as the second element when `"nullable": true` property needs to be used as mentioned in the OpenAPI.

```
"type": "string"
```

```
"type": ["string", "null"],
"nullable": true
```

## Test

```
yarn test
```

## Building

```
yarn build
```

## Examples

- Express `examples/express.js`
- Koa `examples/koa.js`

# Credits
- [AJV] (https://github.com/epoberezkin/ajv)
- [Swagger] (https://github.com/swagger-api/swagger-ui)
