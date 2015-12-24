'use strict';

import {expect} from 'chai';
import {spy, stub} from 'sinon';
import $ from 'jquery';

import {input} from '../../../script/src/input.es6';
import event from '../../../script/src/event.es6';

describe('event.es6', () => {
    describe('on(event, ...handlers)', () => {
        it('should add the handlers to the event', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mousedown', a, b, c);
            $(document).trigger($.Event('mousedown', {which: 2}));
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 2}));
            event.trigger();
            expect(b).to.have.been.calledOnce;
            expect(a).to.have.been.calledOnce;
            expect(c).to.have.been.calledOnce;
            event.off('mousedown', a, b, c);
        });
        it('should not call any of the handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mousedown', a);
            event.on('mousedown', b, c);
            expect(a).to.have.not.been.called;
            expect(b).to.have.not.been.called;
            expect(c).to.have.not.been.called;
            event.off('mousedown', a, b, c);
        });
        it('should be recallable', () => {
            const [a, b, c] = [()=>{}, ()=>{}, ()=>{}];
            expect(() => event.on('mousedown', a)('mousedown', b, c)).to.not.throw();
            event.off('mousedown', a, b, c);
        });
    });
    describe('off(event, ...handlers)', () => {
        it('should remove the handlers from the event', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mousedown', a, b, c);
            event.off('mousedown', a, b, c);
            $(document).trigger($.Event('mousedown', {which: 2}));
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 2}));
            event.trigger();
            expect(b).to.have.not.been.called;
            expect(a).to.have.not.been.called;
            expect(c).to.have.not.been.called;
        });
        it('should not call any of the handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mousedown', a, b, c);
            event.off('mousedown', a);
            event.off('mousedown', b, c);
            expect(a).to.have.not.been.called;
            expect(b).to.have.not.been.called;
            expect(c).to.have.not.been.called;
        });
        it('should be recallable', () => {
            expect(() => event.off('mousedown', ()=>{})('mousedown', ()=>{}, ()=>{})).to.not.throw();
        });
    });
    describe('trigger()', () => {
        it('should trigger all the handlers for events that have happened', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            $(document) .trigger($.Event('mousedown', {which: 1}))
                        .trigger($.Event('mouseup', {which: 3}))
                        .trigger($.Event('keydown', {which: 13}))
                        .trigger($.Event('keydown', {which: 27}));
            event.trigger();
            expect(a).to.have.not.been.called;
            expect(b).to.have.not.been.called;
            expect(c).to.have.not.been.called;
            event.on('mousedown', a)('mouseup', b)('keyheld', c);
            $(document) .trigger($.Event('mousedown', {which: 2}))
                        .trigger($.Event('mousedown', {which: 3}))
                        .trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            expect(a).to.have.been.calledWith(2);
            expect(a).to.have.been.calledWith(3);
            expect(a).to.have.been.calledTwice;
            expect(b).to.have.been.calledWith(1);
            expect(b).to.have.been.calledOnce;
            expect(c).to.have.been.calledWith(13);
            expect(c).to.have.been.calledWith(27);
            expect(c).to.have.been.calledTwice;
            a.reset(), b.reset(), c.reset();
            $(document) .trigger($.Event('mouseup', {which: 2}))
                        .trigger($.Event('mouseup', {which: 3}))
                        .trigger($.Event('keyup', {which: 27}));
            event.trigger();
            expect(a).to.not.have.been.called;
            expect(b).to.have.been.calledWith(2);
            expect(b).to.have.been.calledWith(3);
            expect(b).to.have.been.calledTwice;
            expect(c).to.have.been.calledWith(13);
            expect(c).to.have.been.calledOnce;
            a.reset(), b.reset(), c.reset();
            $(document).trigger($.Event('keyup', {which: 13}));
            event.trigger();
            expect(a).to.have.not.been.called;
            expect(b).to.have.not.been.called;
            expect(c).to.have.not.been.called;
            event.off('mousedown', a)('mouseup', b)('keyheld', c);
        });
        it('should refresh the standard input', () => {
            const refresh = stub(input, 'refresh');
            event.trigger();
            expect(refresh).to.have.been.called;
            refresh.restore();
        });
    });
    describe('event:mousedown', () => {
        it('should be triggered only the first frame the mouse is pressed', () => {
            const a = spy();
            event.on('mousedown', a);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mousedown', a);
            expect(a).to.have.been.calledOnce;
        });
        it('should call all handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mousedown', a)('mousedown', b, c);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mousedown', a, b, c);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;
            expect(c).to.have.been.calledOnce;
        });
        it('should ignore events off canvas', () => {
            const a = spy();
            event.on('mousedown', a);
            $(window).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            event.trigger();
            $(window).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mousedown', a);
            expect(a).to.not.have.been.called;
        });
    });
    describe('event:mouseheld', () => {
        it('should be triggered every frame the mouse is pressed', () => {
            const a = spy();
            event.on('mouseheld', a);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            event.trigger();
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mouseheld', a);
            expect(a).to.have.been.calledThrice;
        });
        it('should call all handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mouseheld', a)('mouseheld', b, c);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            event.trigger();
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mouseheld', a, b, c);
            expect(a).to.have.been.calledThrice;
            expect(b).to.have.been.calledThrice;
            expect(c).to.have.been.calledThrice;
        });
        it('should ignore events off canvas', () => {
            const a = spy();
            event.on('mouseheld', a);
            $(window).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            $(window).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mouseheld', a);
            expect(a).to.not.have.been.called;
        });
    });
    describe('event:mouseup', () => {
        it('should be triggered only the first frame the mouse is released', () => {
            const a = spy();
            event.on('mouseup', a);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.trigger();
            event.off('mouseup', a);
            expect(a).to.have.been.calledOnce;
        });
        it('should call all handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('mouseup', a)('mouseup', b, c);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            $(document).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mouseup', a, b, c);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;
            expect(c).to.have.been.calledOnce;
        });
        it('should ignore events off canvas', () => {
            const a = spy();
            event.on('mouseup', a);
            $(window).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            $(window).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mouseup', a);
            expect(a).to.not.have.been.called;
        });
        it('should not ignore events off canvas if they started on canvas', () => {
            const a = spy();
            event.on('mouseup', a);
            $(document).trigger($.Event('mousedown', {which: 1}));
            event.trigger();
            $(window).trigger($.Event('mouseup', {which: 1}));
            event.trigger();
            event.off('mouseup', a);
            expect(a).to.have.been.calledOnce;
        });
    });
    describe('event:keydown', () => {
        it('should be triggered only the first frame the key is pressed', () => {
            const a = spy();
            event.on('keydown', a);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            event.trigger();
            $(document).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keydown', a);
            expect(a).to.have.been.calledOnce;
        });
        it('should call all handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('keydown', a)('keydown', b, c);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            $(document).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keydown', a, b, c);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;
            expect(c).to.have.been.calledOnce;
        });
        it('should ignore events off canvas', () => {
            const a = spy();
            event.on('keydown', a);
            $(window).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            $(window).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keydown', a);
            expect(a).to.not.have.been.called;
        });
    });
    describe('event:keyheld', () => {
        it('should be triggered every frame the key is pressed', () => {
            const a = spy();
            event.on('keyheld', a);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            event.trigger();
            event.trigger();
            $(document).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keyheld', a);
            expect(a).to.have.been.calledThrice;
        });
        it('should call all handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('keyheld', a)('keyheld', b, c);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            event.trigger();
            event.trigger();
            $(document).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keyheld', a, b, c);
            expect(a).to.have.been.calledThrice;
            expect(b).to.have.been.calledThrice;
            expect(c).to.have.been.calledThrice;
        });
        it('should ignore events off canvas', () => {
            const a = spy();
            event.on('keyheld', a);
            $(window).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            event.trigger();
            event.trigger();
            $(window).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keyheld', a);
            expect(a).to.not.have.been.called;
        });
    });
    describe('event:keyup', () => {
        it('should be triggered only the first frame the key is released', () => {
            const a = spy();
            event.on('keyup', a);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            $(document).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.trigger();
            event.off('keyup', a);
            expect(a).to.have.been.calledOnce;
        });
        it('should call all handlers', () => {
            const [a, b, c] = [spy(), spy(), spy()];
            event.on('keyup', a)('keyup', b, c);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            $(document).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keyup', a, b, c);
            expect(a).to.have.been.calledOnce;
            expect(b).to.have.been.calledOnce;
            expect(c).to.have.been.calledOnce;
        });
        it('should ignore events off canvas', () => {
            const a = spy();
            event.on('keyup', a);
            $(window).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            $(window).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keyup', a);
            expect(a).to.not.have.been.called;
        });
        it('should not ignore events off canvas if the event started on canvas', () => {
            const a = spy();
            event.on('keyup', a);
            $(document).trigger($.Event('keydown', {which: 1}));
            event.trigger();
            $(window).trigger($.Event('keyup', {which: 1}));
            event.trigger();
            event.off('keyup', a);
            expect(a).to.have.been.calledOnce;
        });
    });
});