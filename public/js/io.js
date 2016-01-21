var markers = {};

function update(obj){
  var key = obj.provider + ':' + obj.id;
  var hash = location.hash.split('/')[1];
  var icon = {
    url: '/res/0/' + parseInt(obj.heading) + '.png',
    scaledSize: new google.maps.Size(32, 32)
  };
  var opt = {
    position: new google.maps.LatLng(obj.latitude, obj.longitude),
    icon: icon,
    labelContent: obj.name,
    labelAnchor: new google.maps.Point(22, 0),
    labelClass: 'labels',
    labelStyle: {opacity: 0.75}
  };
  if(markers[key] === undefined){
    markers[key] = new MarkerWithLabel(opt);
    markers[key].setMap(map);
    markers[key].addListener('click', function(){
      location.hash = '#!/' + key;
    });
  }else{
    var track = new google.maps.Marker({
      position: markers[key].getPosition(),
      icon: {
        path: 0,
        strokeColor: 'Red',
        fillOpacity: 1,
        fillColor: 'Red',
        scale: 1.5
      }
    });
    track.setMap(map);
    markers[key].setOptions(opt);
  }
  if(hash === key){
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

window.addListener('hashchange', function(){
  var hash = location.hash.split('/');
  if(!hash || !markers[hash]) return;
  map.setCenter(markers[key].getPosition());
});
