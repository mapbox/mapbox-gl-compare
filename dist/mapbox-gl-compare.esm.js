function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var mapboxGlSyncMove;
var hasRequiredMapboxGlSyncMove;

function requireMapboxGlSyncMove () {
	if (hasRequiredMapboxGlSyncMove) return mapboxGlSyncMove;
	hasRequiredMapboxGlSyncMove = 1;
	function moveToMapPosition (master, clones) {
	  var center = master.getCenter();
	  var zoom = master.getZoom();
	  var bearing = master.getBearing();
	  var pitch = master.getPitch();

	  clones.forEach(function (clone) {
	    clone.jumpTo({
	      center: center,
	      zoom: zoom,
	      bearing: bearing,
	      pitch: pitch
	    });
	  });
	}

	// Sync movements of two maps.
	//
	// All interactions that result in movement end up firing
	// a "move" event. The trick here, though, is to
	// ensure that movements don't cycle from one map
	// to the other and back again, because such a cycle
	// - could cause an infinite loop
	// - prematurely halts prolonged movements like
	//   double-click zooming, box-zooming, and flying
	function syncMaps () {
	  var maps;
	  var argLen = arguments.length;
	  if (argLen === 1) {
	    maps = arguments[0];
	  } else {
	    maps = [];
	    for (var i = 0; i < argLen; i++) {
	      maps.push(arguments[i]);
	    }
	  }

	  // Create all the movement functions, because if they're created every time
	  // they wouldn't be the same and couldn't be removed.
	  var fns = [];
	  maps.forEach(function (map, index) {
	    fns[index] = sync.bind(null, map, maps.filter(function (o, i) { return i !== index; }));
	  });

	  function on () {
	    maps.forEach(function (map, index) {
	      map.on('move', fns[index]);
	    });
	  }

	  function off () {
	    maps.forEach(function (map, index) {
	      map.off('move', fns[index]);
	    });
	  }

	  // When one map moves, we turn off the movement listeners
	  // on all the maps, move it, then turn the listeners on again
	  function sync (master, clones) {
	    off();
	    moveToMapPosition(master, clones);
	    on();
	  }

	  on();
	  return function(){  off(); fns = []; maps = []; };
	}

	mapboxGlSyncMove = syncMaps;
	return mapboxGlSyncMove;
}

var events = {exports: {}};

var hasRequiredEvents;

