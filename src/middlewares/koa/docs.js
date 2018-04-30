'use strict';

const docs = require('../../utils/docs');

module.exports = schemas => {
	const body = docs(schemas);

	return function (ctx, next) {
		if (ctx.path === '/docs') {
			ctx.type = 'text/html';
			ctx.body = body;
			return undefined;
		}

		return next();
	};
};
