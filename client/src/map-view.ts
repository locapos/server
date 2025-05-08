import { Night } from "./map-styles";
import MapParams from "./map-params";
import Autocomplete from "./autocomplete";
import Hash from "./hash";
import Markers from "./markers";
import { MarkerWithLabel, MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import { MapLayerLike } from "./map-layer";

const MarkerSvg = "data:image/svg+xml,%3Csvg id='a' xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32' transform='rotate(##DEG##)' transform-origin='center'%3E%3Cg%3E%3Cpolygon points='4.439758 24.014404 15.5 20.276672 15.5 4.264343 4.439758 24.014404' style='fill: %23ff6260;'/%3E%3Cline x1='16.274712' y1='19.275221' x2='4.949998' y2='23.103279' style='fill: none; stroke: %23ffefef; stroke-miterlimit: 10;'/%3E%3C/g%3E%3Cpolygon points='26.79834 24.014404 15.5 4.264343 15.5 20.276672 26.79834 24.014404' style='fill: %23d10106;'/%3E%3Cline x1='15.330453' y1='19.479523' x2='26.400015' y2='23.221333' style='fill: none; opacity: .5; stroke: %23ffefef; stroke-miterlimit: 10;'/%3E%3Cpolygon points='4.439729 24.014404 15.5 4.264386 26.798331 24.014404 15.5 20.276661 4.439729 24.014404' style='fill: none; stroke: %23231815; stroke-miterlimit: 10; stroke-width: .75px;'/%3E%3C/svg%3E";

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
