'use strict';

const Ajv = require('ajv');

const errorParser = require('./error_parser');
const {validateGet, validate} = require('./validate_methods');

/**
 uses ajv to validate request parameters against schema determined by request route and request method
 * $ref will resolve only `#/components/schemas/...` same as openapi schema
 *
 * @todo - add support for request other than `GET query` and `POST PUT PATCH DELETE application/json`
 */
module.exports = ({components, paths, ajvOptions}) => {
	const ajv = new Ajv(Object.assign({
		allErrors: true,
		removeAdditional: true
	}), ajvOptions);

	ajv.addSchema({
		$id: '_',
		components
	});

	return ({body, method, params, query, route}) => {
		const path = route.replace(/:[^/]*/, match => `{${match.slice(1)}}`);
		const data = paths[path][method.toLowerCase()];

		let is_valid = false;
		switch (method) {
			case 'POST':
			case 'PUT':
			case 'PATCH':
			case 'DELETE':
				is_valid = validate(ajv, data, body);
				break;
			case 'GET':
				// assumes query and params have no conflicting names
				is_valid = validateGet(ajv, data, Object.assign({}, query, params));
				break;
			default:
				throw new Error('Method not allowed');
		}

		if (!is_valid) {
			const error = new Error('Schema validation error');

			if (ajv.errors) {
				error.details = errorParser.parse(ajv.errors);
			}

			throw error;
		}
	};
};
