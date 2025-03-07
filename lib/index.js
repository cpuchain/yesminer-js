/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 16:
/***/ ((module) => {

"use strict";
module.exports = require("url");

/***/ }),

/***/ 60:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex|Readable$", "caughtErrors": "none" }] */



const EventEmitter = __webpack_require__(434);
const https = __webpack_require__(692);
const http = __webpack_require__(611);
const net = __webpack_require__(278);
const tls = __webpack_require__(756);
const { randomBytes, createHash } = __webpack_require__(982);
const { Duplex, Readable } = __webpack_require__(203);
const { URL } = __webpack_require__(16);

const PerMessageDeflate = __webpack_require__(971);
const Receiver = __webpack_require__(286);
const Sender = __webpack_require__(914);
const { isBlob } = __webpack_require__(880);

const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket,
  NOOP
} = __webpack_require__(614);
const {
  EventTarget: { addEventListener, removeEventListener }
} = __webpack_require__(597);
const { format, parse } = __webpack_require__(926);
const { toBuffer } = __webpack_require__(338);

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

/***/ 106:
/***/ ((module) => {

"use strict";
module.exports = require("zlib");

/***/ }),

/***/ 181:
/***/ ((module) => {

"use strict";
module.exports = require("buffer");

/***/ }),

/***/ 203:
/***/ ((module) => {

"use strict";
module.exports = require("stream");

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

/***/ 237:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { tokenChars } = __webpack_require__(880);

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

/***/ 278:
/***/ ((module) => {

"use strict";
module.exports = require("net");

/***/ }),

/***/ 286:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { Writable } = __webpack_require__(203);

const PerMessageDeflate = __webpack_require__(971);
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  kStatusCode,
  kWebSocket
} = __webpack_require__(614);
const { concat, toArrayBuffer, unmask } = __webpack_require__(338);
const { isValidStatusCode, isValidUTF8 } = __webpack_require__(880);

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

/***/ 338:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { EMPTY_BUFFER } = __webpack_require__(614);

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

/***/ 434:
/***/ ((module) => {

"use strict";
module.exports = require("events");

/***/ }),

/***/ 465:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


module.exports = __webpack_require__(699);

/***/ }),

/***/ 597:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { kForOnEventAttribute, kListener } = __webpack_require__(614);

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

/***/ 611:
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ 614:
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

/***/ 692:
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ 699:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const WebSocket = __webpack_require__(60);

WebSocket.createWebSocketStream = __webpack_require__(719);
WebSocket.Server = __webpack_require__(722);
WebSocket.Receiver = __webpack_require__(286);
WebSocket.Sender = __webpack_require__(914);

WebSocket.WebSocket = WebSocket;
WebSocket.WebSocketServer = WebSocket.Server;

module.exports = WebSocket;


/***/ }),

/***/ 719:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^WebSocket$" }] */


const WebSocket = __webpack_require__(60);
const { Duplex } = __webpack_require__(203);

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

/***/ 722:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex$", "caughtErrors": "none" }] */



const EventEmitter = __webpack_require__(434);
const http = __webpack_require__(611);
const { Duplex } = __webpack_require__(203);
const { createHash } = __webpack_require__(982);

const extension = __webpack_require__(926);
const PerMessageDeflate = __webpack_require__(971);
const subprotocol = __webpack_require__(237);
const WebSocket = __webpack_require__(60);
const { GUID, kWebSocket } = __webpack_require__(614);

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

/***/ 756:
/***/ ((module) => {

"use strict";
module.exports = require("tls");

/***/ }),

/***/ 759:
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

/***/ 880:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { isUtf8 } = __webpack_require__(181);

const { hasBlob } = __webpack_require__(614);

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

/***/ 896:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 912:
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
module.exports = __webpack_require__(896);

/***/ }),

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(928);

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

