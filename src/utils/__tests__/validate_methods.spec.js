'use strict';

const Ajv = require('ajv');
const {validateGet, validate} = require('../validate_methods');

const ajv = new Ajv({
	removeAdditional: true
});

describe('validateGet', () => {
	const dataFactory = (data, ps) => ({
		parameters: [
			{
				in: 'query',
				name: 'a',
				required: false,
				schema: {
					type: 'string'
				}
			},
			{
				in: 'query',
				name: 'b',
				required: false,
				schema: {
					type: 'string'
				}
			},
			...ps
		],
		...data
	});

	const validatorFactory = validator => ({
		validate: jest.fn((schema, toValidate) => {
			return ajv.validate(schema, toValidate);
		}),
		...validator
	});

	const queryFactory = (queries) => ({
		a: 'a',
		...queries
	});

	it('should validate request with empty query and parameters', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, []);

		const isValid = validateGet(validator, data, {
			query: {},
			params: {}
		});
		expect(isValid).toEqual(true);
	});

	it('should validate request', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, []);
		const query = queryFactory({});

		const isValid = validateGet(validator, data, {
			query
		});
		expect(isValid).toEqual(true);
	});

	it('should not validate request with missing required parameters', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, [
			{
				in: 'query',
				name: 'c',
				required: true,
				schema: {
					type: 'string'
				}
			}
		]);
		const query = queryFactory({});

		const isValid = validateGet(validator, data, {
			query
		});
		expect(isValid).toEqual(false);
	});

	it('should not validate request with invalid type', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, []);
		const query = queryFactory({
			a: 0
		});

		const isValid = validateGet(validator, data, {
			query
		});
		expect(isValid).toEqual(false);
	});
});

describe('validate', () => {
	const dataFactory = (data, ps, required) => ({
		requestBody: {
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['a', ...required],
						properties: {
							a: {
								type: 'string'
							},
							...ps
						}
					}
				}
			}
		},
		...data
	});

	const validatorFactory = validator => ({
		validate: jest.fn((schema, toValidate) => {
			return ajv.validate(schema, toValidate);
		}),
		...validator
	});

	const bodyFactory = body => ({
		a: 'a',
		...body
	});

	it('should validate request', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, {}, []);
		const body = bodyFactory({});

		const isValid = validate(validator, data, body);
		expect(isValid).toEqual(true);
	});

	it('should not validate request with missing required property', () => {
		const validator = validatorFactory({});
		const data = dataFactory({
			b: {
				type: 'string'
			}
		}, {}, ['b']);
		const body = bodyFactory({});

		const isValid = validate(validator, data, body);
		expect(isValid).toEqual(false);
	});

	it('should not validate request with invalid type', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, [], []);
		const body = bodyFactory({
			a: 0
		});

		const isValid = validate(validator, data, body);
		expect(isValid).toEqual(false);
	});
});
