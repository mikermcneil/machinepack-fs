module.exports = {


  friendlyName: 'Write file (stream)',


  description: 'Generate a file on the local filesystem using the specified Readable stream for its contents.',


  inputs: {

    sourceStream: {
      description: 'The source (Readable) stream whose contents will be pumped to disk.',
      extendedDescription: 'Must be a utf8-encoded, modern (streams2 or streams3) Readable stream.',
      example: '===',
      required: true
    },

    destination: {
      example: '/Users/mikermcneil/.tmp/bar.json',
      description: 'Absolute path for the destination file (if relative path is provided, will resolve path from current working directory).',
      required: true
    },

    force: {
      description: 'Overwrite files or directories which might exist at or within the specified destination path?',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    success: {
      description: 'The stream was pumped to disk at the speciifed path.'
    },

    alreadyExists: {
      description: 'An existing file / folder was found at the specified path (overwrite by enabling the `force` input).'
    },

  },


  // To test:
  //
  // require('./').readStream({
  //   source: './README.md'
  // }).exec({
  //   error: function (err){console.error('Error getting readable stream:',err);},
  //   success: function(stream) {
  //     require('./').writeStream({
  //       destination: './experiment.md',
  //       sourceStream: stream,
  //       force: true
  //     }).exec(console.log);
  //   }
  // });
  fn: function(inputs, exits) {

    // Import `path`
    var path = require('path');

    // Import Lodash `isFunction` and `isObject` methods.
    var isFunction = require('lodash.isfunction');
    var isObject = require('lodash.isobject');

    // Import `fs-extra`.
    var fsx = require('fs-extra');

    // Import this pack
    var Filesystem = require('../');

    // Check for the methods we need on the provided Readable source stream.
    if (!isObject(inputs.sourceStream) || !isFunction(inputs.sourceStream.pipe) || !isFunction(inputs.sourceStream.on)) {
      // If the give `sourceStream` is invalid, leave through the `error` exit.
      return exits.error(new Error('Invalid stream provided (has no `.pipe()` and/or `.on()` methods).'));
    }

    // Ensure path is absolute (resolve from cwd if not).
    inputs.destination = path.resolve(inputs.destination);

    // Determine whether the destination already exists.
    Filesystem.exists({path: inputs.destination}).exec(function(err, exists) {

      // If an error occurred checking for file existence, forward it through
      // our `error` exit.
      if (err) {return exits.error(err);}

      // If one exists, and the `force` flag is not set, leave
      // through the `alreadyExists` exit.
      if (exists && !inputs.force) {
        return exits.alreadyExists();
      }

      // Delete existing files and/or directories if necessary.
      (function _deleteExistingFilesAndOrDirsIfNecessary(next) {
        // If nothing was there, continue.
        if (!exists) {
          return next();
        }
        // Otherwise attempt to remove the existing file / folder.
        else {
          fsx.remove(inputs.destination, next);
        }
      })(function afterwards(err){
        if (err) { return exits(err); }

        // Build the write drain (i.e. "write stream").
        // This is where the content will go.
        var writeDrain = fsx.createWriteStream(inputs.destination);

        // Pipe the source stream down the drain.
        //
        // Note that since we're using `createOutputStream()`, the necessary
        // directory hierarchy leading to the destination will be created if
        // it does not already exist.
        inputs.sourceStream.pipe(writeDrain);

        // Handle write errors.
        // Note that errors on the source Readable stream are the
        // responsibility of the provider of said stream.
        //
        // Declare a variable to act as a spinlock.
        var hasAlreadyCalledExit;
        writeDrain.on('error', function (err){
          // If we have not called one of our exits yet, then this is
          // our first error.  So we'll handle it by calling the
          // appropriate exit.
          if (!hasAlreadyCalledExit) {
            // Set the spinlock and leave through the `error` exit.
            hasAlreadyCalledExit = true;
            return exits.error(err);
          }
          // Otherwise this is a subsequent error.  Since we've already
          // called an exit, there is not a whole lot else we can do.
          // So we just ignore it.
          // We need to keep this handler bound or an error will be
          // thrown, potentially crashing the process.
        });

        // When finished...
        writeDrain.once('finish', function (){
          // If the spinlock is set (because we already exited) do nothing.
          if (hasAlreadyCalledExit) { return; }
          // Otherwise set the spinlock and leave through the `success` exit.
          hasAlreadyCalledExit = true;
          return exits.success();
        });
      });//</after _deleteExistingFilesAndOrDirsIfNecessary>
    });//</Filesystem.exists()>
  },


};
