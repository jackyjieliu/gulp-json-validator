# gulp-json-validator [![Build Status](https://travis-ci.org/jackyjieliu/gulp-json-validator.svg?branch=master)](https://travis-ci.org/jackyjieliu/gulp-json-validator)

A json validator that has an option to check for duplicated keys

## Install
`npm install gulp-json-validator`
## Usage
```
var gulpJsonValidator = require('gulp-json-validtor');
gulp.task('test', function() {
  return gulp.src('./test/fixture/duplicated-key.json')
    .pipe(gulpJsonValidator({ allowDuplicatedKey: true }))
});
```
### gulpJsonValidator([options])
#### Options
##### allowDuplicatedKeys
Type: `Boolean`

Default: `false`

Whether duplicated keys are allowed in an object or not