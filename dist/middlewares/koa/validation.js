'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var Ajv = require('ajv');

var _require = require('../../utils/validate_methods'),
    validateGet = _require.validateGet,
    validate = _require.validate;

var errorParser = require('../../utils/error_parser');

/**
 * middleware that uses ajv to validate request parameters against schema determined by request route and request method
 * $ref will resolve only `#/components/schemas/...` same as openapi schema
 *
 * @todo - add support for request other than `GET query` and `POST PUT PATCH DELETE application/json`
 */
module.exports = function (_ref) {
	var components = _ref.components,
	    paths = _ref.paths;

	var ajv = new Ajv({
		allErrors: true,
		removeAdditional: true
	});

	ajv.addSchema({
		$id: '_',
		components
	});

	return function (ctx, next) {
		var method = ctx.method,
		    _matchedRoute = ctx._matchedRoute;

		var _matchedRoute$split = _matchedRoute.split(':'),
		    _matchedRoute$split2 = _slicedToArray(_matchedRoute$split, 2),
		    route = _matchedRoute$split2[0],
		    params = _matchedRoute$split2[1];

		var data = void 0;
		if (params) {
			data = paths[`${route}{${params}}`][method.toLowerCase()];
		} else {
			data = paths[_matchedRoute][method.toLowerCase()];
		}

		var is_valid = false;
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