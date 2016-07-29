module.exports = {


  friendlyName: 'Does filepath exist?',


  description: 'Check whether a file or directory exists at the given path.',


  sideEffects: 'cacheable',


  inputs: {

    path: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The path to the file or directory to check.',
      extendedDescription: 'If a relative path is given, it will be resolved from the current working directory.',
      required: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'Filepath exists?',
      outputDescription: 'Whether or not there is a file or directory at the specified path.',
      outputExample: true
    },

  },

  fn: function (inputs, exits) {

    // Import `path` and `fs-extra`.
    var Path = require('path');
    var fsx = require('fs-extra');
    // Determine if the directory in question exists.
    fsx.exists(Path.resolve(process.cwd(),inputs.path), function(exists) {

      // If not, return `false` through the `success` exit.
      if (!exists) {return exits.success(false);}

      // Otherwise return `true` through the `success` exit.
      return exits.success(true);
    });
  }


};


