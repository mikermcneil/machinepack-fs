module.exports = {


  friendlyName: 'Template file',


  description: 'Read file at source path, replace substrings with provided data, then write to destination path.',


  extendedDescription: 'Uses lodash template syntax (e.g. `"Hi there, <%=firstName%>!"`)',


  inputs: {

    source: {
      description: 'The path on disk to the template file.',
      example: '/Users/mikermcneil/.tmp/foo.tpl',
      required: true
    },

    destination: {
      description: 'The path on disk where the resulting file should be written',
      example: '/Users/mikermcneil/.tmp/bar.md',
      required: true
    },

    data: {
      typeclass: 'dictionary'
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
    },

    escapeHTMLEntities: {
      description: 'Whether or not to escape HTML entities',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    success: {
      description: 'File written successfully.'
    },

    noTemplate: {
      description: 'Source template file not found'
    },

    missingData: {
      friendlyName: 'missing data',
      description: 'One or more variables used in the template were not provided in the template data.',

    }

  },


  fn: function (inputs, exits) {

    var util = require('util');
    var fsx = require('fs-extra');
    var _ = require('lodash');

    var writeFileFromStr = require('machine').build(require('./write'));

    // Read template from disk
    fsx.readFile(inputs.source, 'utf8', function(err, contents) {
      if (err) {
        err = (typeof err === 'object' && err instanceof Error) ? err : new Error(err);
        err.message = 'Template error: ' + err.message;
        err.path = inputs.source;
        if (err.code === 'ENOENT') {
          return (exits.noTemplate)(err);
        }
        return exits.error(err);
      }

      // Render template and data into a single string using Lodash
      var result;
      try {
        result = _.template(contents, inputs.data||{}, {

          // Provide access to `util` and `_` libs from within template.
          imports: {
            util: util,
            _: _
          }

        });
      } catch (e) {

        // Recognize lodash template error (scope variable not defined)
        var isTplError = _.isObject(e) && (e.name === 'ReferenceError' || e.type === 'not_defined');
        if (isTplError) {
          var undefinedScopeVarName = _.isArray(e.arguments) && e.arguments[0];
          var output = {
            undefinedScopeVarName: undefinedScopeVarName || '',
            message:
              undefinedScopeVarName ?
              util.format('The variable `%s` is used in template "%s", but no value for `%s` was provided as template data.', undefinedScopeVarName, inputs.source, undefinedScopeVarName)
              :
              util.format('There is some unparseable or invalid syntax in template "%s". Details:\n', inputs.source, e.stack)
          };
          return exits.missingData(output);
        }

        // Unrecognized error
        return exits.error(e);
      }

      try {
        // With lodash teplates, HTML entities are escaped by default.
        // Default assumption is we DON'T want that, so we'll reverse it.
        if (!inputs.escapeHTMLEntities) {
          result = _.unescape(result);
        }
      }
      catch (e) {
        return exits.error(e);
      }

      // Finally, write templated string to disk
      writeFileFromStr({
        force: inputs.force,
        string: result,
        destination: inputs.destination
      })
      .exec(exits);
    });
  }
};
