'use strict';
/* global mapboxgl */

var syncMove = require('@mapbox/mapbox-gl-sync-move');
var EventEmitter = require('events').EventEmitter;

/**
 * @param {Object} a The first Mapbox GL Map
 * @param {Object} b The second Mapbox GL Map
 * @param {string|HTMLElement} container An HTML Element, or an element selector string for the compare container. It should be a wrapper around the two map Elements.
 * @param {Object} options
 * @param {string} [options.mode=slider] The compare mode. `slider` creates a vertical or horizontal slider bar to compare one map on the left or top (map A) with another map on the right or bottom (map B). `lens` creates a round area to compare on mop on the back (map A) and another map on the front (map B).
 * @param {string} [options.orientation=vertical] The orientation of the compare slider. `vertical` creates a vertical slider bar to compare one map on the left (map A) with another map on the right (map B). `horizontal` creates a horizontal slider bar to compare on mop on the top (map A) and another map on the bottom (map B).
 * @param {number} [options.size=100] The size of the compare lens.
 * @param {boolean} [options.mousemove=false] If `true` the compare slider will move with the cursor, otherwise the slider will need to be dragged to move.
 * @example
 * var compare = new mapboxgl.Compare(beforeMap, afterMap, '#wrapper', {
 *   mode: 'swiper',
 *   orientation: 'vertical',
 *   mousemove: true
 * });
 * @see [Swipe between maps](https://www.mapbox.com/mapbox-gl-js/example/mapbox-gl-compare/)
 */
function Compare(a, b, container, options) {
  this.options = options ? options : {};
  this._mapA = a;
  this._mapB = b;
  this._horizontal = this.options.orientation === 'horizontal';
  this._halfSize = (this.options.size ? this.options.size : 100) / 2;
  this._onDown = this._onDown.bind(this);
  this._onMove = this._onMove.bind(this);
  this._onOut = this._onOut.bind(this);
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
  var swiperPosition = this._horizontal ? [0, this._bounds.height / 2] : [this._bounds.width / 2, 0];
  this._setPosition(swiperPosition);

  this._clearSync = syncMove(a, b);
  this._onResize = function() {
    this._bounds = b.getContainer().getBoundingClientRect();
    if (this.currentPosition) this._setPosition(this.currentPosition);
  }.bind(this);

  b.on('resize', this._onResize);

  if (this.options) {
    if ((this.options.mode === 'lens') !== (this.options.mousemove === true)) {
      a.getContainer().addEventListener('mousemove', this._onMove);
      b.getContainer().addEventListener('mousemove', this._onMove);
    }
    if (this.options.mode === 'lens') {
      this._swiper.style.display = 'none';
      b.getContainer().style.clipPath = 'inset(50%)';
      b.getContainer().addEventListener('mouseout', this._onOut);
    }
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
      document.addEventListener('singleTap', this._onOut);
    } else {
      document.addEventListener('mousemove', this._onMove);
      document.addEventListener('mouseup', this._onMouseUp);
      document.addEventListener('mouseout', this._onOut);
    }
  },

  _setPosition: function(p) {
    var x = p[0], y = p[1];
    if (this.options.mode === 'lens') {
      this._mapB.getContainer().style.clipPath = this._calcShape(x, y);
    } else {
      x = Math.min(x, this._bounds.width);
      y = Math.min(y, this._bounds.heighth);
      var pos = this._horizontal
        ? 'translate(0, ' + y + 'px)'
        : 'translate(' + x + 'px, 0)';
      this._controlContainer.style.transform = pos;
      this._controlContainer.style.WebkitTransform = pos;
      var clipA = this._horizontal
        ? 'rect(0, 999em, ' + y + 'px, 0)'
        : 'rect(0, ' + x + 'px, ' + this._bounds.height + 'px, 0)';
      var clipB = this._horizontal
        ? 'rect(' + y + 'px, 999em, ' + this._bounds.height + 'px,0)'
        : 'rect(0, 999em, ' + this._bounds.height + 'px,' + x + 'px)';
      
      this._mapA.getContainer().style.clip = clipA;
      this._mapB.getContainer().style.clip = clipB;
    }
    this.currentPosition = p;
  },

  _onMove: function(e) {
    if (this.options && this.options.mousemove) {
      this._setPointerEvents(e.touches ? 'auto' : 'none');
    }

    this._setPosition([this._getX(e), this._getY(e)]);
  },

  _onOut: function(e) {
    if (this.options && this.options.mode === 'lens') {
      this._mapB.getContainer().style.clipPath = 'inset(50%)';
    }
  },

  _onMouseUp: function() {
    document.removeEventListener('mousemove', this._onMove);
    document.removeEventListener('mouseup', this._onMouseUp);
    this.fire('slideend', { currentPosition: this.currentPosition });
  },

  _onTouchEnd: function() {
    document.removeEventListener('touchmove', this._onMove);
    document.removeEventListener('touchend', this._onTouchEnd);
    this.fire('slideend', { currentPosition: this.currentPosition });
  },

  _calcShape : function(x, y) {
    var top = Math.max(0, y - this._halfSize);
    var right = Math.max(0, this._bounds.width - x - this._halfSize);
    var bottom = Math.max(0, this._bounds.height - y - this._halfSize);
    var left = Math.max(0, x - this._halfSize);
    return 'inset(' + top + 'px ' + right + 'px ' + bottom + 'px ' + left +'px round ' + this._halfSize + 'px)';
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
  
  /**
   * Set the size of the lens.
   *
   * @param {number} size Lens size.
   */
  setSize: function(size) {
    this._halfSize = (size ? size : 100) / 2;
  },

  /**
   * Set the position of the slider.
   *
   * @param {number} x Slider position in pixels from left/top.
   */
  setSlider: function(x) {
    if (this._horizontal) {
      if (x < 0) x = 0;
      if (x > this._bounds.height) x = this._bounds.height;
      this._setPosition([0, x]);
    } else {
      if (x < 0) x = 0;
      if (x > this._bounds.width) x = this._bounds.width;
      this._setPosition([x, 0]);
    }
  },

  /**
   * Adds a listener for events of a specified type.
   *
   * @param {string} type The event type to listen for; one of `slideend`.
   * @param {Function} listener The function to be called when the event is fired.
   * @returns {Compare} `this`
   */
  on: function(type, fn) {
    this._ev.on(type, fn);
    return this;
  },

  /**
   * Fire an event of a specified type.
   *
   * @param {string} type The event type to fire; one of `slideend`.
   * @param {Object} data Data passed to the event listener.
   * @returns {Compare} `this`
   */
  fire: function(type, data) {
    this._ev.emit(type, data);
    return this;
  },

  /**
   * Removes an event listener previously added with `Compare#on`.
   *
   * @param {string} type The event type previously used to install the listener.
   * @param {Function} listener The function previously installed as a listener.
   * @returns {Compare} `this`
   */
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
