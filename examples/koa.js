'use strict';

const path = require('path');

const swaggerAjv = require('../src');

const {docs, validation} = swaggerAjv.middlewares.koa;

const {mergeSchemas} = swaggerAjv.utils;

// load schema definitions
const schemas = mergeSchemas(
	path.resolve(__dirname, 'schemas'),
);

// export middlewares for your application
exports.docs = docs(schemas.swagger);
exports.validation = validation(schemas.ajv);
