#!/usr/bin/env node

/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 113:
/***/ ((module) => {

module['exports'] = function(colors) {
  return function(letter, i, exploded) {
    if (letter === ' ') return letter;
    switch (i%3) {
      case 0: return colors.red(letter);
      case 1: return colors.white(letter);
      case 2: return colors.blue(letter);
    }
  };
};


/***/ }),

/***/ 181:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 228:
/***/ ((module) => {

"use strict";


var has = Object.prototype.hasOwnProperty
  , prefix = '~';

/**
 * Constructor to create a storage for our `EE` objects.
 * An `Events` instance is a plain object whose properties are event names.
 *
 * @constructor
 * @private
 */
function Events() {}

//
// We try to not inherit from `Object.prototype`. In some engines creating an
// instance in this way is faster than calling `Object.create(null)` directly.
// If `Object.create(null)` is not supported we prefix the event names with a
// character to make sure that the built-in object properties are not
// overridden or used as an attack vector.
//
if (Object.create) {
  Events.prototype = Object.create(null);

  //
  // This hack is needed because the `__proto__` property is still inherited in
  // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
  //
  if (!new Events().__proto__) prefix = false;
}

/**
 * Representation of a single event listener.
 *
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
 * @constructor
 * @private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Add a listener for a given event.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} context The context to invoke the listener with.
 * @param {Boolean} once Specify if the listener is a one-time listener.
 * @returns {EventEmitter}
 * @private
 */
function addListener(emitter, event, fn, context, once) {
  if (typeof fn !== 'function') {
    throw new TypeError('The listener must be a function');
  }

  var listener = new EE(fn, context || emitter, once)
    , evt = prefix ? prefix + event : event;

  if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
  else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
  else emitter._events[evt] = [emitter._events[evt], listener];

  return emitter;
}

/**
 * Clear event by name.
 *
 * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
 * @param {(String|Symbol)} evt The Event name.
 * @private
 */
function clearEvent(emitter, evt) {
  if (--emitter._eventsCount === 0) emitter._events = new Events();
  else delete emitter._events[evt];
}

/**
 * Minimal `EventEmitter` interface that is molded against the Node.js
 * `EventEmitter` interface.
 *
 * @constructor
 * @public
 */
function EventEmitter() {
  this._events = new Events();
  this._eventsCount = 0;
}

/**
 * Return an array listing the events for which the emitter has registered
 * listeners.
 *
 * @returns {Array}
 * @public
 */
EventEmitter.prototype.eventNames = function eventNames() {
  var names = []
    , events
    , name;

  if (this._eventsCount === 0) return names;

  for (name in (events = this._events)) {
    if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
  }

  if (Object.getOwnPropertySymbols) {
    return names.concat(Object.getOwnPropertySymbols(events));
  }

  return names;
};

/**
 * Return the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Array} The registered listeners.
 * @public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  var evt = prefix ? prefix + event : event
    , handlers = this._events[evt];

  if (!handlers) return [];
  if (handlers.fn) return [handlers.fn];

  for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
    ee[i] = handlers[i].fn;
  }

  return ee;
};

/**
 * Return the number of listeners listening to a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Number} The number of listeners.
 * @public
 */
EventEmitter.prototype.listenerCount = function listenerCount(event) {
  var evt = prefix ? prefix + event : event
    , listeners = this._events[evt];

  if (!listeners) return 0;
  if (listeners.fn) return 1;
  return listeners.length;
};

/**
 * Calls each of the listeners registered for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @returns {Boolean} `true` if the event had listeners, else `false`.
 * @public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return false;

  var listeners = this._events[evt]
    , len = arguments.length
    , args
    , i;

  if (listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Add a listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  return addListener(this, event, fn, context, false);
};

/**
 * Add a one-time listener for a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn The listener function.
 * @param {*} [context=this] The context to invoke the listener with.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  return addListener(this, event, fn, context, true);
};

/**
 * Remove the listeners of a given event.
 *
 * @param {(String|Symbol)} event The event name.
 * @param {Function} fn Only remove the listeners that match this function.
 * @param {*} context Only remove the listeners that have this context.
 * @param {Boolean} once Only remove one-time listeners.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
  var evt = prefix ? prefix + event : event;

  if (!this._events[evt]) return this;
  if (!fn) {
    clearEvent(this, evt);
    return this;
  }

  var listeners = this._events[evt];

  if (listeners.fn) {
    if (
      listeners.fn === fn &&
      (!once || listeners.once) &&
      (!context || listeners.context === context)
    ) {
      clearEvent(this, evt);
    }
  } else {
    for (var i = 0, events = [], length = listeners.length; i < length; i++) {
      if (
        listeners[i].fn !== fn ||
        (once && !listeners[i].once) ||
        (context && listeners[i].context !== context)
      ) {
        events.push(listeners[i]);
      }
    }

    //
    // Reset the array, or remove it completely if we have no more listeners.
    //
    if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
    else clearEvent(this, evt);
  }

  return this;
};

/**
 * Remove all listeners, or those of the specified event.
 *
 * @param {(String|Symbol)} [event] The event name.
 * @returns {EventEmitter} `this`.
 * @public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  var evt;

  if (event) {
    evt = prefix ? prefix + event : event;
    if (this._events[evt]) clearEvent(this, evt);
  } else {
    this._events = new Events();
    this._eventsCount = 0;
  }

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// Expose the prefix.
//
EventEmitter.prefixed = prefix;

//
// Allow `EventEmitter` to be imported as module namespace.
//
EventEmitter.EventEmitter = EventEmitter;

//
// Expose the module.
//
if (true) {
  module.exports = EventEmitter;
}


/***/ }),

/***/ 597:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { kForOnEventAttribute, kListener } = __webpack_require__(2614);

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kMessage = Symbol('kMessage');
const kReason = Symbol('kReason');
const kTarget = Symbol('kTarget');
const kType = Symbol('kType');
const kWasClean = Symbol('kWasClean');

/**
 * Class representing an event.
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @throws {TypeError} If the `type` argument is not specified
   */
  constructor(type) {
    this[kTarget] = null;
    this[kType] = type;
  }

  /**
   * @type {*}
   */
  get target() {
    return this[kTarget];
  }

  /**
   * @type {String}
   */
  get type() {
    return this[kType];
  }
}

Object.defineProperty(Event.prototype, 'target', { enumerable: true });
Object.defineProperty(Event.prototype, 'type', { enumerable: true });

/**
 * Class representing a close event.
 *
 * @extends Event
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {Number} [options.code=0] The status code explaining why the
   *     connection was closed
   * @param {String} [options.reason=''] A human-readable string explaining why
   *     the connection was closed
   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
   *     connection was cleanly closed
   */
  constructor(type, options = {}) {
    super(type);

    this[kCode] = options.code === undefined ? 0 : options.code;
    this[kReason] = options.reason === undefined ? '' : options.reason;
    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
  }

  /**
   * @type {Number}
   */
  get code() {
    return this[kCode];
  }

  /**
   * @type {String}
   */
  get reason() {
    return this[kReason];
  }

  /**
   * @type {Boolean}
   */
  get wasClean() {
    return this[kWasClean];
  }
}

Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

/**
 * Class representing an error event.
 *
 * @extends Event
 */
class ErrorEvent extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.error=null] The error that generated this event
   * @param {String} [options.message=''] The error message
   */
  constructor(type, options = {}) {
    super(type);

    this[kError] = options.error === undefined ? null : options.error;
    this[kMessage] = options.message === undefined ? '' : options.message;
  }

  /**
   * @type {*}
   */
  get error() {
    return this[kError];
  }

  /**
   * @type {String}
   */
  get message() {
    return this[kMessage];
  }
}

Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

/**
 * Class representing a message event.
 *
 * @extends Event
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.data=null] The message content
   */
  constructor(type, options = {}) {
    super(type);

    this[kData] = options.data === undefined ? null : options.data;
  }

  /**
   * @type {*}
   */
  get data() {
    return this[kData];
  }
}

Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {(Function|Object)} handler The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, handler, options = {}) {
    for (const listener of this.listeners(type)) {
      if (
        !options[kForOnEventAttribute] &&
        listener[kListener] === handler &&
        !listener[kForOnEventAttribute]
      ) {
        return;
      }
    }

    let wrapper;

    if (type === 'message') {
      wrapper = function onMessage(data, isBinary) {
        const event = new MessageEvent('message', {
          data: isBinary ? data : data.toString()
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'close') {
      wrapper = function onClose(code, message) {
        const event = new CloseEvent('close', {
          code,
          reason: message.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'error') {
      wrapper = function onError(error) {
        const event = new ErrorEvent('error', {
          error,
          message: error.message
        });

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else if (type === 'open') {
      wrapper = function onOpen() {
        const event = new Event('open');

        event[kTarget] = this;
        callListener(handler, this, event);
      };
    } else {
      return;
    }

    wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
    wrapper[kListener] = handler;

    if (options.once) {
      this.once(type, wrapper);
    } else {
      this.on(type, wrapper);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {(Function|Object)} handler The listener to remove
   * @public
   */
  removeEventListener(type, handler) {
    for (const listener of this.listeners(type)) {
      if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {
        this.removeListener(type, listener);
        break;
      }
    }
  }
};

module.exports = {
  CloseEvent,
  ErrorEvent,
  Event,
  EventTarget,
  MessageEvent
};

/**
 * Call an event listener
 *
 * @param {(Function|Object)} listener The listener to call
 * @param {*} thisArg The value to use as `this`` when calling the listener
 * @param {Event} event The event to pass to the listener
 * @private
 */
function callListener(listener, thisArg, event) {
  if (typeof listener === 'object' && listener.handleEvent) {
    listener.handleEvent.call(listener, event);
  } else {
    listener.call(thisArg, event);
  }
}


/***/ }),

/***/ 857:
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ 889:
/***/ ((module) => {

module['exports'] = function(colors) {
  return function(letter, i, exploded) {
    return i % 2 === 0 ? letter : colors.inverse(letter);
  };
};


/***/ }),

/***/ 914:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex" }] */



const { Duplex } = __webpack_require__(2203);
const { randomFillSync } = __webpack_require__(6982);

const PerMessageDeflate = __webpack_require__(2971);
const { EMPTY_BUFFER, kWebSocket, NOOP } = __webpack_require__(2614);
const { isBlob, isValidStatusCode } = __webpack_require__(5880);
const { mask: applyMask, toBuffer } = __webpack_require__(3338);

const kByteLength = Symbol('kByteLength');
const maskBuffer = Buffer.alloc(4);
const RANDOM_POOL_SIZE = 8 * 1024;
let randomPool;
let randomPoolPointer = RANDOM_POOL_SIZE;

const DEFAULT = 0;
const DEFLATING = 1;
const GET_BLOB_DATA = 2;

/**
 * HyBi Sender implementation.
 */
class Sender {
  /**
   * Creates a Sender instance.
   *
   * @param {Duplex} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Function} [generateMask] The function used to generate the masking
   *     key
   */
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};

    if (generateMask) {
      this._generateMask = generateMask;
      this._maskBuffer = Buffer.alloc(4);
    }

    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._queue = [];
    this._state = DEFAULT;
    this.onerror = NOOP;
    this[kWebSocket] = undefined;
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {(Buffer|String)} data The data to frame
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {(Buffer|String)[]} The framed data
   * @public
   */
  static frame(data, options) {
    let mask;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;

      if (options.generateMask) {
        options.generateMask(mask);
      } else {
        if (randomPoolPointer === RANDOM_POOL_SIZE) {
          /* istanbul ignore else  */
          if (randomPool === undefined) {
            //
            // This is lazily initialized because server-sent frames must not
            // be masked so it may never be used.
            //
            randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
          }

          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
          randomPoolPointer = 0;
        }

        mask[0] = randomPool[randomPoolPointer++];
        mask[1] = randomPool[randomPoolPointer++];
        mask[2] = randomPool[randomPoolPointer++];
        mask[3] = randomPool[randomPoolPointer++];
      }

      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
      offset = 6;
    }

    let dataLength;

    if (typeof data === 'string') {
      if (
        (!options.mask || skipMasking) &&
        options[kByteLength] !== undefined
      ) {
        dataLength = options[kByteLength];
      } else {
        data = Buffer.from(data);
        dataLength = data.length;
      }
    } else {
      dataLength = data.length;
      merge = options.mask && options.readOnly && !skipMasking;
    }

    let payloadLength = dataLength;

    if (dataLength >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (dataLength > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(dataLength, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(dataLength, 4, 6);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (skipMasking) return [target, data];

    if (merge) {
      applyMask(data, mask, target, offset, dataLength);
      return [target];
    }

    applyMask(data, mask, data, 0, dataLength);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {(String|Buffer)} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask, cb) {
    let buf;

    if (code === undefined) {
      buf = EMPTY_BUFFER;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);

      if (typeof data === 'string') {
        buf.write(data, 2);
      } else {
        buf.set(data, 2);
      }
    }

    const options = {
      [kByteLength]: buf.length,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x08,
      readOnly: false,
      rsv1: false
    };

    if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, buf, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(buf, options), cb);
    }
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask, cb) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x09,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, cb]);
      } else {
        this.getBlobData(data, false, options, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
    }
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask, cb) {
    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (byteLength > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    const options = {
      [kByteLength]: byteLength,
      fin: true,
      generateMask: this._generateMask,
      mask,
      maskBuffer: this._maskBuffer,
      opcode: 0x0a,
      readOnly,
      rsv1: false
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, false, options, cb]);
      } else {
        this.getBlobData(data, false, options, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, false, options, cb]);
    } else {
      this.sendFrame(Sender.frame(data, options), cb);
    }
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    let byteLength;
    let readOnly;

    if (typeof data === 'string') {
      byteLength = Buffer.byteLength(data);
      readOnly = false;
    } else if (isBlob(data)) {
      byteLength = data.size;
      readOnly = false;
    } else {
      data = toBuffer(data);
      byteLength = data.length;
      readOnly = toBuffer.readOnly;
    }

    if (this._firstFragment) {
      this._firstFragment = false;
      if (
        rsv1 &&
        perMessageDeflate &&
        perMessageDeflate.params[
          perMessageDeflate._isServer
            ? 'server_no_context_takeover'
            : 'client_no_context_takeover'
        ]
      ) {
        rsv1 = byteLength >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    const opts = {
      [kByteLength]: byteLength,
      fin: options.fin,
      generateMask: this._generateMask,
      mask: options.mask,
      maskBuffer: this._maskBuffer,
      opcode,
      readOnly,
      rsv1
    };

    if (isBlob(data)) {
      if (this._state !== DEFAULT) {
        this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
      } else {
        this.getBlobData(data, this._compress, opts, cb);
      }
    } else if (this._state !== DEFAULT) {
      this.enqueue([this.dispatch, data, this._compress, opts, cb]);
    } else {
      this.dispatch(data, this._compress, opts, cb);
    }
  }

  /**
   * Gets the contents of a blob as binary data.
   *
   * @param {Blob} blob The blob
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     the data
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  getBlobData(blob, compress, options, cb) {
    this._bufferedBytes += options[kByteLength];
    this._state = GET_BLOB_DATA;

    blob
      .arrayBuffer()
      .then((arrayBuffer) => {
        if (this._socket.destroyed) {
          const err = new Error(
            'The socket was closed while the blob was being read'
          );

          //
          // `callCallbacks` is called in the next tick to ensure that errors
          // that might be thrown in the callbacks behave like errors thrown
          // outside the promise chain.
          //
          process.nextTick(callCallbacks, this, err, cb);
          return;
        }

        this._bufferedBytes -= options[kByteLength];
        const data = toBuffer(arrayBuffer);

        if (!compress) {
          this._state = DEFAULT;
          this.sendFrame(Sender.frame(data, options), cb);
          this.dequeue();
        } else {
          this.dispatch(data, compress, options, cb);
        }
      })
      .catch((err) => {
        //
        // `onError` is called in the next tick for the same reason that
        // `callCallbacks` above is.
        //
        process.nextTick(onError, this, err, cb);
      });
  }

  /**
   * Dispatches a message.
   *
   * @param {(Buffer|String)} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    this._bufferedBytes += options[kByteLength];
    this._state = DEFLATING;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        callCallbacks(this, err, cb);
        return;
      }

      this._bufferedBytes -= options[kByteLength];
      this._state = DEFAULT;
      options.readOnly = false;
      this.sendFrame(Sender.frame(buf, options), cb);
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (this._state === DEFAULT && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[3][kByteLength];
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[3][kByteLength];
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {(Buffer | String)[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

module.exports = Sender;

/**
 * Calls queued callbacks with an error.
 *
 * @param {Sender} sender The `Sender` instance
 * @param {Error} err The error to call the callbacks with
 * @param {Function} [cb] The first callback
 * @private
 */
function callCallbacks(sender, err, cb) {
  if (typeof cb === 'function') cb(err);

  for (let i = 0; i < sender._queue.length; i++) {
    const params = sender._queue[i];
    const callback = params[params.length - 1];

    if (typeof callback === 'function') callback(err);
  }
}

/**
 * Handles a `Sender` error.
 *
 * @param {Sender} sender The `Sender` instance
 * @param {Error} err The error
 * @param {Function} [cb] The first pending callback
 * @private
 */
function onError(sender, err, cb) {
  callCallbacks(sender, err, cb);
  sender.onerror(err);
}


/***/ }),

/***/ 1060:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex|Readable$", "caughtErrors": "none" }] */



const EventEmitter = __webpack_require__(4434);
const https = __webpack_require__(5692);
const http = __webpack_require__(8611);
const net = __webpack_require__(9278);
const tls = __webpack_require__(4756);
const { randomBytes, createHash } = __webpack_require__(6982);
const { Duplex, Readable } = __webpack_require__(2203);
const { URL } = __webpack_require__(7016);

const PerMessageDeflate = __webpack_require__(2971);
const Receiver = __webpack_require__(6286);
const Sender = __webpack_require__(914);
const { isBlob } = __webpack_require__(5880);

const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket,
  NOOP
} = __webpack_require__(2614);
const {
  EventTarget: { addEventListener, removeEventListener }
} = __webpack_require__(597);
const { format, parse } = __webpack_require__(5926);
const { toBuffer } = __webpack_require__(3338);

const closeTimeout = 30 * 1000;
const kAborted = Symbol('kAborted');
const protocolVersions = [8, 13];
const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket extends EventEmitter {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();

    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = EMPTY_BUFFER;
    this._closeTimer = null;
    this._errorEmitted = false;
    this._extensions = {};
    this._paused = false;
    this._protocol = '';
    this._readyState = WebSocket.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (protocols === undefined) {
        protocols = [];
      } else if (!Array.isArray(protocols)) {
        if (typeof protocols === 'object' && protocols !== null) {
          options = protocols;
          protocols = [];
        } else {
          protocols = [protocols];
        }
      }

      initAsClient(this, address, protocols, options);
    } else {
      this._autoPong = options.autoPong;
      this._isServer = true;
    }
  }

  /**
   * For historical reasons, the custom "nodebuffer" type is used by the default
   * instead of "blob".
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;

    return this._socket._writableState.length + this._sender._bufferedBytes;
  }

  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }

  /**
   * @type {Boolean}
   */
  get isPaused() {
    return this._paused;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return null;
  }

  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }

  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
  setSocket(socket, head, options) {
    const receiver = new Receiver({
      allowSynchronousEvents: options.allowSynchronousEvents,
      binaryType: this.binaryType,
      extensions: this._extensions,
      isServer: this._isServer,
      maxPayload: options.maxPayload,
      skipUTF8Validation: options.skipUTF8Validation
    });

    const sender = new Sender(socket, this._extensions, options.generateMask);

    this._receiver = receiver;
    this._sender = sender;
    this._socket = socket;

    receiver[kWebSocket] = this;
    sender[kWebSocket] = this;
    socket[kWebSocket] = this;

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    sender.onerror = senderOnError;

    //
    // These methods may not be available if `socket` is just a `Duplex`.
    //
    if (socket.setTimeout) socket.setTimeout(0);
    if (socket.setNoDelay) socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError);

    this._readyState = WebSocket.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate.extensionName]) {
      this._extensions[PerMessageDeflate.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
  }

  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {(String|Buffer)} [data] The reason why the connection is
   *     closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      abortHandshake(this, this._req, msg);
      return;
    }

    if (this.readyState === WebSocket.CLOSING) {
      if (
        this._closeFrameSent &&
        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
      ) {
        this._socket.end();
      }

      return;
    }

    this._readyState = WebSocket.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (
        this._closeFrameReceived ||
        this._receiver._writableState.errorEmitted
      ) {
        this._socket.end();
      }
    });

    setCloseTimer(this);
  }

  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
      return;
    }

    this._paused = true;
    this._socket.pause();
  }

  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    if (
      this.readyState === WebSocket.CONNECTING ||
      this.readyState === WebSocket.CLOSED
    ) {
      return;
    }

    this._paused = false;
    if (!this._receiver._writableState.needDrain) this._socket.resume();
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };

    if (!this._extensions[PerMessageDeflate.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket.CLOSED) return;
    if (this.readyState === WebSocket.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      abortHandshake(this, this._req, msg);
      return;
    }

    if (this._socket) {
      this._readyState = WebSocket.CLOSING;
      this._socket.destroy();
    }
  }
}

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket.prototype, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'isPaused',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket.prototype, `on${method}`, {
    enumerable: true,
    get() {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) return listener[kListener];
      }

      return null;
    },
    set(handler) {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) {
          this.removeListener(method, listener);
          break;
        }
      }

      if (typeof handler !== 'function') return;

      this.addEventListener(method, handler, {
        [kForOnEventAttribute]: true
      });
    }
  });
});

WebSocket.prototype.addEventListener = addEventListener;
WebSocket.prototype.removeEventListener = removeEventListener;

module.exports = WebSocket;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {Array} protocols The subprotocols
 * @param {Object} [options] Connection options
 * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any
 *     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple
 *     times in the same tick
 * @param {Boolean} [options.autoPong=true] Specifies whether or not to
 *     automatically send a pong in response to a ping
 * @param {Function} [options.finishRequest] A function which can be used to
 *     customize the headers of each http request before it is sent
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Function} [options.generateMask] The function used to generate the
 *     masking key
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
 *     not to skip UTF-8 validation for text and close messages
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    allowSynchronousEvents: true,
    autoPong: true,
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    skipUTF8Validation: false,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    timeout: undefined,
    method: 'GET',
    host: undefined,
    path: undefined,
    port: undefined
  };

  websocket._autoPong = opts.autoPong;

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL) {
    parsedUrl = address;
  } else {
    try {
      parsedUrl = new URL(address);
    } catch (e) {
      throw new SyntaxError(`Invalid URL: ${address}`);
    }
  }

  if (parsedUrl.protocol === 'http:') {
    parsedUrl.protocol = 'ws:';
  } else if (parsedUrl.protocol === 'https:') {
    parsedUrl.protocol = 'wss:';
  }

  websocket._url = parsedUrl.href;

  const isSecure = parsedUrl.protocol === 'wss:';
  const isIpcUrl = parsedUrl.protocol === 'ws+unix:';
  let invalidUrlMessage;

  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {
    invalidUrlMessage =
      'The URL\'s protocol must be one of "ws:", "wss:", ' +
      '"http:", "https", or "ws+unix:"';
  } else if (isIpcUrl && !parsedUrl.pathname) {
    invalidUrlMessage = "The URL's pathname is empty";
  } else if (parsedUrl.hash) {
    invalidUrlMessage = 'The URL contains a fragment identifier';
  }

  if (invalidUrlMessage) {
    const err = new SyntaxError(invalidUrlMessage);

    if (websocket._redirects === 0) {
      throw err;
    } else {
      emitErrorAndClose(websocket, err);
      return;
    }
  }

  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString('base64');
  const request = isSecure ? https.request : http.request;
  const protocolSet = new Set();
  let perMessageDeflate;

  opts.createConnection =
    opts.createConnection || (isSecure ? tlsConnect : netConnect);
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    ...opts.headers,
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket'
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers['Sec-WebSocket-Extensions'] = format({
      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols.length) {
    for (const protocol of protocols) {
      if (
        typeof protocol !== 'string' ||
        !subprotocolRegex.test(protocol) ||
        protocolSet.has(protocol)
      ) {
        throw new SyntaxError(
          'An invalid or duplicated subprotocol was specified'
        );
      }

      protocolSet.add(protocol);
    }

    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isIpcUrl) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  let req;

  if (opts.followRedirects) {
    if (websocket._redirects === 0) {
      websocket._originalIpc = isIpcUrl;
      websocket._originalSecure = isSecure;
      websocket._originalHostOrSocketPath = isIpcUrl
        ? opts.socketPath
        : parsedUrl.host;

      const headers = options && options.headers;

      //
      // Shallow copy the user provided options so that headers can be changed
      // without mutating the original object.
      //
      options = { ...options, headers: {} };

      if (headers) {
        for (const [key, value] of Object.entries(headers)) {
          options.headers[key.toLowerCase()] = value;
        }
      }
    } else if (websocket.listenerCount('redirect') === 0) {
      const isSameHost = isIpcUrl
        ? websocket._originalIpc
          ? opts.socketPath === websocket._originalHostOrSocketPath
          : false
        : websocket._originalIpc
          ? false
          : parsedUrl.host === websocket._originalHostOrSocketPath;

      if (!isSameHost || (websocket._originalSecure && !isSecure)) {
        //
        // Match curl 7.77.0 behavior and drop the following headers. These
        // headers are also dropped when following a redirect to a subdomain.
        //
        delete opts.headers.authorization;
        delete opts.headers.cookie;

        if (!isSameHost) delete opts.headers.host;

        opts.auth = undefined;
      }
    }

    //
    // Match curl 7.77.0 behavior and make the first `Authorization` header win.
    // If the `Authorization` header is set, then there is nothing to do as it
    // will take precedence.
    //
    if (opts.auth && !options.headers.authorization) {
      options.headers.authorization =
        'Basic ' + Buffer.from(opts.auth).toString('base64');
    }

    req = websocket._req = request(opts);

    if (websocket._redirects) {
      //
      // Unlike what is done for the `'upgrade'` event, no early exit is
      // triggered here if the user calls `websocket.close()` or
      // `websocket.terminate()` from a listener of the `'redirect'` event. This
      // is because the user can also call `request.destroy()` with an error
      // before calling `websocket.close()` or `websocket.terminate()` and this
      // would result in an error being emitted on the `request` object with no
      // `'error'` event listeners attached.
      //
      websocket.emit('redirect', websocket.url, req);
    }
  } else {
    req = websocket._req = request(opts);
  }

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req[kAborted]) return;

    req = websocket._req = null;
    emitErrorAndClose(websocket, err);
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      let addr;

      try {
        addr = new URL(location, address);
      } catch (e) {
        const err = new SyntaxError(`Invalid URL: ${location}`);
        emitErrorAndClose(websocket, err);
        return;
      }

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the
    // `'upgrade'` event.
    //
    if (websocket.readyState !== WebSocket.CONNECTING) return;

    req = websocket._req = null;

    const upgrade = res.headers.upgrade;

    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
      abortHandshake(websocket, socket, 'Invalid Upgrade header');
      return;
    }

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    let protError;

    if (serverProt !== undefined) {
      if (!protocolSet.size) {
        protError = 'Server sent a subprotocol but none was requested';
      } else if (!protocolSet.has(serverProt)) {
        protError = 'Server sent an invalid subprotocol';
      }
    } else if (protocolSet.size) {
      protError = 'Server sent no subprotocol';
    }

    if (protError) {
      abortHandshake(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

    if (secWebSocketExtensions !== undefined) {
      if (!perMessageDeflate) {
        const message =
          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
          'was requested';
        abortHandshake(websocket, socket, message);
        return;
      }

      let extensions;

      try {
        extensions = parse(secWebSocketExtensions);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake(websocket, socket, message);
        return;
      }

      const extensionNames = Object.keys(extensions);

      if (
        extensionNames.length !== 1 ||
        extensionNames[0] !== PerMessageDeflate.extensionName
      ) {
        const message = 'Server indicated an extension that was not requested';
        abortHandshake(websocket, socket, message);
        return;
      }

      try {
        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake(websocket, socket, message);
        return;
      }

      websocket._extensions[PerMessageDeflate.extensionName] =
        perMessageDeflate;
    }

    websocket.setSocket(socket, head, {
      allowSynchronousEvents: opts.allowSynchronousEvents,
      generateMask: opts.generateMask,
      maxPayload: opts.maxPayload,
      skipUTF8Validation: opts.skipUTF8Validation
    });
  });

  if (opts.finishRequest) {
    opts.finishRequest(req, websocket);
  } else {
    req.end();
  }
}

/**
 * Emit the `'error'` and `'close'` events.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
  websocket._readyState = WebSocket.CLOSING;
  //
  // The following assignment is practically useless and is done only for
  // consistency.
  //
  websocket._errorEmitted = true;
  websocket.emit('error', err);
  websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake(websocket, stream, message) {
  websocket._readyState = WebSocket.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake);

  if (stream.setHeader) {
    stream[kAborted] = true;
    stream.abort();

    if (stream.socket && !stream.socket.destroyed) {
      //
      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
      // called after the request completed. See
      // https://github.com/websockets/ws/issues/1869.
      //
      stream.socket.destroy();
    }

    process.nextTick(emitErrorAndClose, websocket, err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = isBlob(data) ? data.size : toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    process.nextTick(cb, err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {Buffer} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket];

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (websocket._socket[kWebSocket] === undefined) return;

  websocket._socket.removeListener('data', socketOnData);
  process.nextTick(resume, websocket._socket);

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  const websocket = this[kWebSocket];

  if (!websocket.isPaused) websocket._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket];

  if (websocket._socket[kWebSocket] !== undefined) {
    websocket._socket.removeListener('data', socketOnData);

    //
    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
    // https://github.com/websockets/ws/issues/1940.
    //
    process.nextTick(resume, websocket._socket);

    websocket.close(err[kStatusCode]);
  }

  if (!websocket._errorEmitted) {
    websocket._errorEmitted = true;
    websocket.emit('error', err);
  }
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
 * @param {Boolean} isBinary Specifies whether the message is binary or not
 * @private
 */
function receiverOnMessage(data, isBinary) {
  this[kWebSocket].emit('message', data, isBinary);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket];

  if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
  stream.resume();
}

/**
 * The `Sender` error event handler.
 *
 * @param {Error} The error
 * @private
 */
function senderOnError(err) {
  const websocket = this[kWebSocket];

  if (websocket.readyState === WebSocket.CLOSED) return;
  if (websocket.readyState === WebSocket.OPEN) {
    websocket._readyState = WebSocket.CLOSING;
    setCloseTimer(websocket);
  }

  //
  // `socket.end()` is used instead of `socket.destroy()` to allow the other
  // peer to finish sending queued data. There is no need to set a timer here
  // because `CLOSING` means that it is already set or not needed.
  //
  this._socket.end();

  if (!websocket._errorEmitted) {
    websocket._errorEmitted = true;
    websocket.emit('error', err);
  }
}

/**
 * Set a timer to destroy the underlying raw socket of a WebSocket.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @private
 */
function setCloseTimer(websocket) {
  websocket._closeTimer = setTimeout(
    websocket._socket.destroy.bind(websocket._socket),
    closeTimeout
  );
}

/**
 * The listener of the socket `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket];

  this.removeListener('close', socketOnClose);
  this.removeListener('data', socketOnData);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket.CLOSING;

  let chunk;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written and `readable.read()`
  // will return `null`. If instead, the socket is paused, any possible buffered
  // data will be read as a single chunk.
  //
  if (
    !this._readableState.endEmitted &&
    !websocket._closeFrameReceived &&
    !websocket._receiver._writableState.errorEmitted &&
    (chunk = websocket._socket.read()) !== null
  ) {
    websocket._receiver.write(chunk);
  }

  websocket._receiver.end();

  this[kWebSocket] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the socket `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the socket `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket];

  websocket._readyState = WebSocket.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the socket `'error'` event.
 *
 * @private
 */
function socketOnError() {
  const websocket = this[kWebSocket];

  this.removeListener('error', socketOnError);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket.CLOSING;
    this.destroy();
  }
}


/***/ }),

/***/ 1409:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var colors = __webpack_require__(4189);
module['exports'] = colors;

// Remark: By default, colors will add style properties to String.prototype.
//
// If you don't wish to extend String.prototype, you can do this instead and
// native String will not be touched:
//
//   var colors = require('colors/safe);
//   colors.red("foo")
//
//
__webpack_require__(6120)();


/***/ }),

/***/ 1421:
/***/ ((module) => {

"use strict";
module.exports = require("node:child_process");

/***/ }),

/***/ 1708:
/***/ ((module) => {

"use strict";
module.exports = require("node:process");

/***/ }),

/***/ 1722:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex$", "caughtErrors": "none" }] */



const EventEmitter = __webpack_require__(4434);
const http = __webpack_require__(8611);
const { Duplex } = __webpack_require__(2203);
const { createHash } = __webpack_require__(6982);

const extension = __webpack_require__(5926);
const PerMessageDeflate = __webpack_require__(2971);
const subprotocol = __webpack_require__(8237);
const WebSocket = __webpack_require__(1060);
const { GUID, kWebSocket } = __webpack_require__(2614);

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

const RUNNING = 0;
const CLOSING = 1;
const CLOSED = 2;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {Boolean} [options.autoPong=true] Specifies whether or not to
   *     automatically send a pong in response to a ping
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
   *     size
   * @param {Boolean} [options.noServer=false] Enable no server mode
   * @param {String} [options.path] Accept only connections matching this path
   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
   *     permessage-deflate
   * @param {Number} [options.port] The port where to bind the server
   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
   *     server to use
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @param {Function} [options.verifyClient] A hook to reject connections
   * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
   *     class to use. It must be the `WebSocket` class or class that extends it
   * @param {Function} [callback] A listener for the `listening` event
   */
  constructor(options, callback) {
    super();

    options = {
      allowSynchronousEvents: true,
      autoPong: true,
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      WebSocket,
      ...options
    };

    if (
      (options.port == null && !options.server && !options.noServer) ||
      (options.port != null && (options.server || options.noServer)) ||
      (options.server && options.noServer)
    ) {
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options ' +
          'must be specified'
      );
    }

    if (options.port != null) {
      this._server = http.createServer((req, res) => {
        const body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(
        options.port,
        options.host,
        options.backlog,
        callback
      );
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) {
      this.clients = new Set();
      this._shouldEmitClose = false;
    }

    this.options = options;
    this._state = RUNNING;
  }

  /**
   * Returns the bound address, the address family name, and port of the server
   * as reported by the operating system if listening on an IP socket.
   * If the server is listening on a pipe or UNIX domain socket, the name is
   * returned as a string.
   *
   * @return {(Object|String|null)} The address of the server
   * @public
   */
  address() {
    if (this.options.noServer) {
      throw new Error('The server is operating in "noServer" mode');
    }

    if (!this._server) return null;
    return this._server.address();
  }

  /**
   * Stop the server from accepting new connections and emit the `'close'` event
   * when all existing connections are closed.
   *
   * @param {Function} [cb] A one-time listener for the `'close'` event
   * @public
   */
  close(cb) {
    if (this._state === CLOSED) {
      if (cb) {
        this.once('close', () => {
          cb(new Error('The server is not running'));
        });
      }

      process.nextTick(emitClose, this);
      return;
    }

    if (cb) this.once('close', cb);

    if (this._state === CLOSING) return;
    this._state = CLOSING;

    if (this.options.noServer || this.options.server) {
      if (this._server) {
        this._removeListeners();
        this._removeListeners = this._server = null;
      }

      if (this.clients) {
        if (!this.clients.size) {
          process.nextTick(emitClose, this);
        } else {
          this._shouldEmitClose = true;
        }
      } else {
        process.nextTick(emitClose, this);
      }
    } else {
      const server = this._server;

      this._removeListeners();
      this._removeListeners = this._server = null;

      //
      // The HTTP/S server was created internally. Close it, and rely on its
      // `'close'` event.
      //
      server.close(() => {
        emitClose(this);
      });
    }
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(req) {
    if (this.options.path) {
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key = req.headers['sec-websocket-key'];
    const upgrade = req.headers.upgrade;
    const version = +req.headers['sec-websocket-version'];

    if (req.method !== 'GET') {
      const message = 'Invalid HTTP method';
      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
      return;
    }

    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {
      const message = 'Invalid Upgrade header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (key === undefined || !keyRegex.test(key)) {
      const message = 'Missing or invalid Sec-WebSocket-Key header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (version !== 8 && version !== 13) {
      const message = 'Missing or invalid Sec-WebSocket-Version header';
      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
      return;
    }

    if (!this.shouldHandle(req)) {
      abortHandshake(socket, 400);
      return;
    }

    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
    let protocols = new Set();

    if (secWebSocketProtocol !== undefined) {
      try {
        protocols = subprotocol.parse(secWebSocketProtocol);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Protocol header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
    const extensions = {};

    if (
      this.options.perMessageDeflate &&
      secWebSocketExtensions !== undefined
    ) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = extension.parse(secWebSocketExtensions);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        const message =
          'Invalid or unacceptable Sec-WebSocket-Extensions header';
        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
        return;
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.socket.authorized || req.socket.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message, headers) => {
          if (!verified) {
            return abortHandshake(socket, code || 401, message, headers);
          }

          this.completeUpgrade(
            extensions,
            key,
            protocols,
            req,
            socket,
            head,
            cb
          );
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
    }

    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {Object} extensions The accepted extensions
   * @param {String} key The value of the `Sec-WebSocket-Key` header
   * @param {Set} protocols The subprotocols
   * @param {http.IncomingMessage} req The request object
   * @param {Duplex} socket The network socket between the server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    if (this._state > RUNNING) return abortHandshake(socket, 503);

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new this.options.WebSocket(null, undefined, this.options);

    if (protocols.size) {
      //
      // Optionally call external protocol selection handler.
      //
      const protocol = this.options.handleProtocols
        ? this.options.handleProtocols(protocols, req)
        : protocols.values().next().value;

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = extension.format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, {
      allowSynchronousEvents: this.options.allowSynchronousEvents,
      maxPayload: this.options.maxPayload,
      skipUTF8Validation: this.options.skipUTF8Validation
    });

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);

        if (this._shouldEmitClose && !this.clients.size) {
          process.nextTick(emitClose, this);
        }
      });
    }

    cb(ws, req);
  }
}

