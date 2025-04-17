import MapView from './map-view';
import MapParams from './map-params';
import Markers from './markers';
import MapLayer from './map-layer';
import NowcastLayer from './nowcast-layer';
import Events from './events';
import Io from './io';
import ThemeHelper from './theme-helper';

function handleStateChanged(element, handler) {
  google.maps.event.addDomListener(element, 'change', function () {
    if (typeof (handler) === 'function') handler(element.checked);
  });
}

Events.handleEventOnce(document, 'mdl-componentupgraded', () => {
  /* setup map */
  const canvas = document.getElementById('map-canvas');
  if (!canvas) throw new Error('#map-canvas not found');
  const mapView = new MapView(canvas);
  const markers = new Markers(mapView);

  // layout parts
  const searchBox = document.getElementById('search-bar');
  if (!searchBox) throw new Error('#search-bar not found');
  mapView.addControl(google.maps.ControlPosition.LEFT_TOP, searchBox);
  searchBox.style.display = 'block';
  const placeSearch = document.getElementById('place-search');
  if (!placeSearch) throw new Error('#place-search not found');
  mapView.enableAutoComplete(placeSearch, markers);
  mapView.enableLocation();
  ($(placeSearch) as any).addClear();
  const searchForm = document.getElementById('search-form');
  if (!searchForm) throw new Error('#search-form not found');
  searchForm.onsubmit = (e) => {
    e.preventDefault();
  };

  // build layers
  let trafficLayer = new MapLayer(mapView, new google.maps.TrafficLayer());
  let nowcastLayer = new NowcastLayer(mapView);

  /* handle map events */
  mapView.on('maptypeid_changed', () => {
    let state = mapView.getMapType() == MapParams.NIGHT_MODE;
    ThemeHelper.setColor(state ? "#263238" : "#4DB6AC");
    $('swMapMode').prop('checked', state);
    if (state) {
      $('#search-bar').addClass('night');
      $('#search-bar .ui-autocomplete').addClass('night');
    } else {
      $('#search-bar').removeClass('night');
      $('#search-bar .ui-autocomplete').removeClass('night');
    }
  });
  handleStateChanged(document.getElementById('swMapMode'), state => {
    mapView.setMapType(state ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP);
  });
  handleStateChanged(document.getElementById('swSatellite'), state => {
    mapView.setMapType(state ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
    mapView.setTilt(0);
  });
  handleStateChanged(document.getElementById('swTraffic'), state => {
    trafficLayer.setVisible(state);
  });
  handleStateChanged(document.getElementById('swWeather'), state => {
    nowcastLayer.setVisible(state);
  });
  $(placeSearch).focusin(() => {
    let w = $('.search-bar').width();
    $('.ui-autocomplete').css('min-width', `${w}px`);
    $('.ui-autocomplete').css('max-width', `${w}px`);
  });

  // Require: Firefox or Chrome(need experimental flags)
  let preferredMode: string = google.maps.MapTypeId.ROADMAP;
  window.addEventListener('devicelight', function (event) {
    if (!("value" in event) || typeof event.value !== 'number') return;
    let mode = event.value < 45
      ? MapParams.NIGHT_MODE
      : google.maps.MapTypeId.ROADMAP;
    if (mode === preferredMode) return;
    preferredMode = mode;
    mapView.setMapType(mode);
  });

  (new Io(mapView, markers)).start();
});
