module.exports = {

  identity: 'template',
  friendlyName: 'template',
  description: 'Read file at source path, replace relevant lodash template substrings using provided data, then write to destination path.',
  cacheable: false,

  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/foo',
      description: 'Path (relative or absolute) to the file to be read.',
      required: true
    },
    destination: {
      description: 'Path (relative or absolute) to the file to be written.',
      example: '/Users/mikermcneil/.tmp/bar',
      required: true
    },
    data: {
      description: 'Data to be used as template token replacements.',
      example: {
        email: {
          from: 'mikermcneil@sailsjs.org',
          subject: 'hello world!'
        },
        projectName: 'Bikrosoft (Confidential)'
      }
    },
    force: {
      description: 'Overwrite existing file(s)?',
      example: false
    },
    options: {
      description: 'Template options (see http://lodash.com/docs#template)',
      example: {
        interpolate: /{{([\s\S]+?)}}/g
      }
    }
  },

  defaultExit: 'success',
  catchallExit: 'error',

  exits: {
    error: {},
    success: {},
    noTemplate: {
      example: {
        code: 'ENOENT'
      }
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
    var writeFileFromStr = require('node-machine').build(require('./write'));

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
        contents = _.template(contents, inputs.data, options);

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
