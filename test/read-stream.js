var assert = require('assert');
var fsx = require('fs-extra');
var Filesystem = require('../');
var path = require('path');
var _ = require('@sailshq/lodash');

describe('machinepack-fs :: read-stream', function() {

  it('should be able to get a stream when called on a valid file', function(done) {

    Filesystem.readStream({
      source: path.resolve(__dirname, 'fixtures', 'files', 'hello.txt')
    }).exec({
      error: done,
      doesNotExist: function() {
        return done('Expected to return through `success` exit, but triggered `doesNotExist` instead!');
      },
      isDirectory: function() {
        return done('Expected to return through `success` exit, but triggered `isDirectory` instead!');
      },
      success: function(stream) {
        var contents = stream.read();
        assert.equal(contents, 'hello wurld!');
        return done();
      }
    });

  });

  it('should trigger its `doesNotExist` exit when called for a non-existent file', function(done) {

    Filesystem.readStream({
      source: path.resolve(__dirname, 'fixtures', 'files', 'helloxxx.txt')
    }).exec({
      error: done,
      doesNotExist: function() {
        return done();
      },
      isDirectory: function() {
        return done('Expected to return through `doesNotExist` exit, but triggered `isDirectory` instead!');
      },
      success: function(stream) {
        return done('Expected to return through `doesNotExist` exit, but triggered `success` instead!');
      }
    });
  });


  it('should trigger its `isDirectory` exit when called for a directory', function(done) {

    Filesystem.readStream({
      source: path.resolve(__dirname, 'fixtures', 'files')
    }).exec({
      error: done,
      doesNotExist: function() {
        return done('Expected to return through `isDirectory` exit, but triggered `isDirectory` instead!');
      },
      isDirectory: function() {
        return done();
      },
      success: function(stream) {
        return done('Expected to return through `isDirectory` exit, but triggered `success` instead!');
      }
    });

  });


});
