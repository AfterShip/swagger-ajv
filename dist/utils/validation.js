'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var Ajv = require('ajv');

var errorParser = require('./error_parser');

var _require = require('./validate_methods'),
    validateGet = _require.validateGet,
    validate = _require.validate;

/**
 uses ajv to validate request parameters against schema determined by request route and request method
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

	return function (_ref2) {
		var body = _ref2.body,
		    method = _ref2.method,
		    params = _ref2.params,
		    query = _ref2.query,
		    route = _ref2.route;

		var _route$split = route.split(':'),
		    _route$split2 = _slicedToArray(_route$split, 2),
		    split_route = _route$split2[0],
		    split_params = _route$split2[1];

		var data = void 0;
		if (split_params) {
			data = paths[`${split_route}{${split_params}}`][method.toLowerCase()];
		} else {
			data = paths[route][method.toLowerCase()];
		}

		var is_valid = false;
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
			var error = new Error('Schema validation error');
			error.details = errorParser.parse(ajv.errors);
			throw error;
		}
	};
};