module.exports = {


  friendlyName: 'Create read stream',


  description: 'Create and return a readable stream for a file on disk.',


  extendedDescription: 'This machine does not determine whether a file actually exists or can be accessed at the provided source path.  '+
  'That responsibility falls on the consumer of the stream.  However, this machine _does_ bind an `error` event handler on the stream '+
  'to prevent emitted error events from crashing the process; ensuring that this machine is agnostic of its userland environment.\n\n'+
  'If you plan to write code which uses the readable stream returned by this machine but you have never worked with file streams in '+
  'Node.js, [check this out](https://docs.nodejitsu.com/articles/advanced/streams/how-to-use-fs-create-read-stream) for tips.  For more '+
  'information about readable streams in Node.js in general, check out the section on [`stream.Readable`](https://nodejs.org/api/stream.html#stream_class_stream_readable) '+
  'in the Node.js docs.',


  cacheable: true,


  sync: true,


  inputs: {

    source: {
      description: 'Absolute path to the source file (if relative path is provided, will resolve path from current working directory)',
      example: '/Users/mikermcneil/.tmp/foo',
      required: true
    }

  },


  exits: {

    success: {
      variableName: 'readableStream',
      example: '==='
    },

  },


  fn: function (inputs,exits) {
    var path = require('path');
    var fs = require('fs');

    // In case we ended up here w/ a relative path,
    // resolve it using the process's CWD
    inputs.source = path.resolve(inputs.source);

    // Now create the read stream.  This is synchronous, but it also doesn't tell us
    // whether or not the file at the specified source path actually exists, or whether
    // we can access that path, etc.  That's all up to the machine which consumes this
    // stream to figure out.
    var file__ = fs.createReadStream(inputs.source);

    // Bind a no-op handler for the `error` event to prevent it from crashing the process if it fires.
    // (userland code can still bind and use its own error events)
    file__.on('error', function noop (err) { });
    // ^ Since event handlers are garbage collected when the event emitter is itself gc()'d, it is safe
    // for us to bind this event handler here.

    return exits.success(file__);
  }


};
