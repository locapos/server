'use strict';

const MapStyles = require('./map-styles.jsx')
    , MapParams = require('./map-params.jsx')
    , Hash = require('./hash.jsx');

class MapView{
  constructor(dom){
    this.map = this.buildMap(dom);
  }
  buildMap(dom){
    let map = new google.maps.Map(dom, (new MapParams()).get());
    map.mapTypes.set(MapParams.NIGHT_MODE, new google.maps.StyledMapType(MapStyles, {name: MapParams.NIGHT_MODE}));
    return map;
  }
  createMarkerIcon(type, angle){
    let x = parseInt(angle) % 19;
    let y = ~~(parseInt(angle) / 19);
    let scale = ~~window.devicePixelRatio < 2 ? '' : '@2x';
    return {
      url: `/res/0/0${scale}.png`,
      scaledSize: new google.maps.Size(608, 608),
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(x * 32, y * 32),
      anchor: new google.maps.Point(16, 16)
    };
  }
  createTrackingDot(_origin){
    // check visible bounds
    if(!this.map.getBounds().contains(_origin.getPosition())){
      return;
    }
    // create tracking dot
    let icon = {
      url: '/res/99/0.png',
      scaledSize: new google.maps.Size(4, 4),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(2, 2)
    }
    let dot = new google.maps.Marker({
      position: _origin.getPosition(),
      icon: icon
    });
    dot.setMap(this.map);
  }
  moveCenterTo(_marker){
    this.map.setCenter(_marker.getPosition());
  }
  createLabeledMarker(opt){
    let marker = new MarkerWithLabel(opt);
    marker.setMap(this.map);
    marker.addListener('click', function(){ Hash.toggleLookingFor(opt.key); });
    return marker;
  }
  enableAutoComplete(element){
    let autocomplete = new google.maps.places.Autocomplete(element);
    autocomplete.bindTo('bounds', this.map);
    google.maps.event.addListener(autocomplete, 'place_changed', () => {
      var place = autocomplete.getPlace();
      if (!place.geometry) { return; }
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);
      }
    });
  }
  addControl(placement, control){
    this.map.controls[placement].push(control);
  }
  showLayer(layer){
    layer.setMap(this.map);
  }
  hideLayer(layer){
    layer.setMap(null);
  }
  getMapOverlays(){
    return this.map.overlayMapTypes;
  }
  getMapType(){
    return this.map.getMapTypeId();
  }
  setMapType(type){
    this.map.setMapTypeId(type);
  }
  on(event, handler){
    google.maps.event.addListener(this.map, event, handler);
  }
}

module.exports = MapView;
