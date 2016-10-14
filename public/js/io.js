'use strict';

(function(){
  var markers = {};

  function update(obj){
    var key = obj.provider + ':' + obj.id;
    var icon = MapView.createMarkerIcon(0, obj.heading);
    var opt = {
      position: new google.maps.LatLng(obj.latitude, obj.longitude),
      icon: icon,
      labelContent: obj.name,
      labelAnchor: new google.maps.Point(32, -10),
      labelClass: 'labels ' + (Hash.isLooking(key) ? 'looking' : ''),
      labelStyle: {opacity: 0.75},
      key: key
    };
    if(markers[key] === undefined){
      markers[key] = MapView.createLabeledMarker(opt);
    }else{
      MapView.createTrackingDot(markers[key]);
      markers[key].setOptions(opt);
    }
    if(Hash.isLooking(key)){
      MapView.moveCenterTo(markers[key]);
    }
  }

  function clear(key){
    if(markers[key] === undefined) { return; }
    // clear marker from map
    markers[key].setMap(undefined);
    delete markers[key];
  }

  var socket = io();
  socket.on('connected', function(){
    socket.emit('init', location.pathname.substr(1));
  });

  socket.on('update', function(msg){
    var obj = msg || [];
    for(var i = 0; i < obj.length; ++i){
      update(obj[i]);
    }
  });

  socket.on('clear', function(msg){
    clear(msg);
  });

  socket.on('sync', function(msg){
    var keys = Object.keys(markers);
    for(var i = 0; i < keys.length; ++i){
      clear(keys[i]);
    }
    var obj = msg || [];
    for(var i = 0; i < obj.length; ++i){
      update(obj[i]);
    }
  });

  window.addEventListener('hashchange', function(){
    var id = Hash.info().id;
    // clear label style
    var list = Object.keys(markers)
      .map(function(k){return markers[k];})
      .filter(function(m){return (m.labelClass||"").indexOf("looking")>=0;});
    for(var i = 0; i < list.length; ++i){
      list[i].setOptions({labelClass: 'labels'});
    }
    // update label style
    if(!id){
      return;
    }else if(markers[id]){
      markers[id].setOptions({labelClass: 'labels looking'});
    }else{ return; }
    MapView.moveCenterTo(markers[id]);
  });

  window.setTimeout(function(){
    socket.emit('sync');
  }, 2.5 * 60 * 1000); // send sync request every 2.5 minutes
})();
