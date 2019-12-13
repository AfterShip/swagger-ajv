'use strict';

const {get, values} = require('lodash');

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

	return JSON.parse(JSON.stringify(data), (k, v) => {
		if (k === key) return `${prefix}${v}`;
		return v;
	});
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

	// See https://github.com/eslint/eslint/issues/12117
	// eslint-disable-next-line
	for (const value of values(data)) {
		const result = getDeep(value, path);
		if (result) return result;
	}

	return undefined;
};

exports.getBodySchema = (data) => {
	if (!data.requestBody) return {};
	const schema = getDeep(data.requestBody, 'schema');
	return prefixStringValue(schema, '$ref', '_');
};
const {getBodySchema} = exports;

exports.getParametersSchema = (data, key) => {
	if (!data.parameters) return {};

	const parameters = data.parameters.filter(parameter => parameter.in === key);

	if (!parameters.length) return {};

	const parametersRequired = parameters.filter(({required}) => required).map(({name}) => name);

	const parametersProperties = values(parameters).reduce(
		(acc, {name, schema}) => ({
			[name]: prefixStringValue(schema, '$ref', '_'),
			...acc,
		}),
		{},
	);

	return {
		type: 'object',
		required: parametersRequired,
		properties: parametersProperties,
	};
};
const {getParametersSchema} = exports;

exports.combineRequestSchemas = (data, toValidateKeys) => {
	const properties = toValidateKeys.reduce(
		(schemaAcc, key) => ({
			...schemaAcc,
			[key]: key === 'body'
				? getBodySchema(data)
				: getParametersSchema(data, key),
		}),
		{},
	);

	return {
		type: 'object',
		properties,
	};
};
