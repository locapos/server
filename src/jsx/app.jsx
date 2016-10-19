'use strict';

const MapView = require('./map-view.jsx')
    , MapParams = require('./map-params.jsx')
    , MapLayer = require('./map-layer.jsx')
    , Io = require('./io.jsx')
    , Mdl = require('./mdl.jsx')
    , ThemeHelper = require('./theme-helper.jsx');

/* setup map */
let canvas = document.getElementById('map-canvas');
let mapView = new MapView(canvas);

let trafficLayer = new MapLayer(mapView, new google.maps.TrafficLayer());

// Create a div to hold the control.
let controlDiv = Mdl.createElement('div', 'additional-control');
let checkTrafficLayer = Mdl.createCheckbox('Traffic Layer', 'trafficLayer', controlDiv);
mapView.addControl(google.maps.ControlPosition.RIGHT_TOP, controlDiv);

/* handle map events */
mapView.on('maptypeid_changed', () => {
  let type = mapView.getMapType();
  ThemeHelper.setColor(type === MapParams.NIGHT_MODE ? "#263238" : "#4DB6AC");
});
google.maps.event.addDomListener(checkTrafficLayer.ui, 'change', function(){
  trafficLayer.setVisible(checkTrafficLayer.ui.checked);
});

// Require: Firefox or Chrome(need experimental flags)
let preferredMode = google.maps.MapTypeId.ROADMAP;
window.addEventListener('devicelight', function(event){
  let mode = google.maps.MapTypeId.ROADMAP;
  if(event.value < 45){
    mode = nightMode;
  }
  if(mode === preferredMode) return;
  preferredMode = mode;
  mapView.setMapType(mode);
});

(new Io(mapView)).start();
