var args = {};
var splited = location.search.substr(1).split('&');
for(var i = 0; i < splited.length; ++i){
  var kv = splited[i].split('=');
  args[kv[0]]=kv[1];
}

var latitude = 35.685825;
var longitude = 139.754441;
var zoomLevel = 9;

if(args['center']){
  var loc = args['center'].split(',');
  latitude = parseFloat(loc[0]) || latitude;
  longitude = parseFloat(loc[1]) || longitude;
}
if(args['zoom']){
  zoomLevel = parseInt(args['zoom']) || zoomLevel;
}

var canvas = document.getElementById('map-canvas');
var nightMode = "NightMode";
var mapOptions = {
  zoom: zoomLevel,
  center: new google.maps.LatLng(latitude,longitude),
  mapTypeControl: true,
  streetViewControl: false,
  scaleControl: true,
  mapTypeControlOptions: {
    mapTypeIds: [ google.maps.MapTypeId.ROADMAP, nightMode ]
  }
};
var mapStyles = [ { "stylers": [ { "invert_lightness": true } ] } ];

var map = new google.maps.Map(canvas, mapOptions);
var trafficLayer = new google.maps.TrafficLayer();
map.mapTypes.set(nightMode, new google.maps.StyledMapType(mapStyles, {name: nightMode}));

google.maps.event.addListenerOnce(map, 'idle', function(){
  map.mapTypes.roadmap.name='DayMode';
  map.setOptions({'mapTypeControl':true});
});
google.maps.event.addListener(map, 'maptypeid_changed', function(){
  var type = map.getMapTypeId();
  document.head.children.namedItem("theme-color").content =
    type === nightMode ? "#263238" : "#4DB6AC";
});

// Create a div to hold the control.
var controlDiv = document.createElement('div');
controlDiv.style.margin = '10px';
controlDiv.style.padding = '8px';
controlDiv.style.marginTop = '0px';
controlDiv.style.backgroundColor = '#fff';
controlDiv.style.borderRadius = '2px';

// Set CSS for the control border
var controlUI = document.createElement('input');
controlUI.type = 'checkbox';
controlUI.id = 'trafficLayer';
controlUI.style.verticalAlign = 'middle';
controlUI.style.margin = '0px';
controlDiv.appendChild(controlUI);

var controlText = document.createElement('label');
controlText.htmlFor = 'trafficLayer';
controlText.innerText = 'Traffic Layer';
controlText.style.marginLeft = '3px';
controlText.foreground = '#565656';
controlDiv.appendChild(controlText);

map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlDiv);
google.maps.event.addDomListener(controlUI, 'change', function(){
  trafficLayer.setMap(controlUI.checked ? map : null);
});

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
