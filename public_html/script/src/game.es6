'use strict';

import event from './event.es6';

const [GENERATOR, LOOP, PAUSED] = [Symbol('GENERATOR'), Symbol('LOOP'), Symbol('PAUSED')];

export const Game = class {
    constructor(step) {
        if(typeof step !== 'function') { throw new TypeError('step must be a function'); }
        this[LOOP] = true;
        this[PAUSED] = false;
        const game = this;
        this[GENERATOR] = function*() {
            while(game[LOOP]) {
                if(game[PAUSED]) { yield; }
                event.trigger();
                step();
                yield setTimeout(() => game[GENERATOR].next(), 1000/30);
            }
        }();
        this[GENERATOR].next();
    }
    
    end() { this[LOOP] = false; }

    get paused() { return this[PAUSED]; }
    pause() { this[PAUSED] = true; }
    unpause() {
        if(this[PAUSED]) {
            this[PAUSED] = false;
            this[GENERATOR].next();
        }
    }
};

export default {Game};
