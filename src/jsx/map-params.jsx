'use strict';

class MapParams {
  parseQueryString(){
    return this.qsCache || (this.qsCache = location.search.substr(1).split('&')
      .map(s => s.split('='))
      .reduce((p, c) => ((p[c[0]] = c[1]), p), {}));
  }

  getCenter(){
    const latitude = 35.685825
        , longitude = 139.754441;
    let loc = (this.parseQueryString()['center'] || '').split(',');
    loc[0] = parseFloat(loc[0]) || latitude;
    loc[1] = parseFloat(loc[1]) || longitude;
    return loc;
  }

  getZoom(){
    return parseInt(this.parseQueryString()['zoom']) || 9;
  }

  get(){
    let ids = [ google.maps.MapTypeId.ROADMAP, MapParams.NIGHT_MODE ];
    let center = this.getCenter();
    return {
      zoom: this.getZoom(),
      center: new google.maps.LatLng(center[0], center[1]),
      mapTypeControl: true,
      streetViewControl: false,
      scaleControl: true,
      mapTypeControlOptions: { mapTypeIds: ids }
    };
  }
}

MapParams.NIGHT_MODE = 'NightMode';

module.exports = MapParams;
