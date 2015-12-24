'use strict';

import {expect} from 'chai';
import {stub, useFakeTimers} from 'sinon';
import $ from 'jquery';

import {Sprite} from '../../../script/src/sprite.es6';
import {Actor} from '../../../script/src/actor.es6';
import {$canvas} from '../../../script/src/canvas.es6';
import draw from '../../../script/src/draw.es6';
import event from '../../../script/src/event.es6';

describe('actor.es6', () => {
    const img = new Image(); img.src = '../../../image/water.png';
    const spr = new Sprite(img, 32, 64, [[0, 0], [32, 0], [64, 0], [0, 64], [32, 64], [64, 64]]);
    const MyActor = class extends Actor {};
    const act = new MyActor();

    describe('Actor', () => {
        it('should have to be subclassed (Actor is "abstract")', () => {
            expect(() => new Actor()).to.throw(TypeError);
            expect(new MyActor()).to.be.an.instanceof(Actor);
            expect(new MyActor()).to.be.an.instanceof(MyActor);
        });

        it('should have no event callbacks when super(opts) is passed noEvents', () => {
            const on = stub(event, 'on');
            const A = class extends Actor {constructor() { super({noOpts: true}); }};
            new A();
            expect(on).to.not.have.been.called;
            on.restore();
        });

        describe('#x', () => {
            it('should return the x position of the Actor', () => {
                expect(act.x).to.equal(0);
            });
        });
        describe('#x=', () => {
            it('should set the x position of the Actor', () => {
                expect(act.x).to.equal(0);
                act.x = 5;
                expect(act.x).to.equal(5);
                act.x = 0;
                expect(act.x).to.equal(0);
            });
            it('should not allow setting to non-numbers', () => {
                expect(() => act.x = 'cat').to.throw(TypeError);
            });
        });

        describe('#y', () => {
            it('should return the y position of the Actor', () => {
                expect(act.y).to.equal(0);
            });
        });
        describe('#y=', () => {
            it('should set the y position of the Actor', () => {
                expect(act.y).to.equal(0);
                act.y = 5;
                expect(act.y).to.equal(5);
                act.y = 0;
                expect(act.y).to.equal(0);
            });
            it('should not allow setting to non-numbers', () => {
                expect(() => act.y = 'cat').to.throw(TypeError);
            });
        });

        describe('#sprite', () => {
            it('should return the sprite of the Actor', () => {
                expect(act.sprite).to.deep.equal(new Sprite());
            });
        });
        describe('#sprite=', () => {
            it('should set the sprite of the Actor', () => {
                expect(act.sprite).to.deep.equal(new Sprite());
                act.sprite = spr;
                expect(act.sprite).to.deep.equal(spr);
            });
            it('should not allow setting to non-sprites', () => {
                expect(() => act.x = 'cat').to.throw(TypeError);
            });
        });

        describe('#frame', () => {
            it('should return the current frame of the sprite', () => {
                expect(act.frame).to.equal(0);
            });
        });
        describe('#frame=', () => {
            it('should set the current frame of the sprite', () => {
                act.frame = 3;
                expect(act.frame).to.equal(3);
            });
            it('should wrap when past the last frame in the sprite', () => {
                act.frame = 6;
                expect(act.frame).to.equal(0);
            });
            it('should not allow setting to non-numbers', () => {
                expect(() => act.frame = 'cat').to.throw(TypeError);
            });
        });

        describe('#step()', () => {
            it('exist, but not do anything (it can do anything)', () => {
                expect(act.step).to.be.a('function');
            });
        });

        describe('#draw()', () => {
            it('should draw the sprite (by default)', () => {
                const drawSprite = stub(draw, 'sprite');
                act.draw();
                setTimeout(() => {
                    expect(drawSprite).to.have.been.calledWith(act.sprite, act.frame, act.x, act.y);
                }, 0);
                drawSprite.restore();
            });
        });

        describe('#mouse', () => {
            let mouse, clock;
            beforeEach(() => mouse = stub(act, 'mouse'));
            afterEach(() => mouse.restore());
            it('should be called every frame the mouse is pressed', () => {
                $canvas.trigger($.Event('mousedown', {which: 1}));
                event.trigger();
                event.trigger();
                event.trigger();
                $canvas.trigger($.Event('mouseup', {which: 1}));
                event.trigger();
                expect(mouse).to.have.been.calledThrice;
            });
            it('should ignore clicks outside of the canvas', () => {
                $(window).trigger($.Event('mousedown', {which: 1}));
                event.trigger();
                $(window).trigger($.Event('mouseup', {which: 1}));
                event.trigger();
                expect(mouse).to.not.have.been.called;
            });
        });
        describe('#mousedown', () => {
            let mouse;
            beforeEach(() => mouse = stub(act, 'mousedown'));
            afterEach(() => mouse.restore());
            it('should be called the first frame the mouse is pressed', () => {
                $canvas .trigger($.Event('mousedown', {which: 1}))
                        .trigger($.Event('mousedown', {which: 2}));
                event.trigger();
                $canvas .trigger($.Event('mouseup', {which: 1}))
                        .trigger($.Event('mouseup', {which: 2}));
                event.trigger();
                expect(mouse).to.have.been.calledTwice;
            });
            it('should ignore clicks outside of the canvas', () => {
                $(window)   .trigger($.Event('mousedown', {which: 1}))
                            .trigger($.Event('mousedown', {which: 2}));
                event.trigger();
                $(window)   .trigger($.Event('mouseup', {which: 1}))
                            .trigger($.Event('mouseup', {which: 2}));
                event.trigger();
                expect(mouse).to.not.have.been.called;
            });
        });
        describe('#mouseup', () => {
            let mouse;
            beforeEach(() => mouse = stub(act, 'mouseup'));
            afterEach(() => mouse.restore());
            it('should be called the first frame the mouse is unpressed', () => {
                $canvas .trigger($.Event('mousedown', {which: 1}))
                        .trigger($.Event('mousedown', {which: 2}));
                event.trigger();
                $canvas .trigger($.Event('mouseup', {which: 1}))
                        .trigger($.Event('mouseup', {which: 2}));
                event.trigger();
                expect(mouse).to.have.been.calledTwice;
            });
            it('should ignore clicks completely out of the canvas, but not if mousedown was on canvas', () => {
                $canvas     .trigger($.Event('mousedown', {which: 1}));
                $(window)   .trigger($.Event('mousedown', {which: 2}));
                event.trigger();
                $(window)   .trigger($.Event('mouseup', {which: 1}))
                            .trigger($.Event('mouseup', {which: 2}));
                event.trigger();
                expect(mouse).to.have.been.calledOnce;
            });
        });
    });
});