'use strict';

var isObservableSet = require('observable-set/is-observable-set')
  , multiSetSymbol  = require('./symbol');

module.exports = function (value) {
	return isObservableSet(value) && Boolean(value[multiSetSymbol]);
};
