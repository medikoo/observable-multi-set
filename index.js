'use strict';

module.exports = require('./_create')(
	require('observable-set/create-read-only')(require('observable-set')),
	require('es6-map')
);
