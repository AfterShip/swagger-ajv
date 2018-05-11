'use strict';

const {parseDirStructure} = require('../merge_schemas');

describe('parseDirStructure', () => {
	it('should trim root path from file path and parse it to nested object key string', () => {
		const rootPath = '/root';
		const filePath = '/root/a.a/b/file.small.json';
		expect(parseDirStructure(rootPath, filePath)).toEqual(['a.a', 'b', 'file.small']);
	});
});
