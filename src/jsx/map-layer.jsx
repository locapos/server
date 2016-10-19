'use strict';

class MapLayer {
  constructor(view, layer){
    this.view = view;
    this.layer = layer;
  }
  setVisible(b){
    if(b)this.view.showLayer(this.layer);
    else this.view.hideLayer(this.layer);
  }
}

module.exports = MapLayer;
