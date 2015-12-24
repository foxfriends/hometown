/*
    Custom event listeners which are triggered on command, based on when the
    built in event listeners catch their events
*/
'use strict';

import {input} from './input.es6';
import {range} from './util.es6';

let events = {
    'mouseheld': {
        trigger() {
            [...input.mousestate].forEach((is, button) => {
                if(is) {
                    for(let cb of this.callbacks) {
                        cb(button);
                    }
                }
            });
        }
    },
    'mousedown': {
        trigger() {
            for(let i of range(0, input.mousestate.length)) {
                if(input.mousedown(i)) {
                    for(let cb of this.callbacks) {
                        cb(i);
                    }
                }
            }
        }
    },
    'mouseup': {
        trigger() {
            for(let i of range(0, input.mousestate.length)) {
                if(input.mouseup(i)) {
                    for(let cb of this.callbacks) {
                        cb(i);
                    }
                }
            }
        }
    },
    'keyheld': {
        trigger() {
            [...input.keystate].forEach((is, key) => {
                if(is) {
                    for(let cb of this.callbacks) {
                        cb(key);
                    }
                }
            });
        }
    },
    'keydown': {
        trigger() {
            for(let i of range(0, input.keystate.length)) {
                if(input.keydown(i)) {
                    for(let cb of this.callbacks) {
                        cb(i);
                    }
                }
            }
        }
    },
    'keyup': {
        trigger() {
            for(let i of range(0, input.keystate.length)) {
                if(input.keyup(i)) {
                    for(let cb of this.callbacks) {
                        cb(i);
                    }
                }
            }
        }
    }
};

export const on = (event, ...handlers) => {
    if(events[event].callbacks === undefined) { events[event].callbacks = new Set(); }
    for(let handler of handlers) {
        events[event].callbacks.add(handler);
    }
    return on;
};

export const off = (event, ...handlers) => {
    for(let handler of handlers) {
        events[event].callbacks.delete(handler);
    }
    return off;
};

export const trigger = () => {
    for(let event in events) { events[event].trigger(); }
    input.refresh();
};

export default {on, off, trigger};