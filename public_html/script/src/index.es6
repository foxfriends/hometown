'use strict';

import 'babel-polyfill';
import $ from 'jquery';
import {canvas} from './canvas.es6';
import {socket} from './socket.es6';

import draw from './draw.es6';
import {Sprite} from './sprite.es6';
import {Sequence, Range, range} from './util.es6';

const spr = new Sprite('/image.png', 32, 32, [[0, 96], [32, 96], [64, 96]]);
draw.sprite(spr, 1, 32, 32);