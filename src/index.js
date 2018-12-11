'use strict';

exports.middlewares = {
	express: {
		docs: require('./middlewares/express/docs'),
		validation: require('./middlewares/express/validation'),
	},
	koa: {
		docs: require('./middlewares/koa/docs'),
		validation: require('./middlewares/koa/validation'),
	},
};

exports.utils = {
	mergeSchemas: require('./utils/merge_schemas'),
};
