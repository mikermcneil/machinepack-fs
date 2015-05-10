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
    },

    couldNotRender: {
      description: 'Could not render the template due to invalid or unparseable syntax.'
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


      // Now attempt to render the Lodash template.
      // Templates are provided access to the Node.js `util` library,
      // as well as `_` (Lodash itself).
      // If the rendering fails because of a missing variable, try again
      // with a fake variable inserted until the errors go away, or until
      // we reach MAX_NUM_ITERATIONS.
      var result;
      var missingVars = [];
      var morePotentiallyActionableErrorsExist = true;
      var mostRecentTemplateErr;
      var numIterations = 0;
      var MAX_NUM_ITERATIONS = 10;
      var dataWithFakeValues = _.cloneDeep(inputs.data||{});

      while (numIterations < MAX_NUM_ITERATIONS && morePotentiallyActionableErrorsExist) {

        // Track iterations to prevent this loop from spinning out of control.
        numIterations++;

        try {
          // Attempt to render template and data into a single string using Lodash
          result = _.template(contents, dataWithFakeValues, {
            imports: {
              util: util,
              _: _
            }
          });

          // If we made it here, there were no errors rendering the template.
          morePotentiallyActionableErrorsExist = false;

        }
        catch (e) {

          // Recognize lodash template error (scope variable not defined)
          var isTplError = _.isObject(e) && (e.name === 'ReferenceError' || e.type === 'not_defined');
          var missingVar = _.isArray(e.arguments) && e.arguments[0];

          // If this is not a recognizable missing variable error, or if
          // the name of the scope variable cannot be determined, then
          // we need to stop.
          if (!isTplError || !missingVar) {
            mostRecentTemplateErr = e;
            morePotentiallyActionableErrorsExist = false;
          }
          // Otherwise we can put a fake value in for the variable in
          // order to deduce other missing variables for more complete
          // error feedback.
          else {
            missingVars.push(missingVar);
            dataWithFakeValues[missingVar] = {};
          }
        }
      }

      // If at least one missing variable was found, show it and use the
      // `missingData` exit.
      if (missingVars.length > 0) {
        return exits.missingData({
          message: util.format('%s were used in template "%s", but not provided in the template data dictionary.', (missingVars.length>1?'Some variables':'A variable') + ' (' + _.map(missingVars, function (varName){return '`'+varName+'`';}).join(',')+')', inputs.source),
          missingVariables: missingVars
        });
      }
      // Otherwise if the only template error was some other unrecognized thing,
      // exit out of the `couldNotRender` exit.
      if (mostRecentTemplateErr) {
        return exits.couldNotRender(mostRecentTemplateErr);
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
