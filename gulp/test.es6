'use strict';
import gulp from 'gulp';
import mocha from 'gulp-mocha';

gulp.task('do_test', () => {
    return gulp.src('./server/test/index.es6', {read: false})
        .pipe(mocha());
});

gulp.task('test', ['do_test'], () => {
    gulp.watch('./server/src/**', ['do_test']);
});