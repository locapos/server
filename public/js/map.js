var canvas = document.getElementById('map-canvas');

var nightMode = "NightMode";
var mapOptions = {
  zoom: 9,
  center: new google.maps.LatLng(35.685825,139.754441),
  mapTypeControl: true,
  streetViewControl: false,
  scaleControl: true,
  mapTypeControlOptions: {
    mapTypeIds: [ google.maps.MapTypeId.ROADMAP, nightMode ]
  }
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
    url: '/res/99/0.png',
    scaledSize: new google.maps.Size(4, 4),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(2, 2)
  }
  var dot = new google.maps.Marker({
    position: _origin.getPosition(),
    icon: icon
  });
  dot.setMap(_map);
}

// Require: Firefox or Chrome(need experimental flags)
var preferredMode = google.maps.MapTypeId.ROADMAP;
window.addEventListener('devicelight', function(event){
  var mode = google.maps.MapTypeId.ROADMAP;
  if(event.value < 45){
    mode = nightMode;
  }
  if(mode === preferredMode) return;
  preferredMode = mode;
  map.setMapTypeId(mode);
});