module.exports = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server._state = CLOSED;
  server.emit('close');
}

/**
 * Handle socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {Duplex} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  //
  // The socket is writable unless the user destroyed or ended it before calling
  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user
  // error. Handling this does not make much sense as the worst that can happen
  // is that some of the data written by the user might be discarded due to the
  // call to `socket.end()` below, which triggers an `'error'` event that in
  // turn causes the socket to be destroyed.
  //
  message = message || http.STATUS_CODES[code];
  headers = {
    Connection: 'close',
    'Content-Type': 'text/html',
    'Content-Length': Buffer.byteLength(message),
    ...headers
  };

  socket.once('finish', socket.destroy);

  socket.end(
    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
      Object.keys(headers)
        .map((h) => `${h}: ${headers[h]}`)
        .join('\r\n') +
      '\r\n\r\n' +
      message
  );
}

/**
 * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least
 * one listener for it, otherwise call `abortHandshake()`.
 *
 * @param {WebSocketServer} server The WebSocket server
 * @param {http.IncomingMessage} req The request object
 * @param {Duplex} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} message The HTTP response body
 * @private
 */
function abortHandshakeOrEmitwsClientError(server, req, socket, code, message) {
  if (server.listenerCount('wsClientError')) {
    const err = new Error(message);
    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);

    server.emit('wsClientError', err, socket, req);
  } else {
    abortHandshake(socket, code, message);
  }
}


/***/ }),

/***/ 2116:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { Argument } = __webpack_require__(9297);
const { Command } = __webpack_require__(3749);
const { CommanderError, InvalidArgumentError } = __webpack_require__(3666);
const { Help } = __webpack_require__(3693);
const { Option } = __webpack_require__(5019);

exports.DM = new Command();

exports.gu = (name) => new Command(name);
exports.Ww = (flags, description) => new Option(flags, description);
exports.er = (name, description) => new Argument(name, description);

/**
 * Expose classes
 */

exports.uB = Command;
exports.c$ = Option;
exports.ef = Argument;
exports._V = Help;

exports.b7 = CommanderError;
exports.Di = InvalidArgumentError;
exports.a2 = InvalidArgumentError; // Deprecated


/***/ }),

/***/ 2139:
/***/ ((module) => {

/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var styles = {};
module['exports'] = styles;

var codes = {
  reset: [0, 0],

  bold: [1, 22],
  dim: [2, 22],
  italic: [3, 23],
  underline: [4, 24],
  inverse: [7, 27],
  hidden: [8, 28],
  strikethrough: [9, 29],

  black: [30, 39],
  red: [31, 39],
  green: [32, 39],
  yellow: [33, 39],
  blue: [34, 39],
  magenta: [35, 39],
  cyan: [36, 39],
  white: [37, 39],
  gray: [90, 39],
  grey: [90, 39],

  brightRed: [91, 39],
  brightGreen: [92, 39],
  brightYellow: [93, 39],
  brightBlue: [94, 39],
  brightMagenta: [95, 39],
  brightCyan: [96, 39],
  brightWhite: [97, 39],

  bgBlack: [40, 49],
  bgRed: [41, 49],
  bgGreen: [42, 49],
  bgYellow: [43, 49],
  bgBlue: [44, 49],
  bgMagenta: [45, 49],
  bgCyan: [46, 49],
  bgWhite: [47, 49],
  bgGray: [100, 49],
  bgGrey: [100, 49],

  bgBrightRed: [101, 49],
  bgBrightGreen: [102, 49],
  bgBrightYellow: [103, 49],
  bgBrightBlue: [104, 49],
  bgBrightMagenta: [105, 49],
  bgBrightCyan: [106, 49],
  bgBrightWhite: [107, 49],

  // legacy styles for colors pre v1.0.0
  blackBG: [40, 49],
  redBG: [41, 49],
  greenBG: [42, 49],
  yellowBG: [43, 49],
  blueBG: [44, 49],
  magentaBG: [45, 49],
  cyanBG: [46, 49],
  whiteBG: [47, 49],

};

Object.keys(codes).forEach(function(key) {
  var val = codes[key];
  var style = styles[key] = [];
  style.open = '\u001b[' + val[0] + 'm';
  style.close = '\u001b[' + val[1] + 'm';
});


/***/ }),

/***/ 2203:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

/***/ }),

/***/ 2465:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(7699);

/***/ }),

/***/ 2614:
/***/ ((module) => {

"use strict";


const BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];
const hasBlob = typeof Blob !== 'undefined';

if (hasBlob) BINARY_TYPES.push('blob');

module.exports = {
  BINARY_TYPES,
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  hasBlob,
  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
  kListener: Symbol('kListener'),
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  NOOP: () => {}
};


/***/ }),

/***/ 2708:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/*
The MIT License (MIT)

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/



var os = __webpack_require__(857);
var hasFlag = __webpack_require__(3990);

var env = process.env;

var forceColor = void 0;
if (hasFlag('no-color') || hasFlag('no-colors') || hasFlag('color=false')) {
  forceColor = false;
} else if (hasFlag('color') || hasFlag('colors') || hasFlag('color=true')
           || hasFlag('color=always')) {
  forceColor = true;
}
if ('FORCE_COLOR' in env) {
  forceColor = env.FORCE_COLOR.length === 0
    || parseInt(env.FORCE_COLOR, 10) !== 0;
}

function translateLevel(level) {
  if (level === 0) {
    return false;
  }

  return {
    level: level,
    hasBasic: true,
    has256: level >= 2,
    has16m: level >= 3,
  };
}

function supportsColor(stream) {
  if (forceColor === false) {
    return 0;
  }

  if (hasFlag('color=16m') || hasFlag('color=full')
      || hasFlag('color=truecolor')) {
    return 3;
  }

  if (hasFlag('color=256')) {
    return 2;
  }

  if (stream && !stream.isTTY && forceColor !== true) {
    return 0;
  }

  var min = forceColor ? 1 : 0;

  if (process.platform === 'win32') {
    // Node.js 7.5.0 is the first version of Node.js to include a patch to
    // libuv that enables 256 color output on Windows. Anything earlier and it
    // won't work. However, here we target Node.js 8 at minimum as it is an LTS
    // release, and Node.js 7 is not. Windows 10 build 10586 is the first
    // Windows release that supports 256 colors. Windows 10 build 14931 is the
    // first release that supports 16m/TrueColor.
    var osRelease = os.release().split('.');
    if (Number(process.versions.node.split('.')[0]) >= 8
        && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
      return Number(osRelease[2]) >= 14931 ? 3 : 2;
    }

    return 1;
  }

  if ('CI' in env) {
    if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI'].some(function(sign) {
      return sign in env;
    }) || env.CI_NAME === 'codeship') {
      return 1;
    }

    return min;
  }

  if ('TEAMCITY_VERSION' in env) {
    return (/^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0
    );
  }

  if ('TERM_PROGRAM' in env) {
    var version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

    switch (env.TERM_PROGRAM) {
      case 'iTerm.app':
        return version >= 3 ? 3 : 2;
      case 'Hyper':
        return 3;
      case 'Apple_Terminal':
        return 2;
      // No default
    }
  }

  if (/-256(color)?$/i.test(env.TERM)) {
    return 2;
  }

  if (/^screen|^xterm|^vt100|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
    return 1;
  }

  if ('COLORTERM' in env) {
    return 1;
  }

  if (env.TERM === 'dumb') {
    return min;
  }

  return min;
}

function getSupportLevel(stream) {
  var level = supportsColor(stream);
  return translateLevel(level);
}

module.exports = {
  supportsColor: getSupportLevel,
  stdout: getSupportLevel(process.stdout),
  stderr: getSupportLevel(process.stderr),
};


/***/ }),

/***/ 2971:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const zlib = __webpack_require__(3106);

const bufferUtil = __webpack_require__(3338);
const Limiter = __webpack_require__(4759);
const { kStatusCode } = __webpack_require__(2614);

const FastBuffer = Buffer[Symbol.species];
const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed if context takeover is disabled
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
  }

  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

    return this.params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }

    if (this._deflate) {
      const callback = this._deflate[kCallback];

      this._deflate.close();
      this._deflate = null;

      if (callback) {
        callback(
          new Error(
            'The deflate stream was closed while data was being processed'
          )
        );
      }
    }
  }

  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }

    return params;
  }

  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];

        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'client_max_window_bits') {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {(Buffer|String)} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) {
        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);
      }

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
}

module.exports = PerMessageDeflate;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError] = new RangeError('Max payload size exceeded');
  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError][kStatusCode] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;
  err[kStatusCode] = 1007;
  this[kCallback](err);
}


/***/ }),

/***/ 3024:
/***/ ((module) => {

"use strict";
module.exports = require("node:fs");

/***/ }),

/***/ 3106:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 3338:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { EMPTY_BUFFER } = __webpack_require__(2614);

