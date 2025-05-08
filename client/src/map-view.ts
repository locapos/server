import { Night } from "./map-styles";
import MapParams from "./map-params";
import Autocomplete from "./autocomplete";
import Hash from "./hash";
import Markers from "./markers";
import { MarkerWithLabel, MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import { MapLayerLike } from "./map-layer";

const MarkerSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' transform='rotate(##DEG##)' transform-origin='center'%3E%3Cpath fill='%23ff6260' d='m4.44 24.014 11.06-3.737V4.264L4.44 24.014z'/%3E%3Cpath stroke='%23ffefef' d='M16.275 19.275 4.95 23.103'/%3E%3Cpath fill='%23d10106' d='M26.798 24.014 15.5 4.264v16.013l11.298 3.737z'/%3E%3Cpath stroke='%23ffefef' d='m15.33 19.48 11.07 3.741' opacity='.5'/%3E%3Cpath fill='none' stroke='%23231815' stroke-width='.75' d='M4.44 24.014 15.5 4.264l11.298 19.75L15.5 20.277 4.44 24.014z'/%3E%3C/svg%3E";

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
    const dataUrl = MarkerSvg.replace("##DEG##", angle.toString());
    return {
      url: dataUrl,
      size: new google.maps.Size(32, 32),
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
      clickable: false,
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
