/*
    Various structures to make things easier
*/
'use strict';

const [ELEMENTS, INDEX] = [Symbol('ELEMENTS'), Symbol('INDEX')];

// A sequence of values, which loops around on itself as you iterate over it
export const Sequence = class {
    constructor(...elements) {
        this[ELEMENTS] = elements;
        this[INDEX] = 0;
    }

    get elements() {
        return new Proxy(this, {
            get(target, index) { return target[ELEMENTS][index]; },
            set() { throw 'Sequence elements are read-only'; }
        });
    }

    get length() { return this[ELEMENTS].length; }

    get current() { return this[ELEMENTS][this[INDEX]]; }

    get index() { return this[INDEX]; }
    set index(x) {
        this[INDEX] = x % this[ELEMENTS].length;
        return this[INDEX];
    }

    *[Symbol.iterator]() {
        yield* this[ELEMENTS];
    }

    get infinite() {
        const that = this;
        return function*() {
            while(true) yield that.next().value;
        }();
    }

    next() {
        return {done: false, value: this[ELEMENTS][this.index++]};
    }
};

const [MIN, MAX, STEP] = [Symbol('MIN'), Symbol('MAX'), Symbol('STEP')];
// A range of values (similar to Python)
export const Range = new Proxy(class {}, {
    construct(target, args) {
        let InternalRange = class {
            constructor(min, max, step = 1) {
                this[MIN] = min;
                this[MAX] = max;
                this[STEP] = step;
            }

            get min() { return this[MIN]; }
            get max() { return this[MAX]; }
            get step() { return this[STEP]; }
            get length() { return Math.ceil((this[MAX] - this[MIN]) / this[STEP]); }

            *[Symbol.iterator]() {
                for(let i = this[MIN]; i < this[MAX]; i += this[STEP]) {
                    yield i;
                }
            }
        };
        return new Proxy(new InternalRange(...args), {
            has(target, x) {
                return x >= target.min && x < target.max;
            }
        });
    }
});

// Function produces a range in array form
export const range = (...args) => [...new Range(...args)];

export default {Sequence, Range, range};