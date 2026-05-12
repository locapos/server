import type { MarkerWithLabel, MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import Hash from "./hash";
import type MapView from "./map-view";
import { createMarkerIcon } from "./marker-icon";

export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  heading: number;
  posMode: string;
};

type TrackedMarker = MarkerWithLabel & {
  rawValue?: Location;
  labelEl?: HTMLSpanElement;
};

export default class Markers {
  private map: MapView;
  private markers: { [key: string]: TrackedMarker };

  constructor(map: MapView) {
    this.map = map;
    this.markers = {};
  }

  update(obj: Location) {
    const key = obj.id;
    const text = obj.name || "(undefined)";
    const isLooking = Hash.isLooking(key);
    const labelClass = `labels ${isLooking ? "looking" : ""}`;
    const position = new google.maps.LatLng(obj.latitude, obj.longitude);
    const icon = createMarkerIcon(obj.heading);
    const existing = this.markers[key];
    if (existing === undefined) {
      const labelEl = document.createElement("span");
      labelEl.textContent = text;
      this.markers[key] = Object.assign(
        this.map.createLabeledMarker(key, {
          position,
          icon,
          labelContent: labelEl,
          labelAnchor: new google.maps.Point(-32, 10),
          labelClass,
          zIndex: 1,
        }),
        { rawValue: obj, labelEl },
      );
    } else {
      if (existing.labelEl) {
        existing.labelEl.textContent = text;
      }
      this.map.createTrackingDot(existing, obj.posMode || "A");
      existing.setOptions({
        position,
        icon,
        labelClass,
      } satisfies Partial<MarkerWithLabelOptions> as google.maps.MarkerOptions);
      existing.rawValue = obj;
    }
    if (isLooking) {
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
