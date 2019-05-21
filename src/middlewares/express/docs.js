
'use strict';

const docs = require('../../utils/docs');

module.exports = (schemas, {path = '/docs'}) => {
	const body = docs(schemas);

	return function (req, res, next) {
		if (req.path === path) {
			return res.send(body);
		}

		return next();
	};
};
