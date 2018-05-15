'use strict';

const validation = require('../../utils/validation');

module.exports = ({components, paths, ajvOptions}) => {
	const validate = validation({components, paths, ajvOptions});

	return (req, _res, next) => {
		const {
			body,
			headers,
			method,
			params,
			route,
			query
		} = req;

		validate({
			body,
			headers,
			method,
			params,
			query,
			route: route.path
		});

		return next();
	};
};
