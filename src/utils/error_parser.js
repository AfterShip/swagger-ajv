'use strict';

const _ = require('lodash');

exports.parse = function parseError(errors, extra_detail = true) {
	let has_combined_error = false;
	let results = errors.map((e) => {
		e.dataPath = e.dataPath.replace(/\[\d+\]/g, function (x) {
			return x.replace(/\[/, '.').replace(/\]/, '');
		});
		let result;

		switch (e.keyword) {
			case 'additionalProperties': {
				result = {
					path: `data${e.dataPath}`,
					info: `${e.message} ['${e.params.additionalProperty}']`
				};
				break;
			}
			case 'enum': {
				const expected_enum = JSON.stringify(e.schema);
				result = {
					path: `data${e.dataPath}`,
					info: `should be equal to one of values ${expected_enum}`
				};
				break;
			}
			case 'oneOf':
			case 'anyOf':
				result = {
					path: `data${e.dataPath}`,
					info: `${e.message}`
				};

				if (extra_detail) {
					result.schema = _.map(_.get(e, 'schema', {}), '$ref');
				}

				has_combined_error = true;
				break;
			case 'required':
				result = {
					path: `data${e.dataPath}.${e.params.missingProperty}`,
					info: 'is a required property'
				};
				break;
			case 'format':
				result = {
					path: `data${e.dataPath}`,
					info: `should match format ${e.params.format}`
				};
				break;
			case 'eitherOneOfPropertiesRequired':
				result = {
					path: `data${e.dataPath}`,
					info: `${e.message}`
				};
				break;
			case '$merge':
				// skip merge error
				return null;
			case 'pattern':
			case 'type':
			default:
				result = {
					path: `data${e.dataPath}`,
					info: `${e.message}`
				};
				break;
		}

		// we overwrite the info with the custom error message
		if (_.has(e, 'parentSchema.errorMessage')) {
			result = {
				path: `data${e.dataPath}`,
				info: _.get(e, 'parentSchema.errorMessage')
			};
		}

		if (e.keyword !== 'eitherOneOfPropertiesRequired') {
			result.info = `${result.path} ${result.info}`;
		}

		if (extra_detail) {
			result.parent_schema_id = _.get(e, 'parentSchema.$id', '');
		}
		return result;
	});
	results = _.compact(results);

	// if there are oneOf/anyOf errors
	if (!extra_detail && has_combined_error) {
		// wrap the message to hide details
		results = [
			{
				path: 'data',
				info: 'Data is not valid under the given schemas'
			}
		];
	}

	return results;
};
