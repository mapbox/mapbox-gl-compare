import { test, expect } from 'vitest';
import mapboxgl from 'mapbox-gl';
import Compare from '../index.js';
import '/dist/mapbox-gl-compare.css'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

test('Compare', () => {
    const a = new mapboxgl.Map({
        container: document.createElement('div'),
        style: 'mapbox://styles/mapbox/light-v11'
    });

    const b = new mapboxgl.Map({
        container: document.createElement('div'),
        style: 'mapbox://styles/mapbox/dark-v11'
    });

    // insert the container's into the document so compare.setSlider test works
    document.body.appendChild(a.getContainer());
    document.body.appendChild(b.getContainer());

    const container = document.createElement('div');
    const compare = new Compare(a, b, container);

    expect(a.getContainer().style.clip).toBeTruthy();
    expect(b.getContainer().style.clip).toBeTruthy();

    b.jumpTo({
        bearing: 20,
        center: { lat: 16, lng: -155 },
        pitch: 20,
        zoom: 3
    });

    expect(a.getZoom()).toBe(3);
    expect(a.getPitch()).toBe(20);
    expect(a.getBearing()).toBe(20);
    expect(a.getCenter().lng).toBe(-155);
    expect(a.getCenter().lat).toBe(16);

    compare.setSlider(20);
    expect(compare.currentPosition).toBe(20);

    compare.remove();

    expect(a.getContainer().style.clip).toBeFalsy();
    expect(b.getContainer().style.clip).toBeFalsy();

    b.jumpTo({
        bearing: 10,
        center: { lat: 26, lng: -105 },
        pitch: 30,
        zoom: 5
    });

    expect(a.getZoom()).toBe(3);
    expect(a.getPitch()).toBe(20);
    expect(a.getBearing()).toBe(20);
    expect(a.getCenter().lng).toBe(-155);
    expect(a.getCenter().lat).toBe(16);
});
