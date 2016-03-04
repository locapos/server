'use strict';

const db = require('./lib/db.js');

function sendLogs(socket){
  db.showLocations(socket.locapos_gid)
    .then(v => socket.emit('sync', v));
}

function Io(server){
  // socket.io endpoint
  const io = require('socket.io')(server);

  // socket.io client management
  io.on('connection', socket => {
    socket.emit('connected');
    socket.on('init', req => {
      socket.locapos_gid = req || '0';
      socket.join(socket.locapos_gid);
      socket.on('sync', () => sendLogs(socket));
      sendLogs(socket);
    });
  });
  db.on('update', msg => {
    io.to(msg.key).emit('update', msg.value);
  });
  db.on('delete', msg => {
    io.to(msg.key).emit('clear', msg.value);
  });
}

module.exports = Io;
