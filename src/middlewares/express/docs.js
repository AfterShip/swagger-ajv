
'use strict';

const path = require('path');
const pug = require('pug');

module.exports = (schemas) => {
	const docs = pug.renderFile(path.resolve(__dirname, '../../views/docs.pug'), {
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
