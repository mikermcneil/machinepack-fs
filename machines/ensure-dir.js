module.exports = {


  friendlyName: 'Ensure directory',


  description: 'Ensure that the directory exists. If the directory structure does not exist, it is created.',


  idempotent: true,


  inputs: {

    dir: {
      example: '/foo/bar/baz',
      description: 'The path to ensure- if nothing exists, a directory will be created here.',
      extendedDescription: 'If a relative path is provided, it will be resolved to an absolute path using the current working directory.',
      required: true
    }

  },


  exits: {

    success: {
      description: 'Directory was either just created, or already existed, at the specified path.'
    }

  },


  fn: function(inputs, exits) {
    var fsx = require('fs-extra');

    // In case we ended up w/ a relative path, make it absolute.
    inputs.dir = require('path').resolve(process.cwd(), inputs.dir);

    fsx.ensureDir(inputs.dir, function(err) {
      if (err) return exits.error(err);
      return exits.success();
    });
  }


};
