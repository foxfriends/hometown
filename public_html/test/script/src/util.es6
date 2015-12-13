'use strict';

import {expect} from 'chai';

import util from '../../../script/src/util.es6';

describe('util.es6', () => {
    describe('Sequence', () => {
        it('should exist', () => {
            expect(util.Sequence).to.exist;
        });
    });
});