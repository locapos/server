'use strict';

class CustomLayer{
  constructor(mapView){
    this.map = mapView;
    this.layer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        return (coord = this.normalize(coord, zoom)) ? this.getTileUrl(coord, zoom) : null;
      },
      tileSize: new google.maps.Size(256, 256),
      opacity: 0,
      isPng: true
    });
  }
  normalize(coord, zoom) {
    let y = coord.y, x = coord.x;
    let tileRange = 1 << zoom;
    if (y < 0 || y >= tileRange) { return null; }
    if (x < 0 || x >= tileRange) {
      x = (x % tileRange + tileRange) % tileRange;
    }
    return {x: x, y: y};
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
