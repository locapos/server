import MapView from "./map-view";
import MapParams from "./map-params";
import Markers from "./markers";
import MapLayer from "./map-layer";
import NowcastLayer from "./nowcast-layer";
import Events from "./events";
import ThemeHelper from "./theme-helper";
import { WsSession } from "./ws";
import Hash from "./hash";
import { MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import { getElementById, querySelector } from "./document-util";

function handleStateChanged(element: HTMLFormElement, handler: (checked: boolean) => void) {
  element.addEventListener("change", function () {
    if (typeof handler === "function") handler(element.checked);
  });
}

Events.handleEventOnce(document, "mdl-componentupgraded", () => {
  /* setup map */
  const canvas = getElementById("map-canvas");
  const mapView = new MapView(canvas);
  const markers = new Markers(mapView);

  // layout parts
  const searchBox = getElementById("search-bar");
  mapView.addControl(google.maps.ControlPosition.LEFT_TOP, searchBox);
  searchBox.style.display = "block";
  const placeSearch = getElementById("place-search");
  mapView.enableAutoComplete(placeSearch, markers);
  mapView.enableLocation();
  ($(placeSearch) as unknown as { addClear: () => void }).addClear();
  const searchForm = getElementById("search-form");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  // build layers
  const trafficLayer = new MapLayer(mapView, new google.maps.TrafficLayer());
  const nowcastLayer = new NowcastLayer(mapView);

  /* handle map events */
  mapView.on("maptypeid_changed", () => {
    const state = mapView.getMapType() == MapParams.NIGHT_MODE;
    ThemeHelper.setColor(state ? "#263238" : "#4DB6AC");
    getElementById<HTMLInputElement>("swMapMode").checked = state;
    if (state) {
      getElementById("search-bar").classList.add("night");
      querySelector("#search-bar .ui-autocomplete").classList.add("night");
    } else {
      getElementById("search-bar").classList.remove("night");
      querySelector("#search-bar .ui-autocomplete").classList.remove("night");
    }
  });
  handleStateChanged(getElementById<HTMLFormElement>("swMapMode"), (state) => {
    mapView.setMapType(state ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP);
  });
  handleStateChanged(getElementById<HTMLFormElement>("swSatellite"), (state) => {
    mapView.setMapType(state ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
    mapView.setTilt(0);
  });
  handleStateChanged(getElementById<HTMLFormElement>("swTraffic"), (state) => {
    trafficLayer.setVisible(state);
  });
  handleStateChanged(getElementById<HTMLFormElement>("swWeather"), (state) => {
    nowcastLayer.setVisible(state);
  });

  // Require: Firefox or Chrome(need experimental flags)
  let preferredMode: string = google.maps.MapTypeId.ROADMAP;
  window.addEventListener("devicelight", function (event) {
    if (!("value" in event) || typeof event.value !== "number") return;
    const mode = event.value < 45 ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP;
    if (mode === preferredMode) return;
    preferredMode = mode;
    mapView.setMapType(mode);
  });

  new WsSession(mapView, markers).start();

  // handle hash change
  window.addEventListener("hashchange", () => {
    const id = Hash.info().id;
    // clear label style
    for (const m of markers.values()) {
      if (!(m.labelClass || "").includes("looking")) {
        continue;
      }
      m.setOptions({
        labelClass: "labels",
      } satisfies Partial<MarkerWithLabelOptions> as google.maps.MarkerOptions);
    }
    // update label style
    if (!id || !markers.containsKey(id)) {
      return;
    }
    markers.get(id).setOptions({
      labelClass: "labels looking",
    } satisfies Partial<MarkerWithLabelOptions> as google.maps.MarkerOptions);
    mapView.moveCenterTo(markers.get(id));
  });
});
