'use strict';

const Ajv = require('ajv');
const {validateGet, validate} = require('../validate_methods');

const ajv = new Ajv({
	removeAdditional: true
});

describe('validateGet', () => {
	const dataFactory = (data, ps) => Object.assign({
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
		]
	}, data);

	const validatorFactory = validator => Object.assign({
		validate: jest.fn((schema, to_validate) => {
			return ajv.validate(schema, to_validate);
		})
	}, validator);

	const queryFactory = (queries) => Object.assign({
		a: 'a'
	}, queries);

	it('should validate request', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, []);
		const query = queryFactory({});

		const is_valid = validateGet(validator, data, query);
		expect(is_valid).toEqual(true);
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

		const is_valid = validateGet(validator, data, query);
		expect(is_valid).toEqual(false);
	});

	it('should not validate request with invalid type', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, []);
		const query = queryFactory({
			a: 0
		});

		const is_valid = validateGet(validator, data, query);
		expect(is_valid).toEqual(false);
	});
});

describe('validate', () => {
	const dataFactory = (data, ps, required) => Object.assign({
		requestBody: {
			content: {
				'application/json': {
					schema: {
						type: 'object',
						required: ['a', ...required],
						properties: Object.assign({
							a: {
								type: 'string'
							}
						}, ps)
					}
				}
			}
		}
	}, data);

	const validatorFactory = validator => Object.assign({
		validate: jest.fn((schema, to_validate) => {
			return ajv.validate(schema, to_validate);
		})
	}, validator);

	const bodyFactory = body => Object.assign({
		a: 'a'
	}, body);

	it('should validate request', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, {}, []);
		const body = bodyFactory({});

		const is_valid = validate(validator, data, body);
		expect(is_valid).toEqual(true);
	});

	it('should not validate request with missing required property', () => {
		const validator = validatorFactory({});
		const data = dataFactory({
			b: {
				type: 'string'
			}
		}, {}, ['b']);
		const body = bodyFactory({});

		const is_valid = validate(validator, data, body);
		expect(is_valid).toEqual(false);
	});

	it('should not validate request with invalid type', () => {
		const validator = validatorFactory({});
		const data = dataFactory({}, [], []);
		const body = bodyFactory({
			a: 0
		});

		const is_valid = validate(validator, data, body);
		expect(is_valid).toEqual(false);
	});
});
