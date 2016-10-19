'use strict';

const MapStyles = require('./map-styles.jsx')
    , MapParams = require('./map-params.jsx');

class MapView{
  constructor(dom){
    this.map = this.buildMap(dom);
  }
  buildMap(dom){
    let map = new google.maps.Map(dom, (new MapParams()).get());
    map.mapTypes.set(MapParams.NIGHT_MODE, new google.maps.StyledMapType(MapStyles, {name: MapParams.NIGHT_MODE}));
    /* rename roamap name */
    google.maps.event.addListenerOnce(map, 'idle', function(){
      map.mapTypes.roadmap.name = 'DayMode';
      map.setOptions({'mapTypeControl':true});
    });
    return map;
  }
  createMarkerIcon(type, angle){
    return {
      url: '/res/0/' + parseInt(angle) + '.png',
      scaledSize: new google.maps.Size(32, 32),
      origin: new google.maps.Point(0, 0),
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
  addControl(placement, control){
    this.map.controls[placement].push(control);
  }
  showLayer(layer){
    layer.setMap(this.map);
  }
  hideLayer(layer){
    layer.setMap(null);
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
