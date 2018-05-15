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

		const isValids = [];
		switch (method) {
			case 'POST':
			case 'PUT':
			case 'PATCH':
			case 'DELETE':
				isValids.push(
					validate(ajv, data, body),
					validateGet(ajv, data, {
						header: headers,
						path: params,
						query
					})
				);
				break;
			case 'GET':
				isValids.push(
					validateGet(ajv, data, {
						header: headers,
						query,
						path: params
					}),
					true
				);
				break;
			default:
				throw new Error('Method not allowed');
		}

		if (!isValids.every(isValid => isValid)) {
			const error = new Error('Schema validation error');

			if (ajv.errors) {
				error.details = errorParser.parse(ajv.errors);
			}

			throw error;
		}
	};
};
