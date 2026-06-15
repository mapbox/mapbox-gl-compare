mapbox-gl-compare
---

Swipe and sync between two maps

![Swipe example](http://i.imgur.com/MvjwVLu.gif)

Map movements are synced with [mapbox-gl-sync-move](https://github.com/mapbox/mapbox-gl-sync-move).

### Installation

**CDN**

Include the script and stylesheet in your HTML. `Compare` is attached to the `mapboxgl` global.

```html
<script src="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.5.0/mapbox-gl-compare.js"></script>
<link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-compare/v0.5.0/mapbox-gl-compare.css">
```

**ESM via npm**

```bash
npm install mapbox-gl-compare
```

```js
import Compare from 'mapbox-gl-compare';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';
```


### Usage

**CDN**

```js
var before = new mapboxgl.Map({
  container: 'before',
  style: 'mapbox://styles/mapbox/light-v9'
});

var after = new mapboxgl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/dark-v9'
});

// A selector or reference to HTML element
var container = '#comparison-container';

new mapboxgl.Compare(before, after, container, {
  mousemove: true, // Optional. Set to true to enable swiping during cursor movement.
  orientation: 'vertical' // Optional. Sets the orientation of swiper to horizontal or vertical, defaults to vertical
});
```

**ESM**

```js
import * as mapboxgl from 'mapbox-gl';
import Compare from 'mapbox-gl-compare';
import 'mapbox-gl-compare/dist/mapbox-gl-compare.css';

const before = new mapboxgl.Map({
  container: 'before',
  style: 'mapbox://styles/mapbox/light-v9'
});

const after = new mapboxgl.Map({
  container: 'after',
  style: 'mapbox://styles/mapbox/dark-v9'
});

// A selector or reference to HTML element
const container = '#comparison-container';

new Compare(before, after, container, {
  mousemove: true, // Optional. Set to true to enable swiping during cursor movement.
  orientation: 'vertical' // Optional. Sets the orientation of swiper to horizontal or vertical, defaults to vertical
});
```

### Methods

```js
compare = new mapboxgl.Compare(before, after, container, {
  mousemove: true, // Optional. Set to true to enable swiping during cursor movement.
  orientation: 'vertical' // Optional. Sets the orientation of swiper to horizontal or vertical, defaults to vertical
});

//Get Current position - this will return the slider's current position, in pixels
compare.currentPosition;

//Set Position - this will set the slider at the specified (x) number of pixels from the left-edge or top-edge of viewport based on swiper orientation
compare.setSlider(x);

//Listen to slider movement - and return current position on each slideend
compare.on('slideend', (e) => {
  console.log(e.currentPosition);
});

//Remove - this will remove the compare control from the DOM and stop synchronizing the two maps.
compare.remove();
```

Demo: https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-compare/

See [API.md](https://github.com/mapbox/mapbox-gl-compare/blob/main/API.md) for complete reference.

### Developing

    npm install & npm start & open http://localhost:9966

You'll need a [Mapbox access token](https://www.mapbox.com/help/create-api-access-token/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<TOKEN HERE>');

### Testing

Tests run in a real browser via Vitest and Playwright. Install the Playwright browser before running tests for the first time:

    npx playwright install chromium

A Mapbox access token is also required — see [Developing](#developing) for setup. Then run:

    npm test

### Deploying

#### npm registry
- Update the version key in [package.json](https://github.com/mapbox/mapbox-gl-compare/blob/main/package.json)
- Update [CHANGELOG.md](https://github.com/mapbox/mapbox-gl-compare/blob/main/CHANGELOG.md)
- Commit and push
- `git tag -a vX.X.X -m 'vX.X.X'`
- `git push --tags`
- `npm publish`
- Update version number in [GL JS docs](https://github.com/mapbox/mapbox-gl-js-docs/blob/publisher-production/src/components/example/helpers.js#L76)

### mapbox cdn
- `aws s3 cp --acl public-read ./dist/mapbox-gl-compare.js s3://mapbox-gl-js/plugins/mapbox-gl-compare/v$(node --print --eval "require('./package.json').version")/mapbox-gl-compare.js`
- `aws s3 cp --acl public-read ./dist/mapbox-gl-compare.css s3://mapbox-gl-js/plugins/mapbox-gl-compare/v$(node --print --eval "require('./package.json').version")/mapbox-gl-compare.css`
