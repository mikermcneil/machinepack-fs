# machinepack-fs

Machines for working with the local filesystem.

## Installation

```sh
$ npm install machinepack-fs
```

## Basic Usage

```javascript
var Filesystem = require('machinepack-fs');

Filesystem.ls({
  dir: '/blah/foo/bar'
})
.exec(function (err, result) {
  // ...
});
```

For more info about working with machines, see the [node-machine.org](http://node-machine.org).


## License

MIT &copy; Mike McNeil 2014
