'use strict';

exports.middlewares = {
	express: {
		docs: require('./src/middlewares/express/docs'),
		validation: require('./src/middlewares/express/validation')
	},
	koa: {
		docs: require('./src/middlewares/koa/docs'),
		validation: require('./src/middlewares/koa/validation')
	}
};

exports.utils = {
	mergeSchemas: require('./src/utils/merge_schemas')
};
