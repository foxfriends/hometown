/*
 * Start the game server
 */
'use strict';
const express = require('express');
const socketIO = require('socket.io');
const db = require('./database');

const app = express();
const server = app.listen(8888, () => {
  console.log('Server started at 8888');
});
app.use('/', express.static('./public_html'));

const io = socketIO(server);

io.on('connection', socket => {
  socket.on('login', async (data, res) => {
    const errors = await db.validLogin(data);
    res(errors);
  });
  socket.on('signup', async (data, res) => {
    const errors = await db.createAccount(data);
    res(errors);
  });
});
