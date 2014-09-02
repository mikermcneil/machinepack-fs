/**
 * Module dependencies
 */

var path = require('path');
var fsx = require('fs-extra');
var _ = require('lodash');
var async = require('async');




module.exports = {
  id: 'write',
  machinepack: 'fs',
  description: 'Generate a file on disk using the specified string.',
  inputs: {
    string: {
      example: 'lots of words, utf8 things you know'
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar'
    },
    force: {
      description: 'overwrite existing file(s)?',
      type: 'boolean',
      defaultsTo: false
    }
  },
  exits: {
    error: {},
    success: {},
    alreadyExists: {
      example: {
        code: 'ENOENT'
      }
    }
  },

  fn: function ($i,cb) {

    $i = _.defaults($i, {
      force: false,
      dry: false
    });

    // Coerce `string` input into an actual string
    $i.string = $i.string||'';

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    $i.destination = path.resolve(process.cwd(), $i.destination);

    // Only override an existing file if `$i.force` is true
    fsx.exists($i.destination, function(exists) {
      if (exists && !$i.force) {
        return (cb.alreadyExists||cb.error)('Something else already exists at ::' + $i.destination);
      }

      // Don't actually write the file if this is a dry run.
      if ($i.dry) return cb.success();

      async.series([
        function deleteExistingFileIfNecessary(cb) {
          if (!exists) return cb();
          return fsx.remove($i.destination, cb);
        },
        function writeToDisk(cb) {
          fsx.outputFile($i.destination, $i.string, cb);
        }
      ], function (err){
        if (err) return cb(err);
        return cb();
      });

    });

  }
};
