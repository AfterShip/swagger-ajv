'use strict';

var validation = require('../../utils/validation');

module.exports = function (_ref) {
	var components = _ref.components,
	    paths = _ref.paths;

	var validate = validation({ components, paths });

	return function (ctx, next) {
		var route = ctx._matchedRoute,
		    method = ctx.method,
		    params = ctx.params;
		var _ctx$request = ctx.request,
		    body = _ctx$request.body,
		    query = _ctx$request.query;


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