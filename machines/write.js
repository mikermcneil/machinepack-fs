module.exports = {


  friendlyName: 'Write file',


  description: 'Generate a file on the local filesystem using the specified utf8 string as its contents.',


  idempotent: true,


  inputs: {

    string: {
      description: 'Text to write to the file (if omitted, will create an empty file)',
      example: 'lots of words, utf8 things you know',
    },

    destination: {
      description: 'Path (relative or absolute) to the file to write.',
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    },

    force: {
      description: 'Whether to overwrite existing file(s) which might exist at the destination path.',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    alreadyExists: {
      description: 'Something already exists at the specified path (overwrite by enabling the `force` input)'
    },

    success: {
      description: 'OK.'
    }

  },


  fn: function (inputs, exits) {

    var path = require('path');
    var fsx = require('fs-extra');
    var _ = require('lodash');
    var async = require('async');

    // Coerce `string` input into an actual string
    inputs.string = inputs.string || '';

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.destination = path.resolve(inputs.destination);

    // Only override an existing file if `inputs.force` is true
    fsx.exists(inputs.destination, function(exists) {
      if (exists && !inputs.force) {
        return (exits.alreadyExists||exits.error)('Something else already exists at ::' + inputs.destination);
      }

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
