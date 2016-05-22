var mapStream = require('map-stream');
var PluginError = require('gulp-util').PluginError;
var validator = require('./validator.js');

module.exports = gulpJsonValidator;

function gulpJsonValidator(option) {
  var allowDuplicatedKeys = false;
  if (option) {
    allowDuplicatedKeys = !!option.allowDuplicatedKeys;
  }

  return mapStream(function(file, cb) {
    var content = file.contents;
    var error;
    if (content) {
      var e = validator.validate(String(content), allowDuplicatedKeys);
      if (e) {
        error = new PluginError('gulp-json-validator',{
          name: 'JSON Validate Error',
          filename: file.path,
          message: e
        });
      }
    }
    cb(error, file);
  });
}
