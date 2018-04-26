'use strict';

exports.middlewares = {
	express: {
		docs: require('./dist/middlewares/express/docs'),
		validation: require('./dist/middlewares/express/validation')
	},
	koa: {
		docs: require('./dist/middlewares/koa/docs'),
		validation: require('./dist/middlewares/koa/validation')
	}
};

exports.utils = {
	mergeSchemas: require('./dist/utils/merge_schemas')
};
