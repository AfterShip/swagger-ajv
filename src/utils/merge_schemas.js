'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * read directory recursively
 * @param  {string} dir    - absolutePath for the dir
 * @return {Array<String>} - an array of all absolutePath for the directory
 */
const readdirRecursive = dir => _.chain(fs.readdirSync(dir))
	.map(file => {
		const absolutePath = path.resolve(dir, file);
		if (fs.lstatSync(absolutePath).isDirectory()) {
			return readdirRecursive(absolutePath);
		}
		return absolutePath;
	})
	.flattenDeep()
	.value();

module.exports = schemas_dir => readdirRecursive(schemas_dir)
	.reduce(
		(acc, file) => _.merge(
			acc,
			require(file)
		),
		{}
	);
