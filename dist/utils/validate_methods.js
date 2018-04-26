'use strict';

var _ = require('lodash');

/**
 * check if the given object is JSON object type assuming that the given data is valid JSON
 *
 * @param  {Object}  data - object to query
 * @return {Boolean}      - given object is of JSON object type or not
 *
 * @example
 *      data   =  null
 *             => false
 *
 *      data   = 'a'
 *             => false
 *
 *      data   =  [ 'a' ]
 *             => false
 *
 *      data   =  { a: '' }
 *             => true
 */
var isJsonObject = function isJsonObject(data) {
	if (!data) return false;
	if (typeof data !== 'object') return false;
	if (Array.isArray(data)) return false;
	return true;
};

/**
 * add a prefix to values relating to the given keys in the given object
 *
 * @param  {Object} data   - object to query
 * @param  {String} key    - keys associated with the value that needs to be prifixed
 * @param  {String} prefix - the string to prefix
 * @return {Object}        - the object with the values modified
 *
 * @example
 *      data   =  { a: [ { b: { x: 'value' } } ], x: 'value' }
 *      key    =  'x'
 *      prefix =  '_'
 *             => { a: [ { b: { x: '_value' } } ], x: '_value' }
 */
var prefixStringValue = function prefixStringValue(data, key, prefix) {
	if (!isJsonObject(data)) return undefined;
	try {
		return JSON.parse(JSON.stringify(data), function (k, v) {
			if (k === key) return `${prefix}${v}`;
			return v;
		});
	} catch (_error) {
		return undefined;
	}
};

/**
 * get the value at the deep path that resolves first within the given object
 *
 * @param  {Object} data - object to query
 * @param  {String} path - path within the object to get
 * @return {*}           - property value at the path
 *
 * @example
 *      data =  { a: [ { b: { c: 'result' } } ] }
 *      path =  'b.c'
 *           => 'result'
 */
var getDeep = function getDeep(data, path) {
	if (!data) return undefined;
	if (typeof data !== 'object') return undefined;

	if (!Array.isArray(data)) {
		var result = _.get(data, path);
		if (result) return result;
	}

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = Object.values(data)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var value = _step.value;

			var _result = getDeep(value, path);
			if (_result) return _result;
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return undefined;
};

exports.validate = function (validator, data, to_validate) {
	var schema = getDeep(data, 'schema');
	var schema_prefix_ref = prefixStringValue(schema, '$ref', '_');

	// schema must be present to validate the request body
	if (!isJsonObject(schema_prefix_ref)) return false;

	return validator.validate(schema_prefix_ref, to_validate);
};

exports.validateGet = function (validator, data, to_validate) {
	if (!data.parameters) return true;
	var parameters_required = data.parameters.filter(function (_ref) {
		var required = _ref.required;
		return required === true;
	}).map(function (_ref2) {
		var name = _ref2.name;
		return name;
	});

	var parameters_properties = Object.values(data.parameters).reduce(function (acc, _ref3) {
		var name = _ref3.name,
		    schema = _ref3.schema;
		return Object.assign(acc, {
			[name]: prefixStringValue(schema, '$ref', '_')
		});
	}, {});

	var schema_prefix_ref = {
		type: 'object',
		required: parameters_required,
		properties: parameters_properties
	};

	return validator.validate(schema_prefix_ref, to_validate);
};