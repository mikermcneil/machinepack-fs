module.exports = {


  friendlyName: 'Create directory',


  description: 'Create a new directory.',


  inputs: {

    destination: {
      description: 'The destination path where the new directory should be created.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path using the current working directory.',
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    },

    force: {
      description: 'Whether or not to overwrite a file or directory which already exists at the specified destination.',
      example: true
    }

  },


  defaultExit: 'success',


  exits: {

    error: {},

    success: {},

    alreadyExists: {
      description: 'Something already exists at the specified path (overwrite by enabling the `force` input)'
    }

  },


  fn: function (inputs, exits) {

    var path = require('path');
    var fsx = require('fs-extra');
    var _ = require('lodash');
    var async = require('async');

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
        function deleteExistingFileIfNecessary(next) {
          if (!exists) return next();
          return fsx.remove(inputs.destination, next);
        },
        function writeToDisk(next) {
          fsx.mkdirs(inputs.destination, next);
        }
      ], function (err){
        if (err) return exits.error(err);
        return exits.success();
      });

    });

  }


};
