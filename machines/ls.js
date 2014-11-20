module.exports = {
  friendlyName: 'List directory contents',
  description: 'List contents of a directory on the local filesystem.',
  cacheable: true,

  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },
    depth: {
      description: 'The maximum number of "hops" (i.e. directories deep) to include directory contents from.  For instance, if you are running `ls` on "foo/" which has a subdirectory "foo/bar/baz/", if `depth` is set to 2, the results will include "foo/bar/baz/", but none of the files/folders contained within.',
      example: 2
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {
      description: 'Triggered when a filesystem error occurs'
    },
    success: {
      example: [
        '/Users/mikermcneil/.tmp/foo/.gitignore'
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
      return exits.error(e);
    }
  }
};


