/*
    Breaks up an image into predefined sections
*/
'use strict';
require('babel-polyfill');

import draw from './draw.es6';

const [WIDTH, HEIGHT, IMAGE, FRAMES] = [Symbol('WIDTH'), Symbol('HEIGHT'), Symbol('IMAGE'), Symbol('FRAMES')];

export const Sprite = class {
    constructor(image, frameWidth, frameHeight, frames) {
        this[IMAGE] = image;
        if(typeof image === 'string') {
            this[IMAGE] = new Image();
            this[IMAGE].src = image;
        }
        this[FRAMES] = frames;
        this[WIDTH] = frameWidth;
        this[HEIGHT] = frameHeight;
    }

    get width() { return this[WIDTH]; }
    get height() { return this[HEIGHT]; }
    get image() { return this[IMAGE]; }
    get frames() {
        return new Proxy(this, {
            get(target, index) {
                if(index === 'length') { return target[FRAMES][index]; }
                return new Proxy([...target[FRAMES][index], target[WIDTH], target[HEIGHT]], {
                    get(target, prop) {
                        if(['x', 'y', 'w', 'h'].indexOf(prop) !== -1) {
                            prop = ['x', 'y', 'w', 'h'].indexOf(prop);
                        }
                        return target[prop];
                    }
                });
            },
            set() { throw new TypeError('Sprite frames are read-only'); }
        });
    }

    draw(subimage, x, y) {
        draw.sprite(this, subimage, x, y);
    }
};

export default {Sprite};