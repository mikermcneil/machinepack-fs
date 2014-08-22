/**
 * Module dependencies
 */

var fsx = require('fs-extra');




module.exports = {
  id: 'cp',
  machinepack: 'fs',
  description: 'Copy file or directory located at source path to the destination path, including all of its descendant files and directories (i.e. `cp -r`)',
  nosideeffects: true,
  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/foo'
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar'
    }
  },
  exits: {
    error: {},
    success: {}
  },
  fn: function ($i,$x) {
    fsx.copy($i.source, $i.destination, function (err) {
      if (err) return $x.error(err);
      return $x.success();
    });
  }
};


