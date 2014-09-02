/**
 * Module dependencies
 */

var fsx = require('fs-extra');
var _ = require('lodash');



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
    }
  },
  exits: {
    error: {},
    success: {},
    noTemplate: {
      example: {
        code: 'ENOENT'
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
          return $x.noTemplate(err);
        }
        return $x.error(err);
      }
      try {
        contents = _.template(contents, $i);

        // With lodash teplates, HTML entities are escaped by default.
        // Default assumption is we DON'T want that, so we'll reverse it.
        if (!$i.escapeHTMLEntities) {
          contents = _.unescape(contents);
        }
      } catch (e) {
        return $x.error(e);
      }

      // Finally, write templated string to disk
      var writeFileFromStr = require('node-machine').build(require('./write'));
      writeFileFromStr({
        string: contents,
        destination: $i.destination
      }).exec(cb);

    });
  }
};

