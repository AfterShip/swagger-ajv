'use strict';

const _ = require('lodash');

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
const isJsonObject = data => {
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
const prefixStringValue = (data, key, prefix) => {
	if (!isJsonObject(data)) return undefined;
	try {
		return JSON.parse(JSON.stringify(data), (k, v) => {
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
const getDeep = (data, path) => {
	if (!data) return undefined;
	if (typeof data !== 'object') return undefined;

	if (!Array.isArray(data)) {
		const result = _.get(data, path);
		if (result) return result;
	}

	for (const value of Object.values(data)) {
		const result = getDeep(value, path);
		if (result) return result;
	}

	return undefined;
};

exports.validate = (validator, data, to_validate) => {
	if (!data.requestBody) return true;
	const schema = getDeep(data, 'schema');
	const schema_prefix_ref = prefixStringValue(schema, '$ref', '_');

	// schema must be present to validate the request body
	if (!isJsonObject(schema_prefix_ref)) return false;

	return validator.validate(schema_prefix_ref, to_validate);
};

exports.validateGet = (validator, data, to_validate) => {
	if (!data.parameters) return true;
	const parameters_required = data.parameters.filter(({required}) => required === true).map(({name}) => name);

	const parameters_properties = Object.values(data.parameters).reduce(
		(acc, {name, schema}) => Object.assign(acc, {
			[name]: prefixStringValue(schema, '$ref', '_')
		}),
		{}
	);

	const schema_prefix_ref = {
		type: 'object',
		required: parameters_required,
		properties: parameters_properties
	};

	return validator.validate(schema_prefix_ref, to_validate);
};
