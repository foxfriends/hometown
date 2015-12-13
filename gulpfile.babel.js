'use strict';

import gulp from 'gulp';

import './gulp/clean.es6';
import './gulp/build.es6';
import './gulp/test.es6';

gulp.task('default', ['build', 'test']);