'use strict';
import gulp from 'gulp';
import del from 'del';

gulp.task('clean', (cb) => {
    return del(['public_html/script/hometown.{js,js.map}'], cb);
});

gulp.task('clean-test', (cb) => {
    return del(['public_html/test/script/hometown.{js,js.map}'], cb);
});