'use strict';

(function(){
  /* utilities */
  function parseQueryString(){
    var args = {};
    var splited = location.search.substr(1).split('&');
    for(var i = 0; i < splited.length; ++i){
      var kv = splited[i].split('=');
      args[kv[0]]=kv[1];
    }
    return args;
  }

  /* parse args */
  var qs = parseQueryString();
  var latitude = 35.685825;
  var longitude = 139.754441;
  var zoomLevel = 9;
  if(qs['center']){
    var loc = qs['center'].split(',');
    latitude = parseFloat(loc[0]) || latitude;
    longitude = parseFloat(loc[1]) || longitude;
  }
  if(qs['zoom']){
    zoomLevel = parseInt(qs['zoom']) || zoomLevel;
  }

  /* setup map */
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
  map.mapTypes.set(nightMode, new google.maps.StyledMapType(mapStyles, {name: nightMode}));
  var trafficLayer = new google.maps.TrafficLayer();

  // Create a div to hold the control.
  var controlDiv = Mdl.createElement('div', 'additional-control');
  var checkTrafficLayer = Mdl.createCheckbox('Traffic Layer', 'trafficLayer', controlDiv);
  map.controls[google.maps.ControlPosition.RIGHT_TOP].push(controlDiv);

  /* handle map events */
  google.maps.event.addListenerOnce(map, 'idle', function(){
    map.mapTypes.roadmap.name='DayMode';
    map.setOptions({'mapTypeControl':true});
  });
  google.maps.event.addListener(map, 'maptypeid_changed', function(){
    var type = map.getMapTypeId();
    document.head.children.namedItem("theme-color").content =
      type === nightMode ? "#263238" : "#4DB6AC";
  });
  google.maps.event.addDomListener(checkTrafficLayer.ui, 'change', function(){
    trafficLayer.setMap(checkTrafficLayer.ui.checked ? map : null);
  });

  var MapView = {};
  MapView.createMarkerIcon = function(type, angle){
    return {
      url: '/res/0/' + parseInt(angle) + '.png',
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(16, 16)
    };
  };
  MapView.createTrackingDot = function(_origin){
    // check visible bounds
    if(!map.getBounds().contains(_origin.getPosition())){
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
    dot.setMap(map);
  }
  MapView.moveCenterTo = function(_marker){
    map.setCenter(_maerker.getPosition());
  };
  MapView.createLabeledMarker = function(opt){
    var marker = new MarkerWithLabel(opt);
    marker.setMap(map);
    marker.addListener('click', function(){ Hash.toggleLookingFor(key); });
    return marker;
  };
  window.MapView = MapView;
})();

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
