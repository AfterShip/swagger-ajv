'use strict';

const validation = require('../../utils/validation');

module.exports = ({components, paths}) => {
	const validate = validation({components, paths});

	return (ctx, next) => {
		const {
			_matchedRoute: route,
			body,
			method,
			params,
			query
		} = ctx;

		try {
			validate({
				body,
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
