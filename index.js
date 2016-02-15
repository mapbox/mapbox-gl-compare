'use strict';
/* global mapboxgl */

function Compare(a, b) {
  mapboxgl.util.bindHandlers(this);

  var swiper = document.createElement('div');
  swiper.className = 'compare-swiper';
  swiper.addEventListener('mousedown', this._onDown);
  swiper.addEventListener('touchstart', this._onDown);

  this._container = document.createElement('div');
  this._container.className = 'mapboxgl-compare';
  this._container.appendChild(swiper);

  a.getContainer().appendChild(this._container);

  this._clippedMap = b;
  this._bounds = b.getContainer().getBoundingClientRect();
  this._setPosition(this._bounds.width / 2);
  this._syncMaps(a, b);

  b.on('resize', function() {
    this._bounds = b.getContainer().getBoundingClientRect();
    if (this._x) this._setPosition(this._x);
  }.bind(this));
}

Compare.prototype = {
  _copyPosition: function(a, b) {
    b.jumpTo({
      center: a.getCenter(),
      zoom: a.getZoom(),
      bearing: a.getBearing(),
      pitch: a.getPitch()
    });
  },

  _syncMaps: function(a, b) {
    var cp = this._copyPosition;
    function a2b() {
      b.off('move', b2a);
      cp(a, b);
      b.on('move', b2a);
    }

    function b2a() {
      a.off('move', b2a);
      cp(b, a);
      a.on('move', b2a);
    }

    a.on('move', a2b);
    b.on('move', b2a);
  },

  _onDown: function(e) {
    if (e.touches) {
      document.addEventListener('touchmove', this._onMove);
      document.addEventListener('touchend', this._onTouchEnd);
    } else {
      document.addEventListener('mousemove', this._onMove);
      document.addEventListener('mouseup', this._onMouseUp);
    }
  },

  _setPosition: function(x) {
    var pos = 'translate(' + x + 'px, 0)';
    this._container.style.transform = pos;
    this._container.style.WebkitTransform = pos;
    this._clippedMap.getContainer().style.clip = 'rect(0, 999em, ' + this._bounds.height + 'px,' + x + 'px)';
    this._x = x;
  },

  _onMove: function(e) {
    this._setPosition(this._getX(e));
  },

  _onMouseUp: function() {
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onMouseUp);
  },

  _onTouchEnd: function() {
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onTouchEnd);
  },

  _getX: function(e) {
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
