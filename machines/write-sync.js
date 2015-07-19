module.exports = {


  friendlyName: 'Write file (sync)',


  description: 'Generate a file on the local filesystem using the specified utf8 string as its contents.',


  sync: true,


  idempotent: true,


  inputs: {

    string: {
      description: 'Text to write to the file (if omitted, will create an empty file)',
      example: 'lots of words, utf8 things you know',
    },

    destination: {
      description: 'Path (relative or absolute) to the file to write.',
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    },

    force: {
      description: 'Whether to overwrite existing file(s) which might exist at the destination path.',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    alreadyExists: {
      description: 'Something already exists at the specified path (overwrite by enabling the `force` input)'
    },

    success: {
      description: 'OK.'
    }

  },


  fn: function (inputs, exits) {
    var path = require('path');
    var fs = require('fs');
    var fsx = require('fs-extra');

    // Coerce `string` input into an actual string
    inputs.string = inputs.string || '';

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.destination = path.resolve(inputs.destination);

    // Only override an existing file if `inputs.force` is true
    if (inputs.force) {
      fsx.outputFileSync(inputs.destination, inputs.string);
      return exits.success();
    }

    // Otherwise don't override existing files.
    if (fs.existsSync(inputs.destination)) {
      // TODO: Some time before fs.existsSync() is deprecated in
      // Node core, switch this to use a different strategy.
      // See `https://nodejs.org/api/fs.html#fs_fs_exists_path_callback`
      return exits.alreadyExists();
    }
    fs.writeFileSync(inputs.destination, inputs.string);
    return exits.success();

  }


};