const FastBuffer = Buffer[Symbol.species];

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }

  if (offset < totalLength) {
    return new FastBuffer(target.buffer, target.byteOffset, offset);
  }

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer(buf) {
  if (buf.length === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer(data) {
  toBuffer.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = new FastBuffer(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer.readOnly = false;
  }

  return buf;
}

module.exports = {
  concat,
  mask: _mask,
  toArrayBuffer,
  toBuffer,
  unmask: _unmask
};

/* istanbul ignore else  */
if (!process.env.WS_NO_BUFFER_UTIL) {
  try {
    const bufferUtil = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'bufferutil'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

    module.exports.mask = function (source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    };

    module.exports.unmask = function (buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}


/***/ }),

/***/ 3666:
/***/ ((__unused_webpack_module, exports) => {

/**
 * CommanderError class
 */
class CommanderError extends Error {
  /**
   * Constructs the CommanderError class
   * @param {number} exitCode suggested exit code which could be used with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   */
  constructor(exitCode, code, message) {
    super(message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code;
    this.exitCode = exitCode;
    this.nestedError = undefined;
  }
}

/**
 * InvalidArgumentError class
 */
class InvalidArgumentError extends CommanderError {
  /**
   * Constructs the InvalidArgumentError class
   * @param {string} [message] explanation of why argument is invalid
   */
  constructor(message) {
    super(1, 'commander.invalidArgument', message);
    // properly capture stack trace in Node.js
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

exports.CommanderError = CommanderError;
exports.InvalidArgumentError = InvalidArgumentError;


/***/ }),

/***/ 3693:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { humanReadableArgName } = __webpack_require__(9297);

/**
 * TypeScript import types for JSDoc, used by Visual Studio Code IntelliSense and `npm run typescript-checkJS`
 * https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#import-types
 * @typedef { import("./argument.js").Argument } Argument
 * @typedef { import("./command.js").Command } Command
 * @typedef { import("./option.js").Option } Option
 */

// Although this is a class, methods are static in style to allow override using subclass or just functions.
class Help {
  constructor() {
    this.helpWidth = undefined;
    this.minWidthToWrap = 40;
    this.sortSubcommands = false;
    this.sortOptions = false;
    this.showGlobalOptions = false;
  }

  /**
   * prepareContext is called by Commander after applying overrides from `Command.configureHelp()`
   * and just before calling `formatHelp()`.
   *
   * Commander just uses the helpWidth and the rest is provided for optional use by more complex subclasses.
   *
   * @param {{ error?: boolean, helpWidth?: number, outputHasColors?: boolean }} contextOptions
   */
  prepareContext(contextOptions) {
    this.helpWidth = this.helpWidth ?? contextOptions.helpWidth ?? 80;
  }

  /**
   * Get an array of the visible subcommands. Includes a placeholder for the implicit help command, if there is one.
   *
   * @param {Command} cmd
   * @returns {Command[]}
   */

  visibleCommands(cmd) {
    const visibleCommands = cmd.commands.filter((cmd) => !cmd._hidden);
    const helpCommand = cmd._getHelpCommand();
    if (helpCommand && !helpCommand._hidden) {
      visibleCommands.push(helpCommand);
    }
    if (this.sortSubcommands) {
      visibleCommands.sort((a, b) => {
        // @ts-ignore: because overloaded return type
        return a.name().localeCompare(b.name());
      });
    }
    return visibleCommands;
  }

  /**
   * Compare options for sort.
   *
   * @param {Option} a
   * @param {Option} b
   * @returns {number}
   */
  compareOptions(a, b) {
    const getSortKey = (option) => {
      // WYSIWYG for order displayed in help. Short used for comparison if present. No special handling for negated.
      return option.short
        ? option.short.replace(/^-/, '')
        : option.long.replace(/^--/, '');
    };
    return getSortKey(a).localeCompare(getSortKey(b));
  }

  /**
   * Get an array of the visible options. Includes a placeholder for the implicit help option, if there is one.
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleOptions(cmd) {
    const visibleOptions = cmd.options.filter((option) => !option.hidden);
    // Built-in help option.
    const helpOption = cmd._getHelpOption();
    if (helpOption && !helpOption.hidden) {
      // Automatically hide conflicting flags. Bit dubious but a historical behaviour that is convenient for single-command programs.
      const removeShort = helpOption.short && cmd._findOption(helpOption.short);
      const removeLong = helpOption.long && cmd._findOption(helpOption.long);
      if (!removeShort && !removeLong) {
        visibleOptions.push(helpOption); // no changes needed
      } else if (helpOption.long && !removeLong) {
        visibleOptions.push(
          cmd.createOption(helpOption.long, helpOption.description),
        );
      } else if (helpOption.short && !removeShort) {
        visibleOptions.push(
          cmd.createOption(helpOption.short, helpOption.description),
        );
      }
    }
    if (this.sortOptions) {
      visibleOptions.sort(this.compareOptions);
    }
    return visibleOptions;
  }

  /**
   * Get an array of the visible global options. (Not including help.)
   *
   * @param {Command} cmd
   * @returns {Option[]}
   */

  visibleGlobalOptions(cmd) {
    if (!this.showGlobalOptions) return [];

    const globalOptions = [];
    for (
      let ancestorCmd = cmd.parent;
      ancestorCmd;
      ancestorCmd = ancestorCmd.parent
    ) {
      const visibleOptions = ancestorCmd.options.filter(
        (option) => !option.hidden,
      );
      globalOptions.push(...visibleOptions);
    }
    if (this.sortOptions) {
      globalOptions.sort(this.compareOptions);
    }
    return globalOptions;
  }

  /**
   * Get an array of the arguments if any have a description.
   *
   * @param {Command} cmd
   * @returns {Argument[]}
   */

  visibleArguments(cmd) {
    // Side effect! Apply the legacy descriptions before the arguments are displayed.
    if (cmd._argsDescription) {
      cmd.registeredArguments.forEach((argument) => {
        argument.description =
          argument.description || cmd._argsDescription[argument.name()] || '';
      });
    }

    // If there are any arguments with a description then return all the arguments.
    if (cmd.registeredArguments.find((argument) => argument.description)) {
      return cmd.registeredArguments;
    }
    return [];
  }

  /**
   * Get the command term to show in the list of subcommands.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandTerm(cmd) {
    // Legacy. Ignores custom usage string, and nested commands.
    const args = cmd.registeredArguments
      .map((arg) => humanReadableArgName(arg))
      .join(' ');
    return (
      cmd._name +
      (cmd._aliases[0] ? '|' + cmd._aliases[0] : '') +
      (cmd.options.length ? ' [options]' : '') + // simplistic check for non-help option
      (args ? ' ' + args : '')
    );
  }

  /**
   * Get the option term to show in the list of options.
   *
   * @param {Option} option
   * @returns {string}
   */

  optionTerm(option) {
    return option.flags;
  }

  /**
   * Get the argument term to show in the list of arguments.
   *
   * @param {Argument} argument
   * @returns {string}
   */

  argumentTerm(argument) {
    return argument.name();
  }

  /**
   * Get the longest command term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestSubcommandTermLength(cmd, helper) {
    return helper.visibleCommands(cmd).reduce((max, command) => {
      return Math.max(
        max,
        this.displayWidth(
          helper.styleSubcommandTerm(helper.subcommandTerm(command)),
        ),
      );
    }, 0);
  }

  /**
   * Get the longest option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestOptionTermLength(cmd, helper) {
    return helper.visibleOptions(cmd).reduce((max, option) => {
      return Math.max(
        max,
        this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))),
      );
    }, 0);
  }

  /**
   * Get the longest global option term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestGlobalOptionTermLength(cmd, helper) {
    return helper.visibleGlobalOptions(cmd).reduce((max, option) => {
      return Math.max(
        max,
        this.displayWidth(helper.styleOptionTerm(helper.optionTerm(option))),
      );
    }, 0);
  }

  /**
   * Get the longest argument term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  longestArgumentTermLength(cmd, helper) {
    return helper.visibleArguments(cmd).reduce((max, argument) => {
      return Math.max(
        max,
        this.displayWidth(
          helper.styleArgumentTerm(helper.argumentTerm(argument)),
        ),
      );
    }, 0);
  }

  /**
   * Get the command usage to be displayed at the top of the built-in help.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandUsage(cmd) {
    // Usage
    let cmdName = cmd._name;
    if (cmd._aliases[0]) {
      cmdName = cmdName + '|' + cmd._aliases[0];
    }
    let ancestorCmdNames = '';
    for (
      let ancestorCmd = cmd.parent;
      ancestorCmd;
      ancestorCmd = ancestorCmd.parent
    ) {
      ancestorCmdNames = ancestorCmd.name() + ' ' + ancestorCmdNames;
    }
    return ancestorCmdNames + cmdName + ' ' + cmd.usage();
  }

  /**
   * Get the description for the command.
   *
   * @param {Command} cmd
   * @returns {string}
   */

  commandDescription(cmd) {
    // @ts-ignore: because overloaded return type
    return cmd.description();
  }

  /**
   * Get the subcommand summary to show in the list of subcommands.
   * (Fallback to description for backwards compatibility.)
   *
   * @param {Command} cmd
   * @returns {string}
   */

  subcommandDescription(cmd) {
    // @ts-ignore: because overloaded return type
    return cmd.summary() || cmd.description();
  }

  /**
   * Get the option description to show in the list of options.
   *
   * @param {Option} option
   * @return {string}
   */

  optionDescription(option) {
    const extraInfo = [];

    if (option.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${option.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`,
      );
    }
    if (option.defaultValue !== undefined) {
      // default for boolean and negated more for programmer than end user,
      // but show true/false for boolean option as may be for hand-rolled env or config processing.
      const showDefault =
        option.required ||
        option.optional ||
        (option.isBoolean() && typeof option.defaultValue === 'boolean');
      if (showDefault) {
        extraInfo.push(
          `default: ${option.defaultValueDescription || JSON.stringify(option.defaultValue)}`,
        );
      }
    }
    // preset for boolean and negated are more for programmer than end user
    if (option.presetArg !== undefined && option.optional) {
      extraInfo.push(`preset: ${JSON.stringify(option.presetArg)}`);
    }
    if (option.envVar !== undefined) {
      extraInfo.push(`env: ${option.envVar}`);
    }
    if (extraInfo.length > 0) {
      return `${option.description} (${extraInfo.join(', ')})`;
    }

    return option.description;
  }

  /**
   * Get the argument description to show in the list of arguments.
   *
   * @param {Argument} argument
   * @return {string}
   */

  argumentDescription(argument) {
    const extraInfo = [];
    if (argument.argChoices) {
      extraInfo.push(
        // use stringify to match the display of the default value
        `choices: ${argument.argChoices.map((choice) => JSON.stringify(choice)).join(', ')}`,
      );
    }
    if (argument.defaultValue !== undefined) {
      extraInfo.push(
        `default: ${argument.defaultValueDescription || JSON.stringify(argument.defaultValue)}`,
      );
    }
    if (extraInfo.length > 0) {
      const extraDescription = `(${extraInfo.join(', ')})`;
      if (argument.description) {
        return `${argument.description} ${extraDescription}`;
      }
      return extraDescription;
    }
    return argument.description;
  }

  /**
   * Generate the built-in help text.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {string}
   */

  formatHelp(cmd, helper) {
    const termWidth = helper.padWidth(cmd, helper);
    const helpWidth = helper.helpWidth ?? 80; // in case prepareContext() was not called

    function callFormatItem(term, description) {
      return helper.formatItem(term, termWidth, description, helper);
    }

    // Usage
    let output = [
      `${helper.styleTitle('Usage:')} ${helper.styleUsage(helper.commandUsage(cmd))}`,
      '',
    ];

    // Description
    const commandDescription = helper.commandDescription(cmd);
    if (commandDescription.length > 0) {
      output = output.concat([
        helper.boxWrap(
          helper.styleCommandDescription(commandDescription),
          helpWidth,
        ),
        '',
      ]);
    }

    // Arguments
    const argumentList = helper.visibleArguments(cmd).map((argument) => {
      return callFormatItem(
        helper.styleArgumentTerm(helper.argumentTerm(argument)),
        helper.styleArgumentDescription(helper.argumentDescription(argument)),
      );
    });
    if (argumentList.length > 0) {
      output = output.concat([
        helper.styleTitle('Arguments:'),
        ...argumentList,
        '',
      ]);
    }

    // Options
    const optionList = helper.visibleOptions(cmd).map((option) => {
      return callFormatItem(
        helper.styleOptionTerm(helper.optionTerm(option)),
        helper.styleOptionDescription(helper.optionDescription(option)),
      );
    });
    if (optionList.length > 0) {
      output = output.concat([
        helper.styleTitle('Options:'),
        ...optionList,
        '',
      ]);
    }

    if (helper.showGlobalOptions) {
      const globalOptionList = helper
        .visibleGlobalOptions(cmd)
        .map((option) => {
          return callFormatItem(
            helper.styleOptionTerm(helper.optionTerm(option)),
            helper.styleOptionDescription(helper.optionDescription(option)),
          );
        });
      if (globalOptionList.length > 0) {
        output = output.concat([
          helper.styleTitle('Global Options:'),
          ...globalOptionList,
          '',
        ]);
      }
    }

    // Commands
    const commandList = helper.visibleCommands(cmd).map((cmd) => {
      return callFormatItem(
        helper.styleSubcommandTerm(helper.subcommandTerm(cmd)),
        helper.styleSubcommandDescription(helper.subcommandDescription(cmd)),
      );
    });
    if (commandList.length > 0) {
      output = output.concat([
        helper.styleTitle('Commands:'),
        ...commandList,
        '',
      ]);
    }

    return output.join('\n');
  }

  /**
   * Return display width of string, ignoring ANSI escape sequences. Used in padding and wrapping calculations.
   *
   * @param {string} str
   * @returns {number}
   */
  displayWidth(str) {
    return stripColor(str).length;
  }

  /**
   * Style the title for displaying in the help. Called with 'Usage:', 'Options:', etc.
   *
   * @param {string} str
   * @returns {string}
   */
  styleTitle(str) {
    return str;
  }

  styleUsage(str) {
    // Usage has lots of parts the user might like to color separately! Assume default usage string which is formed like:
    //    command subcommand [options] [command] <foo> [bar]
    return str
      .split(' ')
      .map((word) => {
        if (word === '[options]') return this.styleOptionText(word);
        if (word === '[command]') return this.styleSubcommandText(word);
        if (word[0] === '[' || word[0] === '<')
          return this.styleArgumentText(word);
        return this.styleCommandText(word); // Restrict to initial words?
      })
      .join(' ');
  }
  styleCommandDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleOptionDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleSubcommandDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleArgumentDescription(str) {
    return this.styleDescriptionText(str);
  }
  styleDescriptionText(str) {
    return str;
  }
  styleOptionTerm(str) {
    return this.styleOptionText(str);
  }
  styleSubcommandTerm(str) {
    // This is very like usage with lots of parts! Assume default string which is formed like:
    //    subcommand [options] <foo> [bar]
    return str
      .split(' ')
      .map((word) => {
        if (word === '[options]') return this.styleOptionText(word);
        if (word[0] === '[' || word[0] === '<')
          return this.styleArgumentText(word);
        return this.styleSubcommandText(word); // Restrict to initial words?
      })
      .join(' ');
  }
  styleArgumentTerm(str) {
    return this.styleArgumentText(str);
  }
  styleOptionText(str) {
    return str;
  }
  styleArgumentText(str) {
    return str;
  }
  styleSubcommandText(str) {
    return str;
  }
  styleCommandText(str) {
    return str;
  }

  /**
   * Calculate the pad width from the maximum term length.
   *
   * @param {Command} cmd
   * @param {Help} helper
   * @returns {number}
   */

  padWidth(cmd, helper) {
    return Math.max(
      helper.longestOptionTermLength(cmd, helper),
      helper.longestGlobalOptionTermLength(cmd, helper),
      helper.longestSubcommandTermLength(cmd, helper),
      helper.longestArgumentTermLength(cmd, helper),
    );
  }

  /**
   * Detect manually wrapped and indented strings by checking for line break followed by whitespace.
   *
   * @param {string} str
   * @returns {boolean}
   */
  preformatted(str) {
    return /\n[^\S\r\n]/.test(str);
  }

  /**
   * Format the "item", which consists of a term and description. Pad the term and wrap the description, indenting the following lines.
   *
   * So "TTT", 5, "DDD DDDD DD DDD" might be formatted for this.helpWidth=17 like so:
   *   TTT  DDD DDDD
   *        DD DDD
   *
   * @param {string} term
   * @param {number} termWidth
   * @param {string} description
   * @param {Help} helper
   * @returns {string}
   */
  formatItem(term, termWidth, description, helper) {
    const itemIndent = 2;
    const itemIndentStr = ' '.repeat(itemIndent);
    if (!description) return itemIndentStr + term;

    // Pad the term out to a consistent width, so descriptions are aligned.
    const paddedTerm = term.padEnd(
      termWidth + term.length - helper.displayWidth(term),
    );

    // Format the description.
    const spacerWidth = 2; // between term and description
    const helpWidth = this.helpWidth ?? 80; // in case prepareContext() was not called
    const remainingWidth = helpWidth - termWidth - spacerWidth - itemIndent;
    let formattedDescription;
    if (
      remainingWidth < this.minWidthToWrap ||
      helper.preformatted(description)
    ) {
      formattedDescription = description;
    } else {
      const wrappedDescription = helper.boxWrap(description, remainingWidth);
      formattedDescription = wrappedDescription.replace(
        /\n/g,
        '\n' + ' '.repeat(termWidth + spacerWidth),
      );
    }

    // Construct and overall indent.
    return (
      itemIndentStr +
      paddedTerm +
      ' '.repeat(spacerWidth) +
      formattedDescription.replace(/\n/g, `\n${itemIndentStr}`)
    );
  }

  /**
   * Wrap a string at whitespace, preserving existing line breaks.
   * Wrapping is skipped if the width is less than `minWidthToWrap`.
   *
   * @param {string} str
   * @param {number} width
   * @returns {string}
   */
  boxWrap(str, width) {
    if (width < this.minWidthToWrap) return str;

    const rawLines = str.split(/\r\n|\n/);
    // split up text by whitespace
    const chunkPattern = /[\s]*[^\s]+/g;
    const wrappedLines = [];
    rawLines.forEach((line) => {
      const chunks = line.match(chunkPattern);
      if (chunks === null) {
        wrappedLines.push('');
        return;
      }

      let sumChunks = [chunks.shift()];
      let sumWidth = this.displayWidth(sumChunks[0]);
      chunks.forEach((chunk) => {
        const visibleWidth = this.displayWidth(chunk);
        // Accumulate chunks while they fit into width.
        if (sumWidth + visibleWidth <= width) {
          sumChunks.push(chunk);
          sumWidth += visibleWidth;
          return;
        }
        wrappedLines.push(sumChunks.join(''));

        const nextChunk = chunk.trimStart(); // trim space at line break
        sumChunks = [nextChunk];
        sumWidth = this.displayWidth(nextChunk);
      });
      wrappedLines.push(sumChunks.join(''));
    });

    return wrappedLines.join('\n');
  }
}

/**
 * Strip style ANSI escape sequences from the string. In particular, SGR (Select Graphic Rendition) codes.
 *
 * @param {string} str
 * @returns {string}
 * @package
 */

function stripColor(str) {
  // eslint-disable-next-line no-control-regex
  const sgrPattern = /\x1b\[\d*(;\d*)*m/g;
  return str.replace(sgrPattern, '');
}

exports.Help = Help;
exports.stripColor = stripColor;


/***/ }),

/***/ 3719:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^WebSocket$" }] */


const WebSocket = __webpack_require__(1060);
const { Duplex } = __webpack_require__(2203);

/**
 * Emits the `'close'` event on a stream.
 *
 * @param {Duplex} stream The stream.
 * @private
 */
function emitClose(stream) {
  stream.emit('close');
}

/**
 * The listener of the `'end'` event.
 *
 * @private
 */
function duplexOnEnd() {
  if (!this.destroyed && this._writableState.finished) {
    this.destroy();
  }
}

/**
 * The listener of the `'error'` event.
 *
 * @param {Error} err The error
 * @private
 */
function duplexOnError(err) {
  this.removeListener('error', duplexOnError);
  this.destroy();
  if (this.listenerCount('error') === 0) {
    // Do not suppress the throwing behavior.
    this.emit('error', err);
  }
}

/**
 * Wraps a `WebSocket` in a duplex stream.
 *
 * @param {WebSocket} ws The `WebSocket` to wrap
 * @param {Object} [options] The options for the `Duplex` constructor
 * @return {Duplex} The duplex stream
 * @public
 */
function createWebSocketStream(ws, options) {
  let terminateOnDestroy = true;

  const duplex = new Duplex({
    ...options,
    autoDestroy: false,
    emitClose: false,
    objectMode: false,
    writableObjectMode: false
  });

  ws.on('message', function message(msg, isBinary) {
    const data =
      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;

    if (!duplex.push(data)) ws.pause();
  });

  ws.once('error', function error(err) {
    if (duplex.destroyed) return;

    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.
    //
    // - If the `'error'` event is emitted before the `'open'` event, then
    //   `ws.terminate()` is a noop as no socket is assigned.
    // - Otherwise, the error is re-emitted by the listener of the `'error'`
    //   event of the `Receiver` object. The listener already closes the
    //   connection by calling `ws.close()`. This allows a close frame to be
    //   sent to the other peer. If `ws.terminate()` is called right after this,
    //   then the close frame might not be sent.
    terminateOnDestroy = false;
    duplex.destroy(err);
  });

  ws.once('close', function close() {
    if (duplex.destroyed) return;

    duplex.push(null);
  });

  duplex._destroy = function (err, callback) {
    if (ws.readyState === ws.CLOSED) {
      callback(err);
      process.nextTick(emitClose, duplex);
      return;
    }

    let called = false;

    ws.once('error', function error(err) {
      called = true;
      callback(err);
    });

    ws.once('close', function close() {
      if (!called) callback(err);
      process.nextTick(emitClose, duplex);
    });

    if (terminateOnDestroy) ws.terminate();
  };

  duplex._final = function (callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._final(callback);
      });
      return;
    }

    // If the value of the `_socket` property is `null` it means that `ws` is a
    // client websocket and the handshake failed. In fact, when this happens, a
    // socket is never assigned to the websocket. Wait for the `'error'` event
    // that will be emitted by the websocket.
    if (ws._socket === null) return;

    if (ws._socket._writableState.finished) {
      callback();
      if (duplex._readableState.endEmitted) duplex.destroy();
    } else {
      ws._socket.once('finish', function finish() {
        // `duplex` is not destroyed here because the `'end'` event will be
        // emitted on `duplex` after this `'finish'` event. The EOF signaling
        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.
        callback();
      });
      ws.close();
    }
  };

  duplex._read = function () {
    if (ws.isPaused) ws.resume();
  };

  duplex._write = function (chunk, encoding, callback) {
    if (ws.readyState === ws.CONNECTING) {
      ws.once('open', function open() {
        duplex._write(chunk, encoding, callback);
      });
      return;
    }

    ws.send(chunk, callback);
  };

  duplex.on('end', duplexOnEnd);
  duplex.on('error', duplexOnError);
  return duplex;
}

module.exports = createWebSocketStream;


/***/ }),

/***/ 3749:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const EventEmitter = (__webpack_require__(8474).EventEmitter);
const childProcess = __webpack_require__(1421);
const path = __webpack_require__(6760);
const fs = __webpack_require__(3024);
const process = __webpack_require__(1708);

const { Argument, humanReadableArgName } = __webpack_require__(9297);
const { CommanderError } = __webpack_require__(3666);
const { Help, stripColor } = __webpack_require__(3693);
const { Option, DualOptions } = __webpack_require__(5019);
const { suggestSimilar } = __webpack_require__(7369);

class Command extends EventEmitter {
  /**
   * Initialize a new `Command`.
   *
   * @param {string} [name]
   */

  constructor(name) {
    super();
    /** @type {Command[]} */
    this.commands = [];
    /** @type {Option[]} */
    this.options = [];
    this.parent = null;
    this._allowUnknownOption = false;
    this._allowExcessArguments = false;
    /** @type {Argument[]} */
    this.registeredArguments = [];
    this._args = this.registeredArguments; // deprecated old name
    /** @type {string[]} */
    this.args = []; // cli args with options removed
    this.rawArgs = [];
    this.processedArgs = []; // like .args but after custom processing and collecting variadic
    this._scriptPath = null;
    this._name = name || '';
    this._optionValues = {};
    this._optionValueSources = {}; // default, env, cli etc
    this._storeOptionsAsProperties = false;
    this._actionHandler = null;
    this._executableHandler = false;
    this._executableFile = null; // custom name for executable
    this._executableDir = null; // custom search directory for subcommands
    this._defaultCommandName = null;
    this._exitCallback = null;
    this._aliases = [];
    this._combineFlagAndOptionalValue = true;
    this._description = '';
    this._summary = '';
    this._argsDescription = undefined; // legacy
    this._enablePositionalOptions = false;
    this._passThroughOptions = false;
    this._lifeCycleHooks = {}; // a hash of arrays
    /** @type {(boolean | string)} */
    this._showHelpAfterError = false;
    this._showSuggestionAfterError = true;
    this._savedState = null; // used in save/restoreStateBeforeParse

    // see configureOutput() for docs
    this._outputConfiguration = {
      writeOut: (str) => process.stdout.write(str),
      writeErr: (str) => process.stderr.write(str),
      outputError: (str, write) => write(str),
      getOutHelpWidth: () =>
        process.stdout.isTTY ? process.stdout.columns : undefined,
      getErrHelpWidth: () =>
        process.stderr.isTTY ? process.stderr.columns : undefined,
      getOutHasColors: () =>
        useColor() ?? (process.stdout.isTTY && process.stdout.hasColors?.()),
      getErrHasColors: () =>
        useColor() ?? (process.stderr.isTTY && process.stderr.hasColors?.()),
      stripColor: (str) => stripColor(str),
    };

    this._hidden = false;
    /** @type {(Option | null | undefined)} */
    this._helpOption = undefined; // Lazy created on demand. May be null if help option is disabled.
    this._addImplicitHelpCommand = undefined; // undecided whether true or false yet, not inherited
    /** @type {Command} */
    this._helpCommand = undefined; // lazy initialised, inherited
    this._helpConfiguration = {};
  }

  /**
   * Copy settings that are useful to have in common across root command and subcommands.
   *
   * (Used internally when adding a command using `.command()` so subcommands inherit parent settings.)
   *
   * @param {Command} sourceCommand
   * @return {Command} `this` command for chaining
   */
  copyInheritedSettings(sourceCommand) {
    this._outputConfiguration = sourceCommand._outputConfiguration;
    this._helpOption = sourceCommand._helpOption;
    this._helpCommand = sourceCommand._helpCommand;
    this._helpConfiguration = sourceCommand._helpConfiguration;
    this._exitCallback = sourceCommand._exitCallback;
    this._storeOptionsAsProperties = sourceCommand._storeOptionsAsProperties;
    this._combineFlagAndOptionalValue =
      sourceCommand._combineFlagAndOptionalValue;
    this._allowExcessArguments = sourceCommand._allowExcessArguments;
    this._enablePositionalOptions = sourceCommand._enablePositionalOptions;
    this._showHelpAfterError = sourceCommand._showHelpAfterError;
    this._showSuggestionAfterError = sourceCommand._showSuggestionAfterError;

    return this;
  }

  /**
   * @returns {Command[]}
   * @private
   */

  _getCommandAndAncestors() {
    const result = [];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    for (let command = this; command; command = command.parent) {
      result.push(command);
    }
    return result;
  }

  /**
   * Define a command.
   *
   * There are two styles of command: pay attention to where to put the description.
   *
   * @example
   * // Command implemented using action handler (description is supplied separately to `.command`)
   * program
   *   .command('clone <source> [destination]')
   *   .description('clone a repository into a newly created directory')
   *   .action((source, destination) => {
   *     console.log('clone command called');
   *   });
   *
   * // Command implemented using separate executable file (description is second parameter to `.command`)
   * program
   *   .command('start <service>', 'start named service')
   *   .command('stop [service]', 'stop named service, or all if no name supplied');
   *
   * @param {string} nameAndArgs - command name and arguments, args are `<required>` or `[optional]` and last may also be `variadic...`
   * @param {(object | string)} [actionOptsOrExecDesc] - configuration options (for action), or description (for executable)
   * @param {object} [execOpts] - configuration options (for executable)
   * @return {Command} returns new command for action handler, or `this` for executable command
   */

  command(nameAndArgs, actionOptsOrExecDesc, execOpts) {
    let desc = actionOptsOrExecDesc;
    let opts = execOpts;
    if (typeof desc === 'object' && desc !== null) {
      opts = desc;
      desc = null;
    }
    opts = opts || {};
    const [, name, args] = nameAndArgs.match(/([^ ]+) *(.*)/);

    const cmd = this.createCommand(name);
    if (desc) {
      cmd.description(desc);
      cmd._executableHandler = true;
    }
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    cmd._hidden = !!(opts.noHelp || opts.hidden); // noHelp is deprecated old name for hidden
    cmd._executableFile = opts.executableFile || null; // Custom name for executable file, set missing to null to match constructor
    if (args) cmd.arguments(args);
    this._registerCommand(cmd);
    cmd.parent = this;
    cmd.copyInheritedSettings(this);

    if (desc) return this;
    return cmd;
  }

  /**
   * Factory routine to create a new unattached command.
   *
   * See .command() for creating an attached subcommand, which uses this routine to
   * create the command. You can override createCommand to customise subcommands.
   *
   * @param {string} [name]
   * @return {Command} new command
   */

  createCommand(name) {
    return new Command(name);
  }

  /**
   * You can customise the help with a subclass of Help by overriding createHelp,
   * or by overriding Help properties using configureHelp().
   *
   * @return {Help}
   */

  createHelp() {
    return Object.assign(new Help(), this.configureHelp());
  }

  /**
   * You can customise the help by overriding Help properties using configureHelp(),
   * or with a subclass of Help by overriding createHelp().
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */

  configureHelp(configuration) {
    if (configuration === undefined) return this._helpConfiguration;

    this._helpConfiguration = configuration;
    return this;
  }

  /**
   * The default output goes to stdout and stderr. You can customise this for special
   * applications. You can also customise the display of errors by overriding outputError.
   *
   * The configuration properties are all functions:
   *
   *     // change how output being written, defaults to stdout and stderr
   *     writeOut(str)
   *     writeErr(str)
   *     // change how output being written for errors, defaults to writeErr
   *     outputError(str, write) // used for displaying errors and not used for displaying help
   *     // specify width for wrapping help
   *     getOutHelpWidth()
   *     getErrHelpWidth()
   *     // color support, currently only used with Help
   *     getOutHasColors()
   *     getErrHasColors()
   *     stripColor() // used to remove ANSI escape codes if output does not have colors
   *
   * @param {object} [configuration] - configuration options
   * @return {(Command | object)} `this` command for chaining, or stored configuration
   */

  configureOutput(configuration) {
    if (configuration === undefined) return this._outputConfiguration;

    Object.assign(this._outputConfiguration, configuration);
    return this;
  }

  /**
   * Display the help or a custom message after an error occurs.
   *
   * @param {(boolean|string)} [displayHelp]
   * @return {Command} `this` command for chaining
   */
  showHelpAfterError(displayHelp = true) {
    if (typeof displayHelp !== 'string') displayHelp = !!displayHelp;
    this._showHelpAfterError = displayHelp;
    return this;
  }

  /**
   * Display suggestion of similar commands for unknown commands, or options for unknown options.
   *
   * @param {boolean} [displaySuggestion]
   * @return {Command} `this` command for chaining
   */
  showSuggestionAfterError(displaySuggestion = true) {
    this._showSuggestionAfterError = !!displaySuggestion;
    return this;
  }

  /**
   * Add a prepared subcommand.
   *
   * See .command() for creating an attached subcommand which inherits settings from its parent.
   *
   * @param {Command} cmd - new subcommand
   * @param {object} [opts] - configuration options
   * @return {Command} `this` command for chaining
   */

  addCommand(cmd, opts) {
    if (!cmd._name) {
      throw new Error(`Command passed to .addCommand() must have a name
- specify the name in Command constructor or using .name()`);
    }

    opts = opts || {};
    if (opts.isDefault) this._defaultCommandName = cmd._name;
    if (opts.noHelp || opts.hidden) cmd._hidden = true; // modifying passed command due to existing implementation

    this._registerCommand(cmd);
    cmd.parent = this;
    cmd._checkForBrokenPassThrough();

    return this;
  }

  /**
   * Factory routine to create a new unattached argument.
   *
   * See .argument() for creating an attached argument, which uses this routine to
   * create the argument. You can override createArgument to return a custom argument.
   *
   * @param {string} name
   * @param {string} [description]
   * @return {Argument} new argument
   */

  createArgument(name, description) {
    return new Argument(name, description);
  }

  /**
   * Define argument syntax for command.
   *
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @example
   * program.argument('<input-file>');
   * program.argument('[output-file]');
   *
   * @param {string} name
   * @param {string} [description]
   * @param {(Function|*)} [fn] - custom argument processing function
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */
  argument(name, description, fn, defaultValue) {
    const argument = this.createArgument(name, description);
    if (typeof fn === 'function') {
      argument.default(defaultValue).argParser(fn);
    } else {
      argument.default(fn);
    }
    this.addArgument(argument);
    return this;
  }

  /**
   * Define argument syntax for command, adding multiple at once (without descriptions).
   *
   * See also .argument().
   *
   * @example
   * program.arguments('<cmd> [env]');
   *
   * @param {string} names
   * @return {Command} `this` command for chaining
   */

  arguments(names) {
    names
      .trim()
      .split(/ +/)
      .forEach((detail) => {
        this.argument(detail);
      });
    return this;
  }

  /**
   * Define argument syntax for command, adding a prepared argument.
   *
   * @param {Argument} argument
   * @return {Command} `this` command for chaining
   */
  addArgument(argument) {
    const previousArgument = this.registeredArguments.slice(-1)[0];
    if (previousArgument && previousArgument.variadic) {
      throw new Error(
        `only the last argument can be variadic '${previousArgument.name()}'`,
      );
    }
    if (
      argument.required &&
      argument.defaultValue !== undefined &&
      argument.parseArg === undefined
    ) {
      throw new Error(
        `a default value for a required argument is never used: '${argument.name()}'`,
      );
    }
    this.registeredArguments.push(argument);
    return this;
  }

  /**
   * Customise or override default help command. By default a help command is automatically added if your command has subcommands.
   *
   * @example
   *    program.helpCommand('help [cmd]');
   *    program.helpCommand('help [cmd]', 'show help');
   *    program.helpCommand(false); // suppress default help command
   *    program.helpCommand(true); // add help command even if no subcommands
   *
   * @param {string|boolean} enableOrNameAndArgs - enable with custom name and/or arguments, or boolean to override whether added
   * @param {string} [description] - custom description
   * @return {Command} `this` command for chaining
   */

  helpCommand(enableOrNameAndArgs, description) {
    if (typeof enableOrNameAndArgs === 'boolean') {
      this._addImplicitHelpCommand = enableOrNameAndArgs;
      return this;
    }

    enableOrNameAndArgs = enableOrNameAndArgs ?? 'help [command]';
    const [, helpName, helpArgs] = enableOrNameAndArgs.match(/([^ ]+) *(.*)/);
    const helpDescription = description ?? 'display help for command';

    const helpCommand = this.createCommand(helpName);
    helpCommand.helpOption(false);
    if (helpArgs) helpCommand.arguments(helpArgs);
    if (helpDescription) helpCommand.description(helpDescription);

    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;

    return this;
  }

  /**
   * Add prepared custom help command.
   *
   * @param {(Command|string|boolean)} helpCommand - custom help command, or deprecated enableOrNameAndArgs as for `.helpCommand()`
   * @param {string} [deprecatedDescription] - deprecated custom description used with custom name only
   * @return {Command} `this` command for chaining
   */
  addHelpCommand(helpCommand, deprecatedDescription) {
    // If not passed an object, call through to helpCommand for backwards compatibility,
    // as addHelpCommand was originally used like helpCommand is now.
    if (typeof helpCommand !== 'object') {
      this.helpCommand(helpCommand, deprecatedDescription);
      return this;
    }

    this._addImplicitHelpCommand = true;
    this._helpCommand = helpCommand;
    return this;
  }

  /**
   * Lazy create help command.
   *
   * @return {(Command|null)}
   * @package
   */
  _getHelpCommand() {
    const hasImplicitHelpCommand =
      this._addImplicitHelpCommand ??
      (this.commands.length &&
        !this._actionHandler &&
        !this._findCommand('help'));

    if (hasImplicitHelpCommand) {
      if (this._helpCommand === undefined) {
        this.helpCommand(undefined, undefined); // use default name and description
      }
      return this._helpCommand;
    }
    return null;
  }

  /**
   * Add hook for life cycle event.
   *
   * @param {string} event
   * @param {Function} listener
   * @return {Command} `this` command for chaining
   */

  hook(event, listener) {
    const allowedValues = ['preSubcommand', 'preAction', 'postAction'];
    if (!allowedValues.includes(event)) {
      throw new Error(`Unexpected value for event passed to hook : '${event}'.
Expecting one of '${allowedValues.join("', '")}'`);
    }
    if (this._lifeCycleHooks[event]) {
      this._lifeCycleHooks[event].push(listener);
    } else {
      this._lifeCycleHooks[event] = [listener];
    }
    return this;
  }

  /**
   * Register callback to use as replacement for calling process.exit.
   *
   * @param {Function} [fn] optional callback which will be passed a CommanderError, defaults to throwing
   * @return {Command} `this` command for chaining
   */

  exitOverride(fn) {
    if (fn) {
      this._exitCallback = fn;
    } else {
      this._exitCallback = (err) => {
        if (err.code !== 'commander.executeSubCommandAsync') {
          throw err;
        } else {
          // Async callback from spawn events, not useful to throw.
        }
      };
    }
    return this;
  }

  /**
   * Call process.exit, and _exitCallback if defined.
   *
   * @param {number} exitCode exit code for using with process.exit
   * @param {string} code an id string representing the error
   * @param {string} message human-readable description of the error
   * @return never
   * @private
   */

  _exit(exitCode, code, message) {
    if (this._exitCallback) {
      this._exitCallback(new CommanderError(exitCode, code, message));
      // Expecting this line is not reached.
    }
    process.exit(exitCode);
  }

  /**
   * Register callback `fn` for the command.
   *
   * @example
   * program
   *   .command('serve')
   *   .description('start service')
   *   .action(function() {
   *      // do work here
   *   });
   *
   * @param {Function} fn
   * @return {Command} `this` command for chaining
   */

  action(fn) {
    const listener = (args) => {
      // The .action callback takes an extra parameter which is the command or options.
      const expectedArgsCount = this.registeredArguments.length;
      const actionArgs = args.slice(0, expectedArgsCount);
      if (this._storeOptionsAsProperties) {
        actionArgs[expectedArgsCount] = this; // backwards compatible "options"
      } else {
        actionArgs[expectedArgsCount] = this.opts();
      }
      actionArgs.push(this);

      return fn.apply(this, actionArgs);
    };
    this._actionHandler = listener;
    return this;
  }

  /**
   * Factory routine to create a new unattached option.
   *
   * See .option() for creating an attached option, which uses this routine to
   * create the option. You can override createOption to return a custom option.
   *
   * @param {string} flags
   * @param {string} [description]
   * @return {Option} new option
   */

  createOption(flags, description) {
    return new Option(flags, description);
  }

  /**
   * Wrap parseArgs to catch 'commander.invalidArgument'.
   *
   * @param {(Option | Argument)} target
   * @param {string} value
   * @param {*} previous
   * @param {string} invalidArgumentMessage
   * @private
   */

  _callParseArg(target, value, previous, invalidArgumentMessage) {
    try {
      return target.parseArg(value, previous);
    } catch (err) {
      if (err.code === 'commander.invalidArgument') {
        const message = `${invalidArgumentMessage} ${err.message}`;
        this.error(message, { exitCode: err.exitCode, code: err.code });
      }
      throw err;
    }
  }

  /**
   * Check for option flag conflicts.
   * Register option if no conflicts found, or throw on conflict.
   *
   * @param {Option} option
   * @private
   */

  _registerOption(option) {
    const matchingOption =
      (option.short && this._findOption(option.short)) ||
      (option.long && this._findOption(option.long));
    if (matchingOption) {
      const matchingFlag =
        option.long && this._findOption(option.long)
          ? option.long
          : option.short;
      throw new Error(`Cannot add option '${option.flags}'${this._name && ` to command '${this._name}'`} due to conflicting flag '${matchingFlag}'
-  already used by option '${matchingOption.flags}'`);
    }

    this.options.push(option);
  }

  /**
   * Check for command name and alias conflicts with existing commands.
   * Register command if no conflicts found, or throw on conflict.
   *
   * @param {Command} command
   * @private
   */

  _registerCommand(command) {
    const knownBy = (cmd) => {
      return [cmd.name()].concat(cmd.aliases());
    };

    const alreadyUsed = knownBy(command).find((name) =>
      this._findCommand(name),
    );
    if (alreadyUsed) {
      const existingCmd = knownBy(this._findCommand(alreadyUsed)).join('|');
      const newCmd = knownBy(command).join('|');
      throw new Error(
        `cannot add command '${newCmd}' as already have command '${existingCmd}'`,
      );
    }

    this.commands.push(command);
  }

  /**
   * Add an option.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addOption(option) {
    this._registerOption(option);

    const oname = option.name();
    const name = option.attributeName();

    // store default value
    if (option.negate) {
      // --no-foo is special and defaults foo to true, unless a --foo option is already defined
      const positiveLongFlag = option.long.replace(/^--no-/, '--');
      if (!this._findOption(positiveLongFlag)) {
        this.setOptionValueWithSource(
          name,
          option.defaultValue === undefined ? true : option.defaultValue,
          'default',
        );
      }
    } else if (option.defaultValue !== undefined) {
      this.setOptionValueWithSource(name, option.defaultValue, 'default');
    }

    // handler for cli and env supplied values
    const handleOptionValue = (val, invalidValueMessage, valueSource) => {
      // val is null for optional option used without an optional-argument.
      // val is undefined for boolean and negated option.
      if (val == null && option.presetArg !== undefined) {
        val = option.presetArg;
      }

      // custom processing
      const oldValue = this.getOptionValue(name);
      if (val !== null && option.parseArg) {
        val = this._callParseArg(option, val, oldValue, invalidValueMessage);
      } else if (val !== null && option.variadic) {
        val = option._concatValue(val, oldValue);
      }

      // Fill-in appropriate missing values. Long winded but easy to follow.
      if (val == null) {
        if (option.negate) {
          val = false;
        } else if (option.isBoolean() || option.optional) {
          val = true;
        } else {
          val = ''; // not normal, parseArg might have failed or be a mock function for testing
        }
      }
      this.setOptionValueWithSource(name, val, valueSource);
    };

    this.on('option:' + oname, (val) => {
      const invalidValueMessage = `error: option '${option.flags}' argument '${val}' is invalid.`;
      handleOptionValue(val, invalidValueMessage, 'cli');
    });

    if (option.envVar) {
      this.on('optionEnv:' + oname, (val) => {
        const invalidValueMessage = `error: option '${option.flags}' value '${val}' from env '${option.envVar}' is invalid.`;
        handleOptionValue(val, invalidValueMessage, 'env');
      });
    }

    return this;
  }

  /**
   * Internal implementation shared by .option() and .requiredOption()
   *
   * @return {Command} `this` command for chaining
   * @private
   */
  _optionEx(config, flags, description, fn, defaultValue) {
    if (typeof flags === 'object' && flags instanceof Option) {
      throw new Error(
        'To add an Option object use addOption() instead of option() or requiredOption()',
      );
    }
    const option = this.createOption(flags, description);
    option.makeOptionMandatory(!!config.mandatory);
    if (typeof fn === 'function') {
      option.default(defaultValue).argParser(fn);
    } else if (fn instanceof RegExp) {
      // deprecated
      const regex = fn;
      fn = (val, def) => {
        const m = regex.exec(val);
        return m ? m[0] : def;
      };
      option.default(defaultValue).argParser(fn);
    } else {
      option.default(fn);
    }

    return this.addOption(option);
  }

  /**
   * Define option with `flags`, `description`, and optional argument parsing function or `defaultValue` or both.
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space. A required
   * option-argument is indicated by `<>` and an optional option-argument by `[]`.
   *
   * See the README for more details, and see also addOption() and requiredOption().
   *
   * @example
   * program
   *     .option('-p, --pepper', 'add pepper')
   *     .option('--pt, --pizza-type <TYPE>', 'type of pizza') // required option-argument
   *     .option('-c, --cheese [CHEESE]', 'add extra cheese', 'mozzarella') // optional option-argument with default
   *     .option('-t, --tip <VALUE>', 'add tip to purchase cost', parseFloat) // custom parse function
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  option(flags, description, parseArg, defaultValue) {
    return this._optionEx({}, flags, description, parseArg, defaultValue);
  }

  /**
   * Add a required option which must have a value after parsing. This usually means
   * the option must be specified on the command line. (Otherwise the same as .option().)
   *
   * The `flags` string contains the short and/or long flags, separated by comma, a pipe or space.
   *
   * @param {string} flags
   * @param {string} [description]
   * @param {(Function|*)} [parseArg] - custom option processing function or default value
   * @param {*} [defaultValue]
   * @return {Command} `this` command for chaining
   */

  requiredOption(flags, description, parseArg, defaultValue) {
    return this._optionEx(
      { mandatory: true },
      flags,
      description,
      parseArg,
      defaultValue,
    );
  }

  /**
   * Alter parsing of short flags with optional values.
   *
   * @example
   * // for `.option('-f,--flag [value]'):
   * program.combineFlagAndOptionalValue(true);  // `-f80` is treated like `--flag=80`, this is the default behaviour
   * program.combineFlagAndOptionalValue(false) // `-fb` is treated like `-f -b`
   *
   * @param {boolean} [combine] - if `true` or omitted, an optional value can be specified directly after the flag.
   * @return {Command} `this` command for chaining
   */
  combineFlagAndOptionalValue(combine = true) {
    this._combineFlagAndOptionalValue = !!combine;
    return this;
  }

  /**
   * Allow unknown options on the command line.
   *
   * @param {boolean} [allowUnknown] - if `true` or omitted, no error will be thrown for unknown options.
   * @return {Command} `this` command for chaining
   */
  allowUnknownOption(allowUnknown = true) {
    this._allowUnknownOption = !!allowUnknown;
    return this;
  }

  /**
   * Allow excess command-arguments on the command line. Pass false to make excess arguments an error.
   *
   * @param {boolean} [allowExcess] - if `true` or omitted, no error will be thrown for excess arguments.
   * @return {Command} `this` command for chaining
   */
  allowExcessArguments(allowExcess = true) {
    this._allowExcessArguments = !!allowExcess;
    return this;
  }

  /**
   * Enable positional options. Positional means global options are specified before subcommands which lets
   * subcommands reuse the same option names, and also enables subcommands to turn on passThroughOptions.
   * The default behaviour is non-positional and global options may appear anywhere on the command line.
   *
   * @param {boolean} [positional]
   * @return {Command} `this` command for chaining
   */
  enablePositionalOptions(positional = true) {
    this._enablePositionalOptions = !!positional;
    return this;
  }

  /**
   * Pass through options that come after command-arguments rather than treat them as command-options,
   * so actual command-options come before command-arguments. Turning this on for a subcommand requires
   * positional options to have been enabled on the program (parent commands).
   * The default behaviour is non-positional and options may appear before or after command-arguments.
   *
   * @param {boolean} [passThrough] for unknown options.
   * @return {Command} `this` command for chaining
   */
  passThroughOptions(passThrough = true) {
    this._passThroughOptions = !!passThrough;
    this._checkForBrokenPassThrough();
    return this;
  }

  /**
   * @private
   */

  _checkForBrokenPassThrough() {
    if (
      this.parent &&
      this._passThroughOptions &&
      !this.parent._enablePositionalOptions
    ) {
      throw new Error(
        `passThroughOptions cannot be used for '${this._name}' without turning on enablePositionalOptions for parent command(s)`,
      );
    }
  }

  /**
   * Whether to store option values as properties on command object,
   * or store separately (specify false). In both cases the option values can be accessed using .opts().
   *
   * @param {boolean} [storeAsProperties=true]
   * @return {Command} `this` command for chaining
   */

  storeOptionsAsProperties(storeAsProperties = true) {
    if (this.options.length) {
      throw new Error('call .storeOptionsAsProperties() before adding options');
    }
    if (Object.keys(this._optionValues).length) {
      throw new Error(
        'call .storeOptionsAsProperties() before setting option values',
      );
    }
    this._storeOptionsAsProperties = !!storeAsProperties;
    return this;
  }

  /**
   * Retrieve option value.
   *
   * @param {string} key
   * @return {object} value
   */

  getOptionValue(key) {
    if (this._storeOptionsAsProperties) {
      return this[key];
    }
    return this._optionValues[key];
  }

  /**
   * Store option value.
   *
   * @param {string} key
   * @param {object} value
   * @return {Command} `this` command for chaining
   */

  setOptionValue(key, value) {
    return this.setOptionValueWithSource(key, value, undefined);
  }

  /**
   * Store option value and where the value came from.
   *
   * @param {string} key
   * @param {object} value
   * @param {string} source - expected values are default/config/env/cli/implied
   * @return {Command} `this` command for chaining
   */

  setOptionValueWithSource(key, value, source) {
    if (this._storeOptionsAsProperties) {
      this[key] = value;
    } else {
      this._optionValues[key] = value;
    }
    this._optionValueSources[key] = source;
    return this;
  }

  /**
   * Get source of option value.
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */

  getOptionValueSource(key) {
    return this._optionValueSources[key];
  }

  /**
   * Get source of option value. See also .optsWithGlobals().
   * Expected values are default | config | env | cli | implied
   *
   * @param {string} key
   * @return {string}
   */

  getOptionValueSourceWithGlobals(key) {
    // global overwrites local, like optsWithGlobals
    let source;
    this._getCommandAndAncestors().forEach((cmd) => {
      if (cmd.getOptionValueSource(key) !== undefined) {
        source = cmd.getOptionValueSource(key);
      }
    });
    return source;
  }

  /**
   * Get user arguments from implied or explicit arguments.
   * Side-effects: set _scriptPath if args included script. Used for default program name, and subcommand searches.
   *
   * @private
   */

  _prepareUserArgs(argv, parseOptions) {
    if (argv !== undefined && !Array.isArray(argv)) {
      throw new Error('first parameter to parse must be array or undefined');
    }
    parseOptions = parseOptions || {};

    // auto-detect argument conventions if nothing supplied
    if (argv === undefined && parseOptions.from === undefined) {
      if (process.versions?.electron) {
        parseOptions.from = 'electron';
      }
      // check node specific options for scenarios where user CLI args follow executable without scriptname
      const execArgv = process.execArgv ?? [];
      if (
        execArgv.includes('-e') ||
        execArgv.includes('--eval') ||
        execArgv.includes('-p') ||
        execArgv.includes('--print')
      ) {
        parseOptions.from = 'eval'; // internal usage, not documented
      }
    }

    // default to using process.argv
    if (argv === undefined) {
      argv = process.argv;
    }
    this.rawArgs = argv.slice();

    // extract the user args and scriptPath
    let userArgs;
    switch (parseOptions.from) {
      case undefined:
      case 'node':
        this._scriptPath = argv[1];
        userArgs = argv.slice(2);
        break;
      case 'electron':
        // @ts-ignore: because defaultApp is an unknown property
        if (process.defaultApp) {
          this._scriptPath = argv[1];
          userArgs = argv.slice(2);
        } else {
          userArgs = argv.slice(1);
        }
        break;
      case 'user':
        userArgs = argv.slice(0);
        break;
      case 'eval':
        userArgs = argv.slice(1);
        break;
      default:
        throw new Error(
          `unexpected parse option { from: '${parseOptions.from}' }`,
        );
    }

    // Find default name for program from arguments.
    if (!this._name && this._scriptPath)
      this.nameFromFilename(this._scriptPath);
    this._name = this._name || 'program';

    return userArgs;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Use parseAsync instead of parse if any of your action handlers are async.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * program.parse(); // parse process.argv and auto-detect electron and special node flags
   * program.parse(process.argv); // assume argv[0] is app and argv[1] is script
   * program.parse(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv] - optional, defaults to process.argv
   * @param {object} [parseOptions] - optionally specify style of options with from: node/user/electron
   * @param {string} [parseOptions.from] - where the args are from: 'node', 'user', 'electron'
   * @return {Command} `this` command for chaining
   */

  parse(argv, parseOptions) {
    this._prepareForParse();
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    this._parseCommand([], userArgs);

    return this;
  }

  /**
   * Parse `argv`, setting options and invoking commands when defined.
   *
   * Call with no parameters to parse `process.argv`. Detects Electron and special node options like `node --eval`. Easy mode!
   *
   * Or call with an array of strings to parse, and optionally where the user arguments start by specifying where the arguments are `from`:
   * - `'node'`: default, `argv[0]` is the application and `argv[1]` is the script being run, with user arguments after that
   * - `'electron'`: `argv[0]` is the application and `argv[1]` varies depending on whether the electron application is packaged
   * - `'user'`: just user arguments
   *
   * @example
   * await program.parseAsync(); // parse process.argv and auto-detect electron and special node flags
   * await program.parseAsync(process.argv); // assume argv[0] is app and argv[1] is script
   * await program.parseAsync(my-args, { from: 'user' }); // just user supplied arguments, nothing special about argv[0]
   *
   * @param {string[]} [argv]
   * @param {object} [parseOptions]
   * @param {string} parseOptions.from - where the args are from: 'node', 'user', 'electron'
   * @return {Promise}
   */

  async parseAsync(argv, parseOptions) {
    this._prepareForParse();
    const userArgs = this._prepareUserArgs(argv, parseOptions);
    await this._parseCommand([], userArgs);

    return this;
  }

  _prepareForParse() {
    if (this._savedState === null) {
      this.saveStateBeforeParse();
    } else {
      this.restoreStateBeforeParse();
    }
  }

  /**
   * Called the first time parse is called to save state and allow a restore before subsequent calls to parse.
   * Not usually called directly, but available for subclasses to save their custom state.
   *
   * This is called in a lazy way. Only commands used in parsing chain will have state saved.
   */
  saveStateBeforeParse() {
    this._savedState = {
      // name is stable if supplied by author, but may be unspecified for root command and deduced during parsing
      _name: this._name,
      // option values before parse have default values (including false for negated options)
      // shallow clones
      _optionValues: { ...this._optionValues },
      _optionValueSources: { ...this._optionValueSources },
    };
  }

  /**
   * Restore state before parse for calls after the first.
   * Not usually called directly, but available for subclasses to save their custom state.
   *
   * This is called in a lazy way. Only commands used in parsing chain will have state restored.
   */
  restoreStateBeforeParse() {
    if (this._storeOptionsAsProperties)
      throw new Error(`Can not call parse again when storeOptionsAsProperties is true.
- either make a new Command for each call to parse, or stop storing options as properties`);

    // clear state from _prepareUserArgs
    this._name = this._savedState._name;
    this._scriptPath = null;
    this.rawArgs = [];
    // clear state from setOptionValueWithSource
    this._optionValues = { ...this._savedState._optionValues };
    this._optionValueSources = { ...this._savedState._optionValueSources };
    // clear state from _parseCommand
    this.args = [];
    // clear state from _processArguments
    this.processedArgs = [];
  }

  /**
   * Throw if expected executable is missing. Add lots of help for author.
   *
   * @param {string} executableFile
   * @param {string} executableDir
   * @param {string} subcommandName
   */
  _checkForMissingExecutable(executableFile, executableDir, subcommandName) {
    if (fs.existsSync(executableFile)) return;

    const executableDirMessage = executableDir
      ? `searched for local subcommand relative to directory '${executableDir}'`
      : 'no directory for search for local subcommand, use .executableDir() to supply a custom directory';
    const executableMissing = `'${executableFile}' does not exist
 - if '${subcommandName}' is not meant to be an executable command, remove description parameter from '.command()' and use '.description()' instead
 - if the default executable name is not suitable, use the executableFile option to supply a custom name or path
 - ${executableDirMessage}`;
    throw new Error(executableMissing);
  }

  /**
   * Execute a sub-command executable.
   *
   * @private
   */

  _executeSubCommand(subcommand, args) {
    args = args.slice();
    let launchWithNode = false; // Use node for source targets so do not need to get permissions correct, and on Windows.
    const sourceExt = ['.js', '.ts', '.tsx', '.mjs', '.cjs'];

    function findFile(baseDir, baseName) {
      // Look for specified file
      const localBin = path.resolve(baseDir, baseName);
      if (fs.existsSync(localBin)) return localBin;

      // Stop looking if candidate already has an expected extension.
      if (sourceExt.includes(path.extname(baseName))) return undefined;

      // Try all the extensions.
      const foundExt = sourceExt.find((ext) =>
        fs.existsSync(`${localBin}${ext}`),
      );
      if (foundExt) return `${localBin}${foundExt}`;

      return undefined;
    }

    // Not checking for help first. Unlikely to have mandatory and executable, and can't robustly test for help flags in external command.
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // executableFile and executableDir might be full path, or just a name
    let executableFile =
      subcommand._executableFile || `${this._name}-${subcommand._name}`;
    let executableDir = this._executableDir || '';
    if (this._scriptPath) {
      let resolvedScriptPath; // resolve possible symlink for installed npm binary
      try {
        resolvedScriptPath = fs.realpathSync(this._scriptPath);
      } catch {
        resolvedScriptPath = this._scriptPath;
      }
      executableDir = path.resolve(
        path.dirname(resolvedScriptPath),
        executableDir,
      );
    }

    // Look for a local file in preference to a command in PATH.
    if (executableDir) {
      let localFile = findFile(executableDir, executableFile);

      // Legacy search using prefix of script name instead of command name
      if (!localFile && !subcommand._executableFile && this._scriptPath) {
        const legacyName = path.basename(
          this._scriptPath,
          path.extname(this._scriptPath),
        );
        if (legacyName !== this._name) {
          localFile = findFile(
            executableDir,
            `${legacyName}-${subcommand._name}`,
          );
        }
      }
      executableFile = localFile || executableFile;
    }

    launchWithNode = sourceExt.includes(path.extname(executableFile));

    let proc;
    if (process.platform !== 'win32') {
      if (launchWithNode) {
        args.unshift(executableFile);
        // add executable arguments to spawn
        args = incrementNodeInspectorPort(process.execArgv).concat(args);

        proc = childProcess.spawn(process.argv[0], args, { stdio: 'inherit' });
      } else {
        proc = childProcess.spawn(executableFile, args, { stdio: 'inherit' });
      }
    } else {
      this._checkForMissingExecutable(
        executableFile,
        executableDir,
        subcommand._name,
      );
      args.unshift(executableFile);
      // add executable arguments to spawn
      args = incrementNodeInspectorPort(process.execArgv).concat(args);
      proc = childProcess.spawn(process.execPath, args, { stdio: 'inherit' });
    }

    if (!proc.killed) {
      // testing mainly to avoid leak warnings during unit tests with mocked spawn
      const signals = ['SIGUSR1', 'SIGUSR2', 'SIGTERM', 'SIGINT', 'SIGHUP'];
      signals.forEach((signal) => {
        process.on(signal, () => {
          if (proc.killed === false && proc.exitCode === null) {
            // @ts-ignore because signals not typed to known strings
            proc.kill(signal);
          }
        });
      });
    }

    // By default terminate process when spawned process terminates.
    const exitCallback = this._exitCallback;
    proc.on('close', (code) => {
      code = code ?? 1; // code is null if spawned process terminated due to a signal
      if (!exitCallback) {
        process.exit(code);
      } else {
        exitCallback(
          new CommanderError(
            code,
            'commander.executeSubCommandAsync',
            '(close)',
          ),
        );
      }
    });
    proc.on('error', (err) => {
      // @ts-ignore: because err.code is an unknown property
      if (err.code === 'ENOENT') {
        this._checkForMissingExecutable(
          executableFile,
          executableDir,
          subcommand._name,
        );
        // @ts-ignore: because err.code is an unknown property
      } else if (err.code === 'EACCES') {
        throw new Error(`'${executableFile}' not executable`);
      }
      if (!exitCallback) {
        process.exit(1);
      } else {
        const wrappedError = new CommanderError(
          1,
          'commander.executeSubCommandAsync',
          '(error)',
        );
        wrappedError.nestedError = err;
        exitCallback(wrappedError);
      }
    });

    // Store the reference to the child process
    this.runningCommand = proc;
  }

  /**
   * @private
   */

  _dispatchSubcommand(commandName, operands, unknown) {
    const subCommand = this._findCommand(commandName);
    if (!subCommand) this.help({ error: true });

    subCommand._prepareForParse();
    let promiseChain;
    promiseChain = this._chainOrCallSubCommandHook(
      promiseChain,
      subCommand,
      'preSubcommand',
    );
    promiseChain = this._chainOrCall(promiseChain, () => {
      if (subCommand._executableHandler) {
        this._executeSubCommand(subCommand, operands.concat(unknown));
      } else {
        return subCommand._parseCommand(operands, unknown);
      }
    });
    return promiseChain;
  }

  /**
   * Invoke help directly if possible, or dispatch if necessary.
   * e.g. help foo
   *
   * @private
   */

  _dispatchHelpCommand(subcommandName) {
    if (!subcommandName) {
      this.help();
    }
    const subCommand = this._findCommand(subcommandName);
    if (subCommand && !subCommand._executableHandler) {
      subCommand.help();
    }

    // Fallback to parsing the help flag to invoke the help.
    return this._dispatchSubcommand(
      subcommandName,
      [],
      [this._getHelpOption()?.long ?? this._getHelpOption()?.short ?? '--help'],
    );
  }

  /**
   * Check this.args against expected this.registeredArguments.
   *
   * @private
   */

  _checkNumberOfArguments() {
    // too few
    this.registeredArguments.forEach((arg, i) => {
      if (arg.required && this.args[i] == null) {
        this.missingArgument(arg.name());
      }
    });
    // too many
    if (
      this.registeredArguments.length > 0 &&
      this.registeredArguments[this.registeredArguments.length - 1].variadic
    ) {
      return;
    }
    if (this.args.length > this.registeredArguments.length) {
      this._excessArguments(this.args);
    }
  }

  /**
   * Process this.args using this.registeredArguments and save as this.processedArgs!
   *
   * @private
   */

  _processArguments() {
    const myParseArg = (argument, value, previous) => {
      // Extra processing for nice error message on parsing failure.
      let parsedValue = value;
      if (value !== null && argument.parseArg) {
        const invalidValueMessage = `error: command-argument value '${value}' is invalid for argument '${argument.name()}'.`;
        parsedValue = this._callParseArg(
          argument,
          value,
          previous,
          invalidValueMessage,
        );
      }
      return parsedValue;
    };

    this._checkNumberOfArguments();

    const processedArgs = [];
    this.registeredArguments.forEach((declaredArg, index) => {
      let value = declaredArg.defaultValue;
      if (declaredArg.variadic) {
        // Collect together remaining arguments for passing together as an array.
        if (index < this.args.length) {
          value = this.args.slice(index);
          if (declaredArg.parseArg) {
            value = value.reduce((processed, v) => {
              return myParseArg(declaredArg, v, processed);
            }, declaredArg.defaultValue);
          }
        } else if (value === undefined) {
          value = [];
        }
      } else if (index < this.args.length) {
        value = this.args[index];
        if (declaredArg.parseArg) {
          value = myParseArg(declaredArg, value, declaredArg.defaultValue);
        }
      }
      processedArgs[index] = value;
    });
    this.processedArgs = processedArgs;
  }

  /**
   * Once we have a promise we chain, but call synchronously until then.
   *
   * @param {(Promise|undefined)} promise
   * @param {Function} fn
   * @return {(Promise|undefined)}
   * @private
   */

  _chainOrCall(promise, fn) {
    // thenable
    if (promise && promise.then && typeof promise.then === 'function') {
      // already have a promise, chain callback
      return promise.then(() => fn());
    }
    // callback might return a promise
    return fn();
  }

  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */

  _chainOrCallHooks(promise, event) {
    let result = promise;
    const hooks = [];
    this._getCommandAndAncestors()
      .reverse()
      .filter((cmd) => cmd._lifeCycleHooks[event] !== undefined)
      .forEach((hookedCommand) => {
        hookedCommand._lifeCycleHooks[event].forEach((callback) => {
          hooks.push({ hookedCommand, callback });
        });
      });
    if (event === 'postAction') {
      hooks.reverse();
    }

    hooks.forEach((hookDetail) => {
      result = this._chainOrCall(result, () => {
        return hookDetail.callback(hookDetail.hookedCommand, this);
      });
    });
    return result;
  }

  /**
   *
   * @param {(Promise|undefined)} promise
   * @param {Command} subCommand
   * @param {string} event
   * @return {(Promise|undefined)}
   * @private
   */

  _chainOrCallSubCommandHook(promise, subCommand, event) {
    let result = promise;
    if (this._lifeCycleHooks[event] !== undefined) {
      this._lifeCycleHooks[event].forEach((hook) => {
        result = this._chainOrCall(result, () => {
          return hook(this, subCommand);
        });
      });
    }
    return result;
  }

  /**
   * Process arguments in context of this command.
   * Returns action result, in case it is a promise.
   *
   * @private
   */

  _parseCommand(operands, unknown) {
    const parsed = this.parseOptions(unknown);
    this._parseOptionsEnv(); // after cli, so parseArg not called on both cli and env
    this._parseOptionsImplied();
    operands = operands.concat(parsed.operands);
    unknown = parsed.unknown;
    this.args = operands.concat(unknown);

    if (operands && this._findCommand(operands[0])) {
      return this._dispatchSubcommand(operands[0], operands.slice(1), unknown);
    }
    if (
      this._getHelpCommand() &&
      operands[0] === this._getHelpCommand().name()
    ) {
      return this._dispatchHelpCommand(operands[1]);
    }
    if (this._defaultCommandName) {
      this._outputHelpIfRequested(unknown); // Run the help for default command from parent rather than passing to default command
      return this._dispatchSubcommand(
        this._defaultCommandName,
        operands,
        unknown,
      );
    }
    if (
      this.commands.length &&
      this.args.length === 0 &&
      !this._actionHandler &&
      !this._defaultCommandName
    ) {
      // probably missing subcommand and no handler, user needs help (and exit)
      this.help({ error: true });
    }

    this._outputHelpIfRequested(parsed.unknown);
    this._checkForMissingMandatoryOptions();
    this._checkForConflictingOptions();

    // We do not always call this check to avoid masking a "better" error, like unknown command.
    const checkForUnknownOptions = () => {
      if (parsed.unknown.length > 0) {
        this.unknownOption(parsed.unknown[0]);
      }
    };

    const commandEvent = `command:${this.name()}`;
    if (this._actionHandler) {
      checkForUnknownOptions();
      this._processArguments();

      let promiseChain;
      promiseChain = this._chainOrCallHooks(promiseChain, 'preAction');
      promiseChain = this._chainOrCall(promiseChain, () =>
        this._actionHandler(this.processedArgs),
      );
      if (this.parent) {
        promiseChain = this._chainOrCall(promiseChain, () => {
          this.parent.emit(commandEvent, operands, unknown); // legacy
        });
      }
      promiseChain = this._chainOrCallHooks(promiseChain, 'postAction');
      return promiseChain;
    }
    if (this.parent && this.parent.listenerCount(commandEvent)) {
      checkForUnknownOptions();
      this._processArguments();
      this.parent.emit(commandEvent, operands, unknown); // legacy
    } else if (operands.length) {
      if (this._findCommand('*')) {
        // legacy default command
        return this._dispatchSubcommand('*', operands, unknown);
      }
      if (this.listenerCount('command:*')) {
        // skip option check, emit event for possible misspelling suggestion
        this.emit('command:*', operands, unknown);
      } else if (this.commands.length) {
        this.unknownCommand();
      } else {
        checkForUnknownOptions();
        this._processArguments();
      }
    } else if (this.commands.length) {
      checkForUnknownOptions();
      // This command has subcommands and nothing hooked up at this level, so display help (and exit).
      this.help({ error: true });
    } else {
      checkForUnknownOptions();
      this._processArguments();
      // fall through for caller to handle after calling .parse()
    }
  }

  /**
   * Find matching command.
   *
   * @private
   * @return {Command | undefined}
   */
  _findCommand(name) {
    if (!name) return undefined;
    return this.commands.find(
      (cmd) => cmd._name === name || cmd._aliases.includes(name),
    );
  }

  /**
   * Return an option matching `arg` if any.
   *
   * @param {string} arg
   * @return {Option}
   * @package
   */

  _findOption(arg) {
    return this.options.find((option) => option.is(arg));
  }

  /**
   * Display an error message if a mandatory option does not have a value.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */

  _checkForMissingMandatoryOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd.options.forEach((anOption) => {
        if (
          anOption.mandatory &&
          cmd.getOptionValue(anOption.attributeName()) === undefined
        ) {
          cmd.missingMandatoryOptionValue(anOption);
        }
      });
    });
  }

  /**
   * Display an error message if conflicting options are used together in this.
   *
   * @private
   */
  _checkForConflictingLocalOptions() {
    const definedNonDefaultOptions = this.options.filter((option) => {
      const optionKey = option.attributeName();
      if (this.getOptionValue(optionKey) === undefined) {
        return false;
      }
      return this.getOptionValueSource(optionKey) !== 'default';
    });

    const optionsWithConflicting = definedNonDefaultOptions.filter(
      (option) => option.conflictsWith.length > 0,
    );

    optionsWithConflicting.forEach((option) => {
      const conflictingAndDefined = definedNonDefaultOptions.find((defined) =>
        option.conflictsWith.includes(defined.attributeName()),
      );
      if (conflictingAndDefined) {
        this._conflictingOption(option, conflictingAndDefined);
      }
    });
  }

  /**
   * Display an error message if conflicting options are used together.
   * Called after checking for help flags in leaf subcommand.
   *
   * @private
   */
  _checkForConflictingOptions() {
    // Walk up hierarchy so can call in subcommand after checking for displaying help.
    this._getCommandAndAncestors().forEach((cmd) => {
      cmd._checkForConflictingLocalOptions();
    });
  }

  /**
   * Parse options from `argv` removing known options,
   * and return argv split into operands and unknown arguments.
   *
   * Side effects: modifies command by storing options. Does not reset state if called again.
   *
   * Examples:
   *
   *     argv => operands, unknown
   *     --known kkk op => [op], []
   *     op --known kkk => [op], []
   *     sub --unknown uuu op => [sub], [--unknown uuu op]
   *     sub -- --unknown uuu op => [sub --unknown uuu op], []
   *
   * @param {string[]} argv
   * @return {{operands: string[], unknown: string[]}}
   */

  parseOptions(argv) {
    const operands = []; // operands, not options or values
    const unknown = []; // first unknown option and remaining unknown args
    let dest = operands;
    const args = argv.slice();

    function maybeOption(arg) {
      return arg.length > 1 && arg[0] === '-';
    }

    // parse options
    let activeVariadicOption = null;
    while (args.length) {
      const arg = args.shift();

      // literal
      if (arg === '--') {
        if (dest === unknown) dest.push(arg);
        dest.push(...args);
        break;
      }

      if (activeVariadicOption && !maybeOption(arg)) {
        this.emit(`option:${activeVariadicOption.name()}`, arg);
        continue;
      }
      activeVariadicOption = null;

      if (maybeOption(arg)) {
        const option = this._findOption(arg);
        // recognised option, call listener to assign value with possible custom processing
        if (option) {
          if (option.required) {
            const value = args.shift();
            if (value === undefined) this.optionMissingArgument(option);
            this.emit(`option:${option.name()}`, value);
          } else if (option.optional) {
            let value = null;
            // historical behaviour is optional value is following arg unless an option
            if (args.length > 0 && !maybeOption(args[0])) {
              value = args.shift();
            }
            this.emit(`option:${option.name()}`, value);
          } else {
            // boolean flag
            this.emit(`option:${option.name()}`);
          }
          activeVariadicOption = option.variadic ? option : null;
          continue;
        }
      }

      // Look for combo options following single dash, eat first one if known.
      if (arg.length > 2 && arg[0] === '-' && arg[1] !== '-') {
        const option = this._findOption(`-${arg[1]}`);
        if (option) {
          if (
            option.required ||
            (option.optional && this._combineFlagAndOptionalValue)
          ) {
            // option with value following in same argument
            this.emit(`option:${option.name()}`, arg.slice(2));
          } else {
            // boolean option, emit and put back remainder of arg for further processing
            this.emit(`option:${option.name()}`);
            args.unshift(`-${arg.slice(2)}`);
          }
          continue;
        }
      }

      // Look for known long flag with value, like --foo=bar
      if (/^--[^=]+=/.test(arg)) {
        const index = arg.indexOf('=');
        const option = this._findOption(arg.slice(0, index));
        if (option && (option.required || option.optional)) {
          this.emit(`option:${option.name()}`, arg.slice(index + 1));
          continue;
        }
      }

      // Not a recognised option by this command.
      // Might be a command-argument, or subcommand option, or unknown option, or help command or option.

      // An unknown option means further arguments also classified as unknown so can be reprocessed by subcommands.
      if (maybeOption(arg)) {
        dest = unknown;
      }

      // If using positionalOptions, stop processing our options at subcommand.
      if (
        (this._enablePositionalOptions || this._passThroughOptions) &&
        operands.length === 0 &&
        unknown.length === 0
      ) {
        if (this._findCommand(arg)) {
          operands.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        } else if (
          this._getHelpCommand() &&
          arg === this._getHelpCommand().name()
        ) {
          operands.push(arg);
          if (args.length > 0) operands.push(...args);
          break;
        } else if (this._defaultCommandName) {
          unknown.push(arg);
          if (args.length > 0) unknown.push(...args);
          break;
        }
      }

      // If using passThroughOptions, stop processing options at first command-argument.
      if (this._passThroughOptions) {
        dest.push(arg);
        if (args.length > 0) dest.push(...args);
        break;
      }

      // add arg
      dest.push(arg);
    }

    return { operands, unknown };
  }

  /**
   * Return an object containing local option values as key-value pairs.
   *
   * @return {object}
   */
  opts() {
    if (this._storeOptionsAsProperties) {
      // Preserve original behaviour so backwards compatible when still using properties
      const result = {};
      const len = this.options.length;

      for (let i = 0; i < len; i++) {
        const key = this.options[i].attributeName();
        result[key] =
          key === this._versionOptionName ? this._version : this[key];
      }
      return result;
    }

    return this._optionValues;
  }

  /**
   * Return an object containing merged local and global option values as key-value pairs.
   *
   * @return {object}
   */
  optsWithGlobals() {
    // globals overwrite locals
    return this._getCommandAndAncestors().reduce(
      (combinedOptions, cmd) => Object.assign(combinedOptions, cmd.opts()),
      {},
    );
  }

  /**
   * Display error message and exit (or call exitOverride).
   *
   * @param {string} message
   * @param {object} [errorOptions]
   * @param {string} [errorOptions.code] - an id string representing the error
   * @param {number} [errorOptions.exitCode] - used with process.exit
   */
  error(message, errorOptions) {
    // output handling
    this._outputConfiguration.outputError(
      `${message}\n`,
      this._outputConfiguration.writeErr,
    );
    if (typeof this._showHelpAfterError === 'string') {
      this._outputConfiguration.writeErr(`${this._showHelpAfterError}\n`);
    } else if (this._showHelpAfterError) {
      this._outputConfiguration.writeErr('\n');
      this.outputHelp({ error: true });
    }

    // exit handling
    const config = errorOptions || {};
    const exitCode = config.exitCode || 1;
    const code = config.code || 'commander.error';
    this._exit(exitCode, code, message);
  }

  /**
   * Apply any option related environment variables, if option does
   * not have a value from cli or client code.
   *
   * @private
   */
  _parseOptionsEnv() {
    this.options.forEach((option) => {
      if (option.envVar && option.envVar in process.env) {
        const optionKey = option.attributeName();
        // Priority check. Do not overwrite cli or options from unknown source (client-code).
        if (
          this.getOptionValue(optionKey) === undefined ||
          ['default', 'config', 'env'].includes(
            this.getOptionValueSource(optionKey),
          )
        ) {
          if (option.required || option.optional) {
            // option can take a value
            // keep very simple, optional always takes value
            this.emit(`optionEnv:${option.name()}`, process.env[option.envVar]);
          } else {
            // boolean
            // keep very simple, only care that envVar defined and not the value
            this.emit(`optionEnv:${option.name()}`);
          }
        }
      }
    });
  }

  /**
   * Apply any implied option values, if option is undefined or default value.
   *
   * @private
   */
  _parseOptionsImplied() {
    const dualHelper = new DualOptions(this.options);
    const hasCustomOptionValue = (optionKey) => {
      return (
        this.getOptionValue(optionKey) !== undefined &&
        !['default', 'implied'].includes(this.getOptionValueSource(optionKey))
      );
    };
    this.options
      .filter(
        (option) =>
          option.implied !== undefined &&
          hasCustomOptionValue(option.attributeName()) &&
          dualHelper.valueFromOption(
            this.getOptionValue(option.attributeName()),
            option,
          ),
      )
      .forEach((option) => {
        Object.keys(option.implied)
          .filter((impliedKey) => !hasCustomOptionValue(impliedKey))
          .forEach((impliedKey) => {
            this.setOptionValueWithSource(
              impliedKey,
              option.implied[impliedKey],
              'implied',
            );
          });
      });
  }

  /**
   * Argument `name` is missing.
   *
   * @param {string} name
   * @private
   */

  missingArgument(name) {
    const message = `error: missing required argument '${name}'`;
    this.error(message, { code: 'commander.missingArgument' });
  }

  /**
   * `Option` is missing an argument.
   *
   * @param {Option} option
   * @private
   */

  optionMissingArgument(option) {
    const message = `error: option '${option.flags}' argument missing`;
    this.error(message, { code: 'commander.optionMissingArgument' });
  }

  /**
   * `Option` does not have a value, and is a mandatory option.
   *
   * @param {Option} option
   * @private
   */

  missingMandatoryOptionValue(option) {
    const message = `error: required option '${option.flags}' not specified`;
    this.error(message, { code: 'commander.missingMandatoryOptionValue' });
  }

  /**
   * `Option` conflicts with another option.
   *
   * @param {Option} option
   * @param {Option} conflictingOption
   * @private
   */
  _conflictingOption(option, conflictingOption) {
    // The calling code does not know whether a negated option is the source of the
    // value, so do some work to take an educated guess.
    const findBestOptionFromValue = (option) => {
      const optionKey = option.attributeName();
      const optionValue = this.getOptionValue(optionKey);
      const negativeOption = this.options.find(
        (target) => target.negate && optionKey === target.attributeName(),
      );
      const positiveOption = this.options.find(
        (target) => !target.negate && optionKey === target.attributeName(),
      );
      if (
        negativeOption &&
        ((negativeOption.presetArg === undefined && optionValue === false) ||
          (negativeOption.presetArg !== undefined &&
            optionValue === negativeOption.presetArg))
      ) {
        return negativeOption;
      }
      return positiveOption || option;
    };

    const getErrorMessage = (option) => {
      const bestOption = findBestOptionFromValue(option);
      const optionKey = bestOption.attributeName();
      const source = this.getOptionValueSource(optionKey);
      if (source === 'env') {
        return `environment variable '${bestOption.envVar}'`;
      }
      return `option '${bestOption.flags}'`;
    };

    const message = `error: ${getErrorMessage(option)} cannot be used with ${getErrorMessage(conflictingOption)}`;
    this.error(message, { code: 'commander.conflictingOption' });
  }

  /**
   * Unknown option `flag`.
   *
   * @param {string} flag
   * @private
   */

  unknownOption(flag) {
    if (this._allowUnknownOption) return;
    let suggestion = '';

    if (flag.startsWith('--') && this._showSuggestionAfterError) {
      // Looping to pick up the global options too
      let candidateFlags = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let command = this;
      do {
        const moreFlags = command
          .createHelp()
          .visibleOptions(command)
          .filter((option) => option.long)
          .map((option) => option.long);
        candidateFlags = candidateFlags.concat(moreFlags);
        command = command.parent;
      } while (command && !command._enablePositionalOptions);
      suggestion = suggestSimilar(flag, candidateFlags);
    }

    const message = `error: unknown option '${flag}'${suggestion}`;
    this.error(message, { code: 'commander.unknownOption' });
  }

  /**
   * Excess arguments, more than expected.
   *
   * @param {string[]} receivedArgs
   * @private
   */

  _excessArguments(receivedArgs) {
    if (this._allowExcessArguments) return;

    const expected = this.registeredArguments.length;
    const s = expected === 1 ? '' : 's';
    const forSubcommand = this.parent ? ` for '${this.name()}'` : '';
    const message = `error: too many arguments${forSubcommand}. Expected ${expected} argument${s} but got ${receivedArgs.length}.`;
    this.error(message, { code: 'commander.excessArguments' });
  }

  /**
   * Unknown command.
   *
   * @private
   */

  unknownCommand() {
    const unknownName = this.args[0];
    let suggestion = '';

    if (this._showSuggestionAfterError) {
      const candidateNames = [];
      this.createHelp()
        .visibleCommands(this)
        .forEach((command) => {
          candidateNames.push(command.name());
          // just visible alias
          if (command.alias()) candidateNames.push(command.alias());
        });
      suggestion = suggestSimilar(unknownName, candidateNames);
    }

    const message = `error: unknown command '${unknownName}'${suggestion}`;
    this.error(message, { code: 'commander.unknownCommand' });
  }

  /**
   * Get or set the program version.
   *
   * This method auto-registers the "-V, --version" option which will print the version number.
   *
   * You can optionally supply the flags and description to override the defaults.
   *
   * @param {string} [str]
   * @param {string} [flags]
   * @param {string} [description]
   * @return {(this | string | undefined)} `this` command for chaining, or version string if no arguments
   */

  version(str, flags, description) {
    if (str === undefined) return this._version;
    this._version = str;
    flags = flags || '-V, --version';
    description = description || 'output the version number';
    const versionOption = this.createOption(flags, description);
    this._versionOptionName = versionOption.attributeName();
    this._registerOption(versionOption);

    this.on('option:' + versionOption.name(), () => {
      this._outputConfiguration.writeOut(`${str}\n`);
      this._exit(0, 'commander.version', str);
    });
    return this;
  }

  /**
   * Set the description.
   *
   * @param {string} [str]
   * @param {object} [argsDescription]
   * @return {(string|Command)}
   */
  description(str, argsDescription) {
    if (str === undefined && argsDescription === undefined)
      return this._description;
    this._description = str;
    if (argsDescription) {
      this._argsDescription = argsDescription;
    }
    return this;
  }

  /**
   * Set the summary. Used when listed as subcommand of parent.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */
  summary(str) {
    if (str === undefined) return this._summary;
    this._summary = str;
    return this;
  }

  /**
   * Set an alias for the command.
   *
   * You may call more than once to add multiple aliases. Only the first alias is shown in the auto-generated help.
   *
   * @param {string} [alias]
   * @return {(string|Command)}
   */

  alias(alias) {
    if (alias === undefined) return this._aliases[0]; // just return first, for backwards compatibility

    /** @type {Command} */
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let command = this;
    if (
      this.commands.length !== 0 &&
      this.commands[this.commands.length - 1]._executableHandler
    ) {
      // assume adding alias for last added executable subcommand, rather than this
      command = this.commands[this.commands.length - 1];
    }

    if (alias === command._name)
      throw new Error("Command alias can't be the same as its name");
    const matchingCommand = this.parent?._findCommand(alias);
    if (matchingCommand) {
      // c.f. _registerCommand
      const existingCmd = [matchingCommand.name()]
        .concat(matchingCommand.aliases())
        .join('|');
      throw new Error(
        `cannot add alias '${alias}' to command '${this.name()}' as already have command '${existingCmd}'`,
      );
    }

    command._aliases.push(alias);
    return this;
  }

  /**
   * Set aliases for the command.
   *
   * Only the first alias is shown in the auto-generated help.
   *
   * @param {string[]} [aliases]
   * @return {(string[]|Command)}
   */

  aliases(aliases) {
    // Getter for the array of aliases is the main reason for having aliases() in addition to alias().
    if (aliases === undefined) return this._aliases;

    aliases.forEach((alias) => this.alias(alias));
    return this;
  }

  /**
   * Set / get the command usage `str`.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */

  usage(str) {
    if (str === undefined) {
      if (this._usage) return this._usage;

      const args = this.registeredArguments.map((arg) => {
        return humanReadableArgName(arg);
      });
      return []
        .concat(
          this.options.length || this._helpOption !== null ? '[options]' : [],
          this.commands.length ? '[command]' : [],
          this.registeredArguments.length ? args : [],
        )
        .join(' ');
    }

    this._usage = str;
    return this;
  }

  /**
   * Get or set the name of the command.
   *
   * @param {string} [str]
   * @return {(string|Command)}
   */

  name(str) {
    if (str === undefined) return this._name;
    this._name = str;
    return this;
  }

  /**
   * Set the name of the command from script filename, such as process.argv[1],
   * or require.main.filename, or __filename.
   *
   * (Used internally and public although not documented in README.)
   *
   * @example
   * program.nameFromFilename(require.main.filename);
   *
   * @param {string} filename
   * @return {Command}
   */

  nameFromFilename(filename) {
    this._name = path.basename(filename, path.extname(filename));

    return this;
  }

  /**
   * Get or set the directory for searching for executable subcommands of this command.
   *
   * @example
   * program.executableDir(__dirname);
   * // or
   * program.executableDir('subcommands');
   *
   * @param {string} [path]
   * @return {(string|null|Command)}
   */

  executableDir(path) {
    if (path === undefined) return this._executableDir;
    this._executableDir = path;
    return this;
  }

  /**
   * Return program help documentation.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to wrap for stderr instead of stdout
   * @return {string}
   */

  helpInformation(contextOptions) {
    const helper = this.createHelp();
    const context = this._getOutputContext(contextOptions);
    helper.prepareContext({
      error: context.error,
      helpWidth: context.helpWidth,
      outputHasColors: context.hasColors,
    });
    const text = helper.formatHelp(this, helper);
    if (context.hasColors) return text;
    return this._outputConfiguration.stripColor(text);
  }

  /**
   * @typedef HelpContext
   * @type {object}
   * @property {boolean} error
   * @property {number} helpWidth
   * @property {boolean} hasColors
   * @property {function} write - includes stripColor if needed
   *
   * @returns {HelpContext}
   * @private
   */

  _getOutputContext(contextOptions) {
    contextOptions = contextOptions || {};
    const error = !!contextOptions.error;
    let baseWrite;
    let hasColors;
    let helpWidth;
    if (error) {
      baseWrite = (str) => this._outputConfiguration.writeErr(str);
      hasColors = this._outputConfiguration.getErrHasColors();
      helpWidth = this._outputConfiguration.getErrHelpWidth();
    } else {
      baseWrite = (str) => this._outputConfiguration.writeOut(str);
      hasColors = this._outputConfiguration.getOutHasColors();
      helpWidth = this._outputConfiguration.getOutHelpWidth();
    }
    const write = (str) => {
      if (!hasColors) str = this._outputConfiguration.stripColor(str);
      return baseWrite(str);
    };
    return { error, write, hasColors, helpWidth };
  }

  /**
   * Output help information for this command.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean } | Function} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  outputHelp(contextOptions) {
    let deprecatedCallback;
    if (typeof contextOptions === 'function') {
      deprecatedCallback = contextOptions;
      contextOptions = undefined;
    }

    const outputContext = this._getOutputContext(contextOptions);
    /** @type {HelpTextEventContext} */
    const eventContext = {
      error: outputContext.error,
      write: outputContext.write,
      command: this,
    };

    this._getCommandAndAncestors()
      .reverse()
      .forEach((command) => command.emit('beforeAllHelp', eventContext));
    this.emit('beforeHelp', eventContext);

    let helpInformation = this.helpInformation({ error: outputContext.error });
    if (deprecatedCallback) {
      helpInformation = deprecatedCallback(helpInformation);
      if (
        typeof helpInformation !== 'string' &&
        !Buffer.isBuffer(helpInformation)
      ) {
        throw new Error('outputHelp callback must return a string or a Buffer');
      }
    }
    outputContext.write(helpInformation);

    if (this._getHelpOption()?.long) {
      this.emit(this._getHelpOption().long); // deprecated
    }
    this.emit('afterHelp', eventContext);
    this._getCommandAndAncestors().forEach((command) =>
      command.emit('afterAllHelp', eventContext),
    );
  }

  /**
   * You can pass in flags and a description to customise the built-in help option.
   * Pass in false to disable the built-in help option.
   *
   * @example
   * program.helpOption('-?, --help' 'show help'); // customise
   * program.helpOption(false); // disable
   *
   * @param {(string | boolean)} flags
   * @param {string} [description]
   * @return {Command} `this` command for chaining
   */

  helpOption(flags, description) {
    // Support disabling built-in help option.
    if (typeof flags === 'boolean') {
      // true is not an expected value. Do something sensible but no unit-test.
      // istanbul ignore if
      if (flags) {
        this._helpOption = this._helpOption ?? undefined; // preserve existing option
      } else {
        this._helpOption = null; // disable
      }
      return this;
    }

    // Customise flags and description.
    flags = flags ?? '-h, --help';
    description = description ?? 'display help for command';
    this._helpOption = this.createOption(flags, description);

    return this;
  }

  /**
   * Lazy create help option.
   * Returns null if has been disabled with .helpOption(false).
   *
   * @returns {(Option | null)} the help option
   * @package
   */
  _getHelpOption() {
    // Lazy create help option on demand.
    if (this._helpOption === undefined) {
      this.helpOption(undefined, undefined);
    }
    return this._helpOption;
  }

  /**
   * Supply your own option to use for the built-in help option.
   * This is an alternative to using helpOption() to customise the flags and description etc.
   *
   * @param {Option} option
   * @return {Command} `this` command for chaining
   */
  addHelpOption(option) {
    this._helpOption = option;
    return this;
  }

  /**
   * Output help information and exit.
   *
   * Outputs built-in help, and custom text added using `.addHelpText()`.
   *
   * @param {{ error: boolean }} [contextOptions] - pass {error:true} to write to stderr instead of stdout
   */

  help(contextOptions) {
    this.outputHelp(contextOptions);
    let exitCode = Number(process.exitCode ?? 0); // process.exitCode does allow a string or an integer, but we prefer just a number
    if (
      exitCode === 0 &&
      contextOptions &&
      typeof contextOptions !== 'function' &&
      contextOptions.error
    ) {
      exitCode = 1;
    }
    // message: do not have all displayed text available so only passing placeholder.
    this._exit(exitCode, 'commander.help', '(outputHelp)');
  }

  /**
   * // Do a little typing to coordinate emit and listener for the help text events.
   * @typedef HelpTextEventContext
   * @type {object}
   * @property {boolean} error
   * @property {Command} command
   * @property {function} write
   */

  /**
   * Add additional text to be displayed with the built-in help.
   *
   * Position is 'before' or 'after' to affect just this command,
   * and 'beforeAll' or 'afterAll' to affect this command and all its subcommands.
   *
   * @param {string} position - before or after built-in help
   * @param {(string | Function)} text - string to add, or a function returning a string
   * @return {Command} `this` command for chaining
   */

  addHelpText(position, text) {
    const allowedValues = ['beforeAll', 'before', 'after', 'afterAll'];
    if (!allowedValues.includes(position)) {
      throw new Error(`Unexpected value for position to addHelpText.
Expecting one of '${allowedValues.join("', '")}'`);
    }

    const helpEvent = `${position}Help`;
    this.on(helpEvent, (/** @type {HelpTextEventContext} */ context) => {
      let helpStr;
      if (typeof text === 'function') {
        helpStr = text({ error: context.error, command: context.command });
      } else {
        helpStr = text;
      }
      // Ignore falsy value when nothing to output.
      if (helpStr) {
        context.write(`${helpStr}\n`);
      }
    });
    return this;
  }

  /**
   * Output help information if help flags specified
   *
   * @param {Array} args - array of options to search for help flags
   * @private
   */

  _outputHelpIfRequested(args) {
    const helpOption = this._getHelpOption();
    const helpRequested = helpOption && args.find((arg) => helpOption.is(arg));
    if (helpRequested) {
      this.outputHelp();
      // (Do not have all displayed text available so only passing placeholder.)
      this._exit(0, 'commander.helpDisplayed', '(outputHelp)');
    }
  }
}

/**
 * Scan arguments and increment port number for inspect calls (to avoid conflicts when spawning new command).
 *
 * @param {string[]} args - array of arguments from node.execArgv
 * @returns {string[]}
 * @private
 */

function incrementNodeInspectorPort(args) {
  // Testing for these options:
  //  --inspect[=[host:]port]
  //  --inspect-brk[=[host:]port]
  //  --inspect-port=[host:]port
  return args.map((arg) => {
    if (!arg.startsWith('--inspect')) {
      return arg;
    }
    let debugOption;
    let debugHost = '127.0.0.1';
    let debugPort = '9229';
    let match;
    if ((match = arg.match(/^(--inspect(-brk)?)$/)) !== null) {
      // e.g. --inspect
      debugOption = match[1];
    } else if (
      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+)$/)) !== null
    ) {
      debugOption = match[1];
      if (/^\d+$/.test(match[3])) {
        // e.g. --inspect=1234
        debugPort = match[3];
      } else {
        // e.g. --inspect=localhost
        debugHost = match[3];
      }
    } else if (
      (match = arg.match(/^(--inspect(-brk|-port)?)=([^:]+):(\d+)$/)) !== null
    ) {
      // e.g. --inspect=localhost:1234
      debugOption = match[1];
      debugHost = match[3];
      debugPort = match[4];
    }

    if (debugOption && debugPort !== '0') {
      return `${debugOption}=${debugHost}:${parseInt(debugPort) + 1}`;
    }
    return arg;
  });
}

/**
 * @returns {boolean | undefined}
 * @package
 */
function useColor() {
  // Test for common conventions.
  // NB: the observed behaviour is in combination with how author adds color! For example:
  //   - we do not test NODE_DISABLE_COLORS, but util:styletext does
  //   - we do test NO_COLOR, but Chalk does not
  //
  // References:
  // https://no-color.org
  // https://bixense.com/clicolors/
  // https://github.com/nodejs/node/blob/0a00217a5f67ef4a22384cfc80eb6dd9a917fdc1/lib/internal/tty.js#L109
  // https://github.com/chalk/supports-color/blob/c214314a14bcb174b12b3014b2b0a8de375029ae/index.js#L33
  // (https://force-color.org recent web page from 2023, does not match major javascript implementations)

  if (
    process.env.NO_COLOR ||
    process.env.FORCE_COLOR === '0' ||
    process.env.FORCE_COLOR === 'false'
  )
    return false;
  if (process.env.FORCE_COLOR || process.env.CLICOLOR_FORCE !== undefined)
    return true;
  return undefined;
}

exports.Command = Command;
exports.useColor = useColor; // exporting for tests


/***/ }),

