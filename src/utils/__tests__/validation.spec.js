'use strict';

const validation = require('../validation');

const toJson = error => (
	Object
		.keys(error)
		.reduce(
			(acc, k) => ({
				...acc,
				[k]: error[k]
			}),
			{}
		)
);

describe('validation', () => {
	const components = {
		'schemas': {
			'Data': {
				'type': 'object'
			}
		}
	};

	const paths = {
		'/get': {
			'get': {
				'parameters': [{
					'in': 'query',
					'name': 'query',
					'required': true,
					'schema': {
						'type': 'string',
						'enum': ['query']
					}
				}]
			}
		},
		'/post': {
			'post': {
				'requestBody': {
					'content': {
						'application/json': {
							'schema': {
								'type': 'object',
								'properties': {
									'body': {
										'type': 'number',
										'mustPositive': true
									}
								},
								'required': [
									'body'
								]
							}
						}
					}
				}
			}
		}
	};

	const validate = validation({
		components,
		paths,
		ajvKeywords: [{
			name: 'mustPositive',
			def: {
				validate: (schema, data) => {
					return schema ? data > 0 : true;
				}
			}
		}]
	});

	test('valid get request', () => {
		expect(
			validate({
				body: {},
				headers: {},
				method: 'get',
				params: {},
				query: {
					query: 'query'
				},
				route: '/get'
			})
		).toEqual(undefined);
	});

	test('invalid get request', () => {
		try {
			validate({
				body: {},
				headers: {},
				method: 'get',
				params: {},
				query: {
					query: 'body'
				},
				route: '/get'
			});
			expect(true).toEqual(false);
		} catch (error) {
			expect(error.message).toMatchSnapshot();
			expect(toJson(error)).toMatchSnapshot();
		}
	});

	test('valid post request', () => {
		expect(
			validate({
				body: {
					body: 1
				},
				headers: {},
				method: 'post',
				params: {},
				query: {},
				route: '/post'
			})
		).toEqual(undefined);
	});

	test('invalid post request', () => {
		try {
			validate({
				body: {
					body: {
						body: 'body'
					}
				},
				headers: {},
				method: 'post',
				params: {},
				query: {},
				route: '/post'
			});
			expect(true).toEqual(false);
		} catch (error) {
			expect(error.message).toMatchSnapshot();
			expect(toJson(error)).toMatchSnapshot();
		}
	});
});
