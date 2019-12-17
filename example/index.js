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

// Use either of these patterns to select a container for the compare widget
var wrapperSelector = '#wrapper';
var wrapperElement = document.body.querySelectorAll('#wrapper')[0];

// available options
var options = {
  mousemove: true,
  orientation: 'horizontal'
}

window.compare = new mapboxgl.Compare(
  before,
  after, 
  wrapperSelector
  // options
);

var closeButton = document.getElementById('close-button');

closeButton.addEventListener('click', function(e) {
  after.getContainer().style.display = 'none';
  window.compare.remove();
  after.remove();
});