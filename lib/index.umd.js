globalThis.process = { browser: true, env: {}, };
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Yesminer"] = factory();
	else
		root["Yesminer"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

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

/***/ 274:
/***/ ((module) => {

globalThis.process = { browser: true, env: {}, };
(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else {}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 247:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 561:
/***/ ((module, __unused_webpack_exports, __nested_webpack_require_606__) => {

var __filename = "/index.js";
var __dirname = "/";
/* provided dependency */ var process = __nested_webpack_require_606__(606);
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
                var fs = __nested_webpack_require_606__(603);
                var nodePath = __nested_webpack_require_606__(247);
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

/***/ 603:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 606:
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_29967__(moduleId) {
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
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_29967__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__nested_webpack_require_29967__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__nested_webpack_require_29967__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_29967__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_29967__.o(definition, key) && !__nested_webpack_require_29967__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nested_webpack_require_29967__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_29967__.r = (exports) => {
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
__nested_webpack_require_29967__.r(__nested_webpack_exports__);

// EXPORTS
__nested_webpack_require_29967__.d(__nested_webpack_exports__, {
  Yespower: () => (/* binding */ Yespower),
  base64ToBytes: () => (/* reexport */ base64ToBytes),
  bytesToBase64: () => (/* reexport */ bytesToBase64),
  bytesToHex: () => (/* reexport */ bytesToHex),
  hexToBytes: () => (/* reexport */ hexToBytes)
});

;// ./src/bundled.ts

const bundled = "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gICA/gODIgynaiIDKQMAIBNC/////w+DIBNCIIh+fCAIIAxCIIinaiIGKQMAhSIMNwMAIAUgBikDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgEELwn4CAgP4DgyIOp2oiAykDACAQQv////8PgyAQQiCIfnwgCCAOQiCIp2oiBikDAIUiDjcDECAFIAYpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA9C8J+AgID+A4MiEKdqIgMpAwAgD0L/////D4MgD0IgiH58IAggEEIgiKdqIgYpAwCFIg83AyAgBSAGKQMIIAMpAwggC0L/////D4MgC0IgiH58hSIQNwMoIAUgBCANQvCfgICA/gODIhOnaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIBNCIIinaiIGKQMAhSINNwMwIAUgBikDCCADKQMIIBRC/////w+DIBRCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBikDAIUiDDcDACAFIAYpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgYpAwCFIg43AxAgBSAGKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIGKQMAhSIPNwMgIAUgBikDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBikDAIUiDTcDMCAFIAYpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgYpAwCFIgw3AwAgBSAGKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIGKQMAhSIONwMQIAUgBikDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBikDAIUiDzcDICAFIAYpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgYpAwCFIg03AzAgBSAGKQMIIAMpAwggE0L/////D4MgE0IgiH58hSITNwM4IAUgBCAMQvCfgICA/gODIgunaiIDKQMAIAxC/////w+DIAxCIIh+fCAIIAtCIIinaiIGKQMAhSIMNwMAIAUgBikDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBikDAIUiDjcDECAFIAYpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA9C8J+AgID+A4MiC6dqIgMpAwAgD0L/////D4MgD0IgiH58IAggC0IgiKdqIgYpAwCFIg83AyAgBSAGKQMIIAMpAwggEEL/////D4MgEEIgiH58hSIQNwMoIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIGKQMAhSINNwMwIAUgBikDCCADKQMIIBNC/////w+DIBNCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBikDAIUiDDcDACAFIAYpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgYpAwCFIg43AxAgBSAGKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIGKQMAhSIPNwMgIAUgBikDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBikDAIUiDTcDMCAFIAYpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgYpAwCFIgw3AwAgBSAGKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIGKQMAhSIONwMQIAUgBikDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBikDAIUiDzcDICAFIAYpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgYpAwCFIgs3AzAgBikDCCENIAMpAwghFCACIAdqIgMgCzcDMCADIBA3AyggAyAPNwMgIAMgETcDGCADIA43AxAgAyASNwMIIAMgDDcDACADIA0gFCATQv////8PgyATQiCIfnyFIhM3AzggACAHQcAAciIGaiIDKQM4IRQgAykDMCEVIAMpAyghFiADKQMgIRcgAykDGCEYIAMpAxAhDSADKQMIIRkgBSADKQMAIAEgBmoiAykDAIUgDIUiDDcDACAFIBkgAykDCIUgEoUiEjcDCCAFIA0gAykDEIUgDoUiDTcDECAFIBggAykDGIUgEYUiETcDGCAFIBcgAykDIIUgD4UiDjcDICAFIBYgAykDKIUgEIUiEDcDKCAFIBUgAykDMIUgC4UiDzcDMCAFIBQgAykDOIUgE4UiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBykDAIUiDDcDACAFIAcpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgcpAwCFIg03AxAgBSAHKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIHKQMAhSIONwMgIAUgBykDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBykDAIUiDzcDMCAFIAcpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgcpAwCFIgw3AwAgBSAHKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIHKQMAhSINNwMQIAUgBykDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBykDAIUiDjcDICAFIAcpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhA3AyggBSAEIA9C8J+AgID+A4MiC6dqIgMpAwAgD0L/////D4MgD0IgiH58IAggC0IgiKdqIgcpAwCFIg83AzAgBSAHKQMIIAMpAwggE0L/////D4MgE0IgiH58hSITNwM4IAUgBCAMQvCfgICA/gODIgunaiIDKQMAIAxC/////w+DIAxCIIh+fCAIIAtCIIinaiIHKQMAhSIMNwMAIAUgBykDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDULwn4CAgP4DgyILp2oiAykDACANQv////8PgyANQiCIfnwgCCALQiCIp2oiBykDAIUiDTcDECAFIAcpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA5C8J+AgID+A4MiC6dqIgMpAwAgDkL/////D4MgDkIgiH58IAggC0IgiKdqIgcpAwCFIg43AyAgBSAHKQMIIAMpAwggEEL/////D4MgEEIgiH58hSIQNwMoIAUgBCAPQvCfgICA/gODIgunaiIDKQMAIA9C/////w+DIA9CIIh+fCAIIAtCIIinaiIHKQMAhSIPNwMwIAUgBykDCCADKQMIIBNC/////w+DIBNCIIh+fIUiEzcDOCAFIAQgDELwn4CAgP4DgyILp2oiAykDACAMQv////8PgyAMQiCIfnwgCCALQiCIp2oiBykDAIUiDDcDACAFIAcpAwggAykDCCASQv////8PgyASQiCIfnyFIhI3AwggBSAEIA1C8J+AgID+A4MiC6dqIgMpAwAgDUL/////D4MgDUIgiH58IAggC0IgiKdqIgcpAwCFIg03AxAgBSAHKQMIIAMpAwggEUL/////D4MgEUIgiH58hSIRNwMYIAUgBCAOQvCfgICA/gODIgunaiIDKQMAIA5C/////w+DIA5CIIh+fCAIIAtCIIinaiIHKQMAhSIONwMgIAUgBykDCCADKQMIIBBC/////w+DIBBCIIh+fIUiEDcDKCAFIAQgD0Lwn4CAgP4DgyILp2oiAykDACAPQv////8PgyAPQiCIfnwgCCALQiCIp2oiBykDAIUiDzcDMCAFIAcpAwggAykDCCATQv////8PgyATQiCIfnyFIhM3AzggBSAEIAxC8J+AgID+A4MiC6dqIgMpAwAgDEL/////D4MgDEIgiH58IAggC0IgiKdqIgcpAwCFIgw3AwAgBSAHKQMIIAMpAwggEkL/////D4MgEkIgiH58hSISNwMIIAUgBCANQvCfgICA/gODIgunaiIDKQMAIA1C/////w+DIA1CIIh+fCAIIAtCIIinaiIHKQMAhSINNwMQIAUgBykDCCADKQMIIBFC/////w+DIBFCIIh+fIUiETcDGCAFIAQgDkLwn4CAgP4DgyILp2oiAykDACAOQv////8PgyAOQiCIfnwgCCALQiCIp2oiBykDAIUiDjcDICAFIAcpAwggAykDCCAQQv////8PgyAQQiCIfnyFIhQ3AyggBSAEIA9C8J+AgID+A4MiEKdqIgMpAwAgD0L/////D4MgD0IgiH58IAggEEIgiKdqIgcpAwCFIgs3AzAgBSAHKQMIIAMpAwggE0L/////D4MgE0IgiH58hSIVNwM4IAUgBCAMQvCfgICA/gODIg+naiIDKQMAIAxC/////w+DIAxCIIh+fCAIIA9CIIinaiIHKQMAhSITNwMAIAUgBykDCCADKQMIIBJC/////w+DIBJCIIh+fIUiEjcDCCAFIAQgDULwn4CAgP4DgyIMp2oiAykDACANQv////8PgyANQiCIfnwgCCAMQiCIp2oiBykDAIUiEDcDECAFIAcpAwggAykDCCARQv////8PgyARQiCIfnyFIhE3AxggBSAEIA5C8J+AgID+A4MiDKdqIgMpAwAgDkL/////D4MgDkIgiH58IAggDEIgiKdqIgcpAwCFIg83AyAgBSAHKQMIIAMpAwggFEL/////D4MgFEIgiH58hSIONwMoIAUgBCALQvCfgICA/gODIgynaiIDKQMAIAtC/////w+DIAtCIIh+fCAIIAxCIIinaiIHKQMAhSINNwMwIAUgBykDCCADKQMIIBVC/////w+DIBVCIIh+fIUiDDcDOCACIAZqIQMgCSAKSQRAIAMgDDcDOCADIA03AzAgAyAONwMoIAMgDzcDICADIBE3AxggAyAQNwMQIAMgEjcDCCADIBM3AwAgCUECaiEJDAELCyAFIANBBBAEIAUoAgALIAVBQGskAAtPAQJ/QbALKAIAIgEgAEEHakF4cSICaiEAAkAgAkEAIAAgAU0bRQRAIAA/AEEQdE0NASAAEAANAQtByAtBMDYCAEF/DwtBsAsgADYCACABC9wEAgN/AX4gAUEoaiIDIAEpAyAiBqdBA3ZBP3EiBGohBQJAIARBN00EQEE4IARrIgRFDQEgBUHwCCAE/AoAAAwBC0HAACAEayIEBEAgBUHwCCAE/AoAAAsgASADIAIgAkGAAmoQAyADQgA3AzAgA0IANwMoIANCADcDICADQgA3AxggA0IANwMQIANCADcDCCADQgA3AwAgASkDICEGCyABIAZCOIYgBkKA/gODQiiGhCAGQoCA/AeDQhiGIAZCgICA+A+DQgiGhIQgBkIIiEKAgID4D4MgBkIYiEKAgPwHg4QgBkIoiEKA/gODIAZCOIiEhIQ3AGAgASADIAIgAkGAAmoQAyAAIAEoAgAiAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnI2AAAgACABKAIEIgJBGHQgAkGA/gNxQQh0ciACQQh2QYD+A3EgAkEYdnJyNgAEIAAgASgCCCICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYACCAAIAEoAgwiAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnI2AAwgACABKAIQIgJBGHQgAkGA/gNxQQh0ciACQQh2QYD+A3EgAkEYdnJyNgAQIAAgASgCFCICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYAFCAAIAEoAhgiAkEYdCACQYD+A3FBCHRyIAJBCHZBgP4DcSACQRh2cnI2ABggACABKAIcIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgAcC7sgAhd+DH8jAEFAaiIcJAACfyAERQRAIwBBQGoiAyQAIAEpA3ghBSAAKQN4IQYgACkDOCETIAEpA3AhCSAAKQNwIQogACkDMCEUIAEpA2ghCyAAKQNoIQwgACkDKCEVIAEpA2AhByAAKQNgIQggACkDICEWIAEpA1ghDSAAKQNYIQ4gACkDGCEXIAEpA1AhDyAAKQNQIRAgACkDECEYIAEpA0ghESAAKQNIIRIgACkDCCEZIAMgASkDQCIaIAApA0AiGyAAKQMAIAEpAwCFhYU3AwAgAyARIBIgGSABKQMIhYWFNwMIIAMgDyAQIBggASkDEIWFhTcDECADIA0gDiAXIAEpAxiFhYU3AxggAyAHIAggFiABKQMghYWFNwMgIAMgCyAMIBUgASkDKIWFhTcDKCADIAkgCiAUIAEpAzCFhYU3AzAgAyAFIAYgEyABKQM4hYWFNwM4IAMgAkEBEAQgAyAFIAYgAykDOIWFNwM4IAMgCSAKIAMpAzCFhTcDMCADIAsgDCADKQMohYU3AyggAyAHIAggAykDIIWFNwMgIAMgDSAOIAMpAxiFhTcDGCADIA8gECADKQMQhYU3AxAgAyARIBIgAykDCIWFNwMIIAMgGiAbIAMpAwCFhTcDACADIAJBQGtBARAEIAMoAgAgA0FAayQADAELIAQoAgwhJCAEKAIIISIgBCgCBCEdIAQoAgAhICABIANBB3RBQGoiHmoiISkDOCAAIB5qIh4pAziFIQUgISkDMCAeKQMwhSEGICEpAyggHikDKIUhCSAhKQMgIB4pAyCFIQogISkDGCAeKQMYhSELICEpAxAgHikDEIUhDCAhKQMIIB4pAwiFIQggISkDACAeKQMAhSEHIANBAXRBAmshJ0EAIQMDQCAAIANBBnQiJWoiISkDOCENICEpAzAhDiAhKQMoIQ8gISkDICEQICEpAxghESAhKQMQIRIgISkDCCETIBwgASAlaiIeKQMAICEpAwAgB4WFIgc3AwAgHCAeKQMIIAggE4WFIgg3AwggHCAeKQMQIAwgEoWFNwMQIBwgHikDGCALIBGFhTcDGCAcIB4pAyAgCiAQhYU3AyAgHCAeKQMoIAkgD4WFNwMoIBwgHikDMCAGIA6FhTcDMCAcIB4pAzggBSANhYU3AzggHCAgIAdC8P+BgID+H4MiBadqIh4pAwAgB0L/////D4MgB0IgiH58IB0iISAFQiCIp2oiHSkDAIUiBTcDACAcIB0pAwggHikDCCAIQv////8PgyAIQiCIfnyFNwMIICAgJGoiHSAFNwMAIB0gHCkDCDcDCCAcIBwpAxAiBUIgiCAFQv////8Pg34gICAFQvD/gYCA/h+DIgWnaiIdKQMAfCAhIAVCIIinaiIeKQMAhSIFNwMQIBwgHikDCCAdKQMIIBwpAxgiBkIgiCAGQv////8Pg358hTcDGCAhICRqIh0gBTcDACAdIBwpAxg3AwggHCAcKQMgIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHSkDAHwgISAFQiCIp2oiHikDAIUiBTcDICAcIB4pAwggHSkDCCAcKQMoIgZCIIggBkL/////D4N+fIU3AyggICAkQRBqIh1qIh4gBTcDACAeIBwpAyg3AwggHCAcKQMwIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHikDAHwgISAFQiCIp2oiHykDAIUiBTcDMCAcIB8pAwggHikDCCAcKQM4IgZCIIggBkL/////D4N+fIU3AzggHSAhaiIdIAU3AwAgHSAcKQM4NwMIIBwgHCkDACIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh0pAwB8ICEgBUIgiKdqIh4pAwCFIgU3AwAgHCAeKQMIIB0pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIICAgJEEgaiIdaiIeIAU3AwAgHiAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh4pAwB8ICEgBUIgiKdqIh8pAwCFIgU3AxAgHCAfKQMIIB4pAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYIB0gIWoiHSAFNwMAIB0gHCkDGDcDCCAcIBwpAyAiBUIgiCAFQv////8Pg34gICAFQvD/gYCA/h+DIgWnaiIdKQMAfCAhIAVCIIinaiIeKQMAhTcDICAcIB4pAwggHSkDCCAcKQMoIgVCIIggBUL/////D4N+fIU3AyggHCAcKQMwIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHSkDAHwgISAFQiCIp2oiHikDAIU3AzAgHCAeKQMIIB0pAwggHCkDOCIFQiCIIAVC/////w+DfnyFNwM4IBwgHCkDACIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh0pAwB8ICEgBUIgiKdqIh4pAwCFIgU3AwAgHCAeKQMIIB0pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIICAgJEEwaiIdaiIeIAU3AwAgHiAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh4pAwB8ICEgBUIgiKdqIh8pAwCFIgU3AxAgHCAfKQMIIB4pAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYIB0gIWoiHSAFNwMAIB0gHCkDGCIGNwMIIBwgHCkDICIFQiCIIAVC/////w+DfiAgIAVC8P+BgID+H4MiBadqIh0pAwB8ICEgBUIgiKdqIh4pAwCFIgk3AyAgHCAeKQMIIB0pAwggHCkDKCIFQiCIIAVC/////w+DfnyFIgo3AyggHCAcKQMwIgVCIIggBUL/////D4N+ICAgBULw/4GAgP4fgyIFp2oiHSkDAHwgISAFQiCIp2oiHikDAIUiCzcDMCAeKQMIIQcgHSkDCCEIIBwpAzghBSACICVqIh0gHCkDACINNwMAIB0gHCkDCCIONwMIIBwpAxAhDCAdIAcgCCAFQv////8PgyAFQiCIfnyFIgg3AzggHSALNwMwIB0gCjcDKCAdIAk3AyAgHSAGNwMYIB0gDDcDECAAIANBAXIiJUEGdCIeaiIdKQM4IQ8gHSkDMCEQIB0pAyghESAdKQMgIRIgHSkDGCETIB0pAxAhFCAdKQMIIQcgHCANIB0pAwAgASAeaiIdKQMAhYUiBTcDACAcIA4gByAdKQMIhYUiBzcDCCAcIAwgFCAdKQMQhYU3AxAgHCAGIBMgHSkDGIWFNwMYIBwgEiAdKQMghSAJhTcDICAcIBEgHSkDKIUgCoU3AyggHCAQIB0pAzCFIAuFNwMwIBwgDyAdKQM4hSAIhTcDOCAcICIiHSAFQvD/gYCA/h+DIganaiIiKQMAIAVC/////w+DIAVCIIh+fCAgIAZCIIinaiIfKQMAhSIFNwMAIBwgHykDCCAiKQMIIAdC/////w+DIAdCIIh+fIU3AwggHSAkQUBrQfD/AXEiImoiHyAFNwMAIB8gHCkDCDcDCCAcIBwpAxAiBUIgiCAFQv////8Pg34gHSAFQvD/gYCA/h+DIgWnaiIfKQMAfCAgIAVCIIinaiIjKQMAhSIFNwMQIBwgIykDCCAfKQMIIBwpAxgiBkIgiCAGQv////8Pg358hTcDGCAgICJqIh8gBTcDACAfIBwpAxg3AwggHCAcKQMgIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiHykDAHwgICAFQiCIp2oiIykDAIUiBTcDICAcICMpAwggHykDCCAcKQMoIgZCIIggBkL/////D4N+fIU3AyggHSAiQRBqIh9qIiMgBTcDACAjIBwpAyg3AwggHCAcKQMwIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiIykDAHwgICAFQiCIp2oiJikDAIUiBTcDMCAcICYpAwggIykDCCAcKQM4IgZCIIggBkL/////D4N+fIU3AzggHyAgaiIfIAU3AwAgHyAcKQM4NwMIIBwgHCkDACIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIh8pAwB8ICAgBUIgiKdqIiMpAwCFIgU3AwAgHCAjKQMIIB8pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIIB0gIkEgaiIfaiIjIAU3AwAgIyAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIiMpAwB8ICAgBUIgiKdqIiYpAwCFIgU3AxAgHCAmKQMIICMpAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYIB8gIGoiHyAFNwMAIB8gHCkDGDcDCCAcIBwpAyAiBUIgiCAFQv////8Pg34gHSAFQvD/gYCA/h+DIgWnaiIfKQMAfCAgIAVCIIinaiIjKQMAhTcDICAcICMpAwggHykDCCAcKQMoIgVCIIggBUL/////D4N+fIU3AyggHCAcKQMwIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiHykDAHwgICAFQiCIp2oiIykDAIU3AzAgHCAjKQMIIB8pAwggHCkDOCIFQiCIIAVC/////w+DfnyFNwM4IBwgHCkDACIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIh8pAwB8ICAgBUIgiKdqIiMpAwCFIgU3AwAgHCAjKQMIIB8pAwggHCkDCCIGQiCIIAZC/////w+DfnyFNwMIIB0gIkEwaiIiaiIfIAU3AwAgHyAcKQMINwMIIBwgHCkDECIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIh8pAwB8ICAgBUIgiKdqIiMpAwCFIgU3AxAgHCAjKQMIIB8pAwggHCkDGCIGQiCIIAZC/////w+DfnyFNwMYICAgImoiIiAFNwMAICIgHCkDGCILNwMIIBwgHCkDICIFQiCIIAVC/////w+DfiAdIAVC8P+BgID+H4MiBadqIiIpAwB8ICAgBUIgiKdqIh8pAwCFIgo3AyAgHCAfKQMIICIpAwggHCkDKCIFQiCIIAVC/////w+DfnyFIgk3AyggHCAcKQMwIgVCIIggBUL/////D4N+IB0gBULw/4GAgP4fgyIFp2oiIikDAHwgICAFQiCIp2oiHykDAIUiBjcDMCAcIB8pAwggIikDCCAcKQM4IgVCIIggBUL/////D4N+fIUiBTcDOCAkQYABakHw/wFxISQgAyAnSQRAIAIgHmoiIiAcKQMAIgc3AwAgIiAcKQMIIgg3AwggHCkDECEMICIgBTcDOCAiIAY3AzAgIiAJNwMoICIgCjcDICAiIAs3AxggIiAMNwMQIANBAmohAyAgISIgISEgDAELCyAEICQ2AgwgBCAgNgIIIAQgHTYCBCAEICE2AgAgHCACICVBBnRqQQEQBCAcKAIACyAcQUBrJAALzxACCH4KfyMAQUBqIgwkAAJAIANFBEAjAEFAaiICJAAgACkDeCEEIAApA3AhBSAAKQNoIQggACkDYCEJIAApA1ghCiAAKQNQIQsgACkDSCEGIAIgACkDQCIHIAApAwCFNwMAIAIgBiAAKQMIhTcDCCACIAsgACkDEIU3AxAgAiAKIAApAxiFNwMYIAIgCSAAKQMghTcDICACIAggACkDKIU3AyggAiAFIAApAzCFNwMwIAIgBCAAKQM4hTcDOCACIAFBARAEIAIgByACKQMAhTcDACACIAYgAikDCIU3AwggAiALIAIpAxCFNwMQIAIgCiACKQMYhTcDGCACIAkgAikDIIU3AyAgAiAIIAIpAyiFNwMoIAIgBSACKQMwhTcDMCACIAQgAikDOIU3AzggAiABQUBrQQEQBCACQUBrJAAMAQsgAygCDCERIAMoAgghDSADKAIEIQ8gAygCACEQIAAgAkEBdEEBayITQQZ0aiICKQM4IQQgAikDMCEFIAIpAyghCCACKQMgIQkgAikDGCEKIAIpAxAhCyACKQMIIQcgAikDACEGQQAhAgNAIA0hFCAMIAAgAkEGdCIVaiINKQMAIAaFIgY3AwAgDCANKQMIIAeFIgc3AwggDCANKQMQIAuFNwMQIAwgDSkDGCAKhTcDGCAMIA0pAyAgCYU3AyAgDCANKQMoIAiFNwMoIAwgDSkDMCAFhTcDMCAMIA0pAzggBIU3AzggDCAQIAZC8P+BgID+H4MiBKdqIg0pAwAgBkL/////D4MgBkIgiH58IA8gBEIgiKdqIg4pAwCFIgQ3AwAgDCAOKQMIIA0pAwggB0L/////D4MgB0IgiH58hTcDCCAQIBFqIg0gBDcDACANIAwpAwg3AwggDCAMKQMQIgRCIIggBEL/////D4N+IBAgBELw/4GAgP4fgyIEp2oiDSkDAHwgDyAEQiCIp2oiDikDAIUiBDcDECAMIA4pAwggDSkDCCAMKQMYIgVCIIggBUL/////D4N+fIU3AxggDyARaiINIAQ3AwAgDSAMKQMYNwMIIAwgDCkDICIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg0pAwB8IA8gBEIgiKdqIg4pAwCFIgQ3AyAgDCAOKQMIIA0pAwggDCkDKCIFQiCIIAVC/////w+DfnyFNwMoIBAgEUEQaiINaiIOIAQ3AwAgDiAMKQMoNwMIIAwgDCkDMCIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg4pAwB8IA8gBEIgiKdqIhIpAwCFIgQ3AzAgDCASKQMIIA4pAwggDCkDOCIFQiCIIAVC/////w+DfnyFNwM4IA0gD2oiDSAENwMAIA0gDCkDODcDCCAMIAwpAwAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiINKQMAfCAPIARCIIinaiIOKQMAhSIENwMAIAwgDikDCCANKQMIIAwpAwgiBUIgiCAFQv////8Pg358hTcDCCAQIBFBIGoiDWoiDiAENwMAIA4gDCkDCDcDCCAMIAwpAxAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiIOKQMAfCAPIARCIIinaiISKQMAhSIENwMQIAwgEikDCCAOKQMIIAwpAxgiBUIgiCAFQv////8Pg358hTcDGCANIA9qIg0gBDcDACANIAwpAxg3AwggDCAMKQMgIgRCIIggBEL/////D4N+IBAgBELw/4GAgP4fgyIEp2oiDSkDAHwgDyAEQiCIp2oiDikDAIU3AyAgDCAOKQMIIA0pAwggDCkDKCIEQiCIIARC/////w+DfnyFNwMoIAwgDCkDMCIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg0pAwB8IA8gBEIgiKdqIg4pAwCFNwMwIAwgDikDCCANKQMIIAwpAzgiBEIgiCAEQv////8Pg358hTcDOCAMIAwpAwAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiINKQMAfCAPIARCIIinaiIOKQMAhSIENwMAIAwgDikDCCANKQMIIAwpAwgiBUIgiCAFQv////8Pg358hTcDCCAQIBFBMGoiDWoiDiAENwMAIA4gDCkDCDcDCCAMIAwpAxAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiIOKQMAfCAPIARCIIinaiISKQMAhSIENwMQIAwgEikDCCAOKQMIIAwpAxgiBUIgiCAFQv////8Pg358hTcDGCANIA9qIg0gBDcDACANIAwpAxgiCjcDCCAMIAwpAyAiBEIgiCAEQv////8Pg34gECAEQvD/gYCA/h+DIgSnaiINKQMAfCAPIARCIIinaiIOKQMAhSIJNwMgIAwgDikDCCANKQMIIAwpAygiBEIgiCAEQv////8Pg358hSIINwMoIAwgDCkDMCIEQiCIIARC/////w+DfiAQIARC8P+BgID+H4MiBKdqIg0pAwB8IA8gBEIgiKdqIg4pAwCFIgU3AzAgDCAOKQMIIA0pAwggDCkDOCIEQiCIIARC/////w+DfnyFIgQ3AzggEUFAa0Hw/wFxIREgAiATRwRAIAEgFWoiDSAMKQMAIgY3AwAgDSAMKQMIIgc3AwggDCkDECELIA0gBDcDOCANIAU3AzAgDSAINwMoIA0gCTcDICANIAo3AxggDSALNwMQIAJBAWohAiAPIQ0gECEPIBQhEAwBCwsgAyARNgIMIAMgDzYCCCADIBA2AgQgAyAUNgIAIAwgASATQQZ0akEBEAQLIAxBQGskAAvcCwEIfwJAIABFDQAgAEEIayIDIABBBGsoAgAiAkF4cSIAaiEFAkAgAkEBcQ0AIAJBAnFFDQEgAyADKAIAIgRrIgNB5AsoAgBJDQEgACAEaiEAAkACQAJAQegLKAIAIANHBEAgAygCDCEBIARB/wFNBEAgASADKAIIIgJHDQJB1AtB1AsoAgBBfiAEQQN2d3E2AgAMBQsgAygCGCEHIAEgA0cEQCADKAIIIgIgATYCDCABIAI2AggMBAsgAygCFCICBH8gA0EUagUgAygCECICRQ0DIANBEGoLIQQDQCAEIQYgAiIBQRRqIQQgASgCFCICDQAgAUEQaiEEIAEoAhAiAg0ACyAGQQA2AgAMAwsgBSgCBCICQQNxQQNHDQNB3AsgADYCACAFIAJBfnE2AgQgAyAAQQFyNgIEIAUgADYCAA8LIAIgATYCDCABIAI2AggMAgtBACEBCyAHRQ0AAkAgAygCHCIEQQJ0QYQOaiICKAIAIANGBEAgAiABNgIAIAENAUHYC0HYCygCAEF+IAR3cTYCAAwCCwJAIAMgBygCEEYEQCAHIAE2AhAMAQsgByABNgIUCyABRQ0BCyABIAc2AhggAygCECICBEAgASACNgIQIAIgATYCGAsgAygCFCICRQ0AIAEgAjYCFCACIAE2AhgLIAMgBU8NACAFKAIEIgRBAXFFDQACQAJAAkACQCAEQQJxRQRAQewLKAIAIAVGBEBB7AsgAzYCAEHgC0HgCygCACAAaiIANgIAIAMgAEEBcjYCBCADQegLKAIARw0GQdwLQQA2AgBB6AtBADYCAA8LQegLKAIAIgcgBUYEQEHoCyADNgIAQdwLQdwLKAIAIABqIgA2AgAgAyAAQQFyNgIEIAAgA2ogADYCAA8LIARBeHEgAGohACAFKAIMIQEgBEH/AU0EQCAFKAIIIgIgAUYEQEHUC0HUCygCAEF+IARBA3Z3cTYCAAwFCyACIAE2AgwgASACNgIIDAQLIAUoAhghCCABIAVHBEAgBSgCCCICIAE2AgwgASACNgIIDAMLIAUoAhQiAgR/IAVBFGoFIAUoAhAiAkUNAiAFQRBqCyEEA0AgBCEGIAIiAUEUaiEEIAEoAhQiAg0AIAFBEGohBCABKAIQIgINAAsgBkEANgIADAILIAUgBEF+cTYCBCADIABBAXI2AgQgACADaiAANgIADAMLQQAhAQsgCEUNAAJAIAUoAhwiBEECdEGEDmoiAigCACAFRgRAIAIgATYCACABDQFB2AtB2AsoAgBBfiAEd3E2AgAMAgsCQCAFIAgoAhBGBEAgCCABNgIQDAELIAggATYCFAsgAUUNAQsgASAINgIYIAUoAhAiAgRAIAEgAjYCECACIAE2AhgLIAUoAhQiAkUNACABIAI2AhQgAiABNgIYCyADIABBAXI2AgQgACADaiAANgIAIAMgB0cNAEHcCyAANgIADwsgAEH/AU0EQCAAQXhxQfwLaiECAn9B1AsoAgAiBEEBIABBA3Z0IgBxRQRAQdQLIAAgBHI2AgAgAgwBCyACKAIICyEAIAIgAzYCCCAAIAM2AgwgAyACNgIMIAMgADYCCA8LQR8hASAAQf///wdNBEAgAEEmIABBCHZnIgJrdkEBcSACQQF0a0E+aiEBCyADIAE2AhwgA0IANwIQIAFBAnRBhA5qIQQCfwJAAn9B2AsoAgAiBkEBIAF0IgJxRQRAQdgLIAIgBnI2AgAgBCADNgIAQRghAUEIDAELIABBGSABQQF2a0EAIAFBH0cbdCEBIAQoAgAhBANAIAQiAigCBEF4cSAARg0CIAFBHXYhBCABQQF0IQEgAiAEQQRxaiIGKAIQIgQNAAsgBiADNgIQQRghASACIQRBCAshACADIgIMAQsgAigCCCIEIAM2AgwgAiADNgIIQRghAEEIIQFBAAshBiABIANqIAQ2AgAgAyACNgIMIAAgA2ogBjYCAEH0C0H0CygCAEEBayIAQX8gABs2AgALC9onAQt/IwBBEGsiCiQAAkACQAJAAkACQAJAAkACQAJAAkAgAEH0AU0EQEHUCygCACIEQRAgAEELakH4A3EgAEELSRsiBkEDdiIAdiIBQQNxBEACQCABQX9zQQFxIABqIgJBA3QiAUH8C2oiACABQYQMaigCACIBKAIIIgVGBEBB1AsgBEF+IAJ3cTYCAAwBCyAFIAA2AgwgACAFNgIICyABQQhqIQAgASACQQN0IgJBA3I2AgQgASACaiIBIAEoAgRBAXI2AgQMCwsgBkHcCygCACIITQ0BIAEEQAJAQQIgAHQiAkEAIAJrciABIAB0cWgiAUEDdCIAQfwLaiICIABBhAxqKAIAIgAoAggiBUYEQEHUCyAEQX4gAXdxIgQ2AgAMAQsgBSACNgIMIAIgBTYCCAsgACAGQQNyNgIEIAAgBmoiByABQQN0IgEgBmsiBUEBcjYCBCAAIAFqIAU2AgAgCARAIAhBeHFB/AtqIQFB6AsoAgAhAgJ/IARBASAIQQN2dCIDcUUEQEHUCyADIARyNgIAIAEMAQsgASgCCAshAyABIAI2AgggAyACNgIMIAIgATYCDCACIAM2AggLIABBCGohAEHoCyAHNgIAQdwLIAU2AgAMCwtB2AsoAgAiC0UNASALaEECdEGEDmooAgAiAigCBEF4cSAGayEDIAIhAQNAAkAgASgCECIARQRAIAEoAhQiAEUNAQsgACgCBEF4cSAGayIBIAMgASADSSIBGyEDIAAgAiABGyECIAAhAQwBCwsgAigCGCEJIAIgAigCDCIARwRAIAIoAggiASAANgIMIAAgATYCCAwKCyACKAIUIgEEfyACQRRqBSACKAIQIgFFDQMgAkEQagshBQNAIAUhByABIgBBFGohBSAAKAIUIgENACAAQRBqIQUgACgCECIBDQALIAdBADYCAAwJC0F/IQYgAEG/f0sNACAAQQtqIgFBeHEhBkHYCygCACIHRQ0AQR8hCEEAIAZrIQMgAEH0//8HTQRAIAZBJiABQQh2ZyIAa3ZBAXEgAEEBdGtBPmohCAsCQAJAAkAgCEECdEGEDmooAgAiAUUEQEEAIQAMAQtBACEAIAZBGSAIQQF2a0EAIAhBH0cbdCECA0ACQCABKAIEQXhxIAZrIgQgA08NACABIQUgBCIDDQBBACEDIAEhAAwDCyAAIAEoAhQiBCAEIAEgAkEddkEEcWooAhAiAUYbIAAgBBshACACQQF0IQIgAQ0ACwsgACAFckUEQEEAIQVBAiAIdCIAQQAgAGtyIAdxIgBFDQMgAGhBAnRBhA5qKAIAIQALIABFDQELA0AgACgCBEF4cSAGayICIANJIQEgAiADIAEbIQMgACAFIAEbIQUgACgCECIBBH8gAQUgACgCFAsiAA0ACwsgBUUNACADQdwLKAIAIAZrTw0AIAUoAhghCCAFIAUoAgwiAEcEQCAFKAIIIgEgADYCDCAAIAE2AggMCAsgBSgCFCIBBH8gBUEUagUgBSgCECIBRQ0DIAVBEGoLIQIDQCACIQQgASIAQRRqIQIgACgCFCIBDQAgAEEQaiECIAAoAhAiAQ0ACyAEQQA2AgAMBwsgBkHcCygCACIFTQRAQegLKAIAIQACQCAFIAZrIgFBEE8EQCAAIAZqIgIgAUEBcjYCBCAAIAVqIAE2AgAgACAGQQNyNgIEDAELIAAgBUEDcjYCBCAAIAVqIgEgASgCBEEBcjYCBEEAIQJBACEBC0HcCyABNgIAQegLIAI2AgAgAEEIaiEADAkLIAZB4AsoAgAiAkkEQEHgCyACIAZrIgE2AgBB7AtB7AsoAgAiACAGaiICNgIAIAIgAUEBcjYCBCAAIAZBA3I2AgQgAEEIaiEADAkLQQAhACAGQS9qIgMCf0GsDygCAARAQbQPKAIADAELQbgPQn83AgBBsA9CgKCAgICABDcCAEGsDyAKQQxqQXBxQdiq1aoFczYCAEHAD0EANgIAQZAPQQA2AgBBgCALIgFqIgRBACABayIHcSIBIAZNDQhBjA8oAgAiBQRAQYQPKAIAIgggAWoiCSAITQ0JIAUgCUkNCQsCQEGQDy0AAEEEcUUEQAJAAkACQAJAQewLKAIAIgUEQEGUDyEAA0AgACgCACIIIAVNBEAgBSAIIAAoAgRqSQ0DCyAAKAIIIgANAAsLQQAQBiICQX9GDQMgASEEQbAPKAIAIgBBAWsiBSACcQRAIAEgAmsgAiAFakEAIABrcWohBAsgBCAGTQ0DQYwPKAIAIgAEQEGEDygCACIFIARqIgcgBU0NBCAAIAdJDQQLIAQQBiIAIAJHDQEMBQsgBCACayAHcSIEEAYiAiAAKAIAIAAoAgRqRg0BIAIhAAsgAEF/Rg0BIAZBMGogBE0EQCAAIQIMBAtBtA8oAgAiAiADIARrakEAIAJrcSICEAZBf0YNASACIARqIQQgACECDAMLIAJBf0cNAgtBkA9BkA8oAgBBBHI2AgALIAEQBiECQQAQBiEAIAJBf0YNBSAAQX9GDQUgACACTQ0FIAAgAmsiBCAGQShqTQ0FC0GED0GEDygCACAEaiIANgIAQYgPKAIAIABJBEBBiA8gADYCAAsCQEHsCygCACIDBEBBlA8hAANAIAIgACgCACIBIAAoAgQiBWpGDQIgACgCCCIADQALDAQLQeQLKAIAIgBBACAAIAJNG0UEQEHkCyACNgIAC0EAIQBBmA8gBDYCAEGUDyACNgIAQfQLQX82AgBB+AtBrA8oAgA2AgBBoA9BADYCAANAIABBA3QiAUGEDGogAUH8C2oiBTYCACABQYgMaiAFNgIAIABBAWoiAEEgRw0AC0HgCyAEQShrIgBBeCACa0EHcSIBayIFNgIAQewLIAEgAmoiATYCACABIAVBAXI2AgQgACACakEoNgIEQfALQbwPKAIANgIADAQLIAIgA00NAiABIANLDQIgACgCDEEIcQ0CIAAgBCAFajYCBEHsCyADQXggA2tBB3EiAGoiATYCAEHgC0HgCygCACAEaiICIABrIgA2AgAgASAAQQFyNgIEIAIgA2pBKDYCBEHwC0G8DygCADYCAAwDC0EAIQAMBgtBACEADAQLQeQLKAIAIAJLBEBB5AsgAjYCAAsgAiAEaiEFQZQPIQACQANAIAUgACgCACIBRwRAIAAoAggiAA0BDAILCyAALQAMQQhxRQ0DC0GUDyEAA0ACQCAAKAIAIgEgA00EQCADIAEgACgCBGoiBUkNAQsgACgCCCEADAELC0HgCyAEQShrIgBBeCACa0EHcSIBayIHNgIAQewLIAEgAmoiATYCACABIAdBAXI2AgQgACACakEoNgIEQfALQbwPKAIANgIAIAMgBUEnIAVrQQdxakEvayIAIAAgA0EQakkbIgFBGzYCBCABQZwPKQIANwIQIAFBlA8pAgA3AghBnA8gAUEIajYCAEGYDyAENgIAQZQPIAI2AgBBoA9BADYCACABQRhqIQADQCAAQQc2AgQgAEEIaiAAQQRqIQAgBUkNAAsgASADRg0AIAEgASgCBEF+cTYCBCADIAEgA2siAkEBcjYCBCABIAI2AgACfyACQf8BTQRAIAJBeHFB/AtqIQACf0HUCygCACIBQQEgAkEDdnQiAnFFBEBB1AsgASACcjYCACAADAELIAAoAggLIQEgACADNgIIIAEgAzYCDEEMIQJBCAwBC0EfIQAgAkH///8HTQRAIAJBJiACQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAAsgAyAANgIcIANCADcCECAAQQJ0QYQOaiEBAkACQEHYCygCACIFQQEgAHQiBHFFBEBB2AsgBCAFcjYCACABIAM2AgAMAQsgAkEZIABBAXZrQQAgAEEfRxt0IQAgASgCACEFA0AgBSIBKAIEQXhxIAJGDQIgAEEddiEFIABBAXQhACABIAVBBHFqIgQoAhAiBQ0ACyAEIAM2AhALIAMgATYCGEEIIQIgAyIBIQBBDAwBCyABKAIIIgAgAzYCDCABIAM2AgggAyAANgIIQQAhAEEYIQJBDAsgA2ogATYCACACIANqIAA2AgALQeALKAIAIgAgBk0NAEHgCyAAIAZrIgE2AgBB7AtB7AsoAgAiACAGaiICNgIAIAIgAUEBcjYCBCAAIAZBA3I2AgQgAEEIaiEADAQLQcgLQTA2AgBBACEADAMLIAAgAjYCACAAIAAoAgQgBGo2AgQgAkF4IAJrQQdxaiIIIAZBA3I2AgQgAUF4IAFrQQdxaiIEIAYgCGoiA2shBwJAQewLKAIAIARGBEBB7AsgAzYCAEHgC0HgCygCACAHaiIANgIAIAMgAEEBcjYCBAwBC0HoCygCACAERgRAQegLIAM2AgBB3AtB3AsoAgAgB2oiADYCACADIABBAXI2AgQgACADaiAANgIADAELIAQoAgQiAEEDcUEBRgRAIABBeHEhCSAEKAIMIQICQCAAQf8BTQRAIAQoAggiASACRgRAQdQLQdQLKAIAQX4gAEEDdndxNgIADAILIAEgAjYCDCACIAE2AggMAQsgBCgCGCEGAkAgAiAERwRAIAQoAggiACACNgIMIAIgADYCCAwBCwJAIAQoAhQiAAR/IARBFGoFIAQoAhAiAEUNASAEQRBqCyEBA0AgASEFIAAiAkEUaiEBIAAoAhQiAA0AIAJBEGohASACKAIQIgANAAsgBUEANgIADAELQQAhAgsgBkUNAAJAIAQoAhwiAEECdEGEDmoiASgCACAERgRAIAEgAjYCACACDQFB2AtB2AsoAgBBfiAAd3E2AgAMAgsCQCAEIAYoAhBGBEAgBiACNgIQDAELIAYgAjYCFAsgAkUNAQsgAiAGNgIYIAQoAhAiAARAIAIgADYCECAAIAI2AhgLIAQoAhQiAEUNACACIAA2AhQgACACNgIYCyAHIAlqIQcgBCAJaiIEKAIEIQALIAQgAEF+cTYCBCADIAdBAXI2AgQgAyAHaiAHNgIAIAdB/wFNBEAgB0F4cUH8C2ohAAJ/QdQLKAIAIgFBASAHQQN2dCICcUUEQEHUCyABIAJyNgIAIAAMAQsgACgCCAshASAAIAM2AgggASADNgIMIAMgADYCDCADIAE2AggMAQtBHyECIAdB////B00EQCAHQSYgB0EIdmciAGt2QQFxIABBAXRrQT5qIQILIAMgAjYCHCADQgA3AhAgAkECdEGEDmohAAJAAkBB2AsoAgAiAUEBIAJ0IgVxRQRAQdgLIAEgBXI2AgAgACADNgIADAELIAdBGSACQQF2a0EAIAJBH0cbdCECIAAoAgAhAQNAIAEiACgCBEF4cSAHRg0CIAJBHXYhASACQQF0IQIgACABQQRxaiIFKAIQIgENAAsgBSADNgIQCyADIAA2AhggAyADNgIMIAMgAzYCCAwBCyAAKAIIIgEgAzYCDCAAIAM2AgggA0EANgIYIAMgADYCDCADIAE2AggLIAhBCGohAAwCCwJAIAhFDQACQCAFKAIcIgFBAnRBhA5qIgIoAgAgBUYEQCACIAA2AgAgAA0BQdgLIAdBfiABd3EiBzYCAAwCCwJAIAUgCCgCEEYEQCAIIAA2AhAMAQsgCCAANgIUCyAARQ0BCyAAIAg2AhggBSgCECIBBEAgACABNgIQIAEgADYCGAsgBSgCFCIBRQ0AIAAgATYCFCABIAA2AhgLAkAgA0EPTQRAIAUgAyAGaiIAQQNyNgIEIAAgBWoiACAAKAIEQQFyNgIEDAELIAUgBkEDcjYCBCAFIAZqIgQgA0EBcjYCBCADIARqIAM2AgAgA0H/AU0EQCADQXhxQfwLaiEAAn9B1AsoAgAiAUEBIANBA3Z0IgJxRQRAQdQLIAEgAnI2AgAgAAwBCyAAKAIICyEBIAAgBDYCCCABIAQ2AgwgBCAANgIMIAQgATYCCAwBC0EfIQAgA0H///8HTQRAIANBJiADQQh2ZyIAa3ZBAXEgAEEBdGtBPmohAAsgBCAANgIcIARCADcCECAAQQJ0QYQOaiEBAkACQCAHQQEgAHQiAnFFBEBB2AsgAiAHcjYCACABIAQ2AgAgBCABNgIYDAELIANBGSAAQQF2a0EAIABBH0cbdCEAIAEoAgAhAQNAIAEiAigCBEF4cSADRg0CIABBHXYhASAAQQF0IQAgAiABQQRxaiIHKAIQIgENAAsgByAENgIQIAQgAjYCGAsgBCAENgIMIAQgBDYCCAwBCyACKAIIIgAgBDYCDCACIAQ2AgggBEEANgIYIAQgAjYCDCAEIAA2AggLIAVBCGohAAwBCwJAIAlFDQACQCACKAIcIgFBAnRBhA5qIgUoAgAgAkYEQCAFIAA2AgAgAA0BQdgLIAtBfiABd3E2AgAMAgsCQCACIAkoAhBGBEAgCSAANgIQDAELIAkgADYCFAsgAEUNAQsgACAJNgIYIAIoAhAiAQRAIAAgATYCECABIAA2AhgLIAIoAhQiAUUNACAAIAE2AhQgASAANgIYCwJAIANBD00EQCACIAMgBmoiAEEDcjYCBCAAIAJqIgAgACgCBEEBcjYCBAwBCyACIAZBA3I2AgQgAiAGaiIFIANBAXI2AgQgAyAFaiADNgIAIAgEQCAIQXhxQfwLaiEAQegLKAIAIQECf0EBIAhBA3Z0IgcgBHFFBEBB1AsgBCAHcjYCACAADAELIAAoAggLIQQgACABNgIIIAQgATYCDCABIAA2AgwgASAENgIIC0HoCyAFNgIAQdwLIAM2AgALIAJBCGohAAsgCkEQaiQAIAALyRACB38CfiMAQcAIayIFJAAgBEFhSQRAAkACQCAEQR9xDQAgAkE8cUEzSw0AIAVB0ANqIABBICAFQbABaiAFQdAAaiAFQZABahANAkAgAkUiCA0AIAUgBSkD8AMiDCACrUIDhnw3A/ADIAVB+ANqIgkgDKdBA3ZBP3EiB2ohBkHAACAHayIHIAJLBEAgCA0BIAYgASAC/AoAAAwBCyAHBEAgBiABIAf8CgAACyAFQdADaiAJIAVBsAFqIAVBsANqIggQAyABIAdqIQYgAiAHayIHQcAATwRAA0AgBUHQA2ogBiAFQbABaiAIEAMgBkFAayEGIAdBQGoiB0E/Sw0ACwsgB0UNACAJIAYgB/wKAAALIAUgBSkD8AMiDEIgfCINNwPwAyAFQfgDaiIHIAynQQN2QT9xIgZqIQkCQCAGQTtNBEAgCUEANgAADAELQcAAIAZrIggEQCAJQQAgCPwLAAsgBUHQA2ogByAFQbABaiAFQbADahADIAZBPGsiCARAIAdBqAkgBmsgCPwKAAALIAUpA/ADIQ0LIA1C+AODIAxC+AODVA0AIAVB0ANqIAVB0ABqIgYgBUGwAWoiCBAVDQAgBSAFKQPYBEKAAnw3A9gEIAVBuARqIAYgCBAVGiAERQ0BIAVB4ARqIQggBUGwA2ohBkEAIQFBACECA0AgCSACQQFqIgJBGHQgAkGA/gNxQQh0ciACQQh2QYD+A3EgAkEYdnJyNgAAIAUgBSkD6AM3A2ggBSAFKQPgAzcDYCAFIAUpA9gDNwNYIAUgBSkD0AM3A1AgBUHQAGoiCiAHIAVBsAFqIgsgBhADIAUgBSgCbCIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC/AQgBSAFKAJYIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLoBCAFIAUoAlAiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AuAEIAUgBSgCVCIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC5AQgBSAFKAJcIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgLsBCAFIAUoAmAiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2AvAEIAUgBSgCZCIAQRh0IABBgP4DcUEIdHIgAEEIdkGA/gNxIABBGHZycjYC9AQgBSAFKAJoIgBBGHQgAEGA/gNxQQh0ciAAQQh2QYD+A3EgAEEYdnJyNgL4BCAFIAUpAtAENwNoIAUgBSkCwAQ3A1ggBSAFKQLIBDcDYCAFIAUpArgENwNQIAogCCALIAYQAyABIANqIgAgBSgCUCIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYAACAAIAUoAlQiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2AAQgACAFKAJYIgFBGHQgAUGA/gNxQQh0ciABQQh2QYD+A3EgAUEYdnJyNgAIIAAgBSgCXCIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYADCAAIAUoAmAiAUEYdCABQYD+A3FBCHRyIAFBCHZBgP4DcSABQRh2cnI2ABAgACAFKAJkIgFBGHQgAUGA/gNxQQh0ciABQQh2QYD+A3EgAUEYdnJyNgAUIAAgBSgCaCIBQRh0IAFBgP4DcUEIdHIgAUEIdkGA/gNxIAFBGHZycjYAGCAAIAUoAmwiAEEYdCAAQYD+A3FBCHRyIABBCHZBgP4DcSAAQRh2cnI2ABwgAkEFdCIBIARJDQALDAELIAVB8AZqIgYgAEEgIAVBsAFqIAVB0ABqIAVBkAFqEA0gBUGgBWogBkHQAfwKAAACQCACRSIJDQAgBSAFKQPABSIMIAKtQgOGfDcDwAUgBUHIBWoiByAMp0EDdkE/cSIAaiEGQcAAIABrIgAgAksEQCAJDQEgBiABIAL8CgAADAELIAAEQCAGIAEgAPwKAAALIAVBoAVqIAcgBUGwAWogBUGwA2oiCRADIAAgAWohBiACIABrIgJBwABPBEADQCAFQaAFaiAGIAVBsAFqIAkQAyAGQUBrIQYgAkFAaiICQT9LDQALCyACRQ0AIAcgBiAC/AoAAAsgBEUNACAFQbgEaiEJIAVBsANqIQggBUH4A2ohASAFQeAEaiEGQQAhAgNAIAUgAkEBaiICQRh0IAJBgP4DcUEIdHIgAkEIdkGA/gNxIAJBGHZycjYCTCAFQdADaiAFQaAFakHQAfwKAAAgBSAFKQPwAyIMQiB8NwPwAyABIAynQQN2QT9xIgBqIQcCQCAAQTtNBEAgByAFKAJMNgAADAELQcAAIABrIgoEQCAHIAVBzABqIAr8CgAACyAFQdADaiABIAVBsAFqIAgQAyAAQTxrIgBFDQAgASAFQcwAaiAKaiAA/AoAAAsgBUHQAGogBUHQA2ogBUGwAWoQByAFIAUpA9gEIgxCgAJ8NwPYBCAGIAynQQN2QT9xIgdqIQACQCAHQR9NBEAgACAFKQNQNwAAIAAgBSkDaDcAGCAAIAUpA2A3ABAgACAFKQNYNwAIDAELQcAAIAdrIgoEQCAAIAVB0ABqIAr8CgAACyAJIAYgBUGwAWogCBADIAdBIGsiAEUNACAGIAVB0ABqIApqIAD8CgAACyAFIAkgBUGwAWoQB0EgIAQgC2siACAAQSBPGyIABEAgAyALaiAFIAD8CgAACyACQQV0IgsgBEkNAAsLIAVBwAhqJAAPC0HFCEGgCEGuBEG3CBACAAudCwIFfwF+AkACQAJ/IAJBwQBPBEAgAEGYCCkDADcDGCAAQZAIKQMANwMQIABBiAgpAwA3AwggAEGACCkDADcDACAAIAKtQgOGNwMgIAAgASkAADcAKCAAIAEpAAg3ADAgACABKQAQNwA4IABBQGsgASkAGDcAACAAIAEpACA3AEggACABKQAoNwBQIAAgASkAMDcAWCAAIAEpADg3AGAgACAAQShqIgggAyADQYACaiIHEAMgAUFAayEGIAJBQGoiAUHAAE8EQANAIAAgBiADIAcQAyAGQUBrIQYgAUFAaiIBQT9LDQALCyABBEAgCCAGIAH8CgAACyAFIAAgAxAHIABCADcDICAAQYAIKQMANwMAIABBiAgpAwA3AwggAEGQCCkDADcDECAAQZgIKQMANwMYIARCtuzYsePGjZs2NwAAIARCtuzYsePGjZs2NwAIIARCtuzYsePGjZs2NwAQIARCtuzYsePGjZs2NwAYIARCtuzYsePGjZs2NwAgIARCtuzYsePGjZs2NwAoIARCtuzYsePGjZs2NwAwIARCtuzYsePGjZs2NwA4QSAMAQsgAEIANwMgIABBgAgpAwA3AwAgAEGICCkDADcDCCAAQZAIKQMANwMQIABBmAgpAwA3AxggBEK27Nix48aNmzY3AAAgBEK27Nix48aNmzY3AAggBEK27Nix48aNmzY3ABAgBEK27Nix48aNmzY3ABggBEK27Nix48aNmzY3ACAgBEK27Nix48aNmzY3ACggBEK27Nix48aNmzY3ADAgBEK27Nix48aNmzY3ADggAkUNASABIQUgAgshCEEAIQJBACEGIAhBBE8EQCAIQfwAcSEHQQAhAQNAIAQgBmoiCiAKLQAAIAUgBmotAABzOgAAIAQgBkEBciIKaiIJIAktAAAgBSAKai0AAHM6AAAgBCAGQQJyIgpqIgkgCS0AACAFIApqLQAAczoAACAEIAZBA3IiCmoiCSAJLQAAIAUgCmotAABzOgAAIAZBBGohBiABQQRqIgEgB0cNAAsLIAhBA3EiAQRAA0AgBCAGaiIHIActAAAgBSAGai0AAHM6AAAgBkEBaiEGIAJBAWoiAiABRw0AC0EAIQILIAUhAQwBC0EBIQILIAAgACkDICILQoAEfDcDICAAQShqIQVBwAAgC6dBA3ZBP3EiBmsiBwRAIAUgBmogBCAH/AoAAAsgACAFIAMgA0GAAmoiChADIAYEQCAFIAQgB2ogBvwKAAALIABCADcDiAFBACEGIABBgAgpAwA3A2ggAEGICCkDADcDcCAAQZAIKQMANwN4IABBmAgpAwA3A4ABIARC3Ljx4sWLl67cADcAACAEQty48eLFi5eu3AA3AAggBELcuPHixYuXrtwANwAQIARC3Ljx4sWLl67cADcAGCAEQty48eLFi5eu3AA3ACAgBELcuPHixYuXrtwANwAoIARC3Ljx4sWLl67cADcAMCAEQty48eLFi5eu3AA3ADgCQCACDQAgCEEBa0EDTwRAIAhBfHEhAkEAIQUDQCAEIAZqIgcgBy0AACABIAZqLQAAczoAACAEIAZBAXIiB2oiCSAJLQAAIAEgB2otAABzOgAAIAQgBkECciIHaiIJIAktAAAgASAHai0AAHM6AAAgBCAGQQNyIgdqIgkgCS0AACABIAdqLQAAczoAACAGQQRqIQYgBUEEaiIFIAJHDQALCyAIQQNxIgJFDQBBACEFA0AgBCAGaiIIIAgtAAAgASAGai0AAHM6AAAgBkEBaiEGIAVBAWoiBSACRw0ACwsgACAAKQOIASILQoAEfDcDiAEgAEGQAWohAUHAACALp0EDdkE/cSICayIFBEAgASACaiAEIAX8CgAACyAAQegAaiABIAMgChADIAIEQCABIAQgBWogAvwKAAALCwIAC5cnAjt+Ln8jAEFAaiJDJAAgASACQQd0QUBqIkBqIkEpAzggACBAaiJAKQM4hSEJIEEpAzAgQCkDMIUhBSBBKQMoIEApAyiFIQggQSkDICBAKQMghSEGIEEpAxggQCkDGIUhEiBBKQMQIEApAxCFIQogQSkDCCBAKQMIhSEOIEEpAwAgQCkDAIUhByACQQF0QQJrIWRBACECA0AgACACQQZ0IkJqIkEpAwAhCyBBKQMIIRAgQSkDECEMIEEpAxghESBBKQMgIQ0gQSkDKCETIEEpAzAhDyABIEJqIkAgQSkDOCBAKQM4hSIUNwM4IEAgDyBAKQMwhSIPNwMwIEAgEyBAKQMohSITNwMoIEAgDSBAKQMghSINNwMgIEAgESBAKQMYhSIRNwMYIEAgDCBAKQMQhSIMNwMQIEAgECBAKQMIhSIQNwMIIEAgCyBAKQMAhSILNwMAIAQgAyADIAMgAyADIAcgC4UiB0Lwn4CAgP4DgyILp2oiQCkDACAHQv////8PgyAHQiCIfnwgBCALQiCIp2oiUCkDAIUiB0Lwn4CAgP4DgyILp2oiUSkDACAHQv////8PgyAHQiCIfnwgBCALQiCIp2oiUikDAIUiB0Lwn4CAgP4DgyILp2oiUykDACAHQv////8PgyAHQiCIfnwgBCALQiCIp2oiVCkDAIUiB0Lwn4CAgP4DgyILp2oiVSkDACAHQv////8PgyAHQiCIfnwgBCALQiCIp2oiRCkDAIUiB0Lwn4CAgP4DgyILp2oiRSkDACAHQv////8PgyAHQiCIfnwgBCALQiCIp2oiVikDAIUiB0Lwn4CAgP4DgyILQiCIp2oiRikDACEVIAMgC6dqIkcpAwAhCyBGKQMIIRYgRykDCCEXIAQgAyADIAMgAyADIAogDIUiCkLwn4CAgP4DgyIMp2oiRikDACAKQv////8PgyAKQiCIfnwgBCAMQiCIp2oiRykDAIUiCkLwn4CAgP4DgyIMp2oiVykDACAKQv////8PgyAKQiCIfnwgBCAMQiCIp2oiWCkDAIUiCkLwn4CAgP4DgyIMp2oiWSkDACAKQv////8PgyAKQiCIfnwgBCAMQiCIp2oiSCkDAIUiCkLwn4CAgP4DgyIMp2oiSSkDACAKQv////8PgyAKQiCIfnwgBCAMQiCIp2oiWikDAIUiCkLwn4CAgP4DgyIMp2oiWykDACAKQv////8PgyAKQiCIfnwgBCAMQiCIp2oiXCkDAIUiCkLwn4CAgP4DgyIMQiCIp2oiSikDACEYIAMgDKdqIkspAwAhDCBKKQMIIRkgSykDCCEaIAQgAyADIAMgAyADIAYgDYUiBkLwn4CAgP4DgyINp2oiSikDACAGQv////8PgyAGQiCIfnwgBCANQiCIp2oiSykDAIUiBkLwn4CAgP4DgyINp2oiXSkDACAGQv////8PgyAGQiCIfnwgBCANQiCIp2oiTCkDAIUiBkLwn4CAgP4DgyINp2oiTSkDACAGQv////8PgyAGQiCIfnwgBCANQiCIp2oiXikDAIUiBkLwn4CAgP4DgyINp2oiXykDACAGQv////8PgyAGQiCIfnwgBCANQiCIp2oiYCkDAIUiBkLwn4CAgP4DgyINp2oiYSkDACAGQv////8PgyAGQiCIfnwgBCANQiCIp2oiYikDAIUiBkLwn4CAgP4DgyINQiCIp2oiTikDACEbIAMgDadqIk8pAwAhDSBOKQMIIRwgTykDCCEdIAQgAyADIAMgAyADIAUgD4UiBULwn4CAgP4DgyIPp2oiTikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiTykDAIUiBULwn4CAgP4DgyIPp2oiYykDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiZSkDAIUiBULwn4CAgP4DgyIPp2oiZikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiZykDAIUiBULwn4CAgP4DgyIPp2oiaCkDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiaSkDAIUiBULwn4CAgP4DgyIPp2oiaikDACAFQv////8PgyAFQiCIfnwgBCAPQiCIp2oiaykDAIUiBULwn4CAgP4DgyIPQiCIp2oibCkDACEeIAMgD6dqIm0pAwAhDyBWKQMIIR8gRSkDCCEgIFwpAwghISBbKQMIISIgYikDCCEjIGEpAwghJCBEKQMIISUgVSkDCCEmIFopAwghJyBJKQMIISggYCkDCCEpIF8pAwghKiBUKQMIISsgUykDCCEsIEgpAwghLSBZKQMIIS4gXikDCCEvIE0pAwghMCBSKQMIITEgUSkDCCEyIFgpAwghMyBXKQMIITQgTCkDCCE1IF0pAwghNiBQKQMIITcgQCkDCCE4IEcpAwghOSBGKQMIITogSykDCCE7IEopAwghPCBBIGwpAwggbSkDCCBrKQMIIGopAwggaSkDCCBoKQMIIGcpAwggZikDCCBlKQMIIGMpAwggTykDCCBOKQMIIAkgFIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiFDcDOCBBIB4gDyAFQv////8PgyAFQiCIfnyFIgk3AzAgQSAcIB0gIyAkICkgKiAvIDAgNSA2IDsgPCAIIBOFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIhM3AyggQSAbIA0gBkL/////D4MgBkIgiH58hSIFNwMgIEEgGSAaICEgIiAnICggLSAuIDMgNCA5IDogESAShSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSISNwMYIEEgGCAMIApC/////w+DIApCIIh+fIUiCDcDECBBIBYgFyAfICAgJSAmICsgLCAxIDIgNyA4IA4gEIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiCjcDCCBBIBUgCyAHQv////8PgyAHQiCIfnyFIgY3AwAgACBCQcAAciJAaiJBKQMAIQ4gQSkDCCEHIEEpAxAhCyBBKQMYIRAgQSkDICEMIEEpAyghESBBKQMwIQ0gASBAaiJAIEEpAzggQCkDOIUiDzcDOCBAIA0gQCkDMIUiDTcDMCBAIBEgQCkDKIUiETcDKCBAIAwgQCkDIIUiDDcDICBAIBAgQCkDGIUiEDcDGCBAIAsgQCkDEIUiCzcDECBAIAcgQCkDCIUiFTcDCCBAIA4gQCkDAIUiDjcDACAEIAMgAyADIAMgCSANhSIJQvCfgICA/gODIgenaiJAKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJCKQMAhSIJQvCfgICA/gODIgenaiJQKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJRKQMAhSIJQvCfgICA/gODIgenaiJSKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJTKQMAhSIJQvCfgICA/gODIgenaiJUKQMAIAlC/////w+DIAlCIIh+fCAEIAdCIIinaiJVKQMAhSIJQvCfgICA/gODIgdCIIinaiJEKQMIIQ0gAyAHp2oiRSkDCCEWIEQpAwAhFyBFKQMAIRggBCADIAMgAyADIAUgDIUiBULwn4CAgP4DgyIHp2oiRCkDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiRSkDAIUiBULwn4CAgP4DgyIHp2oiVikDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiRikDAIUiBULwn4CAgP4DgyIHp2oiRykDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiVykDAIUiBULwn4CAgP4DgyIHp2oiWCkDACAFQv////8PgyAFQiCIfnwgBCAHQiCIp2oiWSkDAIUiBULwn4CAgP4DgyIHQiCIp2oiSCkDCCEMIAMgB6dqIkkpAwghGSBIKQMAIRogSSkDACEbIAQgAyADIAMgAyAIIAuFIghC8J+AgID+A4MiB6dqIkgpAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIkkpAwCFIghC8J+AgID+A4MiB6dqIlopAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIlspAwCFIghC8J+AgID+A4MiB6dqIlwpAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIkopAwCFIghC8J+AgID+A4MiB6dqIkspAwAgCEL/////D4MgCEIgiH58IAQgB0IgiKdqIl0pAwCFIghC8J+AgID+A4MiB0IgiKdqIkwpAwghCyADIAenaiJNKQMIIRwgTCkDACEdIE0pAwAhHiAEIAMgAyADIAMgBiAOhSIGQvCfgICA/gODIg6naiJMKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJNKQMAhSIGQvCfgICA/gODIg6naiJeKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJfKQMAhSIGQvCfgICA/gODIg6naiJgKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJhKQMAhSIGQvCfgICA/gODIg6naiJiKQMAIAZC/////w+DIAZCIIh+fCAEIA5CIIinaiJOKQMAhSIGQvCfgICA/gODIg5CIIinaiJPKQMIIR8gAyAOp2oiYykDCCEOIFUpAwghICBUKQMIISEgWSkDCCEiIFgpAwghIyBdKQMIISQgSykDCCElIE4pAwghJiBiKQMIIScgUykDCCEoIFIpAwghKSBXKQMIISogRykDCCErIEopAwghLCBcKQMIIS0gYSkDCCEuIGApAwghLyBRKQMIITAgUCkDCCExIEYpAwghMiBWKQMIITMgWykDCCE0IFopAwghNSBfKQMIITYgXikDCCE3IEIpAwghOCBAKQMIITkgRSkDCCE6IEQpAwghOyBJKQMIITwgSCkDCCE9IE0pAwghPiBMKQMIIT8gQyADIE8pAwAgYykDACAGQv////8PgyAGQiCIfnyFIgZC8J+AgID+A4MiB6dqIkApAwAgBkL/////D4MgBkIgiH58IAQgB0IgiKdqIkIpAwCFIgc3AwAgQyBCKQMIIEApAwggHyAOICYgJyAuIC8gNiA3ID4gPyAKIBWFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIgZCIIggBkL/////D4N+fIUiBkIgiCAGQv////8Pg358hSIGQiCIIAZC/////w+DfnyFIg43AwggQyADIB0gHiAIQv////8PgyAIQiCIfnyFIghC8J+AgID+A4MiBqdqIkApAwAgCEL/////D4MgCEIgiH58IAQgBkIgiKdqIkIpAwCFIgo3AxAgQyBCKQMIIEApAwggCyAcICQgJSAsIC0gNCA1IDwgPSAQIBKFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIghCIIggCEL/////D4N+fIUiCEIgiCAIQv////8Pg358hSIIQiCIIAhC/////w+DfnyFIhI3AxggQyADIBogGyAFQv////8PgyAFQiCIfnyFIgVC8J+AgID+A4MiCKdqIkApAwAgBUL/////D4MgBUIgiH58IAQgCEIgiKdqIkIpAwCFIgY3AyAgQyBCKQMIIEApAwggDCAZICIgIyAqICsgMiAzIDogOyARIBOFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgVCIIggBUL/////D4N+fIUiBUIgiCAFQv////8Pg358hSIFQiCIIAVC/////w+DfnyFIgg3AyggQyADIBcgGCAJQv////8PgyAJQiCIfnyFIglC8J+AgID+A4MiBadqIkApAwAgCUL/////D4MgCUIgiH58IAQgBUIgiKdqIkIpAwCFIgU3AzAgQyBCKQMIIEApAwggDSAWICAgISAoICkgMCAxIDggOSAPIBSFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIgk3AzggAiBkT0UEQCBBIAk3AzggQSAFNwMwIEEgCDcDKCBBIAY3AyAgQSASNwMYIEEgCjcDECBBIA43AwggQSAHNwMAIAJBAmohAgwBCwsgQyBBQQQQBCBDKAIAIENBQGskAAuRFAIJfhB/IwBBQGoiDyQAAkAgA0UEQCMAQUBqIgIkACAAKQN4IQkgACkDcCEFIAApA2ghCiAAKQNgIQYgACkDWCELIAApA1AhByAAKQNIIQwgAiAAKQNAIgggACkDAIU3AwAgAiAMIAApAwiFNwMIIAIgByAAKQMQhTcDECACIAsgACkDGIU3AxggAiAGIAApAyCFNwMgIAIgCiAAKQMohTcDKCACIAUgACkDMIU3AzAgAiAJIAApAziFNwM4IAIgAUEEEAQgAiAIIAIpAwCFNwMAIAIgDCACKQMIhTcDCCACIAcgAikDEIU3AxAgAiALIAIpAxiFNwMYIAIgBiACKQMghTcDICACIAogAikDKIU3AyggAiAFIAIpAzCFNwMwIAIgCSACKQM4hTcDOCACIAFBQGtBBBAEIAJBQGskAAwBCyADKAIEIQ0gAygCACEDIAAgAkEBdEEBayIbQQZ0aiICKQM4IQkgAikDMCEFIAIpAyghCiACKQMgIQYgAikDGCELIAIpAxAhByACKQMIIQwgAikDACEIA0AgAyADIAMgAyADIAMgACAaQQZ0IhxqIgIpAzAgBYUiBULwn4CAgP4DgyIEp2oiDikDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiECkDAIUiBULwn4CAgP4DgyIEp2oiESkDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiEikDAIUiBULwn4CAgP4DgyIEp2oiEykDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiFCkDAIUiBULwn4CAgP4DgyIEp2oiFSkDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiFikDAIUiBULwn4CAgP4DgyIEp2oiFykDACAFQv////8PgyAFQiCIfnwgDSAEQiCIp2oiGCkDAIUiBULwn4CAgP4DgyIEp2oiGSkDCCAYKQMIIBcpAwggFikDCCAVKQMIIBQpAwggEykDCCASKQMIIBEpAwggECkDCCAOKQMIIAIpAzggCYUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fIUiCUIgiCAJQv////8Pg358hSIJQiCIIAlC/////w+DfnyFIglCIIggCUL/////D4N+fCANIARCIIinaiIOKQMIhSEJIA4pAwAgGSkDACAFQv////8PgyAFQiCIfnyFIQUgAyADIAMgAyADIAMgAikDICAGhSIGQvCfgICA/gODIgSnaiIOKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIQKQMAhSIGQvCfgICA/gODIgSnaiIRKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiISKQMAhSIGQvCfgICA/gODIgSnaiITKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIUKQMAhSIGQvCfgICA/gODIgSnaiIVKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIWKQMAhSIGQvCfgICA/gODIgSnaiIXKQMAIAZC/////w+DIAZCIIh+fCANIARCIIinaiIYKQMAhSIGQvCfgICA/gODIgSnaiIZKQMIIBgpAwggFykDCCAWKQMIIBUpAwggFCkDCCATKQMIIBIpAwggESkDCCAQKQMIIA4pAwggAikDKCAKhSIKQiCIIApC/////w+DfnyFIgpCIIggCkL/////D4N+fIUiCkIgiCAKQv////8Pg358hSIKQiCIIApC/////w+DfnyFIgpCIIggCkL/////D4N+fIUiCkIgiCAKQv////8Pg358IA0gBEIgiKdqIg4pAwiFIQogDikDACAZKQMAIAZC/////w+DIAZCIIh+fIUhBiADIAMgAyADIAMgAyACKQMQIAeFIgdC8J+AgID+A4MiBKdqIg4pAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhApAwCFIgdC8J+AgID+A4MiBKdqIhEpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhIpAwCFIgdC8J+AgID+A4MiBKdqIhMpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhQpAwCFIgdC8J+AgID+A4MiBKdqIhUpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhYpAwCFIgdC8J+AgID+A4MiBKdqIhcpAwAgB0L/////D4MgB0IgiH58IA0gBEIgiKdqIhgpAwCFIgdC8J+AgID+A4MiBKdqIhkpAwggGCkDCCAXKQMIIBYpAwggFSkDCCAUKQMIIBMpAwggEikDCCARKQMIIBApAwggDikDCCACKQMYIAuFIgtCIIggC0L/////D4N+fIUiC0IgiCALQv////8Pg358hSILQiCIIAtC/////w+DfnyFIgtCIIggC0L/////D4N+fIUiC0IgiCALQv////8Pg358hSILQiCIIAtC/////w+DfnwgDSAEQiCIp2oiDikDCIUhCyAOKQMAIBkpAwAgB0L/////D4MgB0IgiH58hSEHIAMgAyADIAMgAyADIAIpAwAgCIUiCELwn4CAgP4DgyIEp2oiDikDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiECkDAIUiCELwn4CAgP4DgyIEp2oiESkDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiEikDAIUiCELwn4CAgP4DgyIEp2oiEykDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiFCkDAIUiCELwn4CAgP4DgyIEp2oiFSkDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiFikDAIUiCELwn4CAgP4DgyIEp2oiFykDACAIQv////8PgyAIQiCIfnwgDSAEQiCIp2oiGCkDAIUiCELwn4CAgP4DgyIEp2oiGSkDCCAYKQMIIBcpAwggFikDCCAVKQMIIBQpAwggEykDCCASKQMIIBEpAwggECkDCCAOKQMIIAIpAwggDIUiDEIgiCAMQv////8Pg358hSIMQiCIIAxC/////w+DfnyFIgxCIIggDEL/////D4N+fIUiDEIgiCAMQv////8Pg358hSIMQiCIIAxC/////w+DfnyFIgxCIIggDEL/////D4N+fCANIARCIIinaiICKQMIhSEMIAIpAwAgGSkDACAIQv////8PgyAIQiCIfnyFIQggGiAbRwRAIAEgHGoiAiAJNwM4IAIgBTcDMCACIAo3AyggAiAGNwMgIAIgCzcDGCACIAc3AxAgAiAMNwMIIAIgCDcDACAaQQFqIRoMAQsLIA8gCTcDOCAPIAU3AzAgDyAKNwMoIA8gBjcDICAPIAs3AxggDyAHNwMQIA8gDDcDCCAPIAg3AwAgDyABIBtBBnRqQQQQBAsgD0FAayQAC80dAhB+C38jAEFAaiIUJAAgAygCDCEcIAMoAgghGiADKAIEIRUgAygCACEZIAEgAkEHdEFAaiIbaiIXKQM4IAAgG2oiGykDOIUhBCAXKQMwIBspAzCFIQUgFykDKCAbKQMohSEG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FCADQQA2AhAgA0EANgIMIAdBEGtBADYCACAHQRRrQQA2AgAgB0EYa0EANgIAIAdBHGtBADYCACAKIANBBHFBGHIiCmsiB0EgSQ0AIAMgCmohAwNAIANCADcDGCADQgA3AxAgA0IANwMIIANCADcDACADQSBqIQMgB0EgayIHQR9LDQALCyAEIAZqIgMgBDYCACADQoGAgIBwNwMIIANBAzYCICADQgA3AxggA0EiNgIQIAMgDDYCBCADQdALKAIANgIkQdALIAM2AgAgAygCAAVBUAsiAyADQUFGGyIDQYFgTwR/QcgLQQAgA2s2AgBBfwUgAwsLIgNBACADQX9HGyIENgIAQbgLIAQ2AgBBxAsgDEEAIAQbIgY2AgBBwAsgBjYCACAERQ0BCyACIAMgDWoiByARaiIEIBJqIgw2AiwgAiAMQRBBCEELIBAbIgp0ajYCMCAAIAEgAhAXIA5BBUYEQCACIAAgASADIA0QDCACIAMpABg3AxggAiADKQAQNwMQIAIgAykACDcDCCACIAMpAAA3AwAgA0EBIAIoAjxBB3YgAigCLCAEQQAQGCADIAUgCSAHIAQgAkEsaiIAEBggAyAFIAkgCUECakEDbiIBQf7/P3EiBiAHIAQgABAUIAYgAUEBakH+//8AcUkEQCADIAUgCUECIAcgBCAAEBQLIAIgAyANIAhBIBAMIAtFDQIgCEEgIAsgDyACEBYgAkEgIAgQFwwCC0EAIQYgAkEANgI4IAIgDEEgIAp0ajYCNCACIAsgACALGyAPQQAgCxsgA0GAARAMIAIgAykAGDcDGCACIAMpABA3AxAgAiADKQAINwMIIAIgAykAADcDACADQQEgAigCPEEHdiACKAIsIARBABASIAMgBSAJIAcgBCACQSxqEBIgBUEBdCELIAQgBUEHdGohACAJQQJqQQNuQQFqA0AgACADIAZBBnQiDmoiASgAACIPNgIAIAAgASgABDYCBCAAIAEoAAg2AgggACABKAAMNgIMIAAgASgAECIKNgIQIAAgASgAFCIQNgIUIAAgASgAGDYCGCAAIAEoABw2AhwgACABKAAgIhE2AiAgACABKAAkIhI2AiQgACABKAAoIhM2AiggACABKAAsNgIsIAAgASgAMCIUNgIwIAAgASgANCIVNgI0IAAgASgAOCIWNgI4IAAgASgAPCIXNgI8IAQgDmoiASAKrSASrUIghoQ3AxAgASAPrSAQrUIghoQ3AwAgASATrSAXrUIghoQ3AwggADUCDCEYIAEgEa0gFa1CIIaENwMgIAEgFq0gGEIghoQ3AxggASAANQIIIAA1AhxCIIaENwMoIAEgFK0gADUCBEIghoQ3AzAgASAANQIYIAA1AixCIIaENwM4IAZBAWoiBiALRw0ACyAJQQFrIQFB/v//AHEhBiAEIA1qQUBqKAIAIQkDQCAEIAcgBCAHIAEgCXEgC2xBBnRqIAUgAkEsaiIJEBEgAXEgC2xBBnRqIAUgCRARIQkgBkECayIGDQALQQAhBgNAIAAgBCAGQQZ0IgVqIgEoAgA2AAAgACABKAIENgAEIAAgASgCCDYACCAAIAEoAgw2AAwgACABKAIQNgAQIAAgASgCFDYAFCAAIAEoAhg2ABggACABKAIcNgAcIAAgASgCIDYAICAAIAEoAiQ2ACQgACABKAIoNgAoIAAgASgCLDYALCAAIAEoAjA2ADAgACABKAI0Igk2ADQgACABKAI4NgA4IAAgASgCPDYAPCADIAVqIgEgACkDAD4CACABIAk2AgQgASAAKQMoPgIIIAEgADUCHD4CDCABIAApAxA+AhAgASAANQIEPgIUIAEgACkDOD4CGCABIAA1Aiw+AhwgASAAKQMgPgIgIAEgADUCFD4CJCABIAApAwg+AiggASAANQI8PgIsIAEgACkDMD4CMCABIAA1AiQ+AjQgASAAKQMYPgI4IAEgADUCDD4CPCAGQQFqIgYgC0cNAAsgB0FAakHAACACQSAgCBAWDAELIAhCfzcAACAIQn83ABggCEJ/NwAQIAhCfzcACAsgAkFAayQAIAhBQGskACAICwuFAwQAQYAIC2dn5glqha5nu3Lzbjw69U+lf1IOUYxoBZur2YMfGc3gWy4uL3llc3Bvd2VyLWMvc2hhMjU2LmMAUEJLREYyX1NIQTI1NgBka0xlbiA8PSAzMiAqIChzaXplX3QpKFVJTlQzMl9NQVgpAEHwCAsBgABBsAkLgAKYL4pCkUQ3cc/7wLWl27XpW8JWOfER8Vmkgj+S1V4cq5iqB9gBW4MSvoUxJMN9DFV0Xb5y/rHegKcG3Jt08ZvBwWmb5IZHvu/GncEPzKEMJG8s6S2qhHRK3KmwXNqI+XZSUT6YbcYxqMgnA7DHf1m/8wvgxkeRp9VRY8oGZykpFIUKtyc4IRsu/G0sTRMNOFNUcwpluwpqdi7JwoGFLHKSoei/oktmGqhwi0vCo1FsxxnoktEkBpnWhTUO9HCgahAWwaQZCGw3Hkx3SCe1vLA0swwcOUqq2E5Pypxb828uaO6Cj3RvY6V4FHjIhAgCx4z6/76Q62xQpPej+b7yeHHGAEGwCwsD0AcB";

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
var yespower_wasm = __nested_webpack_require_29967__(561);
var yespower_wasm_default = /*#__PURE__*/__nested_webpack_require_29967__.n(yespower_wasm);
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

/******/ 	return __nested_webpack_exports__;
/******/ })()
;
});

/***/ }),

/***/ 401:
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ 606:
/***/ ((module) => {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ 882:
/***/ (() => {

/* (ignored) */

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
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
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

// EXTERNAL MODULE: ./node_modules/yespower-wasm/lib/yespower.umd.js
var yespower_umd = __webpack_require__(274);
// EXTERNAL MODULE: crypto (ignored)
var crypto_ignored_ = __webpack_require__(401);
;// ./src/utils.ts
/* provided dependency */ var process = __webpack_require__(606);



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
  return BigInt((0,yespower_umd.bytesToHex)(crypto_ignored_.webcrypto.getRandomValues(new Uint8Array(63))));
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
  const yespower = await yespower_umd.Yespower.init();
  let timeStart = Date.now();
  let nonce = randomNonce();
  let i = 0;
  const blockTarget = work.blockTarget?.startsWith("0x") ? BigInt(work.blockTarget) : 0n;
  const target = BigInt(work.target);
  const header = (0,yespower_umd.hexToBytes)(work.header);
  while (true) {
    const nonceBytes = setLength((0,yespower_umd.hexToBytes)(nonce.toString(16)), 8, false);
    const concatted = concatBytes(header, bytesReverse(nonceBytes));
    const result = BigInt((0,yespower_umd.bytesToHex)(yespower.Hash(concatted, void 0, void 0, algoPers)));
    const blockFound = blockTarget > result;
    if (target > result) {
      const found = {
        nonce: (0,yespower_umd.bytesToHex)(nonceBytes),
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

// EXTERNAL MODULE: worker_threads (ignored)
var worker_threads_ignored_ = __webpack_require__(882);
;// ./src/miner.ts



async function mine(miner, work) {
  for (let i = 0; i < miner.threads; ++i) {
    if (isNode) {
      const worker = new worker_threads_ignored_.Worker(miner.workerFile, {
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

;// ./node_modules/isomorphic-ws/browser.js
// https://github.com/maxogden/websocket-stream/blob/48dc3ddf943e5ada668c31ccd94e9186f02fafbd/ws-fallback.js

var ws = null

if (typeof WebSocket !== 'undefined') {
  ws = WebSocket
} else if (typeof MozWebSocket !== 'undefined') {
  ws = MozWebSocket
} else if (typeof __webpack_require__.g !== 'undefined') {
  ws = __webpack_require__.g.WebSocket || __webpack_require__.g.MozWebSocket
} else if (typeof window !== 'undefined') {
  ws = window.WebSocket || window.MozWebSocket
} else if (typeof self !== 'undefined') {
  ws = self.WebSocket || self.MozWebSocket
}

/* harmony default export */ const browser = (ws);

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
        pool.ws = new browser(pool.url);
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
    this.ws = new browser(url);
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

/******/ 	return __webpack_exports__;
/******/ })()
;
});