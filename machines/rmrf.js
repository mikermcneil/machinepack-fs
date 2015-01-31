module.exports = {

  friendlyName: 'Delete file or directory',
  description: 'Completely remove a file or directory (like rm -rf).',
  extendedDescription: 'If the provided path is a directory, all contents will be removed recursively.',

  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The absolute path to the file or directory to remove',
      required: true
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {},
    success: {}
  },

  fn: function (inputs, exits) {

    var fsx = require('fs-extra');

    fsx.remove(inputs.dir, function(err) {
      if (err) {return exits.error(err);}
      return exits.success();
    });
  }
};


