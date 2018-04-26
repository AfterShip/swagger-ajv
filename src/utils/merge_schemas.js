'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

// combine all schemas into one object
module.exports = (schemas_dir) => fs.readdirSync(schemas_dir).reduce(
	(acc, file) => _.merge(
		acc,
		require(path.join(schemas_dir, file))
	),
	{}
);
