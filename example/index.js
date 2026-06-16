import * as mapboxgl from 'mapbox-gl';
import Compare from '../index.js';
import 'mapbox-gl/dist/mapbox-gl.css';
import '../style.css';

const accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const before = new mapboxgl.Map({
  accessToken,
  container: 'before',
  style: 'mapbox://styles/mapbox/light-v11'
});

const after = new mapboxgl.Map({
  accessToken,
  container: 'after',
  style: 'mapbox://styles/mapbox/dark-v11'
});

// Use either of these patterns to select a container for the compare widget
const wrapperSelector = '#wrapper';
// const wrapperElement = document.body.querySelectorAll('#wrapper')[0];

// available options
const options = {
  mousemove: true,
  orientation: 'horizontal'
};

const compare = new Compare(
  before,
  after,
  wrapperSelector
  // options
);

const closeButton = document.getElementById('close-button');

closeButton.addEventListener('click', function() {
  after.getContainer().style.display = 'none';
  compare.remove();
  after.remove();
});
