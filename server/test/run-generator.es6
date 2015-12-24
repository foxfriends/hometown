'use strict';
import {expect} from 'chai';
import {run} from '../src/run-generator.es6';
import {spy, stub} from 'sinon';

describe('run-database.es6', () => {
    describe('run(gen*())', () => {
        it('should start the generator', () => {
            const next = stub().returns({
                done: true,
                value: new Promise((resolve, reject) => {
                    setTimeout(() => resolve({done: true, value: undefined}), 100);
                })
            });
            run(() => ({
                next: next
            }));
            expect(next).to.have.been.calledOnce;
        });
        it('should continue automatically using returned Promises', (done) => {
            const step = stub().returns();
            run(function*() {
                yield new Promise((res, rej) => setTimeout(res, 0));
                yield new Promise((res, rej) => setTimeout(res, 0));
                yield new Promise((res, rej) => setTimeout(res, 0));
                done();
            });
        });
        it('should return a Promise resolved with the return value', (done) => {
            run(function*() {
                yield new Promise((resolve, reject) => setTimeout(resolve, 0));
                yield new Promise((resolve, reject) => setTimeout(resolve, 0));
                return 32;
            }).then((val) => {
                expect(val).to.equal(32);
                done();
            });
        });
        it('should throw inside the generator if the promise is rejected', (done) => {
            run(function*() {
                try {
                    yield new Promise((res, rej) => setTimeout(res, 0));
                    yield new Promise((res, rej) => setTimeout(() => rej('Error'), 0));
                    yield new Promise((res, rej) => setTimeout(res, 0));
                } catch(err) {
                    expect(err).to.equal('Error');
                    done();
                }
            });
        });
        it('should return a rejected promise if the generator throws', (done) => {
            run(function*() {
                yield new Promise((res, rej) => setTimeout(res, 0));
                yield new Promise((res, rej) => setTimeout(res, 0));
                throw "Error";
            }).catch((err) => {
                expect(err).to.equal('Error');
                done();
            });
        });
    });
});