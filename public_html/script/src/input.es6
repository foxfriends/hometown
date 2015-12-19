/*
    Processes input and provides an easy way to check the state of the keyboard
    and mouse
*/
'use strict';
import $ from 'jquery';
import {$canvas} from './canvas.es6';

const [KEYS, MOUSE] = [Symbol('KEYS'), Symbol('MOUSE')];
const [CONVERT_KEYCODE, CONVERT_MOUSEBUTTON] = [Symbol('CONVERT_KEYCODE'), Symbol('CONVERT_MOUSEBUTTON')];

export const InputState = class {
    constructor() {
        this[KEYS] = [[], []];
        this[MOUSE] = [[], []];
    }

    mousedown(button) {
        if(isNaN(button) && typeof button === 'string') { button = this[CONVERT_MOUSEBUTTON](button); }
        return this[MOUSE][1][button] && !this[MOUSE][0][button];
    }
    mouseup(button) {
        if(isNaN(button) && typeof button === 'string') { button = this[CONVERT_MOUSEBUTTON](button); }
        return !this[MOUSE][1][button] && this[MOUSE][0][button];
    }

    get mousestate() {
        return new Proxy(this, {
            get(target, prop) {
                if(prop === Symbol.iterator) { return target[MOUSE][1][Symbol.iterator]; }
                if(prop === 'length') { return target[MOUSE][1].length; }
                if(isNaN(prop) && typeof prop === 'string') { prop = target[CONVERT_MOUSEBUTTON](prop); }
                return !!target[MOUSE][1][prop];
            },
            set(target, prop, value) {
                if(isNaN(prop) && typeof prop === 'string') { prop = target[CONVERT_MOUSEBUTTON](prop); }
                target[MOUSE][1][prop] = value;
                return true;
            }
        });
    }

    keydown(key) {
        if(isNaN(key) && typeof key === 'string') { key = this[CONVERT_KEYCODE](key); }
        return this[KEYS][1][key] && !this[KEYS][0][key];
    }
    keyup(key) {
        if(isNaN(key) && typeof key === 'string') { key = this[CONVERT_KEYCODE](key); }
        return !this[KEYS][1][key] && this[KEYS][0][key];
    }

    get keystate() {
        return new Proxy(this, {
            get(target, prop) {
                if(prop === Symbol.iterator) { return target[KEYS][1][Symbol.iterator]; }
                if(prop === 'length') { return target[KEYS][1].length; }
                if(isNaN(prop) && typeof prop === 'string') { prop = target[CONVERT_KEYCODE](prop); }
                return !!target[KEYS][1][prop];
            },
            set(target, prop, value) {
                if(isNaN(prop) && typeof prop === 'string') { prop = target[CONVERT_KEYCODE](prop); }
                target[KEYS][1][prop] = value;
                return true;
            }
        });
    }

    refresh() {
        this[KEYS][0] = [...this[KEYS][1]];
        this[MOUSE][0] = [...this[MOUSE][1]];
    }

    [CONVERT_MOUSEBUTTON](str) {
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

    [CONVERT_KEYCODE](str) {
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
            } else if(str[0] === 'F') { // Function keys
                str = 111 + parseInt(str[1]);
            } else if(str[0] === 'N') { // Numpad
                str = 96 + parseInt(str[1]);
            } else {
                throw new TypeError(`There is no key ${str}`);
            }
        }
        return str;
    }
};

export const input = new InputState();

$canvas
    .mousedown(({which} = {which: 0}) => input.mousestate[which] = true)
    .keydown(({which} = {which: 0}) => input.keystate[which] = true);
$(window)
    .mouseup(({which} = {which: 0}) => input.mousestate[which] = false)
    .keyup(({which} = {which: 0}) => input.keystate[which] = false);

export default {input, InputState};