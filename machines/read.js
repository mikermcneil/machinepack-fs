module.exports = {
  friendlyName: 'Read file',
  description: 'Read file located at source path on disk into a string.',
  extendedDescription: 'Assumes file is encoded using utf8.',

  inputs: {
    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {},
    doesNotExist: {
      description: 'No file exists at the provided `source` path'
    },
    success: {
      example: 'stuff in a file!'
    }
  },

  fn: function (inputs, exits) {

    var fsx = require('fs-extra');

    fsx.readFile(inputs.source, function (err, contents) {
      if (err) {
        if (typeof err === 'object' && err.code === 'ENOENT') {
          return exits.doesNotExist();
        }
        // Some unrecognized error
        return exits.error(err);
      }
      return exits.success(contents);
    });
  }
};
