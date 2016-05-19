

```
var jsonValidator = require('gulp-json-validtor');
gulp.task('test', function() {
  return gulp.src('./test/fixture/duplicated-key.json')
    .pipe(jsonValidator({ allowDuplicatedKey: true }))
});
```