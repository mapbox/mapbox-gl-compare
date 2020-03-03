mapbox-gl-compare
---

Swipe and sync between two maps

![Swipe example](http://i.imgur.com/MvjwVLu.gif)

Map movements are synced with [mapbox-gl-sync-move](https://github.com/mapbox/mapbox-gl-sync-move).

### Usage

```js
var before = new mapboxgl.Map({
  container: 'before', // Container ID
  style: 'mapbox://styles/mapbox/light-v9'
});

var after = new mapboxgl.Map({
  container: 'after', // Container ID
  style: 'mapbox://styles/mapbox/dark-v9'
});

// A selector or reference to HTML element
var container = '#comparison-container';

new mapboxgl.Compare(before, after, container, {
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

See [API.md](https://github.com/mapbox/mapbox-gl-compare/blob/master/API.md) for complete reference.

### Developing

    npm install & npm start & open http://localhost:9966

You'll need a [Mapbox access token](https://www.mapbox.com/help/create-api-access-token/) stored in localstorage. Set it via

    localStorage.setItem('MapboxAccessToken', '<TOKEN HERE>');

### Testing

Tests require an MapboxAccessToken env variable to be set.

    export MapboxAccessToken="YOUR ACCESS TOKEN"

Lastly, run the test command from the console:

    npm test

### Deploying

- `npm run build`
- Update the version key in [package.json](https://github.com/mapbox/mapbox-gl-compare/blob/master/package.json)
- Update [CHANGELOG.md](https://github.com/mapbox/mapbox-gl-compare/blob/master/CHANGELOG.md)
- Commit and push
- `git tag -a vX.X.X -m 'vX.X.X'`
- `git push --tags`
- `npm publish`
- Update version number in [GL JS example](https://github.com/mapbox/mapbox-gl-js/blob/mb-pages/docs/_posts/examples/3400-01-21-mapbox-gl-compare.html)