/***/ 3906:
/***/ ((module) => {

module['exports'] = function(colors) {
  var available = ['underline', 'inverse', 'grey', 'yellow', 'red', 'green',
    'blue', 'white', 'cyan', 'magenta', 'brightYellow', 'brightRed',
    'brightGreen', 'brightBlue', 'brightWhite', 'brightCyan', 'brightMagenta'];
  return function(letter, i, exploded) {
    return letter === ' ' ? letter :
      colors[
          available[Math.round(Math.random() * (available.length - 2))]
      ](letter);
  };
};


/***/ }),

/***/ 3990:
/***/ ((module) => {

"use strict";
/*
MIT License

Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
of the Software, and to permit persons to whom the Software is furnished to do
so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/



module.exports = function(flag, argv) {
  argv = argv || process.argv;

  var terminatorPos = argv.indexOf('--');
  var prefix = /^-{1,2}/.test(flag) ? '' : '--';
  var pos = argv.indexOf(prefix + flag);

  return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
};


/***/ }),

/***/ 4075:
/***/ ((module, exports, __webpack_require__) => {

"use strict";
var __WEBPACK_AMD_DEFINE_RESULT__;function _typeof(obj){"@babel/helpers - typeof";if(typeof Symbol==="function"&&typeof Symbol.iterator==="symbol"){_typeof=function _typeof(obj){return typeof obj}}else{_typeof=function _typeof(obj){return obj&&typeof Symbol==="function"&&obj.constructor===Symbol&&obj!==Symbol.prototype?"symbol":typeof obj}}return _typeof(obj)}(function(global){var _arguments=arguments;var dateFormat=function(){var token=/d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|W{1,2}|[LlopSZN]|"[^"]*"|'[^']*'/g;var timezone=/\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g;var timezoneClip=/[^-+\dA-Z]/g;return function(date,mask,utc,gmt){if(_arguments.length===1&&kindOf(date)==="string"&&!/\d/.test(date)){mask=date;date=undefined}date=date||date===0?date:new Date;if(!(date instanceof Date)){date=new Date(date)}if(isNaN(date)){throw TypeError("Invalid date")}mask=String(dateFormat.masks[mask]||mask||dateFormat.masks["default"]);var maskSlice=mask.slice(0,4);if(maskSlice==="UTC:"||maskSlice==="GMT:"){mask=mask.slice(4);utc=true;if(maskSlice==="GMT:"){gmt=true}}var _=function _(){return utc?"getUTC":"get"};var _d=function d(){return date[_()+"Date"]()};var D=function D(){return date[_()+"Day"]()};var _m=function m(){return date[_()+"Month"]()};var y=function y(){return date[_()+"FullYear"]()};var _H=function H(){return date[_()+"Hours"]()};var _M=function M(){return date[_()+"Minutes"]()};var _s=function s(){return date[_()+"Seconds"]()};var _L=function L(){return date[_()+"Milliseconds"]()};var _o=function o(){return utc?0:date.getTimezoneOffset()};var _W=function W(){return getWeek(date)};var _N=function N(){return getDayOfWeek(date)};var flags={d:function d(){return _d()},dd:function dd(){return pad(_d())},ddd:function ddd(){return dateFormat.i18n.dayNames[D()]},DDD:function DDD(){return getDayName({y:y(),m:_m(),d:_d(),_:_(),dayName:dateFormat.i18n.dayNames[D()],short:true})},dddd:function dddd(){return dateFormat.i18n.dayNames[D()+7]},DDDD:function DDDD(){return getDayName({y:y(),m:_m(),d:_d(),_:_(),dayName:dateFormat.i18n.dayNames[D()+7]})},m:function m(){return _m()+1},mm:function mm(){return pad(_m()+1)},mmm:function mmm(){return dateFormat.i18n.monthNames[_m()]},mmmm:function mmmm(){return dateFormat.i18n.monthNames[_m()+12]},yy:function yy(){return String(y()).slice(2)},yyyy:function yyyy(){return pad(y(),4)},h:function h(){return _H()%12||12},hh:function hh(){return pad(_H()%12||12)},H:function H(){return _H()},HH:function HH(){return pad(_H())},M:function M(){return _M()},MM:function MM(){return pad(_M())},s:function s(){return _s()},ss:function ss(){return pad(_s())},l:function l(){return pad(_L(),3)},L:function L(){return pad(Math.floor(_L()/10))},t:function t(){return _H()<12?dateFormat.i18n.timeNames[0]:dateFormat.i18n.timeNames[1]},tt:function tt(){return _H()<12?dateFormat.i18n.timeNames[2]:dateFormat.i18n.timeNames[3]},T:function T(){return _H()<12?dateFormat.i18n.timeNames[4]:dateFormat.i18n.timeNames[5]},TT:function TT(){return _H()<12?dateFormat.i18n.timeNames[6]:dateFormat.i18n.timeNames[7]},Z:function Z(){return gmt?"GMT":utc?"UTC":(String(date).match(timezone)||[""]).pop().replace(timezoneClip,"").replace(/GMT\+0000/g,"UTC")},o:function o(){return(_o()>0?"-":"+")+pad(Math.floor(Math.abs(_o())/60)*100+Math.abs(_o())%60,4)},p:function p(){return(_o()>0?"-":"+")+pad(Math.floor(Math.abs(_o())/60),2)+":"+pad(Math.floor(Math.abs(_o())%60),2)},S:function S(){return["th","st","nd","rd"][_d()%10>3?0:(_d()%100-_d()%10!=10)*_d()%10]},W:function W(){return _W()},WW:function WW(){return pad(_W())},N:function N(){return _N()}};return mask.replace(token,function(match){if(match in flags){return flags[match]()}return match.slice(1,match.length-1)})}}();dateFormat.masks={default:"ddd mmm dd yyyy HH:MM:ss",shortDate:"m/d/yy",paddedShortDate:"mm/dd/yyyy",mediumDate:"mmm d, yyyy",longDate:"mmmm d, yyyy",fullDate:"dddd, mmmm d, yyyy",shortTime:"h:MM TT",mediumTime:"h:MM:ss TT",longTime:"h:MM:ss TT Z",isoDate:"yyyy-mm-dd",isoTime:"HH:MM:ss",isoDateTime:"yyyy-mm-dd'T'HH:MM:sso",isoUtcDateTime:"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'",expiresHeaderFormat:"ddd, dd mmm yyyy HH:MM:ss Z"};dateFormat.i18n={dayNames:["Sun","Mon","Tue","Wed","Thu","Fri","Sat","Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],monthNames:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec","January","February","March","April","May","June","July","August","September","October","November","December"],timeNames:["a","p","am","pm","A","P","AM","PM"]};var pad=function pad(val,len){val=String(val);len=len||2;while(val.length<len){val="0"+val}return val};var getDayName=function getDayName(_ref){var y=_ref.y,m=_ref.m,d=_ref.d,_=_ref._,dayName=_ref.dayName,_ref$short=_ref["short"],_short=_ref$short===void 0?false:_ref$short;var today=new Date;var yesterday=new Date;yesterday.setDate(yesterday[_+"Date"]()-1);var tomorrow=new Date;tomorrow.setDate(tomorrow[_+"Date"]()+1);var today_d=function today_d(){return today[_+"Date"]()};var today_m=function today_m(){return today[_+"Month"]()};var today_y=function today_y(){return today[_+"FullYear"]()};var yesterday_d=function yesterday_d(){return yesterday[_+"Date"]()};var yesterday_m=function yesterday_m(){return yesterday[_+"Month"]()};var yesterday_y=function yesterday_y(){return yesterday[_+"FullYear"]()};var tomorrow_d=function tomorrow_d(){return tomorrow[_+"Date"]()};var tomorrow_m=function tomorrow_m(){return tomorrow[_+"Month"]()};var tomorrow_y=function tomorrow_y(){return tomorrow[_+"FullYear"]()};if(today_y()===y&&today_m()===m&&today_d()===d){return _short?"Tdy":"Today"}else if(yesterday_y()===y&&yesterday_m()===m&&yesterday_d()===d){return _short?"Ysd":"Yesterday"}else if(tomorrow_y()===y&&tomorrow_m()===m&&tomorrow_d()===d){return _short?"Tmw":"Tomorrow"}return dayName};var getWeek=function getWeek(date){var targetThursday=new Date(date.getFullYear(),date.getMonth(),date.getDate());targetThursday.setDate(targetThursday.getDate()-(targetThursday.getDay()+6)%7+3);var firstThursday=new Date(targetThursday.getFullYear(),0,4);firstThursday.setDate(firstThursday.getDate()-(firstThursday.getDay()+6)%7+3);var ds=targetThursday.getTimezoneOffset()-firstThursday.getTimezoneOffset();targetThursday.setHours(targetThursday.getHours()-ds);var weekDiff=(targetThursday-firstThursday)/(864e5*7);return 1+Math.floor(weekDiff)};var getDayOfWeek=function getDayOfWeek(date){var dow=date.getDay();if(dow===0){dow=7}return dow};var kindOf=function kindOf(val){if(val===null){return"null"}if(val===undefined){return"undefined"}if(_typeof(val)!=="object"){return _typeof(val)}if(Array.isArray(val)){return"array"}return{}.toString.call(val).slice(8,-1).toLowerCase()};if(true){!(__WEBPACK_AMD_DEFINE_RESULT__ = (function(){return dateFormat}).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))}else {}})(void 0);

/***/ }),

/***/ 4189:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*

The MIT License (MIT)

Original Library
  - Copyright (c) Marak Squires

Additional functionality
 - Copyright (c) Sindre Sorhus <sindresorhus@gmail.com> (sindresorhus.com)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*/

var colors = {};
module['exports'] = colors;

colors.themes = {};

var util = __webpack_require__(9023);
var ansiStyles = colors.styles = __webpack_require__(2139);
var defineProps = Object.defineProperties;
var newLineRegex = new RegExp(/[\r\n]+/g);

colors.supportsColor = (__webpack_require__(2708).supportsColor);

if (typeof colors.enabled === 'undefined') {
  colors.enabled = colors.supportsColor() !== false;
}

colors.enable = function() {
  colors.enabled = true;
};

colors.disable = function() {
  colors.enabled = false;
};

colors.stripColors = colors.strip = function(str) {
  return ('' + str).replace(/\x1B\[\d+m/g, '');
};

// eslint-disable-next-line no-unused-vars
var stylize = colors.stylize = function stylize(str, style) {
  if (!colors.enabled) {
    return str+'';
  }

  var styleMap = ansiStyles[style];

  // Stylize should work for non-ANSI styles, too
  if(!styleMap && style in colors){
    // Style maps like trap operate as functions on strings;
    // they don't have properties like open or close.
    return colors[style](str);
  }

  return styleMap.open + str + styleMap.close;
};

var matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g;
var escapeStringRegexp = function(str) {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe, '\\$&');
};

function build(_styles) {
  var builder = function builder() {
    return applyStyle.apply(builder, arguments);
  };
  builder._styles = _styles;
  // __proto__ is used because we must return a function, but there is
  // no way to create a function with a different prototype.
  builder.__proto__ = proto;
  return builder;
}

var styles = (function() {
  var ret = {};
  ansiStyles.grey = ansiStyles.gray;
  Object.keys(ansiStyles).forEach(function(key) {
    ansiStyles[key].closeRe =
      new RegExp(escapeStringRegexp(ansiStyles[key].close), 'g');
    ret[key] = {
      get: function() {
        return build(this._styles.concat(key));
      },
    };
  });
  return ret;
})();

var proto = defineProps(function colors() {}, styles);

function applyStyle() {
  var args = Array.prototype.slice.call(arguments);

  var str = args.map(function(arg) {
    // Use weak equality check so we can colorize null/undefined in safe mode
    if (arg != null && arg.constructor === String) {
      return arg;
    } else {
      return util.inspect(arg);
    }
  }).join(' ');

  if (!colors.enabled || !str) {
    return str;
  }

  var newLinesPresent = str.indexOf('\n') != -1;

  var nestedStyles = this._styles;

  var i = nestedStyles.length;
  while (i--) {
    var code = ansiStyles[nestedStyles[i]];
    str = code.open + str.replace(code.closeRe, code.open) + code.close;
    if (newLinesPresent) {
      str = str.replace(newLineRegex, function(match) {
        return code.close + match + code.open;
      });
    }
  }

  return str;
}

colors.setTheme = function(theme) {
  if (typeof theme === 'string') {
    console.log('colors.setTheme now only accepts an object, not a string.  ' +
      'If you are trying to set a theme from a file, it is now your (the ' +
      'caller\'s) responsibility to require the file.  The old syntax ' +
      'looked like colors.setTheme(__dirname + ' +
      '\'/../themes/generic-logging.js\'); The new syntax looks like '+
      'colors.setTheme(require(__dirname + ' +
      '\'/../themes/generic-logging.js\'));');
    return;
  }
  for (var style in theme) {
    (function(style) {
      colors[style] = function(str) {
        if (typeof theme[style] === 'object') {
          var out = str;
          for (var i in theme[style]) {
            out = colors[theme[style][i]](out);
          }
          return out;
        }
        return colors[theme[style]](str);
      };
    })(style);
  }
};

function init() {
  var ret = {};
  Object.keys(styles).forEach(function(name) {
    ret[name] = {
      get: function() {
        return build([name]);
      },
    };
  });
  return ret;
}

var sequencer = function sequencer(map, str) {
  var exploded = str.split('');
  exploded = exploded.map(map);
  return exploded.join('');
};

// custom formatter methods
colors.trap = __webpack_require__(5722);
colors.zalgo = __webpack_require__(5408);

// maps
colors.maps = {};
colors.maps.america = __webpack_require__(113)(colors);
colors.maps.zebra = __webpack_require__(889)(colors);
colors.maps.rainbow = __webpack_require__(6239)(colors);
colors.maps.random = __webpack_require__(3906)(colors);

for (var map in colors.maps) {
  (function(map) {
    colors[map] = function(str) {
      return sequencer(colors.maps[map], str);
    };
  })(map);
}

defineProps(colors, init());


/***/ }),

