'use strict';

var _require = require('lodash'),
    map = _require.map,
    compact = _require.compact;

exports.parse = function (errors) {
	var results = errors.map(function (error) {
		var dataPath = error.dataPath.replace(/\[\d+\]/g, function (x) {
			return x.replace(/\[/, '.').replace(/\]/, '');
		});

		var keyword = error.keyword,
		    message = error.message,
		    params = error.params,
		    _error$parentSchema = error.parentSchema,
		    parentSchema = _error$parentSchema === undefined ? {} : _error$parentSchema,
		    _error$schema = error.schema,
		    schema = _error$schema === undefined ? {} : _error$schema;


		var result = {
			parent_schema_id: parentSchema.$id
		};

		var path = `data${dataPath}`;

		if (parentSchema.errorMessage) {
			return Object.assign(result, {
				path,
				info: parentSchema.errorMessage
			});
		}

		if (keyword === 'additionalProperties') {
			return Object.assign(result, {
				info: `${path} ${message} ['${params.additionalProperty}']`
			});
		}

		if (keyword === 'enum') {
			return Object.assign(result, {
				path,
				info: `${path} should be equal to one of values ${JSON.stringify(schema)}`
			});
		}

		if (keyword === 'oneOf' || keyword === 'anyOf') {
			return Object.assign(result, {
				path,
				info: `${path} ${message}`,
				schema: map(schema, '$ref')
			});
		}

		if (keyword === 'required') {
			var required_path = `data${dataPath}.${params.missingProperty}`;
			return Object.assign(result, {
				path: required_path,
				info: `${required_path} is a required property`
			});
		}

		if (keyword === 'format') {
			return Object.assign(result, {
				path,
				info: `${path} should match format ${params.format}`
			});
		}

		if (keyword === 'eitherOneOfPropertiesRequired') {
			return Object.assign(result, {
				path,
				info: `${message}`
			});
		}

		if (keyword === '$merge') {
			return null;
		}

		return Object.assign(result, {
			path,
			info: `${path} ${message}`
		});
	});

	return compact(results);
};