var gutil = require('gulp-util');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;

var validator = require('../validator.js');
var jsonValidatePlugin = require('../');

describe('test', function() {
  describe('json validator', function() {

    it('valid json', function() {
      var validJson = [{
        path: './test/fixture/valid-array.json',
        expectedValue: [
          true,
          false,
          null,
          "a string",
          123,
          23.455,
          {
            "k": "v"
          }
        ]
      }, {
        path: './test/fixture/valid-object.json',
        expectedValue: {
          "a": "a string value",
          "with back quote\"": [
            123,
            234,
            345,
            3.451
          ],
          "with back spash\\": {
            "nested": [
              null,
              true,
              false
            ]
          }
        }
      }, {
        path: './test/fixture/valid-string.json',
        expectedValue: "this is a valid string"
      }, {
        path: './test/fixture/valid-number.json',
        expectedValue: 123.456
      }];

      for (var i = 0; i < validJson.length; i++) {

        var content = fs.readFileSync(validJson[i].path, 'utf8') ;
        expect(validator.parse(content, false)).to.deep.equal(validJson[i].expectedValue);
        expect(validator.parse(content, true)).to.deep.equal(validJson[i].expectedValue);
      }
    });

    it('invalid json', function() {
      var invalidJson = [{
        path: './test/fixture/invalid-number.json',
        expectedError: 'Syntax error: expecting number near 3.112.24\n]'
      }, {
        path: './test/fixture/invalid-object.json',
        expectedError: 'Syntax error: expecting \':\' near d"": 123\n}'
      }];

      for (var i = 0; i < invalidJson.length; i++) {
        var content = fs.readFileSync(invalidJson[i].path, 'utf8') ;
        expect(validator.validate(content, false)).to.equal(invalidJson[i].expectedError);
        expect(validator.validate(content, true)).to.equal(invalidJson[i].expectedError);
      }
    });

    it('duplicated keys', function() {
      var content = fs.readFileSync('./test/fixture/duplicated-key.json', 'utf8') ;
      var errMessage = 'Syntax error: duplicated key: a near "a": 345\n}';
      expect(validator.validate(content, true)).to.equal(undefined);
      expect(validator.validate(content, false)).to.equal(errMessage);
      expect(validator.parse(content, true)).to.deep.equal({
        a: 345,
        b: 234
      });
      expect(function() {
        validator.parse(content, false)
      }).to.throw(errMessage);
    });

    it('should parse strings from json.stringify', function() {
      var obj = {
        "a": "a string value",
        "with back quote\"": [
          123,
          234,
          345,
          3.451
        ],
        "with back spash\\": {
          "nested": [
            null,
            true,
            false
          ]
        }
      };
      expect(validator.parse(JSON.stringify(obj))).to.deep.equal(obj);
    });
  });
  describe('plugin', function() {
    var file;
    beforeEach(function() {
      file = new gutil.File({
        path: path.join(__dirname, './fixture/duplicated-key.json'),
        cwd: __dirname,
        base: path.join(__dirname, './fixture') ,
        contents: fs.readFileSync('./test/fixture/duplicated-key.json')
      });
    });

    it('should fail on duplicated keys', function(done) {
      var stream = jsonValidatePlugin();

      stream.on('error', function () {
        done();
      });

      stream.write(file);
      stream.end();
    });

    it('should not fail on duplicated keys with config', function(done) {
      var stream = jsonValidatePlugin({ allowDuplicatedKey: true });

      var count = 0;
      stream.on('data', function () {
        count++;
      });

      stream.on('error', function () {
        expect(false).to.be.true;
      });
      stream.once('end', function () {
        expect(count).to.equal(1);
        done();
      });

      stream.write(file);
      stream.end();
    });
  });
});