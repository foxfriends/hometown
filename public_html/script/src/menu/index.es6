/*
    Runs the main menu (login) screen.
*/
'use strict';

import {$canvas} from '../canvas.es6';
import {Sprite} from '../sprite.es6';
import draw from '../draw.es6';
import {Game} from '../game.es6';

import {Menu} from './actor_menu.es6';
import {set as setGlobal} from '../globals.es6';

const menu_sprite = new Sprite('../../../image/title.jpg');

export const runner = function*(next) {
    yield menu_sprite.whenLoaded().then(next);
    const [bg_width, bg_height] = [
        $canvas.width(),
        menu_sprite.height * ($canvas.width() / menu_sprite.width)
    ];

    const menu = new Menu(next);
    const menu_runner = new Game(() => {
        step: {
            menu.step();
        }
        paint: {
            draw.clear();
            draw.setAlpha(1);
            menu_sprite.draw(0, 0, 0, bg_width, bg_height);
            menu.draw();
        }
    });
    const [user] = yield;
    setGlobal('username', user);
    draw.clear();
    menu_runner.end();
};

export default {runner};