const bundled = "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gICA/gODIgynaiIDKQMAIBNC/////w+DIBNCIIh+fCAIIAxCIIinaiIGKQMAhSIMNwMAIAUgBikDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgEELwn4CAgP4DgyIOp2oiAykDACAQQv////8PgyAQQiCIfnwgCCAOQiCIp2oiBikDAIUiDjcDECAFIAYpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA9C8J+AgID+A4MiEKdqIgMpAwAgD0L/////D4MgD0IgiH58IAggEEIgiKdqIgYpAwCFIg83AyAgBSAGKQMIIAMpAwggC0L/////D4MgC0IgiH58hSIQNwMoIAUgBCANQvCfgICA/gODIhOnaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIBNCIIinaiIGKQMAhSINNwMwIAUgBikDCCADKQMIIBRC/////w+DIBRCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBikDAIUiDDcDACAFIAYpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgYpAwCFIg43AxAgBSAGKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIGKQMAhSIPNwMgIAUgBikDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBikDAIUiDTcDMCAFIAYpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgYpAwCFIgw3AwAgBSAGKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIGKQMAhSIONwMQIAUgBikDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBikDAIUiDzcDICAFIAYpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgYpAwCFIg03AzAgBSAGKQMIIAMpAwggE0L/////D4MgE0IgiH58hSITNwM4IAUgBCAMQvCfgICA/gODIgunaiIDKQMAIAxC/////w+DIAxCIIh+fCAIIAtCIIinaiIGKQMAhSIMNwMAIAUgBikDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBikDAIUiDjcDECAFIAYpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA9C8J+AgID+A4MiC6dqIgMpAwAgD0L/////D4MgD0IgiH58IAggC0IgiKdqIgYpAwCFIg83AyAgBSAGKQMIIAMpAwggEEL/////D4MgEEIgiH58hSIQNwMoIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIGKQMAhSINNwMwIAUgBikDCCADKQMIIBNC/////w+DIBNCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBikDAIUiDDcDACAFIAYpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgYpAwCFIg43AxAgBSAGKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIGKQMAhSIPNwMgIAUgBikDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBikDAIUiDTcDMCAFIAYpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgYpAwCFIgw3AwAgBSAGKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIGKQMAhSIONwMQIAUgBikDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBikDAIUiDzcDICAFIAYpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgYpAwCFIgs3AzAgBikDCCENIAMpAwghFCACIAdqIgMgCzcDMCADIBA3AyggAyAPNwMgIAMgETcDGCADIA43AxAgAyASNwMIIAMgDDcDACADIA0gFCATQv////8PgyATQiCIfnyFIhM3AzggACAHQcAAciIGaiIDKQM4IRQgAykDMCEVIAMpAyghFiADKQMgIRcgAykDGCEYIAMpAxAhDSADKQMIIRkgBSADKQMAIAEgBmoiAykDAIUgDIUiDDcDACAFIBkgAykDCIUgEoUiEjcDCCAFIA0gAykDEIUgDoUiDTcDECAFIBggAykDGIUgEYUiETcDGCAFIBcgAykDIIUgD4UiDjcDICAFIBYgAykDKIUgEIUiEDcDKCAFIBUgAykDMIUgC4UiDzcDMCAFIBQgAykDOIUgE4UiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBykDAIUiDDcDACAFIAcpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgcpAwCFIg03AxAgBSAHKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIHKQMAhSIONwMgIAUgBykDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBykDAIUiDzcDMCAFIAcpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgcpAwCFIgw3AwAgBSAHKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIHKQMAhSINNwMQIAUgBykDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBykDAIUiDjcDICAFIAcpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA9C8J+AgID+A4MiC6dqIgMpAwAgD0L/////D4MgD0IgiH58IAggC0IgiKdqIgcpAwCFIg83AzAgBSAHKQMIIAMpAwggE0L/////D4MgE0IgiH58hSITNwM4IAUgBCAMQvCfgICA/gODIgunaiIDKQMAIAxC/////w+DIAxCIIh+fCAIIAtCIIinaiIHKQMAhSIMNwMAIAUgBykDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBykDAIUiDTcDECAFIAcpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgcpAwCFIg43AyAgBSAHKQMIIAMpAwggEEL/////D4MgEEIgiH58hSIQNwMoIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIHKQMAhSIPNwMwIAUgBykDCCADKQMIIBNC/////w+DIBNCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBykDAIUiDDcDACAFIAcpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgcpAwCFIg03AxAgBSAHKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIHKQMAhSIONwMgIAUgBykDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBykDAIUiDzcDMCAFIAcpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgcpAwCFIgw3AwAgBSAHKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIHKQMAhSINNwMQIAUgBykDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBykDAIUiDjcDICAFIAcpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhQ3AyggBSAEIA9C8J+AgID+A4MiEKdqIgMpAwAgD0L/////D4MgD0IgiH58IAggEEIgiKdqIgcpAwCFIgs3AzAgBSAHKQMIIAMpAwggE0L/////D4MgE0IgiH58hSIVNwM4IAUgBCAMQvCfgICA/gODIg+naiIDKQMAIAxC/////w+DIAxCIIh+fCAIIA9CIIinaiIHKQMAhSITNwMAIAUgBykDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQg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IAAgASkAMDcAWCAAIAEpADg3AGAgACAAQShqIgggAyADQYACaiIHEAMgAUFAayEGIAJBQGoiAUHAAE8EQANAIAAgBiADIAcQAyAGQUBrIQYgAUFAaiIBQT9LDQALCyABBEAgCCAGIAH8CgAACyAFIAAgAxAHIABCADcDICAAQYAIKQMANwMAIABBiAgpAwA3AwggAEGQCCkDADcDECAAQZgIKQMANwMYIARCtuzYsePGjZs2NwAAIARCtuzYsePGjZs2NwAIIARCtuzYsePGjZs2NwAQIARCtuzYsePGjZs2NwAYIARCtuzYsePGjZs2NwAgIARCtuzYsePGjZs2NwAoIARCtuzYsePGjZs2NwAwIARCtuzYsePGjZs2NwA4QSAMAQsgAEIANwMgIABBgAgpAwA3AwAgAEGICCkDADcDCCAAQZAIKQMANwMQIABBmAgpAwA3AxggBEK27Nix48aNmzY3AAAgBEK27Nix48aNmzY3AAggBEK27Nix48aNmzY3ABAgBEK27Nix48aNmzY3ABggBEK27Nix48aNmzY3ACAgBEK27Nix48aNmzY3ACggBEK27Nix48aNmzY3ADAgBEK27Nix48aNmzY3ADggAkUNASABIQUgAgshCEEAIQJBACEGIAhBBE8EQCAIQfwAcSEHQQAhAQNAIAQgBmoiCiAKLQAAIAUgBmotAABzOgAAIAQgBkEBciIKaiIJIAktAAAgBSAKai0AAHM6AAAgBCAGQQJyIgpqIgkgCS0AACAFIApqLQAAczoAACAEIAZBA3IiCmoiCSAJLQAAIAUgCmotAABzOgAAIAZBBGohBiABQQRqIgEgB0cNAAsLIAhBA3EiAQRAA0AgBCAGaiIHIActAAAgBSAGai0AAHM6AAAgBkEBaiEGIAJBAWoiAiABRw0AC0EAIQILIAUhAQwBC0EBIQILIAAgACkDICILQoAEfDcDICAAQShqIQVBwAAgC6dBA3ZBP3EiBmsiBwRAIAUgBmogBCAH/AoAAAsgACAFIAMgA0GAAmoiChADIAYEQCAFIAQgB2ogBvwKAAALIABCADcDiAFBACEGIABBgAgpAwA3A2ggAEGICCkDADcDcCAAQZAIKQMANwN4IABBmAgpAwA3A4ABIARC3Ljx4sWLl67cADcAACAEQty48eLFi5eu3AA3AAggBELcuPHixYuX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YykDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiZSkDAIUiBULwn4CAgP4DgyIPp2oiZikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiZykDAIUiBULwn4CAgP4DgyIPp2oiaCkDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiaSkDAIUiBULwn4CAgP4DgyIPp2oiaikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiaykDAIUiBULwn4CAgP4DgyIPQiCIp2oibCkDACEeIAMgD6dqIm0pAwAhDyBWKQMIIR8gRSkDCCEgIFwpAwghISBbKQMIISIgYikDCCEjIGEpAwghJCBEKQMIISUgVSkDCCEmIFopAwghJyBJKQMIISggYCkDCCEpIF8pAwghKiBUKQMIISsgUykDCCEsIEgpAwghLSBZKQMIIS4gXikDCCEvIE0pAwghMCBSKQMIITEgUSkDCCEyIFgpAwghMyBXKQMIITQgTCkDCCE1IF0pAwghNiBQKQMIITcgQCkDCCE4IEcpAwghOSBGKQMIITogSykDCCE7IEopAwghPCBBIGwpAwggbSkDCCBrKQMIIGopAwggaSkDCCBoKQMIIGcpAwggZikDCCBlKQMIIGMpAwggTykDCCBOKQMIIAkgFIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiFDcDOCBBIB4gDyAFQv////8PgyAFQiCIfnyFIgk3AzAgQSAcIB0gIyAkICkgKiAvIDAgNSA2IDsgPCAIIBOFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIhM3AyggQSAbIA0gBkL/////D4MgBkIgiH58hSIFNwMgIEEgGSAaICEgIiAnICggLSAuIDMgNCA5IDogESAShSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSISNwMYIEEgGCAMIApC/////w+DIApCIIh+fIUiCDcDECBBIBYgFyAfICAgJSAmICsgLCAxIDIgNyA4IA4gEIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiCjcDCCBBIBUgCyAHQv////8PgyAHQiCIfnyFIgY3AwAgACBCQcAAciJAaiJBKQMAIQ4gQSkDCCEHIEEpAxAhCyBBKQMYIRAgQSkDICEMIEEpAyghESBBKQMwIQ0gASBAaiJAIEEpAzggQCkDOIUiDzcDOCBAIA0gQCkDMIUiDTcDMCBAIBEgQCkDKIUiETcDKCBAIAwgQCkDIIUiDDcDICBAIBAgQCkDGIUiEDcDGCBAIAsgQCkDEIUiCzcDECBAIAcgQCkDCIUiFTcDCCBAIA4gQCkDAIUiDjcDACAEIAMgAyADIAMgCSANhSIJQvCfgICA/gODIgenaiJAKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJCKQMAhSIJQvCfgICA/gODIgenaiJQKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJRKQMAhSIJQvCfgICA/gODIgenaiJSKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJTKQMAhSIJQvCfgICA/gODIgenaiJUKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJVKQMAhSIJQvCfgICA/gODIgdCIIinaiJEKQMIIQ0gAyAHp2oiRSkDCCEWIEQpAwAhFyBFKQMAIRggBCADIAMgAyADIAUgDIUiBULwn4CAgP4DgyIHp2oiRCkDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiRSkDAIUiBULwn4CAgP4DgyIHp2oiVikDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiRikDAIUiBULwn4CAgP4DgyIHp2oiRykDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiVykDAIUiBULwn4CAgP4DgyIHp2oiWCkDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiWSkDAIUiBULwn4CAgP4DgyIHQiCIp2oiSCkDCCEMIAMgB6dqIkkpAwghGSBIKQMAIRogSSkDACEbIAQgAyADIAMgAyAIIAuFIghC8J+AgID+A4MiB6dqIkgpAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIkkpAwCFIghC8J+AgID+A4MiB6dqIlopAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIlspAwCFIghC8J+AgID+A4MiB6dqIlwpAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIkopAwCFIghC8J+AgID+A4MiB6dqIkspAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIl0pAwCFIghC8J+AgID+A4MiB0IgiKdqIkwpAwghCyADIAenaiJNKQMIIRwgTCkDACEdIE0pAwAhHiAEIAMgAyADIAMgBiAOhSIGQvCfgICA/gODIg6naiJMKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJNKQMAhSIGQvCfgICA/gODIg6naiJeKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJfKQMAhSIGQvCfgICA/gODIg6naiJgKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJhKQMAhSIGQvCfgICA/gODIg6naiJiKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJOKQMAhSIGQvCfgICA/gODIg5CIIinaiJPKQMIIR8gAyAOp2oiYykDCCEOIFUpAwghICBUKQMIISEgWSkDCCEiIFgpAwghIyBdKQMIISQgSykDCCElIE4pAwghJiBiKQMIIScgUykDCCEoIFIpAwghKSBXKQMIISogRykDCCErIEopAwghLCBcKQMIIS0gYSkDCCEuIGApAwghLyBRKQMIITAgUCkDCCExIEYpAwghMiBWKQMIITMgWykDCCE0IFopAwghNSBfKQMIITYgXikDCCE3IEIpAwghOCBAKQMIITkgRSkDCCE6IEQpAwghOyBJKQMIITwgSCkDCCE9IE0pAwghPiBMKQMIIT8gQyADIE8pAwAgYykDACAGQv////8PgyAGQiCIfnyFIgZC8J+AgID+A4MiB6dqIkApAwAgBkL/////D4MgBkIgiH58IAQgB0IgiKdqIkIpAwCFIgc3AwAgQyBCKQMIIEApAwggHyAOICYgJyAuIC8gNiA3ID4gPyAKIBWFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIg43AwggQyADIB0gHiAIQv////8PgyAIQiCIfnyFIghC8J+AgID+A4MiBqdqIkApAwAgCEL/////D4MgCEIgiH58IAQgBkIgiKdqIkIpAwCFIgo3AxAgQyBCKQMIIEApAwggCyAcICQgJSAsIC0gNCA1IDwgPSAQIBKFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIhI3AxggQyADIBogGyAFQv////8PgyAFQiCIfnyFIgVC8J+AgID+A4MiCKdqIkApAwAgBUL/////D4MgBUIgiH58IAQgCEIgiKdqIkIpAwCFIgY3AyAgQyBCKQMIIEApAwggDCAZICIgIyAqICsgMiAzIDogOyARIBOFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgg3AyggQyADIBcgGCAJQv////8PgyAJQiCIfnyFIglC8J+AgID+A4MiBadqIkApAwAgCUL/////D4MgCUIgiH58IAQgBUIgiKdqIkIpAwCFIgU3AzAgQyBCKQMIIEApAwggDSAWICAgISAoICkgMCAxIDggOSAPIBSFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIgk3AzggAiBkT0UEQCBBIAk3AzggQSAFNwMwIEEgCDcDKCBBIAY3AyAgQSASNwMYIEEgCjcDECBBIA43AwggQSAHNwMAIAJBAmohAgwBCwsgQyBBQQQQBCBDKAIAIENBQGskAAuRFAIJfhB/IwBBQGoiDyQAAkAgA0UEQCMAQUBqIgIkACAAKQN4IQkgACkDcCEFIAApA2ghCiAAKQNgIQYgACkDWCELIAApA1AhByAAKQNIIQwgAiAAKQNAIgggACkDAIU3AwAgAiAMIAApAwiFNwMIIAIgByAAKQMQhTcDECACIAsgACkDGIU3AxggAiAGIAApAyCFNwMgIAIgCiAAKQMohTcDKCACIAUgACkDMIU3AzAgAiAJIAApAziFNwM4IAIgAUEEEAQgAiAIIAIpAwCFNwMAIAIgDCACKQMIhTcDCCACIAcgAikDEIU3AxAgAiALIAIpAxiFNwMYIAIgBiACKQMghTcDICACIAogAikDKIU3AyggAiAFIAIpAzCFNwMwIAIgCSACKQM4hTcDOCACIAFBQGtBBBAEIAJBQGskAAwBCyADKAIEIQ0gAygCACEDIAAgAkEBdEEBayIbQQZ0aiICKQM4IQkgAikDMCEFIAIpAyghCiACKQMgIQYgAikDGCELIAIpAxAhByACKQMIIQwgAikDACEIA0AgAyADIAMgAyADIAMgACAaQQZ0IhxqIgIpAzAgBYUiBULwn4CAgP4DgyIEp2oiDikDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiECkDAIUiBULwn4CAgP4DgyIEp2oiESkDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiEikDAIUiBULwn4CAgP4DgyIEp2oiEykDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiFCkDAIUiBULwn4CAgP4DgyIEp2oiFSkDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiFikDAIUiBULwn4CAgP4DgyIEp2oiFykDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiGCkDAIUiBULwn4CAgP4DgyIEp2oiGSkDCCAYKQMIIBcpAwggFikDCCAVKQMIIBQpAwggEykDCCASKQMIIBEpAwggECkDCCAOKQMIIAIpAzggCYUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fCANIARCIIinaiIOKQMIhSEJIA4pAwAgGSkDACAFQv////8PgyAFQiCIfnyFIQUgAyADIAMgAyADIAMgAikDICAGhSIGQvCfgICA/gODIgSnaiIOKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIQKQMAhSIGQvCfgICA/gODIgSnaiIRKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiISKQMAhSIGQvCfgICA/gODIgSnaiITKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIUKQMAhSIGQvCfgICA/gODIgSnaiIVKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIWKQMAhSIGQvCfgICA/gODIgSnaiIXKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIYKQMAhSIGQvCfgICA/gODIgSnaiIZKQMIIBgpAwggFykDCCAWKQMIIBUpAwggFCkDCCATKQMIIBIpAwggESkDCCAQKQMIIA4pAwggAikDKCAKhSIKQiCIIApC/////w+DfnyFIgpCIIggCkL/////D4N+fIUiCkIgiCAKQv////8Pg358hSIKQiCIIApC/////w+DfnyFIgpCIIggCkL/////D4N+fIUiCkIgiCAKQv////8Pg358IA0gBEIgiKdqIg4pAwiFIQogDikDACAZKQMAIAZC/////w+DIAZCIIh+fIUhBiADIAMgAyADIAMgAyACKQMQIAeFIgdC8J+AgID+A4MiBKdqIg4pAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhApAwCFIgdC8J+AgID+A4MiBKdqIhEpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhIpAwCFIgdC8J+AgID+A4MiBKdqIhMpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhQpAwCFIgdC8J+AgID+A4MiBKdqIhUpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhYpAwCFIgdC8J+AgID+A4MiBKdqIhcpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhgpAwCFIgdC8J+AgID+A4MiBKdqIhkpAwggGCkDCCAXKQMIIBYpAwggFSkDCCAUKQMIIBMpAwggEikDCCARKQMIIBApAwggDikDCCACKQMYIAuFIgtCIIggC0L/////D4N+fIUiC0IgiCALQv////8Pg358hSILQiCIIAtC/////w+DfnyFIgtCIIggC0L/////D4N+fIUiC0IgiCALQv////8Pg358hSILQiCIIAtC/////w+DfnwgDSAEQiCIp2oiDikDCIUhCyAOKQMAIBkpAwAgB0L/////D4MgB0IgiH58hSEHIAMgAyADIAMgAyADIAIpAwAgCIUiCELwn4CAgP4DgyIEp2oiDikDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiECkDAIUiCELwn4CAgP4DgyIEp2oiESkDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiEikDAIUiCELwn4CAgP4DgyIEp2oiEykDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiFCkDAIUiCELwn4CAgP4DgyIEp2oiFSkDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiFikDAIUiCELwn4CAgP4DgyIEp2oiFykDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiGCkDAIUiCELwn4CAgP4DgyIEp2oiGSkDCCAYKQMIIBcpAwggFikDCCAVKQMIIBQpAwggEykDCCASKQMIIBEpAwggECkDCCAOKQMIIAIpAwggDIUiDEIgiCAMQv////8Pg358hSIMQiCIIAxC/////w+DfnyFIgxCIIggDEL/////D4N+fIUiDEIgiCAMQv////8Pg358hSIMQiCIIAxC/////w+DfnyFIgxCIIggDEL/////D4N+fCANIARCIIinaiICKQMIhSEMIAIpAwAgGSkDACAIQv////8PgyAIQiCIfnyFIQggGiAbRwRAIAEgHGoiAiAJNwM4IAIgBTcDMCACIAo3AyggAiAGNwMgIAIgCzcDGCACIAc3AxAgAiAMNwMIIAIgCDcDACAaQQFqIRoMAQsLIA8gCTcDOCAPIAU3AzAgDyAKNwMoIA8gBjcDICAPIAs3AxggDyAHNwMQIA8gDDcDCCAPIAg3AwAgDyABIBtBBnRqQQQQBAsgD0FAayQAC80dAhB+C38jAEFAaiIUJAAgAygCDCEcIAMoAgghGiADKAIEIRUgAygCACEZIAEgAkEHdEFAaiIbaiIXKQM4IAAgG2oiGykDOIUhBCAXKQMwIBspAzCFIQUgFykDKCAbKQMohSEG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FCADQQA2AhAgA0EANgIMIAdBEGtBADYCACAHQRRrQQA2AgAgB0EYa0EANgIAIAdBHGtBADYCACAKIANBBHFBGHIiCmsiB0EgSQ0AIAMgCmohAwNAIANCADcDGCADQgA3AxAgA0IANwMIIANCADcDACADQSBqIQMgB0EgayIHQR9LDQALCyAEIAZqIgMgBDYCACADQoGAgIBwNwMIIANBAzYCICADQgA3AxggA0EiNgIQIAMgDDYCBCADQdALKAIANgIkQdALIAM2AgAgAygCAAVBUAsiAyADQUFGGyIDQYFgTwR/QcgLQQAgA2s2AgBBfwUgAwsLIgNBACADQX9HGyIENgIAQbgLIAQ2AgBBxAsgDEEAIAQbIgY2AgBBwAsgBjYCACAERQ0BCyACIAMgDWoiByARaiIEIBJqIgw2AiwgAiAMQRBBCEELIBAbIgp0ajYCMCAAIAEgAhAXIA5BBUYEQCACIAAgASADIA0QDCACIAMpABg3AxggAiADKQAQNwMQIAIgAykACDcDCCACIAMpAAA3AwAgA0EBIAIoAjxBB3YgAigCLCAEQQAQGCADIAUgCSAHIAQgAkEsaiIAEBggAyAFIAkgCUECakEDbiIBQf7/P3EiBiAHIAQgABAUIAYgAUEBakH+//8AcUkEQCADIAUgCUECIAcgBCAAEBQLIAIgAyANIAhBIBAMIAtFDQIgCEEgIAsgDyACEBYgAkEgIAgQFwwCC0EAIQYgAkEANgI4IAIgDEEgIAp0ajYCNCACIAsgACALGyAPQQAgCxsgA0GAARAMIAIgAykAGDcDGCACIAMpABA3AxAgAiADKQAINwMIIAIgAykAADcDACADQQEgAigCPEEHdiACKAIsIARBABASIAMgBSAJIAcgBCACQSxqEBIgBUEBdCELIAQgBUEHdGohACAJQQJqQQNuQQFqA0AgACADIAZBBnQiDmoiASgAACIPNgIAIAAgASgABDYCBCAAIAEoAAg2AgggACABKAAMNgIMIAAgASgAECIKNgIQIAAgASgAFCIQNgIUIAAgASgAGDYCGCAAIAEoABw2AhwgACABKAAgIhE2AiAgACABKAAkIhI2AiQgACABKAAoIhM2AiggACABKAAsNgIsIAAgASgAMCIUNgIwIAAgASgANCIVNgI0IAAgASgAOCIWNgI4IAAgASgAPCIXNgI8IAQgDmoiASAKrSASrUIghoQ3AxAgASAPrSAQrUIghoQ3AwAgASATrSAXrUIghoQ3AwggADUCDCEYIAEgEa0gFa1CIIaENwMgIAEgFq0gGEIghoQ3AxggASAANQIIIAA1AhxCIIaENwMoIAEgFK0gADUCBEIghoQ3AzAgASAANQIYIAA1AixCIIaENwM4IAZBAWoiBiALRw0ACyAJQQFrIQFB/v//AHEhBiAEIA1qQUBqKAIAIQkDQCAEIAcgBCAHIAEgCXEgC2xBBnRqIAUgAkEsaiIJEBEgAXEgC2xBBnRqIAUgCRARIQkgBkECayIGDQALQQAhBgNAIAAgBCAGQQZ0IgVqIgEoAgA2AAAgACABKAIENgAEIAAgASgCCDYACCAAIAEoAgw2AAwgACABKAIQNgAQIAAgASgCFDYAFCAAIAEoAhg2ABggACABKAIcNgAcIAAgASgCIDYAICAAIAEoAiQ2ACQgACABKAIoNgAoIAAgASgCLDYALCAAIAEoAjA2ADAgACABKAI0Igk2ADQgACABKAI4NgA4IAAgASgCPDYAPCADIAVqIgEgACkDAD4CACABIAk2AgQgASAAKQMoPgIIIAEgADUCHD4CDCABIAApAxA+AhAgASAANQIEPgIUIAEgACkDOD4CGCABIAA1Aiw+AhwgASAAKQMgPgIgIAEgADUCFD4CJCABIAApAwg+AiggASAANQI8PgIsIAEgACkDMD4CMCABIAA1AiQ+AjQgASAAKQMYPgI4IAEgADUCDD4CPCAGQQFqIgYgC0cNAAsgB0FAakHAACACQSAgCBAWDAELIAhCfzcAACAIQn83ABggCEJ/NwAQIAhCfzcACAsgAkFAayQAIAhBQGskACAICwuFAwQAQYAIC2dn5glqha5nu3Lzbjw69U+lf1IOUYxoBZur2YMfGc3gWy4uL3llc3Bvd2VyLWMvc2hhMjU2LmMAUEJLREYyX1NIQTI1NgBka0xlbiA8PSAzMiAqIChzaXplX3QpKFVJTlQzMl9NQVgpAEHwCAsBgABBsAkLgAKYL4pCkUQ3cc/7wLWl27XpW8JWOfER8Vmkgj+S1V4cq5iqB9gBW4MSvoUxJMN9DFV0Xb5y/rHegKcG3Jt08ZvBwWmb5IZHvu/GncEPzKEMJG8s6S2qhHRK3KmwXNqI+XZSUT6YbcYxqMgnA7DHf1m/8wvgxkeRp9VRY8oGZykpFIUKtyc4IRsu/G0sTRMNOFNUcwpluwpqdi7JwoGFLHKSoei/oktmGqhwi0vCo1FsxxnoktEkBpnWhTUO9HCgahAWwaQZCGw3Hkx3SCe1vLA0swwcOUqq2E5Pypxb828uaO6Cj3RvY6V4FHjIhAgCx4z6/76Q62xQpPej+b7yeHHGAEGwCwsD0AcB";

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