/***/ 4434:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 4669:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.severityValues = void 0;
exports.severityToColor = severityToColor;
exports.factory = factory;
const dateformat_1 = __importDefault(__webpack_require__(4075));
__webpack_require__(1409);
function cap(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
exports.severityValues = {
    debug: 1,
    info: 2,
    warning: 3,
    error: 4,
    special: 5,
};
function severityToColor(severity, text) {
    switch (severity) {
        case 'debug':
            return text.green;
        case 'info':
            return text.blue;
        case 'warning':
            return text.yellow;
        case 'error':
            return text.red;
        case 'special':
            return text.cyan.underline;
        default:
            console.log('Unknown severity ' + severity);
            return text.italic;
    }
}
function factory(config, logSystem, logComponent) {
    const logColors = typeof config?.logColors !== 'undefined' ? config?.logColors : true;
    const logLevelInt = exports.severityValues[config?.logLevel || 'debug'];
    const log = (severity, system, component, text, subcat) => {
        if (exports.severityValues[severity] < logLevelInt) {
            return;
        }
        let entryDesc = (0, dateformat_1.default)(new Date(), 'yyyy-mm-dd HH:MM:ss') + ' [' + system + ']\t';
        let logString = '';
        if (logColors) {
            entryDesc = severityToColor(severity, entryDesc);
            logString = entryDesc;
            if (component) {
                logString += ('[' + component + '] ').italic;
            }
            if (subcat) {
                // @ts-expect-error grey not type
                logString += ('(' + subcat + ') ').bold.grey;
            }
            if (!component) {
                logString += text;
            }
            else {
                logString += text.grey;
            }
        }
        else {
            logString = entryDesc;
            if (component) {
                logString += '[' + component + '] ';
            }
            if (subcat) {
                logString += '(' + subcat + ') ';
            }
            logString += text;
        }
        console.log(logString);
    };
    return Object.keys(exports.severityValues).reduce((acc, curr) => {
        const logLevel = curr;
        acc[logLevel] = (...args) => {
            if (!logSystem && args.length === 1) {
                return log(logLevel, cap(logLevel), logComponent, args[0]);
            }
            if (!logSystem && args.length === 2) {
                return log(logLevel, args[0], logComponent, args[1]);
            }
            if (logSystem && args.length === 1) {
                return log(logLevel, logSystem, logComponent, args[0]);
            }
            if (logSystem && args.length === 2) {
                return log(logLevel, logSystem, args[0], args[1]);
            }
            if (args.length === 3) {
                return log(logLevel, args[0], args[1], args[2]);
            }
            return log(logLevel, args[0], args[1], args[2], args[3]);
        };
        return acc;
    }, {});
}


/***/ }),

/***/ 4756:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 4759:
/***/ ((module) => {

"use strict";


const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
class Limiter {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;

    if (this.jobs.length) {
      const job = this.jobs.shift();

      this.pending++;
      job(this[kDone]);
    }
  }
}

module.exports = Limiter;


/***/ }),

/***/ 4912:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 561:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_131__) => {

var yespower_wasm = (() => {
    var _scriptName = typeof document != 'undefined' ? document.currentScript?.src : undefined;
    if (true) _scriptName = _scriptName || __filename;
    return (
        async function(moduleArg = {}) {
            var moduleRtn;

            var Module = moduleArg;
            var readyPromiseResolve, readyPromiseReject;
            var readyPromise = new Promise((resolve, reject) => {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            var ENVIRONMENT_IS_WEB = typeof window == "object";
            var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
            var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
            if (ENVIRONMENT_IS_NODE) {}
            var moduleOverrides = Object.assign({}, Module);
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = (status, toThrow) => {
                throw toThrow
            };
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }
            var readAsync, readBinary;
            if (ENVIRONMENT_IS_NODE) {
                var fs = __nested_webpack_require_131__(896);
                var nodePath = __nested_webpack_require_131__(928);
                scriptDirectory = __dirname + "/";
                readBinary = filename => {
                    filename = isFileURI(filename) ? new URL(filename) : filename;
                    var ret = fs.readFileSync(filename);
                    return ret
                };
                readAsync = async (filename, binary = true) => {
                    filename = isFileURI(filename) ? new URL(filename) : filename;
                    var ret = fs.readFileSync(filename, binary ? undefined : "utf8");
                    return ret
                };
                if (!Module["thisProgram"] && process.argv.length > 1) {
                    thisProgram = process.argv[1].replace(/\\/g, "/")
                }
                arguments_ = process.argv.slice(2);
                quit_ = (status, toThrow) => {
                    process.exitCode = status;
                    throw toThrow
                }
            } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (typeof document != "undefined" && document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptName) {
                    scriptDirectory = _scriptName
                }
                if (scriptDirectory.startsWith("blob:")) {
                    scriptDirectory = ""
                } else {
                    scriptDirectory = scriptDirectory.slice(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
                } {
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = url => {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = async url => {
                        if (isFileURI(url)) {
                            return new Promise((resolve, reject) => {
                                var xhr = new XMLHttpRequest;
                                xhr.open("GET", url, true);
                                xhr.responseType = "arraybuffer";
                                xhr.onload = () => {
                                    if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                        resolve(xhr.response);
                                        return
                                    }
                                    reject(xhr.status)
                                };
                                xhr.onerror = reject;
                                xhr.send(null)
                            })
                        }
                        var response = await fetch(url, {
                            credentials: "same-origin"
                        });
                        if (response.ok) {
                            return response.arrayBuffer()
                        }
                        throw new Error(response.status + " : " + response.url)
                    }
                }
            } else {}
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.error.bind(console);
            Object.assign(Module, moduleOverrides);
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            var wasmBinary = Module["wasmBinary"];
            var wasmMemory;
            var ABORT = false;
            var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAP64, HEAPU64, HEAPF64;
            var runtimeInitialized = false;
            var isFileURI = filename => filename.startsWith("file://");

            function updateMemoryViews() {
                var b = wasmMemory.buffer;
                Module["HEAP8"] = HEAP8 = new Int8Array(b);
                Module["HEAP16"] = HEAP16 = new Int16Array(b);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
                Module["HEAP32"] = HEAP32 = new Int32Array(b);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
                Module["HEAP64"] = HEAP64 = new BigInt64Array(b);
                Module["HEAPU64"] = HEAPU64 = new BigUint64Array(b)
            }

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(onPreRuns)
            }

            function initRuntime() {
                runtimeInitialized = true;
                wasmExports["e"]()
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(onPostRuns)
            }
            var runDependencies = 0;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                Module["monitorRunDependencies"]?.(runDependencies)
            }

            function removeRunDependency(id) {
                runDependencies--;
                Module["monitorRunDependencies"]?.(runDependencies);
                if (runDependencies == 0) {
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            function abort(what) {
                Module["onAbort"]?.(what);
                what = "Aborted(" + what + ")";
                err(what);
                ABORT = true;
                what += ". Build with -sASSERTIONS for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }
            var wasmBinaryFile;

            function findWasmBinary() {
                return locateFile("yespower_wasm.wasm")
            }

            function getBinarySync(file) {
                if (file == wasmBinaryFile && wasmBinary) {
                    return new Uint8Array(wasmBinary)
                }
                if (readBinary) {
                    return readBinary(file)
                }
                throw "both async and sync fetching of the wasm failed"
            }
            async function getWasmBinary(binaryFile) {
                if (!wasmBinary) {
                    try {
                        var response = await readAsync(binaryFile);
                        return new Uint8Array(response)
                    } catch {}
                }
                return getBinarySync(binaryFile)
            }
            async function instantiateArrayBuffer(binaryFile, imports) {
                try {
                    var binary = await getWasmBinary(binaryFile);
                    var instance = await WebAssembly.instantiate(binary, imports);
                    return instance
                } catch (reason) {
                    err(`failed to asynchronously prepare wasm: ${reason}`);
                    abort(reason)
                }
            }
            async function instantiateAsync(binary, binaryFile, imports) {
                if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE) {
                    try {
                        var response = fetch(binaryFile, {
                            credentials: "same-origin"
                        });
                        var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
                        return instantiationResult
                    } catch (reason) {
                        err(`wasm streaming compile failed: ${reason}`);
                        err("falling back to ArrayBuffer instantiation")
                    }
                }
                return instantiateArrayBuffer(binaryFile, imports)
            }

            function getWasmImports() {
                return {
                    a: wasmImports
                }
            }
            async function createWasm() {
                function receiveInstance(instance, module) {
                    wasmExports = instance.exports;
                    wasmMemory = wasmExports["d"];
                    updateMemoryViews();
                    removeRunDependency("wasm-instantiate");
                    return wasmExports
                }
                addRunDependency("wasm-instantiate");

                function receiveInstantiationResult(result) {
                    return receiveInstance(result["instance"])
                }
                var info = getWasmImports();
                if (Module["instantiateWasm"]) {
                    return new Promise((resolve, reject) => {
                        Module["instantiateWasm"](info, (mod, inst) => {
                            receiveInstance(mod, inst);
                            resolve(mod.exports)
                        })
                    })
                }
                wasmBinaryFile ??= findWasmBinary();
                try {
                    var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
                    var exports = receiveInstantiationResult(result);
                    return exports
                } catch (e) {
                    readyPromiseReject(e);
                    return Promise.reject(e)
                }
            }
            class ExitStatus {
                name = "ExitStatus";
                constructor(status) {
                    this.message = `Program terminated with exit(${status})`;
                    this.status = status
                }
            }
            var callRuntimeCallbacks = callbacks => {
                while (callbacks.length > 0) {
                    callbacks.shift()(Module)
                }
            };
            var onPostRuns = [];
            var addOnPostRun = cb => onPostRuns.unshift(cb);
            var onPreRuns = [];
            var addOnPreRun = cb => onPreRuns.unshift(cb);
            var noExitRuntime = Module["noExitRuntime"] || true;
            var stackRestore = val => __emscripten_stack_restore(val);
            var stackSave = () => _emscripten_stack_get_current();
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
            var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
                }
                var str = "";
                while (idx < endPtr) {
                    var u0 = heapOrArray[idx++];
                    if (!(u0 & 128)) {
                        str += String.fromCharCode(u0);
                        continue
                    }
                    var u1 = heapOrArray[idx++] & 63;
                    if ((u0 & 224) == 192) {
                        str += String.fromCharCode((u0 & 31) << 6 | u1);
                        continue
                    }
                    var u2 = heapOrArray[idx++] & 63;
                    if ((u0 & 240) == 224) {
                        u0 = (u0 & 15) << 12 | u1 << 6 | u2
                    } else {
                        u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
                    }
                    if (u0 < 65536) {
                        str += String.fromCharCode(u0)
                    } else {
                        var ch = u0 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    }
                }
                return str
            };
            var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
            var ___assert_fail = (condition, filename, line, func) => abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
            var INT53_MAX = 9007199254740992;
            var INT53_MIN = -9007199254740992;
            var bigintToI53Checked = num => num < INT53_MIN || num > INT53_MAX ? NaN : Number(num);

            function __munmap_js(addr, len, prot, flags, fd, offset) {
                offset = bigintToI53Checked(offset)
            }
            var abortOnCannotGrowMemory = requestedSize => {
                abort("OOM")
            };
            var _emscripten_resize_heap = requestedSize => {
                var oldSize = HEAPU8.length;
                requestedSize >>>= 0;
                abortOnCannotGrowMemory(requestedSize)
            };
            var getCFunc = ident => {
                var func = Module["_" + ident];
                return func
            };
            var writeArrayToMemory = (array, buffer) => {
                HEAP8.set(array, buffer)
            };
            var lengthBytesUTF8 = str => {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var c = str.charCodeAt(i);
                    if (c <= 127) {
                        len++
                    } else if (c <= 2047) {
                        len += 2
                    } else if (c >= 55296 && c <= 57343) {
                        len += 4;
                        ++i
                    } else {
                        len += 3
                    }
                }
                return len
            };
            var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) {
                        var u1 = str.charCodeAt(++i);
                        u = 65536 + ((u & 1023) << 10) | u1 & 1023
                    }
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            };
            var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
            var stackAlloc = sz => __emscripten_stack_alloc(sz);
            var stringToUTF8OnStack = str => {
                var size = lengthBytesUTF8(str) + 1;
                var ret = stackAlloc(size);
                stringToUTF8(str, ret, size);
                return ret
            };
            var ccall = (ident, returnType, argTypes, args, opts) => {
                var toC = {
                    string: str => {
                        var ret = 0;
                        if (str !== null && str !== undefined && str !== 0) {
                            ret = stringToUTF8OnStack(str)
                        }
                        return ret
                    },
                    array: arr => {
                        var ret = stackAlloc(arr.length);
                        writeArrayToMemory(arr, ret);
                        return ret
                    }
                };

                function convertReturnValue(ret) {
                    if (returnType === "string") {
                        return UTF8ToString(ret)
                    }
                    if (returnType === "boolean") return Boolean(ret);
                    return ret
                }
                var func = getCFunc(ident);
                var cArgs = [];
                var stack = 0;
                if (args) {
                    for (var i = 0; i < args.length; i++) {
                        var converter = toC[argTypes[i]];
                        if (converter) {
                            if (stack === 0) stack = stackSave();
                            cArgs[i] = converter(args[i])
                        } else {
                            cArgs[i] = args[i]
                        }
                    }
                }
                var ret = func(...cArgs);

                function onDone(ret) {
                    if (stack !== 0) stackRestore(stack);
                    return convertReturnValue(ret)
                }
                ret = onDone(ret);
                return ret
            };
            var cwrap = (ident, returnType, argTypes, opts) => {
                var numericArgs = !argTypes || argTypes.every(type => type === "number" || type === "boolean");
                var numericRet = returnType !== "string";
                if (numericRet && numericArgs && !opts) {
                    return getCFunc(ident)
                }
                return (...args) => ccall(ident, returnType, argTypes, args, opts)
            };
            var wasmImports = {
                c: ___assert_fail,
                b: __munmap_js,
                a: _emscripten_resize_heap
            };
            var wasmExports = await createWasm();
            var ___wasm_call_ctors = wasmExports["e"];
            var _yespower_wasm = Module["_yespower_wasm"] = wasmExports["f"];
            var _malloc = Module["_malloc"] = wasmExports["h"];
            var _free = Module["_free"] = wasmExports["i"];
            var __emscripten_stack_restore = wasmExports["j"];
            var __emscripten_stack_alloc = wasmExports["k"];
            var _emscripten_stack_get_current = wasmExports["l"];
            Module["ccall"] = ccall;
            Module["cwrap"] = cwrap;

            function run() {
                if (runDependencies > 0) {
                    dependenciesFulfilled = run;
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    dependenciesFulfilled = run;
                    return
                }

                function doRun() {
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    readyPromiseResolve(Module);
                    Module["onRuntimeInitialized"]?.();
                    postRun()
                }
                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(() => {
                        setTimeout(() => Module["setStatus"](""), 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();
            moduleRtn = readyPromise;


            return moduleRtn;
        }
    );
})();
if (true) {
    module.exports = yespower_wasm;
    // This default export looks redundant, but it allows TS to import this
    // commonjs style module.
    module.exports["default"] = yespower_wasm;
} else {}

/***/ }),

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(9896);

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(6928);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_24040__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_24040__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nested_webpack_require_24040__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nested_webpack_require_24040__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_24040__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_24040__.o(definition, key) && !__nested_webpack_require_24040__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nested_webpack_require_24040__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_24040__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __nested_webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__nested_webpack_require_24040__.r(__nested_webpack_exports__);

// EXPORTS
__nested_webpack_require_24040__.d(__nested_webpack_exports__, {
  Yespower: () => (/* binding */ Yespower),
  base64ToBytes: () => (/* reexport */ base64ToBytes),
  bytesToBase64: () => (/* reexport */ bytesToBase64),
  bytesToHex: () => (/* reexport */ bytesToHex),
  hexToBytes: () => (/* reexport */ hexToBytes)
});

;// ./src/bundled.ts

