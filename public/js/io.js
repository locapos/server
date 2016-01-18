var markers = {};

function update(obj){
  var key = obj.provider + ':' + obj.id;
  var opt = {
    position: new google.maps.LatLng(obj.latitude, obj.longitude),
    label: obj.name
  };
  if(markers[key] === undefined){
    markers[key] = new google.maps.Marker(opt);
    markers[key].setMap(map);
  }
  markers[key].setOptions(opt);
}

var socket = io();
socket.on('update', function(msg){
  console.log(msg);
  var obj = JSON.parse(msg) || [];
  for(var i = 0; i < obj.length; ++i){
    update(obj[i]);
  }
});
