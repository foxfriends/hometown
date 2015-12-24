/*
    Start the game
*/
'use strict';

import 'babel-polyfill';

import './canvas.es6';
import './socket.es6';
import './input.es6';

import {runner as menu} from './menu/index.es6';

let run;
const next = (...v) => { run.next(v); };
(run = function*() {
    yield* menu(next);
}()).next();