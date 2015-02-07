module.exports = {
  friendlyName: 'List directory contents',
  description: 'List contents of a directory on the local filesystem.',
  cacheable: true,

  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'Absolute path to the directory whose contents should be listed (if relative path provided, will be resolved from cwd).',
      required: true
    },
    depth: {
      description: 'The maximum number of "hops" (i.e. directories deep) to include directory contents from.  For instance, if you are running `ls` on "foo/" which has a subdirectory "foo/bar/baz/", if `depth` is set to 2, the results will include "foo/bar/baz/", but none of the files/folders contained within.',
      example: 2
    },
    types: {
      description: 'The types of directory entries to return (defaults to ["all"])',
      example: ['file'],
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

    var path = require('path');

    try {

      // Ensure we've got an absolute path
      inputs.dir = path.resolve(inputs.dir);

      var spinlock;
      var results = [];

      // Default depth to 0 (infinite recursion)
      var depth = inputs.depth || 0;

      // Get the depth of the directory we're walking, for comparison
      var dirDepth = inputs.dir.split(path.sep).length;

      // Default types to "all"
      var types = inputs.types || 'all';

      // Initialize the walker
      var walker = require('walker')(inputs.dir)

      // Skip directories that are deeper than requested
      .filterDir(function(dir, stat) {
        if (depth && dir.split(path.sep).length > (dirDepth + depth)) {
          return false;
        }
        return true;
      })
      // Handle errors
      .on('error', function (err){
        if (spinlock) return;
        spinlock = true;
        return exits.error(err);
      })
      // When walking is done, return the results
      .on('end', function (){
        if (spinlock) return;
        spinlock = true;
        return exits.success(results);
      });

      // Include file entries if requested
      if (types == 'all' || types.indexOf('file') > -1) {
        walker.on('file', function (entry, stat) {
          // Filter out files that are deeper than requested
          if (!depth || (entry.split(path.sep).length <= (dirDepth + depth))) {
            results.push(entry);
          }
        });
      }

      // Include directory entries if requested
      if (types == 'all' || types.indexOf('dir') > -1) {
        walker.on('dir', function (entry, stat) {
          if (entry===inputs.dir) return;
          results.push(entry);
        });
      }

      // Include symlink entries if requested
      if (types == 'all' || types.indexOf('symlink') > -1) {
        walker.on('symlink', function (entry, stat) {
          if (entry===inputs.dir) return;
          results.push(entry);
        });
      }
    }
    catch(e){
      return exits.error(e);
    }
  }
};


