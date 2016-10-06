module.exports = {


  friendlyName: 'Read JSON file',


  description: 'Read and parse JSON file located at source path on disk into usable data.',


  extendedDescription: 'Assumes file is encoded using utf8.',


  sideEffects: 'cacheable',


  inputs: {

    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory).',
      example: '/Users/mikermcneil/.tmp/foo.json',
      required: true
    },

    schema: {
      friendlyName: 'Example result',
      description: 'An example schema (in RTTC exemplar syntax) describing what the parsed data should look like (used for type-coercion).',
      moreInfoUrl: 'https://github.com/node-machine/rttc#types--terminology',
      defaultsTo: '*',
      isExemplar: true
    }

  },


  exits: {

    success: {
      outputFriendlyName: 'JSON file data',
      outputDescription: 'The parsed JSON data from the source file.',
      getExample: function (inputs){
        return inputs.schema;
      }
    },

    doesNotExist: {
      description: 'No file could be found at the provided `source` path.'
    },

    couldNotParse: {
      description: 'Could not parse the file as JSON.'
    },

    isDirectory: {
      description: 'The specified path pointed to a directory.'
    }

  },


  fn: function (inputs, exits) {

    // Import `machinepack-json`.
    var Json = require('machinepack-json');

    // Import this pack.
    var Filesystem = require('../');

    // Attempt to read the file at the specified path.
    Filesystem.read({
      source: inputs.source
    }).exec({
      // Forward errors through the appropriate exits.
      error: exits.error,
      doesNotExist: exits.doesNotExist,
      isDirectory: exits.isDirectory,
      // If the file was successfully read...
      success: function (contents){
        // Attempt to parse the file contents as JSON.
        Json.parse({
          json: contents,
          schema: inputs.schema
        }).exec({
          // Forward errors through the appropriate exits.
          error: exits.error,
          couldNotParse: exits.couldNotParse,
          // If the data was successfully parsed, push it through our `success` exit.
          success: function (parsedData){
            return exits.success(parsedData);
          }
        });
      }
    });
  }


};
