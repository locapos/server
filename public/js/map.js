var canvas = document.getElementById('map-canvas');

var latlng = new google.maps.LatLng(35.685825,139.754441);

var mapOptions = {
  zoom: 9,
  center: latlng,
};

var map = new google.maps.Map(canvas, mapOptions);
