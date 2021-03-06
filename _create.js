'use strict';

var setPrototypeOf = require('es5-ext/object/set-prototype-of')
  , mixin          = require('es5-ext/object/mixin-prototypes')
  , forOf          = require('es6-iterator/for-of')
  , Map            = require('es6-map')
  , d              = require('d')
  , memoize        = require('memoizee/plain')
  , SetsSet        = require('./_sets-set')
  , multiSetSymbol = require('./symbol')

  , create = Object.create, defineProperties = Object.defineProperties
  , defineProperty = Object.defineProperty, getPrototypeOf = Object.getPrototypeOf;

module.exports = memoize(function (BaseSet, BaseMap) {
	var MultiSet = function (/*iterable, comparator*/) {
		var iterable = arguments[0], comparator = arguments[1], sets, self;
		if (!(this instanceof MultiSet)) throw new TypeError('Constructor requires \'new\'');
		self = new BaseSet(undefined, comparator);
		if (setPrototypeOf) setPrototypeOf(self, getPrototypeOf(this));
		else mixin(self, getPrototypeOf(this));
		sets = new SetsSet(self, iterable);
		defineProperties(self, {
			__map__: d(new BaseMap(undefined, comparator)),
			sets: d('', sets),
			__listeners__: d(new Map())
		});
		if (!sets.size) return self;
		sets.forEach(function (set) {
			var listener;
			set.forEach(function (value) {
				var count = (self.__map__.get(value) || 0) + 1;
				self.__map__.set(value, count);
				if (count > 1) return;
				self.$add(value);
			});
			set.on('change', listener = self._onChange.bind(self, set));
			self.__listeners__.set(set, listener);
		});
		return self;
	};
	if (setPrototypeOf) setPrototypeOf(MultiSet, BaseSet);

	MultiSet.prototype = create(BaseSet.prototype, {
		constructor: d(MultiSet),
		_onSetAdd: d(function (set) {
			var listener;
			this._postponed_ += 1;
			set.forEach(function (value) {
				var count = (this.__map__.get(value) || 0) + 1;
				this.__map__.set(value, count);
				if (count > 1) return;
				this._add(value);
			}, this);
			set.on('change', listener = this._onChange.bind(this, set));
			this.__listeners__.set(set, listener);
			this._postponed_ -= 1;
			return this;
		}),
		_onSetsClear: d(function (sets) {
			sets.forEach(function (set) {
				set.off('change', this.__listeners__.get(set));
			}, this);
			this.__map__.clear();
			this.__listeners__.clear();
			this._clear();
		}),
		_onSetDelete: d(function (set) {
			this._postponed_ += 1;
			set.forEach(function (value) {
				var count = this.__map__.get(value) - 1;
				if (count) {
					this.__map__.set(value, count);
					return;
				}
				this.__map__.delete(value);
				this._delete(value);
			}, this);
			set.off('change', this.__listeners__.get(set));
			this.__listeners__.delete(set);
			this._postponed_ -= 1;
			return true;
		}),
		_onChange: d(function (current, event) {
			var type = event.type, count;
			if (type === 'add') {
				count = (this.__map__.get(event.value) || 0) + 1;
				this.__map__.set(event.value, count);
				if (count > 1) return;
				this._add(event.value);
				return;
			}
			if (type === 'delete') {
				count = (this.__map__.get(event.value) || 0) - 1;
				if (count) {
					this.__map__.set(event.value, count);
					return;
				}
				this.__map__.delete(event.value);
				this._delete(event.value);
				return;
			}
			this._postponed_ += 1;
			if (type === 'clear') {
				if (this.__sets__.size === 1) {
					this.__map__.clear();
					this._postponed_ -= 1;
					this._clear();
					return;
				}
				this.__map__.forEach(function (count, value) {
					forOf(this.__sets__, function (set, doBreak) {
						if (set === current) return;
						if (set.has(value)) --count;
						if (!count) doBreak();
					});
					if (!count) return;
					--count;
					if (count) {
						this.__map__.set(value, count);
						return;
					}
					this.__map__.delete(value);
					this._delete(value);
				}, this);
			} else if (type === 'batch') {
				if (event.added) {
					event.added.forEach(function (value) {
						var count = (this.__map__.get(value) || 0) + 1;
						this.__map__.set(value, count);
						if (count > 1) return;
						this._add(value);
					}, this);
				}
				if (event.deleted) {
					event.deleted.forEach(function (value) {
						var count = this.__map__.get(value) - 1;
						if (count) {
							this.__map__.set(value, count);
							return;
						}
						this.__map__.delete(value);
						this._delete(value);
					}, this);
				}
			} else {
				this.__map__.forEach(function (count, value) {
					var nu = 0;
					forOf(this.__sets__, function (set, doBreak) {
						if (set.has(value)) ++nu;
						if (nu > count) doBreak();
					});
					if (nu === count) return;
					if (nu) {
						this.__map__.set(value, nu);
						return;
					}
					this.__map__.delete(value);
					this._delete(value);
				}, this);
				current.forEach(function (value) {
					if (this.has(value)) return;
					this.__map__.set(value, 1);
					this._add(value);
				}, this);
			}
			this._postponed_ -= 1;
		})
	});
	defineProperty(MultiSet.prototype, multiSetSymbol, d('', true));

	return MultiSet;
}, { normalizer: require('memoizee/normalizers/get-1')() });
