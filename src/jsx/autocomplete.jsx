'use strict';

const Hash = require('./hash.jsx');

class Autocomplete{
  constructor(map, markers){
    this.autocomplete = new google.maps.places.AutocompleteService();
    this.places = new google.maps.places.PlacesService(map);
    this.map = map;
    this.markers = markers;
    this.prev = '';
  }

  enable(element){
    this.element = element;
    let source = (req, callback) => this.runQuery(req.term, callback);
    $(this.element).autocomplete({
      source: source,
      appendTo: '#search-bar',
      select: (a,b) => this.selectItem(a,b),
      open: () => {
        $('.ui-autocomplete').off('hover mouseover mouseenter');
      }
    })
    .autocomplete('instance')._renderItem = (ul, item) => {
      let secondary = $('<span>' + item.secondary + '</span>').addClass('secondary');
      let icon = $('<i>').addClass('fa').addClass('fa-' + item.type).attr('aria-hidden', 'true');
      let content = $('<span>' + item.label + '</span>')
        .append(secondary).prepend(icon);
      let li = $('<li></li>').append(content);
      li.addClass('item-' + item.type);
      return li.appendTo(ul);
    };
  }

  selectItem(element, ui){
    if(ui.item.placeId){
      this.places.getDetails({placeId: ui.item.placeId}, (place, status) => {
        if (!place.geometry) { return; }
        if (place.geometry.viewport) {
          this.map.fitBounds(place.geometry.viewport);
        } else {
          this.map.setCenter(place.geometry.location);
          this.map.setZoom(17);
        }
      });
    }else{
      Hash.setInfo({id: ui.item.userId});
      this.map.setCenter(new google.maps.LatLng(ui.item.raw.latitude, ui.item.raw.longitude));
    }
    window.setTimeout(() => $('#focus_trick').focus(), 0);
  }

  runQuery(req, callback){
    this.autocomplete.getPlacePredictions({input: req, bounds: this.map.getBounds()}, (results, status) => {
      let users = this.queryUsers(req);
      let locations = (results || []).map(x => ({
        label: this.format(x.structured_formatting),
        secondary: x.structured_formatting.secondary_text,
        value: x.description,
        type: 'map-marker',
        placeId: x.place_id,
        raw: x
      }));
      callback(users.concat(locations));
    });
  }

  queryUsers(req){
    let center = this.map.getCenter();
    let reqLower = req.toLowerCase();
    return this.markers.values()
      .map(x => x.rawValue)
      .filter(x => ~x.name.toLowerCase().indexOf(reqLower))
      .sort((a, b) => {
        return Math.sqrt(Math.pow(center.lat() - a.latitude, 2) + Math.pow(center.lng() - a.longitude, 2))
             - Math.sqrt(Math.pow(center.lat() - b.latitude, 2) + Math.pow(center.lng() - b.longitude, 2));
      })
      .map(x => ({
        label: this.formatUser(req, x.name),
        secondary: `${x.latitude},${x.longitude}`,
        value: x.name,
        type: 'user',
        userId: `${x.provider}:${x.id}`,
        raw: x
      }));
  }

  format(item){
    let p = 0;
    let s = '';
    for(let i = 0; i < item.main_text_matched_substrings.length; ++i){
      let f = item.main_text_matched_substrings[i];
      if(p < f.offset){
        s += item.main_text.substring(p, f.offset - p);
      }
      s += '<strong>' + item.main_text.substring(f.offset, f.offset + f.length) + '</strong>';
      p = f.offset + f.length;
    }
    if(p < item.main_text.length){
      s += item.main_text.substring(p);
    }
    return s;
  }

  formatUser(req, name){
    let index = name.toLowerCase().indexOf(req);
    return this.format({
      main_text: name,
      main_text_matched_substrings: [
        { offset: index, length: req.length }
      ]
    });
  }
}

module.exports = Autocomplete;
