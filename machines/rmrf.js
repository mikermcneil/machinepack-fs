module.exports = {


  friendlyName: 'Remove (rm)',


  description: 'Completely remove a file or directory (like rm -rf).',


  extendedDescription: 'If the provided path is a directory, all contents will be removed recursively. If nothing exists at the provided path, the success exit will be triggered, but nothing will be deleted.',


  idempotent: true,


  inputs: {

    dir: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The absolute path to the file or directory to remove',
      required: true
    }

  },


  exits: {

    success: {
      description: 'Done.'
    }

  },

  fn: function (inputs, exits) {

    var fsx = require('fs-extra');

    fsx.remove(inputs.dir, function(err) {
      if (err) {return exits.error(err);}
      return exits.success();
    });
  }
};


