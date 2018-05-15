'use strict';

const validation = require('../../utils/validation');

module.exports = ({components, paths, ajvOptions}) => {
	const validate = validation({components, paths, ajvOptions});

	return (ctx, next) => {
		const {
			_matchedRoute: route,
			method,
			params
		} = ctx;

		const {
			body,
			headers,
			query
		} = ctx.request;

		try {
			validate({
				body,
				headers,
				method,
				params,
				query,
				route
			});
		} catch (error) {
			ctx.throw(400, error.message, {
				details: error.details
			});
		}

		return next();
	};
};
