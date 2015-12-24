/*
    Breaks up an image into predefined sections
*/
'use strict';

import $ from 'jquery';
import draw from './draw.es6';

const [WIDTH, HEIGHT, IMAGE, FRAMES, LOADED] = [Symbol('WIDTH'), Symbol('HEIGHT'), Symbol('IMAGE'), Symbol('FRAMES'), Symbol('LOADED')];

export const Sprite = class {
    constructor(image, frameWidth, frameHeight, frames) {
        this[IMAGE] = image;
        this[LOADED] = true;
        if(typeof image === 'string') {
            this[IMAGE] = new Image();
            this[IMAGE].src = image;
            $(this[IMAGE]).load(() => {
                this[LOADED] = true;
                if(this[WIDTH] === undefined) {
                    this[WIDTH] = this[IMAGE].width;
                }
                if(this[HEIGHT] === undefined) {
                    this[HEIGHT] = this[IMAGE].height;
                }
            });
            this[LOADED] = false;
        }
        this[FRAMES] = frames || [[0, 0]];
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

    whenLoaded(fn) {
        if(fn !== undefined) {
            if(this[LOADED]) {
                fn();
            }
        }
        if(this[LOADED] || this[IMAGE].src === '') {
            return Promise.resolve();
        } else {
            return new Promise((resolve, reject) => {
                $(this[IMAGE]).load(resolve);
            });
        }
    }

    draw(subimage, x, y, w, h) {
        this.whenLoaded(() => draw.sprite(this, subimage, x, y, w, h));
    }
};

export default {Sprite};