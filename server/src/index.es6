/*
    Start the game server
*/
'use strict';
import express from 'express';
import socketIO from 'socket.io';
import db from './database.es6';
import {run} from './run-generator.es6';

const app = express();
const server = app.listen(8888, () => {
    console.log('Server started at 8888');
});
app.use('/', express.static('./public_html'));

const io = socketIO(server);

io.on('connection', (socket) => {
    socket.on('login', (data, res) => {
        run(function*() {
            const errors = yield db.validLogin(data);
            res(errors);
        });
    });
    socket.on('signup', (data, res) => {
        run(function*() {
            const errors = yield db.createAccount(data);
            res(errors);
        });
    });
});
