module.exports = {
  friendlyName: 'Move file or directory',
  description: 'Move file or directory located at source path to the destination path.',
  extendedDescription: '',
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
  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'Done.'
    }
  },
  fn: function(inputs, exits) {
    var fsx = require('fs-extra');

    fsx.move(inputs.source, inputs.destination, function (err) {
      if (err) return exits.error(err);
      return exits.success();
    });
  },

};
