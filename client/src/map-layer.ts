import MapView from "./map-view";

export type MapLayerLike = {
  setMap(map: google.maps.Map | null): void;
};

export default class MapLayer {
  private map: MapView;
  private layer: MapLayerLike;

  constructor(map: MapView, layer: MapLayerLike) {
    this.map = map;
    this.layer = layer;
  }
  setVisible(b: boolean) {
    if (b) this.map.showLayer(this.layer);
    else this.map.hideLayer(this.layer);
  }
}
