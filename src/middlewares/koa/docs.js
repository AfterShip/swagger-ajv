'use strict';

const docs = require('../../utils/docs');

module.exports = (schemas, {path = '/docs'} = {}) => {
	const body = docs(schemas);

	return function (ctx, next) {
		if (ctx.path === path) {
			ctx.type = 'text/html';
			ctx.body = body;
			return undefined;
		}

		return next();
	};
};
