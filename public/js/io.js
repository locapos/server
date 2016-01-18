var markers = {};

function update(obj){
  var key = obj.provider + ':' + obj.id;
  var opt = {
    position: new google.maps.LatLng(obj.latitude, obj.longitude),
	labelContent: obj.name,
	labelAnchor: new google.maps.Point(22, 0),
	labelClass: 'labels',
	labelStyle: {opacity: 0.75}
  };
  if(markers[key] === undefined){
    markers[key] = new MarkerWithLabel(opt);
    markers[key].setMap(map);
  }
  markers[key].setOptions(opt);
}

var socket = io();
socket.on('update', function(msg){
  var obj = JSON.parse(msg) || [];
  for(var i = 0; i < obj.length; ++i){
    update(obj[i]);
  }
});
