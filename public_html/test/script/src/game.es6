'use strict';

import {expect} from 'chai';
import {spy, stub, useFakeTimers} from 'sinon';

import game from '../../../script/src/game.es6';
import event from '../../../script/src/event.es6';

describe('game.es6', () => {
    describe('Game', () => {
        const step = spy();
        let clock, gm, trigger;

        before(() => clock = useFakeTimers());
        beforeEach(() => {
            trigger = stub(event, 'trigger');
            gm = new game.Game(step);
        });
        afterEach(() => {
            gm.end();
            step.reset();
            trigger.restore();
        });
        after(() => {
            clock.restore();
        });

        it('should be constructed with new Game(step)', () => {
            expect(() => game.Game(() => {})).to.throw(TypeError);
            const g = new game.Game(() => {});
            expect(g).to.be.an.instanceof(game.Game);
            g.end();
        });
        it('should throw if a step is not a function', () => {
            expect(() => game.Game()).to.throw(TypeError);
            expect(() => game.Game(3)).to.throw(TypeError);
        });
        it('should run step 30 times per second', () => {
            clock.tick(999);
            expect(step).to.have.callCount(30);
        });
        it('should trigger events 30 times per second', () => {
            clock.tick(999);
            expect(trigger).to.have.callCount(30);
        });

        describe('#end()', () => {
            it('should end the game', () => {
                clock.tick(999);
                expect(step).to.have.callCount(30);
                gm.end();
                step.reset();
                trigger.reset();
                clock.tick(999);
                expect(step).to.not.have.been.called;
                expect(trigger).to.not.have.been.called;
            });
        });

        describe('#paused', () => {
            it('should return true if the game is paused, false if not', () => {
                expect(gm.paused).to.be.false;
                gm.pause();
                expect(gm.paused).to.be.true;
                gm.unpause();
                expect(gm.paused).to.be.false;
            });
        });
        describe('#pause()', () => {
            it('should pause the game', () => {
                gm.pause();
                step.reset();
                trigger.reset();
                clock.tick(999);
                expect(step).to.not.have.been.called;
                expect(trigger).to.not.have.been.called;
            });
        });
        describe('#unpause()', () => {
            it('should unpause the game', () => {
                gm.pause();
                step.reset();
                trigger.reset();
                clock.tick(999);
                gm.unpause();
                clock.tick(999);
                expect(trigger).to.have.callCount(30);
                expect(step).to.have.callCount(30);
            });
            it('should not throw if the game was not paused', () => {
                expect(gm.paused).to.be.false;
                expect(() => gm.unpause()).to.not.throw();
                expect(() => gm.unpause()).to.not.throw();
            });
        });
    });
});
