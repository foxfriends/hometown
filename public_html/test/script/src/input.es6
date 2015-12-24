'use strict';

import {expect} from 'chai';
import {spy} from 'sinon';
import $ from 'jquery';

import input from '../../../script/src/input.es6';
import {$canvas} from '../../../script/src/canvas.es6';

describe('input.es6', () => {
    describe('InputState', () => {
        const inp = new input.InputState();
        inp.keystate.escape = true;
        inp.mousestate.left = true;
        inp.mousestate.right = false;
        inp.refresh();

        it('should be constructed with new InputState()', () => {
            expect(() => input.InputState()).to.throw();
            expect(new input.InputState()).to.be.an.instanceof(input.InputState);
        });
        describe('#keystate', () => {
            it('note: is not an array - when possible make it one');
            it('should be iterable', () => {
                expect([...inp.keystate]).to.be.an('array');
                expect([...inp.keystate].length).to.equal(28);
            });
            describe('#length', () => {
                it('should return the length (1 + highest used key index)', () => {
                    expect(inp.keystate.length).to.equal(28);
                    inp.keystate.F1 = false;
                    expect(inp.keystate.length).to.equal(113);
                });
            });
            describe('#operator[k]', () => {
                it('should return the state of the given key', () => {
                    expect(inp.keystate[13]).to.be.false;
                    expect(inp.keystate[27]).to.be.true;
                });
                it('should allow name access to certain keys', () => {
                    expect(inp.keystate.enter).to.be.false;
                    expect(inp.keystate.escape).to.be.true;
                });
                it('should throw if a key is not defined', () => {
                    expect(() => inp.keystate.asdf).to.throw(TypeError);
                });
            });
            describe('#operator[k]=', () => {
                it('should set the keystate of the given key', () => {
                    expect(inp.keystate[13]).to.be.false;
                    inp.keystate[13] = true;
                    expect(inp.keystate[13]).to.be.true;
                    inp.keystate[13] = false;
                    expect(inp.keystate[13]).to.be.false;
                });
                it('should allow name access to certain keys', () => {
                    expect(inp.keystate[13]).to.be.false;
                    inp.keystate.enter = true;
                    expect(inp.keystate[13]).to.be.true;
                    inp.keystate.enter = false;
                    expect(inp.keystate[13]).to.be.false;

                    expect(inp.keystate[27]).to.be.true;
                    inp.keystate.escape = false;
                    expect(inp.keystate[27]).to.be.false;
                    inp.keystate.escape = true;
                    expect(inp.keystate[27]).to.be.true;
                });
                it('should throw if a key is not defined', () => {
                    expect(() => inp.keystate.asdf = 5).to.throw(TypeError);
                });
            });
        });
        describe('#keydown(key)', () => {
            it('should return true when the key was just pressed', () => {
                expect(inp.keydown(13)).to.be.false;
                inp.keystate[13] = true;
                expect(inp.keydown(13)).to.be.true;
                inp.keystate[13] = false;
                expect(inp.keydown(13)).to.be.false;
            });
            it('should not return true when the key was pressed before it was refreshed', () => {
                expect(inp.keydown(13)).to.be.false;
                inp.keystate[13] = true;
                expect(inp.keydown(13)).to.be.true;
                inp.refresh();
                expect(inp.keydown(13)).to.be.false;
                inp.keystate[13] = false;
                expect(inp.keydown(13)).to.be.false;
                inp.refresh();
                expect(inp.keydown(13)).to.be.false;
            });
            it('should accept name access to certain keys', () => {
                inp.keystate[13] = true;
                expect(inp.keydown('enter')).to.be.true;
                inp.keystate.enter = false;
                expect(inp.keydown('enter')).to.be.false;
            });
            it('should throw with an invalid name', () => {
                expect(() => inp.keydown('cat?')).to.throw(TypeError);
            });
        });
        describe('#keyup(key)', () => {
            it('should return true when the key was just released', () => {
                expect(inp.keyup(27)).to.be.false;
                inp.keystate[27] = false;
                expect(inp.keyup(27)).to.be.true;
                inp.keystate[27] = true;
                expect(inp.keyup(27)).to.be.false;
            });
            it('should not return true when the key was pressed before it was refreshed', () => {
                expect(inp.keyup(27)).to.be.false;
                inp.keystate[27] = false;
                expect(inp.keyup(27)).to.be.true;
                inp.refresh();
                expect(inp.keyup(27)).to.be.false;
                inp.keystate[27] = true;
                expect(inp.keyup(27)).to.be.false;
                inp.refresh();
                expect(inp.keyup(27)).to.be.false;
            });
            it('should accept name access to certain keys', () => {
                inp.keystate[27] = false;
                expect(inp.keyup('escape')).to.be.true;
                inp.keystate.escape = true;
                expect(inp.keyup('escape')).to.be.false;
            });
            it('should throw with an invalid name', () => {
                expect(() => inp.keyup('cat?')).to.throw(TypeError);
            });
        });

        describe('#mousestate', () => {
            it('note: is not an array - when possible make it one');
            it('should be iterable', () => {
                expect([...inp.mousestate]).to.deep.equal([false, true, false, false]);
            });
            describe('#length', () => {
                it('should return the length (1 + highest used button index)', () => {
                    expect(inp.mousestate.length).to.equal(4);
                });
            });
            describe('#x', () => {
                it('should return the mouse x position', () => {
                    expect(inp.mousestate.x).to.equal(0);
                });
                it('should be settable (even though the mouse doesn\'t move)', () => {
                    inp.mousestate.x = 10;
                    expect(inp.mousestate.x).to.equal(10);
                });
            });
            describe('#y', () => {
                it('should return the mouse y position', () => {
                    expect(inp.mousestate.y).to.equal(0);
                });
                it('should be settable (even though the mouse doesn\'t move)', () => {
                    inp.mousestate.y = 5;
                    expect(inp.mousestate.y).to.equal(5);
                });
            });
            describe('#operator[b]', () => {
                it('should return the state of the given button', () => {
                    expect(inp.mousestate[3]).to.be.false;
                    expect(inp.mousestate[1]).to.be.true;
                });
                it('should allow name access to certain buttons', () => {
                    expect(inp.mousestate.right).to.be.false;
                    expect(inp.mousestate.left).to.be.true;
                });
                it('should throw if a key is not defined', () => {
                    expect(() => inp.mousestate.asdf).to.throw(TypeError);
                });
            });
            describe('#operator[b]=', () => {
                it('should set the mousestate of the given button', () => {
                    expect(inp.mousestate[3]).to.be.false;
                    inp.mousestate[3] = true;
                    expect(inp.mousestate[3]).to.be.true;
                    inp.mousestate[3] = false;
                    expect(inp.mousestate[3]).to.be.false;
                });
                it('should allow name access to certain keys', () => {
                    expect(inp.mousestate[3]).to.be.false;
                    inp.mousestate.right = true;
                    expect(inp.mousestate[3]).to.be.true;
                    inp.mousestate.right = false;
                    expect(inp.mousestate[3]).to.be.false;

                    expect(inp.mousestate[1]).to.be.true;
                    inp.mousestate.left = false;
                    expect(inp.mousestate[1]).to.be.false;
                    inp.mousestate.left = true;
                    expect(inp.mousestate[1]).to.be.true;
                });
                it('should throw if a button is not defined', () => {
                    expect(() => inp.mousestate.asdf = 5).to.throw(TypeError);
                });
            });
        });

        describe('#mousedown(button)', () => {
            it('should return true when the button was just pressed', () => {
                expect(inp.mousedown(3)).to.be.false;
                inp.mousestate[3] = true;
                expect(inp.mousedown(3)).to.be.true;
                inp.mousestate[3] = false;
                expect(inp.mousedown(3)).to.be.false;
            });
            it('should not return true when the button was pressed before it was refreshed', () => {
                expect(inp.mousedown(3)).to.be.false;
                inp.mousestate[3] = true;
                expect(inp.mousedown(3)).to.be.true;
                inp.refresh();
                expect(inp.mousedown(3)).to.be.false;
                inp.mousestate[3] = false;
                expect(inp.mousedown(3)).to.be.false;
                inp.refresh();
                expect(inp.mousedown(3)).to.be.false;
            });
            it('should accept name access to certain buttons', () => {
                inp.mousestate[3] = true;
                expect(inp.mousedown('right')).to.be.true;
                inp.mousestate.right = false;
                expect(inp.mousedown('right')).to.be.false;
            });
            it('should throw with an invalid name', () => {
                expect(() => inp.mousedown('cat?')).to.throw(TypeError);
            });
        });
        describe('#mouseup(button)', () => {
            it('should return true when the button was just released', () => {
                expect(inp.mouseup(1)).to.be.false;
                inp.mousestate[1] = false;
                expect(inp.mouseup(1)).to.be.true;
                inp.mousestate[1] = true;
                expect(inp.mouseup(1)).to.be.false;
            });
            it('should not return true when the button was pressed before it was refreshed', () => {
                expect(inp.mouseup(1)).to.be.false;
                inp.mousestate[1] = false;
                expect(inp.mouseup(1)).to.be.true;
                inp.refresh();
                expect(inp.mouseup(1)).to.be.false;
                inp.mousestate[1] = true;
                expect(inp.mouseup(1)).to.be.false;
                inp.refresh();
                expect(inp.mouseup(1)).to.be.false;
            });
            it('should accept name access to certain buttons', () => {
                inp.mousestate[1] = false;
                expect(inp.mouseup('left')).to.be.true;
                inp.mousestate.left = true;
                expect(inp.mouseup('left')).to.be.false;
            });
            it('should throw with an invalid name', () => {
                expect(() => inp.mouseup('cat?')).to.throw(TypeError);
            });
        });

        describe('#refresh()', () => {
            it('should update the previous keystate', () => {
                inp.keystate.escape = false;
                inp.keystate.enter = true;
                expect(inp.keydown('enter')).to.be.true;
                expect(inp.keyup('escape')).to.be.true;
                inp.refresh();
                expect(inp.keydown('enter')).to.be.false;
                expect(inp.keyup('escape')).to.be.false;
                inp.keystate.escape = true;
                inp.keystate.enter = false;
                expect(inp.keyup('enter')).to.be.true;
                expect(inp.keydown('escape')).to.be.true;
                inp.refresh();
                expect(inp.keyup('enter')).to.be.false;
                expect(inp.keydown('escape')).to.be.false;
            });
            it('should not change the current keystate', () => {
                const list = [];
                for(let i = 0; i < 255; i++) {
                    list.push(inp.keystate[i]);
                }
                inp.refresh();
                for(let i = 0; i < 255; i++) {
                    expect(inp.keystate[i]).to.equal(list[i]);
                }
            });
            it('should update the previous mousestate', () => {
                inp.mousestate.left = false;
                inp.mousestate.right = true;
                expect(inp.mousedown('right')).to.be.true;
                expect(inp.mouseup('left')).to.be.true;
                inp.refresh();
                expect(inp.mousedown('right')).to.be.false;
                expect(inp.mouseup('left')).to.be.false;
                inp.mousestate.left = true;
                inp.mousestate.right = false;
                expect(inp.mouseup('right')).to.be.true;
                expect(inp.mousedown('left')).to.be.true;
                inp.refresh();
                expect(inp.mouseup('right')).to.be.false;
                expect(inp.mousedown('left')).to.be.false;
            });
            it('should not change the current mousestate', () => {
                const list = [];
                for(let i = 0; i <= 3; i++) {
                    list.push(inp.mousestate[i]);
                }
                inp.refresh();
                for(let i = 0; i <= 3; i++) {
                    expect(inp.mousestate[i]).to.equal(list[i]);
                }
            });
        });
        describe('#mouse(name)', () => {
            it('should be static', () => {
                expect(input.InputState.mouse).to.be.a('function');
            });
            it('should return the code associated with the name', () => {
                expect(input.InputState.mouse('left')).to.equal(1);
                expect(input.InputState.mouse('middle')).to.equal(2);
                expect(input.InputState.mouse('right')).to.equal(3);
            });
            it('should be case insensitive', () => {
                expect(input.InputState.mouse('LefT')).to.equal(1);
                expect(input.InputState.mouse('MIDdle')).to.equal(2);
                expect(input.InputState.mouse('RiGhT')).to.equal(3);
            });
            it('should throw on invalid names', () => {
                expect(() => input.InputState.mouse('not_mouse')).to.throw(TypeError);
            });
        });
        describe('#keyboard(name)', () => {
            it('should be static', () => {
                expect(input.InputState.keyboard).to.be.a('function');
            });
            it('should return the code associated with the name', () => {
                expect(input.InputState.keyboard('left')).to.equal(37);
                expect(input.InputState.keyboard('enter')).to.equal(13);
                expect(input.InputState.keyboard('escape')).to.equal(27);
            });
            it('should be case insensitive', () => {
                expect(input.InputState.keyboard('LeFT')).to.equal(37);
                expect(input.InputState.keyboard('ENter')).to.equal(13);
                expect(input.InputState.keyboard('EsCaPe')).to.equal(27);
                expect(input.InputState.keyboard('F3')).to.equal(114);
                expect(input.InputState.keyboard('N0')).to.equal(96);
            });
            it('should throw on invalid names', () => {
                expect(() => input.InputState.keyboard('F124')).to.throw(TypeError);
                expect(() => input.InputState.keyboard('FDB')).to.throw(TypeError);
            });
        });
    });
    describe('input', () => {
        it('should be an InputState', () => {
            expect(input.input).to.be.an.instanceof(input.InputState);
        });
        it('should automatically track the keyboard state (based on canvas interaction)', () => {
            $canvas.trigger($.Event('keydown', {which: 13}));
            expect(input.input.keystate[13]).to.be.true;
            $canvas.trigger($.Event('keyup', {which: 13}));
            expect(input.input.keystate[13]).to.be.false;
        });
        it('should automatically track the mouse state (based on canvas interaction)', () => {
            $canvas.trigger($.Event('mousedown', {which: 2}));
            expect(input.input.mousestate[2]).to.be.true;
            $canvas.trigger($.Event('mouseup', {which: 2}));
            expect(input.input.mousestate[2]).to.be.false;
        });
        it('should count as released even when not on the canvas', () => {
            $canvas.trigger($.Event('keydown', {which: 13}));
            expect(input.input.keystate[13]).to.be.true;
            $(window).trigger($.Event('keyup', {which: 13}));
            expect(input.input.keystate[13]).to.be.false;

            $canvas.trigger($.Event('mousedown', {which: 2}));
            expect(input.input.mousestate[2]).to.be.true;
            $(window).trigger($.Event('mouseup', {which: 2}));
            expect(input.input.mousestate[2]).to.be.false;
        });
        it('should track the mouse position',  () => {
            $(document).trigger($.Event('mousemove', {clientX: 5, clientY: 10}));
            expect(input.input.mousestate.x).to.equal(5);
            expect(input.input.mousestate.y).to.equal(10);
        });
    });
});