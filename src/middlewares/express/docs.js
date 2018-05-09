
'use strict';

const docs = require('../../utils/docs');

module.exports = schemas => {
	const body = docs(schemas);

	return function (req, res, next) {
		if (req.path === '/docs') {
			return res.send(body);
		}

		return next();
	};
};
