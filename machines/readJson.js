module.exports = {
  friendlyName: 'Read file as JSON',
  description: 'Read JSON file located at source path on disk into a JavaScript object or array.',
  extendedDescription: 'Assumes file is encoded using utf8.',

  inputs: {
    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    }
  },

  defaultExit: 'success',

  exits: {
    error: {},
    doesNotExist: {
      description: 'No file exists at the provided `source` path'
    },
    couldNotParse: {
      description: 'Could not parse file as JSON.'
    },
    success: {
      description: 'Returns the data stored in file at `source` path'
    }
  },

  fn: function (inputs, exits) {

    var fsx = require('fs-extra');

    fsx.readJson(inputs.source, function (err, json) {
      if (err) {
        if (typeof err === 'object' && err.code === 'ENOENT') {
          return exits.doesNotExist(err);
        }
        if (typeof err === 'object' && err.type === 'unexpected_token') {
          return exits.couldNotParse(err);
        }
        // Some unrecognized error
        return exits.error(err);
      }

      return exits.success(contents);
    });
  }
};
