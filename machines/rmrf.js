module.exports = {

  identity: 'rmrf',
  friendlyName: 'rmrf',
  description: 'Remove a directory and all contents (including subdirectories)',
  cacheable: false,

  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'Path (relative or absolute) to the directory to be removed.',
      required: true
    },
    sync: {
      description: 'Whether to process the removal synchronously (defaults to false).',
      example: true
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

    if (inputs.sync === true) {
      try {
        fsx.removeSync(inputs.dir);
        return exits.success();
      } catch(e) {
        return exits.error(e);
      }
    }

    fsx.remove(inputs.dir, function(err) {
      if (err) {return exits.error(err);}
      return exits.success();
    });
  }
};


