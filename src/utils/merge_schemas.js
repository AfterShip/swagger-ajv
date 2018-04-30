'use strict';

const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * read file
 * @param  {string} dir - absolutePath for the dir
 * @return {Array<String>}     - an array of all absolutePath for the directory
 */
function readDirRecursively(dir) {
	return _.chain(fs.readdirSync(dir))
		.map(file => {
			const absolutePath = path.resolve(dir, file);
			if (fs.lstatSync(absolutePath).isDirectory()) {
				return readDirRecursively(absolutePath);
			}
			return absolutePath;
		})
		.flattenDeep()
		.value();
}

module.exports = (schemas_dir) => readDirRecursively(schemas_dir)
	.reduce(
		(acc, file) => _.merge(
			acc,
			require(file)
		),
		{}
	);