const bundled = "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gICA/gODIgynaiIDKQMAIBNC/////w+DIBNCIIh+fCAIIAxCIIinaiIGKQMAhSIMNwMAIAUgBikDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgEELwn4CAgP4DgyIOp2oiAykDACAQQv////8PgyAQQiCIfnwgCCAOQiCIp2oiBikDAIUiDjcDECAFIAYpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA9C8J+AgID+A4MiEKdqIgMpAwAgD0L/////D4MgD0IgiH58IAggEEIgiKdqIgYpAwCFIg83AyAgBSAGKQMIIAMpAwggC0L/////D4MgC0IgiH58hSIQNwMoIAUgBCANQvCfgICA/gODIhOnaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIBNCIIinaiIGKQMAhSINNwMwIAUgBikDCCADKQMIIBRC/////w+DIBRCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBikDAIUiDDcDACAFIAYpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgYpAwCFIg43AxAgBSAGKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIGKQMAhSIPNwMgIAUgBikDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBikDAIUiDTcDMCAFIAYpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgYpAwCFIgw3AwAgBSAGKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIGKQMAhSIONwMQIAUgBikDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBikDAIUiDzcDICAFIAYpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgYpAwCFIg03AzAgBSAGKQMIIAMpAwggE0L/////D4MgE0IgiH58hSITNwM4IAUgBCAMQvCfgICA/gODIgunaiIDKQMAIAxC/////w+DIAxCIIh+fCAIIAtCIIinaiIGKQMAhSIMNwMAIAUgBikDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBikDAIUiDjcDECAFIAYpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA9C8J+AgID+A4MiC6dqIgMpAwAgD0L/////D4MgD0IgiH58IAggC0IgiKdqIgYpAwCFIg83AyAgBSAGKQMIIAMpAwggEEL/////D4MgEEIgiH58hSIQNwMoIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIGKQMAhSINNwMwIAUgBikDCCADKQMIIBNC/////w+DIBNCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBikDAIUiDDcDACAFIAYpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgYpAwCFIg43AxAgBSAGKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIGKQMAhSIPNwMgIAUgBikDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBikDAIUiDTcDMCAFIAYpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgYpAwCFIgw3AwAgBSAGKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIGKQMAhSIONwMQIAUgBikDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBikDAIUiDzcDICAFIAYpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgYpAwCFIgs3AzAgBikDCCENIAMpAwghFCACIAdqIgMgCzcDMCADIBA3AyggAyAPNwMgIAMgETcDGCADIA43AxAgAyASNwMIIAMgDDcDACADIA0gFCATQv////8PgyATQiCIfnyFIhM3AzggACAHQcAAciIGaiIDKQM4IRQgAykDMCEVIAMpAyghFiADKQMgIRcgAykDGCEYIAMpAxAhDSADKQMIIRkgBSADKQMAIAEgBmoiAykDAIUgDIUiDDcDACAFIBkgAykDCIUgEoUiEjcDCCAFIA0gAykDEIUgDoUiDTcDECAFIBggAykDGIUgEYUiETcDGCAFIBcgAykDIIUgD4UiDjcDICAFIBYgAykDKIUgEIUiEDcDKCAFIBUgAykDMIUgC4UiDzcDMCAFIBQgAykDOIUgE4UiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBykDAIUiDDcDACAFIAcpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgcpAwCFIg03AxAgBSAHKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIHKQMAhSIONwMgIAUgBykDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBykDAIUiDzcDMCAFIAcpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgcpAwCFIgw3AwAgBSAHKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIHKQMAhSINNwMQIAUgBykDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBykDAIUiDjcDICAFIAcpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA9C8J+AgID+A4MiC6dqIgMpAwAgD0L/////D4MgD0IgiH58IAggC0IgiKdqIgcpAwCFIg83AzAgBSAHKQMIIAMpAwggE0L/////D4MgE0IgiH58hSITNwM4IAUgBCAMQvCfgICA/gODIgunaiIDKQMAIAxC/////w+DIAxCIIh+fCAIIAtCIIinaiIHKQMAhSIMNwMAIAUgBykDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBykDAIUiDTcDECAFIAcpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgcpAwCFIg43AyAgBSAHKQMIIAMpAwggEEL/////D4MgEEIgiH58hSIQNwMoIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIHKQMAhSIPNwMwIAUgBykDCCADKQMIIBNC/////w+DIBNCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBykDAIUiDDcDACAFIAcpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgcpAwCFIg03AxAgBSAHKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIHKQMAhSIONwMgIAUgBykDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBykDAIUiDzcDMCAFIAcpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgcpAwCFIgw3AwAgBSAHKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIHKQMAhSINNwMQIAUgBykDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBykDAIUiDjcDICAFIAcpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhQ3AyggBSAEIA9C8J+AgID+A4MiEKdqIgMpAwAgD0L/////D4MgD0IgiH58IAggEEIgiKdqIgcpAwCFIgs3AzAgBSAHKQMIIAMpAwggE0L/////D4MgE0IgiH58hSIVNwM4IAUgBCAMQvCfgICA/gODIg+naiIDKQMAIAxC/////w+DIAxCIIh+fCAIIA9CIIinaiIHKQMAhSITNwMAIAUgBykDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDULwn4CAgP4DgyIMp2oiAykDACANQv////8PgyANQiCIfnwgCCAMQiCIp2oiBykDAIUiEDcDECAFIAcpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA5C8J+AgID+A4MiDKdqIgMpAwAgDkL/////D4MgDkIgiH58IAggDEIgiKdqIgcpAwCFIg83AyAgBSAHKQMIIAMpAwggFEL/////D4MgFEIgiH58hSIONwMoIAUgBCALQvCfgICA/gODIgynaiIDKQMAIAtC/////w+DIAtCIIh+fCAIIAxCIIinaiIHKQMAhSINNwMwIAUgBykDCCADKQMIIBVC/////w+DIBVCIIh+fIUiDDcDOCACIAZqIQMgCSAKSQRAIAMgDDcDOCADIA03AzAgAyAONwMoIAMgDzcDICADIBE3AxggAyAQNwMQIAMgEjcDCCADIBM3AwAgCUECaiEJDAELCyAFIANBBBAEIAUoAgALIAVBQGskAAtPAQJ/QbALKAIAIgEgAEEHakF4cSICaiEAAkAgAkEAIAAgAU0bRQRAIAA/AEEQdE0NASAAEAANAQtByAtBMDYCAEF/DwtBsAsgADYCACABC9wEAgN/AX4gAUEoaiIDIAEpAyAiBqdBA3ZBP3EiBGohBQJAIARBN00EQEE4IARrIgRFDQEgBUHwCCAE/AoAAAwBC0HAACAEayIEBEAgBUHwCCAE/AoAAAsgASADIAIgAkGAAmoQAyADQgA3AzAgA0IANwMoIANCADcDICADQgA3AxggA0IANwMQIANCADcDCCADQgA3AwAgASkDICEGCyABIAZCOIYgBkKA/gODQiiGhCAGQoCA/AeDQhiGIAZCgICA+A+DQgiGhIQgBkIIiEKAgID4D4MgBkIYiEKAgPwHg4QgBkIoiEKA/gODIAZCOIiEhIQ3AGAgASADIAIgAkGAAmoQAyAAIAEoAgAiAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnI2AAAgACABKAIEIgJBGHQgAkGA/gNxQQh0ciACQQh2QYD+A3EgAkEYdnJyNgAEIAAgASgCCCICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYACCAAIAEoAgwiAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnI2AAwgACABKAIQIgJBGHQgAkGA/gNxQQh0ciACQQh2QYD+A3EgAkEYdnJyNgAQIAAgASgCFCICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYAFCAAIAEoAhgiAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnI2ABggACABKAIcIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgAcC7sgAhd+DH8jAEFAaiIcJAACfyAERQRAIwBBQGoiAyQAIAEpA3ghBSAAKQN4IQYgACkDOCETIAEpA3AhCSAAKQNwIQogACkDMCEUIAEpA2ghCyAAKQNoIQwgACkDKCEVIAEpA2AhByAAKQNgIQggACkDICEWIAEpA1ghDSAAKQNYIQ4gACkDGCEXIAEpA1AhDyAAKQNQIRAgACkDECEYIAEpA0ghESAAKQNIIRIgACkDCCEZIAMgASkDQCIaIAApA0AiGyAAKQMAIAEpAwCFhYU3AwAgAyARIBIgGSABKQMIhYWFNwMIIAMgDyAQIBggASkDEIWFhTcDECADIA0gDiAXIAEpAxiFhYU3AxggAyAHIAggFiABKQMghYWFNwMgIAMgCyAMIBUgASkDKIWFhTcDKCADIAkgCiAUIAEpAzCFhYU3AzAgAyAFIAYgEyABKQM4hYWFNwM4IAMgAkEBEAQgAyAFIAYgAykDOIWFNwM4IAMgCSAKIAMpAzCFhTcDMCADIAsgDCADKQMohYU3AyggAyAHIAggAykDIIWFNwMgIAMgDSAOIAMpAxiFhTcDGCADIA8gECADKQMQhYU3AxAgAyARIBIgAykDCIWFNwMIIAMgGiAbIAMpAwCFhTcDACADIAJBQGtBARAEIAMoAgAgA0FAayQADAELIAQoAgwhJCAEKAIIISIgBCgCBCEdIAQoAgAhICABIANBB3RBQGoiHmoiISkDOCAAIB5qIh4pAziFIQUgISkDMCAeKQMwhSEGICEpAyggHikDKIUhCSAhKQMgIB4pAyCFIQogISkDGCAeKQMYhSELICEpAxAgHikDEIUhDCAhKQMIIB4pAwiFIQggISkDACAeKQMAhSEHIANBAXRBAmshJ0EAIQMDQCAAIANBBnQiJWoiISkDOCENICEpAzAhDiAhKQMoIQ8gISkDICEQICEpAxghESAhKQMQIRIgISkDCCETIBwgASAlaiIeKQMAICEpAwAgB4WFIgc3AwAgHCAeKQMIIAggE4WFIgg3AwggHCAeKQMQIAwgEoWFNwMQIBwgHikDGCALIBGFhTcDGCAcIB4pAyAgCiAQhYU3AyAgHCAeKQMoIAkgD4WFNwMoIBwgHikDMCAGIA6FhTcDMCAcIB4pAzggBSANhYU3AzggHCAgIAdC8P+BgID+H4MiBadqIh4pAwAgB0L/////D4MgB0IgiH58IB0iISAFQiCIp2oiHSkDAIUiBTcDACAcIB0pAwggHikDCCAIQv////8PgyAIQiCIfnyFNwMIICAgJGoiHSAFNwMAIB0gHCkDCDcDCCAcIBwpAxAiBUIgiCAFQv////8Pg34gICAFQvD/gYCA/h+DIgWnaiIdKQMAfCAhIAVCIIinaiIeKQMAhSIFNwMQIBwgHikDCCAdKQMIIBwpAxgiBkIgiCAGQv////8Pg358hTcDGCAhICRqIh0gBTcDACAdIBwpAxg3AwggHCAcKQMgIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHSkDAHwgISAFQiCIp2oiHikDAIUiBTcDICAcIB4pAwggHSkDCCAcKQMoIgZCIIggBkL/////D4N+fIU3AyggICAkQRBqIh1qIh4gBTcDACAeIBwpAyg3AwggHCAcKQMwIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHikDAHwgISAFQiCIp2oiHykDAIUiBTcDMCAcIB8pAwggHikDCCAcKQM4IgZCIIggBkL/////D4N+fIU3AzggHSAhaiIdIAU3AwAgHSAcKQM4NwMIIBwgHCkDACIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh0pAwB8ICEgBUIgiKdqIh4pAwCFIgU3AwAgHCAeKQMIIB0pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIICAgJEEgaiIdaiIeIAU3AwAgHiAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh4pAwB8ICEgBUIgiKdqIh8pAwCFIgU3AxAgHCAfKQMIIB4pAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYIB0gIWoiHSAFNwMAIB0gHCkDGDcDCCAcIBwpAyAiBUIgiCAFQv////8Pg34gICAFQvD/gYCA/h+DIgWnaiIdKQMAfCAhIAVCIIinaiIeKQMAhTcDICAcIB4pAwggHSkDCCAcKQMoIgVCIIggBUL/////D4N+fIU3AyggHCAcKQMwIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHSkDAHwgISAFQiCIp2oiHikDAIU3AzAgHCAeKQMIIB0pAwggHCkDOCIFQiCIIAVC/////w+DfnyFNwM4IBwgHCkDACIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh0pAwB8ICEgBUIgiKdqIh4pAwCFIgU3AwAgHCAeKQMIIB0pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIICAgJEEwaiIdaiIeIAU3AwAgHiAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh4pAwB8ICEgBUIgiKdqIh8pAwCFIgU3AxAgHCAfKQMIIB4pAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYIB0gIWoiHSAFNwMAIB0gHCkDGCIGNwMIIBwgHCkDICIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh0pAwB8ICEgBUIgiKdqIh4pAwCFIgk3AyAgHCAeKQMIIB0pAwggHCkDKCIFQiCIIAVC/////w+DfnyFIgo3AyggHCAcKQMwIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHSkDAHwgISAFQiCIp2oiHikDAIUiCzcDMCAeKQMIIQcgHSkDCCEIIBwpAzghBSACICVqIh0gHCkDACINNwMAIB0gHCkDCCIONwMIIBwpAxAhDCAdIAcgCCAFQv////8PgyAFQiCIfnyFIgg3AzggHSALNwMwIB0gCjcDKCAdIAk3AyAgHSAGNwMYIB0gDDcDECAAIANBAXIiJUEGdCIeaiIdKQM4IQ8gHSkDMCEQIB0pAyghESAdKQMgIRIgHSkDGCETIB0pAxAhFCAdKQMIIQcgHCANIB0pAwAgASAeaiIdKQMAhYUiBTcDACAcIA4gByAdKQMIhYUiBzcDCCAcIAwgFCAdKQMQhYU3AxAgHCAGIBMgHSkDGIWFNwMYIBwgEiAdKQMghSAJhTcDICAcIBEgHSkDKIUgCoU3AyggHCAQIB0pAzCFIAuFNwMwIBwgDyAdKQM4hSAIhTcDOCAcICIiHSAFQvD/gYCA/h+DIganaiIiKQMAIAVC/////w+DIAVCIIh+fCAgIAZCIIinaiIfKQMAhSIFNwMAIBwgHykDCCAiKQMIIAdC/////w+DIAdCIIh+fIU3AwggHSAkQUBrQfD/AXEiImoiHyAFNwMAIB8gHCkDCDcDCCAcIBwpAxAiBUIgiCAFQv////8Pg34gHSAFQvD/gYCA/h+DIgWnaiIfKQMAfCAgIAVCIIinaiIjKQMAhSIFNwMQIBwgIykDCCAfKQMIIBwpAxgiBkIgiCAGQv////8Pg358hTcDGCAgICJqIh8gBTcDACAfIBwpAxg3AwggHCAcKQMgIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiHykDAHwgICAFQiCIp2oiIykDAIUiBTcDICAcICMpAwggHykDCCAcKQMoIgZCIIggBkL/////D4N+fIU3AyggHSAiQRBqIh9qIiMgBTcDACAjIBwpAyg3AwggHCAcKQMwIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiIykDAHwgICAFQiCIp2oiJikDAIUiBTcDMCAcICYpAwggIykDCCAcKQM4IgZCIIggBkL/////D4N+fIU3AzggHyAgaiIfIAU3AwAgHyAcKQM4NwMIIBwgHCkDACIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIh8pAwB8ICAgBUIgiKdqIiMpAwCFIgU3AwAgHCAjKQMIIB8pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIIB0gIkEgaiIfaiIjIAU3AwAgIyAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIiMpAwB8ICAgBUIgiKdqIiYpAwCFIgU3AxAgHCAmKQMIICMpAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYIB8gIGoiHyAFNwMAIB8gHCkDGDcDCCAcIBwpAyAiBUIgiCAFQv////8Pg34gHSAFQvD/gYCA/h+DIgWnaiIfKQMAfCAgIAVCIIinaiIjKQMAhTcDICAcICMpAwggHykDCCAcKQMoIgVCIIggBUL/////D4N+fIU3AyggHCAcKQMwIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiHykDAHwgICAFQiCIp2oiIykDAIU3AzAgHCAjKQMIIB8pAwggHCkDOCIFQiCIIAVC/////w+DfnyFNwM4IBwgHCkDACIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIh8pAwB8ICAgBUIgiKdqIiMpAwCFIgU3AwAgHCAjKQMIIB8pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIIB0gIkEwaiIiaiIfIAU3AwAgHyAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIh8pAwB8ICAgBUIgiKdqIiMpAwCFIgU3AxAgHCAjKQMIIB8pAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYICAgImoiIiAFNwMAICIgHCkDGCILNwMIIBwgHCkDICIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIiIpAwB8ICAgBUIgiKdqIh8pAwCFIgo3AyAgHCAfKQMIICIpAwggHCkDKCIFQiCIIAVC/////w+DfnyFIgk3AyggHCAcKQMwIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiIikDAHwgICAFQiCIp2oiHykDAIUiBjcDMCAcIB8pAwggIikDCCAcKQM4IgVCIIggBUL/////D4N+fIUiBTcDOCAkQYABakHw/wFxISQgAyAnSQRAIAIgHmoiIiAcKQMAIgc3AwAgIiAcKQMIIgg3AwggHCkDECEMICIgBTcDOCAiIAY3AzAgIiAJNwMoICIgCjcDICAiIAs3AxggIiAMNwMQIANBAmohAyAgISIgISEgDAELCyAEICQ2AgwgBCAgNgIIIAQgHTYCBCAEICE2AgAgHCACICVBBnRqQQEQBCAcKAIACyAcQUBrJAALzxACCH4KfyMAQUBqIgwkAAJAIANFBEAjAEFAaiICJAAgACkDeCEEIAApA3AhBSAAKQNoIQggACkDYCEJIAApA1ghCiAAKQNQIQsgACkDSCEGIAIgACkDQCIHIAApAwCFNwMAIAIgBiAAKQMIhTcDCCACIAsgACkDEIU3AxAgAiAKIAApAxiFNwMYIAIgCSAAKQMghTcDICACIAggACkDKIU3AyggAiAFIAApAzCFNwMwIAIgBCAAKQM4hTcDOCACIAFBARAEIAIgByACKQMAhTcDACACIAYgAikDCIU3AwggAiALIAIpAxCFNwMQIAIgCiACKQMYhTcDGCACIAkgAikDIIU3AyAgAiAIIAIpAyiFNwMoIAIgBSACKQMwhTcDMCACIAQgAikDOIU3AzggAiABQUBrQQEQBCACQUBrJAAMAQsgAygCDCERIAMoAgghDSADKAIEIQ8gAygCACEQIAAgAkEBdEEBayITQQZ0aiICKQM4IQQgAikDMCEFIAIpAyghCCACKQMgIQkgAikDGCEKIAIpAxAhCyACKQMIIQcgAikDACEGQQAhAgNAIA0hFCAMIAAgAkEGdCIVaiINKQMAIAaFIgY3AwAgDCANKQMIIAeFIgc3AwggDCANKQMQIAuFNwMQIAwgDSkDGCAKhTcDGCAMIA0pAyAgCYU3AyAgDCANKQMoIAiFNwMoIAwgDSkDMCAFhTcDMCAMIA0pAzggBIU3AzggDCAQIAZC8P+BgID+H4MiBKdqIg0pAwAgBkL/////D4MgBkIgiH58IA8gBEIgiKdqIg4pAwCFIgQ3AwAgDCAOKQMIIA0pAwggB0L/////D4MgB0IgiH58hTcDCCAQIBFqIg0gBDcDACANIAwpAwg3AwggDCAMKQMQIgRCIIggBEL/////D4N+IBAgBELw/4GAgP4fgyIEp2oiDSkDAHwgDyAEQiCIp2oiDikDAIUiBDcDECAMIA4pAwggDSkDCCAMKQMYIgVCIIggBUL/////D4N+fIU3AxggDyARaiINIAQ3AwAgDSAMKQMYNwMIIAwgDCkDICIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg0pAwB8IA8gBEIgiKdqIg4pAwCFIgQ3AyAgDCAOKQMIIA0pAwggDCkDKCIFQiCIIAVC/////w+DfnyFNwMoIBAgEUEQaiINaiIOIAQ3AwAgDiAMKQMoNwMIIAwgDCkDMCIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg4pAwB8IA8gBEIgiKdqIhIpAwCFIgQ3AzAgDCASKQMIIA4pAwggDCkDOCIFQiCIIAVC/////w+DfnyFNwM4IA0gD2oiDSAENwMAIA0gDCkDODcDCCAMIAwpAwAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiINKQMAfCAPIARCIIinaiIOKQMAhSIENwMAIAwgDikDCCANKQMIIAwpAwgiBUIgiCAFQv////8Pg358hTcDCCAQIBFBIGoiDWoiDiAENwMAIA4gDCkDCDcDCCAMIAwpAxAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiIOKQMAfCAPIARCIIinaiISKQMAhSIENwMQIAwgEikDCCAOKQMIIAwpAxgiBUIgiCAFQv////8Pg358hTcDGCANIA9qIg0gBDcDACANIAwpAxg3AwggDCAMKQMgIgRCIIggBEL/////D4N+IBAgBELw/4GAgP4fgyIEp2oiDSkDAHwgDyAEQiCIp2oiDikDAIU3AyAgDCAOKQMIIA0pAwggDCkDKCIEQiCIIARC/////w+DfnyFNwMoIAwgDCkDMCIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg0pAwB8IA8gBEIgiKdqIg4pAwCFNwMwIAwgDikDCCANKQMIIAwpAzgiBEIgiCAEQv////8Pg358hTcDOCAMIAwpAwAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiINKQMAfCAPIARCIIinaiIOKQMAhSIENwMAIAwgDikDCCANKQMIIAwpAwgiBUIgiCAFQv////8Pg358hTcDCCAQIBFBMGoiDWoiDiAENwMAIA4gDCkDCDcDCCAMIAwpAxAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiIOKQMAfCAPIARCIIinaiISKQMAhSIENwMQIAwgEikDCCAOKQMIIAwpAxgiBUIgiCAFQv////8Pg358hTcDGCANIA9qIg0gBDcDACANIAwpAxgiCjcDCCAMIAwpAyAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiINKQMAfCAPIARCIIinaiIOKQMAhSIJNwMgIAwgDikDCCANKQMIIAwpAygiBEIgiCAEQv////8Pg358hSIINwMoIAwgDCkDMCIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg0pAwB8IA8gBEIgiKdqIg4pAwCFIgU3AzAgDCAOKQMIIA0pAwggDCkDOCIEQiCIIARC/////w+DfnyFIgQ3AzggEUFAa0Hw/wFxIREgAiATRwRAIAEgFWoiDSAMKQMAIgY3AwAgDSAMKQMIIgc3AwggDCkDECELIA0gBDcDOCANIAU3AzAgDSAINwMoIA0gCTcDICANIAo3AxggDSALNwMQIAJBAWohAiAPIQ0gECEPIBQhEAwBCwsgAyARNgIMIAMgDzYCCCADIBA2AgQgAyAUNgIAIAwgASATQQZ0akEBEAQLIAxBQGskAAvcCwEIfwJAIABFDQAgAEEIayIDIABBBGsoAgAiAkF4cSIAaiEFAkAgAkEBcQ0AIAJBAnFFDQEgAyADKAIAIgRrIgNB5AsoAgBJDQEgACAEaiEAAkACQAJAQegLKAIAIANHBEAgAygCDCEBIARB/wFNBEAgASADKAIIIgJHDQJB1AtB1AsoAgBBfiAEQQN2d3E2AgAMBQsgAygCGCEHIAEgA0cEQCADKAIIIgIgATYCDCABIAI2AggMBAsgAygCFCICBH8gA0EUagUgAygCECICRQ0DIANBEGoLIQQDQCAEIQYgAiIBQRRqIQQgASgCFCICDQAgAUEQaiEEIAEoAhAiAg0ACyAGQQA2AgAMAwsgBSgCBCICQQNxQQNHDQNB3AsgADYCACAFIAJBfnE2AgQgAyAAQQFyNgIEIAUgADYCAA8LIAIgATYCDCABIAI2AggMAgtBACEBCyAHRQ0AAkAgAygCHCIEQQJ0QYQOaiICKAIAIANGBEAgAiABNgIAIAENAUHYC0HYCygCAEF+IAR3cTYCAAwCCwJAIAMgBygCEEYEQCAHIAE2AhAMAQsgByABNgIUCyABRQ0BCyABIAc2AhggAygCECICBEAgASACNgIQIAIgATYCGAsgAygCFCICRQ0AIAEgAjYCFCACIAE2AhgLIAMgBU8NACAFKAIEIgRBAXFFDQACQAJAAkACQCAEQQJxRQRAQewLKAIAIAVGBEBB7AsgAzYCAEHgC0HgCygCACAAaiIANgIAIAMgAEEBcjYCBCADQegLKAIARw0GQdwLQQA2AgBB6AtBADYCAA8LQegLKAIAIgcgBUYEQEHoCyADNgIAQdwLQdwLKAIAIABqIgA2AgAgAyAAQQFyNgIEIAAgA2ogADYCAA8LIARBeHEgAGohACAFKAIMIQEgBEH/AU0EQCAFKAIIIgIgAUYEQEHUC0HUCygCAEF+IARBA3Z3cTYCAAwFCyACIAE2AgwgASACNgIIDAQLIAUoAhghCCABIAVHBEAgBSgCCCICIAE2AgwgASACNgIIDAMLIAUoAhQiAgR/IAVBFGoFIAUoAhAiAkUNAiAFQRBqCyEEA0AgBCEGIAIiAUEUaiEEIAEoAhQiAg0AIAFBEGohBCABKAIQIgINAAsgBkEANgIADAILIAUgBEF+cTYCBCADIABBAXI2AgQgACADaiAANgIADAMLQQAhAQsgCEUNAAJAIAUoAhwiBEECdEGEDmoiAigCACAFRgRAIAIgATYCACABDQFB2AtB2AsoAgBBfiAEd3E2AgAMAgsCQCAFIAgoAhBGBEAgCCABNgIQDAELIAggATYCFAsgAUUNAQsgASAINgIYIAUoAhAiAgRAIAEgAjYCECACIAE2AhgLIAUoAhQiAkUNACABIAI2AhQgAiABNgIYCyADIABBAXI2AgQgACADaiAANgIAIAMgB0cNAEHcCyAANgIADwsgAEH/AU0EQCAAQXhxQfwLaiECAn9B1AsoAgAiBEEBIABBA3Z0IgBxRQRAQdQLIAAgBHI2AgAgAgwBCyACKAIICyEAIAIgAzYCCCAAIAM2AgwgAyACNgIMIAMgADYCCA8LQR8hASAAQf///wdNBEAgAEEmIABBCHZnIgJrdkEBcSACQQF0a0E+aiEBCyADIAE2AhwgA0IANwIQIAFBAnRBhA5qIQQCfwJAAn9B2AsoAgAiBkEBIAF0IgJxRQRAQdgLIAIgBnI2AgAgBCADNgIAQRghAUEIDAELIABBGSABQQF2a0EAIAFBH0cbdCEBIAQoAgAhBANAIAQiAigCBEF4cSAARg0CIAFBHXYhBCABQQF0IQEgAiAEQQRxaiIGKAIQIgQNAAsgBiADNgIQQRghASACIQRBCAshACADIgIMAQsgAigCCCIEIAM2AgwgAiADNgIIQRghAEEIIQFBAAshBiABIANqIAQ2AgAgAyACNgIMIAAgA2ogBjYCAEH0C0H0CygCAEEBayIAQX8gABs2AgALC9onAQt/IwBBEGsiCiQAAkACQAJAAkACQAJAAkACQAJAAkAgAEH0AU0EQEHUCygCACIEQRAgAEELakH4A3EgAEELSRsiBkEDdiIAdiIBQQNxBEACQCABQX9zQQFxIABqIgJBA3QiAUH8C2oiACABQYQMaigCACIBKAIIIgVGBEBB1AsgBEF+IAJ3cTYCAAwBCyAFIAA2AgwgACAFNgIICyABQQhqIQAgASACQQN0IgJBA3I2AgQgASACaiIBIAEoAgRBAXI2AgQMCwsgBkHcCygCACIITQ0BIAEEQAJAQQIgAHQiAkEAIAJrciABIAB0cWgiAUEDdCIAQfwLaiICIABBhAxqKAIAIgAoAggiBUYEQEHUCyAEQX4gAXdxIgQ2AgAMAQsgBSACNgIMIAIgBTYCCAsgACAGQQNyNgIEIAAgBmoiByABQQN0IgEgBmsiBUEBcjYCBCAAIAFqIAU2AgAgCARAIAhBeHFB/AtqIQFB6AsoAgAhAgJ/IARBASAIQQN2dCIDcUUEQEHUCyADIARyNgIAIAEMAQsgASgCCAshAyABIAI2AgggAyACNgIMIAIgATYCDCACIAM2AggLIABBCGohAEHoCyAHNgIAQdwLIAU2AgAMCwtB2AsoAgAiC0UNASALaEECdEGEDmooAgAiAigCBEF4cSAGayEDIAIhAQNAAkAgASgCECIARQRAIAEoAhQiAEUNAQsgACgCBEF4cSAGayIBIAMgASADSSIBGyEDIAAgAiABGyECIAAhAQwBCwsgAigCGCEJIAIgAigCDCIARwRAIAIoAggiASAANgIMIAAgATYCCAwKCyACKAIUIgEEfyACQRRqBSACKAIQIgFFDQMgAkEQagshBQNAIAUhByABIgBBFGohBSAAKAIUIgENACAAQRBqIQUgACgCECIBDQALIAdBADYCAAwJC0F/IQYgAEG/f0sNACAAQQtqIgFBeHEhBkHYCygCACIHRQ0AQR8hCEEAIAZrIQMgAEH0//8HTQRAIAZBJiABQQh2ZyIAa3ZBAXEgAEEBdGtBPmohCAsCQAJAAkAgCEECdEGEDmooAgAiAUUEQEEAIQAMAQtBACEAIAZBGSAIQQF2a0EAIAhBH0cbdCECA0ACQCABKAIEQXhxIAZrIgQgA08NACABIQUgBCIDDQBBACEDIAEhAAwDCyAAIAEoAhQiBCAEIAEgAkEddkEEcWooAhAiAUYbIAAgBBshACACQQF0IQIgAQ0ACwsgACAFckUEQEEAIQVBAiAIdCIAQQAgAGtyIAdxIgBFDQMgAGhBAnRBhA5qKAIAIQALIABFDQELA0AgACgCBEF4cSAGayICIANJIQEgAiADIAEbIQMgACAFIAEbIQUgACgCECIBBH8gAQUgACgCFAsiAA0ACwsgBUUNACADQdwLKAIAIAZrTw0AIAUoAhghCCAFIAUoAgwiAEcEQCAFKAIIIgEgADYCDCAAIAE2AggMCAsgBSgCFCIBBH8gBUEUagUgBSgCECIBRQ0DIAVBEGoLIQIDQCACIQQgASIAQRRqIQIgACgCFCIBDQAgAEEQaiECIAAoAhAiAQ0ACyAEQQA2AgAMBwsgBkHcCygCACIFTQRAQegLKAIAIQACQCAFIAZrIgFBEE8EQCAAIAZqIgIgAUEBcjYCBCAAIAVqIAE2AgAgACAGQQNyNgIEDAELIAAgBUEDcjYCBCAAIAVqIgEgASgCBEEBcjYCBEEAIQJBACEBC0HcCyABNgIAQegLIAI2AgAgAEEIaiEADAkLIAZB4AsoAgAiAkkEQEHgCyACIAZrIgE2AgBB7AtB7AsoAgAiACAGaiICNgIAIAIgAUEBcjYCBCAAIAZBA3I2AgQgAEEIaiEADAkLQQAhACAGQS9qIgMCf0GsDygCAARAQbQPKAIADAELQbgPQn83AgBBsA9CgKCAgICABDcCAEGsDyAKQQxqQXBxQdiq1aoFczYCAEHAD0EANgIAQZAPQQA2AgBBgCALIgFqIgRBACABayIHcSIBIAZNDQhBjA8oAgAiBQRAQYQPKAIAIgggAWoiCSAITQ0JIAUgCUkNCQsCQEGQDy0AAEEEcUUEQAJAAkACQAJAQewLKAIAIgUEQEGUDyEAA0AgACgCACIIIAVNBEAgBSAIIAAoAgRqSQ0DCyAAKAIIIgANAAsLQQAQBiICQX9GDQMgASEEQbAPKAIAIgBBAWsiBSACcQRAIAEgAmsgAiAFakEAIABrcWohBAsgBCAGTQ0DQYwPKAIAIgAEQEGEDygCACIFIARqIgcgBU0NBCAAIAdJDQQLIAQQBiIAIAJHDQEMBQsgBCACayAHcSIEEAYiAiAAKAIAIAAoAgRqRg0BIAIhAAsgAEF/Rg0BIAZBMGogBE0EQCAAIQIMBAtBtA8oAgAiAiADIARrakEAIAJrcSICEAZBf0YNASACIARqIQQgACECDAMLIAJBf0cNAgtBkA9BkA8oAgBBBHI2AgALIAEQBiECQQAQBiEAIAJBf0YNBSAAQX9GDQUgACACTQ0FIAAgAmsiBCAGQShqTQ0FC0GED0GEDygCACAEaiIANgIAQYgPKAIAIABJBEBBiA8gADYCAAsCQEHsCygCACIDBEBBlA8hAANAIAIgACgCACIBIAAoAgQiBWpGDQIgACgCCCIADQALDAQLQeQLKAIAIgBBACAAIAJNG0UEQEHkCyACNgIAC0EAIQBBmA8gBDYCAEGUDyACNgIAQfQLQX82AgBB+AtBrA8oAgA2AgBBoA9BADYCAANAIABBA3QiAUGEDGogAUH8C2oiBTYCACABQYgMaiAFNgIAIABBAWoiAEEgRw0AC0HgCyAEQShrIgBBeCACa0EHcSIBayIFNgIAQewLIAEgAmoiATYCACABIAVBAXI2AgQgACACakEoNgIEQfALQbwPKAIANgIADAQLIAIgA00NAiABIANLDQIgACgCDEEIcQ0CIAAgBCAFajYCBEHsCyADQXggA2tBB3EiAGoiATYCAEHgC0HgCygCACAEaiICIABrIgA2AgAgASAAQQFyNgIEIAIgA2pBKDYCBEHwC0G8DygCADYCAAwDC0EAIQAMBgtBACEADAQLQeQLKAIAIAJLBEBB5AsgAjYCAAsgAiAEaiEFQZQPIQACQANAIAUgACgCACIBRwRAIAAoAggiAA0BDAILCyAALQAMQQhxRQ0DC0GUDyEAA0ACQCAAKAIAIgEgA00EQCADIAEgACgCBGoiBUkNAQsgACgCCCEADAELC0HgCyAEQShrIgBBeCACa0EHcSIBayIHNgIAQewLIAEgAmoiATYCACABIAdBAXI2AgQgACACakEoNgIEQfALQbwPKAIANgIAIAMgBUEnIAVrQQdxakEvayIAIAAgA0EQakkbIgFBGzYCBCABQZwPKQIANwIQIAFBlA8pAgA3AghBnA8gAUEIajYCAEGYDyAENgIAQZQPIAI2AgBBoA9BADYCACABQRhqIQADQCAAQQc2AgQgAEEIaiAAQQRqIQAgBUkNAAsgASADRg0AIAEgASgCBEF+cTYCBCADIAEgA2siAkEBcjYCBCABIAI2AgACfyACQf8BTQRAIAJBeHFB/AtqIQACf0HUCygCACIBQQEgAkEDdnQiAnFFBEBB1AsgASACcjYCACAADAELIAAoAggLIQEgACADNgIIIAEgAzYCDEEMIQJBCAwBC0EfIQAgAkH///8HTQRAIAJBJiACQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAAsgAyAANgIcIANCADcCECAAQQJ0QYQOaiEBAkACQEHYCygCACIFQQEgAHQiBHFFBEBB2AsgBCAFcjYCACABIAM2AgAMAQsgAkEZIABBAXZrQQAgAEEfRxt0IQAgASgCACEFA0AgBSIBKAIEQXhxIAJGDQIgAEEddiEFIABBAXQhACABIAVBBHFqIgQoAhAiBQ0ACyAEIAM2AhALIAMgATYCGEEIIQIgAyIBIQBBDAwBCyABKAIIIgAgAzYCDCABIAM2AgggAyAANgIIQQAhAEEYIQJBDAsgA2ogATYCACACIANqIAA2AgALQeALKAIAIgAgBk0NAEHgCyAAIAZrIgE2AgBB7AtB7AsoAgAiACAGaiICNgIAIAIgAUEBcjYCBCAAIAZBA3I2AgQgAEEIaiEADAQLQcgLQTA2AgBBACEADAMLIAAgAjYCACAAIAAoAgQgBGo2AgQgAkF4IAJrQQdxaiIIIAZBA3I2AgQgAUF4IAFrQQdxaiIEIAYgCGoiA2shBwJAQewLKAIAIARGBEBB7AsgAzYCAEHgC0HgCygCACAHaiIANgIAIAMgAEEBcjYCBAwBC0HoCygCACAERgRAQegLIAM2AgBB3AtB3AsoAgAgB2oiADYCACADIABBAXI2AgQgACADaiAANgIADAELIAQoAgQiAEEDcUEBRgRAIABBeHEhCSAEKAIMIQICQCAAQf8BTQRAIAQoAggiASACRgRAQdQLQdQLKAIAQX4gAEEDdndxNgIADAILIAEgAjYCDCACIAE2AggMAQsgBCgCGCEGAkAgAiAERwRAIAQoAggiACACNgIMIAIgADYCCAwBCwJAIAQoAhQiAAR/IARBFGoFIAQoAhAiAEUNASAEQRBqCyEBA0AgASEFIAAiAkEUaiEBIAAoAhQiAA0AIAJBEGohASACKAIQIgANAAsgBUEANgIADAELQQAhAgsgBkUNAAJAIAQoAhwiAEECdEGEDmoiASgCACAERgRAIAEgAjYCACACDQFB2AtB2AsoAgBBfiAAd3E2AgAMAgsCQCAEIAYoAhBGBEAgBiACNgIQDAELIAYgAjYCFAsgAkUNAQsgAiAGNgIYIAQoAhAiAARAIAIgADYCECAAIAI2AhgLIAQoAhQiAEUNACACIAA2AhQgACACNgIYCyAHIAlqIQcgBCAJaiIEKAIEIQALIAQgAEF+cTYCBCADIAdBAXI2AgQgAyAHaiAHNgIAIAdB/wFNBEAgB0F4cUH8C2ohAAJ/QdQLKAIAIgFBASAHQQN2dCICcUUEQEHUCyABIAJyNgIAIAAMAQsgACgCCAshASAAIAM2AgggASADNgIMIAMgADYCDCADIAE2AggMAQtBHyECIAdB////B00EQCAHQSYgB0EIdmciAGt2QQFxIABBAXRrQT5qIQILIAMgAjYCHCADQgA3AhAgAkECdEGEDmohAAJAAkBB2AsoAgAiAUEBIAJ0IgVxRQRAQdgLIAEgBXI2AgAgACADNgIADAELIAdBGSACQQF2a0EAIAJBH0cbdCECIAAoAgAhAQNAIAEiACgCBEF4cSAHRg0CIAJBHXYhASACQQF0IQIgACABQQRxaiIFKAIQIgENAAsgBSADNgIQCyADIAA2AhggAyADNgIMIAMgAzYCCAwBCyAAKAIIIgEgAzYCDCAAIAM2AgggA0EANgIYIAMgADYCDCADIAE2AggLIAhBCGohAAwCCwJAIAhFDQACQCAFKAIcIgFBAnRBhA5qIgIoAgAgBUYEQCACIAA2AgAgAA0BQdgLIAdBfiABd3EiBzYCAAwCCwJAIAUgCCgCEEYEQCAIIAA2AhAMAQsgCCAANgIUCyAARQ0BCyAAIAg2AhggBSgCECIBBEAgACABNgIQIAEgADYCGAsgBSgCFCIBRQ0AIAAgATYCFCABIAA2AhgLAkAgA0EPTQRAIAUgAyAGaiIAQQNyNgIEIAAgBWoiACAAKAIEQQFyNgIEDAELIAUgBkEDcjYCBCAFIAZqIgQgA0EBcjYCBCADIARqIAM2AgAgA0H/AU0EQCADQXhxQfwLaiEAAn9B1AsoAgAiAUEBIANBA3Z0IgJxRQRAQdQLIAEgAnI2AgAgAAwBCyAAKAIICyEBIAAgBDYCCCABIAQ2AgwgBCAANgIMIAQgATYCCAwBC0EfIQAgA0H///8HTQRAIANBJiADQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAAsgBCAANgIcIARCADcCECAAQQJ0QYQOaiEBAkACQCAHQQEgAHQiAnFFBEBB2AsgAiAHcjYCACABIAQ2AgAgBCABNgIYDAELIANBGSAAQQF2a0EAIABBH0cbdCEAIAEoAgAhAQNAIAEiAigCBEF4cSADRg0CIABBHXYhASAAQQF0IQAgAiABQQRxaiIHKAIQIgENAAsgByAENgIQIAQgAjYCGAsgBCAENgIMIAQgBDYCCAwBCyACKAIIIgAgBDYCDCACIAQ2AgggBEEANgIYIAQgAjYCDCAEIAA2AggLIAVBCGohAAwBCwJAIAlFDQACQCACKAIcIgFBAnRBhA5qIgUoAgAgAkYEQCAFIAA2AgAgAA0BQdgLIAtBfiABd3E2AgAMAgsCQCACIAkoAhBGBEAgCSAANgIQDAELIAkgADYCFAsgAEUNAQsgACAJNgIYIAIoAhAiAQRAIAAgATYCECABIAA2AhgLIAIoAhQiAUUNACAAIAE2AhQgASAANgIYCwJAIANBD00EQCACIAMgBmoiAEEDcjYCBCAAIAJqIgAgACgCBEEBcjYCBAwBCyACIAZBA3I2AgQgAiAGaiIFIANBAXI2AgQgAyAFaiADNgIAIAgEQCAIQXhxQfwLaiEAQegLKAIAIQECf0EBIAhBA3Z0IgcgBHFFBEBB1AsgBCAHcjYCACAADAELIAAoAggLIQQgACABNgIIIAQgATYCDCABIAA2AgwgASAENgIIC0HoCyAFNgIAQdwLIAM2AgALIAJBCGohAAsgCkEQaiQAIAALyRACB38CfiMAQcAIayIFJAAgBEFhSQRAAkACQCAEQR9xDQAgAkE8cUEzSw0AIAVB0ANqIABBICAFQbABaiAFQdAAaiAFQZABahANAkAgAkUiCA0AIAUgBSkD8AMiDCACrUIDhnw3A/ADIAVB+ANqIgkgDKdBA3ZBP3EiB2ohBkHAACAHayIHIAJLBEAgCA0BIAYgASAC/AoAAAwBCyAHBEAgBiABIAf8CgAACyAFQdADaiAJIAVBsAFqIAVBsANqIggQAyABIAdqIQYgAiAHayIHQcAATwRAA0AgBUHQA2ogBiAFQbABaiAIEAMgBkFAayEGIAdBQGoiB0E/Sw0ACwsgB0UNACAJIAYgB/wKAAALIAUgBSkD8AMiDEIgfCINNwPwAyAFQfgDaiIHIAynQQN2QT9xIgZqIQkCQCAGQTtNBEAgCUEANgAADAELQcAAIAZrIggEQCAJQQAgCPwLAAsgBUHQA2ogByAFQbABaiAFQbADahADIAZBPGsiCARAIAdBqAkgBmsgCPwKAAALIAUpA/ADIQ0LIA1C+AODIAxC+AODVA0AIAVB0ANqIAVB0ABqIgYgBUGwAWoiCBAVDQAgBSAFKQPYBEKAAnw3A9gEIAVBuARqIAYgCBAVGiAERQ0BIAVB4ARqIQggBUGwA2ohBkEAIQFBACECA0AgCSACQQFqIgJBGHQgAkGA/gNxQQh0ciACQQh2QYD+A3EgAkEYdnJyNgAAIAUgBSkD6AM3A2ggBSAFKQPgAzcDYCAFIAUpA9gDNwNYIAUgBSkD0AM3A1AgBUHQAGoiCiAHIAVBsAFqIgsgBhADIAUgBSgCbCIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC/AQgBSAFKAJYIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLoBCAFIAUoAlAiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AuAEIAUgBSgCVCIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC5AQgBSAFKAJcIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLsBCAFIAUoAmAiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AvAEIAUgBSgCZCIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC9AQgBSAFKAJoIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgL4BCAFIAUpAtAENwNoIAUgBSkCwAQ3A1ggBSAFKQLIBDcDYCAFIAUpArgENwNQIAogCCALIAYQAyABIANqIgAgBSgCUCIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYAACAAIAUoAlQiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AAQgACAFKAJYIgFBGHQgAUGA/gNxQQh0ciABQQh2QYD+A3EgAUEYdnJyNgAIIAAgBSgCXCIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYADCAAIAUoAmAiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2ABAgACAFKAJkIgFBGHQgAUGA/gNxQQh0ciABQQh2QYD+A3EgAUEYdnJyNgAUIAAgBSgCaCIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYAGCAAIAUoAmwiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2ABwgAkEFdCIBIARJDQALDAELIAVB8AZqIgYgAEEgIAVBsAFqIAVB0ABqIAVBkAFqEA0gBUGgBWogBkHQAfwKAAACQCACRSIJDQAgBSAFKQPABSIMIAKtQgOGfDcDwAUgBUHIBWoiByAMp0EDdkE/cSIAaiEGQcAAIABrIgAgAksEQCAJDQEgBiABIAL8CgAADAELIAAEQCAGIAEgAPwKAAALIAVBoAVqIAcgBUGwAWogBUGwA2oiCRADIAAgAWohBiACIABrIgJBwABPBEADQCAFQaAFaiAGIAVBsAFqIAkQAyAGQUBrIQYgAkFAaiICQT9LDQALCyACRQ0AIAcgBiAC/AoAAAsgBEUNACAFQbgEaiEJIAVBsANqIQggBUH4A2ohASAFQeAEaiEGQQAhAgNAIAUgAkEBaiICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYCTCAFQdADaiAFQaAFakHQAfwKAAAgBSAFKQPwAyIMQiB8NwPwAyABIAynQQN2QT9xIgBqIQcCQCAAQTtNBEAgByAFKAJMNgAADAELQcAAIABrIgoEQCAHIAVBzABqIAr8CgAACyAFQdADaiABIAVBsAFqIAgQAyAAQTxrIgBFDQAgASAFQcwAaiAKaiAA/AoAAAsgBUHQAGogBUHQA2ogBUGwAWoQByAFIAUpA9gEIgxCgAJ8NwPYBCAGIAynQQN2QT9xIgdqIQACQCAHQR9NBEAgACAFKQNQNwAAIAAgBSkDaDcAGCAAIAUpA2A3ABAgACAFKQNYNwAIDAELQcAAIAdrIgoEQCAAIAVB0ABqIAr8CgAACyAJIAYgBUGwAWogCBADIAdBIGsiAEUNACAGIAVB0ABqIApqIAD8CgAACyAFIAkgBUGwAWoQB0EgIAQgC2siACAAQSBPGyIABEAgAyALaiAFIAD8CgAACyACQQV0IgsgBEkNAAsLIAVBwAhqJAAPC0HFCEGgCEGuBEG3CBACAAudCwIFfwF+AkACQAJ/IAJBwQBPBEAgAEGYCCkDADcDGCAAQZAIKQMANwMQIABBiAgpAwA3AwggAEGACCkDADcDACAAIAKtQgOGNwMgIAAgASkAADcAKCAAIAEpAAg3ADAgACABKQAQNwA4IABBQGsgASkAGDcAACAAIAEpACA3AEggACABKQAoNwBQIAAgASkAMDcAWCAAIAEpADg3AGAgACAAQShqIgggAyADQYACaiIHEAMgAUFAayEGIAJBQGoiAUHAAE8EQANAIAAgBiADIAcQAyAGQUBrIQYgAUFAaiIBQT9LDQALCyABBEAgCCAGIAH8CgAACyAFIAAgAxAHIABCADcDICAAQYAIKQMANwMAIABBiAgpAwA3AwggAEGQCCkDADcDECAAQZgIKQMANwMYIARCtuzYsePGjZs2NwAAIARCtuzYsePGjZs2NwAIIARCtuzYsePGjZs2NwAQIARCtuzYsePGjZs2NwAYIARCtuzYsePGjZs2NwAgIARCtuzYsePGjZs2NwAoIARCtuzYsePGjZs2NwAwIARCtuzYsePGjZs2NwA4QSAMAQsgAEIANwMgIABBgAgpAwA3AwAgAEGICCkDADcDCCAAQZAIKQMANwMQIABBmAgpAwA3AxggBEK27Nix48aNmzY3AAAgBEK27Nix48aNmzY3AAggBEK27Nix48aNmzY3ABAgBEK27Nix48aNmzY3ABggBEK27Nix48aNmzY3ACAgBEK27Nix48aNmzY3ACggBEK27Nix48aNmzY3ADAgBEK27Nix48aNmzY3ADggAkUNASABIQUgAgshCEEAIQJBACEGIAhBBE8EQCAIQfwAcSEHQQAhAQNAIAQgBmoiCiAKLQAAIAUgBmotAABzOgAAIAQgBkEBciIKaiIJIAktAAAgBSAKai0AAHM6AAAgBCAGQQJyIgpqIgkgCS0AACAFIApqLQAAczoAACAEIAZBA3IiCmoiCSAJLQAAIAUgCmotAABzOgAAIAZBBGohBiABQQRqIgEgB0cNAAsLIAhBA3EiAQRAA0AgBCAGaiIHIActAAAgBSAGai0AAHM6AAAgBkEBaiEGIAJBAWoiAiABRw0AC0EAIQILIAUhAQwBC0EBIQILIAAgACkDICILQoAEfDcDICAAQShqIQVBwAAgC6dBA3ZBP3EiBmsiBwRAIAUgBmogBCAH/AoAAAsgACAFIAMgA0GAAmoiChADIAYEQCAFIAQgB2ogBvwKAAALIABCADcDiAFBACEGIABBgAgpAwA3A2ggAEGICCkDADcDcCAAQZAIKQMANwN4IABBmAgpAwA3A4ABIARC3Ljx4sWLl67cADcAACAEQty48eLFi5eu3AA3AAggBELcuPHixYuX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YykDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiZSkDAIUiBULwn4CAgP4DgyIPp2oiZikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiZykDAIUiBULwn4CAgP4DgyIPp2oiaCkDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiaSkDAIUiBULwn4CAgP4DgyIPp2oiaikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiaykDAIUiBULwn4CAgP4DgyIPQiCIp2oibCkDACEeIAMgD6dqIm0pAwAhDyBWKQMIIR8gRSkDCCEgIFwpAwghISBbKQMIISIgYikDCCEjIGEpAwghJCBEKQMIISUgVSkDCCEmIFopAwghJyBJKQMIISggYCkDCCEpIF8pAwghKiBUKQMIISsgUykDCCEsIEgpAwghLSBZKQMIIS4gXikDCCEvIE0pAwghMCBSKQMIITEgUSkDCCEyIFgpAwghMyBXKQMIITQgTCkDCCE1IF0pAwghNiBQKQMIITcgQCkDCCE4IEcpAwghOSBGKQMIITogSykDCCE7IEopAwghPCBBIGwpAwggbSkDCCBrKQMIIGopAwggaSkDCCBoKQMIIGcpAwggZikDCCBlKQMIIGMpAwggTykDCCBOKQMIIAkgFIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiFDcDOCBBIB4gDyAFQv////8PgyAFQiCIfnyFIgk3AzAgQSAcIB0gIyAkICkgKiAvIDAgNSA2IDsgPCAIIBOFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIhM3AyggQSAbIA0gBkL/////D4MgBkIgiH58hSIFNwMgIEEgGSAaICEgIiAnICggLSAuIDMgNCA5IDogESAShSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSISNwMYIEEgGCAMIApC/////w+DIApCIIh+fIUiCDcDECBBIBYgFyAfICAgJSAmICsgLCAxIDIgNyA4IA4gEIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiCjcDCCBBIBUgCyAHQv////8PgyAHQiCIfnyFIgY3AwAgACBCQcAAciJAaiJBKQMAIQ4gQSkDCCEHIEEpAxAhCyBBKQMYIRAgQSkDICEMIEEpAyghESBBKQMwIQ0gASBAaiJAIEEpAzggQCkDOIUiDzcDOCBAIA0gQCkDMIUiDTcDMCBAIBEgQCkDKIUiETcDKCBAIAwgQCkDIIUiDDcDICBAIBAgQCkDGIUiEDcDGCBAIAsgQCkDEIUiCzcDECBAIAcgQCkDCIUiFTcDCCBAIA4gQCkDAIUiDjcDACAEIAMgAyADIAMgCSANhSIJQvCfgICA/gODIgenaiJAKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJCKQMAhSIJQvCfgICA/gODIgenaiJQKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJRKQMAhSIJQvCfgICA/gODIgenaiJSKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJTKQMAhSIJQvCfgICA/gODIgenaiJUKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJVKQMAhSIJQvCfgICA/gODIgdCIIinaiJEKQMIIQ0gAyAHp2oiRSkDCCEWIEQpAwAhFyBFKQMAIRggBCADIAMgAyADIAUgDIUiBULwn4CAgP4DgyIHp2oiRCkDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiRSkDAIUiBULwn4CAgP4DgyIHp2oiVikDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiRikDAIUiBULwn4CAgP4DgyIHp2oiRykDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiVykDAIUiBULwn4CAgP4DgyIHp2oiWCkDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiWSkDAIUiBULwn4CAgP4DgyIHQiCIp2oiSCkDCCEMIAMgB6dqIkkpAwghGSBIKQMAIRogSSkDACEbIAQgAyADIAMgAyAIIAuFIghC8J+AgID+A4MiB6dqIkgpAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIkkpAwCFIghC8J+AgID+A4MiB6dqIlopAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIlspAwCFIghC8J+AgID+A4MiB6dqIlwpAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIkopAwCFIghC8J+AgID+A4MiB6dqIkspAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIl0pAwCFIghC8J+AgID+A4MiB0IgiKdqIkwpAwghCyADIAenaiJNKQMIIRwgTCkDACEdIE0pAwAhHiAEIAMgAyADIAMgBiAOhSIGQvCfgICA/gODIg6naiJMKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJNKQMAhSIGQvCfgICA/gODIg6naiJeKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJfKQMAhSIGQvCfgICA/gODIg6naiJgKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJhKQMAhSIGQvCfgICA/gODIg6naiJiKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJOKQMAhSIGQvCfgICA/gODIg5CIIinaiJPKQMIIR8gAyAOp2oiYykDCCEOIFUpAwghICBUKQMIISEgWSkDCCEiIFgpAwghIyBdKQMIISQgSykDCCElIE4pAwghJiBiKQMIIScgUykDCCEoIFIpAwghKSBXKQMIISogRykDCCErIEopAwghLCBcKQMIIS0gYSkDCCEuIGApAwghLyBRKQMIITAgUCkDCCExIEYpAwghMiBWKQMIITMgWykDCCE0IFopAwghNSBfKQMIITYgXikDCCE3IEIpAwghOCBAKQMIITkgRSkDCCE6IEQpAwghOyBJKQMIITwgSCkDCCE9IE0pAwghPiBMKQMIIT8gQyADIE8pAwAgYykDACAGQv////8PgyAGQiCIfnyFIgZC8J+AgID+A4MiB6dqIkApAwAgBkL/////D4MgBkIgiH58IAQgB0IgiKdqIkIpAwCFIgc3AwAgQyBCKQMIIEApAwggHyAOICYgJyAuIC8gNiA3ID4gPyAKIBWFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIg43AwggQyADIB0gHiAIQv////8PgyAIQiCIfnyFIghC8J+AgID+A4MiBqdqIkApAwAgCEL/////D4MgCEIgiH58IAQgBkIgiKdqIkIpAwCFIgo3AxAgQyBCKQMIIEApAwggCyAcICQgJSAsIC0gNCA1IDwgPSAQIBKFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIhI3AxggQyADIBogGyAFQv////8PgyAFQiCIfnyFIgVC8J+AgID+A4MiCKdqIkApAwAgBUL/////D4MgBUIgiH58IAQgCEIgiKdqIkIpAwCFIgY3AyAgQyBCKQMIIEApAwggDCAZICIgIyAqICsgMiAzIDogOyARIBOFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgg3AyggQyADIBcgGCAJQv////8PgyAJQiCIfnyFIglC8J+AgID+A4MiBadqIkApAwAgCUL/////D4MgCUIgiH58IAQgBUIgiKdqIkIpAwCFIgU3AzAgQyBCKQMIIEApAwggDSAWICAgISAoICkgMCAxIDggOSAPIBSFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIgk3AzggAiBkT0UEQCBBIAk3AzggQSAFNwMwIEEgCDcDKCBBIAY3AyAgQSASNwMYIEEgCjcDECBBIA43AwggQSAHNwMAIAJBAmohAgwBCwsgQyBBQQQQBCBDKAIAIENBQGskAAuRFAIJfhB/IwBBQGoiDyQAAkAgA0UEQCMAQUBqIgIkACAAKQN4IQkgACkDcCEFIAApA2ghCiAAKQNgIQYgACkDWCELIAApA1AhByAAKQNIIQwgAiAAKQNAIgggACkDAIU3AwAgAiAMIAApAwiFNwMIIAIgByAAKQMQhTcDECACIAsgACkDGIU3AxggAiAGIAApAyCFNwMgIAIgCiAAKQMohTcDKCACIAUgACkDMIU3AzAgAiAJIAApAziFNwM4IAIgAUEEEAQgAiAIIAIpAwCFNwMAIAIgDCACKQMIhTcDCCACIAcgAikDEIU3AxAgAiALIAIpAxiFNwMYIAIgBiACKQMghTcDICACIAogAikDKIU3AyggAiAFIAIpAzCFNwMwIAIgCSACKQM4hTcDOCACIAFBQGtBBBAEIAJBQGskAAwBCyADKAIEIQ0gAygCACEDIAAgAkEBdEEBayIbQQZ0aiICKQM4IQkgAikDMCEFIAIpAyghCiACKQMgIQYgAikDGCELIAIpAxAhByACKQMIIQwgAikDACEIA0AgAyADIAMgAyADIAMgACAaQQZ0IhxqIgIpAzAgBYUiBULwn4CAgP4DgyIEp2oiDikDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiECkDAIUiBULwn4CAgP4DgyIEp2oiESkDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiEikDAIUiBULwn4CAgP4DgyIEp2oiEykDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiFCkDAIUiBULwn4CAgP4DgyIEp2oiFSkDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiFikDAIUiBULwn4CAgP4DgyIEp2oiFykDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiGCkDAIUiBULwn4CAgP4DgyIEp2oiGSkDCCAYKQMIIBcpAwggFikDCCAVKQMIIBQpAwggEykDCCASKQMIIBEpAwggECkDCCAOKQMIIAIpAzggCYUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fCANIARCIIinaiIOKQMIhSEJIA4pAwAgGSkDACAFQv////8PgyAFQiCIfnyFIQUgAyADIAMgAyADIAMgAikDICAGhSIGQvCfgICA/gODIgSnaiIOKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIQKQMAhSIGQvCfgICA/gODIgSnaiIRKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiISKQMAhSIGQvCfgICA/gODIgSnaiITKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIUKQMAhSIGQvCfgICA/gODIgSnaiIVKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIWKQMAhSIGQvCfgICA/gODIgSnaiIXKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIYKQMAhSIGQvCfgICA/gODIgSnaiIZKQMIIBgpAwggFykDCCAWKQMIIBUpAwggFCkDCCATKQMIIBIpAwggESkDCCAQKQMIIA4pAwggAikDKCAKhSIKQiCIIApC/////w+DfnyFIgpCIIggCkL/////D4N+fIUiCkIgiCAKQv////8Pg358hSIKQiCIIApC/////w+DfnyFIgpCIIggCkL/////D4N+fIUiCkIgiCAKQv////8Pg358IA0gBEIgiKdqIg4pAwiFIQogDikDACAZKQMAIAZC/////w+DIAZCIIh+fIUhBiADIAMgAyADIAMgAyACKQMQIAeFIgdC8J+AgID+A4MiBKdqIg4pAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhApAwCFIgdC8J+AgID+A4MiBKdqIhEpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhIpAwCFIgdC8J+AgID+A4MiBKdqIhMpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhQpAwCFIgdC8J+AgID+A4MiBKdqIhUpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhYpAwCFIgdC8J+AgID+A4MiBKdqIhcpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhgpAwCFIgdC8J+AgID+A4MiBKdqIhkpAwggGCkDCCAXKQMIIBYpAwggFSkDCCAUKQMIIBMpAwggEikDCCARKQMIIBApAwggDikDCCACKQMYIAuFIgtCIIggC0L/////D4N+fIUiC0IgiCALQv////8Pg358hSILQiCIIAtC/////w+DfnyFIgtCIIggC0L/////D4N+fIUiC0IgiCALQv////8Pg358hSILQiCIIAtC/////w+DfnwgDSAEQiCIp2oiDikDCIUhCyAOKQMAIBkpAwAgB0L/////D4MgB0IgiH58hSEHIAMgAyADIAMgAyADIAIpAwAgCIUiCELwn4CAgP4DgyIEp2oiDikDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiECkDAIUiCELwn4CAgP4DgyIEp2oiESkDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiEikDAIUiCELwn4CAgP4DgyIEp2oiEykDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiFCkDAIUiCELwn4CAgP4DgyIEp2oiFSkDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiFikDAIUiCELwn4CAgP4DgyIEp2oiFykDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiGCkDAIUiCELwn4CAgP4DgyIEp2oiGSkDCCAYKQMIIBcpAwggFikDCCAVKQMIIBQpAwggEykDCCASKQMIIBEpAwggECkDCCAOKQMIIAIpAwggDIUiDEIgiCAMQv////8Pg358hSIMQiCIIAxC/////w+DfnyFIgxCIIggDEL/////D4N+fIUiDEIgiCAMQv////8Pg358hSIMQiCIIAxC/////w+DfnyFIgxCIIggDEL/////D4N+fCANIARCIIinaiICKQMIhSEMIAIpAwAgGSkDACAIQv////8PgyAIQiCIfnyFIQggGiAbRwRAIAEgHGoiAiAJNwM4IAIgBTcDMCACIAo3AyggAiAGNwMgIAIgCzcDGCACIAc3AxAgAiAMNwMIIAIgCDcDACAaQQFqIRoMAQsLIA8gCTcDOCAPIAU3AzAgDyAKNwMoIA8gBjcDICAPIAs3AxggDyAHNwMQIA8gDDcDCCAPIAg3AwAgDyABIBtBBnRqQQQQBAsgD0FAayQAC80dAhB+C38jAEFAaiIUJAAgAygCDCEcIAMoAgghGiADKAIEIRUgAygCACEZIAEgAkEHdEFAaiIbaiIXKQM4IAAgG2oiGykDOIUhBCAXKQMwIBspAzCFIQUgFykDKCAbKQMohSEG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FCADQQA2AhAgA0EANgIMIAdBEGtBADYCACAHQRRrQQA2AgAgB0EYa0EANgIAIAdBHGtBADYCACAKIANBBHFBGHIiCmsiB0EgSQ0AIAMgCmohAwNAIANCADcDGCADQgA3AxAgA0IANwMIIANCADcDACADQSBqIQMgB0EgayIHQR9LDQALCyAEIAZqIgMgBDYCACADQoGAgIBwNwMIIANBAzYCICADQgA3AxggA0EiNgIQIAMgDDYCBCADQdALKAIANgIkQdALIAM2AgAgAygCAAVBUAsiAyADQUFGGyIDQYFgTwR/QcgLQQAgA2s2AgBBfwUgAwsLIgNBACADQX9HGyIENgIAQbgLIAQ2AgBBxAsgDEEAIAQbIgY2AgBBwAsgBjYCACAERQ0BCyACIAMgDWoiByARaiIEIBJqIgw2AiwgAiAMQRBBCEELIBAbIgp0ajYCMCAAIAEgAhAXIA5BBUYEQCACIAAgASADIA0QDCACIAMpABg3AxggAiADKQAQNwMQIAIgAykACDcDCCACIAMpAAA3AwAgA0EBIAIoAjxBB3YgAigCLCAEQQAQGCADIAUgCSAHIAQgAkEsaiIAEBggAyAFIAkgCUECakEDbiIBQf7/P3EiBiAHIAQgABAUIAYgAUEBakH+//8AcUkEQCADIAUgCUECIAcgBCAAEBQLIAIgAyANIAhBIBAMIAtFDQIgCEEgIAsgDyACEBYgAkEgIAgQFwwCC0EAIQYgAkEANgI4IAIgDEEgIAp0ajYCNCACIAsgACALGyAPQQAgCxsgA0GAARAMIAIgAykAGDcDGCACIAMpABA3AxAgAiADKQAINwMIIAIgAykAADcDACADQQEgAigCPEEHdiACKAIsIARBABASIAMgBSAJIAcgBCACQSxqEBIgBUEBdCELIAQgBUEHdGohACAJQQJqQQNuQQFqA0AgACADIAZBBnQiDmoiASgAACIPNgIAIAAgASgABDYCBCAAIAEoAAg2AgggACABKAAMNgIMIAAgASgAECIKNgIQIAAgASgAFCIQNgIUIAAgASgAGDYCGCAAIAEoABw2AhwgACABKAAgIhE2AiAgACABKAAkIhI2AiQgACABKAAoIhM2AiggACABKAAsNgIsIAAgASgAMCIUNgIwIAAgASgANCIVNgI0IAAgASgAOCIWNgI4IAAgASgAPCIXNgI8IAQgDmoiASAKrSASrUIghoQ3AxAgASAPrSAQrUIghoQ3AwAgASATrSAXrUIghoQ3AwggADUCDCEYIAEgEa0gFa1CIIaENwMgIAEgFq0gGEIghoQ3AxggASAANQIIIAA1AhxCIIaENwMoIAEgFK0gADUCBEIghoQ3AzAgASAANQIYIAA1AixCIIaENwM4IAZBAWoiBiALRw0ACyAJQQFrIQFB/v//AHEhBiAEIA1qQUBqKAIAIQkDQCAEIAcgBCAHIAEgCXEgC2xBBnRqIAUgAkEsaiIJEBEgAXEgC2xBBnRqIAUgCRARIQkgBkECayIGDQALQQAhBgNAIAAgBCAGQQZ0IgVqIgEoAgA2AAAgACABKAIENgAEIAAgASgCCDYACCAAIAEoAgw2AAwgACABKAIQNgAQIAAgASgCFDYAFCAAIAEoAhg2ABggACABKAIcNgAcIAAgASgCIDYAICAAIAEoAiQ2ACQgACABKAIoNgAoIAAgASgCLDYALCAAIAEoAjA2ADAgACABKAI0Igk2ADQgACABKAI4NgA4IAAgASgCPDYAPCADIAVqIgEgACkDAD4CACABIAk2AgQgASAAKQMoPgIIIAEgADUCHD4CDCABIAApAxA+AhAgASAANQIEPgIUIAEgACkDOD4CGCABIAA1Aiw+AhwgASAAKQMgPgIgIAEgADUCFD4CJCABIAApAwg+AiggASAANQI8PgIsIAEgACkDMD4CMCABIAA1AiQ+AjQgASAAKQMYPgI4IAEgADUCDD4CPCAGQQFqIgYgC0cNAAsgB0FAakHAACACQSAgCBAWDAELIAhCfzcAACAIQn83ABggCEJ/NwAQIAhCfzcACAsgAkFAayQAIAhBQGskACAICwuFAwQAQYAIC2dn5glqha5nu3Lzbjw69U+lf1IOUYxoBZur2YMfGc3gWy4uL3llc3Bvd2VyLWMvc2hhMjU2LmMAUEJLREYyX1NIQTI1NgBka0xlbiA8PSAzMiAqIChzaXplX3QpKFVJTlQzMl9NQVgpAEHwCAsBgABBsAkLgAKYL4pCkUQ3cc/7wLWl27XpW8JWOfER8Vmkgj+S1V4cq5iqB9gBW4MSvoUxJMN9DFV0Xb5y/rHegKcG3Jt08ZvBwWmb5IZHvu/GncEPzKEMJG8s6S2qhHRK3KmwXNqI+XZSUT6YbcYxqMgnA7DHf1m/8wvgxkeRp9VRY8oGZykpFIUKtyc4IRsu/G0sTRMNOFNUcwpluwpqdi7JwoGFLHKSoei/oktmGqhwi0vCo1FsxxnoktEkBpnWhTUO9HCgahAWwaQZCGw3Hkx3SCe1vLA0swwcOUqq2E5Pypxb828uaO6Cj3RvY6V4FHjIhAgCx4z6/76Q62xQpPej+b7yeHHGAEGwCwsD0AcB";

