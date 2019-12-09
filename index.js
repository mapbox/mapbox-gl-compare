'use strict';
/* global mapboxgl */

var syncMove = require('@mapbox/mapbox-gl-sync-move');
var EventEmitter = require('events').EventEmitter;

function Compare(a, b, container, options) {
  this.options = options ? options : {};
  this._mapA = a;
  this._mapB = b;
  this._horizontal = this.options.orientation === 'horizontal';
  this._onDown = this._onDown.bind(this);
  this._onMove = this._onMove.bind(this);
  this._onMouseUp = this._onMouseUp.bind(this);
  this._onTouchEnd = this._onTouchEnd.bind(this);
  this._ev = new EventEmitter();
  this._swiper = document.createElement('div');
  this._swiper.className = this._horizontal ? 'compare-swiper-horizontal' : 'compare-swiper-vertical';

  this._controlContainer = document.createElement('div');
  this._controlContainer.className = this._horizontal ? 'mapboxgl-compare mapboxgl-compare-horizontal' : 'mapboxgl-compare';
  this._controlContainer.className = this._controlContainer.className;
  this._controlContainer.appendChild(this._swiper);

  if (typeof container === 'string' && document.body.querySelectorAll) {
    // get container with a selector
    var appendTarget = document.body.querySelectorAll(container)[0];
    if (!appendTarget) {
      throw new Error('Cannot find element with specified container selector.')
    }
    appendTarget.appendChild(this._controlContainer)
  } else if (container instanceof Element && container.appendChild) {
    // get container directly
    container.appendChild(this._controlContainer)
  } else {
    throw new Error('Invalid container specified. Must be CSS selector or HTML element.')
  }

  this._bounds = b.getContainer().getBoundingClientRect();
  var swiperPosition = (this._horizontal ? this._bounds.height : this._bounds.width) / 2;
  this._setPosition(swiperPosition);

  this._clearSync = syncMove(a, b);
  this._onResize = function() {
    this._bounds = b.getContainer().getBoundingClientRect();
    if (this.currentPosition) this._setPosition(this.currentPosition);
  }.bind(this);

  b.on('resize', this._onResize);

  if (this.options && this.options.mousemove) {
    a.getContainer().addEventListener('mousemove', this._onMove);
    b.getContainer().addEventListener('mousemove', this._onMove);
  }

  this._swiper.addEventListener('mousedown', this._onDown);
  this._swiper.addEventListener('touchstart', this._onDown);
}

Compare.prototype = {
  _setPointerEvents: function(v) {
    this._controlContainer.style.pointerEvents = v;
    this._swiper.style.pointerEvents = v;
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
    x = Math.min(x, this._horizontal
      ? this._bounds.height
      : this._bounds.width);
    var pos = this._horizontal
      ? 'translate(0, ' + x + 'px)'
      : 'translate(' + x + 'px, 0)';
    this._controlContainer.style.transform = pos;
    this._controlContainer.style.WebkitTransform = pos;
    var clipA = this._horizontal
      ? 'rect(0, 999em, ' + x + 'px, 0)'
      : 'rect(0, ' + x + 'px, ' + this._bounds.height + 'px, 0)';
    var clipB = this._horizontal
      ? 'rect(' + x + 'px, 999em, ' + this._bounds.height + 'px,0)'
      : 'rect(0, 999em, ' + this._bounds.height + 'px,' + x + 'px)';
    
    this._mapA.getContainer().style.clip = clipA;
    this._mapB.getContainer().style.clip = clipB;
    this.currentPosition = x;
  },

  _onMove: function(e) {
    if (this.options && this.options.mousemove) {
      this._setPointerEvents(e.touches ? 'auto' : 'none');
    }

    this._horizontal
      ? this._setPosition(this._getY(e))
      : this._setPosition(this._getX(e));
  },

  _onMouseUp: function() {
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.fire('slideend', { currentPosition: this.currentPosition });
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
  },

  _getY: function(e) {
    e = e.touches ? e.touches[0] : e;
    var y = e.clientY - this._bounds.top;
    if (y < 0) y = 0;
    if (y > this._bounds.height) y = this._bounds.height;
    return y;
  },

  setSlider: function(x) {
    this._setPosition(x);
  },

  on: function(type, fn) {
    this._ev.on(type, fn);
    return this;
  },

  fire: function(type, data) {
    this._ev.emit(type, data);
    return this;
  },

  off: function(type, fn) {
    this._ev.removeListener(type, fn);
    return this;
  },

  remove: function() {
    this._clearSync();
    this._mapB.off('resize', this._onResize);
    var aContainer = this._mapA.getContainer();

    if (!!aContainer) {
      aContainer.style.clip = null;
      aContainer.removeEventListener('mousemove', this._onMove);
    }

    var bContainer = this._mapB.getContainer();

    if (!!bContainer) {
      bContainer.style.clip = null;
      bContainer.removeEventListener('mousemove', this._onMove);
    }

    this._swiper.removeEventListener('mousedown', this._onDown);
    this._swiper.removeEventListener('touchstart', this._onDown);
    this._controlContainer.remove();
  }
};

if (window.mapboxgl) {
  mapboxgl.Compare = Compare;
} else if (typeof module !== 'undefined') {
  module.exports = Compare;
}
