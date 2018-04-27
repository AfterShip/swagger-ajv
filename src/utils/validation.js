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
module.exports = ({components, paths}) => {
	const ajv = new Ajv({
		allErrors: true,
		removeAdditional: true
	});

	ajv.addSchema({
		$id: '_',
		components
	});

	return ({body, method, params, query, route}) => {
		const [split_route, split_params] = route.split(':');

		let data;
		if (split_params) {
			data = paths[`${split_route}{${split_params}}`][method.toLowerCase()];
		} else {
			data = paths[route][method.toLowerCase()];
		}

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
			error.details = errorParser.parse(ajv.errors);
			throw error;
		}
	};
};
