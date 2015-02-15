module.exports = {


  friendlyName: 'Get home directory',


  description: 'Get the absolute path to the home directory of this computer (OS-agnostic)',


  sync: true,


  cacheable: true,


  inputs: {},


  defaultExit: 'success',


  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'Done.',
      example: '/Users/mikermcneil'
    }
  },


  fn: function(inputs, exits) {
    return exits.success(process.env[
      (process.platform == 'win32') ?
      'USERPROFILE' :
      'HOME'
    ]);
  },

};
