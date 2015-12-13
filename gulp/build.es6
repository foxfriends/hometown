'use strict';
import gulp from 'gulp';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.js';

import entries from './entries.es6';

gulp.task('build', ['clean'], () => {
    return gulp.src(entries.scripts)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('public_html/script'));
});

gulp.task('build-test', ['clean-test'], () => {
    return gulp.src(entries.tests)
        .pipe(webpack(webpackConfig))
        .pipe(gulp.dest('public_html/test/script'));
});