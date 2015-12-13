'use strict';

import {expect} from 'chai';
import $ from 'jquery';

import canvas from '../../../script/src/canvas.es6';

describe('canvas.es6', () => {
    it('should export canvas (DOM element)', () => {
        expect(canvas.canvas).to.be.instanceof(Element);
    });
    it('should export $canvas (jQuery object)', () => {
        expect(canvas.$canvas).to.be.instanceof($);
    });
    it('should export c2d (canvas.context2d)', () => {
        expect(canvas.c2d).to.equal(canvas.canvas.getContext('2d'));
    });
    it('should set the width and height of canvas', () => {
        expect(canvas.canvas.width).to.equal($(window).width());
        expect(canvas.canvas.height).to.equal($(window).height());
    });
});