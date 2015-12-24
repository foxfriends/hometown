/*
    Processes input and provides an easy way to check the state of the keyboard
    and mouse
*/
'use strict';
import $ from 'jquery';
import {$canvas} from './canvas.es6';

const [KEYS, MOUSE, MOUSE_POS] = [Symbol('KEYS'), Symbol('MOUSE'), Symbol('MOUSE_POS')];

export const InputState = class {
    constructor() {
        this[KEYS] = [[], []];
        this[MOUSE] = [[], []];
        this[MOUSE_POS] = [[0,0],[0,0],[0,0]];
    }

    mousedown(button) {
        if(isNaN(button) && typeof button === 'string') { button = InputState.mouse(button); }
        return this[MOUSE][1][button] && !this[MOUSE][0][button];
    }
    mouseup(button) {
        if(isNaN(button) && typeof button === 'string') { button = InputState.mouse(button); }
        return !this[MOUSE][1][button] && this[MOUSE][0][button];
    }

    get mousestate() {
        return new Proxy(this, {
            get(target, prop) {
                if(prop === Symbol.iterator) { return target[MOUSE][1][Symbol.iterator]; }
                if(prop === 'length') { return target[MOUSE][1].length; }
                if(prop === 'x') { return target[MOUSE_POS][1][0]; }
                if(prop === 'y') { return target[MOUSE_POS][1][1]; }
                if(isNaN(prop) && typeof prop === 'string') { prop = InputState.mouse(prop); }
                return !!target[MOUSE][1][prop];
            },
            set(target, prop, value) {
                if(prop === 'x') { target[MOUSE_POS][1][0] = value; }
                else if(prop === 'y') { target[MOUSE_POS][1][1] = value; }
                else {
                    if(isNaN(prop) && typeof prop === 'string') { prop = InputState.mouse(prop); }
                    target[MOUSE][1][prop] = value;
                }
                return true;
            }
        });
    }

    keydown(key) {
        if(isNaN(key) && typeof key === 'string') { key = InputState.keyboard(key); }
        return this[KEYS][1][key] && !this[KEYS][0][key];
    }
    keyup(key) {
        if(isNaN(key) && typeof key === 'string') { key = InputState.keyboard(key); }
        return !this[KEYS][1][key] && this[KEYS][0][key];
    }

    get keystate() {
        return new Proxy(this, {
            get(target, prop) {
                if(prop === Symbol.iterator) { return target[KEYS][1][Symbol.iterator]; }
                if(prop === 'length') { return target[KEYS][1].length; }
                if(isNaN(prop) && typeof prop === 'string') { prop = InputState.keyboard(prop); }
                return !!target[KEYS][1][prop];
            },
            set(target, prop, value) {
                if(isNaN(prop) && typeof prop === 'string') { prop = InputState.keyboard(prop); }
                target[KEYS][1][prop] = value;
                return true;
            }
        });
    }

    refresh() {
        this[KEYS][0] = [...this[KEYS][1]];
        this[MOUSE][0] = [...this[MOUSE][1]];
        this[MOUSE_POS][0] = [...this[MOUSE_POS][1]];
    }

    static mouse(str) {
        str = str.toUpperCase();
        switch(str) {
            case 'LEFT':    str = 1;   break;
            case 'MIDDLE':  str = 2;   break;
            case 'RIGHT':   str = 3;   break;
            default:
                throw new TypeError(`There is no button ${str}`);
        }
        return str;
    }

    static keyboard(str) {
        str = str.toUpperCase();
        switch(str) {
        case 'BACKSPACE':   str = 8;   break;
        case 'ENTER':       str = 13;  break;
        case 'SHIFT':       str = 16;  break;
        case 'CONTROL':
        case 'CTRL':        str = 17;  break;
        case 'ALT':         str = 18;  break;
        case 'ESCAPE':      str = 27;  break;
        case 'LEFT':        str = 37;  break;
        case 'UP':          str = 38;  break;
        case 'RIGHT':       str = 39;  break;
        case 'DOWN':        str = 40;  break;
        default:
            if(str.length === 1) {
                str = str.charCodeAt(0);
            } else if(str[0] === 'F' && str.length <= 3 && !isNaN(parseInt(str.substr(1, 2)))) { // Function keys
                str = 111 + parseInt(str.substr(1, 2));
            } else if(str[0] === 'N' && str.length === 2) { // Numpad
                str = 96 + parseInt(str[1]);
            } else {
                throw new TypeError('Key does not exist');
            }
        }
        return str;
    }
};

export const input = new InputState();

$(document)
    .mousedown(({which} = {which: 0}) => (input.mousestate[which] = true))
    .keydown(({which} = {which: 0}) => (input.keystate[which] = true))
    .mousemove(({clientX: x, clientY: y} = {clientX: 0, clientY: 0}) => (input.mousestate.x = x, input.mousestate.y = y));
$(window)
    .mouseup(({which} = {which: 0}) => (input.mousestate[which] = false))
    .keyup(({which} = {which: 0}) => (input.keystate[which] = false));

export default {input, InputState};