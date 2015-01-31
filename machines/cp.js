module.exports = {
  friendlyName: 'Copy file or directory',
  description: 'Copy file or directory located at source path to the destination path.',
  extendedDescription: 'Includes all of its descendant files and directories (i.e. `cp -r`)',

  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The path (relative or absolute) to the file or directory to copy.',
      required: true
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar',
      description: 'The path (relative or absolute) to the directory in which to place the copied file(s).  When copying a single file, a target filename may be specified.',
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

    fsx.copy(inputs.source, inputs.destination, function (err) {
      if (err) return exits.error(err);
      return exits.success();
    });
  }
};
