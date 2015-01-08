module.exports = {

  friendlyName: 'Template file',
  description: 'Read file at source path, replace substrings with provided data, then write to destination path.',
  extendedDescription: 'Uses lodash template syntax (e.g. `"Hi there, <%=firstName%>!"`)',

  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar',
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
      description: 'overwrite existing file(s)?',
      example: false
    },
    options: {
      description: 'template options (see http://lodash.com/docs#template)',
      typeclass: 'dictionary'
      // example: {
      //   interpolate: /{{([\s\S]+?)}}/g
      // }
    }
  },

  defaultExit: 'success',

  exits: {
    error: {
      description: 'Unexpected error occurred.'
    },
    success: {
      description: 'File written successfully.'
    },
    noTemplate: {
      description: 'Source template file not found'
    },
    missingData: {
      example: {
        status: 500,
        exit: 'missingData',
        name: 'ReferenceError',
        message: '`appname` is used in template "/Users/mikermcneil/.tmp/foo", but no value for `appname` was provided as template data.'
      }
    }
  },

  fn: function (inputs, exits) {

    var util = require('util');
    var fsx = require('fs-extra');
    var _ = require('lodash');
    var writeFileFromStr = require('machine').build(require('./write'));

    fsx.readFile(inputs.source, 'utf8', function(err, contents) {
      if (err) {
        err = (typeof err === 'object' && err instanceof Error) ? err : new Error(err);
        err.message = 'Template error: ' + err.message;
        err.path = inputs.source;
        if (err.code === 'ENOENT') {
          return (exits.noTemplate||exits.error)(err);
        }
        return exits.error(err);
      }
      try {
        var options = inputs.options || {};
        contents = _.template(contents, inputs.data||{}, options);

        // With lodash teplates, HTML entities are escaped by default.
        // Default assumption is we DON'T want that, so we'll reverse it.
        if (!inputs.escapeHTMLEntities) {
          contents = _.unescape(contents);
        }
      } catch (e) {
        var err = e;
        if (!(typeof err === 'object' && err instanceof Error)){
          err = new Error(err);
        }

        // Recognize lodash template error (scope variable not defined)
        if (err.name === 'ReferenceError' || err.type === 'not_defined') {
          var undefinedScopeVar = err.arguments && err.arguments[0];
          err = {
            status: 500,
            exit: 'missingData',
            name: 'ReferenceError',
            message: util.format('`%s` is used in template "%s", but no value for `%s` was provided as template data.', undefinedScopeVar, inputs.source, undefinedScopeVar)
          };
          return (exits.missingData||exits.error)(err);
        }

        return exits.error(e);
      }

      // Finally, write templated string to disk
      writeFileFromStr({
        force: inputs.force,
        string: contents,
        destination: inputs.destination
      })
      .exec(exits);
    });
  }
};
