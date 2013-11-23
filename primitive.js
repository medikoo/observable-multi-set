'use strict';

module.exports = require('./_create')(
	require('observable-set/create-read-only')(
		require('observable-set/primitive')
	),
	require('es6-map/primitive')
);
