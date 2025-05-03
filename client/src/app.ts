import MapView from "./map-view";
import MapParams from "./map-params";
import Markers from "./markers";
import MapLayer from "./map-layer";
import NowcastLayer from "./nowcast-layer";
import ThemeHelper from "./theme-helper";
import { WsSession } from "./ws";
import Hash from "./hash";
import { MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";
import { getElementById } from "./document-util";

function handleStateChanged(element: HTMLInputElement, handler: (checked: boolean) => void) {
  element.addEventListener("change", function () {
    if (typeof handler === "function") handler(element.checked);
  });
}

window.addEventListener("load", () => {
  /* setup map */
  const canvas = getElementById("map-canvas");
  const mapView = new MapView(canvas);
  const markers = new Markers(mapView);

  // layout parts
  const searchBox = getElementById("search-bar");
  mapView.addControl(google.maps.ControlPosition.LEFT_TOP, searchBox);
  searchBox.style.display = "block";
  mapView.enableAutoComplete(getElementById("place-search"), markers);
  mapView.enableLocation();
  getElementById("search-form").addEventListener("submit", (e) => {
    e.preventDefault();
  });
  getElementById("clear").addEventListener("click", () => {
    getElementById<HTMLInputElement>("place-search").value = "";
  });

  // build layers
  const trafficLayer = new MapLayer(mapView, new google.maps.TrafficLayer());
  const nowcastLayer = new NowcastLayer(mapView);

  /* handle map events */
  handleStateChanged(getElementById<HTMLInputElement>("swTraffic"), (state) => {
    trafficLayer.setVisible(state);
  });
  handleStateChanged(getElementById<HTMLInputElement>("swWeather"), (state) => {
    nowcastLayer.setVisible(state);
  });

  const dayNightDay = getElementById<HTMLInputElement>("daynight_day");
  const dayNightNight = getElementById<HTMLInputElement>("daynight_night");
  const dayNightAuto = getElementById<HTMLInputElement>("daynight_auto");

  // set user preference
  const userPreference = localStorage.getItem("color-scheme") || "auto";
  if (userPreference === "light") {
    dayNightDay.checked = true;
  }
  if (userPreference === "dark") {
    dayNightNight.checked = true;
  }
  if (userPreference === "auto") {
    dayNightAuto.checked = true;
  }

  // listen changed event
  handleStateChanged(dayNightDay, (checked) => {
    if (!checked) return;
    localStorage.setItem("color-scheme", "light");
    ThemeHelper.setActualColorScheme("light");
    mapView.setMapType(google.maps.MapTypeId.ROADMAP);
  });
  handleStateChanged(dayNightNight, (checked) => {
    if (!checked) return;
    localStorage.setItem("color-scheme", "dark");
    ThemeHelper.setActualColorScheme("dark");
    mapView.setMapType(MapParams.NIGHT_MODE);
  });
  handleStateChanged(dayNightAuto, (checked) => {
    if (!checked) return;
    localStorage.setItem("color-scheme", "auto");
    const isDarkMode = ThemeHelper.isDarkMode();
    ThemeHelper.setActualColorScheme(isDarkMode ? "dark" : "light");
    mapView.setMapType(isDarkMode ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP);
  });

  const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)");
  darkModePreference.addEventListener("change", (e) => {
    if (!dayNightAuto.checked) return;
    const state = e.matches;
    ThemeHelper.setActualColorScheme(state ? "dark" : "light");
    mapView.setMapType(state ? MapParams.NIGHT_MODE : google.maps.MapTypeId.ROADMAP);
  });

  // set initial color
  // mapType need to be set when requested dark mode
  if (userPreference === "auto") {
    const isDarkMode = ThemeHelper.isDarkMode();
    ThemeHelper.setActualColorScheme(isDarkMode ? "dark" : "light");
    if (isDarkMode) mapView.setMapType(MapParams.NIGHT_MODE);
  } else {
    ThemeHelper.setActualColorScheme(userPreference === "dark" ? "dark" : "light");
    if (userPreference === "dark") mapView.setMapType(MapParams.NIGHT_MODE);
  }

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

  (globalThis as any).debug = async function () {
    for (let i = 0; i < 360; i += 1) {
      markers.update({
        id: "debug",
        provider: "debug",
        latitude: 35.681236,
        longitude: 139.767125,
        heading: i,
        name: "Tokyo Station",
        posMode: "A",
      });
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }
});
