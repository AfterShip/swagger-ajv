'use strict';

var validation = require('../../utils/validation');

module.exports = function (_ref) {
	var components = _ref.components,
	    paths = _ref.paths;

	var validate = validation({ components, paths });

	return function (req, _res, next) {
		var body = req.body,
		    method = req.method,
		    params = req.params,
		    route = req.path,
		    query = req.query;


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