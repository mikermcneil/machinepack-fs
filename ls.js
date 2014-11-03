/**
 * Module dependencies
 */

var ls = require('list-directory-contents');




module.exports = {
  description: 'List directory contents',
  noSideEffects: true,
  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },
    depth: {
      description: 'The maximum number of "hops" (i.e. directories deep) to include directory contents from.  For instance, if you are running `ls` on "foo/" which has a subdirectory "foo/bar/baz/", if `depth` is set to 2, the results will include "foo/bar/baz/", but none of the files/folders contained within.',
      example: 2,
      defaultsTo: 1000
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
      if (typeof $i.depth !== 'undefined') {
        return $x.error('`depth` input is not supported yet!  Please consider contributing :)');
      }

      return ls($i.dir, $x);
    }
    catch(e){
      return $x(e);
    }
  }
};


