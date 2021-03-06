'use strict';

const Hash = require('./hash.jsx');

function Markers(map){
  this.map = map;
  this.markers = {};
}

Markers.prototype.update = function(obj){
  let key = `${obj.provider}:${obj.id}`;
  let icon = this.map.createMarkerIcon(0, obj.heading);
  let opt = {
    position: new google.maps.LatLng(obj.latitude, obj.longitude),
    icon: icon,
    labelContent: obj.name || '(undefined)',
    labelAnchor: new google.maps.Point(32, -10),
    labelClass: 'labels ' + (Hash.isLooking(key) ? 'looking' : ''),
    labelStyle: {opacity: 0.75},
    key: key
  };
  if(this.markers[key] === undefined){
    this.markers[key] = this.map.createLabeledMarker(opt);
    this.markers[key].rawValue = obj;
  }else{
    this.map.createTrackingDot(this.markers[key], obj.posMode || 'A');
    this.markers[key].setOptions(opt);
  }
  if(Hash.isLooking(key)){
    this.map.moveCenterTo(this.markers[key]);
  }
};

Markers.prototype.clear = function(key){
  if(this.markers[key] === undefined) { return; }
  // clear marker from map
  this.markers[key].setMap(undefined);
  delete this.markers[key];
};

Markers.prototype.keys = function(){
  return Object.keys(this.markers);
};

Markers.prototype.values = function(){
  return Object.keys(this.markers).map(k => this.markers[k]);
};

Markers.prototype.containsKey = function(key){
  return this.markers[key] !== undefined;
}

Markers.prototype.get = function(key){
  return this.markers[key];
}

module.exports = Markers;
