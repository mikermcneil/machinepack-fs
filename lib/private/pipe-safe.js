/**
 * Module dependencies
 */

// N/A


/**
 * pipeSafe()
 *
 * Safely pipe a readable stream to a writable drain without accidentally triggering
 * the "pipe" listener (...because it might have naughty logic attached to it.)
 *
 * > For more info, see the big note about this in `write-stream`.
 *
 * @param  {Readable} readableStream
 * @param  {Writable} writableDrain
 *         WARNING: This method does not attach an `error` listener to the writable
 *         drain!  That is up to userland code to take care of!
 * @param  {Function} done
 */

module.exports = function pipeSafe(readableStream, writableDrain, done) {

  // (Note: The $-prefixed functions are standalone declarations because we use
  // references to them again below as we clean up.)
  var $onData;
  var $onEnd;
  var $onReadError;
  (function(proceed){

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // For some reason, we have to use the traditional streams1 approach here,
    // for some streams anyway.  It seems like the request module does not fully
    // support the streams>=2 API as documented, as of mid-2017 and request@2.81 thru 2.83.
    //
    // For proof, try out:
    // https://github.com/sailshq/machinepack-strings/commit/ca02704a1d5ae6ba168d988ee20972b5de6e7258
    //
    // But note that this means our life is a bit more complicated, and we have to worry about
    // backpressure.  This is one of the main reasons for this little utility to exist in the
    // first place.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Bind "data", "end", and "error" listeners.
    $onData = function (chunk) {
      // console.log('on("data")', arguments);
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // TODO: handle high water marks / buffering
      //
      // See:
      // https://nodejs.org/en/docs/guides/backpressuring-in-streams/
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      writableDrain.write(chunk);
      // dataSoFar += chunk.toString();
      // console.log('read chunk:', dataSoFar);
    };//ƒ
    readableStream.on('data', $onData);


    $onEnd = function () {
      // // console.log('end', arguments);
      // if (spun) { return; }
      // spun = true;
      writableDrain.end();
      proceed();
    };//ƒ
    readableStream.on('end', $onEnd);

    $onReadError = function(err) {
      // // console.log('error', err);
      // if (spun) { return; }
      // spun = true;
      proceed(err);
    };
    readableStream.on('error', $onReadError);


  })(function(err) {
    readableStream.removeListener('data', $onData);
    readableStream.removeListener('end', $onEnd);
    readableStream.removeListener('error', $onReadError);

    if (err) {
      return done(err);
    }

    return done();

  });//_∏_ (†)

};//ƒ
