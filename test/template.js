var assert = require('assert');
var fsx = require('fs-extra');
var Filesystem = require('../');
var path = require('path');
var _ = require('@sailshq/lodash');

describe('machinepack-fs :: template', function() {

  before(function() {
    fsx.ensureFileSync(path.resolve(__dirname, 'fixtures' ,'sandbox', 'foo.txt'));
  });

  after(function() {
    fsx.removeSync(path.resolve(__dirname, 'fixtures' ,'sandbox'));
  });

  describe('with valid template and data', function() {

    it('should trigger the `alreadyExists` exit when the `destination` exists and `force` is false', function(done) {
      Filesystem.template({
        source: path.resolve(__dirname, 'fixtures', 'good-template.ejs'),
        destination: path.resolve(__dirname, 'fixtures', 'sandbox', 'foo.txt'),
        data: {
          firstName: 'Jane',
          lastName: 'Doe'
        }
      }).exec({
        error: done,
        success: function() {
          return done('Expected to return through `alreadyExists` exit, but triggered `success` instead!');
        },
        noTemplate: function() {
          return done('Expected to return through `alreadyExists` exit, but triggered `noTemplate` instead!');
        },
        missingData: function() {
          return done('Expected to return through `alreadyExists` exit, but triggered `missingData` instead!');
        },
        couldNotRender: function() {
          return done('Expected to return through `alreadyExists` exit, but triggered `couldNotRender` instead!');
        },
        alreadyExists: function() {
          return done();
        }
      });
    });

    it('should write a rendered string to disc when the `destination` exists and `force` is true', function(done) {
      Filesystem.template({
        source: path.resolve(__dirname, 'fixtures', 'good-template.ejs'),
        destination: path.resolve(__dirname, 'fixtures', 'sandbox', 'foo.txt'),
        data: {
          firstName: 'Jane',
          lastName: 'Doe'
        },
        force: true
      }).exec({
        error: done,
        success: function() {
          var contents = fsx.readFileSync(path.resolve(__dirname, 'fixtures', 'sandbox', 'foo.txt'), 'utf8');
          assert.equal(contents, 'Hi there, Jane Doe!\n');
          return done();
        },
        noTemplate: function() {
          return done('Expected to return through `success` exit, but triggered `noTemplate` instead!');
        },
        missingData: function() {
          return done('Expected to return through `success` exit, but triggered `missingData` instead!');
        },
        couldNotRender: function() {
          return done('Expected to return through `success` exit, but triggered `couldNotRender` instead!');
        },
        alreadyExists: function() {
          return done('Expected to return through `success` exit, but triggered `alreadyExists` instead!');
        }
      });
    });

    it('should write a rendered string to disc when the `destination` does not exist', function(done) {
      Filesystem.template({
        source: path.resolve(__dirname, 'fixtures', 'good-template.ejs'),
        destination: path.resolve(__dirname, 'fixtures', 'sandbox', 'bar.txt'),
        data: {
          firstName: 'Jane',
          lastName: 'Doe'
        }
      }).exec({
        error: done,
        success: function() {
          var contents = fsx.readFileSync(path.resolve(__dirname, 'fixtures', 'sandbox', 'bar.txt'), 'utf8');
          assert.equal(contents, 'Hi there, Jane Doe!\n');
          return done();
        },
        noTemplate: function() {
          return done('Expected to return through `success` exit, but triggered `noTemplate` instead!');
        },
        missingData: function() {
          return done('Expected to return through `success` exit, but triggered `missingData` instead!');
        },
        couldNotRender: function() {
          return done('Expected to return through `success` exit, but triggered `couldNotRender` instead!');
        },
        alreadyExists: function() {
          return done('Expected to return through `success` exit, but triggered `alreadyExists` instead!');
        }
      });
    });

  });

  it('with valid template and incomplete data, should trigger `missingData` exit', function(done) {
    Filesystem.template({
      source: path.resolve(__dirname, 'fixtures', 'good-template.ejs'),
      destination: path.resolve(__dirname, 'fixtures', 'sandbox', 'boo.txt'),
      data: {
        firstName: 'Jane'
      }
    }).exec({
      error: done,
      success: function() {
        return done('Expected to return through `missingData` exit, but triggered `success` instead!');
      },
      noTemplate: function() {
        return done('Expected to return through `missingData` exit, but triggered `noTemplate` instead!');
      },
      missingData: function() {
        return done();
      },
      couldNotRender: function() {
        return done('Expected to return through `missingData` exit, but triggered `couldNotRender` instead!');
      },
      alreadyExists: function() {
        return done('Expected to return through `missingData` exit, but triggered `alreadyExists` instead!');
      }
    });
  });

  it('with invalid template, should trigger `couldNotRender` exit', function(done) {
    Filesystem.template({
      source: path.resolve(__dirname, 'fixtures', 'bad-template.ejs'),
      destination: path.resolve(__dirname, 'fixtures', 'sandbox', 'boo.txt'),
      data: {
        firstName: 'Jane',
        lastName: 'Doe'
      }
    }).exec({
      error: done,
      success: function() {
        return done('Expected to return through `couldNotRender` exit, but triggered `success` instead!');
      },
      noTemplate: function() {
        return done('Expected to return through `couldNotRender` exit, but triggered `noTemplate` instead!');
      },
      missingData: function() {
        return done('Expected to return through `couldNotRender` exit, but triggered `missingData` instead!');
      },
      couldNotRender: function() {
        return done();
      },
      alreadyExists: function() {
        return done('Expected to return through `couldNotRender` exit, but triggered `alreadyExists` instead!');
      }
    });
  });

  it('with missing template, should trigger `noTemplate` exit', function(done) {
    Filesystem.template({
      source: path.resolve(__dirname, 'fixtures', 'no-template.ejs'),
      destination: path.resolve(__dirname, 'fixtures', 'sandbox', 'boo.txt'),
      data: {
        firstName: 'Jane',
        lastName: 'Doe'
      }
    }).exec({
      error: done,
      success: function() {
        return done('Expected to return through `noTemplate` exit, but triggered `success` instead!');
      },
      noTemplate: function() {
        return done();
      },
      missingData: function() {
        return done('Expected to return through `noTemplate` exit, but triggered `missingData` instead!');
      },
      couldNotRender: function() {
        return done('Expected to return through `noTemplate` exit, but triggered `couldNotRender` instead!');
      },
      alreadyExists: function() {
        return done('Expected to return through `noTemplate` exit, but triggered `alreadyExists` instead!');
      }
    });
  });

});