;// ./src/utils.ts

function bytesToBase64(bytes) {
  return btoa(bytes.reduce((data, byte) => data + String.fromCharCode(byte), ""));
}
function base64ToBytes(base64) {
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}
function bytesToHex(bytes) {
  return "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function hexToBytes(hexStr) {
  if (hexStr.startsWith("0x")) {
    hexStr = hexStr.replace("0x", "");
  }
  if (hexStr.length % 2 !== 0) {
    hexStr = "0" + hexStr;
  }
  return Uint8Array.from(hexStr.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));
}

// EXTERNAL MODULE: ./src/yespower_wasm.js
var yespower_wasm = __nested_webpack_require_24040__(561);
var yespower_wasm_default = /*#__PURE__*/__nested_webpack_require_24040__.n(yespower_wasm);
;// ./src/index.ts





class Yespower {
  nByte;
  Module;
  yespower_wasm;
  constructor(Module) {
    this.nByte = 1;
    this.Module = Module;
    this.yespower_wasm = this.Module.cwrap("yespower_wasm", void 0, [
      "number",
      "number",
      "number",
      "number",
      "string",
      "number"
    ]);
  }
  static async init() {
    if (typeof globalThis.WebAssembly === "undefined") {
      throw new Error("WebAssembly is not enabled with this browser");
    }
    const wasmBinary = base64ToBytes(bundled);
    const module = await yespower_wasm_default()({
      wasmBinary,
      locateFile: (file) => file
    });
    return new Yespower(module);
  }
  // https://stackoverflow.com/questions/41875728/pass-a-javascript-array-as-argument-to-a-webassembly-function
  // Takes an Uint8Array, copies it to the heap and returns a pointer
  arrayToPtr(array) {
    const ptr = this.Module._malloc(array.length * this.nByte);
    this.Module.HEAPU8.set(array, ptr / this.nByte);
    return ptr;
  }
  // Takes a pointer and  array length, and returns a Uint8Array from the heap
  ptrToArray(ptr, length) {
    const array = new Uint8Array(length);
    const pos = ptr / this.nByte;
    array.set(this.Module.HEAPU8.subarray(pos, pos + length));
    return array;
  }
  freePtr(ptr) {
    this.Module._free(ptr);
  }
  Hash(input, N = 2048, r = 32, pers = "") {
    const inputPtr = this.arrayToPtr(input);
    const ptr = this.yespower_wasm(inputPtr, input.length, N, r, pers, pers.length);
    const hash = this.ptrToArray(ptr, 32);
    this.freePtr(inputPtr);
    this.freePtr(ptr);
    return hash;
  }
}

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __nested_webpack_exports__) __webpack_export_target__[__webpack_i__] = __nested_webpack_exports__[__webpack_i__];
if(__nested_webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;

/***/ }),

/***/ 5019:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { InvalidArgumentError } = __webpack_require__(3666);

class Option {
  /**
   * Initialize a new `Option` with the given `flags` and `description`.
   *
   * @param {string} flags
   * @param {string} [description]
   */

  constructor(flags, description) {
    this.flags = flags;
    this.description = description || '';

    this.required = flags.includes('<'); // A value must be supplied when the option is specified.
    this.optional = flags.includes('['); // A value is optional when the option is specified.
    // variadic test ignores <value,...> et al which might be used to describe custom splitting of single argument
    this.variadic = /\w\.\.\.[>\]]$/.test(flags); // The option can take multiple values.
    this.mandatory = false; // The option must have a value after parsing, which usually means it must be specified on command line.
    const optionFlags = splitOptionFlags(flags);
    this.short = optionFlags.shortFlag; // May be a short flag, undefined, or even a long flag (if option has two long flags).
    this.long = optionFlags.longFlag;
    this.negate = false;
    if (this.long) {
      this.negate = this.long.startsWith('--no-');
    }
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.presetArg = undefined;
    this.envVar = undefined;
    this.parseArg = undefined;
    this.hidden = false;
    this.argChoices = undefined;
    this.conflictsWith = [];
    this.implied = undefined;
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Option}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Preset to use when option used without option-argument, especially optional but also boolean and negated.
   * The custom processing (parseArg) is called.
   *
   * @example
   * new Option('--color').default('GREYSCALE').preset('RGB');
   * new Option('--donate [amount]').preset('20').argParser(parseFloat);
   *
   * @param {*} arg
   * @return {Option}
   */

  preset(arg) {
    this.presetArg = arg;
    return this;
  }

  /**
   * Add option name(s) that conflict with this option.
   * An error will be displayed if conflicting options are found during parsing.
   *
   * @example
   * new Option('--rgb').conflicts('cmyk');
   * new Option('--js').conflicts(['ts', 'jsx']);
   *
   * @param {(string | string[])} names
   * @return {Option}
   */

  conflicts(names) {
    this.conflictsWith = this.conflictsWith.concat(names);
    return this;
  }

  /**
   * Specify implied option values for when this option is set and the implied options are not.
   *
   * The custom processing (parseArg) is not called on the implied values.
   *
   * @example
   * program
   *   .addOption(new Option('--log', 'write logging information to file'))
   *   .addOption(new Option('--trace', 'log extra details').implies({ log: 'trace.txt' }));
   *
   * @param {object} impliedOptionValues
   * @return {Option}
   */
  implies(impliedOptionValues) {
    let newImplied = impliedOptionValues;
    if (typeof impliedOptionValues === 'string') {
      // string is not documented, but easy mistake and we can do what user probably intended.
      newImplied = { [impliedOptionValues]: true };
    }
    this.implied = Object.assign(this.implied || {}, newImplied);
    return this;
  }

  /**
   * Set environment variable to check for option value.
   *
   * An environment variable is only used if when processed the current option value is
   * undefined, or the source of the current value is 'default' or 'config' or 'env'.
   *
   * @param {string} name
   * @return {Option}
   */

  env(name) {
    this.envVar = name;
    return this;
  }

  /**
   * Set the custom handler for processing CLI option arguments into option values.
   *
   * @param {Function} [fn]
   * @return {Option}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Whether the option is mandatory and must have a value after parsing.
   *
   * @param {boolean} [mandatory=true]
   * @return {Option}
   */

  makeOptionMandatory(mandatory = true) {
    this.mandatory = !!mandatory;
    return this;
  }

  /**
   * Hide option in help.
   *
   * @param {boolean} [hide=true]
   * @return {Option}
   */

  hideHelp(hide = true) {
    this.hidden = !!hide;
    return this;
  }

  /**
   * @package
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Only allow option value to be one of choices.
   *
   * @param {string[]} values
   * @return {Option}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(', ')}.`,
        );
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Return option name.
   *
   * @return {string}
   */

  name() {
    if (this.long) {
      return this.long.replace(/^--/, '');
    }
    return this.short.replace(/^-/, '');
  }

  /**
   * Return option name, in a camelcase format that can be used
   * as an object attribute key.
   *
   * @return {string}
   */

  attributeName() {
    if (this.negate) {
      return camelcase(this.name().replace(/^no-/, ''));
    }
    return camelcase(this.name());
  }

  /**
   * Check if `arg` matches the short or long flag.
   *
   * @param {string} arg
   * @return {boolean}
   * @package
   */

  is(arg) {
    return this.short === arg || this.long === arg;
  }

  /**
   * Return whether a boolean option.
   *
   * Options are one of boolean, negated, required argument, or optional argument.
   *
   * @return {boolean}
   * @package
   */

  isBoolean() {
    return !this.required && !this.optional && !this.negate;
  }
}

/**
 * This class is to make it easier to work with dual options, without changing the existing
 * implementation. We support separate dual options for separate positive and negative options,
 * like `--build` and `--no-build`, which share a single option value. This works nicely for some
 * use cases, but is tricky for others where we want separate behaviours despite
 * the single shared option value.
 */
class DualOptions {
  /**
   * @param {Option[]} options
   */
  constructor(options) {
    this.positiveOptions = new Map();
    this.negativeOptions = new Map();
    this.dualOptions = new Set();
    options.forEach((option) => {
      if (option.negate) {
        this.negativeOptions.set(option.attributeName(), option);
      } else {
        this.positiveOptions.set(option.attributeName(), option);
      }
    });
    this.negativeOptions.forEach((value, key) => {
      if (this.positiveOptions.has(key)) {
        this.dualOptions.add(key);
      }
    });
  }

  /**
   * Did the value come from the option, and not from possible matching dual option?
   *
   * @param {*} value
   * @param {Option} option
   * @returns {boolean}
   */
  valueFromOption(value, option) {
    const optionKey = option.attributeName();
    if (!this.dualOptions.has(optionKey)) return true;

    // Use the value to deduce if (probably) came from the option.
    const preset = this.negativeOptions.get(optionKey).presetArg;
    const negativeValue = preset !== undefined ? preset : false;
    return option.negate === (negativeValue === value);
  }
}

/**
 * Convert string from kebab-case to camelCase.
 *
 * @param {string} str
 * @return {string}
 * @private
 */

function camelcase(str) {
  return str.split('-').reduce((str, word) => {
    return str + word[0].toUpperCase() + word.slice(1);
  });
}

/**
 * Split the short and long flag out of something like '-m,--mixed <value>'
 *
 * @private
 */

function splitOptionFlags(flags) {
  let shortFlag;
  let longFlag;
  // short flag, single dash and single character
  const shortFlagExp = /^-[^-]$/;
  // long flag, double dash and at least one character
  const longFlagExp = /^--[^-]/;

  const flagParts = flags.split(/[ |,]+/).concat('guard');
  // Normal is short and/or long.
  if (shortFlagExp.test(flagParts[0])) shortFlag = flagParts.shift();
  if (longFlagExp.test(flagParts[0])) longFlag = flagParts.shift();
  // Long then short. Rarely used but fine.
  if (!shortFlag && shortFlagExp.test(flagParts[0]))
    shortFlag = flagParts.shift();
  // Allow two long flags, like '--ws, --workspace'
  // This is the supported way to have a shortish option flag.
  if (!shortFlag && longFlagExp.test(flagParts[0])) {
    shortFlag = longFlag;
    longFlag = flagParts.shift();
  }

  // Check for unprocessed flag. Fail noisily rather than silently ignore.
  if (flagParts[0].startsWith('-')) {
    const unsupportedFlag = flagParts[0];
    const baseError = `option creation failed due to '${unsupportedFlag}' in option flags '${flags}'`;
    if (/^-[^-][^-]/.test(unsupportedFlag))
      throw new Error(
        `${baseError}
- a short flag is a single dash and a single character
  - either use a single dash and a single character (for a short flag)
  - or use a double dash for a long option (and can have two, like '--ws, --workspace')`,
      );
    if (shortFlagExp.test(unsupportedFlag))
      throw new Error(`${baseError}
- too many short flags`);
    if (longFlagExp.test(unsupportedFlag))
      throw new Error(`${baseError}
- too many long flags`);

    throw new Error(`${baseError}
- unrecognised flag format`);
  }
  if (shortFlag === undefined && longFlag === undefined)
    throw new Error(
      `option creation failed due to no flags found in '${flags}'.`,
    );

  return { shortFlag, longFlag };
}

exports.Option = Option;
exports.DualOptions = DualOptions;


/***/ }),

