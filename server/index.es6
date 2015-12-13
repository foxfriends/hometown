'use strict';
import express from 'express';
import socketIO from 'socket.io';

const app = express();
const server = app.listen(8888, () => {
    console.log('Server started at 8888');
});
app.use('/', express.static('./public_html'));

const io = socketIO(server);

io.on('connection', (socket) => {

});
