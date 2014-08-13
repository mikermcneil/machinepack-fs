/**
 * Module dependencies
 */

var fsx = require('fs-extra');




module.exports = {
  id: 'rmrf',
  moduleName: 'machinepack-fs',
  description: 'Remove a directory and all contents',
  transparent: true,
  inputs: {
    dir: {
      example: '/Users/mikermcneil/.tmp/foo'
    },
    sync: {
      example: true
    }
  },
  exits: {
    error: {},
    success: {}
  },
  fn: function (inputs,exits) {
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


