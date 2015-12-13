/*
    Share the same socket between files
*/
'use strict';

import io from 'socket.io-client';

export const socket = io();

export default {socket};