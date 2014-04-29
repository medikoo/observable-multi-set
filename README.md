# observable-multi-set

## Configure observable multi set collections

It's about collection of values that are held in collection of sets.
Sets can be added and removed during runtime, appropriate events propagation is assured.

### Stands on native ES6 set collections

Check [es6-set](https://github.com/medikoo/es6-set) for appropriate shim for ES5 world

### Installation

	$ npm install observable-multi-set

To port it to Browser or any other (non CJS) environment, use your favorite CJS bundler. No favorite yet? Try: [Browserify](http://browserify.org/), [Webmake](https://github.com/medikoo/modules-webmake) or [Webpack](http://webpack.github.io/)

### Usage

```javascript
var MultiSet = require('observable-multi-set');

var set1 = new Set(['raz', 'dwa']), set2 = new Set(['trzy', 'raz']);
var mset = new MultiSet([set1, set2]);

mset.sets; // { set1, set2 }
mset;      // { 'raz', 'dwa', 'trzy' }

mset.on('change', function (event) {
  if (event.type === 'add') console.log("Added:", event.value);
  else if (event.type === 'delete') console.log("Deleted:", event.value);
  else if (event.type === 'clear') console.log("Set cleared");
  else if (event.type === 'batch') console.log("Batch change: Added: " + event.added ", Deleted: " + event.deleted);
});

set1.add('cztery'); // Added: trzy
set2.add('pięć');   // Added: pięć
set2.add('dwa');    // (ignored)
set1.delete('raz'); // (ignored)
set2.delete('raz'); // Deleted: 'raz'

mset.sets.add(new Set(['cztery', 'siedem', 'osiem'])); // Batch: Added: ['siedem, 'osiem' ]
mset.sets.delete(set2);                                // Batch: Deleted: ['trzy', 'pięć']

try {
  mset.add('other value'); // throws
} catch (e) {
  console.log("Multi set is read only");
}
```

## Tests [![Build Status](https://travis-ci.org/medikoo/observable-multi-set.png)](https://travis-ci.org/medikoo/observable-multi-set)

	$ npm test
