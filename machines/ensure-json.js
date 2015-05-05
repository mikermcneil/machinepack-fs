module.exports = {


  friendlyName: 'Ensure JSON file',


  description: 'Read or write a JSON file.',


  extendedDescription: 'Assumes file is encoded using utf8.',


  cacheable: true,


  inputs: {

    path: {
      description: 'Absolute path for the JSON file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo.json',
      required: true
    },

    schema: {
      description: 'An example of what the parsed data should look like (used for type-coercion)',
      extendedDescription: 'If file does not exist, this schema will be used as the contents of the newly created JSON file.',
      typeclass: '*',
      required: true
    }

  },


  exits: {

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
    var Machine = require('machine');
    var readJson = Machine.build(require('./read-json'));
    var writeJson = Machine.build(require('./write-json'));

    readJson({
      source: inputs.path,
      schema: inputs.schema
    }).exec({
      error: function (err){
        return exits.error(err);
      },
      couldNotParse: function (parseErr){
        return exits.couldNotParse(parseErr);
      },
      success: function (data){
        return exits.success(data);
      },
      doesNotExist: function (){
        // If the JSON file does not exist, create it
        writeJson({
          destination: inputs.path,
          json: inputs.schema
        }).exec({
          error: function (err){
            return exits.error(err);
          },
          success: function (){
            return exits.success(inputs.schema);
          }
        });// </writeJson>
      }//</readJson.doesNotExist>
    });//</readJson>

  }


};
