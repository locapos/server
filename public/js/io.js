var markers = {};

function createMarkerIcon(type, angle){
  return {
    url: '/res/0/' + parseInt(angle) + '.png',
    scaledSize: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(16, 16)
  };
}

function createTrackingDot(_map. _origin){
  var icon = {
    path: 0,
    strokeColor: 'Red',
    fillOpacity: 1,
    fillColor: 'Red',
    scale: 1.5
  }
  var dot = new google.maps.Marker({
    position: _origin.getPosition(),
    icon: icon
  });
  dot.setMap(_map);
}

function isLooking(id){
  var hash = location.hash.split('/')[1];
  return id === hash;
}

function update(obj){
  var key = obj.provider + ':' + obj.id;
  var icon = createMarkerIcon(0, obj.heading);
  var opt = {
    position: new google.maps.LatLng(obj.latitude, obj.longitude),
    icon: icon,
    labelContent: obj.name,
    labelAnchor: new google.maps.Point(32, -10),
    labelClass: 'labels ' + (isLooking() ? 'looking' : ''),
    labelStyle: {opacity: 0.75}
  };
  if(markers[key] === undefined){
    markers[key] = new MarkerWithLabel(opt);
    markers[key].setMap(map);
    markers[key].addListener('click', function(){
      location.hash = '#!/' + (isLooking() ? '' : key);
    });
  }else{
    createTrackingDot(markers[key]);
    markers[key].setOptions(opt);
  }
  if(looking){
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
    markers[keys[i]].setMap(undefined);
    delete markers[keys[i]];
  }
  var obj = JSON.parse(msg) || [];
  for(var i = 0; i < obj.length; ++i){
    update(obj[i]);
  }
});

window.addEventListener('hashchange', function(){
  var hash = location.hash.split('/');
  if(!hash || !markers[hash]) return;
  map.setCenter(markers[key].getPosition());
});

window.setTimeout(function(){
  socket.emit('sync');
}, 2.5 * 60 * 1000); // send sync request every 2.5 minutes
