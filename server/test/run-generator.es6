'use strict';
import {expect} from 'chai';
import {run} from '../src/run-generator.es6';
import {spy, stub, useFakeTimers} from 'sinon';

describe('run-database.es6', () => {
    describe('run(gen*())', () => {
        let clock;
        beforeEach(() => { clock = useFakeTimers(); });
        afterEach(() => clock.restore());
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
        it('should return a Promise resolved with the return value', () => {
            run(function*() {
                yield new Promise((resolve, reject) => setTimeout(resolve, 10));
                yield new Promise((resolve, reject) => setTimeout(resolve, 10));
                return 32;
            }).then((v) => {
                expect(v).to.equal(32);
            });
            clock.tick(30);
        });
        it('should continue automatically using returned Promises', () => {
            const step = spy();
            run(function*() {
                yield new Promise((resolve, reject) => setTimeout(resolve, 10));
                step();
                yield new Promise((resolve, reject) => setTimeout(resolve, 10));
                step();
                yield new Promise((resolve, reject) => setTimeout(resolve, 10));
                step();
            }).then(() => {
                expect(step).to.have.been.calledThrice;
            });
            clock.tick(40);
        });
    });
});