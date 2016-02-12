'use strict';
/* global mapboxgl */

require('../');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

var before = new mapboxgl.Map({
  container: 'before',
  style: 'mapbox://styles/mapbox/light-v8',
  center: [0, 0],
  zoom: 0
});

var after = new mapboxgl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/dark-v8',
  center: [0, 0],
  zoom: 0
});

new mapboxgl.Compare(before, after);
