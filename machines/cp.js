module.exports = {

  identity: 'cp',
  friendlyName: 'cp',
  description: 'Copy file or directory located at source path to the destination path.',
  extendedDescription: 'Includes all of its descendant files and directories (i.e. `cp -r`)',
  cacheable: false,

  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar',
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
