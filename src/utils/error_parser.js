'use strict';

const {map, compact} = require('lodash');

exports.parse = errors => {
	const results = errors.map(error => {
		const dataPath = error.dataPath.replace(
			/\[\d+\]/g,
			x => x.replace(/\[/, '.').replace(/\]/, '')
		);

		const {
			keyword,
			message,
			params,
			parentSchema = {},
			schema = {}
		} = error;

		const result = {
			parent_schema_id: parentSchema.$id
		};

		if (parentSchema.errorMessage) {
			return Object.assign(result, {
				path: `data${dataPath}`,
				info: parentSchema.errorMessage
			});
		}

		if (keyword === 'additionalProperties') {
			return Object.assign(result, {
				path: `data${dataPath}`,
				info: `${message} ['${params.additionalProperty}']`
			});
		}

		if (keyword === 'enum') {
			return Object.assign(result, {
				path: `data${dataPath}`,
				info: `should be equal to one of values ${JSON.stringify(schema)}`
			});
		}

		if (keyword === 'oneOf' || keyword === 'anyOf') {
			return Object.assign(result, {
				path: `data${dataPath}`,
				info: `${message}`,
				schema: map(schema, '$ref')
			});
		}

		if (keyword === 'required') {
			return Object.assign(result, {
				path: `data${dataPath}.${params.missingProperty}`,
				info: 'missing required property'
			});
		}

		if (keyword === 'required') {
			return Object.assign(result, {
				path: `data${dataPath}`,
				info: `should match format ${params.format}`
			});
		}

		if (keyword === '$merge') {
			return null;
		}

		return Object.assign(result, {
			path: `data${dataPath}`,
			info: `${message}`
		});
	});

	return compact(results);
};
