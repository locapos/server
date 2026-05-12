import { MarkerWithLabel, type MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import Autocomplete from "./autocomplete";
import Hash from "./hash";
import type { MapLayerLike } from "./map-layer";
import MapParams from "./map-params";
import { Night } from "./map-styles";
import { createDotIcon } from "./marker-icon";
import type Markers from "./markers";

export default class MapView {
  private map: google.maps.Map;
  private currentLocation: google.maps.Marker | null = null;
  private currentAccuracy: google.maps.Circle | null = null;

  constructor(dom: HTMLElement) {
    this.map = this.buildMap(dom);
  }

  buildMap(dom: HTMLElement) {
    const map = new google.maps.Map(dom, new MapParams().get());
    map.set("isFractionalZoomEnabled", true);
    map.mapTypes.set(
      MapParams.NIGHT_MODE,
      new google.maps.StyledMapType(Night, { name: MapParams.NIGHT_MODE })
    );
    dom.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );
    return map;
  }

  createTrackingDot(origin: google.maps.Marker, mode: string) {
    // check visible bounds
    const position = origin.getPosition();
    if (!position || !this.map.getBounds()?.contains(position)) {
      return;
    }
    // create tracking dot
    const dot = new google.maps.Marker({
      position,
      icon: createDotIcon(mode),
      clickable: false,
    });
    dot.setMap(this.map);
  }

  moveCenterTo(marker: google.maps.Marker) {
    const position = marker.getPosition();
    if (position) this.map.setCenter(position);
  }

  createLabeledMarker(key: string, opt: MarkerWithLabelOptions) {
    const marker = new MarkerWithLabel(opt);
    marker.setMap(this.map);
    marker.addListener("click", () => {
      Hash.toggleLookingFor(key);
    });
    return marker;
  }

  enableAutoComplete(element: HTMLInputElement, markers: Markers) {
    const autocomplete = new Autocomplete(this.map, markers);
    autocomplete.enable(element);
  }

  addControl(placement: google.maps.ControlPosition, control: HTMLElement) {
    this.map.controls[placement].push(control);
  }

  showLayer(layer: MapLayerLike) {
    layer.setMap(this.map);
  }

  hideLayer(layer: MapLayerLike) {
    layer.setMap(null);
  }

  getMapOverlays() {
    return this.map.overlayMapTypes;
  }

  getMapType() {
    return this.map.getMapTypeId();
  }

  setMapType(type: string) {
    this.map.setMapTypeId(type);
  }

  enableLocation() {
    if (!("geolocation" in navigator)) {
      return;
    }
    navigator.geolocation.watchPosition((position) => {
      this.updateLocation(position.coords);
    });
  }

  setTilt(tilt: number) {
    this.map.setTilt(tilt);
  }

  getTilt() {
    return this.map.getTilt();
  }

  updateLocation(coords: GeolocationCoordinates) {
    const position = new google.maps.LatLng(coords.latitude, coords.longitude);
    if (!this.currentLocation || !this.currentAccuracy) {
      // create accuracy circle
      const circle = new google.maps.Circle({
        center: position,
        map: this.map,
        radius: coords.accuracy,
        fillColor: "#4187f5",
        fillOpacity: 0.2,
        strokeOpacity: 0,
      });
      // create current location marker
      const image = {
        url: "/img/pos.png",
        size: new google.maps.Size(26, 26),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(7.5, 7.5),
        scaledSize: new google.maps.Size(13, 13),
      };
      const marker = new google.maps.Marker({
        position: position,
        map: this.map,
        icon: image,
        zIndex: 0xfffffffff,
      });
      // bind property
      circle.bindTo("center", marker, "position");
      this.currentLocation = marker;
      this.currentAccuracy = circle;
    }
    this.currentLocation.setPosition(position);
    this.currentAccuracy.setRadius(coords.accuracy);
  }

  on(event: string, handler: (...args: unknown[]) => void) {
    google.maps.event.addListener(this.map, event, handler);
  }
}
