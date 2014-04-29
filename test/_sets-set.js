'use strict';

var toArray  = require('es5-ext/array/to-array')
  , Set      = require('observable-set')
  , MultiSet = require('../');

module.exports = function (t, a) {
	var s1 = new Set(['raz', 'dwa', 'trzy', 'pięć', 'dziewięć'])
	  , s2 = new Set(['dwa', 'pięć', 'sześć', 'raz'])
	  , s3 = new Set(['raz', 'osiem', 'pięć', 'dziewięć'])
	  , set = new MultiSet([s1, s2]);

	a.deep(toArray(set), ['raz', 'dwa', 'trzy', 'pięć', 'dziewięć', 'sześć'],
		"Content");

	set.sets.add(s3);
	a.deep(toArray(set), ['raz', 'dwa', 'trzy', 'pięć', 'dziewięć', 'sześć',
		'osiem'], "Add set");

	set.sets.delete(s2);
	a.deep(toArray(set), ['raz', 'dwa', 'trzy', 'pięć', 'dziewięć', 'osiem'],
		"Delete set");

	set.sets.delete(s1);
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem'], "Delete set #2");

	set.sets.add(s2);
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć'],
		"Re-add set");

	set.sets.add(s1);
	a.deep(toArray(set), ['raz', 'pięć', 'dziewięć', 'osiem', 'dwa', 'sześć',
		'trzy'], "Re-add set #2");

	set.sets.clear();
	a.deep(toArray(set), [], "Clear");
};
