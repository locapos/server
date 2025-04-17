import MapView from "./map-view";

export default class MapLayer {
  private map: MapView;
  private layer: google.maps.ImageMapType | google.maps.TrafficLayer;


  constructor(map: MapView, layer: google.maps.ImageMapType | google.maps.TrafficLayer) {
    this.map = map;
    this.layer = layer;
  }
  setVisible(b) {
    if (b) this.map.showLayer(this.layer);
    else this.map.hideLayer(this.layer);
  }
}
