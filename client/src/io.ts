import { MarkerWithLabelOptions } from '@googlemaps/markerwithlabel';
import Hash from './hash';
import MapView from './map-view';
import Markers from './markers';
import { io } from 'socket.io-client';

export default class IoSession {
  constructor(private mapView: MapView, private markers: Markers) { }

  start() {
    const socket = io();
    socket.on('connected', () => {
      socket.emit('init', location.pathname.substr(1));
    });

    socket.on('update', (msg = []) => {
      msg.forEach(o => this.markers.update(o));
    });

    socket.on('clear', (msg) => {
      this.markers.clear(msg);
    });

    socket.on('sync', (msg = []) => {
      this.markers.keys().forEach(k => this.markers.clear(k));
      msg.forEach(o => this.markers.update(o));
    });

    window.addEventListener('hashchange', () => {
      let id = Hash.info().id;
      // clear label style
      this.markers.values()
        .filter(m => ~(m.labelClass || '').indexOf('looking'))
        .forEach(i => i.setOptions({ labelClass: 'labels' } satisfies Partial<MarkerWithLabelOptions> as any));
      // update label style
      if (!id || !this.markers.containsKey(id)) { return; }
      this.markers.get(id).setOptions({ labelClass: 'labels looking' } satisfies Partial<MarkerWithLabelOptions> as any);
      this.mapView.moveCenterTo(this.markers.get(id));
    });

    window.setInterval(() => socket.emit('sync'), 2.5 * 60 * 1000); // send sync request every 2.5 minutes
  };
}
