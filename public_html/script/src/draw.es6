/*
    Wrapper around the default canvas drawing functions to make them more usable
    and easier to improve upon
*/
'use strict';
import {canvas, c2d} from './canvas.es6';

const [GENERATE, STACK, IMAGE_DATA] = [Symbol('GENERATE'), Symbol('STACK'), Symbol('IMAGE_DATA')];

export const rect = (x, y, w, h, stroke = false) => {
    if(stroke) {
        c2d.strokeRect(x, y, w, h);
    } else {
        c2d.fillRect(x, y, w, h);
    }
};

export const point = (x, y) => c2d.fillRect(x, y, 1, 1);

export const circle = (x, y, r, stroke = false) => {
    c2d.beginPath();
    c2d.arc(x, y, r, 0, Math.PI * 2);
    if(stroke) {
        c2d.stroke();
    } else {
        c2d.fill();
    }
};

export const text = (str, x, y, stroke = false) => {
    if(stroke) {
        c2d.strokeText(str, x, y);
    } else {
        c2d.fillText(str, x, y);
    }
};
export const textWidth = (str) => {
    return c2d.measureText(str).width;
};

export const image = (...args) => {
    c2d.drawImage(...args);
};

export const pixelData = (img, x, y) => {
    c2d.putImageData(img[IMAGE_DATA], x, y);
};

export const sprite = (sprite, subimage, x, y) => {
    c2d.drawImage(sprite.image, ...sprite.frames[subimage], x, y, sprite.frames[subimage].h, sprite.frames[subimage].w);
};

export const clear = () => c2d.clearRect(0, 0, canvas.width, canvas.height);

export const setColor = (c) => c2d.fillStyle = c2d.strokeStyle = c;
export const setAlpha = (a) => c2d.globalAlpha = a;
export const setComposite = (o) => c2d.globalCompositeOperation = o;

export const setLine = ({cap, join, width, miter} = {}) => {
    if(cap !== undefined)   { c2d.lineCap = cap; }
    if(join !== undefined)  { c2d.lineJoin = join; }
    if(width !== undefined) { c2d.lineWidth = width; }
    if(miter !== undefined) { c2d.miterLimit = miter; }
};
export const setShadow = ({x, y, blur, color, reset} = {}) => {
    if(reset === true) { return setShadow({x: 0, y: 0, blur: 0, color: 'black'}); }
    if(x !== undefined)     { c2d.shadowOffsetX = x; }
    if(y !== undefined)     { c2d.shadowOffsetY = y; }
    if(blur !== undefined)  { c2d.shadowBlur = blur; }
    if(color !== undefined) { c2d.shadowColor = color; }
};
export const setFont = ({font, align, baseline} = {}) => {
    if(font !== undefined)      { c2d.font = font; }
    if(align !== undefined)     { c2d.textAlign = align; }
    if(baseline !== undefined)  { c2d.textBaseline = baseline; }
};

// Transform the context and perform the given function(s)
export const transformed = (opts, ...todo) => {
    c2d.save();
    if(opts.scale)      { c2d.scale(opts.scale.x || 1, opts.scale.y || 1);}
    if(opts.rotate)     { c2d.rotate(opts.rotate); }
    if(opts.translate)  { c2d.translate(opts.translate.x || 0, opts.translate.y || 0); }
    if(opts.transform)  { c2d.transform(opts.transform); }

    for(let item of todo) { item(); }
    c2d.restore();
};

// Chained, saveable, easy to use context2d paths
export const Path = class {
    constructor() {
        this[STACK] = [() => c2d.beginPath()];
    }

    move(...args) {
        this[STACK].push(() => c2d.moveTo(...args));
        return this;
    }
    line(...args) {
        this[STACK].push(() => c2d.lineTo(...args));
        return this;
    }
    rect(...args) {
        this[STACK].push(() =>  c2d.rect(...args));
        return this;
    }
    arc(...args) {
        this[STACK].push(() => c2d.arc(...args));
        return this;
    }
    curve(...args) {
        this[STACK].push(() => c2d.arcTo(...args));
        return this;
    }
    bezier(...args) {
        if(args.length === 6) {
            this[STACK].push(() => c2d.bezierCurveTo(...args));
        } else {
            this[STACK].push(() => c2d.quadraticCurveTo(...args));
        }
        return this;
    }

    close() {
        this[STACK].push(() => c2d.closePath());
        return this;
    }

    fill({color, shadow, offset} = {}) {
        if(color !== undefined) { setColor(color); }
        if(shadow !== undefined) { setShadow(shadow); }
        if(offset !== undefined) {
            const [x, y] = [offset.x || 0, offset.y || 0];
            c2d.translate(x, y);
        }
        this[GENERATE]();
        c2d.fill();
        return this;
    }

    stroke({color, line, offset} = {}) {
        if(color !== undefined) { setColor(color); }
        if(line !== undefined) { setLine(line); }
        if(offset !== undefined) {
            const [x, y] = [offset.x || 0, offset.y || 0];
            c2d.translate(x, y);
        }
        this[GENERATE]();
        c2d.stroke();
        if(offset !== undefined) {
            const [x, y] = [offset.x || 0, offset.y || 0];
            c2d.translate(-x, -y);
        }
        return this;
    }

    doInside(opts, ...todo) {
        c2d.save();
        // Optional options
        if(typeof opts === 'function') {
            todo = [opts, ...todo];
        } else {
            const {offset} = opts;
            c2d.translate(offset.x || 0, offset.y || 0);
        }
        setShadow({reset: true});
        this[GENERATE]();
        c2d.clip();
        for(let item of todo) { item(); }
        c2d.restore();
        return this;
    }

    contains(...args) {
        this[GENERATE]();
        return c2d.isPointInPath(...args);
    }

    copy() {
        const cp = new Path();
        cp[STACK] = [...this[STACK]];
        return cp;
    }

    [GENERATE]() { for(let item of this[STACK]) { item(); } }
};

// 2D array wrapper around ImageData's 1D array
export const PixelData = class {
    constructor(...args) {
        this[IMAGE_DATA] = (args.length === 4) ? c2d.getImageData(...args) : c2d.createImageData(...args);
    }

    get width() { return this[IMAGE_DATA].width; }
    get height() { return this[IMAGE_DATA].height; }
    get data() {
        return new Proxy(this, {
            get(target, x) {
                x = parseInt(x);
                return new Proxy(target, {
                    get(target, y) {
                        const ind = 4 * (y * target[IMAGE_DATA].width + x);
                        return target[IMAGE_DATA].data.slice(ind, ind + 4);
                    },
                    set(target, y, value) {
                        const ind = 4 * (y * target[IMAGE_DATA].width + x);
                        [target[IMAGE_DATA].data[ind], target[IMAGE_DATA].data[ind + 1],
                         target[IMAGE_DATA].data[ind + 2], target[IMAGE_DATA].data[ind + 3]] = value;
                        return true;
                    }
                });
            },
            set() { throw 'Cannot set pixel with only one coordinate'; }
        });
    }
    draw(x, y) {
        c2d.putImageData(this[IMAGE_DATA], x, y);
    }
};

export default {
    rect, point, circle, text, textWidth, image, pixelData, sprite, clear,
    setColor, setAlpha, setComposite, setLine, setShadow, setFont, transformed,
    Path, PixelData
};