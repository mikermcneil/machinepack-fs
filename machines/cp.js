module.exports = {


  friendlyName: 'Copy (cp)',


  description: 'Copy file or directory located at source path to the destination path.',


  extendedDescription: 'Includes all of its descendant files and directories (i.e. `cp -r`).  Any existing file at the destination path will be overwritten.',


  inputs: {

    source: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'The path (relative or absolute) to the file or directory to copy.',
      required: true
    },

    destination: {
      example: '/Users/mikermcneil/.tmp/bar',
      description: 'The path (relative or absolute) to the directory in which to place the copied file(s).',
      extendedDescription: 'When copying a single file, a target filename may be specified.',
      required: true
    }

  },


  exits: {

    doesNotExist: {
      description: 'No file or folder exists at the provided souce path.'
    }

  },

  fn: function (inputs, exits) {
    var path = require('path');
    var fsx = require('fs-extra');

    fsx.copy(path.resolve(inputs.source), path.resolve(inputs.destination), function (err) {
      if (err) {
        if (err.code === 'ENOENT') {
          return exits.doesNotExist();
        }
        return exits.error(err);
      }
      return exits.success();
    });
  }
};
