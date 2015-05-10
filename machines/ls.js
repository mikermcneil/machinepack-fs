module.exports = {


  friendlyName: 'List directory contents',


  description: 'List contents of a directory on the local filesystem.',


  cacheable: true,


  inputs: {

    dir: {
      friendlyName: 'Directory path',
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'Path to the directory whose contents should be listed.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path from the context of the current working directory.',
      required: true
    },

    depth: {
      friendlyName: 'Max depth',
      description: 'The maximum number of "hops" (i.e. directories deep) to include directory contents from.',
      extendedDescription: 'For instance, if you are running `ls` on "foo/" which has a subdirectory "foo/bar/baz/", if `depth` is set to 2, the results will include "foo/bar/baz/", but none of the files/folders contained within.',
      example: 2,
      defaultsTo: 2
    },

    includeFiles: {
      friendlyName: 'Include files?',
      description: 'Whether or not to include files in result array.',
      example: true,
      defaultsTo: true
    },

    includeDirs: {
      friendlyName: 'Include directories?',
      description: 'Whether or not to include directories in result array.',
      example: true,
      defaultsTo: true
    },

    includeSymlinks: {
      friendlyName: 'Include symlinks?',
      description: 'Whether or not to include symbolic links in result array.',
      example: true,
      defaultsTo: true
    }

  },


  exits: {

    success: {
      variableName: 'dirContents',
      example: [
        '/Users/mikermcneil/.tmp/foo/.gitignore'
      ]
    }

  },


  fn: function (inputs, exits) {
    var path = require('path');
    var Walker = require('walker');

    // Ensure we've got an absolute path.
    inputs.dir = path.resolve(inputs.dir);

    // Determine the depth of the top-level directory we're walking,
    // for comparison later on.
    var topLvlDirDepth = inputs.dir.split(path.sep).length;

    // Initialize the walker and teach it to skip directories that are
    // deeper than requested.
    var walker = Walker(inputs.dir);
    walker.filterDir(function(dir, stat) {
      if (dir.split(path.sep).length > (topLvlDirDepth + inputs.depth)) {
        return false;
      }
      return true;
    });

    // Accumulate results array by listing file, directory, and/or symlink
    // entries from the specified directory.
    var results = [];
    if (inputs.includeFiles) {
      walker.on('file', function (entry, stat) {
        // Filter out files that are deeper than requested
        if (entry.split(path.sep).length <= (topLvlDirDepth + inputs.depth)) {
          results.push(entry);
        }
      });
    }
    if (inputs.includeDirs) {
      walker.on('dir', function (entry, stat) {
        if (entry===inputs.dir) return;
        results.push(entry);
      });
    }
    if (inputs.includeSymlinks) {
      walker.on('symlink', function (entry, stat) {
        if (entry===inputs.dir) return;
        results.push(entry);
      });
    }

    // When walking is done, because of an error or otherwise,
    // return the results.
    var spinlock;
    walker.on('error', function (err){
      if (spinlock) return;
      spinlock = true;
      return exits.error(err);
    });
    walker.on('end', function (){
      if (spinlock) return;
      spinlock = true;
      return exits.success(results);
    });
  }
};


