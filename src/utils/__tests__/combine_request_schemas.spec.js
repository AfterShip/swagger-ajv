'use strict';

const {
	getBodySchema,
	getParametersSchema,
	combineRequestSchemas,
} = require('../combine_request_schemas');

describe('getBodySchema', () => {
	it('returns schema in requestBody and prefix $ref', () => {
		const data = {
			requestBody: {
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/SuccessfulResponse',
						},
					},
				},
			},
		};
		expect(getBodySchema(data)).toMatchSnapshot();
	});

	it('returns empty object if there is no requestBody in the schema', () => {
		expect(getBodySchema({})).toEqual({});
	});
});

describe('getParametersSchema', () => {
	it('transforms swagger schema in parameters to json-schema format and prefix $ref', () => {
		const data = {
			parameters: [
				{
					in: 'query',
					name: 'a',
					required: true,
					schema: {
						$ref: '#/components/parameters/a',
					},
				}, {
					in: 'path',
					name: 'b',
					required: false,
					schema: {
						$ref: '#/components/parameters/b',
					},
				},
			],
		};
		expect(getParametersSchema(data, 'query')).toMatchSnapshot();
	});

	it('returns empty object if there is no parameters in the schema', () => {
		expect(getParametersSchema({}, {})).toEqual({});
	});

	it('returns empty object if there is no such type of parameter in the schema', () => {
		const data = {
			parameters: [
				{
					in: 'query',
					name: 'a',
					required: true,
					schema: {
						type: 'string',
					},
				}, {
					in: 'path',
					name: 'b',
					required: false,
					schema: {
						type: 'string',
					},
				},
			],
		};
		expect(getParametersSchema(data, 'header')).toEqual({});
	});
});

describe('combineRequestSchemas', () => {
	it('combines schemas for req properties', () => {
		const data = {
			parameters: [
				{
					in: 'query',
					name: 'a',
					required: true,
					schema: {
						$ref: '#/components/parameters/a',
					},
				}, {
					in: 'path',
					name: 'b',
					required: false,
					schema: {
						$ref: '#/components/parameters/b',
					},
				},
			],
			requestBody: {
				content: {
					'application/json': {
						schema: {
							$ref: '#/components/schemas/SuccessfulResponse',
						},
					},
				},
			},
		};
		const toValidateKeys = ['query', 'path', 'body'];
		expect(combineRequestSchemas(data, toValidateKeys)).toMatchSnapshot();
	});
});
