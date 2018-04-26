
'use strict';

var path = require('path');
var pug = require('pug');

module.exports = function (schemas) {
	var docs = pug.renderFile(path.resolve(__dirname, '../../views/docs.pug'), {
		spec: schemas
	});

	return function (req, res, next) {
		if (req.path === '/docs') {
			res.render(docs);
			return undefined;
		}

		return next();
	};
};