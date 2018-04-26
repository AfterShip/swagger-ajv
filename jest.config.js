'use strict';

module.exports = {
	rootDir:
		'src',
	moduleFileExtensions: [
		'js',
		'json'
	],
	testEnvironment:
		'node',
	moduleDirectories: [
		'node_modules',
		'<rootDir>'
	],
	collectCoverage: true,
	collectCoverageFrom: [
		'**/*.js'
	],
	coverageDirectory:
		'<rootDir>/../coverage',
	coverageReporters: [
		'text-summary'
	],
	coverageThreshold: {}
};
