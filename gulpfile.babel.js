'use strict';
import 'babel-polyfill';

import gulp from 'gulp';

import {paths} from './gulp/paths.es6';
import './gulp/clean.es6';
import './gulp/build.es6';
import './gulp/test.es6';

gulp.task('default', ['build', 'build-test', 'test']);
