'use strict';
/* global mapboxgl */

require('../');
mapboxgl.accessToken = window.localStorage.getItem('MapboxAccessToken');

var before = new mapboxgl.Map({
  container: 'before',
  style: 'mapbox://styles/mapbox/light-v8'
});

var after = new mapboxgl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/dark-v8'
});

window.compare = new mapboxgl.Compare(
  before,
  after, 
  '#wrapper'
  // document.body.querySelectorAll('#wrapper')[0]
  // {
  //   mousemove: true
  //   orientation: 'horizontal'
  // }
);
