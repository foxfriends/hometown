'use strict';

import {expect} from 'chai';

import util from '../../../script/src/util.es6';

describe('util.es6', () => {
    describe('Sequence', () => {
        const list = [1, 2, 3, 4, 5, 4, 3, 2];
        const x = new util.Sequence(...list);

        it('should be constructed with new Sequence(...elements)', () => {
            expect(() => util.Sequence()).to.throw(TypeError);
            expect(new util.Sequence(...list)).to.be.an('object');
        });

        it('should be an iterator', () => {
            expect(x.next().value).to.equal(list[0]);
            expect(x.next().value).to.equal(list[1]);
            expect(x.next().value).to.equal(list[2]);
            expect(x.next().value).to.equal(list[3]);
        });
        it('should be iterable', () => {
            expect([...x]).to.deep.equal(list);
        });

        describe('#operator[i]', () => {
            it('should allow access to the inner array', () => {
                expect(x[3]).to.equal(list[3]);
            });
            it('should produce the correct value at any index', () => {
                expect(x[3]).to.equal(list[3]);
                expect(x[10]).to.equal(list[10 % list.length]);
                expect(x[-5]).to.equal(list[list.length - 5]);
            });
        });

        describe('#operator[i]=', () => {
            it('should change the inner array', () => {
                expect(x[3] = 5).to.equal(5);
                expect(x[3]).to.equal(5);
                expect(x[3] = 4).to.equal(4);
                expect(x[3]).to.equal(4);
            });
        });

        describe('#current', () => {
            it('should return the current element, without changing it', () => {
                expect(x.current).to.equal(list[4]);
            });
            it('should be read only', () => {
                expect(() => x.current = 3).to.throw(TypeError);
            });
        });
        describe('#index', () => {
            it('should return the current index (less than length)', () => {
                expect(x.index).to.equal(4);
            });
        });
        describe('#index=', () => {
            it('should change the current index', () => {
                expect(x.index = 5).to.equal(5);
                expect(x.index = 10).to.equal(10);
                expect(x.index).to.equal(10 % x.length);
            });
        });

        describe('#length', () => {
            it('should return the number of items in the sequence', () => {
                expect(x.length).to.equal(list.length);
            });
            it('should be read only', () => {
                expect(() => x.length = 5).to.throw(TypeError);
            });
        });

        describe('#infinite()', () => {
            it('should be iterable and never stop', () => {
                let n = 0;
                for(let item of x.infinite()) {
                    expect(item).to.be.a('number');
                    n++;
                    if(n > 100) break;
                }
            });
        });
    });

    describe('Range', () => {
        const [min, max] = [10, 20];
        const [all, nat, even, odd] = [
            new util.Range(min, max, 0),
            new util.Range(min, max),
            new util.Range(min, max, 2),
            new util.Range(min + 1, max, 2)
        ];

        it('should be constructed with new Range(min, max, step = 1)', () => {
            expect(() => util.Range()).to.throw(TypeError);
            expect(new util.Range(min, max, 2)).to.be.an('object');
        });

        it('should be iterable', () => {
            expect([...nat]).to.deep.equal([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
            expect([...even]).to.deep.equal([10, 12, 14, 16, 18]);
        });

        it('should not be iterable with step = 0', () => {
            expect(() => [...all]).to.throw(TypeError);
        });

        describe('#operator in', () => {
            it('should include min', () => {
                expect(nat.min in nat).to.be.true;
                expect(even.min in even).to.be.true;
                expect(odd.min in odd).to.be.true;
                expect(all.min in all).to.be.true;
            });

            it('should not include max', () => {
                expect(nat.max in nat).to.be.false;
                expect(even.max in even).to.be.false;
                expect(odd.max in odd).to.be.false;
                expect(all.max in all).to.be.false;
            });

            it('should include intermediate values', () => {
                expect(15 in nat).to.be.true;
                expect(16 in even).to.be.true;
                expect(17 in odd).to.be.true;
                expect(10 + Math.PI in all).to.be.true;
            });

            it('should not include values that are stepped over', () => {
                expect(15.5 in nat).to.be.false;
                expect(15 in even).to.be.false;
                expect(16 in odd).to.be.false;
            });

            it('should not include values out of the range', () => {
                expect(5 in nat).to.be.false;
                expect(6 in even).to.be.false;
                expect(5 in odd).to.be.false;
                expect(5 in all).to.be.false;

                expect(25 in nat).to.be.false;
                expect(26 in even).to.be.false;
                expect(25 in odd).to.be.false;
                expect(25 in all).to.be.false;
            });
        });

        describe('#min', () => {
            it('should return the minimum value (in the range)', () => {
                expect(nat.min).to.equal(min);
                expect(even.min).to.equal(min);
                expect(odd.min).to.equal(min + 1);
                expect(all.min).to.equal(min);
            });
        });
        describe('#min=', () => {
            it('should change the min value', () => {
                nat.min = 3;
                expect(nat.min).to.equal(3);
                nat.min = min;
                expect(nat.min).to.equal(min);
            });
        });

        describe('#max', () => {
            it('should return the maximum value (not in the range)', () => {
                expect(nat.max).to.equal(max);
                expect(even.max).to.equal(max);
                expect(odd.max).to.equal(max);
                expect(all.max).to.equal(max);
            });
        });
        describe('#max=', () => {
            it('should change the max value', () => {
                nat.max = 3;
                expect(nat.max).to.equal(3);
                nat.max = max;
                expect(nat.max).to.equal(max);
            });
        });

        describe('#step', () => {
            it('should return the step of the range', () => {
                expect(nat.step).to.equal(1);
                expect(even.step).to.equal(2);
                expect(odd.step).to.equal(2);
                expect(all.step).to.equal(0);
            });
        });
        describe('#step=', () => {
            it('should change the step amount', () => {
                nat.step = 3;
                expect(nat.step).to.equal(3);
                nat.step = 1;
                expect(nat.step).to.equal(1);
            });
        });

        describe('#length', () => {
            it('should return the number of elements in the range', () => {
                expect(nat.length).to.equal(10);
                expect(even.length).to.equal(5);
                expect(odd.length).to.equal(5);
                expect(all.length).to.equal(Infinity);
            });

            it('should be read only', () => {
                expect(() => nat.length = 15).to.throw(TypeError);
            });
        });

        describe('#constrain(x)', () => {
            it('should return x as the nearest element in the range', () => {
                expect(nat.constrain(15.2)).to.equal(15);
                expect(even.constrain(15.2)).to.equal(16);
                expect(odd.constrain(15.2)).to.equal(15);
                expect(all.constrain(15.2)).to.equal(15.2);

                expect(nat.constrain(30)).to.equal(20);
                expect(even.constrain(30)).to.equal(20);
                expect(odd.constrain(30)).to.equal(20);
                expect(all.constrain(30)).to.equal(20);

                expect(nat.constrain(5)).to.equal(10);
                expect(even.constrain(5)).to.equal(10);
                expect(odd.constrain(5)).to.equal(11);
                expect(all.constrain(5)).to.equal(10);
            });
        });
    });

    describe('range(min, max, step = 0)', () => {
        it('should do the same as new Range(min, max, step = 0)', () => {
            expect(util.range(0, 10, 2)).to.deep.equal(new util.Range(0, 10, 2));
        });
    });

    describe('pad(str, len, char = \'\')', () => {
        it('should pad str with char at the front up to length len', () => {
            expect(util.pad('str', 7, 'x')).to.equal('xxxxstr');
            expect(util.pad('str', 5, 'x')).to.equal('xxstr');
            expect(util.pad('str', 3, 'x')).to.equal('str');
        });
        it('should throw an error if no char is provided', () => {
            expect(() => util.pad('str', 5)).to.throw(TypeError);
            expect(() => util.pad('str')).to.throw(TypeError);
        });
    });
});