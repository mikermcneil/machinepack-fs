# machinepack-git

Machines for working with the `git` command line interface.

**IMPORTANT**: This module requires an accessible `git` in the $PATH to work.


## Installation

```sh
$ npm install node-machine
$ npm install machinepack-git
```

## Basic Usage

```javascript
var M = require('node-machine');

M.require('machinepack-git/'+MACHINE_ID_HERE)
.configure(INPUT_VALUES_HERE)
.exec(EXIT_HANDER_HERE);
```

For more info about working with machines, see the [node-machine repo](http://github.com/mikermcneil/node-machine).


## License

MIT &copy; Mike McNeil 2014
