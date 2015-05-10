module.exports = {


  friendlyName: 'Write JSON file',


  description: 'Write some data to the specified destination path on disk.',


  extendedDescription: 'Assumes file is encoded using utf8.',


  idempotent: true,


  inputs: {

    json: {
      typeclass: '*',
      description: 'The data to write to disk as JSON',
      required: true
    },

    destination: {
      example: '/Users/mikermcneil/.tmp/bar.json',
      description: 'Absolute path to the destination file (if relative path is provided, will resolve path from current working directory)',
      required: true
    },

    force: {
      description: 'Overwrite existing file(s)?',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    alreadyExists: {
      description: 'A file or folder already exists at the specified destination'
    },

    success: {
      description: 'JSON file written successfully.'
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
        return exits.alreadyExists('Something else already exists at ::' + inputs.destination);
      }

      async.series([
        function deleteExistingFileIfNecessary(next) {
          if (!exists) return next();
          return fsx.remove(inputs.destination, next);
        },
        function writeToDisk(next) {
          fsx.outputJson(inputs.destination, inputs.json, next);
        }
      ], function (err){
        if (err) return exits.error(err);
        return exits.success();
      });

    });
  }


};
