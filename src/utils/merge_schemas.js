'use strict';

const {merge, chain, set} = require('lodash');
const fs = require('fs');
const path = require('path');

const trimExt = filePath => {
	const parsedFilePath = path.parse(filePath);
	return `${parsedFilePath.dir}/${parsedFilePath.name}`;
};

const parseDirStructure = (absoluteRootPath, absoluteFilePath) => (
	trimExt(absoluteFilePath)
		.replace(`${absoluteRootPath}/`, '')
		.split('/')
);

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

module.exports = (schemasDir, {
	useDirStructure = false
} = {}) => {
	const absoluteSchemasPath = path.resolve(schemasDir);

	return readdirRecursive(schemasDir)
		.reduce(
			(acc, file) => merge(
				acc,
				useDirStructure
					? set({}, parseDirStructure(absoluteSchemasPath, file), require(file))
					: require(file)
			),
			{}
		);
};

module.exports.parseDirStructure = parseDirStructure;
module.exports.readdirRecursive = readdirRecursive;
