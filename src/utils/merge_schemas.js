'use strict';

const {merge, chain} = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * read directory recursively
 * @param  {string} dir    - absolutePath for the dir
 * @return {Array<String>} - an array of all absolutePath for the directory
 */
const readdirRecursive = dir => chain(fs.readdirSync(dir))
	.map(file => {
		const absolutePath = path.resolve(dir, file);
		if (fs.lstatSync(absolutePath).isDirectory()) {
			return readdirRecursive(absolutePath);
		}
		return absolutePath;
	})
	.flattenDeep()
	.value();

module.exports = schemasDir => readdirRecursive(schemasDir)
	.reduce(
		(acc, file) => merge(
			acc,
			require(file)
		),
		{}
	);
