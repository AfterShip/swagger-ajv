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
			return {
				path,
				info: parentSchema.errorMessage,
				...result
			};
		}

		if (keyword === 'additionalProperties') {
			return {
				info: `${path} ${message} ['${params.additionalProperty}']`,
				...result
			};
		}

		if (keyword === 'enum') {
			return {
				path,
				info: `${path} should be equal to one of values ${JSON.stringify(schema)}`,
				...result
			};
		}

		if (keyword === 'oneOf' || keyword === 'anyOf') {
			return {
				path,
				info: `${path} ${message}`,
				schema: map(schema, '$ref'),
				...result
			};
		}

		if (keyword === 'required') {
			const required_path = `data${dataPath}.${params.missingProperty}`;
			return {
				path: required_path,
				info: `${required_path} is a required property`,
				...result
			};
		}

		if (keyword === 'format') {
			return {
				path,
				info: `${path} should match format ${params.format}`,
				...result
			};
		}

		if (keyword === 'eitherOneOfPropertiesRequired') {
			return {
				path,
				info: `${message}`,
				...result
			};
		}

		if (keyword === '$merge') {
			return null;
		}

		return {
			path,
			info: `${path} ${message}`,
			...result
		};
	});

	return compact(results);
};
