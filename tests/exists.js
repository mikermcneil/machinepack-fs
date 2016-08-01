var assert = require('assert');
var fsx = require('fs-extra');
var Filesystem = require('../');
var path = require('path');

describe('machinepack-fs :: exists', function() {

  it('should return `true` through `success` for an existing folder.', function(done) {

    Filesystem.exists({
      path: path.resolve(__dirname, 'fixtures', 'files')
    }).exec({
      error: done,
      success: function(exists) {
        assert.equal(exists, true);
        return done();
      }
    });

  });

  it('should return `true` through `success` for an existing file.', function(done) {

    Filesystem.exists({
      path: path.resolve(__dirname, 'fixtures', 'files', 'alicemoji.png')
    }).exec({
      error: done,
      success: function(exists) {
        assert.equal(exists, true);
        return done();
      }
    });

  });

  it('should return `false` through `success` for an non-existent folder.', function(done) {

    Filesystem.exists({
      path: path.resolve(__dirname, 'fixtures', 'filesxxx')
    }).exec({
      error: done,
      success: function(exists) {
        assert.equal(exists, false);
        return done();
      }
    });

  });

  it('should return `true` through `success` for a non-existent folder.', function(done) {

    Filesystem.exists({
      path: path.resolve(__dirname, 'fixtures', 'files', 'alicemojixxx.png')
    }).exec({
      error: done,
      success: function(exists) {
        assert.equal(exists, false);
        return done();
      }
    });

  });

});
