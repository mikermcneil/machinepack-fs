/**
 * Module dependencies
 */

var ls = require('list-directory-contents');




module.exports = {
  id: 'ls',
  moduleName: 'machinepack-fs',
  description: 'List directory contents',
  transparent: true,
  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo'
    }
  },
  exits: {
    error: {},
    success: {
      example: [
        '/Users/mikermcneil/.tmp/foo/.gitignore',
        '/Users/mikermcneil/.tmp/foo/README.md',
        '/Users/mikermcneil/.tmp/foo/bar/',
        '/Users/mikermcneil/.tmp/foo/bar/index.html',
        '/Users/mikermcneil/.tmp/foo/bar/favicon.ico',
        '/Users/mikermcneil/.tmp/foo/bar/images/logo.png'
      ]
    }
  },
  fn: function ($i,$x) {
    try {
      return ls($i.dir, $x);
    }
    catch(e){
      return $x(e);
    }
  }
};


