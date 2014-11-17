module.exports = {

  identity: 'ls',
  friendlyName: 'ls',
  description: 'List directory contents',
  cacheable: true,

  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'Path (relative or absolute) to the directory whose contents should be listed.',
      required: true
    },
    depth: {
      description: 'The maximum number of "hops" (i.e. directories deep) to include directory contents from.  For instance, if you are running `ls` on "foo/" which has a subdirectory "foo/bar/baz/", if `depth` is set to 2, the results will include "foo/bar/baz/", but none of the files/folders contained within.',
      example: 2,
      defaultsTo: 1000
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

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

  fn: function (inputs, exits) {

    var ls = require('list-directory-contents');

    try {
      if (typeof inputs.depth !== 'undefined') {
        return exits.error('`depth` input is not supported yet!  Please consider contributing :)');
      }

      return ls(inputs.dir, exits);
    }
    catch(e){
      return exits(e);
    }
  }
};


