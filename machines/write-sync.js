module.exports = {


  friendlyName: 'Write file (sync)',


  description: 'Generate a file on the local filesystem using the specified utf8 string as its contents.',


  extendedDescription: 'Encodes file contents as utf8. This machine should **NEVER** be used in request handling code!',


  sync: true,


  sideEffects: 'idempotent',


  inputs: {

    string: {
      description: 'Text to write to the file (if omitted, will create an empty file).',
      example: 'lots of words, utf8 things you know',
      defaultsTo: ''
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

    success: {
      description: 'File written successfully.'
    },

    alreadyExists: {
      description: 'An existing file / folder was found at the specified path (overwrite by enabling the `force` input).'
    },

  },


  fn: function (inputs, exits) {

    // Import `path`.
    var path = require('path');

    // Import `fs` and `fs-extra`.
    var fs = require('fs');
    var fsx = require('fs-extra');

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD.
    inputs.destination = path.resolve(inputs.destination);

    // Only override an existing file if `inputs.force` is true.
    // Any errors thrown will automatically be caught and forwarded
    // through our `error` exit.
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

    // Attempt to write the file to disc.
    // Any errors thrown will automatically be caught and forwarded
    // through our `error` exit.
    fs.writeFileSync(inputs.destination, inputs.string);

    // Return through the `success` exit.
    return exits.success();

  }


};