function requireEvents () {
	if (hasRequiredEvents) return events.exports;
	hasRequiredEvents = 1;

	var R = typeof Reflect === 'object' ? Reflect : null;
	var ReflectApply = R && typeof R.apply === 'function'
	  ? R.apply
	  : function ReflectApply(target, receiver, args) {
	    return Function.prototype.apply.call(target, receiver, args);
	  };

	var ReflectOwnKeys;
	if (R && typeof R.ownKeys === 'function') {
	  ReflectOwnKeys = R.ownKeys;
	} else if (Object.getOwnPropertySymbols) {
	  ReflectOwnKeys = function ReflectOwnKeys(target) {
	    return Object.getOwnPropertyNames(target)
	      .concat(Object.getOwnPropertySymbols(target));
	  };
	} else {
	  ReflectOwnKeys = function ReflectOwnKeys(target) {
	    return Object.getOwnPropertyNames(target);
	  };
	}

	function ProcessEmitWarning(warning) {
	  if (console && console.warn) console.warn(warning);
	}

	var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
	  return value !== value;
	};

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}
	events.exports = EventEmitter;
	events.exports.once = once;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._eventsCount = 0;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	var defaultMaxListeners = 10;

	function checkListener(listener) {
	  if (typeof listener !== 'function') {
	    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
	  }
	}

	Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
	  enumerable: true,
	  get: function() {
	    return defaultMaxListeners;
	  },
	  set: function(arg) {
	    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
	      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
	    }
	    defaultMaxListeners = arg;
	  }
	});

	EventEmitter.init = function() {

	  if (this._events === undefined ||
	      this._events === Object.getPrototypeOf(this)._events) {
	    this._events = Object.create(null);
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
	    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
	  }
	  this._maxListeners = n;
	  return this;
	};

	function _getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return _getMaxListeners(this);
	};

	EventEmitter.prototype.emit = function emit(type) {
	  var args = [];
	  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
	  var doError = (type === 'error');

	  var events = this._events;
	  if (events !== undefined)
	    doError = (doError && events.error === undefined);
	  else if (!doError)
	    return false;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    var er;
	    if (args.length > 0)
	      er = args[0];
	    if (er instanceof Error) {
	      // Note: The comments on the `throw` lines are intentional, they show
	      // up in Node's output if this results in an unhandled exception.
	      throw er; // Unhandled 'error' event
	    }
	    // At least give some kind of context to the user
	    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
	    err.context = er;
	    throw err; // Unhandled 'error' event
	  }

	  var handler = events[type];

	  if (handler === undefined)
	    return false;

	  if (typeof handler === 'function') {
	    ReflectApply(handler, this, args);
	  } else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      ReflectApply(listeners[i], this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  checkListener(listener);

	  events = target._events;
	  if (events === undefined) {
	    events = target._events = Object.create(null);
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener !== undefined) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (existing === undefined) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] =
	        prepend ? [listener, existing] : [existing, listener];
	      // If we've already got an array, just append.
	    } else if (prepend) {
	      existing.unshift(listener);
	    } else {
	      existing.push(listener);
	    }

	    // Check for listener leak
	    m = _getMaxListeners(target);
	    if (m > 0 && existing.length > m && !existing.warned) {
	      existing.warned = true;
	      // No error code for this since it is a Warning
	      // eslint-disable-next-line no-restricted-syntax
	      var w = new Error('Possible EventEmitter memory leak detected. ' +
	                          existing.length + ' ' + String(type) + ' listeners ' +
	                          'added. Use emitter.setMaxListeners() to ' +
	                          'increase limit');
	      w.name = 'MaxListenersExceededWarning';
	      w.emitter = target;
	      w.type = type;
	      w.count = existing.length;
	      ProcessEmitWarning(w);
	    }
	  }

	  return target;
	}

	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function onceWrapper() {
	  if (!this.fired) {
	    this.target.removeListener(this.type, this.wrapFn);
	    this.fired = true;
	    if (arguments.length === 0)
	      return this.listener.call(this.target);
	    return this.listener.apply(this.target, arguments);
	  }
	}

	function _onceWrap(target, type, listener) {
	  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
	  var wrapped = onceWrapper.bind(state);
	  wrapped.listener = listener;
	  state.wrapFn = wrapped;
	  return wrapped;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  checkListener(listener);
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      checkListener(listener);
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// Emits a 'removeListener' event if and only if the listener was removed.
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      checkListener(listener);

	      events = this._events;
	      if (events === undefined)
	        return this;

	      list = events[type];
	      if (list === undefined)
	        return this;

	      if (list === listener || list.listener === listener) {
	        if (--this._eventsCount === 0)
	          this._events = Object.create(null);
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length - 1; i >= 0; i--) {
	          if (list[i] === listener || list[i].listener === listener) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (position === 0)
	          list.shift();
	        else {
	          spliceOne(list, position);
	        }

	        if (list.length === 1)
	          events[type] = list[0];

	        if (events.removeListener !== undefined)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };

	EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events, i;

	      events = this._events;
	      if (events === undefined)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (events.removeListener === undefined) {
	        if (arguments.length === 0) {
	          this._events = Object.create(null);
	          this._eventsCount = 0;
	        } else if (events[type] !== undefined) {
	          if (--this._eventsCount === 0)
	            this._events = Object.create(null);
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        var key;
	        for (i = 0; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = Object.create(null);
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners !== undefined) {
	        // LIFO order
	        for (i = listeners.length - 1; i >= 0; i--) {
	          this.removeListener(type, listeners[i]);
	        }
	      }

	      return this;
	    };

	function _listeners(target, type, unwrap) {
	  var events = target._events;

	  if (events === undefined)
	    return [];

	  var evlistener = events[type];
	  if (evlistener === undefined)
	    return [];

	  if (typeof evlistener === 'function')
	    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

	  return unwrap ?
	    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
	}

	EventEmitter.prototype.listeners = function listeners(type) {
	  return _listeners(this, type, true);
	};

	EventEmitter.prototype.rawListeners = function rawListeners(type) {
	  return _listeners(this, type, false);
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	  var events = this._events;

	  if (events !== undefined) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener !== undefined) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
	};

	function arrayClone(arr, n) {
	  var copy = new Array(n);
	  for (var i = 0; i < n; ++i)
	    copy[i] = arr[i];
	  return copy;
	}

	function spliceOne(list, index) {
	  for (; index + 1 < list.length; index++)
	    list[index] = list[index + 1];
	  list.pop();
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	function once(emitter, name) {
	  return new Promise(function (resolve, reject) {
	    function errorListener(err) {
	      emitter.removeListener(name, resolver);
	      reject(err);
	    }

	    function resolver() {
	      if (typeof emitter.removeListener === 'function') {
	        emitter.removeListener('error', errorListener);
	      }
	      resolve([].slice.call(arguments));
	    }
	    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
	    if (name !== 'error') {
	      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
	    }
	  });
	}

	function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
	  if (typeof emitter.on === 'function') {
	    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
	  }
	}

	function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
	  if (typeof emitter.on === 'function') {
	    if (flags.once) {
	      emitter.once(name, listener);
	    } else {
	      emitter.on(name, listener);
	    }
	  } else if (typeof emitter.addEventListener === 'function') {
	    // EventTarget does not have `error` event semantics like Node
	    // EventEmitters, we do not listen for `error` events here.
	    emitter.addEventListener(name, function wrapListener(arg) {
	      // IE does not have builtin `{ once: true }` support so we
	      // have to do it manually.
	      if (flags.once) {
	        emitter.removeEventListener(name, wrapListener);
	      }
	      listener(arg);
	    });
	  } else {
	    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
	  }
	}
	return events.exports;
}

