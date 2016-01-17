var markers = {};

function update(obj){
  var key = obj.provider + ':' + obj.id;
  var opt = {
    latlng: new google.maps.LatLng(obj.latitude, obj.longitude)
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
  update(eval(msg));
});
