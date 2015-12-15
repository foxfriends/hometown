'use strict';
import gulp from 'gulp';
import webpack from 'webpack-stream';
import webpackConfig from './webpack.config.js';

import {entries} from './paths.es6';

const err = function(e) {
    console.error(e);
    this.emit('end');
};

gulp.task('build', ['clean'], () => {
    return gulp.src(entries.scripts)
        .pipe(webpack(webpackConfig))
        .on('error', err)
        .pipe(gulp.dest('public_html/script'));
});

gulp.task('build-test', ['clean-test'], () => {
    return gulp.src(entries.tests)
        .pipe(webpack(webpackConfig))
        .on('error', err)
        .pipe(gulp.dest('public_html/test/script'));
});