/***/ 914:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Duplex" }] */



const { Duplex } = __webpack_require__(203);
const { randomFillSync } = __webpack_require__(982);

const PerMessageDeflate = __webpack_require__(971);
const { EMPTY_BUFFER, kWebSocket, NOOP } = __webpack_require__(614);
const { isBlob, isValidStatusCode } = __webpack_require__(880);
const { mask: applyMask, toBuffer } = __webpack_require__(338);

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

/***/ 926:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const { tokenChars } = __webpack_require__(880);

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

/***/ 928:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 971:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";


const zlib = __webpack_require__(106);

const bufferUtil = __webpack_require__(338);
const Limiter = __webpack_require__(759);
const { kStatusCode } = __webpack_require__(614);

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

/***/ 982:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
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
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Miner: () => (/* reexport */ Miner),
  WebSocketPool: () => (/* reexport */ WebSocketPool),
  ZeroHash: () => (/* reexport */ ZeroHash),
  bytesReverse: () => (/* reexport */ bytesReverse),
  concatBytes: () => (/* reexport */ concatBytes),
  findNonce: () => (/* reexport */ findNonce),
  isNode: () => (/* reexport */ isNode),
  listenWS: () => (/* reexport */ listenWS),
  mine: () => (/* reexport */ mine),
  randomNonce: () => (/* reexport */ randomNonce),
  sendWS: () => (/* reexport */ sendWS),
  setLength: () => (/* reexport */ setLength),
  stop: () => (/* reexport */ stop),
  toDiff: () => (/* reexport */ toDiff)
});

