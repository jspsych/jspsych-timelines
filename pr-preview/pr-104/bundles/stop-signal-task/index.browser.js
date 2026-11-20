var jsPsychTimelineStopSignalTask = (function (exports) {
  'use strict';

  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __pow = Math.pow;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __objRest = (source, exclude) => {
    var target = {};
    for (var prop in source)
      if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
        target[prop] = source[prop];
    if (source != null && __getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(source)) {
        if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
          target[prop] = source[prop];
      }
    return target;
  };
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    __defProp(target, "default", { value: mod, enumerable: true }) ,
    mod
  ));

  // ../../node_modules/auto-bind/index.js
  var require_auto_bind = __commonJS({
    "../../node_modules/auto-bind/index.js"(exports, module) {
      var getAllProperties = (object) => {
        const properties = /* @__PURE__ */ new Set();
        do {
          for (const key of Reflect.ownKeys(object)) {
            properties.add([object, key]);
          }
        } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);
        return properties;
      };
      module.exports = (self2, { include, exclude } = {}) => {
        const filter = (key) => {
          const match = (pattern) => typeof pattern === "string" ? key === pattern : pattern.test(key);
          if (include) {
            return include.some(match);
          }
          if (exclude) {
            return !exclude.some(match);
          }
          return true;
        };
        for (const [object, key] of getAllProperties(self2.constructor.prototype)) {
          if (key === "constructor" || !filter(key)) {
            continue;
          }
          const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
          if (descriptor && typeof descriptor.value === "function") {
            self2[key] = self2[key].bind(self2);
          }
        }
        return self2;
      };
    }
  });

  // ../../node_modules/seedrandom/lib/alea.js
  var require_alea = __commonJS({
    "../../node_modules/seedrandom/lib/alea.js"(exports, module) {
      (function(global, module2, define2) {
        function Alea(seed) {
          var me = this, mash = Mash();
          me.next = function() {
            var t = 2091639 * me.s0 + me.c * 23283064365386963e-26;
            me.s0 = me.s1;
            me.s1 = me.s2;
            return me.s2 = t - (me.c = t | 0);
          };
          me.c = 1;
          me.s0 = mash(" ");
          me.s1 = mash(" ");
          me.s2 = mash(" ");
          me.s0 -= mash(seed);
          if (me.s0 < 0) {
            me.s0 += 1;
          }
          me.s1 -= mash(seed);
          if (me.s1 < 0) {
            me.s1 += 1;
          }
          me.s2 -= mash(seed);
          if (me.s2 < 0) {
            me.s2 += 1;
          }
          mash = null;
        }
        function copy(f, t) {
          t.c = f.c;
          t.s0 = f.s0;
          t.s1 = f.s1;
          t.s2 = f.s2;
          return t;
        }
        function impl(seed, opts) {
          var xg = new Alea(seed), state = opts && opts.state, prng = xg.next;
          prng.int32 = function() {
            return xg.next() * 4294967296 | 0;
          };
          prng.double = function() {
            return prng() + (prng() * 2097152 | 0) * 11102230246251565e-32;
          };
          prng.quick = prng;
          if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        function Mash() {
          var n = 4022871197;
          var mash = function(data) {
            data = String(data);
            for (var i = 0; i < data.length; i++) {
              n += data.charCodeAt(i);
              var h = 0.02519603282416938 * n;
              n = h >>> 0;
              h -= n;
              h *= n;
              n = h >>> 0;
              h -= n;
              n += h * 4294967296;
            }
            return (n >>> 0) * 23283064365386963e-26;
          };
          return mash;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.alea = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // ../../node_modules/seedrandom/lib/xor128.js
  var require_xor128 = __commonJS({
    "../../node_modules/seedrandom/lib/xor128.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this, strseed = "";
          me.x = 0;
          me.y = 0;
          me.z = 0;
          me.w = 0;
          me.next = function() {
            var t = me.x ^ me.x << 11;
            me.x = me.y;
            me.y = me.z;
            me.z = me.w;
            return me.w ^= me.w >>> 19 ^ t ^ t >>> 8;
          };
          if (seed === (seed | 0)) {
            me.x = seed;
          } else {
            strseed += seed;
          }
          for (var k = 0; k < strseed.length + 64; k++) {
            me.x ^= strseed.charCodeAt(k) | 0;
            me.next();
          }
        }
        function copy(f, t) {
          t.x = f.x;
          t.y = f.y;
          t.z = f.z;
          t.w = f.w;
          return t;
        }
        function impl(seed, opts) {
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xor128 = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // ../../node_modules/seedrandom/lib/xorwow.js
  var require_xorwow = __commonJS({
    "../../node_modules/seedrandom/lib/xorwow.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this, strseed = "";
          me.next = function() {
            var t = me.x ^ me.x >>> 2;
            me.x = me.y;
            me.y = me.z;
            me.z = me.w;
            me.w = me.v;
            return (me.d = me.d + 362437 | 0) + (me.v = me.v ^ me.v << 4 ^ (t ^ t << 1)) | 0;
          };
          me.x = 0;
          me.y = 0;
          me.z = 0;
          me.w = 0;
          me.v = 0;
          if (seed === (seed | 0)) {
            me.x = seed;
          } else {
            strseed += seed;
          }
          for (var k = 0; k < strseed.length + 64; k++) {
            me.x ^= strseed.charCodeAt(k) | 0;
            if (k == strseed.length) {
              me.d = me.x << 10 ^ me.x >>> 4;
            }
            me.next();
          }
        }
        function copy(f, t) {
          t.x = f.x;
          t.y = f.y;
          t.z = f.z;
          t.w = f.w;
          t.v = f.v;
          t.d = f.d;
          return t;
        }
        function impl(seed, opts) {
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xorwow = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // ../../node_modules/seedrandom/lib/xorshift7.js
  var require_xorshift7 = __commonJS({
    "../../node_modules/seedrandom/lib/xorshift7.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this;
          me.next = function() {
            var X = me.x, i = me.i, t, v;
            t = X[i];
            t ^= t >>> 7;
            v = t ^ t << 24;
            t = X[i + 1 & 7];
            v ^= t ^ t >>> 10;
            t = X[i + 3 & 7];
            v ^= t ^ t >>> 3;
            t = X[i + 4 & 7];
            v ^= t ^ t << 7;
            t = X[i + 7 & 7];
            t = t ^ t << 13;
            v ^= t ^ t << 9;
            X[i] = v;
            me.i = i + 1 & 7;
            return v;
          };
          function init(me2, seed2) {
            var j, X = [];
            if (seed2 === (seed2 | 0)) {
              X[0] = seed2;
            } else {
              seed2 = "" + seed2;
              for (j = 0; j < seed2.length; ++j) {
                X[j & 7] = X[j & 7] << 15 ^ seed2.charCodeAt(j) + X[j + 1 & 7] << 13;
              }
            }
            while (X.length < 8) X.push(0);
            for (j = 0; j < 8 && X[j] === 0; ++j) ;
            if (j == 8) X[7] = -1;
            else X[j];
            me2.x = X;
            me2.i = 0;
            for (j = 256; j > 0; --j) {
              me2.next();
            }
          }
          init(me, seed);
        }
        function copy(f, t) {
          t.x = f.x.slice();
          t.i = f.i;
          return t;
        }
        function impl(seed, opts) {
          if (seed == null) seed = +/* @__PURE__ */ new Date();
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (state.x) copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xorshift7 = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // ../../node_modules/seedrandom/lib/xor4096.js
  var require_xor4096 = __commonJS({
    "../../node_modules/seedrandom/lib/xor4096.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this;
          me.next = function() {
            var w = me.w, X = me.X, i = me.i, t, v;
            me.w = w = w + 1640531527 | 0;
            v = X[i + 34 & 127];
            t = X[i = i + 1 & 127];
            v ^= v << 13;
            t ^= t << 17;
            v ^= v >>> 15;
            t ^= t >>> 12;
            v = X[i] = v ^ t;
            me.i = i;
            return v + (w ^ w >>> 16) | 0;
          };
          function init(me2, seed2) {
            var t, v, i, j, w, X = [], limit = 128;
            if (seed2 === (seed2 | 0)) {
              v = seed2;
              seed2 = null;
            } else {
              seed2 = seed2 + "\0";
              v = 0;
              limit = Math.max(limit, seed2.length);
            }
            for (i = 0, j = -32; j < limit; ++j) {
              if (seed2) v ^= seed2.charCodeAt((j + 32) % seed2.length);
              if (j === 0) w = v;
              v ^= v << 10;
              v ^= v >>> 15;
              v ^= v << 4;
              v ^= v >>> 13;
              if (j >= 0) {
                w = w + 1640531527 | 0;
                t = X[j & 127] ^= v + w;
                i = 0 == t ? i + 1 : 0;
              }
            }
            if (i >= 128) {
              X[(seed2 && seed2.length || 0) & 127] = -1;
            }
            i = 127;
            for (j = 4 * 128; j > 0; --j) {
              v = X[i + 34 & 127];
              t = X[i = i + 1 & 127];
              v ^= v << 13;
              t ^= t << 17;
              v ^= v >>> 15;
              t ^= t >>> 12;
              X[i] = v ^ t;
            }
            me2.w = w;
            me2.X = X;
            me2.i = i;
          }
          init(me, seed);
        }
        function copy(f, t) {
          t.i = f.i;
          t.w = f.w;
          t.X = f.X.slice();
          return t;
        }
        function impl(seed, opts) {
          if (seed == null) seed = +/* @__PURE__ */ new Date();
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (state.X) copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.xor4096 = impl;
        }
      })(
        exports,
        // window object or global
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // ../../node_modules/seedrandom/lib/tychei.js
  var require_tychei = __commonJS({
    "../../node_modules/seedrandom/lib/tychei.js"(exports, module) {
      (function(global, module2, define2) {
        function XorGen(seed) {
          var me = this, strseed = "";
          me.next = function() {
            var b = me.b, c = me.c, d = me.d, a = me.a;
            b = b << 25 ^ b >>> 7 ^ c;
            c = c - d | 0;
            d = d << 24 ^ d >>> 8 ^ a;
            a = a - b | 0;
            me.b = b = b << 20 ^ b >>> 12 ^ c;
            me.c = c = c - d | 0;
            me.d = d << 16 ^ c >>> 16 ^ a;
            return me.a = a - b | 0;
          };
          me.a = 0;
          me.b = 0;
          me.c = 2654435769 | 0;
          me.d = 1367130551;
          if (seed === Math.floor(seed)) {
            me.a = seed / 4294967296 | 0;
            me.b = seed | 0;
          } else {
            strseed += seed;
          }
          for (var k = 0; k < strseed.length + 20; k++) {
            me.b ^= strseed.charCodeAt(k) | 0;
            me.next();
          }
        }
        function copy(f, t) {
          t.a = f.a;
          t.b = f.b;
          t.c = f.c;
          t.d = f.d;
          return t;
        }
        function impl(seed, opts) {
          var xg = new XorGen(seed), state = opts && opts.state, prng = function() {
            return (xg.next() >>> 0) / 4294967296;
          };
          prng.double = function() {
            do {
              var top = xg.next() >>> 11, bot = (xg.next() >>> 0) / 4294967296, result = (top + bot) / (1 << 21);
            } while (result === 0);
            return result;
          };
          prng.int32 = xg.next;
          prng.quick = prng;
          if (state) {
            if (typeof state == "object") copy(state, xg);
            prng.state = function() {
              return copy(xg, {});
            };
          }
          return prng;
        }
        if (module2 && module2.exports) {
          module2.exports = impl;
        } else if (define2 && define2.amd) {
          define2(function() {
            return impl;
          });
        } else {
          this.tychei = impl;
        }
      })(
        exports,
        typeof module == "object" && module,
        // present in node.js
        typeof define == "function" && define
        // present with an AMD loader
      );
    }
  });

  // ../../node_modules/seedrandom/seedrandom.js
  var require_seedrandom = __commonJS({
    "../../node_modules/seedrandom/seedrandom.js"(exports, module) {
      (function(global, pool, math) {
        var width = 256, chunks = 6, digits = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits), overflow = significance * 2, mask = width - 1, nodecrypto;
        function seedrandom2(seed, options, callback) {
          var key = [];
          options = options == true ? { entropy: true } : options || {};
          var shortseed = mixkey(flatten(
            options.entropy ? [seed, tostring(pool)] : seed == null ? autoseed() : seed,
            3
          ), key);
          var arc4 = new ARC4(key);
          var prng = function() {
            var n = arc4.g(chunks), d = startdenom, x = 0;
            while (n < significance) {
              n = (n + x) * width;
              d *= width;
              x = arc4.g(1);
            }
            while (n >= overflow) {
              n /= 2;
              d /= 2;
              x >>>= 1;
            }
            return (n + x) / d;
          };
          prng.int32 = function() {
            return arc4.g(4) | 0;
          };
          prng.quick = function() {
            return arc4.g(4) / 4294967296;
          };
          prng.double = prng;
          mixkey(tostring(arc4.S), pool);
          return (options.pass || callback || function(prng2, seed2, is_math_call, state) {
            if (state) {
              if (state.S) {
                copy(state, arc4);
              }
              prng2.state = function() {
                return copy(arc4, {});
              };
            }
            if (is_math_call) {
              math[rngname] = prng2;
              return seed2;
            } else return prng2;
          })(
            prng,
            shortseed,
            "global" in options ? options.global : this == math,
            options.state
          );
        }
        function ARC4(key) {
          var t, keylen = key.length, me = this, i = 0, j = me.i = me.j = 0, s = me.S = [];
          if (!keylen) {
            key = [keylen++];
          }
          while (i < width) {
            s[i] = i++;
          }
          for (i = 0; i < width; i++) {
            s[i] = s[j = mask & j + key[i % keylen] + (t = s[i])];
            s[j] = t;
          }
          (me.g = function(count) {
            var t2, r = 0, i2 = me.i, j2 = me.j, s2 = me.S;
            while (count--) {
              t2 = s2[i2 = mask & i2 + 1];
              r = r * width + s2[mask & (s2[i2] = s2[j2 = mask & j2 + t2]) + (s2[j2] = t2)];
            }
            me.i = i2;
            me.j = j2;
            return r;
          })(width);
        }
        function copy(f, t) {
          t.i = f.i;
          t.j = f.j;
          t.S = f.S.slice();
          return t;
        }
        function flatten(obj, depth) {
          var result = [], typ = typeof obj, prop;
          if (depth && typ == "object") {
            for (prop in obj) {
              try {
                result.push(flatten(obj[prop], depth - 1));
              } catch (e) {
              }
            }
          }
          return result.length ? result : typ == "string" ? obj : obj + "\0";
        }
        function mixkey(seed, key) {
          var stringseed = seed + "", smear, j = 0;
          while (j < stringseed.length) {
            key[mask & j] = mask & (smear ^= key[mask & j] * 19) + stringseed.charCodeAt(j++);
          }
          return tostring(key);
        }
        function autoseed() {
          try {
            var out;
            if (nodecrypto && (out = nodecrypto.randomBytes)) {
              out = out(width);
            } else {
              out = new Uint8Array(width);
              (global.crypto || global.msCrypto).getRandomValues(out);
            }
            return tostring(out);
          } catch (e) {
            var browser = global.navigator, plugins = browser && browser.plugins;
            return [+/* @__PURE__ */ new Date(), global, plugins, global.screen, tostring(pool)];
          }
        }
        function tostring(a) {
          return String.fromCharCode.apply(0, a);
        }
        mixkey(math.random(), pool);
        if (typeof module == "object" && module.exports) {
          module.exports = seedrandom2;
          try {
            nodecrypto = __require("crypto");
          } catch (ex) {
          }
        } else if (typeof define == "function" && define.amd) {
          define(function() {
            return seedrandom2;
          });
        } else {
          math["seed" + rngname] = seedrandom2;
        }
      })(
        // global: `self` in browsers (including strict mode and web workers),
        // otherwise `this` in Node and other environments
        typeof self !== "undefined" ? self : exports,
        [],
        // pool: entropy pool starts empty
        Math
        // math: package containing random, pow, and seedrandom
      );
    }
  });

  // ../../node_modules/seedrandom/index.js
  var require_seedrandom2 = __commonJS({
    "../../node_modules/seedrandom/index.js"(exports, module) {
      var alea = require_alea();
      var xor128 = require_xor128();
      var xorwow = require_xorwow();
      var xorshift7 = require_xorshift7();
      var xor4096 = require_xor4096();
      var tychei = require_tychei();
      var sr = require_seedrandom();
      sr.alea = alea;
      sr.xor128 = xor128;
      sr.xorwow = xorwow;
      sr.xorshift7 = xorshift7;
      sr.xor4096 = xor4096;
      sr.tychei = tychei;
      module.exports = sr;
    }
  });

  // ../../node_modules/random-words/index.js
  var require_random_words = __commonJS({
    "../../node_modules/random-words/index.js"(exports, module) {
      var seedrandom2 = require_seedrandom2();
      var wordList = [
        // Borrowed from xkcd password generator which borrowed it from wherever
        "ability",
        "able",
        "aboard",
        "about",
        "above",
        "accept",
        "accident",
        "according",
        "account",
        "accurate",
        "acres",
        "across",
        "act",
        "action",
        "active",
        "activity",
        "actual",
        "actually",
        "add",
        "addition",
        "additional",
        "adjective",
        "adult",
        "adventure",
        "advice",
        "affect",
        "afraid",
        "after",
        "afternoon",
        "again",
        "against",
        "age",
        "ago",
        "agree",
        "ahead",
        "aid",
        "air",
        "airplane",
        "alike",
        "alive",
        "all",
        "allow",
        "almost",
        "alone",
        "along",
        "aloud",
        "alphabet",
        "already",
        "also",
        "although",
        "am",
        "among",
        "amount",
        "ancient",
        "angle",
        "angry",
        "animal",
        "announced",
        "another",
        "answer",
        "ants",
        "any",
        "anybody",
        "anyone",
        "anything",
        "anyway",
        "anywhere",
        "apart",
        "apartment",
        "appearance",
        "apple",
        "applied",
        "appropriate",
        "are",
        "area",
        "arm",
        "army",
        "around",
        "arrange",
        "arrangement",
        "arrive",
        "arrow",
        "art",
        "article",
        "as",
        "aside",
        "ask",
        "asleep",
        "at",
        "ate",
        "atmosphere",
        "atom",
        "atomic",
        "attached",
        "attack",
        "attempt",
        "attention",
        "audience",
        "author",
        "automobile",
        "available",
        "average",
        "avoid",
        "aware",
        "away",
        "baby",
        "back",
        "bad",
        "badly",
        "bag",
        "balance",
        "ball",
        "balloon",
        "band",
        "bank",
        "bar",
        "bare",
        "bark",
        "barn",
        "base",
        "baseball",
        "basic",
        "basis",
        "basket",
        "bat",
        "battle",
        "be",
        "bean",
        "bear",
        "beat",
        "beautiful",
        "beauty",
        "became",
        "because",
        "become",
        "becoming",
        "bee",
        "been",
        "before",
        "began",
        "beginning",
        "begun",
        "behavior",
        "behind",
        "being",
        "believed",
        "bell",
        "belong",
        "below",
        "belt",
        "bend",
        "beneath",
        "bent",
        "beside",
        "best",
        "bet",
        "better",
        "between",
        "beyond",
        "bicycle",
        "bigger",
        "biggest",
        "bill",
        "birds",
        "birth",
        "birthday",
        "bit",
        "bite",
        "black",
        "blank",
        "blanket",
        "blew",
        "blind",
        "block",
        "blood",
        "blow",
        "blue",
        "board",
        "boat",
        "body",
        "bone",
        "book",
        "border",
        "born",
        "both",
        "bottle",
        "bottom",
        "bound",
        "bow",
        "bowl",
        "box",
        "boy",
        "brain",
        "branch",
        "brass",
        "brave",
        "bread",
        "break",
        "breakfast",
        "breath",
        "breathe",
        "breathing",
        "breeze",
        "brick",
        "bridge",
        "brief",
        "bright",
        "bring",
        "broad",
        "broke",
        "broken",
        "brother",
        "brought",
        "brown",
        "brush",
        "buffalo",
        "build",
        "building",
        "built",
        "buried",
        "burn",
        "burst",
        "bus",
        "bush",
        "business",
        "busy",
        "but",
        "butter",
        "buy",
        "by",
        "cabin",
        "cage",
        "cake",
        "call",
        "calm",
        "came",
        "camera",
        "camp",
        "can",
        "canal",
        "cannot",
        "cap",
        "capital",
        "captain",
        "captured",
        "car",
        "carbon",
        "card",
        "care",
        "careful",
        "carefully",
        "carried",
        "carry",
        "case",
        "cast",
        "castle",
        "cat",
        "catch",
        "cattle",
        "caught",
        "cause",
        "cave",
        "cell",
        "cent",
        "center",
        "central",
        "century",
        "certain",
        "certainly",
        "chain",
        "chair",
        "chamber",
        "chance",
        "change",
        "changing",
        "chapter",
        "character",
        "characteristic",
        "charge",
        "chart",
        "check",
        "cheese",
        "chemical",
        "chest",
        "chicken",
        "chief",
        "child",
        "children",
        "choice",
        "choose",
        "chose",
        "chosen",
        "church",
        "circle",
        "circus",
        "citizen",
        "city",
        "class",
        "classroom",
        "claws",
        "clay",
        "clean",
        "clear",
        "clearly",
        "climate",
        "climb",
        "clock",
        "close",
        "closely",
        "closer",
        "cloth",
        "clothes",
        "clothing",
        "cloud",
        "club",
        "coach",
        "coal",
        "coast",
        "coat",
        "coffee",
        "cold",
        "collect",
        "college",
        "colony",
        "color",
        "column",
        "combination",
        "combine",
        "come",
        "comfortable",
        "coming",
        "command",
        "common",
        "community",
        "company",
        "compare",
        "compass",
        "complete",
        "completely",
        "complex",
        "composed",
        "composition",
        "compound",
        "concerned",
        "condition",
        "congress",
        "connected",
        "consider",
        "consist",
        "consonant",
        "constantly",
        "construction",
        "contain",
        "continent",
        "continued",
        "contrast",
        "control",
        "conversation",
        "cook",
        "cookies",
        "cool",
        "copper",
        "copy",
        "corn",
        "corner",
        "correct",
        "correctly",
        "cost",
        "cotton",
        "could",
        "count",
        "country",
        "couple",
        "courage",
        "course",
        "court",
        "cover",
        "cow",
        "cowboy",
        "crack",
        "cream",
        "create",
        "creature",
        "crew",
        "crop",
        "cross",
        "crowd",
        "cry",
        "cup",
        "curious",
        "current",
        "curve",
        "customs",
        "cut",
        "cutting",
        "daily",
        "damage",
        "dance",
        "danger",
        "dangerous",
        "dark",
        "darkness",
        "date",
        "daughter",
        "dawn",
        "day",
        "dead",
        "deal",
        "dear",
        "death",
        "decide",
        "declared",
        "deep",
        "deeply",
        "deer",
        "definition",
        "degree",
        "depend",
        "depth",
        "describe",
        "desert",
        "design",
        "desk",
        "detail",
        "determine",
        "develop",
        "development",
        "diagram",
        "diameter",
        "did",
        "die",
        "differ",
        "difference",
        "different",
        "difficult",
        "difficulty",
        "dig",
        "dinner",
        "direct",
        "direction",
        "directly",
        "dirt",
        "dirty",
        "disappear",
        "discover",
        "discovery",
        "discuss",
        "discussion",
        "disease",
        "dish",
        "distance",
        "distant",
        "divide",
        "division",
        "do",
        "doctor",
        "does",
        "dog",
        "doing",
        "doll",
        "dollar",
        "done",
        "donkey",
        "door",
        "dot",
        "double",
        "doubt",
        "down",
        "dozen",
        "draw",
        "drawn",
        "dream",
        "dress",
        "drew",
        "dried",
        "drink",
        "drive",
        "driven",
        "driver",
        "driving",
        "drop",
        "dropped",
        "drove",
        "dry",
        "duck",
        "due",
        "dug",
        "dull",
        "during",
        "dust",
        "duty",
        "each",
        "eager",
        "ear",
        "earlier",
        "early",
        "earn",
        "earth",
        "easier",
        "easily",
        "east",
        "easy",
        "eat",
        "eaten",
        "edge",
        "education",
        "effect",
        "effort",
        "egg",
        "eight",
        "either",
        "electric",
        "electricity",
        "element",
        "elephant",
        "eleven",
        "else",
        "empty",
        "end",
        "enemy",
        "energy",
        "engine",
        "engineer",
        "enjoy",
        "enough",
        "enter",
        "entire",
        "entirely",
        "environment",
        "equal",
        "equally",
        "equator",
        "equipment",
        "escape",
        "especially",
        "essential",
        "establish",
        "even",
        "evening",
        "event",
        "eventually",
        "ever",
        "every",
        "everybody",
        "everyone",
        "everything",
        "everywhere",
        "evidence",
        "exact",
        "exactly",
        "examine",
        "example",
        "excellent",
        "except",
        "exchange",
        "excited",
        "excitement",
        "exciting",
        "exclaimed",
        "exercise",
        "exist",
        "expect",
        "experience",
        "experiment",
        "explain",
        "explanation",
        "explore",
        "express",
        "expression",
        "extra",
        "eye",
        "face",
        "facing",
        "fact",
        "factor",
        "factory",
        "failed",
        "fair",
        "fairly",
        "fall",
        "fallen",
        "familiar",
        "family",
        "famous",
        "far",
        "farm",
        "farmer",
        "farther",
        "fast",
        "fastened",
        "faster",
        "fat",
        "father",
        "favorite",
        "fear",
        "feathers",
        "feature",
        "fed",
        "feed",
        "feel",
        "feet",
        "fell",
        "fellow",
        "felt",
        "fence",
        "few",
        "fewer",
        "field",
        "fierce",
        "fifteen",
        "fifth",
        "fifty",
        "fight",
        "fighting",
        "figure",
        "fill",
        "film",
        "final",
        "finally",
        "find",
        "fine",
        "finest",
        "finger",
        "finish",
        "fire",
        "fireplace",
        "firm",
        "first",
        "fish",
        "five",
        "fix",
        "flag",
        "flame",
        "flat",
        "flew",
        "flies",
        "flight",
        "floating",
        "floor",
        "flow",
        "flower",
        "fly",
        "fog",
        "folks",
        "follow",
        "food",
        "foot",
        "football",
        "for",
        "force",
        "foreign",
        "forest",
        "forget",
        "forgot",
        "forgotten",
        "form",
        "former",
        "fort",
        "forth",
        "forty",
        "forward",
        "fought",
        "found",
        "four",
        "fourth",
        "fox",
        "frame",
        "free",
        "freedom",
        "frequently",
        "fresh",
        "friend",
        "friendly",
        "frighten",
        "frog",
        "from",
        "front",
        "frozen",
        "fruit",
        "fuel",
        "full",
        "fully",
        "fun",
        "function",
        "funny",
        "fur",
        "furniture",
        "further",
        "future",
        "gain",
        "game",
        "garage",
        "garden",
        "gas",
        "gasoline",
        "gate",
        "gather",
        "gave",
        "general",
        "generally",
        "gentle",
        "gently",
        "get",
        "getting",
        "giant",
        "gift",
        "girl",
        "give",
        "given",
        "giving",
        "glad",
        "glass",
        "globe",
        "go",
        "goes",
        "gold",
        "golden",
        "gone",
        "good",
        "goose",
        "got",
        "government",
        "grabbed",
        "grade",
        "gradually",
        "grain",
        "grandfather",
        "grandmother",
        "graph",
        "grass",
        "gravity",
        "gray",
        "great",
        "greater",
        "greatest",
        "greatly",
        "green",
        "grew",
        "ground",
        "group",
        "grow",
        "grown",
        "growth",
        "guard",
        "guess",
        "guide",
        "gulf",
        "gun",
        "habit",
        "had",
        "hair",
        "half",
        "halfway",
        "hall",
        "hand",
        "handle",
        "handsome",
        "hang",
        "happen",
        "happened",
        "happily",
        "happy",
        "harbor",
        "hard",
        "harder",
        "hardly",
        "has",
        "hat",
        "have",
        "having",
        "hay",
        "he",
        "headed",
        "heading",
        "health",
        "heard",
        "hearing",
        "heart",
        "heat",
        "heavy",
        "height",
        "held",
        "hello",
        "help",
        "helpful",
        "her",
        "herd",
        "here",
        "herself",
        "hidden",
        "hide",
        "high",
        "higher",
        "highest",
        "highway",
        "hill",
        "him",
        "himself",
        "his",
        "history",
        "hit",
        "hold",
        "hole",
        "hollow",
        "home",
        "honor",
        "hope",
        "horn",
        "horse",
        "hospital",
        "hot",
        "hour",
        "house",
        "how",
        "however",
        "huge",
        "human",
        "hundred",
        "hung",
        "hungry",
        "hunt",
        "hunter",
        "hurried",
        "hurry",
        "hurt",
        "husband",
        "ice",
        "idea",
        "identity",
        "if",
        "ill",
        "image",
        "imagine",
        "immediately",
        "importance",
        "important",
        "impossible",
        "improve",
        "in",
        "inch",
        "include",
        "including",
        "income",
        "increase",
        "indeed",
        "independent",
        "indicate",
        "individual",
        "industrial",
        "industry",
        "influence",
        "information",
        "inside",
        "instance",
        "instant",
        "instead",
        "instrument",
        "interest",
        "interior",
        "into",
        "introduced",
        "invented",
        "involved",
        "iron",
        "is",
        "island",
        "it",
        "its",
        "itself",
        "jack",
        "jar",
        "jet",
        "job",
        "join",
        "joined",
        "journey",
        "joy",
        "judge",
        "jump",
        "jungle",
        "just",
        "keep",
        "kept",
        "key",
        "kids",
        "kill",
        "kind",
        "kitchen",
        "knew",
        "knife",
        "know",
        "knowledge",
        "known",
        "label",
        "labor",
        "lack",
        "lady",
        "laid",
        "lake",
        "lamp",
        "land",
        "language",
        "large",
        "larger",
        "largest",
        "last",
        "late",
        "later",
        "laugh",
        "law",
        "lay",
        "layers",
        "lead",
        "leader",
        "leaf",
        "learn",
        "least",
        "leather",
        "leave",
        "leaving",
        "led",
        "left",
        "leg",
        "length",
        "lesson",
        "let",
        "letter",
        "level",
        "library",
        "lie",
        "life",
        "lift",
        "light",
        "like",
        "likely",
        "limited",
        "line",
        "lion",
        "lips",
        "liquid",
        "list",
        "listen",
        "little",
        "live",
        "living",
        "load",
        "local",
        "locate",
        "location",
        "log",
        "lonely",
        "long",
        "longer",
        "look",
        "loose",
        "lose",
        "loss",
        "lost",
        "lot",
        "loud",
        "love",
        "lovely",
        "low",
        "lower",
        "luck",
        "lucky",
        "lunch",
        "lungs",
        "lying",
        "machine",
        "machinery",
        "mad",
        "made",
        "magic",
        "magnet",
        "mail",
        "main",
        "mainly",
        "major",
        "make",
        "making",
        "man",
        "managed",
        "manner",
        "manufacturing",
        "many",
        "map",
        "mark",
        "market",
        "married",
        "mass",
        "massage",
        "master",
        "material",
        "mathematics",
        "matter",
        "may",
        "maybe",
        "me",
        "meal",
        "mean",
        "means",
        "meant",
        "measure",
        "meat",
        "medicine",
        "meet",
        "melted",
        "member",
        "memory",
        "men",
        "mental",
        "merely",
        "met",
        "metal",
        "method",
        "mice",
        "middle",
        "might",
        "mighty",
        "mile",
        "military",
        "milk",
        "mill",
        "mind",
        "mine",
        "minerals",
        "minute",
        "mirror",
        "missing",
        "mission",
        "mistake",
        "mix",
        "mixture",
        "model",
        "modern",
        "molecular",
        "moment",
        "money",
        "monkey",
        "month",
        "mood",
        "moon",
        "more",
        "morning",
        "most",
        "mostly",
        "mother",
        "motion",
        "motor",
        "mountain",
        "mouse",
        "mouth",
        "move",
        "movement",
        "movie",
        "moving",
        "mud",
        "muscle",
        "music",
        "musical",
        "must",
        "my",
        "myself",
        "mysterious",
        "nails",
        "name",
        "nation",
        "national",
        "native",
        "natural",
        "naturally",
        "nature",
        "near",
        "nearby",
        "nearer",
        "nearest",
        "nearly",
        "necessary",
        "neck",
        "needed",
        "needle",
        "needs",
        "negative",
        "neighbor",
        "neighborhood",
        "nervous",
        "nest",
        "never",
        "new",
        "news",
        "newspaper",
        "next",
        "nice",
        "night",
        "nine",
        "no",
        "nobody",
        "nodded",
        "noise",
        "none",
        "noon",
        "nor",
        "north",
        "nose",
        "not",
        "note",
        "noted",
        "nothing",
        "notice",
        "noun",
        "now",
        "number",
        "numeral",
        "nuts",
        "object",
        "observe",
        "obtain",
        "occasionally",
        "occur",
        "ocean",
        "of",
        "off",
        "offer",
        "office",
        "officer",
        "official",
        "oil",
        "old",
        "older",
        "oldest",
        "on",
        "once",
        "one",
        "only",
        "onto",
        "open",
        "operation",
        "opinion",
        "opportunity",
        "opposite",
        "or",
        "orange",
        "orbit",
        "order",
        "ordinary",
        "organization",
        "organized",
        "origin",
        "original",
        "other",
        "ought",
        "our",
        "ourselves",
        "out",
        "outer",
        "outline",
        "outside",
        "over",
        "own",
        "owner",
        "oxygen",
        "pack",
        "package",
        "page",
        "paid",
        "pain",
        "paint",
        "pair",
        "palace",
        "pale",
        "pan",
        "paper",
        "paragraph",
        "parallel",
        "parent",
        "park",
        "part",
        "particles",
        "particular",
        "particularly",
        "partly",
        "parts",
        "party",
        "pass",
        "passage",
        "past",
        "path",
        "pattern",
        "pay",
        "peace",
        "pen",
        "pencil",
        "people",
        "per",
        "percent",
        "perfect",
        "perfectly",
        "perhaps",
        "period",
        "person",
        "personal",
        "pet",
        "phrase",
        "physical",
        "piano",
        "pick",
        "picture",
        "pictured",
        "pie",
        "piece",
        "pig",
        "pile",
        "pilot",
        "pine",
        "pink",
        "pipe",
        "pitch",
        "place",
        "plain",
        "plan",
        "plane",
        "planet",
        "planned",
        "planning",
        "plant",
        "plastic",
        "plate",
        "plates",
        "play",
        "pleasant",
        "please",
        "pleasure",
        "plenty",
        "plural",
        "plus",
        "pocket",
        "poem",
        "poet",
        "poetry",
        "point",
        "pole",
        "police",
        "policeman",
        "political",
        "pond",
        "pony",
        "pool",
        "poor",
        "popular",
        "population",
        "porch",
        "port",
        "position",
        "positive",
        "possible",
        "possibly",
        "post",
        "pot",
        "potatoes",
        "pound",
        "pour",
        "powder",
        "power",
        "powerful",
        "practical",
        "practice",
        "prepare",
        "present",
        "president",
        "press",
        "pressure",
        "pretty",
        "prevent",
        "previous",
        "price",
        "pride",
        "primitive",
        "principal",
        "principle",
        "printed",
        "private",
        "prize",
        "probably",
        "problem",
        "process",
        "produce",
        "product",
        "production",
        "program",
        "progress",
        "promised",
        "proper",
        "properly",
        "property",
        "protection",
        "proud",
        "prove",
        "provide",
        "public",
        "pull",
        "pupil",
        "pure",
        "purple",
        "purpose",
        "push",
        "put",
        "putting",
        "quarter",
        "queen",
        "question",
        "quick",
        "quickly",
        "quiet",
        "quietly",
        "quite",
        "rabbit",
        "race",
        "radio",
        "railroad",
        "rain",
        "raise",
        "ran",
        "ranch",
        "range",
        "rapidly",
        "rate",
        "rather",
        "raw",
        "rays",
        "reach",
        "read",
        "reader",
        "ready",
        "real",
        "realize",
        "rear",
        "reason",
        "recall",
        "receive",
        "recent",
        "recently",
        "recognize",
        "record",
        "red",
        "refer",
        "refused",
        "region",
        "regular",
        "related",
        "relationship",
        "religious",
        "remain",
        "remarkable",
        "remember",
        "remove",
        "repeat",
        "replace",
        "replied",
        "report",
        "represent",
        "require",
        "research",
        "respect",
        "rest",
        "result",
        "return",
        "review",
        "rhyme",
        "rhythm",
        "rice",
        "rich",
        "ride",
        "riding",
        "right",
        "ring",
        "rise",
        "rising",
        "river",
        "road",
        "roar",
        "rock",
        "rocket",
        "rocky",
        "rod",
        "roll",
        "roof",
        "room",
        "root",
        "rope",
        "rose",
        "rough",
        "round",
        "route",
        "row",
        "rubbed",
        "rubber",
        "rule",
        "ruler",
        "run",
        "running",
        "rush",
        "sad",
        "saddle",
        "safe",
        "safety",
        "said",
        "sail",
        "sale",
        "salmon",
        "salt",
        "same",
        "sand",
        "sang",
        "sat",
        "satellites",
        "satisfied",
        "save",
        "saved",
        "saw",
        "say",
        "scale",
        "scared",
        "scene",
        "school",
        "science",
        "scientific",
        "scientist",
        "score",
        "screen",
        "sea",
        "search",
        "season",
        "seat",
        "second",
        "secret",
        "section",
        "see",
        "seed",
        "seeing",
        "seems",
        "seen",
        "seldom",
        "select",
        "selection",
        "sell",
        "send",
        "sense",
        "sent",
        "sentence",
        "separate",
        "series",
        "serious",
        "serve",
        "service",
        "sets",
        "setting",
        "settle",
        "settlers",
        "seven",
        "several",
        "shade",
        "shadow",
        "shake",
        "shaking",
        "shall",
        "shallow",
        "shape",
        "share",
        "sharp",
        "she",
        "sheep",
        "sheet",
        "shelf",
        "shells",
        "shelter",
        "shine",
        "shinning",
        "ship",
        "shirt",
        "shoe",
        "shoot",
        "shop",
        "shore",
        "short",
        "shorter",
        "shot",
        "should",
        "shoulder",
        "shout",
        "show",
        "shown",
        "shut",
        "sick",
        "sides",
        "sight",
        "sign",
        "signal",
        "silence",
        "silent",
        "silk",
        "silly",
        "silver",
        "similar",
        "simple",
        "simplest",
        "simply",
        "since",
        "sing",
        "single",
        "sink",
        "sister",
        "sit",
        "sitting",
        "situation",
        "six",
        "size",
        "skill",
        "skin",
        "sky",
        "slabs",
        "slave",
        "sleep",
        "slept",
        "slide",
        "slight",
        "slightly",
        "slip",
        "slipped",
        "slope",
        "slow",
        "slowly",
        "small",
        "smaller",
        "smallest",
        "smell",
        "smile",
        "smoke",
        "smooth",
        "snake",
        "snow",
        "so",
        "soap",
        "social",
        "society",
        "soft",
        "softly",
        "soil",
        "solar",
        "sold",
        "soldier",
        "solid",
        "solution",
        "solve",
        "some",
        "somebody",
        "somehow",
        "someone",
        "something",
        "sometime",
        "somewhere",
        "son",
        "song",
        "soon",
        "sort",
        "sound",
        "source",
        "south",
        "southern",
        "space",
        "speak",
        "special",
        "species",
        "specific",
        "speech",
        "speed",
        "spell",
        "spend",
        "spent",
        "spider",
        "spin",
        "spirit",
        "spite",
        "split",
        "spoken",
        "sport",
        "spread",
        "spring",
        "square",
        "stage",
        "stairs",
        "stand",
        "standard",
        "star",
        "stared",
        "start",
        "state",
        "statement",
        "station",
        "stay",
        "steady",
        "steam",
        "steel",
        "steep",
        "stems",
        "step",
        "stepped",
        "stick",
        "stiff",
        "still",
        "stock",
        "stomach",
        "stone",
        "stood",
        "stop",
        "stopped",
        "store",
        "storm",
        "story",
        "stove",
        "straight",
        "strange",
        "stranger",
        "straw",
        "stream",
        "street",
        "strength",
        "stretch",
        "strike",
        "string",
        "strip",
        "strong",
        "stronger",
        "struck",
        "structure",
        "struggle",
        "stuck",
        "student",
        "studied",
        "studying",
        "subject",
        "substance",
        "success",
        "successful",
        "such",
        "sudden",
        "suddenly",
        "sugar",
        "suggest",
        "suit",
        "sum",
        "summer",
        "sun",
        "sunlight",
        "supper",
        "supply",
        "support",
        "suppose",
        "sure",
        "surface",
        "surprise",
        "surrounded",
        "swam",
        "sweet",
        "swept",
        "swim",
        "swimming",
        "swing",
        "swung",
        "syllable",
        "symbol",
        "system",
        "table",
        "tail",
        "take",
        "taken",
        "tales",
        "talk",
        "tall",
        "tank",
        "tape",
        "task",
        "taste",
        "taught",
        "tax",
        "tea",
        "teach",
        "teacher",
        "team",
        "tears",
        "teeth",
        "telephone",
        "television",
        "tell",
        "temperature",
        "ten",
        "tent",
        "term",
        "terrible",
        "test",
        "than",
        "thank",
        "that",
        "thee",
        "them",
        "themselves",
        "then",
        "theory",
        "there",
        "therefore",
        "these",
        "they",
        "thick",
        "thin",
        "thing",
        "think",
        "third",
        "thirty",
        "this",
        "those",
        "thou",
        "though",
        "thought",
        "thousand",
        "thread",
        "three",
        "threw",
        "throat",
        "through",
        "throughout",
        "throw",
        "thrown",
        "thumb",
        "thus",
        "thy",
        "tide",
        "tie",
        "tight",
        "tightly",
        "till",
        "time",
        "tin",
        "tiny",
        "tip",
        "tired",
        "title",
        "to",
        "tobacco",
        "today",
        "together",
        "told",
        "tomorrow",
        "tone",
        "tongue",
        "tonight",
        "too",
        "took",
        "tool",
        "top",
        "topic",
        "torn",
        "total",
        "touch",
        "toward",
        "tower",
        "town",
        "toy",
        "trace",
        "track",
        "trade",
        "traffic",
        "trail",
        "train",
        "transportation",
        "trap",
        "travel",
        "treated",
        "tree",
        "triangle",
        "tribe",
        "trick",
        "tried",
        "trip",
        "troops",
        "tropical",
        "trouble",
        "truck",
        "trunk",
        "truth",
        "try",
        "tube",
        "tune",
        "turn",
        "twelve",
        "twenty",
        "twice",
        "two",
        "type",
        "typical",
        "uncle",
        "under",
        "underline",
        "understanding",
        "unhappy",
        "union",
        "unit",
        "universe",
        "unknown",
        "unless",
        "until",
        "unusual",
        "up",
        "upon",
        "upper",
        "upward",
        "us",
        "use",
        "useful",
        "using",
        "usual",
        "usually",
        "valley",
        "valuable",
        "value",
        "vapor",
        "variety",
        "various",
        "vast",
        "vegetable",
        "verb",
        "vertical",
        "very",
        "vessels",
        "victory",
        "view",
        "village",
        "visit",
        "visitor",
        "voice",
        "volume",
        "vote",
        "vowel",
        "voyage",
        "wagon",
        "wait",
        "walk",
        "wall",
        "want",
        "war",
        "warm",
        "warn",
        "was",
        "wash",
        "waste",
        "watch",
        "water",
        "wave",
        "way",
        "we",
        "weak",
        "wealth",
        "wear",
        "weather",
        "week",
        "weigh",
        "weight",
        "welcome",
        "well",
        "went",
        "were",
        "west",
        "western",
        "wet",
        "whale",
        "what",
        "whatever",
        "wheat",
        "wheel",
        "when",
        "whenever",
        "where",
        "wherever",
        "whether",
        "which",
        "while",
        "whispered",
        "whistle",
        "white",
        "who",
        "whole",
        "whom",
        "whose",
        "why",
        "wide",
        "widely",
        "wife",
        "wild",
        "will",
        "willing",
        "win",
        "wind",
        "window",
        "wing",
        "winter",
        "wire",
        "wise",
        "wish",
        "with",
        "within",
        "without",
        "wolf",
        "women",
        "won",
        "wonder",
        "wonderful",
        "wood",
        "wooden",
        "wool",
        "word",
        "wore",
        "work",
        "worker",
        "world",
        "worried",
        "worry",
        "worse",
        "worth",
        "would",
        "wrapped",
        "write",
        "writer",
        "writing",
        "written",
        "wrong",
        "wrote",
        "yard",
        "year",
        "yellow",
        "yes",
        "yesterday",
        "yet",
        "you",
        "young",
        "younger",
        "your",
        "yourself",
        "youth",
        "zero",
        "zebra",
        "zipper",
        "zoo",
        "zulu"
      ];
      function words(options) {
        const random2 = (options == null ? void 0 : options.seed) ? new seedrandom2(options.seed) : null;
        function word() {
          if (options && options.maxLength > 1) {
            return generateWordWithMaxLength();
          } else {
            return generateRandomWord();
          }
        }
        function generateWordWithMaxLength() {
          var rightSize = false;
          var wordUsed;
          while (!rightSize) {
            wordUsed = generateRandomWord();
            if (wordUsed.length <= options.maxLength) {
              rightSize = true;
            }
          }
          return wordUsed;
        }
        function generateRandomWord() {
          return wordList[randInt(wordList.length)];
        }
        function randInt(lessThan) {
          const r = random2 ? random2() : Math.random();
          return Math.floor(r * lessThan);
        }
        if (typeof options === "undefined") {
          return word();
        }
        if (typeof options === "number") {
          options = { exactly: options };
        }
        if (options.exactly) {
          options.min = options.exactly;
          options.max = options.exactly;
        }
        if (typeof options.wordsPerString !== "number") {
          options.wordsPerString = 1;
        }
        if (typeof options.formatter !== "function") {
          options.formatter = (word2) => word2;
        }
        if (typeof options.separator !== "string") {
          options.separator = " ";
        }
        var total2 = options.min + randInt(options.max + 1 - options.min);
        var results = [];
        var token = "";
        var relativeIndex = 0;
        for (var i = 0; i < total2 * options.wordsPerString; i++) {
          if (relativeIndex === options.wordsPerString - 1) {
            token += options.formatter(word(), relativeIndex);
          } else {
            token += options.formatter(word(), relativeIndex) + options.separator;
          }
          relativeIndex++;
          if ((i + 1) % options.wordsPerString === 0) {
            results.push(token);
            token = "";
            relativeIndex = 0;
          }
        }
        if (typeof options.join === "string") {
          results = results.join(options.join);
        }
        return results;
      }
      module.exports = words;
      words.wordList = wordList;
    }
  });

  // package.json
  var version = "0.0.1";

  // src/constants.ts
  var TASK_NAME = "stop-signal-task";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-stop-signal-task";
  var STAGE_FG = "#ffffff";
  var STAGE_BG = "#000000";
  var TONE_DURATION_MS = 75;
  var TONE_FREQUENCY_HZ = 750;
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_STOP_WAIT_MS = 2500;
  var INSTRUCTION_SSD_MS = 250;
  var INSTRUCTION_CORRECT_MS = 900;
  var SIMULATION = {
    /** go RT: ex-Gaussian, ms */
    go_rt: { mu: 400, sigma: 50, tau: 100 },
    /** stop-signal reaction time, mean and SD, ms */
    ssrt: { mean: 200, sd: 30 },
    /** probability of ignoring the stop signal altogether (trigger failure) */
    trigger_failure: 0.03,
    /** probability of a go omission */
    go_omission: 0.02,
    /** probability of pressing the wrong key on a go trial */
    choice_error: 0.03
  };

  // ../../node_modules/@jspsych/sequencer/dist/index.js
  var random = () => Math.random();
  function withRng(rng, fn) {
    const prev = random;
    random = rng != null ? rng : (() => Math.random());
    try {
      return fn();
    } finally {
      random = prev;
    }
  }
  var SequenceError = class extends Error {
    constructor(message, constraints, proven_infeasible = false) {
      super(message);
      this.name = "SequenceError";
      this.constraints = constraints;
      this.proven_infeasible = proven_infeasible;
    }
  };
  function shuffled(a) {
    const c = a.slice();
    for (let m = c.length; m > 1; ) {
      const i = Math.floor(random() * m--);
      const t = c[m];
      c[m] = c[i];
      c[i] = t;
    }
    return c;
  }
  var signatures = /* @__PURE__ */ new WeakMap();
  function signature(item) {
    if (typeof item !== "object" || item === null) return item;
    let s = signatures.get(item);
    if (s === void 0) {
      const vals = Object.values(item);
      if (vals.every((v) => typeof v !== "object" && typeof v !== "function"))
        s = JSON.stringify(item);
      else return item;
      signatures.set(item, s);
    }
    return s;
  }
  function keyFn(key) {
    if (key === void 0) return (item) => item;
    if (typeof key === "function") return key;
    return (item) => item == null ? void 0 : item[key];
  }
  function keyName(key) {
    return key === void 0 ? "item" : typeof key === "string" ? key : key.name || "key()";
  }
  function valueTest(values) {
    if (values === void 0) return () => true;
    if (typeof values === "function") return values;
    return (v) => values.includes(v);
  }
  function matcher(rule, key, values) {
    if (values === void 0)
      throw new TypeError(
        `${rule}(): \`values\` is required: the key values to count, e.g. { key: isTarget, values: [true] }.`
      );
    const k = keyFn(key);
    const t = valueTest(values);
    return (item, i) => t(k(item, i));
  }
  var fmt = (x) => typeof x === "string" ? x : JSON.stringify(x);
  var valuesName = (v) => v === void 0 ? "" : typeof v === "function" ? "|filter" : `|${fmt(v)}`;
  function runLength(opts) {
    const k = keyFn(opts.key);
    const applies = valueTest(opts.values);
    const { min, max, allowed } = opts;
    const cap = Math.min(max != null ? max : Infinity, allowed ? Math.max(...allowed) : Infinity);
    const trailing = (p) => {
      let r = 1;
      const v = k(p[p.length - 1], p.length - 1);
      while (r < p.length && k(p[p.length - 1 - r], p.length - 1 - r) === v) r++;
      return r;
    };
    const okCompleted = (len) => (min === void 0 || len >= min) && (!allowed || allowed.includes(len));
    const scan = (seq, start) => {
      const bad = [];
      let i = 0;
      while (i < seq.length) {
        const v = k(seq[i], i);
        let j = i;
        while (j + 1 < seq.length && k(seq[j + 1], j + 1) === v) j++;
        if (applies(v) && j >= start) {
          const len = j - i + 1;
          let count = 0;
          if (max !== void 0 && len > max) {
            for (let x = i + max; x <= j; x++) if (x >= start) count++;
          }
          if (j < seq.length - 1 && !okCompleted(len)) count += Math.max(1, (min != null ? min : 0) - len);
          if (count) bad.push({ count, from: i, to: j });
        }
        i = j + 1;
      }
      return bad;
    };
    const parts = [
      min !== void 0 && `>=${min}`,
      max !== void 0 && `<=${max}`,
      allowed && `in ${fmt(allowed)}`
    ].filter(Boolean);
    return {
      name: `runLength(${keyName(opts.key)}${valuesName(opts.values)} ${parts.join(",")})`,
      allows(prefix, next) {
        if (prefix.length === 0) return true;
        const li = prefix.length - 1;
        const lv = k(prefix[li], li);
        if (lv === k(next, prefix.length)) {
          return !applies(lv) || trailing(prefix) + 1 <= cap;
        }
        return !applies(lv) || okCompleted(trailing(prefix));
      },
      feasible(prefix, remaining) {
        var _a;
        if (remaining.length === 0) return true;
        if (cap !== Infinity) {
          const counts = /* @__PURE__ */ new Map();
          for (let i = 0; i < remaining.length; i++) {
            const v = k(remaining[i], prefix.length + i);
            counts.set(v, ((_a = counts.get(v)) != null ? _a : 0) + 1);
          }
          const li2 = prefix.length - 1;
          const lv2 = prefix.length ? k(prefix[li2], li2) : void 0;
          for (const [v, c] of counts) {
            if (!applies(v)) continue;
            const first = prefix.length && lv2 === v ? cap - trailing(prefix) : cap;
            if (c > first + (remaining.length - c) * cap) return false;
          }
        }
        if (prefix.length === 0 || min === void 0 && !allowed) return true;
        const li = prefix.length - 1;
        const lv = k(prefix[li], li);
        if (!applies(lv)) return true;
        const len = trailing(prefix);
        let more = 0;
        for (let i = 0; i < remaining.length; i++)
          if (k(remaining[i], prefix.length + i) === lv) more++;
        for (let l = len; l <= len + more; l++) if (l <= cap && okCompleted(l)) return true;
        return false;
      },
      violations: (seq, start) => scan(seq, start).reduce((s, b) => s + b.count, 0),
      positions(seq, start) {
        const out = [];
        for (const b of scan(seq, start)) for (let x = b.from; x <= b.to; x++) out.push(x);
        return out;
      }
    };
  }
  function maxRun(opts) {
    const c = runLength({ key: opts.key, values: opts.values, max: opts.max });
    return __spreadProps(__spreadValues({}, c), { name: `maxRun(${keyName(opts.key)}${valuesName(opts.values)}<=${opts.max})` });
  }
  function minGap(opts) {
    const k = keyFn(opts.key);
    const applies = valueTest(opts.values);
    const gap = opts.gap;
    const bad = (seq, i) => {
      const v = k(seq[i], i);
      if (!applies(v)) return false;
      for (let j = Math.max(0, i - gap); j < i; j++) if (k(seq[j], j) === v) return true;
      return false;
    };
    return {
      name: `minGap(${keyName(opts.key)}${valuesName(opts.values)}>=${gap})`,
      allows(prefix, next) {
        const i = prefix.length;
        const v = k(next, i);
        if (!applies(v)) return true;
        for (let j = Math.max(0, i - gap); j < i; j++) if (k(prefix[j], j) === v) return false;
        return true;
      },
      feasible(prefix, remaining) {
        var _a;
        const counts = /* @__PURE__ */ new Map();
        for (let i = 0; i < remaining.length; i++) {
          const v = k(remaining[i], prefix.length + i);
          counts.set(v, ((_a = counts.get(v)) != null ? _a : 0) + 1);
        }
        for (const [v, c] of counts) {
          if (!applies(v)) continue;
          let offset = 0;
          for (let j = prefix.length - 1; j >= Math.max(0, prefix.length - gap); j--) {
            if (k(prefix[j], j) === v) {
              offset = gap - (prefix.length - 1 - j);
              break;
            }
          }
          if ((c - 1) * (gap + 1) + 1 + offset > remaining.length) return false;
        }
        return true;
      },
      violations(seq, start) {
        let n = 0;
        for (let i = start; i < seq.length; i++) if (bad(seq, i)) n++;
        return n;
      },
      positions(seq, start) {
        const out = [];
        for (let i = start; i < seq.length; i++) if (bad(seq, i)) out.push(i);
        return out;
      }
    };
  }
  function noRepeat(opts = {}) {
    var _a;
    const within = (_a = opts.within) != null ? _a : 1;
    const c = minGap({ key: opts.key, values: opts.values, gap: within });
    return __spreadProps(__spreadValues({}, c), {
      name: `noRepeat(${keyName(opts.key)}${valuesName(opts.values)}, within ${within})`
    });
  }
  function maxGap(opts) {
    const k = keyFn(opts.key);
    const applies = valueTest(opts.values);
    const gap = opts.gap;
    const lastIndex = (seq, v, before) => {
      for (let j = before - 1; j >= 0; j--) if (k(seq[j], j) === v) return j;
      return -1;
    };
    const bad = (seq, i) => {
      const v = k(seq[i], i);
      if (!applies(v)) return false;
      const j = lastIndex(seq, v, i);
      return j >= 0 && i - j - 1 > gap;
    };
    return {
      name: `maxGap(${keyName(opts.key)}${valuesName(opts.values)}<=${gap})`,
      allows(prefix, next) {
        const i = prefix.length;
        const v = k(next, i);
        if (!applies(v)) return true;
        const j = lastIndex(prefix, v, i);
        return j < 0 || i - j - 1 <= gap;
      },
      feasible(prefix, remaining) {
        const seen = /* @__PURE__ */ new Set();
        for (let r = 0; r < remaining.length; r++) {
          const v = k(remaining[r], prefix.length + r);
          if (seen.has(v)) continue;
          seen.add(v);
          if (!applies(v)) continue;
          const j = lastIndex(prefix, v, prefix.length);
          if (j >= 0 && prefix.length - j > gap) return false;
        }
        return true;
      },
      violations(seq, start) {
        let n = 0;
        for (let i = start; i < seq.length; i++) if (bad(seq, i)) n++;
        return n;
      },
      positions(seq, start) {
        const out = [];
        for (let i = start; i < seq.length; i++) if (bad(seq, i)) out.push(i);
        return out;
      }
    };
  }
  function startWith(opts) {
    var _a;
    const m = matcher("startWith", opts.key, opts.values);
    const count = (_a = opts.count) != null ? _a : 1;
    return {
      name: `startWith(${keyName(opts.key)}${valuesName(opts.values)} x${count})`,
      allows(prefix, next, start) {
        const r = prefix.length - start;
        return r >= count || m(next, prefix.length);
      },
      feasible(prefix, remaining, start) {
        const need = count - (prefix.length - start);
        if (need <= 0) return true;
        let have = 0;
        for (let i = 0; i < remaining.length && have < need; i++)
          if (m(remaining[i], prefix.length + i)) have++;
        return have >= need;
      },
      violations(seq, start) {
        let n = 0;
        for (let i = start; i < Math.min(seq.length, start + count); i++) if (!m(seq[i], i)) n++;
        return n;
      },
      positions(seq, start) {
        const out = [];
        for (let i = start; i < Math.min(seq.length, start + count); i++)
          if (!m(seq[i], i)) out.push(i);
        return out;
      }
    };
  }
  function balancedTransitions(opts = {}) {
    var _a;
    const k = keyFn(opts.key);
    const tol = (_a = opts.tolerance) != null ? _a : 0;
    const label = (seq, i) => opts.classify ? opts.classify(seq[i - 1], seq[i]) : JSON.stringify([k(seq[i - 1], i - 1), k(seq[i], i)]);
    const tally = (seq, start) => {
      var _a2;
      const counts = /* @__PURE__ */ new Map();
      let pairs = 0;
      for (let i = Math.max(1, start); i < seq.length; i++) {
        const id = label(seq, i);
        if (opts.cells && !opts.cells.includes(id)) continue;
        counts.set(id, ((_a2 = counts.get(id)) != null ? _a2 : 0) + 1);
        pairs++;
      }
      let cells = opts.cells;
      if (!cells) {
        const vals = /* @__PURE__ */ new Set();
        for (let i = start; i < seq.length; i++) vals.add(k(seq[i], i));
        cells = [];
        for (const a of vals) for (const b of vals) cells.push(JSON.stringify([a, b]));
      }
      return { counts, pairs, cells };
    };
    return {
      name: `balancedTransitions(${opts.classify ? "custom" : keyName(opts.key)})`,
      violations(seq, start) {
        var _a2;
        const { counts, pairs, cells } = tally(seq, start);
        if (!cells.length) return 0;
        const mean = pairs / cells.length;
        const hi = Math.ceil(mean + tol);
        const lo = Math.floor(mean - tol);
        let v = 0;
        for (const cell of cells) {
          const c = (_a2 = counts.get(cell)) != null ? _a2 : 0;
          v += Math.max(0, c - hi) + Math.max(0, lo - c);
        }
        return v;
      }
    };
  }
  function allocate(weights, n) {
    const keys = Array.isArray(weights) ? weights.map((_, i) => i) : Object.keys(weights);
    const w = keys.map((key) => weights[key]);
    if (w.some((x) => !(x >= 0)) || !w.some((x) => x > 0)) {
      throw new Error("allocate(): weights must be non-negative numbers and not all zero.");
    }
    const total2 = w.reduce((a, b) => a + b, 0);
    const quota = w.map((x) => x / total2 * n);
    const base = quota.map(Math.floor);
    const frac = quota.map((q, i) => Math.round((q - base[i]) * 1e9));
    let left = n - base.reduce((a, b) => a + b, 0);
    const order = frac.map((_, i) => i).sort((a, b) => frac[b] - frac[a] || a - b);
    for (const i of order) {
      if (left-- <= 0) break;
      base[i]++;
    }
    if (Array.isArray(weights)) return base;
    const out = {};
    keys.forEach((key, i) => out[key] = base[i]);
    return out;
  }
  function expand(items, counts) {
    return items.flatMap((item, i) => new Array(counts[i]).fill(item));
  }
  var isSampler = (s) => !Array.isArray(s);
  function total(cs, seq, start) {
    let t = 0;
    for (const c of cs) t += c.violations(seq, start);
    return t;
  }
  function violated(cs, seq, start) {
    return cs.filter((c) => c.violations(seq, start) > 0).map((c) => c.name);
  }
  var Fail = class extends Error {
    constructor(blame, proven, detail) {
      super(detail);
      this.blame = blame;
      this.proven = proven;
      this.detail = detail;
    }
  };
  function backtrackItems(items, cs, after, o) {
    var _a, _b, _c, _d;
    const start = after.length;
    for (const c of cs) {
      if (c.feasible && !c.feasible(after, items, start)) {
        throw new Fail([c.name], true, `"${c.name}" cannot be satisfied by these items`);
      }
    }
    const blame = /* @__PURE__ */ new Map();
    let bestDepth = -1;
    let exhausted = false;
    let timedOut = false;
    for (let attempt = 0; attempt < o.max_attempts; attempt++) {
      if (Date.now() > o.deadline) {
        timedOut = true;
        break;
      }
      const ctx = after.slice();
      const rem = items.slice();
      let nodes = 0;
      let budgetHit = false;
      const stack = [];
      const open = () => stack.push({
        order: shuffled(rem.map((_, i) => i)),
        pos: 0,
        tried: /* @__PURE__ */ new Set(),
        idx: -1,
        item: void 0,
        placed: false,
        local: /* @__PURE__ */ new Map()
      });
      if (rem.length) open();
      while (stack.length && rem.length) {
        const f = stack[stack.length - 1];
        if (f.placed) {
          ctx.pop();
          rem.splice(f.idx, 0, f.item);
          f.placed = false;
        }
        let advanced = false;
        while (f.pos < f.order.length) {
          const idx = f.order[f.pos++];
          const item = rem[idx];
          const sig = signature(item);
          if (f.tried.has(sig)) continue;
          f.tried.add(sig);
          let rejectedBy;
          for (const c of cs) {
            if (c.allows && !c.allows(ctx, item, start)) {
              rejectedBy = c.name;
              break;
            }
          }
          if (rejectedBy) {
            f.local.set(rejectedBy, ((_a = f.local.get(rejectedBy)) != null ? _a : 0) + 1);
            continue;
          }
          ctx.push(item);
          rem.splice(idx, 1);
          let bad;
          for (const c of cs) {
            if (c.feasible && !c.feasible(ctx, rem, start)) {
              bad = c.name;
              break;
            }
          }
          if (bad) {
            f.local.set(bad, ((_b = f.local.get(bad)) != null ? _b : 0) + 1);
            ctx.pop();
            rem.splice(idx, 0, item);
            continue;
          }
          f.idx = idx;
          f.item = item;
          f.placed = true;
          advanced = true;
          break;
        }
        if (advanced) {
          if (++nodes > o.max_nodes || (nodes & 255) === 0 && Date.now() > o.deadline) {
            budgetHit = true;
            break;
          }
          if (rem.length) open();
          continue;
        }
        const depth = stack.length - 1;
        if (depth >= bestDepth) {
          if (depth > bestDepth) blame.clear();
          bestDepth = depth;
          for (const [name, n] of f.local) blame.set(name, ((_c = blame.get(name)) != null ? _c : 0) + n);
        }
        stack.pop();
      }
      if (!budgetHit && !stack.length && rem.length) {
        exhausted = true;
        break;
      }
      if (!rem.length) {
        if (total(cs, ctx, start) === 0) return ctx.slice(start);
        for (const n of violated(cs, ctx, start)) blame.set(n, ((_d = blame.get(n)) != null ? _d : 0) + 1);
      }
    }
    const names = [...blame.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n);
    const main = names.slice(0, 3);
    throw new Fail(
      main,
      exhausted && cs.every((c) => c.allows),
      exhausted ? `no valid order exists (search exhausted after placing ${bestDepth} of ${items.length} items); blocked by ${main.map((n) => `"${n}"`).join(", ") || "the constraints"}` : `no valid order found in ${timedOut ? "the time limit" : o.max_attempts + " attempts"} (got ${Math.max(bestDepth, 0)} of ${items.length} items in place); mostly blocked by ${main.map((n) => `"${n}"`).join(", ") || "the constraints"}`
    );
  }
  function backtrackSampled(src, cs, after, o) {
    var _a, _b;
    const start = after.length;
    const blame = /* @__PURE__ */ new Map();
    let best = 0;
    for (let attempt = 0; attempt < o.max_attempts && Date.now() <= o.deadline; attempt++) {
      const ctx = after.slice();
      let nodes = 0;
      let stuck = 0;
      while (ctx.length - start < src.n && nodes++ < o.max_nodes) {
        let placed = false;
        for (let t = 0; t < 100 && !placed; t++) {
          const item = src.draw();
          const rej = cs.find((c) => c.allows && !c.allows(ctx, item, start));
          if (rej) blame.set(rej.name, ((_a = blame.get(rej.name)) != null ? _a : 0) + 1);
          else {
            ctx.push(item);
            placed = true;
          }
        }
        if (!placed) {
          if (ctx.length > start) ctx.pop();
          if (++stuck > 50) break;
        }
        best = Math.max(best, ctx.length - start);
      }
      if (ctx.length - start === src.n) {
        if (total(cs, ctx, start) === 0) return ctx.slice(start);
        for (const n of violated(cs, ctx, start)) blame.set(n, ((_b = blame.get(n)) != null ? _b : 0) + 1);
      }
    }
    const names = [...blame.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n).slice(0, 3);
    throw new Fail(
      names,
      false,
      `no valid sequence found in ${o.max_attempts} attempts (got ${best} of ${src.n}); mostly blocked by ${names.map((n) => `"${n}"`).join(", ") || "the constraints"}`
    );
  }
  function repair(source, cs, after, o) {
    const start = after.length;
    const n = isSampler(source) ? source.n : source.length;
    const draw = isSampler(source) ? () => source.draw() : void 0;
    let bestSeq;
    let bestCost = Infinity;
    const withPos = cs.filter((c) => c.positions);
    for (let attempt = 0; attempt < o.max_attempts; attempt++) {
      if (attempt > 0 && Date.now() > o.deadline) break;
      let cur = draw ? Array.from({ length: n }, draw) : shuffled(source);
      let full = after.concat(cur);
      let cost = total(cs, full, start);
      const budget = 30 * n + 500;
      for (let it = 0; it < budget && cost > 0; it++) {
        if ((it & 63) === 63 && Date.now() > o.deadline) break;
        let i;
        if (withPos.length && random() < 0.8) {
          const pool = [];
          for (const c of withPos)
            if (c.violations(full, start) > 0) {
              for (const p of c.positions(full, start)) if (p >= start) pool.push(p - start);
            }
          i = pool.length ? pool[Math.floor(random() * pool.length)] : Math.floor(random() * n);
        } else i = Math.floor(random() * n);
        if (draw) {
          const old = cur[i];
          cur[i] = draw();
          full[start + i] = cur[i];
          const c2 = total(cs, full, start);
          if (c2 <= cost) cost = c2;
          else {
            cur[i] = old;
            full[start + i] = old;
          }
        } else {
          const j = Math.floor(random() * n);
          if (i === j || cur[i] === cur[j]) continue;
          const a = cur[i];
          cur[i] = cur[j];
          cur[j] = a;
          full[start + i] = cur[i];
          full[start + j] = cur[j];
          const c2 = total(cs, full, start);
          if (c2 <= cost) cost = c2;
          else {
            cur[j] = cur[i];
            cur[i] = a;
            full[start + i] = a;
            full[start + j] = cur[j];
          }
        }
      }
      if (cost === 0) return cur;
      if (cost < bestCost) {
        bestCost = cost;
        bestSeq = cur;
      }
    }
    const names = violated(cs, after.concat(bestSeq), start);
    throw new Fail(
      names,
      false,
      `repair could not remove all violations in ${o.max_attempts} attempts (best had ${bestCost}); still violated: ${names.map((x) => `"${x}"`).join(", ")}`
    );
  }
  function rejection(source, cs, after, o) {
    var _a;
    const start = after.length;
    const make = () => isSampler(source) ? Array.from({ length: source.n }, () => source.draw()) : shuffled(source);
    const tally = /* @__PURE__ */ new Map();
    for (let a = 0; a < o.max_attempts; a++) {
      if ((a & 63) === 63 && Date.now() > o.deadline) break;
      const cand = make();
      const full = after.concat(cand);
      const bad = violated(cs, full, start);
      if (!bad.length) return cand;
      for (const b of bad) tally.set(b, ((_a = tally.get(b)) != null ? _a : 0) + 1);
    }
    const names = [...tally.entries()].sort((a, b) => b[1] - a[1]).map(([n]) => n).slice(0, 3);
    throw new Fail(
      names,
      false,
      `rejection sampling found no valid order in ${o.max_attempts} shuffles; most often violated: ${names.map((x) => `"${x}"`).join(", ")}`
    );
  }
  function sequence(source, constraints, options = {}) {
    return withRng(options.rng, () => solve(source, constraints, options));
  }
  function solve(source, constraints, options) {
    var _a, _b, _c, _d;
    const after = (_a = options.after) != null ? _a : [];
    const n = isSampler(source) ? source.n : source.length;
    const solver = (_b = options.solver) != null ? _b : "auto";
    const max_nodes = (_c = options.max_nodes) != null ? _c : 10 * n + 500;
    const deadline = Date.now() + ((_d = options.time_limit) != null ? _d : 3e3);
    const run = (which) => {
      var _a2, _b2, _c2, _d2;
      switch (which) {
        case "backtrack":
          return isSampler(source) ? backtrackSampled(source, constraints, after, {
            max_attempts: (_a2 = options.max_attempts) != null ? _a2 : 30,
            max_nodes,
            deadline
          }) : backtrackItems(source, constraints, after, {
            max_attempts: (_b2 = options.max_attempts) != null ? _b2 : 30,
            max_nodes,
            deadline
          });
        case "repair":
          return repair(source, constraints, after, {
            max_attempts: (_c2 = options.max_attempts) != null ? _c2 : 10,
            deadline
          });
        case "rejection":
          return rejection(source, constraints, after, {
            max_attempts: (_d2 = options.max_attempts) != null ? _d2 : 2e4,
            deadline
          });
      }
    };
    try {
      if (solver !== "auto") return run(solver);
      if (constraints.every((c) => c.allows)) {
        try {
          return run("backtrack");
        } catch (e) {
          if (!(e instanceof Fail) || e.proven) throw e;
          try {
            return run("repair");
          } catch (e2) {
            if (e2 instanceof Fail) throw e;
            throw e2;
          }
        }
      }
      return run("repair");
    } catch (e) {
      if (e instanceof Fail) {
        throw new SequenceError(`sequence(): ${e.detail}.`, e.blame, e.proven);
      }
      throw e;
    }
  }
  function sequenceBlocks(blocks, constraints, options = {}) {
    var _a;
    const out = [];
    let history = ((_a = options.after) != null ? _a : []).slice();
    blocks.forEach((b, i) => {
      try {
        const cs = typeof constraints === "function" ? constraints(i) : constraints;
        const block = sequence(b, cs, __spreadProps(__spreadValues({}, options), { after: history }));
        out.push(block);
        history = history.concat(block);
      } catch (e) {
        if (e instanceof SequenceError) {
          throw new SequenceError(`block ${i}: ${e.message}`, e.constraints, e.proven_infeasible);
        }
        throw e;
      }
    });
    return out;
  }

  // src/design.ts
  var sequencerRng = (jsPsych) => () => jsPsych.randomization.randomInt(0, __pow(2, 30) - 1) / __pow(2, 30);
  function sampleDuration(jsPsych, d) {
    if (typeof d === "number") return d;
    const step = d.step && d.step > 0 ? d.step : 1;
    const k = jsPsych.randomization.randomInt(0, Math.floor((d.max - d.min) / step + 1e-9));
    return d.min + k * step;
  }
  function constraintsFor(sc) {
    var _a, _b, _c, _d;
    const out = [];
    if (!sc) return out;
    const key = "trial_type";
    if (sc.max_run !== void 0) {
      if (typeof sc.max_run === "number") out.push(maxRun({ key, max: sc.max_run }));
      else {
        for (const [c, max] of Object.entries(sc.max_run)) {
          out.push(maxRun({ key, values: [c], max }));
        }
      }
    }
    for (const [c, gap] of Object.entries((_a = sc.min_gap) != null ? _a : {})) {
      out.push(minGap({ key, values: [c], gap }));
    }
    for (const [c, gap] of Object.entries((_b = sc.max_gap) != null ? _b : {})) {
      out.push(maxGap({ key, values: [c], gap }));
    }
    for (const [c, allowed] of Object.entries((_c = sc.run_length) != null ? _c : {})) {
      out.push(runLength({ key, values: [c], allowed }));
    }
    for (const [c, count] of Object.entries((_d = sc.start_with) != null ? _d : {})) {
      out.push(startWith({ key, values: [c], count }));
    }
    if (sc.no_immediate_repeat === true) out.push(noRepeat({ key }));
    else if (Array.isArray(sc.no_immediate_repeat)) {
      for (const f of sc.no_immediate_repeat) {
        if (f === "go" || f === "stop") out.push(noRepeat({ key, values: [f] }));
        else out.push(noRepeat({ key: f }));
      }
    }
    if (sc.balanced_transitions) out.push(balancedTransitions({ key }));
    return out;
  }
  function allocateTypes(p, n) {
    var _a, _b;
    const [stop, go] = allocate([(_a = p.stop) != null ? _a : 0, (_b = p.go) != null ? _b : 0], n);
    return { stop, go };
  }
  function buildBlockSpecs(jsPsych, o, n, p, after = []) {
    var _a, _b, _c;
    const R = jsPsych.randomization;
    const sc = o.sequence_constraints;
    const cycle = sc == null ? void 0 : sc.cycle_length;
    const rng = sequencerRng(jsPsych);
    const counts = allocateTypes(p, n);
    let types;
    if (cycle !== void 0) {
      if (!(Number.isInteger(cycle) && cycle >= 1) || n % cycle !== 0) {
        throw new Error(
          `stop-signal-task: sequence_constraints.cycle_length ${cycle} does not divide the ${n} trials of a block.`
        );
      }
      const perCycle = allocate([(_a = p.stop) != null ? _a : 0, (_b = p.go) != null ? _b : 0], cycle);
      const exact = ((_c = p.stop) != null ? _c : 0) * cycle;
      if (Math.abs(exact - Math.round(exact)) > 1e-9) {
        throw new Error(
          `stop-signal-task: sequence_constraints.cycle_length ${cycle} cannot hold the proportions { stop: ${p.stop}, go: ${p.go} } exactly (${exact} stop trials per cycle).`
        );
      }
      types = Array.from({ length: n / cycle }, () => expand(["stop", "go"], perCycle));
    } else {
      types = [expand(["stop", "go"], [counts.stop, counts.go])];
    }
    const flat = types.flat();
    const nStop = flat.filter((t) => t === "stop").length;
    const nGo = flat.length - nStop;
    const dirs = (k) => R.shuffle(expand(["left", "right"], allocate([1, 1], k)));
    const overall = Array.isArray(sc == null ? void 0 : sc.no_immediate_repeat) && sc.no_immediate_repeat.includes("go_direction");
    const allDirs = overall ? dirs(flat.length) : [];
    const stopDirs = overall ? allDirs.slice(0, nStop) : dirs(nStop);
    const goDirs = overall ? allDirs.slice(nStop) : dirs(nGo);
    const dl = o.difficulty_levels;
    let stopSsds;
    if (dl === null) stopSsds = new Array(nStop).fill(null);
    else if (Array.isArray(dl)) {
      const each = allocate(
        dl.map(() => 1),
        nStop
      );
      stopSsds = R.shuffle(expand(dl, each));
    } else {
      stopSsds = Array.from({ length: nStop }, () => sampleDuration(jsPsych, dl));
    }
    let si = 0;
    let gi = 0;
    const make = (t) => ({
      trial_type: t,
      go_direction: t === "stop" ? stopDirs[si] : goDirs[gi],
      fixation_ms: sampleDuration(jsPsych, o.fixation_duration_ms),
      iti_ms: sampleDuration(jsPsych, o.iti_ms),
      feedback_ms: sampleDuration(jsPsych, o.feedback_duration_ms),
      fixed_ssd: t === "stop" ? stopSsds[si++] : (gi++, null)
    });
    const chunks = types.map((c) => c.map(make));
    const rules = constraintsFor(sc);
    const opts = { rng, after };
    if (cycle !== void 0) {
      return sequenceBlocks(chunks, rules, opts).flat();
    }
    if (rules.length === 0) return R.shuffle(chunks[0]);
    return sequence(chunks[0], rules, opts);
  }

  // src/options.ts
  var PHASE_OPTIONS = [
    "trial_feedback",
    "feedback_condition",
    "feedback_duration_ms",
    "response_window_ms",
    "fixation_duration_ms",
    "iti_ms",
    "stimulus_duration_ms",
    "condition_proportions",
    "sequence_constraints",
    "difficulty_levels",
    "adaptive"
  ];
  var DEFAULT_ADAPTIVE = {
    procedure: "staircase_1up_1down",
    start_level: 200,
    step_size: { up: 50, down: 50 },
    target_accuracy: 0.5,
    bounds: [50, 1200],
    discontinue_rule: null,
    tracks: "single",
    reset: "never"
  };
  var DEFAULT_PRACTICE_CRITERION = {
    accuracy: 0.8,
    window: null,
    on_fail: "repeat",
    max_repeats: 2
  };
  var DEFAULT_CYCLE_LENGTH = 8;
  var DEFAULT_OPTIONS = {
    break_duration_ms: 15e3,
    feedback_duration_ms: 750,
    fixation_duration_ms: 250,
    iti_ms: 500,
    response_window_ms: 1250,
    stimulus_duration_ms: { go: null, stop_signal: null },
    stimulus_modality: "visual",
    stimulus_set: { go: "arrows", stop_signal: "arrow_turns_red" },
    condition_proportions: [{ stop: 0.25, go: 0.75 }],
    difficulty_levels: null,
    n_blocks: 4,
    trials_per_block: 64,
    sequence_constraints: { cycle_length: DEFAULT_CYCLE_LENGTH },
    response_device: "keyboard",
    response_keys: ["ArrowLeft", "ArrowRight"],
    response_mapping_counterbalancing: "fixed",
    adaptive: DEFAULT_ADAPTIVE,
    device_eligibility: "none",
    practice_criterion: null,
    practice_trials: 32,
    block_feedback: "accuracy_rt",
    feedback_condition: "all",
    trial_feedback: "none",
    performance_incentive: "none",
    strategy_instruction: "dont_wait_plus_tracking_explanation",
    population_protocol: "standard",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    practice: { trial_feedback: "accuracy" }
  };
  var NOT_IMPLEMENTED = [
    [
      "stimulus_modality",
      ["audiovisual", "tactile"],
      "only visual and auditory stop signals are implemented"
    ],
    [
      "response_device",
      ["microphone", "eye_tracker", "gamepad"],
      "only keyboard, mouse and touch (two buttons) are implemented"
    ],
    [
      "device_eligibility",
      ["browser_restricted", "hardware_required"],
      "only computer_only is implemented (fullscreen, window size and browser checks are not)"
    ],
    ["block_feedback", ["points"], "the stop-signal task has no points"],
    ["trial_feedback", ["points", "reward_outcome"], "the stop-signal task has no points or reward"],
    [
      "performance_incentive",
      ["bonus", "points_only", "fixed_payment"],
      "incentives are not implemented"
    ],
    [
      "population_protocol",
      ["child", "gamified_child", "clinical"],
      "only the standard protocol is implemented"
    ],
    [
      "instruction_format",
      ["audio", "video"],
      "no media is bundled; supply your own instruction trials"
    ],
    [
      "instruction_demonstration",
      ["animated", "guided_trial"],
      "use interactive (real stimuli, repeat until correct), examples or none"
    ],
    [
      "response_mapping_counterbalancing",
      ["counterbalanced", "random_per_participant", "within_participant"],
      "the arrows point left or right, so the mapping is spatial and fixed"
    ]
  ];
  var isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  function normaliseProportions(p) {
    const list = Array.isArray(p) ? p : [p];
    if (list.length === 0) {
      throw new Error("stop-signal-task: condition_proportions: an empty list.");
    }
    return list.map((m, i) => {
      var _a, _b;
      if (!isObj(m)) throw new Error(`stop-signal-task: condition_proportions[${i}] must be a map.`);
      const values = Object.values(m);
      if (values.some((v) => isObj(v))) {
        throw new Error(
          "stop-signal-task: condition_proportions: crossed factors (maps of maps) are not used here; give { stop, go } or a list of such maps."
        );
      }
      const unknown = Object.keys(m).filter((k) => k !== "go" && k !== "stop");
      if (unknown.length) {
        throw new Error(
          `stop-signal-task: condition_proportions: unknown trial type ${unknown.join(
          ", "
        )} (use go, stop).`
        );
      }
      for (const v of values) {
        if (typeof v !== "number" || !(v >= 0) || !Number.isFinite(v)) {
          throw new Error("stop-signal-task: condition_proportions values must be numbers >= 0.");
        }
      }
      const sum = values.reduce((a, b) => a + b, 0);
      if (!(sum > 0)) {
        throw new Error("stop-signal-task: condition_proportions must sum to more than 0.");
      }
      return {
        stop: ((_a = m.stop) != null ? _a : 0) / sum,
        go: ((_b = m.go) != null ? _b : 0) / sum
      };
    });
  }
  function resolveAdaptive(user) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i;
    const procedure = (_a = user.procedure) != null ? _a : DEFAULT_ADAPTIVE.procedure;
    if (procedure !== "staircase_1up_1down" && procedure !== "staircase_1up_2down" && procedure !== "staircase_1up_3down") {
      throw new Error(
        `stop-signal-task: adaptive.procedure: "${procedure}" is not implemented (use staircase_1up_1down, staircase_1up_2down or staircase_1up_3down; the dossier's "tracking" is staircase_1up_1down).`
      );
    }
    const natural = procedure === "staircase_1up_1down" ? 0.5 : procedure === "staircase_1up_2down" ? 0.707 : 0.794;
    const rawStep = (_b = user.step_size) != null ? _b : 50;
    const given = user.target_accuracy;
    let up;
    let down;
    let target;
    if (typeof rawStep === "number") {
      if (!(rawStep > 0)) throw new Error("stop-signal-task: adaptive.step_size must be > 0.");
      target = given != null ? given : natural;
      if (procedure === "staircase_1up_1down") {
        if (!(target > 0 && target < 1)) {
          throw new Error("stop-signal-task: adaptive.target_accuracy must be between 0 and 1.");
        }
        up = round1(rawStep * Math.min(1, (1 - target) / target));
        down = round1(rawStep * Math.min(1, target / (1 - target)));
      } else {
        if (Math.abs(target - natural) > 0.02) {
          throw new Error(
            `stop-signal-task: adaptive.target_accuracy ${target} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
          );
        }
        up = rawStep;
        down = rawStep;
      }
    } else {
      up = rawStep.up;
      down = rawStep.down;
      if (!(up > 0) || !(down > 0)) {
        throw new Error("stop-signal-task: adaptive.step_size { up, down } must both be > 0.");
      }
      if (procedure === "staircase_1up_1down") {
        const implied = down / (up + down);
        if (given !== void 0 && Math.abs(given - implied) > 0.02) {
          throw new Error(
            `stop-signal-task: adaptive.step_size { up: ${up}, down: ${down} } and target_accuracy ${given} contradict each other (the steps imply ${implied.toFixed(
            3
          )}; p x up must equal (1 - p) x down).`
          );
        }
        target = given != null ? given : implied;
      } else {
        if (up !== down) {
          throw new Error(
            `stop-signal-task: adaptive.procedure "${procedure}" needs equal up and down steps.`
          );
        }
        if (given !== void 0 && Math.abs(given - natural) > 0.02) {
          throw new Error(
            `stop-signal-task: adaptive.target_accuracy ${given} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
          );
        }
        target = given != null ? given : natural;
      }
    }
    const bounds = (_c = user.bounds) != null ? _c : DEFAULT_ADAPTIVE.bounds;
    if (!Array.isArray(bounds) || bounds.length !== 2) {
      throw new Error("stop-signal-task: adaptive.bounds must be [min, max] (null for no limit).");
    }
    const start = (_d = user.start_level) != null ? _d : DEFAULT_ADAPTIVE.start_level;
    if (bounds[0] !== null && bounds[1] !== null && !(bounds[0] < bounds[1])) {
      throw new Error("stop-signal-task: adaptive.bounds must have min < max.");
    }
    if (bounds[0] !== null && start < bounds[0] || bounds[1] !== null && start > bounds[1]) {
      throw new Error(
        `stop-signal-task: adaptive.start_level ${start} is outside adaptive.bounds [${bounds[0]}, ${bounds[1]}].`
      );
    }
    const tracks = (_e = user.tracks) != null ? _e : DEFAULT_ADAPTIVE.tracks;
    const reset = (_f = user.reset) != null ? _f : DEFAULT_ADAPTIVE.reset;
    if (tracks !== "single" && tracks !== "per_condition") {
      throw new Error('stop-signal-task: adaptive.tracks must be "single" or "per_condition".');
    }
    if (reset !== "never" && reset !== "block" && reset !== "phase") {
      throw new Error('stop-signal-task: adaptive.reset must be "never", "block" or "phase".');
    }
    return {
      procedure,
      start_level: start,
      step_size: { up, down },
      target_accuracy: round3(target),
      bounds: [(_g = bounds[0]) != null ? _g : null, (_h = bounds[1]) != null ? _h : null],
      discontinue_rule: (_i = user.discontinue_rule) != null ? _i : null,
      tracks,
      reset
    };
  }
  var round1 = (x) => Math.round(x * 10) / 10;
  var round3 = (x) => Math.round(x * 1e3) / 1e3;
  function splitTrials(total2, parts) {
    const base = Math.floor(total2 / parts);
    const extra = total2 - base * parts;
    return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
  }
  function resolveOptions(user = {}, phase = "test") {
    var _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const _a = user, { practice, text: _text } = _a, top = __objRest(_a, ["practice", "text"]);
    const topKeys = new Set(Object.keys(top).filter((k) => top[k] !== void 0));
    let layer = __spreadValues({}, top);
    if (phase === "practice") {
      const practiceKeys = new Set(Object.keys(practice != null ? practice : {}));
      const defaultPractice = {};
      for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
        if (!topKeys.has(k) && !practiceKeys.has(k)) defaultPractice[k] = v;
      }
      layer = __spreadValues(__spreadValues(__spreadValues({}, layer), defaultPractice), practice != null ? practice : {});
    }
    const merged = __spreadValues({}, DEFAULT_OPTIONS);
    delete merged.practice;
    for (const [k, v] of Object.entries(layer)) if (v !== void 0) merged[k] = v;
    const sd = layer.stimulus_duration_ms;
    merged.stimulus_duration_ms = sd === void 0 ? __spreadValues({}, DEFAULT_OPTIONS.stimulus_duration_ms) : isObj(sd) ? { go: (_b = sd.go) != null ? _b : null, stop_signal: (_c = sd.stop_signal) != null ? _c : null } : { go: sd, stop_signal: null };
    const set = (_d = layer.stimulus_set) != null ? _d : {};
    const modGiven = layer.stimulus_modality !== void 0;
    const signalGiven = set.stop_signal !== void 0;
    let modality = merged.stimulus_modality;
    let signal = (_e = set.stop_signal) != null ? _e : DEFAULT_OPTIONS.stimulus_set.stop_signal;
    if (signalGiven && !modGiven) modality = signal === "tone" ? "auditory" : "visual";
    if (modGiven && !signalGiven && modality === "auditory") signal = "tone";
    if (modGiven && signalGiven) {
      if (modality === "auditory" !== (signal === "tone") && (modality === "visual" || modality === "auditory")) {
        throw new Error(
          `stop-signal-task: stimulus_modality "${modality}" and stimulus_set.stop_signal "${signal}" contradict each other (the tone is the auditory signal).`
        );
      }
    }
    let goForm = (_f = set.go) != null ? _f : DEFAULT_OPTIONS.stimulus_set.go;
    if (signal === "circle_turns_red") {
      if (set.go === "arrows") {
        throw new Error(
          'stop-signal-task: stimulus_set.stop_signal "circle_turns_red" needs stimulus_set.go "arrows_in_circle", not "arrows".'
        );
      }
      goForm = "arrows_in_circle";
    }
    merged.stimulus_modality = modality;
    merged.stimulus_set = { go: goForm, stop_signal: signal };
    merged.condition_proportions = normaliseProportions(
      (_g = layer.condition_proportions) != null ? _g : DEFAULT_OPTIONS.condition_proportions
    );
    const adaptiveGiven = layer.adaptive !== void 0;
    const levelsGiven = layer.difficulty_levels !== void 0 && layer.difficulty_levels !== null;
    if (levelsGiven && adaptiveGiven && layer.adaptive !== null) {
      throw new Error(
        "stop-signal-task: adaptive and difficulty_levels both set the stop-signal delay; give one (adaptive: null with difficulty_levels is fixed delays)."
      );
    }
    if (levelsGiven) {
      merged.adaptive = null;
    } else if (layer.adaptive === null) {
      merged.adaptive = null;
    } else {
      merged.adaptive = resolveAdaptive((_h = layer.adaptive) != null ? _h : {});
      merged.difficulty_levels = null;
    }
    if (levelsGiven) merged.difficulty_levels = layer.difficulty_levels;
    const nGiven = top.n_test_trials;
    const blocksGiven = top.n_blocks !== void 0;
    const tpbGiven = top.trials_per_block !== void 0;
    let nBlocks = merged.n_blocks;
    let tpb = merged.trials_per_block;
    let n;
    if (nGiven !== void 0) {
      n = nGiven;
      if (tpbGiven && blocksGiven && n !== nBlocks * tpb) {
        throw new Error(
          `stop-signal-task: n_test_trials ${n} contradicts n_blocks ${nBlocks} x trials_per_block ${tpb}.`
        );
      }
      if (tpbGiven && !blocksGiven) {
        if (n % tpb !== 0) {
          throw new Error(
            `stop-signal-task: n_test_trials ${n} is not a multiple of trials_per_block ${tpb}.`
          );
        }
        nBlocks = n / tpb;
      } else {
        tpb = Math.ceil(n / nBlocks);
      }
    } else {
      n = nBlocks * tpb;
    }
    merged.n_blocks = nBlocks;
    merged.trials_per_block = tpb;
    merged.n_test_trials = n;
    const scGiven = layer.sequence_constraints !== void 0;
    if (scGiven) {
      merged.sequence_constraints = layer.sequence_constraints;
    } else {
      const sizes = splitTrials(n, nBlocks);
      const fits = (size, p) => {
        var _a2;
        if (size % DEFAULT_CYCLE_LENGTH !== 0) return false;
        const stopPerCycle = ((_a2 = p.stop) != null ? _a2 : 0) * DEFAULT_CYCLE_LENGTH;
        return Math.abs(stopPerCycle - Math.round(stopPerCycle)) < 1e-9;
      };
      const blocks = phase === "test" ? sizes : [merged.practice_trials];
      const ok = blocks.every(
        (size, i) => fits(size, merged.condition_proportions[Math.min(i, merged.condition_proportions.length - 1)])
      );
      merged.sequence_constraints = ok ? { cycle_length: DEFAULT_CYCLE_LENGTH } : null;
    }
    const sc = merged.sequence_constraints;
    if (sc && sc.cycle_length === void 0 && Object.keys(sc).length === 0) {
      merged.sequence_constraints = null;
    }
    const pc = layer.practice_criterion;
    const stratGiven = top.strategy_instruction !== void 0;
    if (!stratGiven && merged.adaptive === null) merged.strategy_instruction = "dont_wait";
    merged.practice_criterion = pc === void 0 || pc === null ? null : {
      accuracy: (_i = pc.accuracy) != null ? _i : DEFAULT_PRACTICE_CRITERION.accuracy,
      window: pc.window === void 0 ? DEFAULT_PRACTICE_CRITERION.window : pc.window,
      on_fail: (_j = pc.on_fail) != null ? _j : DEFAULT_PRACTICE_CRITERION.on_fail,
      max_repeats: (_k = pc.max_repeats) != null ? _k : DEFAULT_PRACTICE_CRITERION.max_repeats
    };
    return merged;
  }
  function validateOptions(o, phase = "test") {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`stop-signal-task: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    if (typeof o.response_window_ms !== "number" || !(o.response_window_ms > 0)) {
      throw new Error(
        "stop-signal-task: response_window_ms must be a positive number: a stop trial has no response to end it, so null (untimed) is not possible."
      );
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
      throw new Error(
        "stop-signal-task: response_keys must list exactly two keys (first = left arrow)."
      );
    }
    if (!(o.n_blocks >= 1) || !Number.isInteger(o.n_blocks)) {
      throw new Error("stop-signal-task: n_blocks must be a positive integer.");
    }
    const nLists = Array.isArray(o.condition_proportions) ? o.condition_proportions.length : 1;
    if (phase === "test" && nLists > o.n_blocks) {
      throw new Error(
        `stop-signal-task: condition_proportions lists ${nLists} blocks but the test has ${o.n_blocks}; set n_blocks or shorten the list.`
      );
    }
    if (!(o.trials_per_block >= 1)) {
      throw new Error("stop-signal-task: trials_per_block must be a positive integer.");
    }
    const hasStop = o.condition_proportions.some((p) => {
      var _a;
      return ((_a = p.stop) != null ? _a : 0) > 0;
    });
    if (hasStop && o.adaptive === null && o.difficulty_levels === null) {
      throw new Error(
        "stop-signal-task: stop trials need a stop-signal delay: set adaptive (the staircase) or difficulty_levels (fixed delays)."
      );
    }
    const dl = o.difficulty_levels;
    if (dl !== null) {
      if (Array.isArray(dl)) {
        if (dl.length === 0 || dl.some((v) => typeof v !== "number" || !(v >= 0))) {
          throw new Error("stop-signal-task: difficulty_levels must be a list of delays >= 0 ms.");
        }
      } else if (!(dl.min >= 0) || !(dl.max >= dl.min)) {
        throw new Error("stop-signal-task: difficulty_levels { min, max } needs 0 <= min <= max.");
      }
    }
    const { go, stop_signal } = o.stimulus_duration_ms;
    const onGo = o.stimulus_set.stop_signal;
    if ((onGo === "arrow_turns_red" || onGo === "circle_turns_red") && go !== null) {
      throw new Error(
        `stop-signal-task: stimulus_set.stop_signal "${onGo}" changes the go stimulus, which is gone when stimulus_duration_ms.go is a number; use null, or the "border" or "tone" signal.`
      );
    }
    for (const [name, v] of [
      ["go", go],
      ["stop_signal", stop_signal]
    ]) {
      if (v !== null && !(v > 0)) {
        throw new Error(`stop-signal-task: stimulus_duration_ms.${name} must be > 0 or null.`);
      }
    }
    if (o.device_eligibility === "computer_only" && o.response_device === "touch") {
      throw new Error(
        'stop-signal-task: device_eligibility "computer_only" contradicts response_device "touch".'
      );
    }
    if (o.strategy_instruction === "dont_wait_plus_tracking_explanation" && o.adaptive === null) {
      throw new Error(
        'stop-signal-task: strategy_instruction "dont_wait_plus_tracking_explanation" explains the staircase, but adaptive is null (fixed delays).'
      );
    }
    const pc = o.practice_criterion;
    if (pc) {
      if (!(pc.accuracy > 0 && pc.accuracy <= 1)) {
        throw new Error("stop-signal-task: practice_criterion.accuracy must be in (0, 1].");
      }
      if (pc.window !== null && !(pc.window >= 1)) {
        throw new Error("stop-signal-task: practice_criterion.window must be >= 1 or null.");
      }
      if (!["repeat", "continue", "end"].includes(pc.on_fail)) {
        throw new Error(
          'stop-signal-task: practice_criterion.on_fail must be "repeat", "continue" or "end".'
        );
      }
      if (!(pc.max_repeats >= 0) || !Number.isInteger(pc.max_repeats)) {
        throw new Error("stop-signal-task: practice_criterion.max_repeats must be an integer >= 0.");
      }
      if (phase === "test" && o.practice_trials === 0) {
        throw new Error("stop-signal-task: practice_criterion needs practice_trials > 0.");
      }
    }
    const sc = o.sequence_constraints;
    if (sc) {
      const known = [
        "max_run",
        "min_gap",
        "max_gap",
        "run_length",
        "start_with",
        "no_immediate_repeat",
        "balanced_transitions",
        "cycle_length"
      ];
      const unknown = Object.keys(sc).filter((k) => !known.includes(k));
      if (unknown.length) {
        throw new Error(
          `stop-signal-task: sequence_constraints: unknown rule ${unknown.join(
          ", "
        )} (known: ${known.join(", ")}).`
        );
      }
      const condKeys = (m) => Object.keys(m != null ? m : {}).filter((k) => k !== "go" && k !== "stop");
      const bad = [
        ...typeof sc.max_run === "object" ? condKeys(sc.max_run) : [],
        ...condKeys(sc.min_gap),
        ...condKeys(sc.max_gap),
        ...condKeys(sc.run_length),
        ...condKeys(sc.start_with)
      ];
      if (bad.length) {
        throw new Error(
          `stop-signal-task: sequence_constraints names unknown trial type ${bad.join(
          ", "
        )} (use go, stop).`
        );
      }
    }
  }

  // src/scoring.ts
  var isNum = (x) => typeof x === "number";
  var hasRt = (t) => isNum(t.rt);
  var responded = (t) => isNum(t.rt) || t.response !== null && t.response !== void 0;
  var meanOf = (c, field) => {
    const col = c.select(field);
    return col.count() ? col.mean() : null;
  };
  function integrationSsrt(rows) {
    const go = rows.filter({ condition: "go" });
    const stop = rows.filter({ condition: "stop" });
    if (!go.count() || !stop.count()) return null;
    const rts = go.filterCustom(hasRt).select("rt");
    if (!rts.count()) return null;
    const max = rts.max();
    const all = go.values().map((t) => isNum(t.rt) ? t.rt : max).sort((a, b) => a - b);
    const p = stop.filterCustom(responded).count() / stop.count();
    if (p === 0) return null;
    const nth = Math.min(all.length, Math.max(1, Math.ceil(p * all.length)));
    const ssd = meanOf(
      stop.filterCustom((t) => isNum(t.ssd)),
      "ssd"
    );
    if (ssd === null) return null;
    return all[nth - 1] - ssd;
  }
  function scoreRows(rows) {
    const go = rows.filter({ condition: "go" });
    const stop = rows.filter({ condition: "stop" });
    const nGo = go.count();
    const nStop = stop.count();
    const goCorrect = go.filter({ correct: true });
    const goOmissions = go.filterCustom((t) => !responded(t)).count();
    const goErrors = go.filterCustom((t) => responded(t) && t.correct !== true).count();
    const failed = stop.filterCustom(responded);
    const pRespond = nStop ? failed.count() / nStop : null;
    const goCorrectRt = goCorrect.filterCustom(hasRt).select("rt");
    const meanGoRt = goCorrectRt.count() ? goCorrectRt.mean() : null;
    const meanSsd = meanOf(
      stop.filterCustom((t) => isNum(t.ssd)),
      "ssd"
    );
    const failedRt = meanOf(failed.filterCustom(hasRt), "rt");
    const allGoRt = meanOf(go.filterCustom(hasRt), "rt");
    const blocks = [...new Set(stop.select("block").values)];
    const perBlock = blocks.map((b) => integrationSsrt(rows.filter({ block: b }))).filter((x) => x !== null);
    const goOmissionRate = nGo ? goOmissions / nGo : null;
    const goChoiceRate = nGo ? goErrors / nGo : null;
    return {
      n_trials: rows.count(),
      n_go_trials: nGo,
      n_stop_trials: nStop,
      go_accuracy: nGo ? goCorrect.count() / nGo : null,
      go_omission_rate: goOmissionRate,
      go_choice_error_rate: goChoiceRate,
      mean_go_rt: meanGoRt,
      median_go_rt: goCorrectRt.count() ? goCorrectRt.median() : null,
      p_respond_signal: pRespond,
      stop_accuracy: pRespond === null ? null : 1 - pRespond,
      mean_ssd: meanSsd,
      failed_stop_rt: failedRt,
      ssrt_integration: integrationSsrt(rows),
      ssrt_integration_blockwise: perBlock.length ? perBlock.reduce((a, b) => a + b, 0) / perBlock.length : null,
      ssrt_mean: allGoRt !== null && meanSsd !== null ? allGoRt - meanSsd : null
    };
  }
  function calculateScores(data) {
    return scoreRows(data.filter({ task: TASK_NAME, phase: "test", part: "response" }));
  }
  function getSummary(data) {
    return __spreadProps(__spreadValues({}, calculateScores(data)), { task: TASK_NAME, version: VERSION });
  }

  // src/simulation.ts
  function hasForcedRt(jsPsych) {
    var _a, _b;
    const o = jsPsych.simulationOptions;
    return ((_b = (_a = o == null ? void 0 : o.default) == null ? void 0 : _a.data) == null ? void 0 : _b.rt) !== void 0;
  }
  function simulateRace(jsPsych, trial, window_ms) {
    var _a;
    const R = jsPsych.randomization;
    const correct = trial.direction === "left" ? 0 : 1;
    const draw = () => R.randomInt(0, 1e6) / 1e6;
    const goRt = Math.round(
      R.sampleExGaussian(SIMULATION.go_rt.mu, SIMULATION.go_rt.sigma, 1 / SIMULATION.go_rt.tau, true)
    );
    const pick = () => draw() < SIMULATION.choice_error ? 1 - correct : correct;
    if (trial.trial_type === "go") {
      if (draw() < SIMULATION.go_omission || goRt > window_ms)
        return { rt: null, response_index: null };
      return { rt: goRt, response_index: pick() };
    }
    const ssrt = Math.max(50, R.sampleNormal(SIMULATION.ssrt.mean, SIMULATION.ssrt.sd));
    const stopFinishes = ((_a = trial.ssd) != null ? _a : 0) + ssrt;
    const triggerFailure = draw() < SIMULATION.trigger_failure;
    if ((triggerFailure || goRt < stopFinishes) && goRt <= window_ms) {
      return { rt: goRt, response_index: pick() };
    }
    return { rt: null, response_index: null };
  }

  // src/staircase.ts
  var StaircaseSet = class {
    constructor(jsPsych, cfg) {
      this.jsPsych = jsPsych;
      this.cfg = cfg;
      this.tracks = /* @__PURE__ */ new Map();
    }
    keyFor(direction) {
      return this.cfg.tracks === "per_condition" ? direction : "all";
    }
    track(key) {
      let t = this.tracks.get(key);
      if (!t) {
        const c = this.cfg;
        t = this.jsPsych.adaptive.createStaircase(__spreadValues({
          label: key,
          start_level: c.start_level,
          correct_moves: "up",
          // successes in a row needed to lengthen the delay; one failure shortens it
          up: c.procedure === "staircase_1up_1down" ? 1 : c.procedure === "staircase_1up_2down" ? 2 : 3,
          down: 1,
          step_size: c.step_size,
          bounds: c.bounds
        }, c.discontinue_rule ? { stop: c.discontinue_rule } : {}));
        this.tracks.set(key, t);
      }
      return t;
    }
    /** The delay of the next stop trial on this track, ms. */
    level(key) {
      return this.track(key).level;
    }
    /** Record the outcome of a stop trial (true = successful stop). A finished staircase keeps its level. */
    update(key, success) {
      const t = this.track(key);
      if (!t.done) t.update(success);
    }
    /** The staircase state after the last update, without its history (small enough for every trial row). */
    compact(key) {
      const _a = this.track(key).toJSON(), { history: _h, config: _c } = _a, rest = __objRest(_a, ["history", "config"]);
      return rest;
    }
    /** Full `toJSON()` of every track that exists, history included. */
    snapshot() {
      return [...this.tracks.values()].map((t) => JSON.parse(JSON.stringify(t.toJSON())));
    }
  };
  var StaircaseManager = class {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.set = null;
      this.phase = null;
      this.cfgKey = null;
    }
    /** Called when a block starts. Returns the set in force (null for fixed delays). */
    startBlock(phase, cfg) {
      if (cfg === null) {
        this.set = null;
        this.cfgKey = null;
        this.phase = phase;
        return null;
      }
      const key = JSON.stringify(cfg);
      const fresh = this.set === null || this.cfgKey !== key || cfg.reset === "block" || cfg.reset === "phase" && this.phase !== phase;
      if (fresh) this.set = new StaircaseSet(this.jsPsych, cfg);
      this.cfgKey = key;
      this.phase = phase;
      return this.set;
    }
    /** The set in force, creating one from `cfg` if no block has started (units used by hand). */
    current(phase, cfg) {
      var _a;
      return (_a = this.set) != null ? _a : this.startBlock(phase, cfg);
    }
  };

  // src/stimuli.ts
  var ARROW_RIGHT_PATH = "m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z";
  var ARROW_LEFT_PATH = "M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z";
  var CLS = {
    stage: `${TASK_CLASS}-stage`,
    center: `${TASK_CLASS}-center`,
    screen: `${TASK_CLASS}-screen`,
    below: `${TASK_CLASS}-below`,
    go: `${TASK_CLASS}-go`,
    ring: `${TASK_CLASS}-ring`,
    arrow: `${TASK_CLASS}-arrow`,
    signal: `${TASK_CLASS}-signal`,
    signalled: `${TASK_CLASS}-signalled`,
    text: `${TASK_CLASS}-text`,
    fixation: `${TASK_CLASS}-fixation`,
    feedback: `${TASK_CLASS}-feedback`
  };
  var ARROW_SIZE_PX = 72;
  function renderArrow(direction, size = ARROW_SIZE_PX) {
    const path = direction === "left" ? ARROW_LEFT_PATH : ARROW_RIGHT_PATH;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48"><g fill="currentColor"><path d="${path}"/></g></svg>`;
  }
  function renderScreen(stage, below = "") {
    const region = below ? `<div class="${CLS.below}">${below}</div>` : "";
    return `<div class="${CLS.screen}">${stage}${region}</div>`;
  }
  var SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;
  function paintDisplay(fg = STAGE_FG, bg = STAGE_BG) {
    if (!SAFE_COLOR.test(fg) || !SAFE_COLOR.test(bg))
      throw new Error("stop-signal-task: bad colour.");
    return `<style>.jspsych-display-element:has(.${TASK_CLASS}){background:${bg};color:${fg};}</style>`;
  }
  function renderStage(inner, below = "") {
    const stage = `<div class="${CLS.stage}"><div class="${CLS.center}">${inner}</div></div>`;
    return paintDisplay() + renderScreen(stage, below);
  }
  function renderGoStage(go, signal, direction, below = "") {
    const stage = `<div class="${CLS.stage}" data-signal="${signal}" data-go="${go}">
    <div class="${CLS.center}"><div class="${CLS.go}"><span class="${CLS.ring}"></span><span class="${CLS.arrow}">${renderArrow(direction)}</span></div></div>
    <div class="${CLS.signal}"></div>
  </div>`;
    return paintDisplay() + renderScreen(stage, below);
  }

  // src/text.ts
  var signalSentence = (signal) => {
    switch (signal) {
      case "arrow_turns_red":
        return 'the arrow turns <strong style="color:#e53935">red</strong>';
      case "circle_turns_red":
        return 'the circle around the arrow turns <strong style="color:#e53935">red</strong>';
      case "border":
        return 'a <strong style="color:#4d8dff">blue frame</strong> appears around the arrow';
      case "tone":
        return "you hear a <strong>beep</strong>";
    }
  };
  var defaultText = {
    instruction_intro: `<h2>Stop-Signal Task</h2>
    <p>On each trial an arrow appears. It points to the left or to the right.</p>
    <p>Your main job is to respond to the direction of the arrow as quickly and accurately as you can.</p>`,
    instruction_response: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      return `<h2>How to Respond</h2>
    <p>Arrow pointing left ${r.left_arrow}: ${act} <strong>${r.left_response}</strong>.</p>
    <p>Arrow pointing right ${r.right_arrow}: ${act} <strong>${r.right_response}</strong>.</p>`;
    },
    instruction_stop: (r) => `<h2>The Stop Signal</h2>
    <p>On some trials, shortly after the arrow appears, ${signalSentence(r.signal)}.</p>
    <p>When that happens, <strong>do not respond</strong>: try to stop yourself.</p>
    <p>You will not always be able to stop, and that is fine. The signal comes on a minority of trials.</p>`,
    strategy_dont_wait: `<p>Do <strong>not</strong> wait for the stop signal. Respond to the arrow as quickly as you can, and only try to stop when the signal appears.</p>`,
    strategy_tracking_explanation: (r) => `<p>The signal appears later in the trial when you are good at stopping and earlier when you are not, so stopping is equally hard for everyone. You will succeed on about ${Math.round(
    r.target_accuracy * 100
  )}% of the stop trials.</p>`,
    strategy_balance: `<p>Both matter: respond quickly to the arrow, and try to stop when the signal appears.</p>`,
    strategy_heading: `<h2>Speed and Stopping</h2>`,
    instruction_demo_intro: `<h2>Let's Try It</h2>
    <p>Here are a few examples of what you will see. Respond to each one as you would in the task.</p>
    <p>There is no time limit for the arrows. If you respond incorrectly, you will get a hint and try again.</p>`,
    instruction_examples_intro: `<h2>Examples</h2>
    <p>Here are a few examples of what you will see, with the correct response for each.</p>`,
    instruction_step: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      return r.condition === "go" ? `<p>Respond to the arrow: ${act} <strong>${r.response}</strong>.</p>` : `<p>Respond to the arrow, but watch for the signal: ${signalSentence(
      r.signal
    )}. When it appears, do <strong>not</strong> respond. Just wait.</p>`;
    },
    instruction_hint: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      return r.condition === "go" ? `<p>Not quite. ${act[0].toUpperCase()}${act.slice(1)} <strong>${r.response}</strong> for this arrow.</p><p>Let's try again.</p>` : `<p>You responded after the signal appeared. When ${signalSentence(
      r.signal
    )}, do <strong>not</strong> respond.</p><p>Let's try again.</p>`;
    },
    instruction_reveal: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      return r.condition === "go" ? `<p>For this one, ${act} <strong>${r.response}</strong>. Let's move on.</p>` : `<p>When the signal appears, do not respond at all. Let's move on.</p>`;
    },
    instruction_correct: "Correct!",
    instruction_practice_intro: `<h2>Practice</h2><p>Now some practice at the pace of the real task. The main task starts after the practice.</p>`,
    instruction_test_intro: `<h2>Main Task</h2><p>Now the main task begins.</p>`,
    practice_repeat: `<h2>Practice Again</h2><p>Let's practice once more. Respond to the arrows quickly and accurately.</p>`,
    practice_ended: `<h2>Practice Not Passed</h2><p>The task ends here. Thank you.</p>`,
    left_button: "Left",
    right_button: "Right",
    continue_button: "Continue",
    ok_button: "OK",
    correct_feedback: "Correct",
    incorrect_feedback: "Incorrect",
    timeout_feedback: "Too slow!",
    stop_failed_feedback: "You should not respond when the signal appears",
    feedback_rt: (r) => `${Math.round(r.rt)} ms`,
    feedback_correct_answer: (r) => `Correct answer: ${r.answer}`,
    fixation: "+",
    block_complete: (blockNumber) => `Block ${blockNumber} complete. Take a short break if needed.`,
    block_feedback: (r) => {
      const parts = [`Block ${r.block} of ${r.n_blocks} complete.`];
      if ((r.kind === "accuracy" || r.kind === "accuracy_rt") && r.go_accuracy !== null) {
        parts.push(`Arrow trials answered correctly: ${Math.round(r.go_accuracy * 100)}%`);
      }
      if ((r.kind === "accuracy" || r.kind === "accuracy_rt") && r.stop_accuracy !== null) {
        parts.push(`Successful stops: ${Math.round(r.stop_accuracy * 100)}%`);
      }
      if ((r.kind === "rt" || r.kind === "accuracy_rt") && r.mean_go_rt !== null) {
        parts.push(`Mean response time to arrows: ${Math.round(r.mean_go_rt)} ms`);
      }
      return parts.map((p) => `<p>${p}</p>`).join("");
    },
    tip_waiting: "Remember: do not wait for the stop signal. Respond to the arrow as fast as you can.",
    tip_stop_more: "Try harder to stop when the signal appears.",
    device_not_supported: "This task needs a laptop or desktop computer. Please return on a computer.",
    task_complete: "Task Complete",
    result_summary: (r) => {
      let html = "";
      if (r.go_accuracy !== null)
        html += `<p><strong>Arrow trials correct:</strong> ${(r.go_accuracy * 100).toFixed(1)}%</p>`;
      if (r.mean_go_rt !== null)
        html += `<p><strong>Mean response time to arrows:</strong> ${r.mean_go_rt.toFixed(0)} ms</p>`;
      if (r.stop_accuracy !== null)
        html += `<p><strong>Successful stops:</strong> ${(r.stop_accuracy * 100).toFixed(1)}%</p>`;
      return html;
    }
  };

  // #style-inject:#style-inject
  function styleInject(css, { insertAt } = {}) {
    if (typeof document === "undefined") return;
    const head = document.head || document.getElementsByTagName("head")[0];
    const style = document.createElement("style");
    style.type = "text/css";
    if (insertAt === "top") {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  // src/styles.css
  styleInject(".jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-text p svg {\n  vertical-align: middle;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-text h2 {\n  text-align: center;\n}\n.jspsych-timelines-stop-signal-task {\n  --sst-stage-h: min(280px, 40vh);\n  --sst-btn-reserve: 76px;\n}\n.jspsych-timelines-stop-signal-task:has(.jspsych-timelines-stop-signal-task-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-screen {\n  display: contents;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 640px;\n  max-width: calc(100vw - 16px);\n  height: var(--sst-stage-h);\n  padding: 20px;\n  overflow: hidden;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-below {\n  position: absolute;\n  top: calc(50% + var(--sst-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-below .jspsych-timelines-stop-signal-task-text {\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-stop-signal-task:has(#jspsych-html-button-response-btngroup) .jspsych-timelines-stop-signal-task-below {\n  bottom: var(--sst-btn-reserve);\n}\n.jspsych-timelines-stop-signal-task:has(.jspsych-timelines-stop-signal-task-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 80px;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-fixation {\n  font-size: 3em;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-feedback {\n  font-size: 1em;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-feedback.incorrect,\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-feedback.timeout {\n  font-weight: bold;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-go {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 140px;\n  height: 140px;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-ring {\n  position: absolute;\n  inset: 0;\n  box-sizing: border-box;\n  border: 6px solid transparent;\n  border-radius: 50%;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-stage[data-go=arrows_in_circle] .jspsych-timelines-stop-signal-task-ring {\n  border-color: currentColor;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-arrow {\n  display: inline-flex;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-signal {\n  position: absolute;\n  inset: 0;\n  box-sizing: border-box;\n  border: 0 solid #4d8dff;\n  visibility: hidden;\n  pointer-events: none;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-stage[data-signal=border].jspsych-timelines-stop-signal-task-signalled .jspsych-timelines-stop-signal-task-signal {\n  visibility: visible;\n  border-width: 15px;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-stage[data-signal=arrow_turns_red].jspsych-timelines-stop-signal-task-signalled .jspsych-timelines-stop-signal-task-arrow {\n  color: #e53935;\n}\n.jspsych-timelines-stop-signal-task .jspsych-timelines-stop-signal-task-stage[data-signal=circle_turns_red].jspsych-timelines-stop-signal-task-signalled .jspsych-timelines-stop-signal-task-ring {\n  border-color: #e53935;\n}\n");

  // ../../node_modules/jspsych/dist/index.js
  __toESM(require_auto_bind());
  __toESM(require_random_words());
  __toESM(require_alea());
  var ParameterType = /* @__PURE__ */ ((ParameterType2) => {
    ParameterType2[ParameterType2["BOOL"] = 0] = "BOOL";
    ParameterType2[ParameterType2["STRING"] = 1] = "STRING";
    ParameterType2[ParameterType2["INT"] = 2] = "INT";
    ParameterType2[ParameterType2["FLOAT"] = 3] = "FLOAT";
    ParameterType2[ParameterType2["FUNCTION"] = 4] = "FUNCTION";
    ParameterType2[ParameterType2["KEY"] = 5] = "KEY";
    ParameterType2[ParameterType2["KEYS"] = 6] = "KEYS";
    ParameterType2[ParameterType2["SELECT"] = 7] = "SELECT";
    ParameterType2[ParameterType2["HTML_STRING"] = 8] = "HTML_STRING";
    ParameterType2[ParameterType2["IMAGE"] = 9] = "IMAGE";
    ParameterType2[ParameterType2["AUDIO"] = 10] = "AUDIO";
    ParameterType2[ParameterType2["VIDEO"] = 11] = "VIDEO";
    ParameterType2[ParameterType2["OBJECT"] = 12] = "OBJECT";
    ParameterType2[ParameterType2["COMPLEX"] = 13] = "COMPLEX";
    ParameterType2[ParameterType2["TIMELINE"] = 14] = "TIMELINE";
    return ParameterType2;
  })(ParameterType || {});
  [
    ParameterType.AUDIO,
    ParameterType.IMAGE,
    ParameterType.VIDEO
  ];
  var MigrationError = class extends Error {
    constructor(message = "The global `jsPsych` variable is no longer available in jsPsych v7.") {
      super(
        `${message} Please follow the migration guide at https://www.jspsych.org/7.0/support/migration-v7/ to update your experiment.`
      );
      this.name = "MigrationError";
    }
  };
  window.jsPsych = {
    get init() {
      throw new MigrationError("`jsPsych.init()` was replaced by `initJsPsych()` in jsPsych v7.");
    },
    get data() {
      throw new MigrationError();
    },
    get randomization() {
      throw new MigrationError();
    },
    get turk() {
      throw new MigrationError();
    },
    get pluginAPI() {
      throw new MigrationError();
    },
    get ALL_KEYS() {
      throw new MigrationError(
        'jsPsych.ALL_KEYS was replaced by the "ALL_KEYS" string in jsPsych v7.'
      );
    },
    get NO_KEYS() {
      throw new MigrationError('jsPsych.NO_KEYS was replaced by the "NO_KEYS" string in jsPsych v7.');
    }
  };
  if (typeof window !== "undefined" && window.hasOwnProperty("webkitAudioContext") && !window.hasOwnProperty("AudioContext")) {
    window.AudioContext = webkitAudioContext;
  }

  // ../../node_modules/@jspsych/plugin-html-button-response/dist/index.js
  var version2 = "2.1.0";
  var info = {
    name: "html-button-response",
    version: version2,
    parameters: {
      /** The HTML content to be displayed. */
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: void 0
      },
      /** Labels for the buttons. Each different string in the array will generate a different button. */
      choices: {
        type: ParameterType.STRING,
        default: void 0,
        array: true
      },
      /**
       * A function that generates the HTML for each button in the `choices` array. The function gets the string and index of the item in the `choices` array and should return valid HTML. If you want to use different markup for each button, you can do that by using a conditional on either parameter. The default parameter returns a button element with the text label of the choice.
       */
      button_html: {
        type: ParameterType.FUNCTION,
        default: function(choice, choice_index) {
          return `<button class="jspsych-btn">${choice}</button>`;
        }
      },
      /** This string can contain HTML markup. Any content here will be displayed below the stimulus. The intention is that it can be used to provide a reminder about the action the participant is supposed to take (e.g., which key to press). */
      prompt: {
        type: ParameterType.HTML_STRING,
        default: null
      },
      /** How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will remain visible until the trial ends. */
      stimulus_duration: {
        type: ParameterType.INT,
        default: null
      },
      /** ow long to wait for the participant to make a response before ending the trial in milliseconds. If the participant fails to make a response before this timer is reached, the participant's response will be recorded as null for the trial and the trial will end. If the value of this parameter is null, the trial will wait for a response indefinitely.  */
      trial_duration: {
        type: ParameterType.INT,
        default: null
      },
      /** Setting to `'grid'` will make the container element have the CSS property `display: grid` and enable the use of `grid_rows` and `grid_columns`. Setting to `'flex'` will make the container element have the CSS property `display: flex`. You can customize how the buttons are laid out by adding inline CSS in the `button_html` parameter. */
      button_layout: {
        type: ParameterType.STRING,
        default: "grid"
      },
      /**
       * The number of rows in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the number of rows will be determined automatically based on the number of buttons and the number of columns.
       */
      grid_rows: {
        type: ParameterType.INT,
        default: 1
      },
      /**
       * The number of columns in the button grid. Only applicable when `button_layout` is set to `'grid'`. If null, the number of columns will be determined automatically based on the number of buttons and the number of rows.
       */
      grid_columns: {
        type: ParameterType.INT,
        default: null
      },
      /** If true, then the trial will end whenever the participant makes a response (assuming they make their response before the cutoff specified by the `trial_duration` parameter). If false, then the trial will continue until the value for `trial_duration` is reached. You can set this parameter to `false` to force the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete. */
      response_ends_trial: {
        type: ParameterType.BOOL,
        default: true
      },
      /** How long the button will delay enabling in milliseconds. */
      enable_button_after: {
        type: ParameterType.INT,
        default: 0
      }
    },
    data: {
      /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: ParameterType.INT
      },
      /** Indicates which button the participant pressed. The first button in the `choices` array is 0, the second is 1, and so on. */
      response: {
        type: ParameterType.INT
      },
      /** The HTML content that was displayed on the screen. */
      stimulus: {
        type: ParameterType.HTML_STRING
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  var _HtmlButtonResponsePlugin = class _HtmlButtonResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      const stimulusElement = document.createElement("div");
      stimulusElement.id = "jspsych-html-button-response-stimulus";
      stimulusElement.innerHTML = trial.stimulus;
      display_element.appendChild(stimulusElement);
      const buttonGroupElement = document.createElement("div");
      buttonGroupElement.id = "jspsych-html-button-response-btngroup";
      if (trial.button_layout === "grid") {
        buttonGroupElement.classList.add("jspsych-btn-group-grid");
        if (trial.grid_rows === null && trial.grid_columns === null) {
          throw new Error(
            "You cannot set `grid_rows` to `null` without providing a value for `grid_columns`."
          );
        }
        const n_cols = trial.grid_columns === null ? Math.ceil(trial.choices.length / trial.grid_rows) : trial.grid_columns;
        const n_rows = trial.grid_rows === null ? Math.ceil(trial.choices.length / trial.grid_columns) : trial.grid_rows;
        buttonGroupElement.style.gridTemplateColumns = `repeat(${n_cols}, 1fr)`;
        buttonGroupElement.style.gridTemplateRows = `repeat(${n_rows}, 1fr)`;
      } else if (trial.button_layout === "flex") {
        buttonGroupElement.classList.add("jspsych-btn-group-flex");
      }
      for (const [choiceIndex, choice] of trial.choices.entries()) {
        buttonGroupElement.insertAdjacentHTML("beforeend", trial.button_html(choice, choiceIndex));
        const buttonElement = buttonGroupElement.lastChild;
        buttonElement.dataset.choice = choiceIndex.toString();
        buttonElement.addEventListener("click", () => {
          after_response(choiceIndex);
        });
      }
      display_element.appendChild(buttonGroupElement);
      if (trial.prompt !== null) {
        display_element.insertAdjacentHTML("beforeend", trial.prompt);
      }
      var start_time = performance.now();
      var response = {
        rt: null,
        button: null
      };
      const end_trial = () => {
        var trial_data = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.button
        };
        this.jsPsych.finishTrial(trial_data);
      };
      function after_response(choice) {
        var end_time = performance.now();
        var rt = Math.round(end_time - start_time);
        response.button = parseInt(choice);
        response.rt = rt;
        stimulusElement.classList.add("responded");
        for (const button of buttonGroupElement.children) {
          button.setAttribute("disabled", "disabled");
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      }
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          stimulusElement.style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
      if (trial.enable_button_after > 0) {
        var btns = document.querySelectorAll("#jspsych-html-button-response-btngroup button");
        for (var i = 0; i < btns.length; i++) {
          btns[i].setAttribute("disabled", "disabled");
        }
        this.jsPsych.pluginAPI.setTimeout(() => {
          var btns2 = document.querySelectorAll("#jspsych-html-button-response-btngroup button");
          for (var i2 = 0; i2 < btns2.length; i2++) {
            btns2[i2].removeAttribute("disabled");
          }
        }, trial.enable_button_after);
      }
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true) + trial.enable_button_after,
        response: this.jsPsych.randomization.randomInt(0, trial.choices.length - 1)
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `#jspsych-html-button-response-btngroup [data-choice="${data.response}"]`
          ),
          data.rt
        );
      }
    }
  };
  _HtmlButtonResponsePlugin.info = info;
  var HtmlButtonResponsePlugin = _HtmlButtonResponsePlugin;

  // ../../node_modules/@jspsych/plugin-html-keyboard-response/dist/index.js
  var version3 = "2.1.0";
  var info2 = {
    name: "html-keyboard-response",
    version: version3,
    parameters: {
      /**
       * The string to be displayed.
       */
      stimulus: {
        type: ParameterType.HTML_STRING,
        default: void 0
      },
      /**
       * This array contains the key(s) that the participant is allowed to press in order to respond
       * to the stimulus. Keys should be specified as characters (e.g., `'a'`, `'q'`, `' '`, `'Enter'`, `'ArrowDown'`) - see
       * {@link https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values this page}
       * and
       * {@link https://www.freecodecamp.org/news/javascript-keycode-list-keypress-event-key-codes/ this page (event.key column)}
       * for more examples. Any key presses that are not listed in the
       * array will be ignored. The default value of `"ALL_KEYS"` means that all keys will be accepted as valid responses.
       * Specifying `"NO_KEYS"` will mean that no responses are allowed.
       */
      choices: {
        type: ParameterType.KEYS,
        default: "ALL_KEYS"
      },
      /**
       * This string can contain HTML markup. Any content here will be displayed below the stimulus.
       * The intention is that it can be used to provide a reminder about the action the participant
       * is supposed to take (e.g., which key to press).
       */
      prompt: {
        type: ParameterType.HTML_STRING,
        default: null
      },
      /**
       * How long to display the stimulus in milliseconds. The visibility CSS property of the stimulus
       * will be set to `hidden` after this time has elapsed. If this is null, then the stimulus will
       * remain visible until the trial ends.
       */
      stimulus_duration: {
        type: ParameterType.INT,
        default: null
      },
      /**
       * How long to wait for the participant to make a response before ending the trial in milliseconds.
       * If the participant fails to make a response before this timer is reached, the participant's response
       * will be recorded as null for the trial and the trial will end. If the value of this parameter is null,
       * then the trial will wait for a response indefinitely.
       */
      trial_duration: {
        type: ParameterType.INT,
        default: null
      },
      /**
       * If true, then the trial will end whenever the participant makes a response (assuming they make their
       * response before the cutoff specified by the trial_duration parameter). If false, then the trial will
       * continue until the value for trial_duration is reached. You can set this parameter to false to force
       * the participant to view a stimulus for a fixed amount of time, even if they respond before the time is complete.
       */
      response_ends_trial: {
        type: ParameterType.BOOL,
        default: true
      }
    },
    data: {
      /** Indicates which key the participant pressed. */
      response: {
        type: ParameterType.STRING
      },
      /** The response time in milliseconds for the participant to make a response. The time is measured from when the stimulus first appears on the screen until the participant's response. */
      rt: {
        type: ParameterType.INT
      },
      /** The HTML content that was displayed on the screen. */
      stimulus: {
        type: ParameterType.STRING
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  var _HtmlKeyboardResponsePlugin = class _HtmlKeyboardResponsePlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      var new_html = '<div id="jspsych-html-keyboard-response-stimulus">' + trial.stimulus + "</div>";
      if (trial.prompt !== null) {
        new_html += trial.prompt;
      }
      display_element.innerHTML = new_html;
      var response = {
        rt: null,
        key: null
      };
      const end_trial = () => {
        if (typeof keyboardListener !== "undefined") {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }
        var trial_data = {
          rt: response.rt,
          stimulus: trial.stimulus,
          response: response.key
        };
        this.jsPsych.finishTrial(trial_data);
      };
      var after_response = (info22) => {
        display_element.querySelector("#jspsych-html-keyboard-response-stimulus").className += " responded";
        if (response.key == null) {
          response = info22;
        }
        if (trial.response_ends_trial) {
          end_trial();
        }
      };
      if (trial.choices != "NO_KEYS") {
        var keyboardListener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: trial.choices,
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
      }
      if (trial.stimulus_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          display_element.querySelector(
            "#jspsych-html-keyboard-response-stimulus"
          ).style.visibility = "hidden";
        }, trial.stimulus_duration);
      }
      if (trial.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
      }
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const default_data = {
        stimulus: trial.stimulus,
        rt: this.jsPsych.randomization.sampleExGaussian(500, 50, 1 / 150, true),
        response: this.jsPsych.pluginAPI.getValidKey(trial.choices)
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      if (data.rt !== null) {
        this.jsPsych.pluginAPI.pressKey(data.response, data.rt);
      }
    }
  };
  _HtmlKeyboardResponsePlugin.info = info2;
  var HtmlKeyboardResponsePlugin = _HtmlKeyboardResponsePlugin;

  // src/trials.ts
  function createContext(jsPsych, options = {}) {
    var _a;
    if (typeof ((_a = jsPsych.adaptive) == null ? void 0 : _a.createStaircase) !== "function") {
      throw new Error("stop-signal-task: needs jsPsych 8.4.0 or later (jsPsych.adaptive).");
    }
    const text = __spreadValues(__spreadValues({}, defaultText), options.text);
    const test = resolveOptions(options, "test");
    const practice = resolveOptions(options, "practice");
    validateOptions(test, "test");
    validateOptions(practice, "practice");
    return {
      jsPsych,
      text,
      user: options,
      practice,
      test,
      staircases: new StaircaseManager(jsPsych),
      state: {
        last: null,
        lastSpecs: { practice: [], test: [] },
        practice_failed: false,
        ended: false
      }
    };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
  var isKeyboard = (o) => o.response_device === "keyboard";
  var KEY_NAMES = {
    " ": "space",
    ArrowLeft: "left arrow",
    ArrowRight: "right arrow",
    ArrowUp: "up arrow",
    ArrowDown: "down arrow",
    Enter: "Enter"
  };
  function keyName2(key) {
    var _a;
    return (_a = KEY_NAMES[key]) != null ? _a : key.length === 1 ? key.toUpperCase() : key;
  }
  function responseLabelHtml(ctx, o, r) {
    if (isKeyboard(o)) return `<kbd>${keyName2(o.response_keys[r])}</kbd>`;
    return r === 0 ? ctx.text.left_button : ctx.text.right_button;
  }
  var responseIndex = (d) => d === "left" ? 0 : 1;
  function createDisplayTrial(a) {
    var _a, _b;
    return {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: a.stimulus,
      choices: "NO_KEYS",
      trial_duration: a.duration,
      data: baseData(__spreadValues({
        phase: a.phase,
        part: a.part,
        block: (_a = a.block) != null ? _a : null,
        duration_ms: a.duration
      }, (_b = a.data) != null ? _b : {})),
      on_finish: (d) => {
        delete d.stimulus;
      }
    };
  }
  function createFixation(phase, block, ms, ctx) {
    return createDisplayTrial({
      phase,
      part: "fixation",
      block,
      duration: ms,
      stimulus: renderStage(`<span class="${CLS.fixation}">${ctx.text.fixation}</span>`),
      data: { fixation_duration: ms }
    });
  }
  function createIti(phase, block, ms) {
    return createDisplayTrial({
      phase,
      part: "iti",
      block,
      duration: ms,
      stimulus: renderStage(""),
      data: { iti: ms }
    });
  }
  var newState = () => ({
    resolved: false,
    ssd: null,
    track: null,
    ssd_actual: null,
    shown: false,
    raf: null,
    sim: null
  });
  function playTone(jsPsych, ms) {
    var _a, _b;
    try {
      const ctx = (_b = (_a = jsPsych.pluginAPI).audioContext) == null ? void 0 : _b.call(_a);
      if (!ctx) return false;
      if (ctx.state === "suspended") void ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = TONE_FREQUENCY_HZ;
      gain.gain.value = 0.2;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + ms / 1e3);
      return ctx.state === "running";
    } catch (e) {
      return false;
    }
  }
  function buildResponseTrial(a) {
    const { ctx, o } = a;
    const keyboard = isKeyboard(o);
    const st = newState();
    const correctIdx = responseIndex(a.direction);
    const correctResponse = keyboard ? o.response_keys[correctIdx] : correctIdx;
    const stop = a.trial_type === "stop";
    const resolve = () => {
      if (!st.resolved) {
        st.resolved = true;
        a.resolve(st);
      }
    };
    const onLoad = () => {
      var _a;
      resolve();
      if (!stop || st.ssd === null) return;
      const root = (_a = ctx.jsPsych.getDisplayElement()) == null ? void 0 : _a.querySelector(`.${CLS.stage}`);
      if (!root) return;
      const t0 = performance.now();
      const tone = o.stimulus_set.stop_signal === "tone";
      const signalMs = o.stimulus_duration_ms.stop_signal;
      const show = () => {
        st.ssd_actual = Math.round(performance.now() - t0);
        st.shown = true;
        if (tone) st.shown = playTone(ctx.jsPsych, signalMs != null ? signalMs : TONE_DURATION_MS);
        else {
          root.classList.add(CLS.signalled);
          if (signalMs !== null) {
            ctx.jsPsych.pluginAPI.setTimeout(() => root.classList.remove(CLS.signalled), signalMs);
          }
        }
      };
      ctx.jsPsych.pluginAPI.setTimeout(() => {
        if (typeof requestAnimationFrame === "function") st.raf = requestAnimationFrame(show);
        else show();
      }, Math.max(0, st.ssd - 8));
    };
    const onFinish = (d) => {
      var _a;
      if (st.raf !== null && typeof cancelAnimationFrame === "function") cancelAnimationFrame(st.raf);
      delete d.stimulus;
      const responded2 = (typeof d.response === "string" || typeof d.response === "number") && typeof d.rt === "number";
      if (!responded2) {
        d.response = null;
        d.rt = null;
      }
      const correct = stop ? !responded2 : responded2 && (keyboard ? String(d.response).toLowerCase() === String(correctResponse).toLowerCase() : d.response === correctResponse);
      d.timeout = !responded2;
      d.correct = correct;
      d.stop_outcome = stop ? responded2 ? "failed" : "successful" : "na";
      d.ssd = stop ? st.ssd : null;
      const real = st.ssd_actual !== null;
      d.ssd_actual = real ? st.ssd_actual : null;
      d.stop_signal_shown = stop ? real ? st.shown : d.rt === null || d.rt >= ((_a = st.ssd) != null ? _a : 0) : null;
      a.finish(d, st, { responded: responded2, correct });
      ctx.state.last = {
        trial_type: a.trial_type,
        correct,
        timeout: !responded2,
        rt: responded2 ? d.rt : null,
        correct_label: keyboard ? keyName2(correctResponse) : correctIdx === 0 ? ctx.text.left_button : ctx.text.right_button
      };
    };
    const common = {
      css_classes: [TASK_CLASS],
      stimulus: () => {
        var _a;
        return renderGoStage(o.stimulus_set.go, o.stimulus_set.stop_signal, a.direction, (_a = a.below) != null ? _a : "");
      },
      stimulus_duration: o.stimulus_duration_ms.go,
      trial_duration: a.window,
      response_ends_trial: true,
      data: baseData(__spreadProps(__spreadValues({}, a.data), {
        condition: a.trial_type,
        go_stimulus: a.direction,
        correct_response: correctResponse,
        response_window: a.window,
        stimulus_duration: o.stimulus_duration_ms.go,
        stop_signal_duration: o.stimulus_duration_ms.stop_signal,
        stop_signal: o.stimulus_set.stop_signal,
        response_device: o.response_device
      })),
      on_start: resolve,
      on_load: onLoad,
      on_finish: onFinish,
      // data-only simulation: an independent race between the go and the stop process
      simulation_options: () => {
        resolve();
        if (a.honourForcedRt && hasForcedRt(ctx.jsPsych)) return {};
        if (st.sim === null) {
          const r = a.simulate(st);
          st.sim = {
            rt: r.rt,
            response: r.response_index === null ? null : keyboard ? o.response_keys[r.response_index] : r.response_index
          };
        }
        return { data: st.sim };
      }
    };
    if (keyboard) {
      return __spreadValues({ type: HtmlKeyboardResponsePlugin, choices: [...o.response_keys] }, common);
    }
    return __spreadValues({
      type: HtmlButtonResponsePlugin,
      choices: [ctx.text.left_button, ctx.text.right_button],
      button_html: (choice) => `<button class="jspsych-btn">${choice}</button>`
    }, common);
  }
  function createResponseTrial(ctx, o, spec, phase, block, trialInBlock, extra = {}) {
    var _a, _b;
    const set = () => ctx.staircases.current(phase, o.adaptive);
    return buildResponseTrial({
      ctx,
      o,
      direction: spec.go_direction,
      trial_type: spec.trial_type,
      window: o.response_window_ms,
      honourForcedRt: true,
      resolve: (st) => {
        if (spec.trial_type !== "stop") return;
        if (o.adaptive) {
          const s = set();
          st.track = s.keyFor(spec.go_direction);
          st.ssd = Math.round(s.level(st.track) * 10) / 10;
        } else {
          st.ssd = spec.fixed_ssd;
        }
      },
      data: __spreadValues({
        phase,
        part: "response",
        block,
        trial_index_in_block: trialInBlock,
        stop_probability_condition: (_a = extra.stop_probability) != null ? _a : null
      }, phase === "practice" ? { practice_attempt: (_b = extra.attempt) != null ? _b : 1 } : {}),
      simulate: (st) => simulateRace(
        ctx.jsPsych,
        { trial_type: spec.trial_type, ssd: st.ssd, direction: spec.go_direction },
        o.response_window_ms
      ),
      finish: (d, st, info3) => {
        d.staircase_id = spec.trial_type === "stop" && o.adaptive ? st.track : null;
        if (spec.trial_type === "stop" && o.adaptive && st.track) {
          const s = set();
          s.update(st.track, !info3.responded);
          d.staircase_state = s.compact(st.track);
          d.next_ssd = s.level(st.track);
        } else {
          d.staircase_state = null;
          d.next_ssd = null;
        }
        if (o.adaptive && extra.n_in_block !== void 0 && trialInBlock === extra.n_in_block) {
          d.staircase_final = set().snapshot();
        }
      }
    });
  }
  function feedbackText(ctx, o, out) {
    const t = ctx.text;
    const acc = out.trial_type === "stop" ? out.correct ? t.correct_feedback : t.stop_failed_feedback : out.timeout ? t.timeout_feedback : out.correct ? t.correct_feedback : t.incorrect_feedback;
    switch (o.trial_feedback) {
      case "accuracy":
        return acc;
      case "rt":
        return out.rt !== null ? t.feedback_rt({ rt: out.rt }) : acc;
      case "accuracy_rt":
        return out.rt !== null ? `${acc} \u2014 ${t.feedback_rt({ rt: out.rt })}` : acc;
      case "correct_answer":
        return out.correct || out.trial_type === "stop" || out.timeout ? acc : `${acc}. ${t.feedback_correct_answer({ answer: out.correct_label })}`;
      default:
        return "";
    }
  }
  function shouldShowFeedback(o, out) {
    if (o.trial_feedback === "none" || out === null) return false;
    switch (o.feedback_condition) {
      case "errors_only":
        return !out.correct;
      case "correct_only":
        return out.correct;
      default:
        return true;
    }
  }
  function createFeedback(ctx, o, phase, block, ms) {
    const trial = createDisplayTrial({
      phase,
      part: "feedback",
      block,
      duration: ms,
      stimulus: () => {
        const out = ctx.state.last;
        const cls = out.timeout ? "timeout" : out.correct ? "correct" : "incorrect";
        return renderStage(`<div class="${CLS.feedback} ${cls}">${feedbackText(ctx, o, out)}</div>`);
      },
      data: { feedback_duration: ms }
    });
    trial.data.feedback_kind = o.trial_feedback;
    trial.data.feedback_condition = o.feedback_condition;
    const strip = trial.on_finish;
    trial.on_finish = (d) => {
      strip(d);
      d.feedback_text = feedbackText(ctx, o, ctx.state.last);
    };
    return { timeline: [trial], conditional_function: () => shouldShowFeedback(o, ctx.state.last) };
  }
  function createTrialSequence(ctx, o, spec, phase, block, trialInBlock, extra = {}) {
    const tl = [];
    if (spec.fixation_ms > 0) tl.push(createFixation(phase, block, spec.fixation_ms, ctx));
    tl.push(createResponseTrial(ctx, o, spec, phase, block, trialInBlock, extra));
    if (o.trial_feedback !== "none" && spec.feedback_ms > 0)
      tl.push(createFeedback(ctx, o, phase, block, spec.feedback_ms));
    if (spec.iti_ms > 0) tl.push(createIti(phase, block, spec.iti_ms));
    return { timeline: tl };
  }
  function createBlock(ctx, phase, block, nTrials, attempt = 1) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    const props = o.condition_proportions[Math.min(block - 1, o.condition_proportions.length - 1)];
    const specs = buildBlockSpecs(ctx.jsPsych, o, nTrials, props, ctx.state.lastSpecs[phase]);
    ctx.state.lastSpecs[phase] = specs;
    return {
      timeline: specs.map(
        (s, i) => {
          var _a;
          return createTrialSequence(ctx, o, s, phase, block, i + 1, {
            n_in_block: nTrials,
            stop_probability: (_a = props.stop) != null ? _a : 0,
            attempt
          });
        }
      ),
      on_timeline_start: () => {
        ctx.staircases.startBlock(phase, o.adaptive);
      }
    };
  }
  function textPage(ctx, html, phase, part, label) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: `<div class="${CLS.text}">${html}</div>`,
      choices: [label != null ? label : ctx.text.continue_button],
      data: baseData({ phase, part })
    };
  }
  function createTransition(ctx, html, phase, part = "transition") {
    return textPage(ctx, `<p>${html}</p>`, phase, part);
  }
  function strategyHtml(ctx) {
    var _a, _b;
    const o = ctx.test;
    const t = ctx.text;
    switch (o.strategy_instruction) {
      case "dont_wait":
        return t.strategy_dont_wait;
      case "dont_wait_plus_tracking_explanation":
        return t.strategy_dont_wait + t.strategy_tracking_explanation({ target_accuracy: (_b = (_a = o.adaptive) == null ? void 0 : _a.target_accuracy) != null ? _b : 0.5 });
      case "balance_speed_and_stopping":
        return t.strategy_balance;
      default:
        return "";
    }
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const device = o.response_device;
    const hasStop = o.condition_proportions.some((p) => {
      var _a;
      return ((_a = p.stop) != null ? _a : 0) > 0;
    });
    const pages = [t.instruction_intro];
    pages.push(
      t.instruction_response({
        device,
        left_response: responseLabelHtml(ctx, o, 0),
        right_response: responseLabelHtml(ctx, o, 1),
        left_arrow: renderArrow("left", 28),
        right_arrow: renderArrow("right", 28)
      })
    );
    if (hasStop) {
      pages.push(t.instruction_stop({ signal: o.stimulus_set.stop_signal }));
      const strategy = strategyHtml(ctx);
      if (strategy) pages.push(t.strategy_heading + strategy);
    }
    return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
  }
  function demoSteps(ctx) {
    const phases = [...ctx.test.practice_trials === 0 ? [] : [ctx.practice], ctx.test];
    const hasStop = phases.some((p) => p.condition_proportions.some((c) => {
      var _a;
      return ((_a = c.stop) != null ? _a : 0) > 0;
    }));
    const steps = [
      { trial_type: "go", direction: "left" },
      { trial_type: "go", direction: "right" }
    ];
    if (hasStop) steps.push({ trial_type: "stop", direction: "left" });
    return steps;
  }
  function stepArgs(ctx, step) {
    const o = ctx.test;
    return {
      condition: step.trial_type,
      device: o.response_device,
      response: step.trial_type === "stop" ? "" : responseLabelHtml(ctx, o, responseIndex(step.direction)),
      signal: o.stimulus_set.stop_signal
    };
  }
  var demoText = (html) => `<div class="${CLS.text}">${html}</div>`;
  function createExamples(ctx, steps) {
    const o = ctx.test;
    const pages = steps.map((step) => ({
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => renderGoStage(
        o.stimulus_set.go,
        o.stimulus_set.stop_signal,
        step.direction,
        demoText(ctx.text.instruction_step(stepArgs(ctx, step)))
      ),
      choices: [ctx.text.continue_button],
      data: baseData({
        phase: "instructions",
        part: "instruction_example",
        condition: step.trial_type,
        go_stimulus: step.direction
      }),
      on_finish: (d) => {
        delete d.stimulus;
      }
    }));
    return {
      timeline: [
        textPage(ctx, ctx.text.instruction_examples_intro, "instructions", "instruction"),
        ...pages
      ]
    };
  }
  function createInstructionWalkthrough(ctx) {
    const o = ctx.test;
    const mode = o.instruction_demonstration;
    if (o.instruction_format !== "text" || mode === "none") return { timeline: [] };
    const steps = demoSteps(ctx);
    if (mode === "examples") return createExamples(ctx, steps);
    const t = ctx.text;
    const nodes = [textPage(ctx, t.instruction_demo_intro, "instructions", "instruction")];
    for (const step of steps) {
      const stop = step.trial_type === "stop";
      const args = stepArgs(ctx, step);
      const state = { attempt: 0, correct: null };
      const shown = (html) => renderGoStage(o.stimulus_set.go, o.stimulus_set.stop_signal, step.direction, demoText(html));
      const stepData = {
        phase: "instructions",
        condition: step.trial_type,
        go_stimulus: step.direction
      };
      const response = buildResponseTrial({
        ctx,
        o,
        direction: step.direction,
        trial_type: step.trial_type,
        window: stop ? INSTRUCTION_STOP_WAIT_MS : null,
        honourForcedRt: false,
        below: demoText(t.instruction_step(args)),
        resolve: (st) => {
          if (stop) st.ssd = INSTRUCTION_SSD_MS;
        },
        data: __spreadProps(__spreadValues({}, stepData), { part: "instruction_check" }),
        // data-only simulation answers correctly (and withholds on the stop step)
        simulate: () => ({
          rt: stop ? null : 600,
          response_index: stop ? null : responseIndex(step.direction)
        }),
        finish: (d) => {
          state.attempt++;
          state.correct = d.correct;
          d.attempt = state.attempt;
        }
      });
      const confirm = createDisplayTrial({
        phase: "instructions",
        part: "instruction_feedback",
        duration: INSTRUCTION_CORRECT_MS,
        stimulus: () => shown(`<p><strong>${t.instruction_correct}</strong></p>`),
        data: __spreadProps(__spreadValues({}, stepData), { feedback_kind: "correct" })
      });
      const note = (html, kind) => ({
        type: HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => shown(html),
        choices: [t.continue_button],
        data: baseData(__spreadProps(__spreadValues({}, stepData), { part: "instruction_feedback", feedback_kind: kind })),
        on_finish: (d) => {
          delete d.stimulus;
        }
      });
      const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;
      nodes.push({
        timeline: [
          response,
          { timeline: [confirm], conditional_function: () => state.correct === true },
          { timeline: [note(t.instruction_hint(args), "hint")], conditional_function: again },
          {
            timeline: [note(t.instruction_reveal(args), "reveal")],
            conditional_function: () => state.correct === false && !again()
          }
        ],
        on_timeline_start: () => {
          state.attempt = 0;
          state.correct = null;
        },
        loop_function: again
      });
    }
    return { timeline: nodes };
  }
  function createPracticeIntro(ctx) {
    return textPage(ctx, ctx.text.instruction_practice_intro, "instructions", "instruction");
  }
  function createTestIntro(ctx) {
    return textPage(ctx, ctx.text.instruction_test_intro, "instructions", "instruction");
  }
  function practiceGoAccuracy(ctx, attempt, window2) {
    const rows = ctx.jsPsych.data.get().filter({ task: TASK_NAME, phase: "practice", part: "response", practice_attempt: attempt }).values();
    const recent = window2 === null ? rows : rows.slice(-window2);
    const go = recent.filter((r) => r.condition === "go");
    if (!go.length) return null;
    return go.filter((r) => r.correct === true).length / go.length;
  }
  function createPractice(ctx) {
    const crit = ctx.test.practice_criterion;
    const n = ctx.test.practice_trials;
    if (n <= 0) return [];
    const out = [];
    if (ctx.test.instruction_format === "text") out.push(createPracticeIntro(ctx));
    if (!crit) {
      out.push(createBlock(ctx, "practice", 1, n, 1));
      return out;
    }
    const attempts = crit.on_fail === "repeat" ? crit.max_repeats + 1 : 1;
    for (let k = 1; k <= attempts; k++) {
      const nodes = [];
      if (k > 1) nodes.push(textPage(ctx, ctx.text.practice_repeat, "instructions", "instruction"));
      nodes.push(createBlock(ctx, "practice", 1, n, k));
      out.push({
        timeline: nodes,
        conditional_function: () => !ctx.state.ended && (k === 1 || ctx.state.practice_failed),
        on_timeline_finish: () => {
          const acc = practiceGoAccuracy(ctx, k, crit.window);
          const met = acc === null || acc >= crit.accuracy;
          ctx.state.practice_failed = !met;
          if (!met && crit.on_fail === "end") ctx.state.ended = true;
          ctx.jsPsych.data.addDataToLastTrial({
            practice_criterion_met: met,
            practice_go_accuracy: acc
          });
        }
      });
    }
    if (crit.on_fail === "end") {
      out.push({
        timeline: [textPage(ctx, ctx.text.practice_ended, "instructions", "instruction")],
        conditional_function: () => ctx.state.ended
      });
    }
    return out;
  }
  function createBlockFeedback(ctx, block) {
    const o = ctx.test;
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const rows = ctx.jsPsych.data.get().filter({ task: TASK_NAME, phase: "test", part: "response", block });
        const go = rows.filter({ condition: "go" });
        const stop = rows.filter({ condition: "stop" });
        const goCorrect = go.filter({ correct: true });
        const goAcc = go.count() > 0 ? goCorrect.count() / go.count() : null;
        const stopAcc = stop.count() > 0 ? stop.filter({ correct: true }).count() / stop.count() : null;
        const rts = goCorrect.select("rt");
        const meanRt = rts.count() > 0 ? rts.mean() : null;
        let html = ctx.text.block_feedback({
          block,
          n_blocks: o.n_blocks,
          go_accuracy: goAcc,
          mean_go_rt: meanRt,
          stop_accuracy: stopAcc,
          kind: o.block_feedback
        });
        if (stopAcc !== null && o.block_feedback !== "progress") {
          if (stopAcc > 0.6) html += `<p>${ctx.text.tip_waiting}</p>`;
          else if (stopAcc < 0.4) html += `<p>${ctx.text.tip_stop_more}</p>`;
        }
        return `<div class="${CLS.text}">${html}</div>`;
      },
      choices: [ctx.text.continue_button],
      data: baseData({ phase: "test", part: "block_feedback", block })
    };
  }
  function createRestBreak(ctx, block) {
    const ms = ctx.test.break_duration_ms;
    return __spreadProps(__spreadValues({}, textPage(ctx, `<p>${ctx.text.block_complete(block)}</p>`, "test", "rest")), {
      enable_button_after: ms != null ? ms : 0,
      data: baseData({ phase: "test", part: "rest", block, break_duration: ms })
    });
  }
  function isCoarsePointerOnly() {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
    return window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches;
  }
  function createDeviceCheck(ctx) {
    return {
      timeline: [
        __spreadProps(__spreadValues({}, textPage(
          ctx,
          `<p>${ctx.text.device_not_supported}</p>`,
          "instructions",
          "device_check",
          ctx.text.ok_button
        )), {
          on_finish: () => ctx.jsPsych.abortExperiment(ctx.text.device_not_supported)
        })
      ],
      conditional_function: () => isCoarsePointerOnly()
    };
  }
  function createCompletion(ctx, calculate) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const s = calculate(ctx.jsPsych.data.get());
        return `<div class="${CLS.text}"><h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
        go_accuracy: s.go_accuracy,
        mean_go_rt: s.mean_go_rt,
        stop_accuracy: s.stop_accuracy
      })}</div>`;
      },
      choices: [ctx.text.continue_button],
      data: baseData({ phase: "completion", part: "completion" })
    };
  }

  // src/index.ts
  function createTimeline(jsPsych, options = {}) {
    const ctx = createContext(jsPsych, options);
    const o = ctx.test;
    const timeline = [];
    if (o.device_eligibility === "computer_only") timeline.push(createDeviceCheck(ctx));
    if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
    if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
      timeline.push(createInstructionWalkthrough(ctx));
    }
    timeline.push(...createPractice(ctx));
    if (o.instruction_format === "text") {
      timeline.push({
        timeline: [createTestIntro(ctx)],
        conditional_function: () => !ctx.state.ended
      });
    }
    splitTrials(o.n_test_trials, o.n_blocks).forEach((n, i) => {
      const block = i + 1;
      const nodes = [createBlock(ctx, "test", block, n)];
      if (o.block_feedback !== "none") nodes.push(createBlockFeedback(ctx, block));
      if (o.break_duration_ms !== 0 && block < o.n_blocks) nodes.push(createRestBreak(ctx, block));
      timeline.push({ timeline: nodes, conditional_function: () => !ctx.state.ended });
    });
    timeline.push(createCompletion(ctx, calculateScores));
    return { timeline };
  }
  var timelineUnits = {
    createContext,
    createInstructions,
    createInstructionWalkthrough,
    createPracticeIntro,
    createTestIntro,
    createDeviceCheck,
    createFixation,
    createResponseTrial,
    createFeedback,
    createIti,
    createDisplayTrial,
    createTrialSequence,
    createBlock,
    createPractice,
    createBlockFeedback,
    createRestBreak,
    createTransition,
    createCompletion: (ctx) => createCompletion(ctx, calculateScores)
  };
  var utils = {
    scoring: { calculateScores, getSummary, integrationSsrt },
    constants: {
      TASK_NAME,
      VERSION,
      TASK_CLASS,
      DEFAULT_OPTIONS,
      PHASE_OPTIONS,
      SIMULATION
    },
    text: { defaultText },
    stimuli: { renderArrow, renderGoStage },
    sequence: { buildBlockSpecs, allocateTypes, constraintsFor, splitTrials, sampleDuration },
    adaptive: { resolveAdaptive, StaircaseSet, StaircaseManager },
    simulation: { simulateRace },
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map