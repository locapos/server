'use strict';

class CustomLayer{
  constructor(mapView){
    this.map = mapView;
    this.layer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => this.getTileUrl(coord, zoom),
      tileSize: new google.maps.Size(256, 256),
      opacity: 0.5,
      isPng: true
    });
  }
  setVisible(b){
    if(b)this.map.getMapOverlays().push(this.layer);
    else {
      let i = this.map.getMapOverlays().indexOf(this.layer);
      if(i >= 0) this.map.getMapOverlays().removeAt(i);
    }
  }
}

module.exports = CustomLayer;
