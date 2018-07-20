'use strict';
/* global mapboxgl */

var syncMove = require('mapbox-gl-sync-move');

function Compare(a, b, options) {
  this.options = options ? options : {};
  this._onDown = this._onDown.bind(this);
  this._onMove = this._onMove.bind(this);
  this._onMouseUp = this._onMouseUp.bind(this);
  this._onTouchEnd = this._onTouchEnd.bind(this);

  this._swiper = document.createElement('div');
  this._swiper.className = 'compare-swiper';

  this._container = document.createElement('div');
  this._container.className = 'mapboxgl-compare';
  this._container.appendChild(this._swiper);

  a.getContainer().appendChild(this._container);

  this._clippedMap = b;
  this._bounds = b.getContainer().getBoundingClientRect();
  this._setPosition(this._bounds.width / 2);
  syncMove(a, b);

  b.on('resize', function () {
    this._bounds = b.getContainer().getBoundingClientRect();
    if (this._x) this._setPosition(this._x);
  }.bind(this));

  if (this.options && this.options.mousemove) {
    a.getContainer().addEventListener('mousemove', this._onMove);
    b.getContainer().addEventListener('mousemove', this._onMove);
  }

  this._swiper.addEventListener('mousedown', this._onDown);
  this._swiper.addEventListener('touchstart', this._onDown);
}

Compare.prototype = {
   /**
   * Allows for custom full screen button.
   * @param a The map on the left.
   * @param b The map on the right.
   * @param originId The id of the div where both the maps originated from.
   */
  fullscreen: function (a, b, originId) {

    // see if we have a full screen div
    var fsc = document.getElementById('mapboxgl-compare-fullscreen');

    // if full screen div found, put the maps back into the origin div
    if (fsc) {
      // get origin div
      var origin = document.getElementById(originId);

      // add maps back to origin div
      origin.appendChild(a.getContainer());
      origin.appendChild(b.getContainer());

      // remove full screen container
      document.body.removeChild(fsc);
    } else {

      // create full screen container and append maps to it
      fsc = document.createElement('div');
      fsc.className = 'mapboxgl-compare-fullscreen';
      fsc.id = 'mapboxgl-compare-fullscreen';
      fsc.appendChild(a.getContainer());
      fsc.appendChild(b.getContainer());
      document.body.appendChild(fsc);
    }

    // resize the maps
    a.resize();
    b.resize();
  },
  _setPointerEvents: function (v) {
    this._container.style.pointerEvents = v;
    this._swiper.style.pointerEvents = v;
  },

  _onDown: function (e) {
    if (e.touches) {
      document.addEventListener('touchmove', this._onMove);
      document.addEventListener('touchend', this._onTouchEnd);
    } else {
      document.addEventListener('mousemove', this._onMove);
      document.addEventListener('mouseup', this._onMouseUp);
    }
  },

  _setPosition: function (x) {
    x = Math.min(x, this._bounds.width);
    var pos = 'translate(' + x + 'px, 0)';
    this._container.style.transform = pos;
    this._container.style.WebkitTransform = pos;
    this._clippedMap.getContainer().style.clip = 'rect(0, 999em, ' + this._bounds.height + 'px,' + x + 'px)';
    this._x = x;
  },

  _onMove: function (e) {
    if (this.options && this.options.mousemove) {
      this._setPointerEvents(e.touches ? 'auto' : 'none');
    }

    this._setPosition(this._getX(e));
  },

  _onMouseUp: function () {
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  },

  _onTouchEnd: function () {
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onTouchEnd);
  },

  _getX: function (e) {
    e = e.touches ? e.touches[0] : e;
    var x = e.clientX - this._bounds.left;
    if (x < 0) x = 0;
    if (x > this._bounds.width) x = this._bounds.width;
    return x;
  }
};

if (window.mapboxgl) {
  mapboxgl.Compare = Compare;
} else if (typeof module !== 'undefined') {
  module.exports = Compare;
}
