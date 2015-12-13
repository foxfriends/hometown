'use strict';

import {expect} from 'chai';
import io from 'socket.io-client';

import socket from '../../../script/src/socket.es6';

describe('socket.es6', () => {
    it('should export socket (socket.io socket)', () => {
        expect(socket.socket).to.equal(io());
    });
});