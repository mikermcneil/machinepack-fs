module.exports = {


  friendlyName: 'Template',


  description: 'Read file at source path as a template, render with provided data, then write to destination path.',


  extendedDescription: 'Uses Lodash template syntax (e.g. `<%= %>`, `<%- %>`, `<% %>`)  Also provides access to the Node.js core utility module (as `util`), as well as Lodash itself (as `_`).',


  sideEffects: 'cacheable',


  inputs: {

    source: {
      description: 'The path on disk to the template file.',
      example: '/Users/mikermcneil/.tmp/foo.tpl',
      required: true
    },

    destination: {
      description: 'The path on disk where the resulting file should be written.',
      example: '/Users/mikermcneil/.tmp/bar.md',
      required: true
    },

    data: {
      friendlyName: 'Template data',
      description: 'The data which will be accessible from the template.',
      extendedDescription: 'Each key will be a variable accessible in the template.  For instance, if you supply an array `[{name:"Chandra"}, {name:"Mary"}]` as the key "friends", then you will be able to access `friends` from the template; i.e. `<ul><% _.each(friends, function (friend){ %><li><%= friend.name %></li> <%}); %></ul>`  Use `<%= %>` to inject the contents of a variable as-is, `<%- %>` to HTML-escape them first, or `<% %>` to execute some JavaScript code.',
      example: '===',
      readOnly: true
      // e.g. {
      //   email: {
      //     from: 'mikermcneil@sailsjs.org',
      //     subject: 'hello world!'
      //   },
      //   projectName: 'Bikrosoft (Confidential)'
      // }
    },

    force: {
      friendlyName: 'Force?',
      description: 'Whether or not to overwrite existing file(s).',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    success: {
      description: 'File written successfully.'
    },

    noTemplate: {
      description: 'The source template file could not be found.'
    },

    missingData: {
      description: 'One or more variables used in the template were not provided in the template data.',
      outputFriendlyName: 'Missing data info',
      outputDescription: 'Information about the missing template data.',
      outputExample: {
        message: 'Some variables (`me`,`friends`) were used in template "/code/machine/docs/.type-table.tpl", but not provided in the template data dictionary.',
        missingVariables: ['me']
      }
    },

    couldNotRender: {
      description: 'Could not render the template due to invalid or unparseable syntax.'
    },

    alreadyExists: {
      description: 'An existing file was found at the specified path (overwrite by enabling the `force` input).'
    }

  },


  fn: function (inputs, exits) {

    // Import `machinepack-strings`.
    var Strings = require('machinepack-strings');

    // Get a handle to this pack.
    var Filesystem = require('../');

    // Read template from disk.
    Filesystem.read({
      source: inputs.source
    }).exec({
      // If the template could not be found, exit through the `doesNotExist` exit.
      doesNotExist: exits.noTemplate,
      // If an unknown error occurred trying to read the template file, exit through
      // the `error` exit.
      error: exits.error,
      // If the template was read successfully...
      success: function (templateStr) {
        // Use the `Strings.template` machine to replace tokens in the template
        // with input data.
        Strings.template({
          templateStr: templateStr,
          data: inputs.data
        }).exec({
          // If the template contained tokens that were missing from the `inputs.data`
          // dictionary, leave through the `missingData` exit.
          missingData: exits.missingData,
          // If another rendering error occurred, leave through the `couldNotRender` exit.
          couldNotRender: exits.couldNotRender,
          // If an unknown error occurred, leave through the `error` exit.
          error: exits.error,
          success: function (renderedStr) {
            // Now attempt to write the rendered template to disk.
            Filesystem.write({
              destination: inputs.destination,
              string: renderedStr,
              force: inputs.force
            }).exec({
              // If a file was found at the destination and `inputs.force` was not set,
              // leave through the `alreadyExists` exit.
              alreadyExists: exits.alreadyExists,
              // If an unknown error occurred, leave through the `error` exit.
              error: exits.error,
              // The file write was successful, so leave through the `success` exit.
              success: exits.success
            });
          }
        });
      }
    });

  }
};
