'use strict';

const MapView = require('./map-view.jsx')
    , MapParams = require('./map-params.jsx')
    , MapLayer = require('./map-layer.jsx')
    , Events = require('./events.jsx')
    , Io = require('./io.jsx')
    , ThemeHelper = require('./theme-helper.jsx');

function handleStateChanged(element, handler){
  google.maps.event.addDomListener(element, 'change', function(){
    if(typeof(handler) === 'function') handler(element.checked);
  });
}

Events.handleEventOnce(document, 'mdl-componentupgraded',() => {
  /* setup map */
  let canvas = document.getElementById('map-canvas');
  let mapView = new MapView(canvas);

  // layout parts
  let searchBox = document.getElementById('search-bar');
  mapView.addControl(google.maps.ControlPosition.LEFT_TOP, searchBox);
  searchBox.style.display = 'block';
  let placeSearch = document.getElementById('place-search');
  mapView.enableAutoComplete(placeSearch);
  document.getElementById('search-form').onsubmit = () => false;

  // build layers
  let trafficLayer = new MapLayer(mapView, new google.maps.TrafficLayer());

  /* handle map events */
  mapView.on('maptypeid_changed', () => {
    let state = mapView.getMapType() == MapParams.NIGHT_MODE;
    ThemeHelper.setColor(state ? "#263238" : "#4DB6AC");
    $('swMapMode').prop('checked', state);
    if(state){
      $('#search-bar').addClass('night');
      $('.pac-container').addClass('night');
    }else{
      $('#search-bar').removeClass('night');
      $('.pac-container').removeClass('night');
    }
  });
  handleStateChanged(document.getElementById('swMapMode'), state => {
    mapView.setMapType(state ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP);
  });
  handleStateChanged(document.getElementById('swTraffic'), state => {
    trafficLayer.setVisible(state);
  });
  handleStateChanged(document.getElementById('swWeather'), state => {
  });
  $('#place-search').focusin(() => {
    let w = $('#place-search').width();
    $('.pac-container').css('min-width', `${w + 64}px`);
  });

  // Require: Firefox or Chrome(need experimental flags)
  let preferredMode = google.maps.MapTypeId.ROADMAP;
  window.addEventListener('devicelight', function(event){
    let mode = event.value < 45
      ? MapParams.NIGHT_MODE
      : google.maps.MapTypeId.ROADMAP;
    if(mode === preferredMode) return;
    preferredMode = mode;
    mapView.setMapType(mode);
  });

  (new Io(mapView)).start();
});
