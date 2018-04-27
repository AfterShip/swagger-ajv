
'use strict';

const path = require('path');
const pug = require('pug');

module.exports = schemas => pug.renderFile(path.resolve(__dirname, '../../views/docs.pug'), {
	spec: schemas
});
