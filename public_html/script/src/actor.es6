/*
    A base Actor class, which should be extended for every Actor in the game
*/
'use strict';

import {Sprite} from './sprite.es6';
import {$canvas} from './canvas.es6';
import {on} from './event.es6';

const [POS, SPRITE, FRAME] = [Symbol('POS'), Symbol('SPRITE'), Symbol('FRAME')];

export const Actor = class {
    constructor(opts = {}) {
        if(new.target === Actor) { // jshint ignore:line
            throw new TypeError('Actor is an abstract class and cannot be instantiated');
        }
        this[POS] = {x: 0, y: 0, z: 0};
        this[SPRITE] = new Sprite();
        this[FRAME] = 0;
        if(!opts.noEvents) {
            on  ('mouseheld',   (which) => this.mouse(which))
                ('mousedown',   (which) => this.mousedown(which))
                ('mouseup',     (which) => this.mouseup(which))
                ('keyheld',     (which) => this.key(which))
                ('keydown',     (which) => this.keydown(which))
                ('keyup',       (which) => this.keyup(which));
        }
    }

    get x() { return this[POS].x; }
    set x(x) {
        if(typeof x === 'number') {
            this[POS].x = x;
            return true;
        } else {
            throw new TypeError(`Cannot set x to a ${typeof x}`);
        }
    }

    get y() { return this[POS].y; }
    set y(y) {
        if(typeof y === 'number') {
            this[POS].y = y;
            return true;
        } else {
            throw new TypeError(`Cannot set y to a ${typeof y}`);
        }
    }

    get z() { return this[POS].z; }
    set z(z) {
        if(typeof z === 'number') {
            this[POS].z = z;
            return true;
        } else {
            throw new TypeError(`Cannot set z to a ${typeof z}`);
        }
    }

    get sprite() { return this[SPRITE]; }
    set sprite(s) {
        if(s instanceof Sprite) {
            this[SPRITE] = s;
            return true;
        } else {
            throw new TypeError(`Cannot set sprite to a ${typeof s}`);
        }
    }

    get frame() { return this[FRAME]; }
    set frame(f) {
        if(typeof f === 'number') {
            this[FRAME] = f % this.sprite.frames.length;
            return true;
        } else {
            throw new TypeError(`Cannot set frame to a ${typeof f}`);
        }
    }

    mouse(which) {}
    mouseup(which) {}
    mousedown(which) {}

    key(which) {}
    keyup(which) {}
    keydown(which) {}

    step() {}

    draw() {
        this.sprite.draw(this.frame, this.x, this.y);
    }
};

export default {Actor};