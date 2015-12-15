'use strict';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

gulp.task('test', () => {
    return gulp.src('./server/test/index.es6', {read: false})
        .pipe(mocha());
});