/***/ 5408:
/***/ ((module) => {

// please no
module['exports'] = function zalgo(text, options) {
  text = text || '   he is here   ';
  var soul = {
    'up': [
      '̍', '̎', '̄', '̅',
      '̿', '̑', '̆', '̐',
      '͒', '͗', '͑', '̇',
      '̈', '̊', '͂', '̓',
      '̈', '͊', '͋', '͌',
      '̃', '̂', '̌', '͐',
      '̀', '́', '̋', '̏',
      '̒', '̓', '̔', '̽',
      '̉', 'ͣ', 'ͤ', 'ͥ',
      'ͦ', 'ͧ', 'ͨ', 'ͩ',
      'ͪ', 'ͫ', 'ͬ', 'ͭ',
      'ͮ', 'ͯ', '̾', '͛',
      '͆', '̚',
    ],
    'down': [
      '̖', '̗', '̘', '̙',
      '̜', '̝', '̞', '̟',
      '̠', '̤', '̥', '̦',
      '̩', '̪', '̫', '̬',
      '̭', '̮', '̯', '̰',
      '̱', '̲', '̳', '̹',
      '̺', '̻', '̼', 'ͅ',
      '͇', '͈', '͉', '͍',
      '͎', '͓', '͔', '͕',
      '͖', '͙', '͚', '̣',
    ],
    'mid': [
      '̕', '̛', '̀', '́',
      '͘', '̡', '̢', '̧',
      '̨', '̴', '̵', '̶',
      '͜', '͝', '͞',
      '͟', '͠', '͢', '̸',
      '̷', '͡', ' ҉',
    ],
  };
  var all = [].concat(soul.up, soul.down, soul.mid);

  function randomNumber(range) {
    var r = Math.floor(Math.random() * range);
    return r;
  }

  function isChar(character) {
    var bool = false;
    all.filter(function(i) {
      bool = (i === character);
    });
    return bool;
  }


  function heComes(text, options) {
    var result = '';
    var counts;
    var l;
    options = options || {};
    options['up'] =
      typeof options['up'] !== 'undefined' ? options['up'] : true;
    options['mid'] =
      typeof options['mid'] !== 'undefined' ? options['mid'] : true;
    options['down'] =
      typeof options['down'] !== 'undefined' ? options['down'] : true;
    options['size'] =
      typeof options['size'] !== 'undefined' ? options['size'] : 'maxi';
    text = text.split('');
    for (l in text) {
      if (isChar(l)) {
        continue;
      }
      result = result + text[l];
      counts = {'up': 0, 'down': 0, 'mid': 0};
      switch (options.size) {
        case 'mini':
          counts.up = randomNumber(8);
          counts.mid = randomNumber(2);
          counts.down = randomNumber(8);
          break;
        case 'maxi':
          counts.up = randomNumber(16) + 3;
          counts.mid = randomNumber(4) + 1;
          counts.down = randomNumber(64) + 3;
          break;
        default:
          counts.up = randomNumber(8) + 1;
          counts.mid = randomNumber(6) / 2;
          counts.down = randomNumber(8) + 1;
          break;
      }

      var arr = ['up', 'mid', 'down'];
      for (var d in arr) {
        var index = arr[d];
        for (var i = 0; i <= counts[index]; i++) {
          if (options[index]) {
            result = result + soul[index][randomNumber(soul[index].length)];
          }
        }
      }
    }
    return result;
  }
  // don't summon him
  return heComes(text, options);
};



/***/ }),

/***/ 5692:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 5722:
/***/ ((module) => {

module['exports'] = function runTheTrap(text, options) {
  var result = '';
  text = text || 'Run the trap, drop the bass';
  text = text.split('');
  var trap = {
    a: ['\u0040', '\u0104', '\u023a', '\u0245', '\u0394', '\u039b', '\u0414'],
    b: ['\u00df', '\u0181', '\u0243', '\u026e', '\u03b2', '\u0e3f'],
    c: ['\u00a9', '\u023b', '\u03fe'],
    d: ['\u00d0', '\u018a', '\u0500', '\u0501', '\u0502', '\u0503'],
    e: ['\u00cb', '\u0115', '\u018e', '\u0258', '\u03a3', '\u03be', '\u04bc',
      '\u0a6c'],
    f: ['\u04fa'],
    g: ['\u0262'],
    h: ['\u0126', '\u0195', '\u04a2', '\u04ba', '\u04c7', '\u050a'],
    i: ['\u0f0f'],
    j: ['\u0134'],
    k: ['\u0138', '\u04a0', '\u04c3', '\u051e'],
    l: ['\u0139'],
    m: ['\u028d', '\u04cd', '\u04ce', '\u0520', '\u0521', '\u0d69'],
    n: ['\u00d1', '\u014b', '\u019d', '\u0376', '\u03a0', '\u048a'],
    o: ['\u00d8', '\u00f5', '\u00f8', '\u01fe', '\u0298', '\u047a', '\u05dd',
      '\u06dd', '\u0e4f'],
    p: ['\u01f7', '\u048e'],
    q: ['\u09cd'],
    r: ['\u00ae', '\u01a6', '\u0210', '\u024c', '\u0280', '\u042f'],
    s: ['\u00a7', '\u03de', '\u03df', '\u03e8'],
    t: ['\u0141', '\u0166', '\u0373'],
    u: ['\u01b1', '\u054d'],
    v: ['\u05d8'],
    w: ['\u0428', '\u0460', '\u047c', '\u0d70'],
    x: ['\u04b2', '\u04fe', '\u04fc', '\u04fd'],
    y: ['\u00a5', '\u04b0', '\u04cb'],
    z: ['\u01b5', '\u0240'],
  };
  text.forEach(function(c) {
    c = c.toLowerCase();
    var chars = trap[c] || [' '];
    var rand = Math.floor(Math.random() * chars.length);
    if (typeof trap[c] !== 'undefined') {
      result += trap[c][rand];
    } else {
      result += c;
    }
  });
  return result;
};


/***/ }),

/***/ 5880:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { isUtf8 } = __webpack_require__(181);

const { hasBlob } = __webpack_require__(2614);

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // Overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Determines whether a value is a `Blob`.
 *
 * @param {*} value The value to be tested
 * @return {Boolean} `true` if `value` is a `Blob`, else `false`
 * @private
 */
function isBlob(value) {
  return (
    hasBlob &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.type === 'string' &&
    typeof value.stream === 'function' &&
    (value[Symbol.toStringTag] === 'Blob' ||
      value[Symbol.toStringTag] === 'File')
  );
}

module.exports = {
  isBlob,
  isValidStatusCode,
  isValidUTF8: _isValidUTF8,
  tokenChars
};

if (isUtf8) {
  module.exports.isValidUTF8 = function (buf) {
    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
  };
} /* istanbul ignore else  */ else if (!process.env.WS_NO_UTF_8_VALIDATE) {
  try {
    const isValidUTF8 = __webpack_require__(Object(function webpackMissingModule() { var e = new Error("Cannot find module 'utf-8-validate'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()));

    module.exports.isValidUTF8 = function (buf) {
      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
    };
  } catch (e) {
    // Continue regardless of the error.
  }
}


/***/ }),

/***/ 5926:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { tokenChars } = __webpack_require__(5880);

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse(header) {
  const offers = Object.create(null);
  let params = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let code = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (
        i !== 0 &&
        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
      ) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

module.exports = { format, parse };


/***/ }),

/***/ 6120:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var colors = __webpack_require__(4189);

module['exports'] = function() {
  //
  // Extends prototype of native string object to allow for "foo".red syntax
  //
  var addProperty = function(color, func) {
    String.prototype.__defineGetter__(color, func);
  };

  addProperty('strip', function() {
    return colors.strip(this);
  });

  addProperty('stripColors', function() {
    return colors.strip(this);
  });

  addProperty('trap', function() {
    return colors.trap(this);
  });

  addProperty('zalgo', function() {
    return colors.zalgo(this);
  });

  addProperty('zebra', function() {
    return colors.zebra(this);
  });

  addProperty('rainbow', function() {
    return colors.rainbow(this);
  });

  addProperty('random', function() {
    return colors.random(this);
  });

  addProperty('america', function() {
    return colors.america(this);
  });

  //
  // Iterate through all default styles and colors
  //
  var x = Object.keys(colors.styles);
  x.forEach(function(style) {
    addProperty(style, function() {
      return colors.stylize(this, style);
    });
  });

  function applyTheme(theme) {
    //
    // Remark: This is a list of methods that exist
    // on String that you should not overwrite.
    //
    var stringPrototypeBlacklist = [
      '__defineGetter__', '__defineSetter__', '__lookupGetter__',
      '__lookupSetter__', 'charAt', 'constructor', 'hasOwnProperty',
      'isPrototypeOf', 'propertyIsEnumerable', 'toLocaleString', 'toString',
      'valueOf', 'charCodeAt', 'indexOf', 'lastIndexOf', 'length',
      'localeCompare', 'match', 'repeat', 'replace', 'search', 'slice',
      'split', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase',
      'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight',
    ];

    Object.keys(theme).forEach(function(prop) {
      if (stringPrototypeBlacklist.indexOf(prop) !== -1) {
        console.log('warn: '.red + ('String.prototype' + prop).magenta +
          ' is probably something you don\'t want to override.  ' +
          'Ignoring style name');
      } else {
        if (typeof(theme[prop]) === 'string') {
          colors[prop] = colors[theme[prop]];
          addProperty(prop, function() {
            return colors[prop](this);
          });
        } else {
          var themePropApplicator = function(str) {
            var ret = str || this;
            for (var t = 0; t < theme[prop].length; t++) {
              ret = colors[theme[prop][t]](ret);
            }
            return ret;
          };
          addProperty(prop, themePropApplicator);
          colors[prop] = function(str) {
            return themePropApplicator(str);
          };
        }
      }
    });
  }

  colors.setTheme = function(theme) {
    if (typeof theme === 'string') {
      console.log('colors.setTheme now only accepts an object, not a string. ' +
        'If you are trying to set a theme from a file, it is now your (the ' +
        'caller\'s) responsibility to require the file.  The old syntax ' +
        'looked like colors.setTheme(__dirname + ' +
        '\'/../themes/generic-logging.js\'); The new syntax looks like '+
        'colors.setTheme(require(__dirname + ' +
        '\'/../themes/generic-logging.js\'));');
      return;
    } else {
      applyTheme(theme);
    }
  };
};


/***/ }),

/***/ 6239:
/***/ ((module) => {

module['exports'] = function(colors) {
  // RoY G BiV
  var rainbowColors = ['red', 'yellow', 'green', 'blue', 'magenta'];
  return function(letter, i, exploded) {
    if (letter === ' ') {
      return letter;
    } else {
      return colors[rainbowColors[i++ % rainbowColors.length]](letter);
    }
  };
};



/***/ }),

/***/ 6286:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { Writable } = __webpack_require__(2203);

const PerMessageDeflate = __webpack_require__(2971);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = __webpack_require__(2614);
const { concat, toArrayBuffer, unmask } = __webpack_require__(3338);
const { isValidStatusCode, isValidUTF8 } = __webpack_require__(5880);

const FastBuffer = Buffer[Symbol.species];

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;
const DEFER_EVENT = 6;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
class Receiver extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
   *     multiple times in the same tick
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(options = {}) {
    super();

    this._allowSynchronousEvents =
      options.allowSynchronousEvents !== undefined
        ? options.allowSynchronousEvents
        : true;
    this._binaryType = options.binaryType || BINARY_TYPES[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket] = undefined;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._errored = false;
    this._loop = false;
    this._state = GET_INFO;
  }

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = new FastBuffer(
        buf.buffer,
        buf.byteOffset + n,
        buf.length - n
      );

      return new FastBuffer(buf.buffer, buf.byteOffset, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = new FastBuffer(
          buf.buffer,
          buf.byteOffset + n,
          buf.length - n
        );
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          this.getInfo(cb);
          break;
        case GET_PAYLOAD_LENGTH_16:
          this.getPayloadLength16(cb);
          break;
        case GET_PAYLOAD_LENGTH_64:
          this.getPayloadLength64(cb);
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          this.getData(cb);
          break;
        case INFLATING:
        case DEFER_EVENT:
          this._loop = false;
          return;
      }
    } while (this._loop);

    if (!this._errored) cb();
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @param {Function} cb Callback
   * @private
   */
  getInfo(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      const error = this.createError(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );

      cb(error);
      return;
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {
      const error = this.createError(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );

      cb(error);
      return;
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        const error = this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );

        cb(error);
        return;
      }

      if (!this._fragmented) {
        const error = this.createError(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );

        cb(error);
        return;
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        const error = this.createError(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );

        cb(error);
        return;
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        const error = this.createError(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );

        cb(error);
        return;
      }

      if (compressed) {
        const error = this.createError(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );

        cb(error);
        return;
      }

      if (
        this._payloadLength > 0x7d ||
        (this._opcode === 0x08 && this._payloadLength === 1)
      ) {
        const error = this.createError(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );

        cb(error);
        return;
      }
    } else {
      const error = this.createError(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );

      cb(error);
      return;
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        const error = this.createError(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );

        cb(error);
        return;
      }
    } else if (this._masked) {
      const error = this.createError(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );

      cb(error);
      return;
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else this.haveLength(cb);
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength16(cb) {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    this.haveLength(cb);
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @param {Function} cb Callback
   * @private
   */
  getPayloadLength64(cb) {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      const error = this.createError(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );

      cb(error);
      return;
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    this.haveLength(cb);
  }

  /**
   * Payload length has been read.
   *
   * @param {Function} cb Callback
   * @private
   */
  haveLength(cb) {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        const error = this.createError(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );

        cb(error);
        return;
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);

      if (
        this._masked &&
        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
      ) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) {
      this.controlMessage(data, cb);
      return;
    }

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its length is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    this.dataMessage(cb);
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          const error = this.createError(
            RangeError,
            'Max payload size exceeded',
            false,
            1009,
            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
          );

          cb(error);
          return;
        }

        this._fragments.push(buf);
      }

      this.dataMessage(cb);
      if (this._state === GET_INFO) this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @param {Function} cb Callback
   * @private
   */
  dataMessage(cb) {
    if (!this._fin) {
      this._state = GET_INFO;
      return;
    }

    const messageLength = this._messageLength;
    const fragments = this._fragments;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragmented = 0;
    this._fragments = [];

    if (this._opcode === 2) {
      let data;

      if (this._binaryType === 'nodebuffer') {
        data = concat(fragments, messageLength);
      } else if (this._binaryType === 'arraybuffer') {
        data = toArrayBuffer(concat(fragments, messageLength));
      } else if (this._binaryType === 'blob') {
        data = new Blob(fragments);
      } else {
        data = fragments;
      }

      if (this._allowSynchronousEvents) {
        this.emit('message', data, true);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', data, true);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    } else {
      const buf = concat(fragments, messageLength);

      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
        const error = this.createError(
          Error,
          'invalid UTF-8 sequence',
          true,
          1007,
          'WS_ERR_INVALID_UTF8'
        );

        cb(error);
        return;
      }

      if (this._state === INFLATING || this._allowSynchronousEvents) {
        this.emit('message', buf, false);
        this._state = GET_INFO;
      } else {
        this._state = DEFER_EVENT;
        setImmediate(() => {
          this.emit('message', buf, false);
          this._state = GET_INFO;
          this.startLoop(cb);
        });
      }
    }
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data, cb) {
    if (this._opcode === 0x08) {
      if (data.length === 0) {
        this._loop = false;
        this.emit('conclude', 1005, EMPTY_BUFFER);
        this.end();
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode(code)) {
          const error = this.createError(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );

          cb(error);
          return;
        }

        const buf = new FastBuffer(
          data.buffer,
          data.byteOffset + 2,
          data.length - 2
        );

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          const error = this.createError(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );

          cb(error);
          return;
        }

        this._loop = false;
        this.emit('conclude', code, buf);
        this.end();
      }

      this._state = GET_INFO;
      return;
    }

    if (this._allowSynchronousEvents) {
      this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
      this._state = GET_INFO;
    } else {
      this._state = DEFER_EVENT;
      setImmediate(() => {
        this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);
        this._state = GET_INFO;
        this.startLoop(cb);
      });
    }
  }

  /**
   * Builds an error object.
   *
   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
   * @param {String} message The error message
   * @param {Boolean} prefix Specifies whether or not to add a default prefix to
   *     `message`
   * @param {Number} statusCode The status code
   * @param {String} errorCode The exposed error code
   * @return {(Error|RangeError)} The error
   * @private
   */
  createError(ErrorCtor, message, prefix, statusCode, errorCode) {
    this._loop = false;
    this._errored = true;

    const err = new ErrorCtor(
      prefix ? `Invalid WebSocket frame: ${message}` : message
    );

    Error.captureStackTrace(err, this.createError);
    err.code = errorCode;
    err[kStatusCode] = statusCode;
    return err;
  }
}

module.exports = Receiver;


/***/ }),

/***/ 6760:
/***/ ((module) => {

"use strict";
module.exports = require("node:path");

/***/ }),

/***/ 6928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 6982:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 7016:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 7369:
/***/ ((__unused_webpack_module, exports) => {

const maxDistance = 3;

function editDistance(a, b) {
  // https://en.wikipedia.org/wiki/Damerau–Levenshtein_distance
  // Calculating optimal string alignment distance, no substring is edited more than once.
  // (Simple implementation.)

  // Quick early exit, return worst case.
  if (Math.abs(a.length - b.length) > maxDistance)
    return Math.max(a.length, b.length);

  // distance between prefix substrings of a and b
  const d = [];

  // pure deletions turn a into empty string
  for (let i = 0; i <= a.length; i++) {
    d[i] = [i];
  }
  // pure insertions turn empty string into b
  for (let j = 0; j <= b.length; j++) {
    d[0][j] = j;
  }

  // fill matrix
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      let cost = 1;
      if (a[i - 1] === b[j - 1]) {
        cost = 0;
      } else {
        cost = 1;
      }
      d[i][j] = Math.min(
        d[i - 1][j] + 1, // deletion
        d[i][j - 1] + 1, // insertion
        d[i - 1][j - 1] + cost, // substitution
      );
      // transposition
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }

  return d[a.length][b.length];
}

/**
 * Find close matches, restricted to same number of edits.
 *
 * @param {string} word
 * @param {string[]} candidates
 * @returns {string}
 */

function suggestSimilar(word, candidates) {
  if (!candidates || candidates.length === 0) return '';
  // remove possible duplicates
  candidates = Array.from(new Set(candidates));

  const searchingOptions = word.startsWith('--');
  if (searchingOptions) {
    word = word.slice(2);
    candidates = candidates.map((candidate) => candidate.slice(2));
  }

  let similar = [];
  let bestDistance = maxDistance;
  const minSimilarity = 0.4;
  candidates.forEach((candidate) => {
    if (candidate.length <= 1) return; // no one character guesses

    const distance = editDistance(word, candidate);
    const length = Math.max(word.length, candidate.length);
    const similarity = (length - distance) / length;
    if (similarity > minSimilarity) {
      if (distance < bestDistance) {
        // better edit distance, throw away previous worse matches
        bestDistance = distance;
        similar = [candidate];
      } else if (distance === bestDistance) {
        similar.push(candidate);
      }
    }
  });

  similar.sort((a, b) => a.localeCompare(b));
  if (searchingOptions) {
    similar = similar.map((candidate) => `--${candidate}`);
  }

  if (similar.length > 1) {
    return `\n(Did you mean one of ${similar.join(', ')}?)`;
  }
  if (similar.length === 1) {
    return `\n(Did you mean ${similar[0]}?)`;
  }
  return '';
}

exports.suggestSimilar = suggestSimilar;


/***/ }),

/***/ 7699:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const WebSocket = __webpack_require__(1060);

WebSocket.createWebSocketStream = __webpack_require__(3719);
WebSocket.Server = __webpack_require__(1722);
WebSocket.Receiver = __webpack_require__(6286);
WebSocket.Sender = __webpack_require__(914);

WebSocket.WebSocket = WebSocket;
WebSocket.WebSocketServer = WebSocket.Server;

module.exports = WebSocket;


/***/ }),

/***/ 8237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { tokenChars } = __webpack_require__(5880);

/**
 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
 *
 * @param {String} header The field value of the header
 * @return {Set} The subprotocol names
 * @public
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (
      i !== 0 &&
      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
    ) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x2c /* ',' */) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, i);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

module.exports = { parse };


/***/ }),

/***/ 8474:
/***/ ((module) => {

"use strict";
module.exports = require("node:events");

/***/ }),

/***/ 8611:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 9023:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ }),

/***/ 9278:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 9297:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const { InvalidArgumentError } = __webpack_require__(3666);

class Argument {
  /**
   * Initialize a new command argument with the given name and description.
   * The default is that the argument is required, and you can explicitly
   * indicate this with <> around the name. Put [] around the name for an optional argument.
   *
   * @param {string} name
   * @param {string} [description]
   */

  constructor(name, description) {
    this.description = description || '';
    this.variadic = false;
    this.parseArg = undefined;
    this.defaultValue = undefined;
    this.defaultValueDescription = undefined;
    this.argChoices = undefined;

    switch (name[0]) {
      case '<': // e.g. <required>
        this.required = true;
        this._name = name.slice(1, -1);
        break;
      case '[': // e.g. [optional]
        this.required = false;
        this._name = name.slice(1, -1);
        break;
      default:
        this.required = true;
        this._name = name;
        break;
    }

    if (this._name.length > 3 && this._name.slice(-3) === '...') {
      this.variadic = true;
      this._name = this._name.slice(0, -3);
    }
  }

  /**
   * Return argument name.
   *
   * @return {string}
   */

  name() {
    return this._name;
  }

  /**
   * @package
   */

  _concatValue(value, previous) {
    if (previous === this.defaultValue || !Array.isArray(previous)) {
      return [value];
    }

    return previous.concat(value);
  }

  /**
   * Set the default value, and optionally supply the description to be displayed in the help.
   *
   * @param {*} value
   * @param {string} [description]
   * @return {Argument}
   */

  default(value, description) {
    this.defaultValue = value;
    this.defaultValueDescription = description;
    return this;
  }

  /**
   * Set the custom handler for processing CLI command arguments into argument values.
   *
   * @param {Function} [fn]
   * @return {Argument}
   */

  argParser(fn) {
    this.parseArg = fn;
    return this;
  }

  /**
   * Only allow argument value to be one of choices.
   *
   * @param {string[]} values
   * @return {Argument}
   */

  choices(values) {
    this.argChoices = values.slice();
    this.parseArg = (arg, previous) => {
      if (!this.argChoices.includes(arg)) {
        throw new InvalidArgumentError(
          `Allowed choices are ${this.argChoices.join(', ')}.`,
        );
      }
      if (this.variadic) {
        return this._concatValue(arg, previous);
      }
      return arg;
    };
    return this;
  }

  /**
   * Make argument required.
   *
   * @returns {Argument}
   */
  argRequired() {
    this.required = true;
    return this;
  }

  /**
   * Make argument optional.
   *
   * @returns {Argument}
   */
  argOptional() {
    this.required = false;
    return this;
  }
}

/**
 * Takes an argument and returns its human readable equivalent for help usage.
 *
 * @param {Argument} arg
 * @return {string}
 * @private
 */

function humanReadableArgName(arg) {
  const nameOutput = arg.name() + (arg.variadic === true ? '...' : '');

  return arg.required ? '<' + nameOutput + '>' : '[' + nameOutput + ']';
}

exports.Argument = Argument;
exports.humanReadableArgName = humanReadableArgName;


/***/ }),

/***/ 9896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

// EXTERNAL MODULE: external "os"
var external_os_ = __webpack_require__(857);
var external_os_default = /*#__PURE__*/__webpack_require__.n(external_os_);
// EXTERNAL MODULE: external "path"
var external_path_ = __webpack_require__(6928);
var external_path_default = /*#__PURE__*/__webpack_require__.n(external_path_);
// EXTERNAL MODULE: ./node_modules/commander/index.js
var commander = __webpack_require__(2116);
;// ./node_modules/commander/esm.mjs


// wrapper to provide named exports for ESM.
const {
  /* program */ "DM": program,
  /* createCommand */ "gu": createCommand,
  /* createArgument */ "er": createArgument,
  /* createOption */ "Ww": createOption,
  /* CommanderError */ "b7": CommanderError,
  /* InvalidArgumentError */ "Di": InvalidArgumentError,
  /* InvalidOptionArgumentError */ "a2": InvalidOptionArgumentError, // deprecated old name
  /* Command */ "uB": Command,
  /* Argument */ "ef": Argument,
  /* Option */ "c$": Option,
  /* Help */ "_V": Help,
} = commander;

// EXTERNAL MODULE: ./node_modules/@cpuchain/logger/lib/index.js
var lib = __webpack_require__(4669);
;// ./package.json
const package_namespaceObject = /*#__PURE__*/JSON.parse('{"UU":"yesminer","rE":"1.0.0","h_":"Node.js CPUchain Miner"}');
;// external "worker_threads"
const external_worker_threads_namespaceObject = require("worker_threads");
// EXTERNAL MODULE: external "crypto"
var external_crypto_ = __webpack_require__(6982);
// EXTERNAL MODULE: ./node_modules/yespower-wasm/lib/index.js
var yespower_wasm_lib = __webpack_require__(4912);
;// ./src/utils.ts



const isNode = !(process?.browser && window);
const ZeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000";
function toDiff(target) {
  return 2n ** 256n / BigInt(target);
}
function concatBytes(...arrays) {
  if (arrays.length === 1) return arrays[0];
  const length = arrays.reduce((a, arr) => a + arr.length, 0);
  const result = new Uint8Array(length);
  for (let i = 0, pad = 0; i < arrays.length; i++) {
    const arr = arrays[i];
    result.set(arr, pad);
    pad += arr.length;
  }
  return result;
}
function setLength(msg, length, right = false) {
  if (right) {
    if (msg.length < length) {
      return new Uint8Array([...msg, ...new Uint8Array(length - msg.length)]);
    }
    return msg.subarray(0, length);
  } else {
    if (msg.length < length) {
      return new Uint8Array([...new Uint8Array(length - msg.length), ...msg]);
    }
    return msg.subarray(-length);
  }
}
function randomNonce() {
  return BigInt(bytesToHex(crypto.getRandomValues(new Uint8Array(63))));
}
function bytesReverse(a) {
  const length = a.length;
  const b = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    b[i] = a[length - i - 1];
  }
  return b;
}

;// ./src/miner.ts



async function mine(miner, work) {
  for (let i = 0; i < miner.threads; ++i) {
    if (isNode) {
      const worker = new external_worker_threads_namespaceObject.Worker(miner.workerFile, {
        workerData: {
          ...work,
          workerId: i
        }
      });
      worker.on("message", async (msg) => {
        if (msg.type === "nonce") {
          const { nonce, header } = msg;
          miner.pool.submitWork(nonce, header);
        } else if (msg.type === "hashrate") {
          const { workerId, hashrate } = msg;
          miner.hashrates[workerId] = hashrate;
        }
        if (miner.onMessage) {
          const allHashrate = msg.type === "hashrate" ? Object.values(miner.hashrates).reduce((acc, curr) => acc + curr, 0) : void 0;
          miner.onMessage({
            ...msg,
            allHashrate
          });
        }
      });
      worker.on("error", (e) => {
        console.log(`Error from ${i} worker, exiting`);
        console.log(e);
        worker.terminate();
      });
      await new Promise((resolve) => {
        worker.on("online", () => {
          resolve(true);
        });
      });
      miner.workers.push(worker);
    } else {
      const worker = new Worker(miner.workerFile);
      worker.onmessage = (e) => {
        const msg = e.data;
        if (msg.type === "nonce") {
          const { nonce, header } = msg;
          miner.pool.submitWork(nonce, header);
        } else if (msg.type === "hashrate") {
          const { workerId, hashrate } = msg;
          miner.hashrates[workerId] = hashrate;
        }
        if (miner.onMessage) {
          const allHashrate = msg.type === "hashrate" ? Object.values(miner.hashrates).reduce((acc, curr) => acc + curr, 0) : void 0;
          miner.onMessage({
            ...msg,
            allHashrate
          });
        }
      };
      worker.onerror = (e) => {
        console.log(`Error from ${i} worker, exiting`);
        console.log(e);
        worker.terminate();
      };
      worker.postMessage(work);
    }
  }
}
async function stop(miner) {
  await Promise.all(
    miner.workers.map((worker) => {
      return new Promise((resolve) => {
        if (isNode) {
          worker.on("exit", () => {
            resolve(true);
          });
          worker.terminate();
        } else {
          worker.terminate();
          resolve(true);
        }
      });
    })
  );
  miner.workers.length = 0;
}
class Miner {
  workerFile;
  threads;
  pool;
  algoPers;
  onMessage;
  workers;
  hashrates;
  prevWork;
  constructor({ workerFile, threads, pool, algoPers, onMessage }) {
    this.workerFile = workerFile;
    this.threads = threads;
    this.pool = pool;
    this.algoPers = algoPers;
    this.onMessage = onMessage;
    this.workers = [];
    this.hashrates = {};
    this.prevWork = "";
  }
  stop() {
    return stop(this);
  }
  async start() {
    this.pool.on("work", (work2) => {
      this.mine(work2);
    });
    const work = await this.pool.getWork();
    return this.mine(work);
  }
  async mine(work) {
    const newWork = JSON.stringify(work);
    if (this.prevWork === newWork) {
      return;
    }
    if (this.onMessage) {
      this.onMessage({
        type: "newWork",
        ...work
      });
    }
    await this.stop();
    await mine(this, {
      ...work,
      algoPers: this.algoPers
    });
    this.prevWork = newWork;
  }
}

// EXTERNAL MODULE: ./node_modules/isomorphic-ws/node.js
var node = __webpack_require__(2465);
var node_default = /*#__PURE__*/__webpack_require__.n(node);
// EXTERNAL MODULE: ./node_modules/eventemitter3/index.js
var eventemitter3 = __webpack_require__(228);
;// ./node_modules/eventemitter3/index.mjs



/* harmony default export */ const node_modules_eventemitter3 = (eventemitter3);

;// ./src/websocket.ts




function sendWS(pool, method, params, worker, lastHead) {
  const id = Number(pool.id);
  return new Promise((resolve, reject) => {
    const msg = JSON.stringify({
      id,
      jsonrpc: "2.0",
      method,
      params,
      worker
    });
    const queue = {
      id,
      resolve,
      reject,
      isResolved: false,
      lastHead
    };
    queue.timeout = setTimeout(() => {
      if (!queue.isResolved) {
        queue.reject(new Error("Request timeout"));
        queue.isResolved = true;
      }
    }, 2e4);
    pool.queue.push(queue);
    pool.ws.send(msg, (err) => {
      if (err) {
        reject(err);
      }
    });
    pool.id++;
  });
}
function listenWS(pool) {
  return new Promise((resolve, reject) => {
    pool.ws.onclose = () => {
      pool.log(`Websocket closed, reconnecting on ${pool.reconnect} ms`, "error");
      setTimeout(() => {
        pool.ws = new (node_default())(pool.url);
        listenWS(pool);
      }, pool.reconnect);
    };
    pool.ws.onerror = () => {
      pool.log("Websocket encountered error, reconnecting it", "error");
      pool.ws.close();
    };
    pool.ws.onopen = () => {
      pool.submitLogin().then((r) => {
        if (!r) {
          reject(new Error("Pool returned invalid connection boolean"));
        } else {
          if (pool.login) {
            pool.log(`Connected to pool ${pool.url}: ${pool.login}/${pool.worker}`);
          } else {
            pool.log(`Connected to node ${pool.url}`);
          }
          resolve(r);
        }
      }).catch((e) => reject(e));
    };
    pool.ws.onmessage = (d) => {
      try {
        const data = d?.data ? JSON.parse(d.data) : null;
        if (!data) {
          throw new Error("Invalid data");
        }
        if (data.method === "eth_subscription") {
          pool.getWork().then((w) => pool.emit("work", w));
          return;
        }
        if (data.id === 0 && data.result?.length > 2) {
          pool.emit("work", {
            header: data.result[0],
            blockTarget: data.result[1],
            target: data.result[2],
            blockNumber: data.result[3]
          });
          return;
        }
        const msg = pool.queue.find((q) => q.id === data.id);
        if (!msg) {
          return;
        }
        if (msg.lastHead && msg.lastHead !== data.result.hash) {
          pool.getWork().then((w) => pool.emit("work", w));
        }
        if (data.error) {
          msg.reject(data.error);
        } else {
          msg.resolve(data.result);
        }
        msg.isResolved = true;
        pool.queue = pool.queue.filter((q) => !q.isResolved);
      } catch (err) {
        pool.log(
          `Caught error while handing incoming message from pool ${pool.url}, reconnecting: ${err.stack || err.message}`,
          "error"
        );
        console.log(err);
        pool.ws.close();
      }
    };
  });
}
class WebSocketPool extends node_modules_eventemitter3 {
  url;
  login;
  worker;
  reconnect;
  onMessage;
  ws;
  connected;
  id;
  queue;
  constructor({ url, login, worker, reconnect, onMessage }) {
    super();
    this.url = url;
    this.login = login;
    this.worker = worker;
    this.reconnect = reconnect || 500;
    this.onMessage = onMessage;
    this.ws = new (node_default())(url);
    this.id = 1;
    this.queue = [];
    this.connected = listenWS(this);
  }
  log(msg, level) {
    if (this.onMessage) {
      this.onMessage({
        type: "websocket",
        level,
        msg
      });
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  send(method, params, worker, lastHead) {
    return sendWS(this, method, params, worker, lastHead);
  }
  async submitLogin() {
    if (!this.login) {
      const blockNum = await this.send("eth_subscribe", ["newHeads"]);
      if (blockNum?.startsWith("0x")) {
        return true;
      } else {
        return false;
      }
    }
    return this.send("eth_submitLogin", [this.login], this.worker);
  }
  async getWork() {
    await this.connected;
    const result = await this.send("eth_getWork");
    return {
      header: result[0],
      blockTarget: result[1],
      target: result[2],
      blockNumber: result[3]
    };
  }
  async submitWork(nonce, header) {
    await this.connected;
    const valid = await this.send("eth_submitWork", [nonce, header, ZeroHash], this.worker);
    if (!this.login) {
      await this.send("eth_getBlockByNumber", ["latest", false], void 0, header);
    }
    return valid;
  }
}

;// ./src/node.ts









const workerFile = external_path_default().join(__dirname, "../lib/worker.js");
let allHashrate = 0;
function onMessage(msg) {
  const logger = (0,lib.factory)({});
  if (msg.type === "newWork") {
    const { blockNumber, target } = msg;
    logger.debug("WORK", `block: ${Number(blockNumber)} diff: ${toDiff(target)}`);
  } else if (msg.type === "nonce") {
    const { nonce, blockNumber, blockFound } = msg;
    if (blockFound) {
      logger.debug("MINED", `block: ${Number(blockNumber)} nonce: ${nonce}`);
    } else {
      logger.debug("FOUND", `block: ${Number(blockNumber)} solution: ${nonce}`);
    }
  } else if (msg.type === "hashrate") {
    if (msg.allHashrate) {
      allHashrate = msg.allHashrate;
    }
  } else if (msg.msg) {
    const { type, level, msg: strMsg } = msg;
    if (level === "error") {
      logger.error(type.toUpperCase(), strMsg);
    } else {
      logger.debug(type.toUpperCase(), strMsg);
    }
  }
}
function parseUrl(urlStr) {
  try {
    const url = new URL(urlStr);
    if (url.protocol !== "ws:" && url.protocol !== "wss:") {
      throw new Error("Not valid");
    }
    return urlStr;
  } catch {
    throw new InvalidArgumentError("Not valid WebSocket URL");
  }
}
function parseWallet(walletStr) {
  if (!/(0x[a-fA-F0-9]{40})/g.exec(walletStr) || !BigInt(walletStr)) {
    throw new InvalidArgumentError("Not valid wallet address");
  }
  return walletStr;
}
const node_program = new Command();
node_program.name(package_namespaceObject.UU).version(package_namespaceObject.rE).description(package_namespaceObject.h_).option(
  "-u, --url <URL>",
  "Pool / Node WebSocket URL ( that starts with either wss:// or ws:// )",
  parseUrl
).option("-l, --login <LOGIN>", "Wallet address to receive coins when you mine at pool", parseWallet).option("-w, --worker <WORKER>", "Worker ID to report on pool (optional)").option("-t, --threads <THREADS>", "CPU threads to mine ( will use all available cores if not specified)").option("--algo-pers <ALGO_PERS>", "Pers for custom Yespower chain (optional)").action(async (options) => {
  const logger = (0,lib.factory)({});
  const { url: poolUrl, login, worker, threads: rawThreads, algoPers } = options;
  const url = poolUrl || "ws://127.0.0.1:8546";
  const threads = Number(rawThreads || external_os_default().cpus().length);
  logger.debug("CONFIG", JSON.stringify({ url, login, worker, threads, algoPers }, null, 2));
  const pool = new WebSocketPool({
    url,
    login,
    worker,
    onMessage
  });
  const miner = new Miner({
    workerFile,
    threads,
    pool,
    algoPers,
    onMessage
  });
  await miner.start();
  setInterval(() => {
    if (allHashrate) {
      logger.debug("HASHRATE", `${allHashrate}H/s`);
    }
  }, 1e4);
});
node_program.parseAsync();

})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;