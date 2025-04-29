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

function handleStateChanged(element: HTMLFormElement, handler: (checked: boolean) => void) {
  element.addEventListener("change", function () {
    if (typeof handler === "function") handler(element.checked);
  });
}

Events.handleEventOnce(document, "mdl-componentupgraded", () => {
  /* setup map */
  const canvas = document.getElementById("map-canvas");
  if (!canvas) throw new Error("#map-canvas not found");
  const mapView = new MapView(canvas);
  const markers = new Markers(mapView);

  // layout parts
  const searchBox = document.getElementById("search-bar");
  if (!searchBox) throw new Error("#search-bar not found");
  mapView.addControl(google.maps.ControlPosition.LEFT_TOP, searchBox);
  searchBox.style.display = "block";
  const placeSearch = document.getElementById("place-search");
  if (!placeSearch) throw new Error("#place-search not found");
  mapView.enableAutoComplete(placeSearch, markers);
  mapView.enableLocation();
  ($(placeSearch) as unknown as { addClear: () => void }).addClear();
  const searchForm = document.getElementById("search-form");
  if (!searchForm) throw new Error("#search-form not found");
  searchForm.onsubmit = (e) => e.preventDefault();

  // build layers
  const trafficLayer = new MapLayer(mapView, new google.maps.TrafficLayer());
  const nowcastLayer = new NowcastLayer(mapView);

  /* handle map events */
  mapView.on("maptypeid_changed", () => {
    const state = mapView.getMapType() == MapParams.NIGHT_MODE;
    ThemeHelper.setColor(state ? "#263238" : "#4DB6AC");
    $("swMapMode").prop("checked", state);
    if (state) {
      $("#search-bar").addClass("night");
      $("#search-bar .ui-autocomplete").addClass("night");
    } else {
      $("#search-bar").removeClass("night");
      $("#search-bar .ui-autocomplete").removeClass("night");
    }
  });
  handleStateChanged(document.getElementById("swMapMode") as HTMLFormElement, (state) => {
    mapView.setMapType(state ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP);
  });
  handleStateChanged(document.getElementById("swSatellite") as HTMLFormElement, (state) => {
    mapView.setMapType(state ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);
    mapView.setTilt(0);
  });
  handleStateChanged(document.getElementById("swTraffic") as HTMLFormElement, (state) => {
    trafficLayer.setVisible(state);
  });
  handleStateChanged(document.getElementById("swWeather") as HTMLFormElement, (state) => {
    nowcastLayer.setVisible(state);
  });
  $(placeSearch).on("focusin", () => {
    const w = $(".search-bar").width();
    $(".ui-autocomplete").css("min-width", `${w}px`);
    $(".ui-autocomplete").css("max-width", `${w}px`);
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
    markers
      .values()
      .filter((m) => (m.labelClass || "").includes("looking"))
      .forEach((i) =>
        i.setOptions({
          labelClass: "labels",
        } satisfies Partial<MarkerWithLabelOptions> as google.maps.MarkerOptions)
      );
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
