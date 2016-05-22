# gulp-json-validator [![NPM version](https://img.shields.io/npm/v/gulp-json-validator.svg)](https://www.npmjs.com/package/gulp-json-validator) [![Build Status](https://travis-ci.org/jackyjieliu/gulp-json-validator.svg?branch=master)](https://travis-ci.org/jackyjieliu/gulp-json-validator)

A gulp wrapper around [json-dup-key-validator](https://github.com/jackyjieliu/json-dup-key-validator) that has an option to check for duplicated keys.

## Install
`npm install gulp-json-validator`
## Usage
```js
var gulpJsonValidator = require('gulp-json-validator');
gulp.task('default', function() {
  return gulp.src('./**/*.json')
    .pipe(gulpJsonValidator({ allowDuplicatedKeys: false }))
});
```
### gulpJsonValidator([options])
#### Options
##### allowDuplicatedKeys
Type: `Boolean`

Default: `false`

Whether duplicated keys are allowed in an object or not