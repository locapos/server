import MapView from "./map-view";
import Markers, { Location } from "./markers";
import Hash from "./hash";
import { MarkerWithLabelOptions } from "@googlemaps/markerwithlabel";

export class WsSession {
  constructor(private mapView: MapView, private markers: Markers) { }

  start() {
    const socket = new WebSocket(WsSession.url);
    let syncInterval: number | null = null;
    let pingInterval: number | null = null;

    socket.addEventListener("open", () => {
      socket.send(JSON.stringify({ event: "sync" }));
      pingInterval = window.setInterval(() => socket.send(JSON.stringify({ event: "ping" })), 15 * 1000); // send ping every minute
      syncInterval = window.setInterval(() => socket.send(JSON.stringify({ event: "sync" })), 2.5 * 60 * 1000); // send sync request every 2.5 minutes
    });

    socket.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.event === "update") {
        msg.data.forEach((o: Location) => this.markers.update(o));
      }
      else if (msg.event === "delete") {
        msg.data.forEach((o: string) => this.markers.clear(o));
      }
      else if (msg.event === "sync") {
        this.markers.keys().forEach((k) => this.markers.clear(k));
        msg.data.forEach((o: Location) => this.markers.update(o));
      }
    });

    socket.addEventListener("error", (event) => {
      console.error("WebSocket error:", event);
    });

    socket.addEventListener("close", (event) => {
      console.log("WebSocket closed:", event);
      console.log("Reconnecting in 5 seconds...");
      window.clearInterval(pingInterval);
      window.clearInterval(syncInterval);
      setTimeout(() => {
        this.start();
      }, 5000);
    });

    window.addEventListener("hashchange", () => {
      let id = Hash.info().id;
      // clear label style
      this.markers
        .values()
        .filter((m) => ~(m.labelClass || "").indexOf("looking"))
        .forEach((i) => i.setOptions({ labelClass: "labels" } satisfies Partial<MarkerWithLabelOptions> as any));
      // update label style
      if (!id || !this.markers.containsKey(id)) {
        return;
      }
      this.markers.get(id).setOptions({ labelClass: "labels looking" } satisfies Partial<MarkerWithLabelOptions> as any);
      this.mapView.moveCenterTo(this.markers.get(id));
    });
  }

  private static get protocol() {
    return location.protocol === "https:" ? "wss:" : "ws:";
  }

  private static get host() {
    return location.host;
  }

  private static get path() {
    if (location.pathname === "/") {
      return "/ws";
    }

    return "/ws" + location.pathname;
  }

  private static get url() {
    return `${WsSession.protocol}//${WsSession.host}${WsSession.path}`;
  }
}