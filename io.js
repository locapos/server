'use strict';

const db = require('./db.js');

function sendLogs(socket){
  db.showLocations()
    .then(v => socket.emit('sync', JSON.stringify(v)));
}

function Io(server){
  // socket.io endpoint
  const io = require('socket.io')(server);

  // socket.io client management
  io.on('connection', socket => {
    socket.on('sync', () => sendLogs(socket));
    sendLogs(socket);
  });
  
  db.on('update', msg => {
    io.emit('update', msg);
  });
  db.on('delete', msg => {
    io.emit('clear', msg);
  });
}

module.exports = Io;
