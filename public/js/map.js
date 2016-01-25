var canvas = document.getElementById('map-canvas');

var latlng = new google.maps.LatLng(35.685825,139.754441);

var mapOptions = {
  zoom: 9,
  center: latlng,
  mapTypeControl: false,
  streetViewControl: false,
};

var map = new google.maps.Map(canvas, mapOptions);

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