'use strict';

const validation = require('../../utils/validation');

module.exports = ({components, paths, ajvOptions}) => {
	const validate = validation({components, paths, ajvOptions});

	return (req, _res, next) => {
		const {
			body,
			method,
			params,
			path: route,
			query
		} = req;

		validate({
			body,
			method,
			params,
			query,
			route
		});

		return next();
	};
};
