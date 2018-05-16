'use strict';

const Ajv = require('ajv');

const errorParser = require('./error_parser');
const {combineRequestSchemas} = require('./combine_request_schemas');

/**
 uses ajv to validate request parameters against schema determined by request route and request method
 * $ref will resolve only `#/components/schemas/...` same as openapi schema
 *
 * @todo - add support for request other than `GET query` and `POST PUT PATCH DELETE application/json`
 */
module.exports = ({components, paths, ajvOptions}) => {
	const ajv = new Ajv({
		allErrors: true,
		removeAdditional: true,
		...ajvOptions
	});

	ajv.addSchema({
		$id: '_',
		components
	});

	return ({body, headers, method, params, query, route}) => {
		const path = route.replace(/:[^/]*/, match => `{${match.slice(1)}}`);
		const data = paths[path][method.toLowerCase()];

		let toValidate = {};
		switch (method) {
			case 'POST':
			case 'PUT':
			case 'PATCH':
			case 'DELETE':
				toValidate = {
					header: headers,
					path: params,
					body
				};
				break;
			case 'GET':
				toValidate = {
					header: headers,
					query,
					path: params
				};
				break;
			default:
				throw new Error('Method not allowed');
		}

		const combinedSchema = combineRequestSchemas(data, Object.keys(toValidate));
		const isValid = ajv.validate(combinedSchema, toValidate);
		if (!isValid) {
			const error = new Error('Schema validation error');

			if (ajv.errors) {
				error.details = errorParser.parse(ajv.errors);
			}

			throw error;
		}
	};
};
