import { Night } from "./map-styles";
import MapParams from "./map-params";
import Autocomplete from "./autocomplete";
import Hash from "./hash";
import Markers from "./markers";
import { MarkerWithLabel, MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import { MapLayerLike } from "./map-layer";

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
      function (e) {
        e.preventDefault();
      },
      { passive: false }
    );
    return map;
  }

  createMarkerIcon(_type: unknown, angle: number) {
    const x = angle % 19;
    const y = ~~(angle / 19);
    const scale = ~~window.devicePixelRatio < 2 ? "" : "@2x";
    return {
      url: `/res/0/0${scale}.png`,
      scaledSize: new google.maps.Size(608, 608),
      size: new google.maps.Size(32, 32),
      origin: new google.maps.Point(x * 32, y * 32),
      anchor: new google.maps.Point(16, 16),
    };
  }

  createTrackingDot(origin: google.maps.Marker, mode: string) {
    // check visible bounds
    if (!this.map.getBounds()?.contains(origin.getPosition()!)) {
      return;
    }
    // create tracking dot
    const m = mode == "E" ? "E" : "A";
    const icon = {
      url: `/res/99/${m}.png`,
      scaledSize: new google.maps.Size(4, 4),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(2, 2),
    };
    const dot = new google.maps.Marker({
      position: origin.getPosition()!,
      icon: icon,
    });
    dot.setMap(this.map);
  }

  moveCenterTo(marker: google.maps.Marker) {
    this.map.setCenter(marker.getPosition()!);
  }

  createLabeledMarker(opt: MarkerWithLabelOptions & { key: string }) {
    const marker = new MarkerWithLabel(opt);
    marker.setMap(this.map);
    marker.addListener("click", function () {
      Hash.toggleLookingFor(opt.key);
    });
    return marker;
  }

  enableAutoComplete(element: HTMLElement, markers: Markers) {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  on(event: string, handler: Function) {
    google.maps.event.addListener(this.map, event, handler);
  }
}
