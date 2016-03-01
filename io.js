'use strict';

const db = require('./lib/db.js');

function sendLogs(socket){
  db.showLocations(socket.get('group'))
    .then(v => socket.emit('sync', JSON.stringify(v)));
}

function Io(server){
  // socket.io endpoint
  const io = require('socket.io')(server);

  // socket.io client management
  io.on('connection', socket => {
    socket.on('init', req => {
      socket.set('group', req || '0');
      socket.join(socket.get('group'));
      socket.on('sync', () => sendLogs(socket));
      sendLogs(socket);
    });
  });
  db.on('update', msg => {
    let obj = JSON.parse(msg);
    io.to(obj.key).emit('update', msg.value);
  });
  db.on('delete', msg => {
    io.to(obj.key).emit('clear', msg.value);
  });
}

module.exports = Io;
