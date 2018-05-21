'use strict';

const validation = require('../../utils/validation');

module.exports = ({components, paths, ajvOptions}) => {
	const validate = validation({components, paths, ajvOptions});

	return (ctx, next) => {
		const {
			_matchedRoute: route,
			matched,
			method,
			path
		} = ctx;

		const {
			body,
			headers,
			query
		} = ctx.request;

		// koa router params might not be available to the middleware
		// https://github.com/alexmingoia/koa-router/issues/452
		const layer = matched[matched.length - 1];
		const captures = layer.captures(path);
		const params = layer.params(path, captures, {});

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
