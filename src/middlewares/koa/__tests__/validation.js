'use strict';

jest.mock('../../../utils/validation', () => {
	return () => {
		return () => {
			const e = new Error();
			e.message = 'Schema validation error';
			e.details = [
				{
					path: 'a.b',
					info: 'a.b should be required',
				},
			];
			throw e;
		};
	};
});
const validation = require('../validation');

describe('validation', () => {
	it('should throw error', () => {
		const components = jest.fn();
		const paths = jest.fn();
		const throwFn = jest.fn();
		const ctx = {
			throw: throwFn,
			request: {
				body: {},
			},
			matched: [
				{
					captures: jest.fn(),
					params: jest.fn(),
				},
			],
			method: 'POST',
		};

		const next = jest.fn();

		validation({
			components,
			paths,
		})(ctx, next);

		expect(throwFn.mock.calls).toMatchSnapshot();
	});
});