var mapboxGlCompare;
var hasRequiredMapboxGlCompare;

function requireMapboxGlCompare () {
	if (hasRequiredMapboxGlCompare) return mapboxGlCompare;
	hasRequiredMapboxGlCompare = 1;

	var syncMove = requireMapboxGlSyncMove();
	var EventEmitter = requireEvents().EventEmitter;

	/**
	 * @param {Object} a The first Mapbox GL Map
	 * @param {Object} b The second Mapbox GL Map
	 * @param {string|HTMLElement} container An HTML Element, or an element selector string for the compare container. It should be a wrapper around the two map Elements.
	 * @param {Object} options
	 * @param {string} [options.orientation=vertical] The orientation of the compare slider. `vertical` creates a vertical slider bar to compare one map on the left (map A) with another map on the right (map B). `horizontal` creates a horizontal slider bar to compare on mop on the top (map A) and another map on the bottom (map B).
	 * @param {boolean} [options.mousemove=false] If `true` the compare slider will move with the cursor, otherwise the slider will need to be dragged to move.
	 * @example
	 * var compare = new mapboxgl.Compare(beforeMap, afterMap, '#wrapper', {
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
	    appendTarget.appendChild(this._controlContainer);
	  } else if (container instanceof Element && container.appendChild) {
	    // get container directly
	    container.appendChild(this._controlContainer);
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
	    e.preventDefault();
	    
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
	    this.fire('slideend', { currentPosition: this.currentPosition });
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
	   * Set the position of the slider.
	   *
	   * @param {number} x Slider position in pixels from left/top.
	   */
	  setSlider: function(x) {
	    this._setPosition(x);
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

	  /**
	   * Removes the control from the DOM and stop synchronizing the two maps.
	   */
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
	}

	mapboxGlCompare = Compare;
	return mapboxGlCompare;
}

var mapboxGlCompareExports = requireMapboxGlCompare();
var Compare = /*@__PURE__*/getDefaultExportFromCjs(mapboxGlCompareExports);

export { Compare as default };
