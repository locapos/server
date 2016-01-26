var markers = {};

function update(obj){
  var key = obj.provider + ':' + obj.id;
  var icon = createMarkerIcon(0, obj.heading);
  var opt = {
    position: new google.maps.LatLng(obj.latitude, obj.longitude),
    icon: icon,
    labelContent: obj.name,
    labelAnchor: new google.maps.Point(32, -10),
    labelClass: 'labels ' + (Hash.isLooking(key) ? 'looking' : ''),
    labelStyle: {opacity: 0.75}
  };
  if(markers[key] === undefined){
    markers[key] = new MarkerWithLabel(opt);
    markers[key].setMap(map);
    markers[key].addListener('click', function(){ Hash.toggleLookingFor(key); });
  }else{
    createTrackingDot(map, markers[key]);
    markers[key].setOptions(opt);
  }
  if(Hash.isLooking(key)){
    map.setCenter(markers[key].getPosition());
  }
}

function clear(key){
  if(markers[key] === undefined) { return; }
  // clear marker from map
  markers[key].setMap(undefined);
  delete markers[key];
}

var socket = io();
socket.on('update', function(msg){
  var obj = JSON.parse(msg) || [];
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
  var obj = JSON.parse(msg) || [];
  for(var i = 0; i < obj.length; ++i){
    update(obj[i]);
  }
});

window.addEventListener('hashchange', function(){
  var id = Hash.info();
  if(!id || !markers[id]) return;
  map.setCenter(markers[id].getPosition());
});

window.setTimeout(function(){
  socket.emit('sync');
}, 2.5 * 60 * 1000); // send sync request every 2.5 minutes
