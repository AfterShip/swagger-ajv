'use strict';

const Ajv = require('ajv');

const {validateGet, validate} = require('../../utils/validate_methods');
const errorParser = require('../../utils/error_parser');

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

	return (ctx, next) => {
		const {method, _matchedRoute} = ctx;

		const data = paths[_matchedRoute][method.toLowerCase()];

		let is_valid = false;
		switch (method) {
			case 'POST':
			case 'PUT':
			case 'PATCH':
			case 'DELETE':
				is_valid = validate(ajv, data, ctx.request.body);
				break;
			case 'GET':
				// assumes query and params have no conflicting names
				is_valid = validateGet(ajv, data, Object.assign({}, ctx.request.query, ctx.params));
				break;
			default:
				ctx.throw(400, 'Method not allowed');
				break;
		}

		if (!is_valid) {
			ctx.throw(400, 'Schema validation error', {
				details: errorParser.parse(ajv.errors)
			});
		}

		return next();
	};
};
