'use strict';

import {expect} from 'chai';
import {stub} from 'sinon';

import {Sprite} from '../../../script/src/sprite.es6';
import draw from '../../../script/src/draw.es6';

describe('sprite.es6', () => {
    const img = new Image();
    img.src = 'image.png';
    const spr = new Sprite(img, 32, 64, [[0, 0], [32, 0], [64, 0], [0, 64], [32, 64], [64, 64]]);

    describe('Sprite', () => {
        it('should be constructed with new Sprite(image, frameWidth, frameHeight, frames)', () => {
            expect(new Sprite('image.png', 32, 32, [[0, 0], [32, 0], [64, 0], [0, 32], [32, 32], [64, 32]]))
                .to.be.an.instanceof(Sprite);
            expect(new Sprite(img, 32, 64, [[0, 0], [32, 0], [64, 0], [0, 64], [32, 64], [64, 64]]))
                .to.deep.equal(spr);
        });
        it('should convert a URL for img to an Image object when constructed', () => {
            expect(new Sprite('image.png', 32, 32, [[0, 0], [32, 0], [64, 0], [0, 32], [32, 32], [32, 64]]).image)
                .to.be.an.instanceof(Image);
        });
        describe('#width', () => {
            it('should return the width of the Sprite', () => {
                expect(spr.width).to.equal(32);
            });
            it('should be read only', () => {
                expect(() => spr.width = 3).to.throw(TypeError);
            });
        });
        describe('#height', () => {
            it('should return the height of the Sprite', () => {
                expect(spr.height).to.equal(64);
            });
            it('should be read only', () => {
                expect(() => spr.height = 3).to.throw(TypeError);
            });
        });
        describe('#image', () => {
            it('should return the image that the Sprite uses', () => {
                expect(spr.image).to.be.an.instanceof(Image);
                expect(spr.image).to.equal(img);
            });
            it('should be read only', () => {
                expect(() => spr.height = new Image()).to.throw(TypeError);
            });
        });
        describe('#frames', () => {
            describe('#length', () => {
                it('should return the number of frames', () => {
                    expect(spr.frames.length).to.equal(6);
                });
                it('should be read only', () => {
                    expect(() => spr.frames.length = 3).to.throw(TypeError);
                });
            });
            describe('#operator[i]', () => {
                it('should return the i-th frame: [x, y, w, h]', () => {
                    expect(spr.frames[0]).to.deep.equal([0, 0, 32, 64]);
                    expect(spr.frames[4]).to.deep.equal([32, 64, 32, 64]);
                });
                it('should be read only', () => {
                    expect(() => spr.frames[0] = 5).to.throw(TypeError);
                });
            });
        });
        describe('#draw(subimage, x, y)', () => {
            it('should be an alias for draw.sprite(this, subimage, x, y)', () => {
                const drawSprite = stub(draw, 'sprite');
                spr.draw(1, 32, 32);
                expect(drawSprite).to.have.been.calledWith(spr, 1, 32, 32);
                drawSprite.restore();
            });
        });
    });
});