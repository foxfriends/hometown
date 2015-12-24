'use strict';

import {expect} from 'chai';
import {spy, stub} from 'sinon';

import {canvas, c2d} from '../../../script/src/canvas.es6';
import draw from '../../../script/src/draw.es6';
import {Sprite} from '../../../script/src/sprite.es6';

describe('draw.es6', () => {
    let ctx;
    before(() => {
        // Reset settings
        draw.setFont({reset: true});
        draw.setLine({reset: true});
        draw.setShadow({reset: true});
        ctx = {
            fillRect: stub(c2d, 'fillRect'),
            strokeRect: stub(c2d, 'strokeRect'),
            clearRect: stub(c2d, 'clearRect'),
            fillText: stub(c2d, 'fillText'),
            strokeText: stub(c2d, 'strokeText'),
            measureText: spy(c2d, 'measureText'),
            beginPath: spy(c2d, 'beginPath'),
            moveTo: spy(c2d, 'moveTo'),
            lineTo: spy(c2d, 'lineTo'),
            arc: spy(c2d, 'arc'),
            arcTo: spy(c2d, 'arcTo'),
            rect: spy(c2d, 'rect'),
            quadraticCurveTo: spy(c2d, 'quadraticCurveTo'),
            bezierCurveTo: spy(c2d, 'bezierCurveTo'),
            closePath: spy(c2d, 'closePath'),
            fill: stub(c2d, 'fill'),
            stroke: stub(c2d, 'stroke'),
            clip: stub(c2d, 'clip'),
            drawImage: stub(c2d, 'drawImage'),
            getImageData: stub(c2d, 'getImageData'),
            putImageData: stub(c2d, 'putImageData'),
            createImageData: stub(c2d, 'createImageData'),
            save: stub(c2d, 'save'),
            scale: stub(c2d, 'scale'),
            rotate: stub(c2d, 'rotate'),
            translate: stub(c2d, 'translate'),
            transform: stub(c2d, 'transform'),
            restore: stub(c2d, 'restore'),
        };
    });

    afterEach(() => {
        for(let i in ctx) {
            ctx[i].reset();
        }
    });

    after(() => {
        for(let i in ctx) {
            ctx[i].restore();
        }
    });

    describe('rect(x, y, w, h, stroke = false)', () => {
        it('should fill a rectangle with a falsey 5th parameter', () => {
            draw.rect(0, 0, 100, 100);
            expect(ctx.fillRect).to.have.been.calledWith(0, 0, 100, 100);
            expect(ctx.strokeRect).to.have.not.been.called;
        });
        it('should stroke a rectangle with a truthy 5th parameter', () => {
            draw.rect(0, 0, 100, 100, true);
            expect(ctx.fillRect).to.have.not.been.called;
            expect(ctx.strokeRect).to.have.been.calledWith(0, 0, 100, 100);
        });
    });
    describe('point(x, y)', () => {
        it('should fill a 1x1 px rectangle', () => {
            draw.point(0, 0);
            expect(ctx.fillRect).to.have.been.calledWith(0, 0, 1, 1);
        });
    });
    describe('circle(x, y, r, stroke = false)', () => {
        it('should fill a circle with a falsey 5th parameter', () => {
            draw.circle(0, 0, 5);
            expect(ctx.beginPath).to.have.been.calledOnce;
            expect(ctx.arc).to.have.been.calledWith(0, 0, 5);
            expect(ctx.fill).to.have.been.calledOnce;
            expect(ctx.stroke).to.have.not.been.called;
        });
        it('should stroke a circle with a truthy 5th parameter', () => {
            draw.circle(0, 0, 5, true);
            expect(ctx.beginPath).to.have.been.calledOnce;
            expect(ctx.arc).to.have.been.calledWith(0, 0, 5);
            expect(ctx.fill).to.have.not.been.called;
            expect(ctx.stroke).to.have.been.calledOnce;
        });
    });
    describe('text(str, x, y, stroke = false)', () => {
        it('should fill the text with a falsey 5th parameter', () => {
            draw.text('Hello World', 0, 0);
            expect(ctx.fillText).to.have.been.calledWith('Hello World', 0, 0);
            expect(ctx.strokeText).to.have.not.been.called;
        });
        it('should stroke the text with a truthy 5th parameter', () => {
            draw.text('Hello World', 0, 0, true);
            expect(ctx.fillText).to.have.not.been.called;
            expect(ctx.strokeText).to.have.been.calledWith('Hello World', 0, 0);
        });
    });
    describe('textWidth(text)', () => {
        it('should not draw any text', () => {
            draw.textWidth('Hello World');
            expect(ctx.measureText).to.have.been.calledWith('Hello World');
            expect(ctx.fillText).to.have.not.been.called;
            expect(ctx.strokeText).to.have.not.been.called;
        });
        it('return a number (the width of the text)', () => {
            draw.text('Hello World');
            expect(draw.textWidth('Hello World')).to.be.a('number');
        });
    });
    describe('image(image[, sx, sy, sw, sh], x, y[, w, h])', () => {
        it('should draw the image', () => {
            const img = new Image();
            draw.image(img, 0, 0, 32, 32, 0, 0, 32, 32);
            draw.image(img, 0, 0, 32, 32);
            draw.image(img, 0, 0);
            expect(ctx.drawImage).to.have.been.calledThrice;
            expect(ctx.drawImage).to.have.been.calledWith(img, 0, 0, 32, 32, 0, 0, 32, 32);
            expect(ctx.drawImage).to.have.been.calledWith(img, 0, 0, 32, 32);
            expect(ctx.drawImage).to.have.been.calledWith(img, 0, 0);
        });
    });
    describe('sprite(spr, subimage, x, y[, w, h])', () => {
        it('should draw the sprite with the correct subimage', () => {
            const img = new Image();
            const spr = new Sprite(img, 32, 32, [[0,0], [32, 0]]);
            draw.sprite(spr, 1, 0, 0);
            draw.sprite(spr, 0, 0, 0);
            expect(ctx.drawImage).to.have.been.calledWith(img, 0, 0, 32, 32, 0, 0, 32, 32);
            expect(ctx.drawImage).to.have.been.calledWith(img, 32, 0, 32, 32, 0, 0, 32, 32);
        });
        it('should not draw if the sprite has no image', () => {
            const spr = new Sprite();
            draw.sprite(spr, 1, 0, 0);
            expect(ctx.drawImage).to.have.not.been.called;
        });
        it('should draw the image stretched if dimensions are passed', () => {
            const img = new Image();
            const spr = new Sprite(img, 32, 32, [[0,0], [32, 0]]);
            draw.sprite(spr, 1, 0, 0, 64, 64);
            expect(ctx.drawImage).to.have.been.calledWith(img, 32, 0, 32, 32, 0, 0, 64, 64);
        });
    });
    describe('pixelData(pd, x, y)', () => {
        it('should be an alias for pd.draw(x, y)', () => {
            const pd = new draw.PixelData(32, 32);
            const fn = stub(pd, 'draw');
            draw.pixelData(pd, 32, 32);
            expect(fn).to.have.been.calledWith(32, 32);
            fn.restore();
        });
    });
    describe('clear()', () => {
        it('should clear the entire canvas', () => {
            draw.clear();
            expect(ctx.clearRect).to.have.been.calledWith(0, 0, canvas.width, canvas.height);
        });
    });
    describe('setColor(color)', () => {
        it('should set both stroke and fill colors', () => {
            draw.setColor('#ff0000');
            expect(c2d.fillStyle).to.equal('#ff0000');
            expect(c2d.strokeStyle).to.equal('#ff0000');
            draw.setColor('#0000ff');
            expect(c2d.fillStyle).to.equal('#0000ff');
            expect(c2d.strokeStyle).to.equal('#0000ff');
        });
        it('should accept numbers and convert them to strings', () => {
            draw.setColor(0xff0000);
            expect(c2d.fillStyle).to.equal('#ff0000');
            expect(c2d.strokeStyle).to.equal('#ff0000');
            draw.setColor(0x0000ff);
            expect(c2d.fillStyle).to.equal('#0000ff');
            expect(c2d.strokeStyle).to.equal('#0000ff');
        });
    });
    describe('setAlpha(alpha)', () => {
        it('should set the global alpha', () => {
            draw.setAlpha(0.5);
            expect(c2d.globalAlpha).to.equal(0.5);
            draw.setAlpha(1);
            expect(c2d.globalAlpha).to.equal(1);
        });
        it('should constrain alpha to range [0, 1]', () => {
            draw.setAlpha(-2);
            expect(c2d.globalAlpha).to.equal(0);
            draw.setAlpha(3);
            expect(c2d.globalAlpha).to.equal(1);
        });
    });
    describe('setComposite(composite)', () => {
        it('should set the global composite operation', () => {
            draw.setComposite('source-atop');
            expect(c2d.globalCompositeOperation).to.equal('source-atop');
            draw.setComposite('source-over');
            expect(c2d.globalCompositeOperation).to.equal('source-over');
        });
    });
    describe('setLine({cap, join, width, miter, reset = false})', () => {
        it('should set the appropriate line properties', () => {
            draw.setLine({cap: 'round'});
            expect(c2d.lineCap).to.equal('round');

            draw.setLine({width: 15});
            expect(c2d.lineCap).to.equal('round');
            expect(c2d.lineWidth).to.equal(15);

            draw.setLine({join: 'bevel'});
            expect(c2d.lineCap).to.equal('round');
            expect(c2d.lineWidth).to.equal(15);
            expect(c2d.lineJoin).to.equal('bevel');

            draw.setLine({miter: 15});
            expect(c2d.lineCap).to.equal('round');
            expect(c2d.lineWidth).to.equal(15);
            expect(c2d.lineJoin).to.equal('bevel');
            expect(c2d.miterLimit).to.equal(15);

            draw.setLine({cap: 'butt', width: 1, join: 'miter', miter: 10});
            expect(c2d.lineCap).to.equal('butt');
            expect(c2d.lineWidth).to.equal(1);
            expect(c2d.lineJoin).to.equal('miter');
            expect(c2d.miterLimit).to.equal(10);
        });
        it('should ignore other values if reset is true', () => {
            draw.setLine({reset: true, cap: 'round', width: 10});
            expect(c2d.lineCap).to.equal('butt');
            expect(c2d.lineWidth).to.equal(1);
            expect(c2d.lineJoin).to.equal('miter');
            expect(c2d.miterLimit).to.equal(10);
        });
    });

    describe('setShadow({x, y, blur, color, reset = false})', () => {
        it('should set the appropriate shadow properties', () => {
            draw.setShadow({x: 5});
            expect(c2d.shadowOffsetX).to.equal(5);

            draw.setShadow({y: 10});
            expect(c2d.shadowOffsetX).to.equal(5);
            expect(c2d.shadowOffsetY).to.equal(10);

            draw.setShadow({blur: 15});
            expect(c2d.shadowOffsetX).to.equal(5);
            expect(c2d.shadowOffsetY).to.equal(10);
            expect(c2d.shadowBlur).to.equal(15);

            draw.setShadow({color: 0xff0000});
            expect(c2d.shadowOffsetX).to.equal(5);
            expect(c2d.shadowOffsetY).to.equal(10);
            expect(c2d.shadowBlur).to.equal(15);
            expect(c2d.shadowColor).to.equal('#ff0000');

            draw.setShadow({color: '#0000ff'});
            expect(c2d.shadowOffsetX).to.equal(5);
            expect(c2d.shadowOffsetY).to.equal(10);
            expect(c2d.shadowBlur).to.equal(15);
            expect(c2d.shadowColor).to.equal('#0000ff');

            draw.setShadow({x: 0, y: 0, blur: 0, color: '#000000'});
            expect(c2d.shadowOffsetX).to.equal(0);
            expect(c2d.shadowOffsetY).to.equal(0);
            expect(c2d.shadowBlur).to.equal(0);
            expect(c2d.shadowColor).to.equal('#000000');
        });
        it('should ignore other values if reset is passed', () => {
            draw.setShadow({x: 5, y: 5, blur: 3, color: '#00FF00', reset: true});
            expect(c2d.shadowOffsetX).to.equal(0);
            expect(c2d.shadowOffsetY).to.equal(0);
            expect(c2d.shadowBlur).to.equal(0);
            expect(c2d.shadowColor).to.equal('#000000');
        });
    });

    describe('setFont({family, size, align, baseline, reset = false})', () => {
        it('should set the appropriate font properties', () => {
            draw.setFont({size: 15});
            expect(c2d.font).to.equal('15px sans-serif');

            draw.setFont({family: 'serif'});
            expect(c2d.font).to.equal('15px serif');

            draw.setFont({align: 'center'});
            expect(c2d.font).to.equal('15px serif');
            expect(c2d.textAlign).to.equal('center');

            draw.setFont({baseline: 'top'});
            expect(c2d.font).to.equal('15px serif');
            expect(c2d.textAlign).to.equal('center');
            expect(c2d.textBaseline).to.equal('top');

            draw.setFont({family: 'sans-serif', size: 10, align: 'start', baseline: 'alphabetic'});
            expect(c2d.font).to.equal('10px sans-serif');
            expect(c2d.textAlign).to.equal('start');
            expect(c2d.textBaseline).to.equal('alphabetic');
        });
        it('should ignore other values if reset is passed', () => {
            draw.setFont({family: 'serif', size: 15, align: 'top', baseline: 'middle', reset: true});
            expect(c2d.font).to.equal('10px sans-serif');
            expect(c2d.textAlign).to.equal('start');
            expect(c2d.textBaseline).to.equal('alphabetic');
        });
    });

    describe('transformed({scale: {x: 1, y: 1}, rotate, translate: {x: 0, y: 0}, transform: [1, 0, 0, 1, 0, 0]}, ...todo)', () => {
        it('should c2d.save() at the beginning, c2d.restore() at the end, and other functions inbetween', () => {
            const cb = spy();
            draw.transformed({scale: {x: 2, y: 2}, rotate: 50, translate: {x: 15, y: 30}, transform: [1, 0, 0, 1, 0, 0]}, cb);
            expect(ctx.save).to.have.been.calledBefore(ctx.scale);
            expect(ctx.scale).to.have.been.calledBefore(ctx.rotate);
            expect(ctx.rotate).to.have.been.calledBefore(ctx.translate);
            expect(ctx.translate).to.have.been.calledBefore(ctx.transform);
            expect(ctx.transform).to.have.been.calledBefore(cb);
            expect(cb).to.have.been.calledOnce;
            expect(ctx.restore).to.have.been.calledAfter(cb);
        });
        it('should call all functions passed in order', () => {
            const cbs = [spy(), spy(), spy()];
            draw.transformed({}, ...cbs);
            expect(cbs[0]).to.have.been.calledOnce;
            expect(cbs[0]).to.have.been.calledBefore(cbs[1]);
            expect(cbs[1]).to.have.been.calledOnce;
            expect(cbs[1]).to.have.been.calledBefore(cbs[2]);
            expect(cbs[2]).to.have.been.calledOnce;
        });
    });

    describe('Path', () => {
        it('should be constructed with new Path()', () => {
            expect(new draw.Path()).to.be.an.instanceof(draw.Path);
            expect(() => draw.Path()).to.throw(TypeError);
            expect(ctx.beginPath).to.not.have.been.called;
        });
        describe('#length', () => {
            it('should return the number of actions in the stack', () => {
                expect(new draw.Path().move().line().length).to.equal(2);
            });
            it('should not include the initial beginPath call', () => {
                expect(new draw.Path().length).to.equal(0);
            });
        });
        describe('#move(x, y)', () => {
            it('should add c2d.moveTo(x, y) to the stack', () => {
                const p = new draw.Path().move(32, 32);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.moveTo).to.have.been.calledWith(32, 32);
            });
            it('should not call c2d.moveTo(x, y)', () => {
                new draw.Path().move(32, 32);
                expect(ctx.moveTo).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().move(32, 32).move(16, 16)).to.not.throw();
            });
        });
        describe('#line(x, y)', () => {
            it('should add c2d.lineTo(x, y) to the stack', () => {
                const p = new draw.Path().line(32, 32);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.lineTo).to.have.been.calledWith(32, 32);
            });
            it('should not call c2d.lineTo(x, y)', () => {
                new draw.Path().line(32, 32);
                expect(ctx.lineTo).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().line(32, 32).line(16, 16)).to.not.throw();
            });
        });
        describe('#rect(x, y, w, h)', () => {
            it('should add c2d.rect(x, y, w, h) to the stack', () => {
                const p = new draw.Path().rect(16, 16, 32, 32);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.rect).to.have.been.calledWith(16, 16, 32, 32);
            });
            it('should not call c2d.rect(x, y)', () => {
                new draw.Path().rect(32, 32, 16, 16);
                expect(ctx.rect).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().rect(16, 16, 32, 32).rect(32, 32, 16, 16)).to.not.throw();
            });
        });
        describe('#arc(x, y, r, start, end[, ccw])', () => {
            it('should add c2d.arc(x, y, r, start, end[, ccw]) to the stack', () => {
                const p = new draw.Path().arc(32, 32, 32, 0, Math.PI, false);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.arc).to.have.been.calledWith(32, 32, 32, 0, Math.PI, false);
            });
            it('should not call c2d.arc(x, y, r, start, end[, ccw])', () => {
                new draw.Path().arc(32, 32, 32, 0, Math.PI, false);
                expect(ctx.arc).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().arc(32, 32, 32, 0, Math.PI, false).arc(32, 32, 32, 0, Math.PI, false)).to.not.throw();
            });
        });
        describe('#curve(x1, y1, x2, y2, r)', () => {
            it('should add c2d.arcTo(x1, y1, x2, y2, r) to the stack', () => {
                const p = new draw.Path().curve(32, 32, 32, 64, 32);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.arcTo).to.have.been.calledWith(32, 32, 32, 64, 32);
            });
            it('should not call c2d.arcTo(x1, y1, x2, y2, r)', () => {
                new draw.Path().curve(32, 32, 32, 64, 32);
                expect(ctx.arcTo).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().curve(32, 32, 32, 64, 32).curve(32, 96, 64, 96, 32)).to.not.throw();
            });
        });

        describe('#bezier(x1, y1, x2, y2[, x3, y3])', () => {
            it('should add c2d.quadraticCurveTo(x1, y1, x2, y2) to the stack when called with 4 arguments', () => {
                const p = new draw.Path().bezier(32, 32, 32, 64);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.quadraticCurveTo).to.have.been.calledWith(32, 32, 32, 64);
            });
            it('should add c2d.bezierCurveTo(x1, y1, x2, y2, x3, y3) to the stack when called with 6 arguments', () => {
                const p = new draw.Path().bezier(32, 32, 32, 64, 64, 64);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.bezierCurveTo).to.have.been.calledWith(32, 32, 32, 64, 64, 64);
            });
            it('should not call c2d.quadraticCurveTo(x1, y1, x2, y2) or c2d.bezierCurveTo(x1, y1, x2, y2, x3, y3)', () => {
                new draw.Path().bezier(32, 32, 32, 64).bezier(32, 32, 32, 64, 64, 64);
                expect(ctx.quadraticCurveTo).to.not.have.been.called;
                expect(ctx.bezierCurveTo).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().bezier(32, 32, 32, 64).bezier(32, 32, 32, 64, 64, 64).move(32, 32)).to.not.throw();
            });
        });

        describe('#close()', () => {
            it('should add c2d.closePath() to the stack', () => {
                const p = new draw.Path().close();
                expect(p.length).to.equal(1);
                p.stroke();
                expect(ctx.closePath).to.have.been.calledOnce;
            });
            it('should not call c2d.close', () => {
                new draw.Path().close();
                expect(ctx.closePath).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().close().close()).to.not.throw();
            });
        });

        describe('#do(fn)', () => {
            it('should add a given fn to the stack', () => {
                const cb = spy();
                const p = new draw.Path().do(cb);
                expect(p.length).to.equal(1);
                p.stroke();
                expect(cb).to.have.been.calledOnce;
            });
            it('should not call fn', () => {
                const cb = spy();
                const p = new draw.Path().do(cb);
                expect(cb).to.not.have.been.called;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().do(() => {}).do(() => {})).to.not.throw();
            });
        });

        describe('#fill({color, shadow, transform})', () => {
            it('should call c2d.save() at the beginning, c2d.restore() at the end, and c2d.fill() in the middle', () => {
                new draw.Path().move(32, 32).line(64, 64).fill();
                expect(ctx.save).to.have.been.calledBefore(ctx.fill);
                expect(ctx.fill).to.have.been.calledBefore(ctx.restore);
                expect(ctx.restore).to.have.been.called;
            });
            it('should set the color, shadow, and transform if they are specified', () => {
                new draw.Path().move(32, 32).do(() => {
                    expect(c2d.fillStyle).to.equal('#ff0000');
                    expect(c2d.shadowBlur).to.equal(5);
                    expect(ctx.translate).to.have.been.calledWith(5, 0);
                }).line(64, 64).fill({
                    color: 0xff0000,
                    shadow: {
                        blur: 5
                    },
                    transform: {
                        translate: {
                            x: 5
                        }
                    }
                });
            });
            it('should call the entire stack in order', () => {
                new draw.Path().move(32, 32).line(64, 64).arc(32, 32, 0, 0, 3).rect(32, 32, 32, 32).fill();
                expect(ctx.beginPath).to.have.been.calledBefore(ctx.moveTo);
                expect(ctx.moveTo).to.have.been.calledBefore(ctx.lineTo);
                expect(ctx.lineTo).to.have.been.calledBefore(ctx.arc);
                expect(ctx.arc).to.have.been.calledBefore(ctx.rect);
                expect(ctx.rect).to.have.been.calledBefore(ctx.fill);
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().fill().fill({transform: {}, shadow: {}, color: 0x000000})).to.not.throw();
            });
        });

        describe('#stroke({color, line, transform})', () => {
            it('should call c2d.save() at the beginning, c2d.restore() at the end, and c2d.stroke() in the middle', () => {
                new draw.Path().move(32, 32).line(64, 64).stroke();
                expect(ctx.save).to.have.been.calledBefore(ctx.stroke);
                expect(ctx.stroke).to.have.been.calledBefore(ctx.restore);
                expect(ctx.restore).to.have.been.called;
            });
            it('should set the color, line, and transform if they are specified', () => {
                new draw.Path().move(32, 32).do(() => {
                    expect(c2d.strokeStyle).to.equal('#ff0000');
                    expect(c2d.lineWidth).to.equal(5);
                    expect(ctx.translate).to.have.been.calledWith(5, 0);
                }).line(64, 64).stroke({
                    color: 0xff0000,
                    line: {
                        width: 5
                    },
                    transform: {
                        translate: {
                            x: 5
                        }
                    }
                });
            });
            it('should call the entire stack in order', () => {
                new draw.Path().move(32, 32).line(64, 64).arc(32, 32, 0, 0, 3).rect(32, 32, 32, 32).stroke();
                expect(ctx.beginPath).to.have.been.calledBefore(ctx.moveTo);
                expect(ctx.moveTo).to.have.been.calledBefore(ctx.lineTo);
                expect(ctx.lineTo).to.have.been.calledBefore(ctx.arc);
                expect(ctx.arc).to.have.been.calledBefore(ctx.rect);
                expect(ctx.rect).to.have.been.calledBefore(ctx.stroke);
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().stroke().stroke({transform: {}, line: '', color: 0x000000}).stroke()).to.not.throw();
            });
        });

        describe('#doInside([{transform},] ...todo)', () => {
            it('should call c2d.save() at the beginning, c2d.restore() at the end, and c2d.clip() in the middle', () => {
                new draw.Path().rect(32, 32, 64, 64).doInside(() => {});
                expect(ctx.save).to.have.been.calledBefore(ctx.clip);
                expect(ctx.clip).to.have.been.calledBefore(ctx.restore);
                expect(ctx.restore).to.have.been.called;
            });
            it('should set the transform if given', () => {
                new draw.Path().rect(32, 32, 64, 64).doInside({
                    translate: {
                        x: 5
                    }
                }, () => {
                    expect(ctx.translate).to.have.been.called;
                });
            });
            it('should call the entire stack in order', () => {
                new draw.Path().move(32, 32).line(64, 64).arc(32, 32, 0, 0, 3).rect(32, 32, 32, 32).doInside();
                expect(ctx.beginPath).to.have.been.calledBefore(ctx.moveTo);
                expect(ctx.moveTo).to.have.been.calledBefore(ctx.lineTo);
                expect(ctx.lineTo).to.have.been.calledBefore(ctx.arc);
                expect(ctx.arc).to.have.been.calledBefore(ctx.rect);
                expect(ctx.rect).to.have.been.calledBefore(ctx.clip);
            });
            it('should call all items in todo in order, after clipping', () => {
                const cbs = [spy(), spy(), spy()];
                new draw.Path().rect(32, 32, 64, 64).doInside(...cbs);
                expect(ctx.clip).to.have.been.calledBefore(cbs[0]);
                expect(cbs[0]).to.have.been.calledOnce;
                expect(cbs[0]).to.have.been.calledBefore(cbs[1]);
                expect(cbs[1]).to.have.been.calledOnce;
                expect(cbs[1]).to.have.been.calledBefore(cbs[2]);
                expect(cbs[2]).to.have.been.calledOnce;
            });
            it('should be chainable', () => {
                expect(() => new draw.Path().doInside({}, () => {}).doInside(() => {}).doInside()).to.not.throw();
            });
        });

        describe('#copy()', () => {
            it('should make an identical Path', () => {
                const p = new draw.Path().move(32, 32).line(64, 64);
                const c = p.copy();
                expect(c).to.be.an.instanceof(draw.Path);
                expect(c.length).to.deep.equal(p.length);
            });
            it('should not modify the original when the copy is changed used', () => {
                const p = new draw.Path().move(32, 32).line(64, 64);
                const c = p.copy().arc(64, 64, 32, 0, Math.PI * 2);
                expect(p.length).to.not.equal(c.length);
            });
        });

        describe('#contains([offx, offy,] x, y)', () => {
            it('should be true if the point is within the path', () => {
                expect(new draw.Path().move(0, 32).line(32, 32).contains(16, 32)).to.be.true;
                expect(new draw.Path().move(0, 32).line(32, 32).line(32, 64).contains(30, 34)).to.be.true;
            });
            it('should be true if the point is not within the path', () => {
                expect(new draw.Path().move(0, 32).line(32, 32).contains(48, 32)).to.be.false;
                expect(new draw.Path().move(0, 32).line(32, 32).contains(16, 16)).to.be.false;
            });
            it('should allow offsets to be specified', () => {
                expect(new draw.Path().move(0, 32).line(32, 32).line(32, 64).contains(130, 134)).to.be.false;
                expect(new draw.Path().move(0, 32).line(32, 32).line(32, 64).contains(100, 100, 130, 134)).to.be.true;
            });
        });
    });

    describe('PixelData', () => {
        const [width, height] = [32, 32];
        const pd = new draw.PixelData(width, height);
        it('should be constructed with new PixelData([x, y,] w, h)', () => {
            expect(new draw.PixelData(32, 32)).to.be.an.instanceof(draw.PixelData);
            expect(new draw.PixelData(16, 16, 16, 16)).to.be.an.instanceof(draw.PixelData);
            expect(ctx.createImageData).to.have.been.calledWith(32, 32);
            expect(ctx.getImageData).to.have.been.calledWith(16, 16, 16, 16);
            expect(() => draw.PixelData(32, 32)).to.throw(TypeError);
        });

        describe('#width', () => {
            it('should return the width of the PixelData', () => {
                expect(pd.width).to.equal(32);
            });
            it('should be read only', () => {
                expect(() => pd.width = 16).to.throw(TypeError);
            });
        });

        describe('#height', () => {
            it('should return the height of the PixelData', () => {
                expect(pd.height).to.equal(32);
            });
            it('should be read only', () => {
                expect(() => pd.height = 16).to.throw(TypeError);
            });
        });

        describe('#data[x][y]', () => {
            it('should return a pixel from the ImageData', () => {
                expect(pd.data[16][16]).to.deep.equal([0, 0, 0, 0]);
            });
        });

        describe('#data[x][y]=', () => {
            it('should be settable to change the ImageData', () => {
                pd.data[16][16] = [255, 0, 0, 255];
                expect(pd.data[16][16]).to.deep.equal([255, 0, 0, 255]);
                pd.data[16][16] = [0, 0, 0, 0];
                expect(pd.data[16][16]).to.deep.equal([0, 0, 0, 0]);
            });

            it('should not work with only one index', () => {
                expect(() => pd.data[16] = [255, 0, 0, 255]).to.deep.throw(TypeError);
            });
        });

        describe('#draw(x, y)', () => {
            it('should draw the PixelData', () => {
                pd.draw(32, 32);
                expect(ctx.putImageData).to.have.been.calledOnce;
            });
        });
    });
});