// EXTERNAL MODULE: ./node_modules/yespower-wasm/lib/index.js
var lib = __webpack_require__(912);
// EXTERNAL MODULE: external "crypto"
var external_crypto_ = __webpack_require__(982);
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
  return BigInt((0,lib.bytesToHex)(external_crypto_.webcrypto.getRandomValues(new Uint8Array(63))));
}
function bytesReverse(a) {
  const length = a.length;
  const b = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    b[i] = a[length - i - 1];
  }
  return b;
}

;// ./src/find.ts



async function findNonce(work, reportOn = 100, workerId, algoPers, isWorker, msgSend) {
  const yespower = await lib.Yespower.init();
  let timeStart = Date.now();
  let nonce = randomNonce();
  let i = 0;
  const blockTarget = work.blockTarget?.startsWith("0x") ? BigInt(work.blockTarget) : 0n;
  const target = BigInt(work.target);
  const header = (0,lib.hexToBytes)(work.header);
  while (true) {
    const nonceBytes = setLength((0,lib.hexToBytes)(nonce.toString(16)), 8, false);
    const concatted = concatBytes(header, bytesReverse(nonceBytes));
    const result = BigInt((0,lib.bytesToHex)(yespower.Hash(concatted, void 0, void 0, algoPers)));
    const blockFound = blockTarget > result;
    if (target > result) {
      const found = {
        nonce: (0,lib.bytesToHex)(nonceBytes),
        header: work.header,
        blockNumber: work.blockNumber,
        blockFound
      };
      if (msgSend) {
        msgSend({
          type: "nonce",
          workerId,
          ...found
        });
      }
      if (!isWorker) {
        return found;
      }
    }
    if (i && i % reportOn === 0) {
      const timeTook = Date.now() - timeStart;
      const hashrate = Math.floor(1e3 * reportOn / timeTook);
      if (msgSend) {
        msgSend({
          type: "hashrate",
          workerId,
          hashrate
        });
      }
      timeStart = Date.now();
    }
    i++;
    nonce++;
  }
}

;// external "worker_threads"
const external_worker_threads_namespaceObject = require("worker_threads");
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
var node = __webpack_require__(465);
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

;// ./src/index.ts






})();

var __webpack_export_target__ = exports;
for(var __webpack_i__ in __webpack_exports__) __webpack_export_target__[__webpack_i__] = __webpack_exports__[__webpack_i__];
if(__webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;