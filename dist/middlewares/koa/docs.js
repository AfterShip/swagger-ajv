'use strict';

var path = require('path');
var pug = require('pug');

module.exports = function (schemas) {
	var docs = pug.renderFile(path.resolve(__dirname, '../../views/docs.pug'), {
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