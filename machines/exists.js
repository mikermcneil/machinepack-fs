module.exports = {

  friendlyName: 'Check existence',


  description: 'Check whether a file or directory exists at the given path.',


  cacheable: true,


  inputs: {

    path: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The absolute path to the file or directory',
      required: true
    }

  },

  defaultExit: 'exists',

  exits: {
    error: {
      description: 'Unexpected error occurred'
    },
    doesNotExist: {
      description: 'The specified path is empty'
    },
    exists: {
      description: 'A file or directory exists at the specified path'
    }
  },

  fn: function (inputs, exits) {

    var Path = require('path');
    var fsx = require('fs-extra');

    fsx.exists(Path.resolve(process.cwd(),inputs.path), function(exists) {
      if (!exists) {return exits.doesNotExist();}
      return exits.exists();
    });
  }
};


