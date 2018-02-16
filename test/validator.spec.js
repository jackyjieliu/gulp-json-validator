var Vinyl = require('vinyl');
var fs = require('fs');
var path = require('path');
var expect = require('chai').expect;
var jsonValidatePlugin = require('../');

describe('test', function() {
  describe('plugin', function() {
    var file;
    beforeEach(function() {
      file = new Vinyl({
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
      var stream = jsonValidatePlugin({ allowDuplicatedKeys: true });

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
