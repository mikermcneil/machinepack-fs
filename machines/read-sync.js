module.exports = {


  friendlyName: 'Read file (sync)',


  description: 'Read a file on disk as a string.',


  extendedDescription: 'Assumes file contents are encoded using utf8. This machine should **NEVER** be used in request handling code!',


  sync: true,


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
      outputExample: 'stuff in a file!',
      outputFriendlyName: 'File contents',
      outputDescription: 'The contents of the file at the `source` path.'
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

    var contents;
    try {
      contents = fs.readFileSync(inputs.source, 'utf8');
      // It worked!
      return exits.success(contents);
    }
    catch (e) {
      if (e.code === 'ENOENT') {
        return exits.doesNotExist();
      }
      // Some unrecognized error
      return exits.error(err);
    }
  }

};
