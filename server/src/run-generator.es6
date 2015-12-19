/*
    Run promise based generators automatically, hiding the callbacks
*/
'use strict';

export const run = (generator) => {
    const gen = generator();
    const {value} = gen.next();
    const proc = (promised) => {
        const {done, value} = gen.next(promised);
        if(!done) {
            return value.then(proc).catch(console.error);
        } else {
            return value;
        }
    };
    return value.then(proc).catch(console.error);
};