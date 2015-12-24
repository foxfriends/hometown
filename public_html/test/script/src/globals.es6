'use strict';

import {expect} from 'chai';
import globals from '../../../script/src/globalss.es6';

describe('globals.es6', () => {
    describe('set(k, v)', () => {
        it('should save the value under the given key', () => {
            globals.set('test_key', 'test_value');
            expect(globals.get('test_key')).to.equal('test_value');
        });
    });
    describe('get(k)', () => {
        it('should get the value from the requested key', () => {
            globals.get('test_key', 'test_value');
            expect(globals.get('test_key')).to.equal('test_value');
        });
    });
    describe('remove(k)', () => {
        it('delete the value from the globals', () => {
            globals.remove('test_key');
            expect(globals.get('test_key')).to.not.exist;
        });
    });
});