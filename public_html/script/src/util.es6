/*
    Various structures to make things easier
*/
'use strict';

const [ELEMENTS, INDEX] = [Symbol('ELEMENTS'), Symbol('INDEX')];

// A sequence of values, which loops around on itself as you iterate over it
export const Sequence = new Proxy(class {}, {
    construct(target, args) {
        const InnerSequence = class {
            constructor(...elements) {
                this[ELEMENTS] = elements;
                this[INDEX] = 0;
            }

            get length() { return this[ELEMENTS].length; }

            get current() { return this[ELEMENTS][this[INDEX]]; }

            get index() { return this[INDEX]; }
            set index(x) {
                return (this[INDEX] = x % this[ELEMENTS].length);
            }

            *[Symbol.iterator]() {
                yield* this[ELEMENTS];
            }

            infinite() {
                const that = this;
                return function*() {
                    while(true) yield that.next().value;
                }();
            }

            next() {
                return {done: false, value: this[ELEMENTS][this.index++]};
            }
        };
        return new Proxy(new InnerSequence(...args), {
            get(target, prop) {
                return typeof prop !== 'symbol' && !isNaN(prop) ?
                    target[ELEMENTS][(target.length + prop % target.length) % target.length] :
                    target[prop];
            },
            set(target, prop, value) {
                if(typeof prop !== 'symbol' && !isNaN(prop)) {
                    target[ELEMENTS][(target.length + prop % target.length) % target.length] = value;
                    return true;
                } else {
                    target[prop] = value;
                    return true;
                }
            }
        });
    }
});

const [MIN, MAX, STEP] = [Symbol('MIN'), Symbol('MAX'), Symbol('STEP')];
// A range of values (similar to Python)
export const Range = new Proxy(class {}, {
    construct(target, args) {
        const InternalRange = class {
            constructor(min, max, step = 1) {
                this[MIN] = min;
                this[MAX] = max;
                this[STEP] = step;
            }

            get min() { return this[MIN]; }
            set min(x) { return (this[MIN] = x); }

            get max() { return this[MAX]; }
            set max(x) { return (this[MAX] = x); }

            get step() { return this[STEP]; }
            set step(x) { return (this[STEP] = x); }

            get length() { return Math.ceil((this[MAX] - this[MIN]) / this[STEP]); }

            *[Symbol.iterator]() {
                if(this[STEP] === 0) { throw new TypeError('Cannot iterate with 0 step'); }
                for(let i = this[MIN]; i < this[MAX]; i += this[STEP]) {
                    yield i;
                }
            }

            constrain(x) {
                if(this[STEP] !== 0) {
                    x = this[MIN] + Math.round((x - this[MIN]) / this[STEP]) * this[STEP];
                }
                return Math.min(Math.max(x, this[MIN]), this[MAX]);
            }
        };
        return new Proxy(new InternalRange(...args), {
            has(target, x) {
                return x >= target.min && x < target.max && (target.step === 0 || (x - target.min) % target.step === 0);
            }
        });
    }
});

// Function produces a range in array form
export const range = (...args) => new Range(...args);

// Pads str with char until its length is len
export const pad = (str, len = 0, char = '') => {
    if(char === '') { throw new TypeError('Cannot pad with no character'); }
    return (str.length >= len) ? str : pad(char + str, len, char);
};

export default {Sequence, Range, range, pad};