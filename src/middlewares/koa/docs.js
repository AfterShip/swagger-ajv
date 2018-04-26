'use strict';

const path = require('path');
const pug = require('pug');

module.exports = (schemas) => {
	const docs = pug.renderFile(path.resolve(__dirname, '../../views/docs.pug'), {
		spec: schemas
	});

	return function (ctx, next) {
		if (ctx.path === '/docs') {
			ctx.type = 'text/html';
			ctx.body = docs;
			return undefined;
		}

		return next();
	};
};
