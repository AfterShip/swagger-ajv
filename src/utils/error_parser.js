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

		const path = `data${dataPath}`;

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
			const required_path = `data${dataPath}.${params.missingProperty}`;
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
