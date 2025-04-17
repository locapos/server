'use strict';

const Hash = require('./hash.jsx');

class IoSession{
  constructor(markers){
    this.markers = markers;
  }

  start(){
    let socket = io();
    socket.on('connected', () => {
      socket.emit('init', location.pathname.substr(1));
    });
  
    socket.on('update', (msg = []) => {
      msg.forEach(o => this.markers.update(o));
    });
  
    socket.on('clear', (msg) => {
      this.markers.clear(msg);
    });
  
    socket.on('sync', (msg = []) => {
      this.markers.keys().forEach(k => this.markers.clear(k));
      msg.forEach(o => this.markers.update(o));
    });
  
    window.addEventListener('hashchange', () => {
      let id = Hash.info().id;
      // clear label style
      this.markers.values()
        .filter(m => ~(m.labelClass||'').indexOf('looking'))
        .forEach(i => i.setOptions({labelClass: 'labels'}));
      // update label style
      if(!id || !this.markers.containsKey(id)){ return; }
      this.markers.get(id).setOptions({labelClass: 'labels looking'});
      MapView.moveCenterTo(this.markers.get(id));
    });
  
    window.setTimeout(() => socket.emit('sync'), 2.5 * 60 * 1000); // send sync request every 2.5 minutes
  };
}

module.exports = IoSession;
