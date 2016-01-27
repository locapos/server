var canvas = document.getElementById('map-canvas');

var nightMode = "NightMode";
var mapOptions = {
  zoom: 9,
  center: new google.maps.LatLng(35.685825,139.754441),
  mapTypeControl: true,
  streetViewControl: false,
  scaleControl: true,
  mapTypeIds: [
    google.maps.MapTypeId.ROADMAP, nightMode
  ]
};
var mapStyles = [ { "stylers": [ { "invert_lightness": true } ] } ];

var map = new google.maps.Map(canvas, mapOptions);
map.mapTypes.set(nightMode, new google.maps.StyledMapType(mapStyles, {name: nightMode}));

function createMarkerIcon(type, angle){
  return {
    url: '/res/0/' + parseInt(angle) + '.png',
    scaledSize: new google.maps.Size(32, 32),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(16, 16)
  };
}

function createTrackingDot(_map, _origin){
  // check visible bounds
  if(!_map.getBounds().contains(_origin.getPosition())){
    return;
  }
  // create tracking dot
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
