import { Default } from "./map-styles";

export default class MapParams {
  static NIGHT_MODE = 'Night Mode';

  private qsCache: URLSearchParams | null = null;

  parseQueryString() {
    if (this.qsCache) return this.qsCache;
    return this.qsCache = new URLSearchParams(location.search);
  }

  getCenter() {
    const latitude = 35.685825;
    const longitude = 139.754441;
    const [loc0, loc1] = (this.parseQueryString().get('center') || '').split(',');
    return [
      parseFloat(loc0) || latitude,
      parseFloat(loc1) || longitude
    ];
  }

  getZoom() {
    return parseInt(this.parseQueryString().get('zoom') || "9");
  }

  get(): google.maps.MapOptions {
    const ids = [google.maps.MapTypeId.ROADMAP, MapParams.NIGHT_MODE];
    const center = this.getCenter();
    return {
      zoom: this.getZoom(),
      center: new google.maps.LatLng(center[0], center[1]),
      mapTypeControl: false,
      streetViewControl: false,
      scaleControl: true,
      mapTypeControlOptions: { mapTypeIds: ids },
      styles: Default
    };
  }
}
