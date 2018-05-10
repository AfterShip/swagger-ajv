'use strict';

const {get} = require('lodash');

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
		const result = get(data, path);
		if (result) return result;
	}

	for (const value of Object.values(data)) {
		const result = getDeep(value, path);
		if (result) return result;
	}

	return undefined;
};

exports.validate = (validator, data, toValidate) => {
	if (!data.requestBody) return true;
	const schema = getDeep(data, 'schema');
	const schemaPrefixRef = prefixStringValue(schema, '$ref', '_');

	// schema must be present to validate the request body
	if (!isJsonObject(schemaPrefixRef)) return false;

	return validator.validate(schemaPrefixRef, toValidate);
};

exports.validateGet = (validator, data, toValidate) => {
	if (!data.parameters) return true;

	const results = Object.keys(toValidate).map(
		key => {
			const parameters = data.parameters.filter(parameter => parameter.in === key);

			if (!parameters.length) return true;

			const parametersRequired = parameters.filter(({required}) => required).map(({name}) => name);

			const parametersProperties = Object.values(parameters).reduce(
				(acc, {name, schema}) => ({
					[name]: prefixStringValue(schema, '$ref', '_'),
					...acc
				}),
				{}
			);

			const schemaPrefixRef = {
				type: 'object',
				required: parametersRequired,
				properties: parametersProperties
			};

			return validator.validate(schemaPrefixRef, toValidate[key]);
		});

	return results.every(result => result);
};
