module.exports = {


  friendlyName: 'Read file',


  description: 'Read a file on disk as a string.',


  extendedDescription: 'Assumes file contents are encoded using utf8.',


  sideEffects: 'cacheable',


  inputs: {

    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory).',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'File contents',
      outputExample: 'stuff in a file!',
      outputDescription: 'The contents of the file at the specified `source` path.'
    },

    doesNotExist: {
      description: 'No file exists at the provided `source` path.'
    },

  },


  fn: function (inputs, exits) {
    var path = require('path');
    var fs = require('fs');

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.source = path.resolve(inputs.source);

    fs.readFile(inputs.source, 'utf8', function (err, contents) {
      // It worked!
      if (!err) {
        return exits.success(contents);
      }
      // No need for `null` check here because we already know `err` is falsy
      if (typeof err === 'object' && err.code === 'ENOENT') {
        return exits.doesNotExist();
      }
      // Some unrecognized error
      return exits.error(err);
    });
  }
};
