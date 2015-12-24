/*
    Run promise based generators automatically, hiding the callbacks
*/
'use strict';

export const run = (generator) => {
    const gen = generator();
    const {value} = gen.next();
    let proc, err;
    proc = (promised) => {
        const {done, value} = gen.next(promised);
        if(!done) {
            return value.then(proc).catch(err);
        } else {
            return value;
        }
    };
    err = (thrown) => {
        const {done, value} = gen.throw(thrown);
        if(!done) {
            return value.then(proc).catch(err);
        } else {
            throw value;
        }
    };
    return value.then(proc).catch(err);
};