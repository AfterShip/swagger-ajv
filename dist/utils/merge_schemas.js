'use strict';

var _ = require('lodash');
var fs = require('fs');
var path = require('path');

// combine all schemas into one object
module.exports = function (schemas_dir) {
	return fs.readdirSync(schemas_dir).reduce(function (acc, file) {
		return _.merge(acc, require(path.join(schemas_dir, file)));
	}, {});
};