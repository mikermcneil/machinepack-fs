module.exports = {
  friendlyName: 'Read JSON file',
  description: 'Read and parse JSON file located at source path on disk into usable data.',
  extendedDescription: 'Assumes file is encoded using utf8.',
  cacheable: true,
  idempotent: true,

  inputs: {
    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo.json',
      required: true
    },
    schema: {
      description: 'An example of what the parsed data should look like (used for type-coercion)',
      typeclass: '*',
      required: true
    }
  },

  defaultExit: 'success',

  exits: {
    error: {},
    doesNotExist: {
      description: 'No file exists at the provided `source` path'
    },
    couldNotParse: {
      description: 'Could not parse file as JSON.'
    },
    success: {
      description: 'Returns the data stored in file at `source` path',
      getExample: function (inputs){
        return inputs.schema;
      }
    }
  },

  fn: function (inputs, exits) {

    var Util = require('machinepack-util');

    var readFile = require('machine').build(require('./read'));

    readFile({
      source: inputs.source
    }).exec({
      error: exits.error,
      doesNotExist: exits.doesNotExist,
      success: function (contents){
        Util.parseJson({
          json: contents,
          schema: inputs.schema
        }).exec({
          error: exits.error,
          couldNotParse: exits.couldNotParse,
          success: function (parsedData){
            return exits.success(parsedData);
          }
        });
      }
    });
  }
};
