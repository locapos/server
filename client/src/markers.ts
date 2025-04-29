import { MarkerWithLabel } from "@googlemaps/markerwithlabel";
import Hash from "./hash";
import MapView from "./map-view";

export type Location = {
  provider: string;
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  heading: number;
  posMode: string;
};

export default class Markers {
  private map: MapView;
  private markers: { [key: string]: MarkerWithLabel & { rawValue?: Location } };

  constructor(map: MapView) {
    this.map = map;
    this.markers = {};
  }

  update(obj: Location) {
    const key = `${obj.provider}:${obj.id}`;
    const icon = this.map.createMarkerIcon(0, obj.heading);
    const opt = {
      position: new google.maps.LatLng(obj.latitude, obj.longitude),
      icon: icon,
      labelContent: obj.name || "(undefined)",
      labelAnchor: new google.maps.Point(-32, 10),
      labelClass: `labels ${Hash.isLooking(key) ? "looking" : ""}`,
      labelStyle: { opacity: 0.75 },
      key: key,
    };
    if (this.markers[key] === undefined) {
      this.markers[key] = this.map.createLabeledMarker(opt);
      this.markers[key].rawValue = obj;
    } else {
      this.map.createTrackingDot(this.markers[key], obj.posMode || "A");
      this.markers[key].setOptions(opt);
    }
    if (Hash.isLooking(key)) {
      this.map.moveCenterTo(this.markers[key]);
    }
  }

  clear(key: string) {
    if (this.markers[key] === undefined) {
      return;
    }
    // clear marker from map
    this.markers[key].setMap(null);
    delete this.markers[key];
  }

  keys() {
    return Object.keys(this.markers);
  }

  values() {
    return Object.keys(this.markers).map((k) => this.markers[k]);
  }

  containsKey(key: string) {
    return this.markers[key] !== undefined;
  }

  get(key: string) {
    return this.markers[key];
  }
}
