'use strict';

const {map, compact} = require('lodash');

exports.parse = errors => {
	const results = errors.map(error => {
		const [,, ...dataPath] = error.dataPath
			.replace(
				/\[\d+\]/g,
				x => x.replace(/\[/, '.').replace(/\]/, '')
			)
			.split('.');

		const path = ['data', ...dataPath].join('.');

		const {
			keyword,
			message,
			params,
			parentSchema = {},
			schema = {}
		} = error;

		const result = {
			parentSchemaId: parentSchema.$id,
			ajv: {
				...error
			}
		};

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
				info: `${path} should be equal to one of values ${JSON.stringify(params.allowedValues)}`,
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
			const requiredPath = `${path}.${params.missingProperty}`;
			return {
				path: requiredPath,
				info: `${requiredPath} is a required property`,
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
