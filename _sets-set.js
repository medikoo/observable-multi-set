'use strict';

var setPrototypeOf     = require('es5-ext/object/set-prototype-of')
  , mixin              = require('es5-ext/object/mixin-prototypes')
  , iterator           = require('es6-iterator/valid-iterable')
  , forOf              = require('es6-iterator/for-of')
  , toArray            = require('es5-ext/array/to-array')
  , Set                = require('es6-set')
  , d                  = require('d')
  , validObservableSet = require('observable-set/valid-observable-set')

  , defineProperty = Object.defineProperty, getPrototypeOf = Object.getPrototypeOf
  , add = Set.prototype.add, clear = Set.prototype.clear, del = Set.prototype.delete
  , SetsSet;

module.exports = SetsSet = function (multiSet, iterable) {
	var sets, set;
	if (!(this instanceof SetsSet)) throw new TypeError('Constructor requires \'new\'');
	if (iterable != null) {
		iterator(iterable);
		sets = [];
		forOf(iterable, function (value) {
			sets.push(validObservableSet(value));
		});
	}
	set = new Set(sets);
	if (setPrototypeOf) setPrototypeOf(set, getPrototypeOf(this));
	else mixin(set, getPrototypeOf(this));
	defineProperty(set, '__master__', d('', multiSet));
	return set;
};
if (setPrototypeOf) setPrototypeOf(SetsSet, Set);

SetsSet.prototype = Object.create(Set.prototype, {
	constructor: d(SetsSet),
	add: d(function (set) {
		if (this.has(validObservableSet(set))) return this;
		add.call(this, set);
		this.__master__._onSetAdd(set);
		return this;
	}),
	clear: d(function () {
		var sets;
		if (!this.size) return;
		sets = toArray(this);
		clear.call(this);
		this.__master__._onSetsClear(sets);
	}),
	delete: d(function (set) {
		if (!this.has(set)) return false;
		del.call(this, set);
		this.__master__._onSetDelete(set);
		return true;
	})
});
