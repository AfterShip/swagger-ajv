'use strict';

const {merge, chain, set} = require('lodash');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const trimExt = filePath => {
	const {dir, name} = path.parse(filePath);
	return path.join(dir, name);
};

const parseDirStructure = (absoluteRootPath, absoluteFilePath) => {
	const [, ...dirStructure] = trimExt(absoluteFilePath)
		.replace(absoluteRootPath, '')
		.split(path.sep);
	return dirStructure;
};

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

function loadSchema(file) {
	const extname = path.extname(file);
	switch (extname) {
		case '.js':
		case '.json':
			return require(file);
		case '.yml':
		case '.yaml':
			return yaml.safeLoad(fs.readFileSync(file, 'utf8'));
		default:
			throw new Error(`${extname} not supported in swagger-ajv`);
	}
}

module.exports = function mergeSchemas(schemasDir, {
	useDirStructure = false,
} = {}) {
	const absoluteSchemasPath = path.resolve(schemasDir);

	const schemas = readdirRecursive(schemasDir)
		.reduce(
			(acc, file) => merge(
				acc,
				useDirStructure
					? set({}, parseDirStructure(absoluteSchemasPath, file), loadSchema(file))
					: loadSchema(file),
			),
			{},
		);

	return {
		ajv: schemas,
		swagger: formatSwagger(schemas),
	};
};

module.exports.parseDirStructure = parseDirStructure;
module.exports.readdirRecursive = readdirRecursive;

function formatSwagger(schemas) {
	return JSON.parse(JSON.stringify(schemas), (k, v) => {
		if (k === 'type' && Array.isArray(v)) {
			if (v.length > 2) {
				throw new TypeError('type accepts <type> OR [<type>, "null"]');
			}

			if (v[1] === 'null') {
				return v[0];
			}

			throw new TypeError('type accepts <type> OR [<type>, "null"]');
		}

		return v;
	});
}
