import MapView from "./map-view";

export default abstract class CustomLayer {
  private map: MapView;
  private layer: google.maps.ImageMapType;

  constructor(mapView: MapView) {
    this.map = mapView;
    this.layer = new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => this.getTileUrl(coord, zoom),
      tileSize: new google.maps.Size(256, 256),
      opacity: 0.5,
    });
  }

  setVisible(b: boolean) {
    if (b) this.map.getMapOverlays().push(this.layer);
    else {
      const i = this.map.getMapOverlays().getArray().indexOf(this.layer);
      if (i >= 0) this.map.getMapOverlays().removeAt(i);
    }
  }

  protected abstract getTileUrl(coord: google.maps.Point, zoom: number): string;
}
