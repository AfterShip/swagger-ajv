'use strict';

const Ajv = require('ajv');

const {validateGet, validate} = require('../utils/validate_methods');
const errorParser = require('../utils/error_parser');

/**
 * middleware that uses ajv to validate request parameters against schema determined by request route and request method
 * $ref will resolve only `#/components/schemas/...` same as openapi schema
 *
 * @todo - add support for request other than `GET query` and `POST PUT application/json`
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

	return (req, res, next) => {
		const {method, path} = req;

		const data = paths[path][method.toLowerCase()];

		let is_valid = false;
		switch (method) {
			case 'POST':
			case 'PUT':
			case 'PATCH':
			case 'DELETE':
				is_valid = validate(ajv, data, req.body);
				break;
			case 'GET':
				// assumes query and params have no conflicting names
				is_valid = validateGet(ajv, data, Object.assign({}, req.query, req.params));
				break;
			default:
				throw new Error('Method not allowed');
		}

		if (!is_valid) {
			const error = new Error('Schema validation error');
			error.details = errorParser.parse(ajv.errors);
			throw error;
		}

		return next();
	};
};

