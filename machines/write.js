module.exports = {

  identity: 'write',
  friendlyName: 'write',
  description: 'Generate a file on disk using the specified string.',
  cacheable: false,

  inputs: {
    string: {
      example: 'lots of words, utf8 things you know',
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    },
    force: {
      description: 'overwrite existing file(s)?',
      example: false
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {},
    success: {},
    alreadyExists: {
      example: {
        code: 'ENOENT'
      }
    }
  },

  fn: function (inputs, exits) {

    var path = require('path');
    var fsx = require('fs-extra');
    var _ = require('lodash');
    var async = require('async');

    inputs = _.defaults(inputs, {
      force: false,
      dry: false
    });

    // Coerce `string` input into an actual string
    inputs.string = inputs.string || '';

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.destination = path.resolve(process.cwd(), inputs.destination);

    // Only override an existing file if `inputs.force` is true
    fsx.exists(inputs.destination, function(exists) {
      if (exists && !inputs.force) {
        return (exits.alreadyExists||exits.error)('Something else already exists at ::' + inputs.destination);
      }

      // Don't actually write the file if this is a dry run.
      if (inputs.dry) return exits.success();

      async.series([
        function deleteExistingFileIfNecessary(exits) {
          if (!exists) return exits();
          return fsx.remove(inputs.destination, exits);
        },
        function writeToDisk(exits) {
          fsx.outputFile(inputs.destination, inputs.string, exits);
        }
      ], function (err){
        if (err) return exits(err);
        return exits();
      });

    });

  }
};
