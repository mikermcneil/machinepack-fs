/**
 * Module dependencies
 */

var util = require('util');
var fsx = require('fs-extra');
var _ = require('lodash');
var writeFileFromStr = require('node-machine').build(require('./write'));


module.exports = {
  id: 'template',
  machinepack: 'fs',
  description: 'Read file at source path, replace relevant lodash template substrings using provided data, then write to destination path.',
  inputs: {
    source: {
      example: '/Users/mikermcneil/.tmp/foo'
    },
    data: {
      example: {
        email: {
          from: 'mikermcneil@sailsjs.org',
          subject: 'hello world!'
        },
        projectName: 'Bikrosoft (Confidential)'
      }
    },
    destination: {
      example: '/Users/mikermcneil/.tmp/bar'
    },
    force: {
      description: 'overwrite existing file(s)?',
      type: 'boolean',
      defaultsTo: false
    }
  },
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
  fn: function ($i,$x) {

    fsx.readFile($i.source, 'utf8', function(err, contents) {
      if (err) {
        err = (typeof err === 'object' && err instanceof Error) ? err : new Error(err);
        err.message = 'Template error: ' + err.message;
        err.path = $i.source;
        if (err.code === 'ENOENT') {
          return ($x.noTemplate||$x.error)(err);
        }
        return $x.error(err);
      }
      try {
        contents = _.template(contents, $i.data);

        // With lodash teplates, HTML entities are escaped by default.
        // Default assumption is we DON'T want that, so we'll reverse it.
        if (!$i.escapeHTMLEntities) {
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
            message: util.format('`%s` is used in template "%s", but no value for `%s` was provided as template data.', undefinedScopeVar, $i.source, undefinedScopeVar)
          };
          return ($x.missingData||$x.error)(err);
        }

        return $x.error(e);
      }

      // Finally, write templated string to disk
      writeFileFromStr({
        force: $i.force,
        string: contents,
        destination: $i.destination
      })
      .exec($x);

    });
  }
};

