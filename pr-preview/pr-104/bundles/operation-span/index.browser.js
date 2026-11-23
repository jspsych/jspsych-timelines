var jsPsychTimelineOperationSpan = (function (exports) {
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
        var width = 256, chunks = 6, digits2 = 52, rngname = "random", startdenom = math.pow(width, chunks), significance = math.pow(2, digits2), overflow = significance * 2, mask = width - 1, nodecrypto;
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
      function words2(options) {
        const random = (options == null ? void 0 : options.seed) ? new seedrandom2(options.seed) : null;
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
          const r = random ? random() : Math.random();
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
        var total = options.min + randInt(options.max + 1 - options.min);
        var results = [];
        var token = "";
        var relativeIndex = 0;
        for (var i = 0; i < total * options.wordsPerString; i++) {
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
      module.exports = words2;
      words2.wordList = wordList;
    }
  });

  // package.json
  var version = "0.0.1";

  // src/constants.ts
  var TASK_NAME = "operation-span";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-operation-span";
  var LETTERS = [
    "F",
    "H",
    "J",
    "K",
    "L",
    "N",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "Y"
  ];
  var DIGITS = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  var GRID_COLUMNS = 4;
  var PROCESSING_ACCURACY_TARGET = 0.85;
  var FALLBACK_DEADLINE_MS = 6e3;
  var MIN_CALIBRATION_ROWS = 5;
  var TIMEOUT_NOTICE_MS = 600;
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_CORRECT_MS = 900;
  var INSTRUCTION_RECALL_SET_SIZE = 2;

  // src/deadlines.ts
  function calibrationColumn(jsPsych) {
    return jsPsych.data.get().filter({
      task: TASK_NAME,
      phase: "practice",
      part: "processing",
      practice_part: "processing_only",
      correct: true
    }).filterCustom((r) => typeof r.rt === "number").select("rt");
  }
  var calibrationRts = (jsPsych) => calibrationColumn(jsPsych).values.slice();
  function clamp(v, b) {
    let out = v;
    if (b.min !== void 0) out = Math.max(out, b.min);
    if (b.max !== void 0) out = Math.min(out, b.max);
    return out;
  }
  function percentileOf(xs, p) {
    const s = xs.slice().sort((a, b) => a - b);
    const pos = p / 100 * (s.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);
    return s[lo] + (s[hi] - s[lo]) * (pos - lo);
  }
  function make(label, f, bounds) {
    const fn = (({ jsPsych }) => {
      const rts = calibrationColumn(jsPsych);
      if (rts.count() < MIN_CALIBRATION_ROWS) return clamp(FALLBACK_DEADLINE_MS, bounds);
      return Math.round(clamp(f(rts), bounds));
    });
    fn.label = label + (bounds.min !== void 0 || bounds.max !== void 0 ? " (bounded)" : "");
    fn.explain = ({ jsPsych }) => {
      const n = calibrationColumn(jsPsych).count();
      return n < MIN_CALIBRATION_ROWS ? `${fn.label}: fixed ${FALLBACK_DEADLINE_MS} ms fallback, ${n} of ${MIN_CALIBRATION_ROWS} usable practice RTs` : `${fn.label} (n = ${n})`;
    };
    return fn;
  }
  var deadlines = {
    /**
     * Mean + `k` sample SDs of the correct processing-only practice RTs: the anchor's calibrated deadline with
     * `k = 2.5` (Unsworth et al. 2005; also PsyToolkit), or `k = 2` (S039).
     */
    meanPlusSd: (k, bounds = {}) => make(`mean + ${k} SD of correct practice RTs`, (rts) => rts.mean() + k * rts.sd(), bounds),
    /** The `p`-th percentile (0-100) of the correct processing-only practice RTs. */
    percentile: (p, bounds = {}) => make(`${p}th percentile of correct practice RTs`, (rts) => percentileOf(rts.values, p), bounds),
    /** Number, mean and SD of the practice RTs the helpers would use now (for reports and checks). */
    calibration: (jsPsych) => {
      const rts = calibrationColumn(jsPsych);
      return {
        n: rts.count(),
        mean: rts.count() > 0 ? rts.mean() : null,
        sd: rts.count() > 1 ? rts.sd() : null
      };
    }
  };

  // src/sets.ts
  var letters = {
    name: "letters",
    noun: { singular: "letter", plural: "letters" },
    items: LETTERS
  };
  var words = {
    name: "words",
    noun: { singular: "word", plural: "words" },
    items: [
      "apple",
      "bread",
      "chair",
      "dance",
      "eagle",
      "flame",
      "grape",
      "house",
      "ivory",
      "jelly",
      "knife",
      "lemon",
      "mouse",
      "night",
      "ocean",
      "plant"
    ]
  };
  var digits = {
    name: "digits",
    noun: { singular: "digit", plural: "digits" },
    items: DIGITS
  };
  var normText = (x) => String(x != null ? x : "").trim().toLowerCase();
  function asStimulusSet(v) {
    if (Array.isArray(v)) return { items: v };
    if (typeof v === "object" && v !== null && Array.isArray(v.items))
      return v;
    return null;
  }
  function setProblems(set) {
    const out = [];
    if (set.items.length === 0) out.push("the set has no items");
    set.items.forEach((s, i) => {
      if (typeof s === "string") {
        if (s.trim() === "") out.push(`item ${i + 1} is empty`);
        return;
      }
      const r = s;
      if (typeof (r == null ? void 0 : r.image) === "string" || typeof (r == null ? void 0 : r.svg) === "string") {
        out.push(
          `item ${i + 1} is an ${typeof r.image === "string" ? "image" : "SVG"}; memoranda must be text, because recall names them (the matrix labels, typed and key-press recall, the feedback)`
        );
      } else if (typeof (r == null ? void 0 : r.text) !== "string" || r.text.trim() === "") {
        out.push(`item ${i + 1} must be a string or an object with a text`);
      }
    });
    if (out.length === 0) {
      const pool = buildPool(set);
      const ids = pool.map((it) => it.id);
      const dupId = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dupId !== void 0)
        out.push(`two items have the id "${dupId}"; give each item its own id`);
      const texts = pool.map((it) => normText(it.text));
      const at = texts.findIndex((t, i) => texts.indexOf(t) !== i);
      if (at >= 0) {
        const first = texts.indexOf(texts[at]);
        out.push(
          `items ${first + 1} and ${at + 1} read the same ("${pool[first].text}", "${pool[at].text}": recall ignores case and surrounding spaces); give each item its own text`
        );
      }
    }
    return out;
  }
  function buildPool(set) {
    return set.items.map((s) => {
      var _a;
      if (typeof s === "string") return { id: s, text: s };
      return { id: (_a = s.id) != null ? _a : s.text, text: s.text };
    });
  }
  function itemNouns(set) {
    var _a;
    return (_a = set.noun) != null ? _a : { singular: "item", plural: "items" };
  }
  var setName = (set) => {
    var _a;
    return (_a = set.name) != null ? _a : "custom";
  };

  // src/options.ts
  var PHASE_OPTIONS = [
    "trial_feedback",
    "feedback_duration_ms",
    "response_window_ms",
    "stimulus_duration_ms",
    "inter_item_interval_ms",
    "set_sizes"
  ];
  var TEST_ONLY = ["set_sizes"];
  var DEFAULT_OPTIONS = {
    feedback_duration_ms: 2e3,
    inter_item_interval_ms: 0,
    response_window_ms: deadlines.meanPlusSd(2.5),
    stimulus_duration_ms: 800,
    stimulus_language: null,
    stimulus_set: { memorandum: letters, memorandum_source: "separate_item" },
    processing_display_format: "problem_then_answer_screens",
    block_order: "random",
    n_test_trials: 15,
    set_sizes: [3, 4, 5, 6, 7],
    trials_per_condition: 3,
    memorandum_order_in_pair: "processing_first",
    processing_items_per_memorandum: 1,
    task_variant: "operation_span",
    response_device: { processing: "mouse", recall: "mouse" },
    response_format: "n_afc",
    response_order: "serial",
    response_keys: ["f", "j"],
    recall_omission_handling: "blank_button",
    practice_criterion: null,
    practice_structure: "storage_processing_combined",
    practice_trials: 15,
    practice_storage_trials: 4,
    practice_combined_trials: 3,
    end_of_task_feedback: "none",
    trial_feedback: "accuracy",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    speed_accuracy_emphasis: "accuracy",
    processing_read_aloud: false,
    practice: { set_sizes: [2] }
  };
  var NOT_IMPLEMENTED = [
    [
      "task_variant",
      ["reading_span", "symmetry_span", "rotation_span"],
      "only the arithmetic operation span is implemented; the other processing tasks need their own stimulus generators"
    ],
    [
      "processing_display_format",
      ["equation_and_memorandum_same_screen"],
      "use problem_then_answer_screens or equation_with_answer_single_screen"
    ],
    [
      "block_order",
      ["counterbalanced", "alternating"],
      "use random, random_within_block, fixed, ascending or descending"
    ],
    [
      "response_format",
      ["rating", "location", "none"],
      "recall is n_afc, free_text or single_response"
    ],
    ["response_order", ["task1_first"], "recall is serial or free"],
    [
      "trial_feedback",
      ["rt", "accuracy_rt", "points", "reward_outcome"],
      "use accuracy, correct_answer or none"
    ],
    ["end_of_task_feedback", ["normative"], "no norms are bundled; use score or summary"],
    [
      "instruction_format",
      ["audio", "video"],
      "no media is bundled; supply your own instruction trials"
    ],
    [
      "instruction_demonstration",
      ["animated", "guided_trial"],
      "use interactive (real stimuli, repeat until correct), examples or none"
    ]
  ];
  var DEVICES_IMPLEMENTED = ["keyboard", "mouse", "touch"];
  function normaliseDevice(d, base) {
    var _a, _b;
    if (d === void 0) return base;
    if (typeof d === "string") return { processing: d, recall: d };
    return { processing: (_a = d.processing) != null ? _a : base.processing, recall: (_b = d.recall) != null ? _b : base.recall };
  }
  var isNested = (s) => Array.isArray(s[0]);
  function setSizeLists(s) {
    return isNested(s) ? s : [s];
  }
  function cellCount(s) {
    return setSizeLists(s).reduce((a, l) => a + l.length, 0);
  }
  function resolveOptions(user = {}, phase = "test") {
    var _b, _c;
    const _a = user, { practice, text: _text } = _a, top = __objRest(_a, ["practice", "text"]);
    const topKeys = new Set(Object.keys(top).filter((k) => top[k] !== void 0));
    let layer = __spreadValues({}, top);
    if (phase === "practice") {
      for (const k of TEST_ONLY) delete layer[k];
      const practiceKeys = new Set(Object.keys(practice != null ? practice : {}));
      const defaultPractice = {};
      for (const [k, v] of Object.entries(DEFAULT_OPTIONS.practice)) {
        if ((!topKeys.has(k) || TEST_ONLY.includes(k)) && !practiceKeys.has(k))
          defaultPractice[k] = v;
      }
      layer = __spreadValues(__spreadValues(__spreadValues({}, layer), defaultPractice), practice != null ? practice : {});
    }
    const merged = __spreadValues({}, DEFAULT_OPTIONS);
    delete merged.practice;
    for (const [k, v] of Object.entries(layer)) if (v !== void 0) merged[k] = v;
    merged.stimulus_set = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.stimulus_set), (_b = layer.stimulus_set) != null ? _b : {});
    merged.stimulus_set.memorandum = (_c = asStimulusSet(merged.stimulus_set.memorandum)) != null ? _c : merged.stimulus_set.memorandum;
    merged.response_device = normaliseDevice(layer.response_device, DEFAULT_OPTIONS.response_device);
    if (phase === "test") {
      const cells = cellCount(merged.set_sizes);
      const nGiven = layer.n_test_trials !== void 0;
      const rGiven = layer.trials_per_condition !== void 0;
      if (cells > 0) {
        if (nGiven && rGiven) {
          if (layer.n_test_trials !== cells * layer.trials_per_condition) {
            throw new Error(
              `operation-span: n_test_trials (${layer.n_test_trials}) and trials_per_condition (${layer.trials_per_condition}) disagree: ${cells} set size${cells === 1 ? "" : "s"} x ${layer.trials_per_condition} is ${cells * layer.trials_per_condition}. Give one of them.`
            );
          }
        } else if (nGiven) {
          if (layer.n_test_trials % cells !== 0) {
            throw new Error(
              `operation-span: n_test_trials (${layer.n_test_trials}) is not a multiple of the number of set sizes (${cells}, set_sizes ${JSON.stringify(
              merged.set_sizes
            )}); give set_sizes or trials_per_condition too.`
            );
          }
          merged.trials_per_condition = layer.n_test_trials / cells;
        } else {
          merged.n_test_trials = cells * merged.trials_per_condition;
        }
      }
    }
    return merged;
  }
  function validateOptions(o, phase = "test") {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`operation-span: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    if (o.stimulus_language !== null) {
      throw new Error(
        `operation-span: stimulus_language: "${o.stimulus_language}" is not implemented (no word lists are bundled; give your own words as a set in stimulus_set.memorandum).`
      );
    }
    if (!asStimulusSet(o.stimulus_set.memorandum)) {
      throw new Error(
        "operation-span: stimulus_set.memorandum must be a set ({ name?, noun?, items }) or an array of items, e.g. utils.stimuli.letters."
      );
    }
    const setIssues = setProblems(o.stimulus_set.memorandum);
    if (setIssues.length) {
      throw new Error(`operation-span: stimulus_set.memorandum: ${setIssues.join("; ")}.`);
    }
    if (o.stimulus_set.memorandum_source === "sentence_final_word") {
      throw new Error(
        'operation-span: stimulus_set.memorandum_source: "sentence_final_word" is not implemented (reading span needs a sentence processing task).'
      );
    }
    for (const [role, d] of Object.entries(o.response_device)) {
      if (!DEVICES_IMPLEMENTED.includes(d)) {
        throw new Error(
          `operation-span: response_device.${role}: "${d}" is not implemented (keyboard, mouse and touch only).`
        );
      }
    }
    const { recall } = o.response_device;
    if (o.response_format === "n_afc" && recall === "keyboard") {
      throw new Error(
        'operation-span: response_format "n_afc" is a click matrix and needs response_device recall "mouse" or "touch"; use "free_text" or "single_response" with the keyboard.'
      );
    }
    if ((o.response_format === "free_text" || o.response_format === "single_response") && recall !== "keyboard") {
      throw new Error(
        `operation-span: response_format "${o.response_format}" is typed and needs response_device recall "keyboard" (got "${recall}").`
      );
    }
    if (o.recall_omission_handling === "question_mark_key" && recall !== "keyboard") {
      throw new Error(
        'operation-span: recall_omission_handling "question_mark_key" needs response_device recall "keyboard".'
      );
    }
    if (o.response_format === "single_response" && buildPool(o.stimulus_set.memorandum).some((it) => it.text.trim().length !== 1)) {
      throw new Error(
        'operation-span: response_format "single_response" is one key per item and needs single-character memoranda.'
      );
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
      throw new Error(
        "operation-span: response_keys must list exactly two keys (first = true, second = false)."
      );
    }
    if (typeof o.stimulus_duration_ms === "number" ? !(o.stimulus_duration_ms > 0) : o.stimulus_duration_ms === null) {
      throw new Error(
        "operation-span: stimulus_duration_ms must be a duration: each memorandum is shown for that long."
      );
    }
    const lists = setSizeLists(o.set_sizes);
    if (!lists.length || lists.some(
      (l) => !Array.isArray(l) || l.length === 0 || l.some((n) => !Number.isInteger(n) || n < 1)
    )) {
      throw new Error(
        "operation-span: set_sizes must be a list of positive integers, or a list of such lists (one per block)."
      );
    }
    const biggest = Math.max(...lists.flat());
    const pool = o.stimulus_set.memorandum.items.length;
    if (biggest > pool) {
      throw new Error(
        `operation-span: set size ${biggest} needs ${biggest} different memoranda but the pool has ${pool}.`
      );
    }
    const walkthrough = o.instruction_format === "text" && o.instruction_demonstration !== "none";
    if (walkthrough && pool < INSTRUCTION_RECALL_SET_SIZE) {
      throw new Error(
        `operation-span: the walkthrough's recall step needs ${INSTRUCTION_RECALL_SET_SIZE} different memoranda but the pool has ${pool}.`
      );
    }
    if (isNested(o.set_sizes) && o.block_order === "random_within_block") {
      throw new Error(
        'operation-span: block_order "random_within_block" with per-block set_sizes is contradictory: the blocks are the lists. Use "random", "fixed", "ascending" or "descending", or a flat set_sizes.'
      );
    }
    if (phase === "test" && !(o.trials_per_condition >= 1)) {
      throw new Error("operation-span: trials_per_condition must be at least 1.");
    }
    if (!(o.processing_items_per_memorandum >= 0) || !Number.isInteger(o.processing_items_per_memorandum)) {
      throw new Error(
        "operation-span: processing_items_per_memorandum must be a non-negative integer."
      );
    }
    const pc = o.practice_criterion;
    if (pc !== null && pc !== void 0 && !(pc.accuracy > 0 && pc.accuracy <= 1)) {
      throw new Error("operation-span: practice_criterion.accuracy must be a proportion in (0, 1].");
    }
    if (typeof o.response_window_ms === "object" && o.response_window_ms !== null) {
      const w = o.response_window_ms;
      if (typeof w !== "function" && !(w.min > 0 && w.max >= w.min)) {
        throw new Error("operation-span: response_window_ms: { min, max } needs 0 < min <= max.");
      }
    }
    if (o.processing_items_per_memorandum === 0 && o.practice_criterion) {
      throw new Error(
        "operation-span: practice_criterion needs processing (processing_items_per_memorandum is 0)."
      );
    }
  }

  // src/schedule.ts
  var gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
  function fixedOrder(levels, rep) {
    const m = levels.length;
    const sorted = [...levels].sort((a, b) => a - b);
    let k = 2;
    while (k < m && gcd(k, m) !== 1) k++;
    if (m < 3) k = 1;
    return sorted.map((_, j) => sorted[(j * k + rep) % m]);
  }
  function scheduleBlocks(jsPsych, setSizes, reps, order) {
    const r = jsPsych.randomization;
    const nested = Array.isArray(setSizes[0]);
    const lists = setSizeLists(setSizes);
    const arrange = (levels) => {
      const sorted = [...levels].sort((a, b) => a - b);
      switch (order) {
        case "random":
          return r.shuffle(Array.from({ length: reps }, () => levels).flat());
        case "fixed":
          return Array.from({ length: reps }, (_, i) => fixedOrder(levels, i)).flat();
        case "ascending":
          return sorted.flatMap((l) => Array(reps).fill(l));
        case "descending":
          return sorted.reverse().flatMap((l) => Array(reps).fill(l));
        default:
          throw new Error(`operation-span: block_order "${order}" is not implemented.`);
      }
    };
    if (!nested && order === "random_within_block") {
      return Array.from({ length: reps }, () => r.shuffle([...lists[0]]));
    }
    return lists.map(arrange);
  }
  function practiceSetSizes(jsPsych, setSizes, n) {
    const levels = setSizeLists(setSizes).flat();
    const out = [];
    while (out.length < n) out.push(...jsPsych.randomization.shuffle([...levels]));
    return out.slice(0, n);
  }

  // src/scoring.ts
  var norm = (x) => String(x != null ? x : "").trim().toLowerCase();
  function scoreRecall(presented, recalled, order) {
    let correct;
    if (order === "serial") {
      correct = presented.map(
        (p, i) => recalled[i] !== null && recalled[i] !== void 0 && norm(recalled[i]) === norm(p)
      );
    } else {
      const pool = recalled.filter((x) => x !== null && x !== void 0).map(norm);
      correct = presented.map((p) => {
        const at = pool.indexOf(norm(p));
        if (at < 0) return false;
        pool.splice(at, 1);
        return true;
      });
    }
    const n = correct.filter(Boolean).length;
    return {
      correct_positions: correct,
      n_correct: n,
      perfect: n === presented.length && presented.length > 0
    };
  }
  function calculateScores(data) {
    const recall = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
    const proc = data.filter({ task: TASK_NAME, phase: "test", part: "processing" });
    const n = recall.count();
    const sumOf = (col, field) => col.count() > 0 ? col.select(field).sum() : 0;
    const totalItems = sumOf(recall, "set_size");
    const load = sumOf(recall, "n_correct_positions");
    const perfect = recall.filter({ correct: true });
    const nProc = proc.count();
    const nCorrect = proc.filter({ correct: true }).count();
    const speed = proc.filter({ timeout: true }).count();
    const rts = proc.filter({ correct: true }).filterCustom((r) => typeof r.rt === "number");
    return {
      n_trials: n,
      total_items: totalItems,
      partial_credit_load: load,
      partial_credit_unit: n > 0 ? sumOf(recall, "proportion_correct") / n : null,
      absolute_score: sumOf(perfect, "set_size"),
      n_perfect_trials: perfect.count(),
      all_or_nothing_unit: n > 0 ? perfect.count() / n : null,
      n_processing: nProc,
      accuracy_errors: nProc - nCorrect - speed,
      speed_errors: speed,
      processing_errors: nProc - nCorrect,
      processing_accuracy: nProc > 0 ? nCorrect / nProc : null,
      mean_processing_rt: rts.count() > 0 ? rts.select("rt").mean() : null
    };
  }
  function getSummary(data) {
    return __spreadProps(__spreadValues({}, calculateScores(data)), { task: TASK_NAME, version: VERSION });
  }

  // src/stimuli.ts
  var cls = (name) => `${TASK_CLASS}-${name}`;
  function generateProblem(jsPsych, isTrue) {
    const r = jsPsych.randomization;
    const op1 = r.sampleWithoutReplacement(["\xD7", "\xF7", "+", "\u2212"], 1)[0];
    let a, b, v1;
    if (op1 === "\xD7") {
      a = r.randomInt(1, 9);
      b = r.randomInt(1, 9);
      v1 = a * b;
    } else if (op1 === "\xF7") {
      b = r.randomInt(2, 9);
      v1 = r.randomInt(1, 9);
      a = b * v1;
    } else if (op1 === "+") {
      a = r.randomInt(1, 9);
      b = r.randomInt(1, 9);
      v1 = a + b;
    } else {
      a = r.randomInt(2, 9);
      b = r.randomInt(1, a - 1);
      v1 = a - b;
    }
    const op2 = r.sampleWithoutReplacement(["+", "\u2212"], 1)[0];
    const c = op2 === "+" ? r.randomInt(1, 9) : r.randomInt(1, Math.min(9, v1));
    const value = op2 === "+" ? v1 + c : v1 - c;
    const truth = isTrue != null ? isTrue : r.sampleBernoulli(0.5) === 1;
    let shown = value;
    if (!truth) {
      const offsets = [-2, -1, 1, 2].filter((d) => value + d >= 0);
      shown = value + r.sampleWithoutReplacement(offsets, 1)[0];
    }
    return { text: `(${a} ${op1} ${b}) ${op2} ${c}`, value, shown, is_true: truth };
  }
  var poolOf = (o) => buildPool(o.stimulus_set.memorandum);
  var poolTexts = (o) => poolOf(o).map((it) => it.text);
  function drawMemoranda(jsPsych, o, n) {
    return jsPsych.randomization.sampleWithoutReplacement(poolTexts(o), n);
  }
  function idOf(o) {
    const ids = new Map(poolOf(o).map((it) => [normText(it.text), it.id]));
    return (text) => {
      var _a;
      return text === null ? null : (_a = ids.get(normText(text))) != null ? _a : null;
    };
  }
  var escapeAttr = (x) => x.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  function renderScreen(stage, below = "", wide = false) {
    return `<div class="${cls("screen")}${wide ? ` ${cls("screen-recall")}` : ""}"><div class="${cls("stage")}">${stage}</div>` + (below ? `<div class="${cls("below")}">${below}</div>` : "") + `</div>`;
  }
  var textBlock = (html) => `<div class="${cls("text")}">${html}</div>`;
  var renderProblem = (p, withAnswer) => `<div class="${cls("problem")}">${p.text} ${withAnswer ? `= <strong>${p.shown}</strong> ?` : "= ?"}</div>`;
  var renderAnswer = (p) => `<div class="${cls("problem")}"><strong>${p.shown}</strong></div>`;
  var renderMemorandum = (item) => `<div class="${cls("memorandum")}">${item}</div>`;
  var renderNotice = (html, kind = "") => `<div class="${cls("notice")} ${kind}">${html}</div>`;
  var KEY_NAMES = {
    " ": "space",
    ArrowLeft: "left arrow",
    ArrowRight: "right arrow",
    ArrowUp: "up arrow",
    ArrowDown: "down arrow",
    Enter: "Enter"
  };
  function keyName(key) {
    var _a;
    return (_a = KEY_NAMES[key]) != null ? _a : key.length === 1 ? key.toUpperCase() : key;
  }
  function renderRecallPanel(spec, text) {
    const prompt = `<div class="${cls("recall-prompt")}">${text.recall_prompt({
    format: spec.format,
    order: spec.order,
    set_size: spec.set_size,
    noun: spec.noun,
    nouns: spec.nouns
  })}</div>`;
    const blankLabel = spec.omission === "skip_button" ? text.skip_button : text.blank_button;
    const blankButton = spec.omission === "blank_button" || spec.omission === "skip_button" ? `<button type="button" class="${cls("control")}" data-action="blank">${blankLabel}</button>` : "";
    const clearButton = `<button type="button" class="${cls("control")}" data-action="clear">${text.clear_button}</button>`;
    if (spec.format === "free_text") {
      const boxes = Array.from(
        { length: spec.set_size },
        (_, i) => `<input type="text" class="${cls(
        "box"
      )}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="${text.recall_box_label(
        { position: i + 1 }
      )}" data-i="${i}">`
      ).join("");
      return `<div class="${cls("recall")}">${prompt}<div class="${cls("boxes")}">${boxes}</div>${blankButton ? `<div class="${cls("controls")}">${blankButton}</div>` : ""}</div>`;
    }
    const slots = Array.from(
      { length: spec.set_size },
      (_, i) => `<span class="${cls("slot")}" data-i="${i}">&nbsp;</span>`
    ).join("");
    const grid = spec.format === "n_afc" ? `<div class="${cls(
    "grid"
  )}" style="grid-template-columns: repeat(${GRID_COLUMNS}, minmax(0, 1fr));">${spec.pool.map(
    (x) => `<button type="button" class="${cls("key")}" data-item="${escapeAttr(
      x
    )}">${x}</button>`
  ).join("")}</div>` : "";
    return `<div class="${cls("recall")}">${prompt}<div class="${cls(
    "slots"
  )}">${slots}</div>${grid}<div class="${cls(
    "controls"
  )}">${blankButton}${clearButton}</div></div>`;
  }
  var newRecallState = () => ({
    items: [],
    read: null,
    wired: false,
    touched: false,
    cleanup: null
  });
  var norm2 = normText;
  function finalItems(state, spec) {
    const raw = state.read ? state.read() : state.items;
    return Array.from({ length: spec.set_size }, (_, i) => {
      const v = raw[i];
      return v === void 0 || v === null || norm2(v) === "" || norm2(v) === "?" ? null : String(v).trim();
    });
  }
  function wireRecall(state, spec, display) {
    var _a, _b, _c, _d;
    const root = display.querySelector(`.${cls("recall")}`);
    if (!root) return;
    state.wired = true;
    const done = document.querySelector(
      "#jspsych-html-button-response-btngroup button"
    );
    const needsAll = spec.omission === "none";
    const filled = () => (state.read ? state.read() : state.items).filter((x) => x !== null && norm2(x) !== "").length;
    const refreshDone = () => {
      if (done) done.disabled = needsAll && filled() < spec.set_size;
    };
    refreshDone();
    state.touched = false;
    const cleanups = [];
    if (spec.format === "free_text") {
      const boxes = Array.from(root.querySelectorAll(`.${cls("box")}`));
      state.read = () => boxes.map((b) => b.value);
      (_a = boxes[0]) == null ? void 0 : _a.focus();
      boxes.forEach((b, i) => {
        b.addEventListener("input", () => {
          state.touched = true;
          refreshDone();
        });
        b.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            if (i < boxes.length - 1) boxes[i + 1].focus();
            else if (done && !done.disabled) done.click();
          }
        });
      });
      (_b = root.querySelector('[data-action="blank"]')) == null ? void 0 : _b.addEventListener("click", () => {
        state.touched = true;
        const active = boxes.findIndex((b) => b === display.ownerDocument.activeElement);
        const next = boxes[Math.min((active < 0 ? 0 : active) + 1, boxes.length - 1)];
        next == null ? void 0 : next.focus();
      });
    } else {
      state.items = [];
      const slots = Array.from(root.querySelectorAll(`.${cls("slot")}`));
      const keys = Array.from(root.querySelectorAll(`.${cls("key")}`));
      const paint = () => {
        slots.forEach((s, i) => {
          const v = state.items[i];
          s.innerHTML = v === void 0 ? "&nbsp;" : v === null ? "&mdash;" : v;
          s.classList.toggle("filled", v !== void 0);
        });
        const used = new Set(state.items.filter((x) => x !== null).map(norm2));
        keys.forEach((k) => {
          k.disabled = used.has(norm2(k.dataset.item)) || state.items.length >= spec.set_size;
        });
        refreshDone();
      };
      const push = (v) => {
        if (state.items.length >= spec.set_size) return;
        state.touched = true;
        state.items.push(v);
        paint();
        if (spec.format === "single_response" && state.items.length >= spec.set_size) done == null ? void 0 : done.click();
      };
      keys.forEach((k) => k.addEventListener("click", () => {
        var _a2;
        return push((_a2 = k.dataset.item) != null ? _a2 : null);
      }));
      (_c = root.querySelector('[data-action="blank"]')) == null ? void 0 : _c.addEventListener("click", () => push(null));
      (_d = root.querySelector('[data-action="clear"]')) == null ? void 0 : _d.addEventListener("click", () => {
        state.touched = true;
        state.items = [];
        paint();
      });
      if (spec.format === "single_response") {
        const pool = new Map(spec.pool.map((x) => [norm2(x), x]));
        const onKey = (e) => {
          if (e.key === "Backspace") {
            state.items.pop();
            paint();
          } else if (e.key === "?" && spec.omission === "question_mark_key") push(null);
          else if (pool.has(norm2(e.key)) && !state.items.some((x) => norm2(x) === norm2(e.key)))
            push(pool.get(norm2(e.key)));
        };
        const body = display.ownerDocument.body;
        body.addEventListener("keydown", onKey);
        cleanups.push(() => body.removeEventListener("keydown", onKey));
      }
      paint();
    }
    state.cleanup = () => cleanups.forEach((f) => f());
  }

  // src/text.ts
  var pct = (x) => x === null ? "-" : `${Math.round(x * 100)}%`;
  var defaultText = {
    instruction_intro: ({
      memorandum_first,
      items_per_memorandum,
      noun,
      nouns
    }) => `<h2>Operation Span</h2>
    <p>This task has two parts that you do at the same time: solving math problems and remembering ${nouns}.</p>
    <p>You will see a ${items_per_memorandum > 1 ? "series of problems" : "math problem"} and one ${noun}${memorandum_first ? `, starting with the ${noun}` : ", starting with the problem"}, over and over. Remember the ${nouns} in the order they appear. After a few of each, you will be asked to recall the ${nouns}.</p>`,
    instruction_processing: (r) => {
      const answer = r.device === "keyboard" ? `Press ${r.true_label} if the answer shown is correct, or ${r.false_label} if it is wrong.` : `Click <strong>${r.true_label}</strong> if the answer shown is correct, or <strong>${r.false_label}</strong> if it is wrong.`;
      const limit = r.timed ? " There is a time limit, so work quickly." : "";
      if (r.display_format === "equation_with_answer_single_screen") {
        return `<p>Each math problem is shown with a proposed answer, for example <strong>(2 \xD7 3) + 1 = 7</strong>. ${answer}${limit}</p>`;
      }
      const solved = r.device === "keyboard" ? `press ${r.solved_label}` : `click <strong>${r.solved_label}</strong>`;
      return `<p>Each math problem is shown first on its own, for example <strong>(2 \xD7 3) + 1 = ?</strong>. Solve it in your head, then ${solved}.${limit}</p>
      <p>Then a number is shown, for example <strong>7</strong>. ${answer}</p>`;
    },
    instruction_recall: (r) => {
      const blank = r.omission === "blank_button" || r.omission === "skip_button" ? ` If you can't remember one, click <strong>${r.blank_label}</strong> to leave its place empty.` : r.omission === "question_mark_key" ? " If you can't remember one, press <kbd>?</kbd> to leave its place empty." : " Fill every place, guessing if you have to.";
      const order = r.order === "serial" ? "in the order they were shown" : "in any order";
      if (r.format === "n_afc") {
        return `<p>After the last ${r.noun}, a grid of ${r.nouns} appears. Click the ${r.nouns} you saw, ${order}.${blank}</p>`;
      }
      if (r.format === "free_text") {
        return `<p>After the last ${r.noun}, a row of boxes appears. Type the ${r.nouns} you saw, one per box, ${order}.${blank}</p>`;
      }
      return `<p>After the last ${r.noun}, press the keys of the ${r.nouns} you saw, one at a time, ${order}.${blank}</p>`;
    },
    emphasis_speed: "<p>Answer the math problems as quickly as you can.</p>",
    emphasis_accuracy: ({ criterion_percent }) => `<p>It is important that you work as quickly and accurately as you can on the math problems. Keep your math accuracy at ${criterion_percent}% or higher. You will see your accuracy during the task.</p>`,
    emphasis_both: ({ nouns }) => `<p>Work quickly and accurately on both parts: the math problems and the ${nouns}.</p>`,
    read_aloud: "<p>Read each math problem out loud as you solve it.</p>",
    instruction_demo_intro: `<p>Now let's try each part, one step at a time. A wrong answer repeats the step with a hint.</p>`,
    instruction_examples_intro: `<p>Here is what each part looks like.</p>`,
    instruction_step: (r) => {
      if (r.step === "recall") {
        return `<p>Remember these ${r.items.length} ${r.nouns} in order, then recall them.</p>`;
      }
      const truth = r.step === "processing_true" ? "is correct" : "is wrong";
      const how = r.device === "keyboard" ? `Press ${r.step === "processing_true" ? r.true_label : r.false_label}` : `Click <strong>${r.step === "processing_true" ? r.true_label : r.false_label}</strong>`;
      return `<p>Check the problem. The answer shown ${truth}. ${how}.</p>`;
    },
    instruction_hint: (r) => r.step === "recall" ? `<p>Not quite. Try again: remember the ${r.nouns} in the order they were shown.</p>` : `<p>Not quite. Work out the problem, then decide: if the number shown is the answer, it is ${r.true_label}; if not, ${r.false_label}.</p>`,
    instruction_reveal: (r) => r.step === "recall" ? `<p>The ${r.nouns} were <strong>${r.items.join(
    " "
  )}</strong>, in that order. Let's go on.</p>` : `<p>The correct answer here was ${r.correct_label}. Let's go on.</p>`,
    instruction_correct: "Correct!",
    practice_storage_intro: ({ nouns }) => `<p>Next, a short practice in three parts: ${nouns} alone, math alone, then both together, as in the real task.</p><p>Part 1: you will see a few ${nouns}. Recall them in order.</p>`,
    practice_processing_intro: `<p>Part 2: the math problems alone, at your own pace. Your speed here sets your time limit later.</p>`,
    practice_combined_intro: `<p>Part 3: both together, as in the real task.</p>`,
    instruction_test_intro: ({ nouns }) => `<p>That's the end of practice. The real task is the same, with more ${nouns} to remember each time. Remember to keep solving the math problems accurately.</p>`,
    practice_repeat: ({ accuracy, criterion }) => `<p>Your math accuracy was ${pct(accuracy)}; you need ${pct(
    criterion
  )}. Let's practice the math problems again.</p>`,
    practice_failed: `<p>Thank you. The task ends here.</p>`,
    continue_button: "Continue",
    ok_button: "OK",
    done_button: "Done",
    solved_button: "Solved",
    true_button: "True",
    false_button: "False",
    blank_button: "Blank",
    skip_button: "Skip",
    clear_button: "Clear",
    solve_prompt: ({ device, solved_label }) => device === "keyboard" ? `<p>Solve it, then press ${solved_label}.</p>` : `<p>Solve it, then click <strong>${solved_label}</strong>.</p>`,
    verify_prompt: ({ device, true_label, false_label }) => device === "keyboard" ? `<p>Is this the answer? ${true_label} = true, ${false_label} = false.</p>` : `<p>Is this the answer?</p>`,
    recall_prompt: ({ format, order, set_size, nouns }) => format === "n_afc" ? `Select the ${set_size} ${nouns}${order === "serial" ? " in the order shown" : ""}` : format === "free_text" ? `Type the ${set_size} ${nouns}${order === "serial" ? " in the order shown" : ""}` : `Press the keys of the ${set_size} ${nouns}${order === "serial" ? " in the order shown" : ""}`,
    recall_box_label: ({ position }) => `Item ${position}`,
    correct_feedback: "Correct",
    incorrect_feedback: "Incorrect",
    timeout_feedback: "Too slow",
    recall_feedback: ({ n_correct, set_size, math_errors, math_accuracy }) => `<p>You recalled <strong>${n_correct}</strong> of ${set_size} correctly.</p>` + (math_errors === null ? "" : `<p>You made ${math_errors} math error${math_errors === 1 ? "" : "s"} on this trial.${math_accuracy === null ? "" : ` Math accuracy so far: ${pct(math_accuracy)}.`}</p>`),
    feedback_correct_answer: ({ items, nouns }) => `<p>The ${nouns} were: ${items.join(" ")}</p>`,
    task_complete: "Task complete",
    result_summary: (r) => `<p>Your score: ${r.partial_score} of ${r.total_items} recalled in the correct position.${r.processing_accuracy === null ? "" : ` Math accuracy: ${pct(r.processing_accuracy)}.`}</p>` + (r.summary ? `<p>${r.perfect_trials} of ${r.n_trials} trials recalled perfectly (absolute score ${r.absolute_score}).</p>` : "")
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
  styleInject(".jspsych-timelines-operation-span .jspsych-timelines-operation-span-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-text h2 {\n  text-align: center;\n}\n.jspsych-timelines-operation-span {\n  --ospan-stage-h: min(240px, 38vh);\n  --ospan-recall-h: min(330px, 66vh);\n  --ospan-btn-reserve: 76px;\n}\n.jspsych-timelines-operation-span:has(.jspsych-timelines-operation-span-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-screen {\n  display: contents;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 640px;\n  max-width: calc(100vw - 16px);\n  height: var(--ospan-stage-h);\n  padding: 8px;\n  overflow: hidden;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-screen-recall {\n  --ospan-stage-h: var(--ospan-recall-h);\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-below {\n  position: absolute;\n  top: calc(50% + var(--ospan-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-below .jspsych-timelines-operation-span-text {\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-operation-span:has(#jspsych-html-button-response-btngroup) .jspsych-timelines-operation-span-below {\n  bottom: var(--ospan-btn-reserve);\n}\n.jspsych-timelines-operation-span:has(.jspsych-timelines-operation-span-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-problem {\n  font-size: 2.2em;\n  text-align: center;\n  white-space: nowrap;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-memorandum {\n  font-size: 4.5em;\n  font-weight: bold;\n  line-height: 1;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-notice {\n  font-size: 1em;\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-notice p {\n  margin: 0.3em 0;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-notice.incorrect,\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-notice.timeout {\n  font-weight: bold;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-recall {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 8px;\n  width: 100%;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-recall-prompt {\n  font-size: 1.05em;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-slots,\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-boxes {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: center;\n  gap: 6px;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-slot {\n  box-sizing: border-box;\n  min-width: 40px;\n  height: 40px;\n  padding: 0 6px;\n  border: 2px solid currentColor;\n  border-radius: 6px;\n  font-size: 1.3em;\n  font-weight: bold;\n  line-height: 36px;\n  text-align: center;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-box {\n  box-sizing: border-box;\n  width: 64px;\n  height: 40px;\n  font-size: 1.2em;\n  text-align: center;\n  text-transform: none;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-grid {\n  display: grid;\n  gap: 6px;\n  width: min(320px, 100%);\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-key,\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-control {\n  box-sizing: border-box;\n  min-height: 42px;\n  padding: 0 10px;\n  border: 1px solid #888;\n  border-radius: 6px;\n  background: #f4f4f4;\n  color: #111;\n  font-size: 1.1em;\n  font-weight: bold;\n  cursor: pointer;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-key:disabled {\n  opacity: 0.35;\n  cursor: default;\n}\n.jspsych-timelines-operation-span .jspsych-timelines-operation-span-controls {\n  display: flex;\n  gap: 8px;\n}\n@media (max-height: 520px) {\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-slot {\n    height: 32px;\n    line-height: 28px;\n  }\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-key,\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-control {\n    min-height: 34px;\n  }\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-grid {\n    gap: 4px;\n  }\n}\n@media (max-width: 420px) {\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-slots,\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-boxes {\n    gap: 4px;\n  }\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-slot {\n    min-width: 30px;\n    padding: 0 3px;\n  }\n  .jspsych-timelines-operation-span .jspsych-timelines-operation-span-box {\n    width: 40px;\n  }\n}\n");

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
      state: {
        trial: { n: 0, errors: 0, timeouts: 0 },
        last: null,
        last_processing: null,
        recall: newRecallState()
      }
    };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
  function sampleDuration(jsPsych, v) {
    if (typeof v === "number") return v;
    const step = v.step && v.step > 0 ? v.step : 1;
    return v.min + jsPsych.randomization.randomInt(0, Math.floor((v.max - v.min) / step + 1e-9)) * step;
  }
  function resolveWindow(jsPsych, v, c) {
    var _a, _b, _c;
    if (typeof v === "function")
      return { value: v(c), rule: (_c = (_b = (_a = v.explain) == null ? void 0 : _a.call(v, c)) != null ? _b : v.label) != null ? _c : "custom function" };
    if (v === null) return { value: null, rule: "none" };
    if (typeof v === "number") return { value: v, rule: "fixed" };
    return { value: sampleDuration(jsPsych, v), rule: "jitter" };
  }
  var noResponse = (d) => typeof d.rt !== "number";
  var buttonHtml = (choice) => `<button class="jspsych-btn">${choice}</button>`;
  function nounsOf(o) {
    const n = itemNouns(o.stimulus_set.memorandum);
    return { noun: n.singular, nouns: n.plural };
  }
  function processingArgs(ctx, o, timed) {
    const device = o.response_device.processing;
    const t = ctx.text;
    return {
      device,
      true_label: device === "keyboard" ? `<kbd>${keyName(o.response_keys[0])}</kbd>` : t.true_button,
      false_label: device === "keyboard" ? `<kbd>${keyName(o.response_keys[1])}</kbd>` : t.false_button,
      display_format: o.processing_display_format,
      solved_label: device === "keyboard" ? `<kbd>${keyName(" ")}</kbd>` : t.solved_button,
      timed
    };
  }
  function recallArgs(ctx, o) {
    return __spreadValues({
      format: o.response_format,
      order: o.response_order,
      omission: o.recall_omission_handling,
      blank_label: o.recall_omission_handling === "skip_button" ? ctx.text.skip_button : ctx.text.blank_button
    }, nounsOf(o));
  }
  function recallSpec(o, set_size) {
    return __spreadValues({
      format: o.response_format,
      order: o.response_order,
      omission: o.recall_omission_handling,
      set_size,
      pool: poolTexts(o)
    }, nounsOf(o));
  }
  function createDisplayTrial(a) {
    var _a;
    return __spreadProps(__spreadValues({
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: a.stimulus,
      choices: "NO_KEYS",
      trial_duration: a.duration
    }, a.stimulus_duration !== void 0 ? { stimulus_duration: a.stimulus_duration } : {}), {
      data: baseData(__spreadValues({ phase: a.phase, part: a.part, duration_ms: a.duration }, (_a = a.data) != null ? _a : {})),
      on_finish: (d) => {
        delete d.stimulus;
      }
    });
  }
  var blankScreen = () => renderScreen("");
  function createProcessing(a) {
    const { ctx, o, problem: p } = a;
    const t = ctx.text;
    const device = o.response_device.processing;
    const keyboard = device === "keyboard";
    const twoScreen = o.processing_display_format === "problem_then_answer_screens";
    const keys = o.response_keys;
    const args = processingArgs(ctx, o, false);
    const ep = {
      window: null,
      rule: "none",
      solve_rt: null,
      timeout: false
    };
    const windowFn = () => {
      const w = a.window();
      ep.window = w.value;
      ep.rule = w.rule;
      return w.value;
    };
    const row = (part, extra = {}) => baseData(__spreadValues(__spreadProps(__spreadValues({
      phase: a.phase,
      part
    }, a.base), {
      problem: p.text,
      shown_answer: p.shown,
      answer_is_true: p.is_true,
      response_device: device
    }), extra));
    const correctResponse = keyboard ? p.is_true ? keys[0] : keys[1] : p.is_true ? 0 : 1;
    const chosenTrue = (d) => keyboard ? String(d.response).toLowerCase() === keys[0].toLowerCase() : d.response === 0;
    const stamp = (d) => {
      var _a;
      d.response_window = ep.window;
      d.response_window_rule = ep.rule;
      (_a = a.finish) == null ? void 0 : _a.call(a, d);
    };
    const verifyPrompt = () => textBlock(
      t.verify_prompt({ device, true_label: args.true_label, false_label: args.false_label })
    );
    const verifyTrial = (withAnswerShown) => __spreadProps(__spreadValues(__spreadProps(__spreadValues(__spreadValues({
      type: keyboard ? HtmlKeyboardResponsePlugin : HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => renderScreen(
        withAnswerShown ? renderProblem(p, true) : renderAnswer(p),
        a.answerBelow ? a.answerBelow() : verifyPrompt()
      )
    }, keyboard ? { choices: [...keys] } : { choices: [t.true_button, t.false_button], button_html: buttonHtml }), withAnswerShown ? { trial_duration: windowFn } : {}), {
      data: row(a.tags.answer, { correct_response: correctResponse })
    }), a.simulateCorrect ? { simulation_options: { data: { response: correctResponse, rt: 600 } } } : {}), {
      on_finish: (d) => {
        delete d.stimulus;
        let correct;
        let timeout;
        if (withAnswerShown) {
          timeout = noResponse(d);
          if (timeout) d.response = null;
          correct = !timeout && chosenTrue(d) === p.is_true;
          d.solve_rt = d.rt;
        } else {
          timeout = false;
          correct = chosenTrue(d) === p.is_true;
          d.verify_rt = d.rt;
          d.rt = ep.solve_rt;
          d.solve_rt = ep.solve_rt;
        }
        d.timeout = timeout;
        d.correct = correct;
        stamp(d);
        a.onOutcome(d, { correct, timeout, rt: d.rt });
      }
    });
    if (!twoScreen) return { timeline: [verifyTrial(true)] };
    const solveTrial = __spreadProps(__spreadValues({
      type: keyboard ? HtmlKeyboardResponsePlugin : HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: renderScreen(
        renderProblem(p, false),
        textBlock(t.solve_prompt({ device, solved_label: args.solved_label }))
      )
    }, keyboard ? { choices: [" "] } : { choices: [t.solved_button], button_html: buttonHtml }), {
      trial_duration: windowFn,
      data: row(a.tags.problem),
      on_finish: (d) => {
        delete d.stimulus;
        ep.timeout = noResponse(d);
        if (ep.timeout) d.response = null;
        ep.solve_rt = ep.timeout ? null : d.rt;
        d.timeout = ep.timeout;
        stamp(d);
      }
    });
    const missedTrial = (() => {
      const trial = createDisplayTrial({
        phase: a.phase,
        part: a.tags.answer,
        duration: TIMEOUT_NOTICE_MS,
        stimulus: renderScreen(renderNotice(t.timeout_feedback, "timeout")),
        data: row(a.tags.answer, {
          correct_response: correctResponse,
          timeout: true,
          correct: false,
          solve_rt: null
        })
      });
      const strip = trial.on_finish;
      trial.on_finish = (d) => {
        strip(d);
        d.rt = null;
        d.response = null;
        stamp(d);
        a.onOutcome(d, { correct: false, timeout: true, rt: null });
      };
      return trial;
    })();
    return {
      timeline: [
        solveTrial,
        { timeline: [verifyTrial(false)], conditional_function: () => !ep.timeout },
        { timeline: [missedTrial], conditional_function: () => ep.timeout }
      ]
    };
  }
  function createMemorandum(ctx, o, a) {
    const ms = sampleDuration(ctx.jsPsych, o.stimulus_duration_ms);
    return createDisplayTrial({
      phase: a.phase,
      part: a.part,
      duration: ms,
      stimulus_duration: ms,
      stimulus: renderScreen(renderMemorandum(a.item)),
      data: __spreadProps(__spreadValues({}, a.data), {
        memorandum: a.item,
        memorandum_id: idOf(o)(a.item),
        stimulus_set: setName(o.stimulus_set.memorandum),
        stimulus_duration: ms
      })
    });
  }
  function createInterItem(ctx, o, a) {
    const ms = sampleDuration(ctx.jsPsych, o.inter_item_interval_ms);
    if (ms <= 0) return null;
    return createDisplayTrial({
      phase: a.phase,
      part: "inter_item",
      duration: ms,
      stimulus: blankScreen(),
      data: __spreadProps(__spreadValues({}, a.data), { inter_item_interval: ms })
    });
  }
  function createRecall(ctx, o, a) {
    const spec = recallSpec(o, a.presented.length);
    const t = ctx.text;
    const state = ctx.state.recall;
    const id = idOf(o);
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => renderScreen(renderRecallPanel(spec, t), "", true),
      choices: [t.done_button],
      button_html: buttonHtml,
      data: baseData(__spreadValues({
        phase: a.phase,
        part: a.part,
        set_size: a.presented.length,
        presented_items: a.presented,
        presented_item_ids: a.presented.map(id),
        stimulus_set: setName(o.stimulus_set.memorandum),
        response_order: o.response_order,
        response_format: o.response_format,
        response_device: o.response_device.recall
      }, a.data)),
      on_load: () => {
        Object.assign(state, newRecallState());
        wireRecall(state, spec, ctx.jsPsych.getDisplayElement());
      },
      on_finish: (d) => {
        var _a, _b;
        delete d.stimulus;
        const simulated = !state.wired;
        const recalled = simulated ? [...a.presented] : finalItems(state, spec);
        (_a = state.cleanup) == null ? void 0 : _a.call(state);
        const score = scoreRecall(a.presented, recalled, spec.order);
        d.recall_rt = d.rt;
        d.recalled_items = recalled;
        d.recalled_item_ids = recalled.map(id);
        d.recall_correct_positions = score.correct_positions;
        d.n_correct_positions = score.n_correct;
        d.proportion_correct = a.presented.length ? score.n_correct / a.presented.length : null;
        d.perfect = score.perfect;
        d.correct = score.perfect;
        (_b = a.onResult) == null ? void 0 : _b.call(a, d, score);
      }
    };
  }
  function runningAccuracy(ctx, phase, part) {
    const rows = ctx.jsPsych.data.get().filter(__spreadValues({
      task: TASK_NAME,
      phase,
      part: "processing"
    }, part ? { practice_part: part } : {}));
    const n = rows.count();
    return n > 0 ? rows.filter({ correct: true }).count() / n : null;
  }
  function feedbackHtml(ctx, o, out) {
    const t = ctx.text;
    const body = t.recall_feedback({
      n_correct: out.n_correct,
      set_size: out.set_size,
      math_errors: out.math_errors,
      math_accuracy: out.math_errors === null ? null : runningAccuracy(ctx, out.phase, out.phase === "practice" ? out.practice_part : void 0)
    });
    return body + (o.trial_feedback === "correct_answer" ? t.feedback_correct_answer(__spreadValues({ items: out.presented }, nounsOf(o))) : "");
  }
  function createRecallFeedback(ctx, o, phase) {
    const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
    const trial = createDisplayTrial({
      phase,
      part: "feedback",
      duration: ms,
      stimulus: () => renderScreen(renderNotice(feedbackHtml(ctx, o, ctx.state.last))),
      data: { feedback_kind: o.trial_feedback, feedback_duration: ms }
    });
    const strip = trial.on_finish;
    trial.on_finish = (d) => {
      var _a;
      strip(d);
      d.practice_part = (_a = ctx.state.last) == null ? void 0 : _a.practice_part;
    };
    return {
      timeline: [trial],
      conditional_function: () => o.trial_feedback !== "none" && ctx.state.last !== null
    };
  }
  function createProblemFeedback(ctx, o) {
    const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
    const trial = createDisplayTrial({
      phase: "practice",
      part: "feedback",
      duration: ms,
      stimulus: () => {
        const l = ctx.state.last_processing;
        const kind = l.timeout ? "timeout" : l.correct ? "correct" : "incorrect";
        const txt = l.timeout ? ctx.text.timeout_feedback : l.correct ? ctx.text.correct_feedback : ctx.text.incorrect_feedback;
        return renderScreen(renderNotice(txt, kind));
      },
      data: {
        feedback_kind: o.trial_feedback,
        feedback_duration: ms,
        practice_part: "processing_only"
      }
    });
    return {
      timeline: [trial],
      conditional_function: () => o.trial_feedback !== "none" && ctx.state.last_processing !== null
    };
  }
  function planTrial(ctx, o, base, withProcessing) {
    const k = withProcessing ? o.processing_items_per_memorandum : 0;
    return __spreadProps(__spreadValues({}, base), {
      items: drawMemoranda(ctx.jsPsych, o, base.set_size),
      problems: Array.from({ length: base.set_size * k }, () => generateProblem(ctx.jsPsych))
    });
  }
  function trialData(plan) {
    return {
      practice_part: plan.practice_part,
      block: plan.block,
      trial_index_in_block: plan.trial_index_in_block,
      set_size: plan.set_size
    };
  }
  function windowOf(ctx, o, plan) {
    return () => resolveWindow(ctx.jsPsych, o.response_window_ms, {
      jsPsych: ctx.jsPsych,
      phase: plan.phase,
      block: plan.phase === "test" ? plan.block : null,
      trial_index_in_block: plan.trial_index_in_block
    });
  }
  function createSpanTrial(ctx, o, plan, finish) {
    const k = plan.problems.length / Math.max(plan.set_size, 1);
    const hasProcessing = plan.problems.length > 0;
    const data = trialData(plan);
    const events = [];
    for (let i = 0; i < plan.set_size; i++) {
      const memorandum = createMemorandum(ctx, o, {
        phase: plan.phase,
        part: "memorandum",
        item: plan.items[i],
        data: __spreadProps(__spreadValues({}, data), { position: i + 1 })
      });
      const procs = plan.problems.slice(i * k, (i + 1) * k).map(
        (p, j) => createProcessing({
          ctx,
          o,
          problem: p,
          phase: plan.phase,
          tags: { problem: "processing_problem", answer: "processing" },
          base: __spreadProps(__spreadValues({}, data), { position: i + 1, episode: j + 1 }),
          window: windowOf(ctx, o, plan),
          onOutcome: (_d, out) => {
            ctx.state.trial.n++;
            if (!out.correct) ctx.state.trial.errors++;
            if (out.timeout) ctx.state.trial.timeouts++;
            ctx.state.last_processing = { correct: out.correct, timeout: out.timeout };
          },
          finish
        })
      );
      events.push(
        ...o.memorandum_order_in_pair === "processing_first" ? [...procs, memorandum] : [memorandum, ...procs]
      );
    }
    const timeline = [];
    events.forEach((e, i) => {
      timeline.push(e);
      if (i < events.length - 1) {
        const gap = createInterItem(ctx, o, { phase: plan.phase, data });
        if (gap) timeline.push(gap);
      }
    });
    timeline.push(
      createRecall(ctx, o, {
        phase: plan.phase,
        part: "response",
        presented: plan.items,
        data,
        onResult: (d, score) => {
          const tr = ctx.state.trial;
          d.processing_n = tr.n;
          d.processing_errors = hasProcessing ? tr.errors : null;
          d.processing_timeouts = hasProcessing ? tr.timeouts : null;
          ctx.state.last = {
            n_correct: score.n_correct,
            set_size: plan.set_size,
            presented: plan.items,
            math_errors: hasProcessing ? tr.errors : null,
            phase: plan.phase,
            practice_part: plan.practice_part
          };
        }
      })
    );
    timeline.push(createRecallFeedback(ctx, o, plan.phase));
    return {
      timeline,
      on_timeline_start: () => {
        ctx.state.trial = { n: 0, errors: 0, timeouts: 0 };
        ctx.state.last = null;
      }
    };
  }
  function createTest(ctx) {
    const o = ctx.test;
    const blocks = scheduleBlocks(ctx.jsPsych, o.set_sizes, o.trials_per_condition, o.block_order);
    return blocks.map((sizes, b) => ({
      timeline: sizes.map(
        (set_size, i) => createSpanTrial(
          ctx,
          o,
          planTrial(
            ctx,
            o,
            { phase: "test", block: b + 1, trial_index_in_block: i + 1, set_size },
            true
          )
        )
      )
    }));
  }
  function practiceParts(ctx) {
    const {
      practice_structure: s,
      practice_trials,
      practice_storage_trials,
      practice_combined_trials
    } = ctx.test;
    const parts = [];
    const hasProcessing = ctx.test.processing_items_per_memorandum > 0;
    if ((s === "storage_processing_combined" || s === "storage_processing") && practice_storage_trials > 0)
      parts.push("storage");
    if ((s === "storage_processing_combined" || s === "storage_processing") && practice_trials > 0 && hasProcessing)
      parts.push("processing_only");
    if ((s === "storage_processing_combined" || s === "combined_only") && practice_combined_trials > 0)
      parts.push("combined");
    return parts;
  }
  function practiceIntro(ctx, part) {
    const html = part === "storage" ? ctx.text.practice_storage_intro(nounsOf(ctx.test)) : part === "processing_only" ? ctx.text.practice_processing_intro : ctx.text.practice_combined_intro;
    return textPage(ctx, html, "instructions", "instruction");
  }
  function createPracticePart(ctx, part, finish) {
    var _a;
    const o = ctx.practice;
    const user = ctx.user;
    if (part === "processing_only") {
      const n2 = ctx.test.practice_trials;
      const selfPaced = ((_a = user.practice) == null ? void 0 : _a.response_window_ms) === void 0;
      const nodes = Array.from({ length: n2 }, (_, i) => {
        const problem = generateProblem(ctx.jsPsych);
        const base = { practice_part: "processing_only", block: 1, trial_index_in_block: i + 1 };
        return {
          timeline: [
            createProcessing({
              ctx,
              o,
              problem,
              phase: "practice",
              tags: { problem: "processing_problem", answer: "processing" },
              base,
              window: () => selfPaced ? { value: null, rule: "self-paced" } : resolveWindow(ctx.jsPsych, o.response_window_ms, {
                jsPsych: ctx.jsPsych,
                phase: "practice",
                block: null,
                trial_index_in_block: i + 1
              }),
              onOutcome: (_d, out) => {
                ctx.state.last_processing = { correct: out.correct, timeout: out.timeout };
              },
              finish
            }),
            createProblemFeedback(ctx, o)
          ]
        };
      });
      return { timeline: nodes };
    }
    const n = part === "storage" ? ctx.test.practice_storage_trials : ctx.test.practice_combined_trials;
    const sizes = practiceSetSizes(ctx.jsPsych, o.set_sizes, n);
    return {
      timeline: sizes.map(
        (set_size, i) => createSpanTrial(
          ctx,
          o,
          planTrial(
            ctx,
            o,
            {
              phase: "practice",
              practice_part: part,
              block: 1,
              trial_index_in_block: i + 1,
              set_size
            },
            part === "combined"
          ),
          finish
        )
      )
    };
  }
  function createPractice(ctx) {
    var _a;
    const parts = practiceParts(ctx);
    const crit = ctx.test.practice_criterion;
    const gated = crit ? parts.includes("processing_only") ? "processing_only" : parts.includes("combined") ? "combined" : null : null;
    const nodes = [];
    const showText = ctx.test.instruction_format === "text";
    for (const part of parts) {
      if (showText) nodes.push(practiceIntro(ctx, part));
      if (part !== gated || !crit) {
        nodes.push(createPracticePart(ctx, part));
        continue;
      }
      const st = { attempt: 1, accuracy: null, failed: false, end: false };
      const maxRepeats = (_a = crit.max_repeats) != null ? _a : 1;
      const body = createPracticePart(ctx, part, (d) => {
        d.practice_attempt = st.attempt;
      });
      nodes.push({
        timeline: [
          {
            timeline: [
              textPage(
                ctx,
                "",
                "instructions",
                "instruction",
                void 0,
                () => {
                  var _a2;
                  return ctx.text.practice_repeat({ accuracy: (_a2 = st.accuracy) != null ? _a2 : 0, criterion: crit.accuracy });
                }
              )
            ],
            conditional_function: () => st.attempt > 1
          },
          body
        ],
        loop_function: () => {
          var _a2;
          const rows = ctx.jsPsych.data.get().filter({
            task: TASK_NAME,
            phase: "practice",
            part: "processing",
            practice_part: part,
            practice_attempt: st.attempt
          }).values();
          const used = crit.window ? rows.slice(-crit.window) : rows;
          st.accuracy = used.length ? used.filter((r) => r.correct).length / used.length : null;
          st.failed = st.accuracy !== null && st.accuracy < crit.accuracy;
          if (!st.failed) return false;
          const action = (_a2 = crit.on_fail) != null ? _a2 : "repeat";
          if (action === "repeat" && st.attempt <= maxRepeats) {
            st.attempt++;
            return true;
          }
          if (action === "end") st.end = true;
          return false;
        }
      });
      nodes.push({
        timeline: [
          __spreadProps(__spreadValues({}, textPage(ctx, ctx.text.practice_failed, "instructions", "instruction")), {
            on_finish: () => ctx.jsPsych.abortExperiment(textOnly(ctx.text.practice_failed))
          })
        ],
        conditional_function: () => st.end
      });
    }
    return nodes;
  }
  var textOnly = (html) => html.replace(/<[^>]*>/g, "");
  function textPage(ctx, html, phase, part, label, dynamic) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: dynamic ? () => `<div class="${cls("text")}">${dynamic()}</div>` : `<div class="${cls("text")}">${html}</div>`,
      choices: [ctx.text.continue_button],
      data: baseData({ phase, part })
    };
  }
  function createTransition(ctx, html, phase, part = "transition") {
    return textPage(ctx, html, phase, part);
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const timed = o.response_window_ms !== null;
    const emphasis = o.speed_accuracy_emphasis === "speed" ? t.emphasis_speed : o.speed_accuracy_emphasis === "accuracy" ? t.emphasis_accuracy({ criterion_percent: Math.round(PROCESSING_ACCURACY_TARGET * 100) }) : o.speed_accuracy_emphasis === "both" ? t.emphasis_both(nounsOf(o)) : "";
    const pages = [];
    if (o.processing_items_per_memorandum > 0) {
      pages.push(
        t.instruction_intro(__spreadValues({
          memorandum_first: o.memorandum_order_in_pair === "memorandum_first",
          items_per_memorandum: o.processing_items_per_memorandum
        }, nounsOf(o)))
      );
      pages.push(
        t.instruction_processing(processingArgs(ctx, o, timed)) + (o.processing_read_aloud ? t.read_aloud : "") + emphasis
      );
    }
    pages.push(t.instruction_recall(recallArgs(ctx, o)));
    return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
  }
  var createTestIntro = (ctx) => textPage(ctx, ctx.text.instruction_test_intro(nounsOf(ctx.test)), "instructions", "instruction");
  function demoArgs(ctx, o, step, items) {
    const p = processingArgs(ctx, o, false);
    return __spreadValues(__spreadProps(__spreadValues({}, p), {
      step,
      correct_label: step === "processing_false" ? p.false_label : p.true_label,
      items,
      recall: recallArgs(ctx, o)
    }), nounsOf(o));
  }
  function createInstructionWalkthrough(ctx) {
    const o = ctx.test;
    const mode = o.instruction_demonstration;
    if (o.instruction_format !== "text" || mode === "none") return { timeline: [] };
    const t = ctx.text;
    const hasProcessing = o.processing_items_per_memorandum > 0;
    const steps = [
      ...hasProcessing ? ["processing_true", "processing_false"] : [],
      "recall"
    ];
    if (mode === "examples") {
      const pages = [
        textPage(ctx, t.instruction_examples_intro, "instructions", "instruction")
      ];
      for (const step of steps) {
        const items = drawMemoranda(ctx.jsPsych, o, INSTRUCTION_RECALL_SET_SIZE);
        const p = step === "recall" ? null : generateProblem(ctx.jsPsych, step === "processing_true");
        const args = demoArgs(ctx, o, step, items);
        const stage = p ? renderProblem(p, true) : renderRecallPanel(recallSpec(o, INSTRUCTION_RECALL_SET_SIZE), t);
        pages.push({
          type: HtmlButtonResponsePlugin,
          css_classes: [TASK_CLASS],
          stimulus: renderScreen(stage, textBlock(t.instruction_step(args)), step === "recall"),
          choices: [t.continue_button],
          data: baseData({ phase: "instructions", part: "instruction_example", condition: step }),
          on_finish: (d) => {
            delete d.stimulus;
          }
        });
      }
      return { timeline: pages };
    }
    const nodes = [textPage(ctx, t.instruction_demo_intro, "instructions", "instruction")];
    for (const step of steps) {
      const items = step === "recall" ? drawMemoranda(ctx.jsPsych, o, INSTRUCTION_RECALL_SET_SIZE) : [];
      const args = demoArgs(ctx, o, step, items);
      const state = { attempt: 0, correct: null };
      const stepData = { condition: step };
      const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;
      const sub = [];
      if (step === "recall") {
        items.forEach((item, i) => {
          sub.push(
            createMemorandum(ctx, o, {
              phase: "instructions",
              part: "instruction_example",
              item,
              data: __spreadProps(__spreadValues({}, stepData), { position: i + 1 })
            })
          );
          if (i < items.length - 1) {
            const gap = createInterItem(ctx, o, { phase: "instructions", data: stepData });
            if (gap) sub.push(gap);
          }
        });
        sub.push(
          createRecall(ctx, o, {
            phase: "instructions",
            part: "instruction_check",
            presented: items,
            data: stepData,
            onResult: (d, score) => {
              state.attempt++;
              state.correct = score.perfect;
              d.attempt = state.attempt;
            }
          })
        );
      } else {
        const problem = generateProblem(ctx.jsPsych, step === "processing_true");
        sub.push(
          createProcessing({
            ctx,
            o,
            problem,
            phase: "instructions",
            tags: { problem: "instruction_example", answer: "instruction_check" },
            base: stepData,
            window: () => ({ value: null, rule: "untimed" }),
            answerBelow: () => textBlock(t.instruction_step(args)),
            simulateCorrect: true,
            onOutcome: (d, out) => {
              state.attempt++;
              state.correct = out.correct;
              d.attempt = state.attempt;
            }
          })
        );
      }
      const confirm = createDisplayTrial({
        phase: "instructions",
        part: "instruction_feedback",
        duration: INSTRUCTION_CORRECT_MS,
        stimulus: renderScreen(renderNotice(`<strong>${t.instruction_correct}</strong>`)),
        data: __spreadProps(__spreadValues({}, stepData), { feedback_kind: "correct" })
      });
      const note = (html, kind) => ({
        type: HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => `<div class="${cls("text")}">${html}</div>`,
        choices: [t.continue_button],
        data: baseData(__spreadProps(__spreadValues({
          phase: "instructions",
          part: "instruction_feedback"
        }, stepData), {
          feedback_kind: kind
        })),
        on_finish: (d) => {
          delete d.stimulus;
        }
      });
      const body = {
        timeline: [
          ...sub,
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
      };
      if (step === "recall")
        nodes.push(textPage(ctx, t.instruction_step(args), "instructions", "instruction"));
      nodes.push(body);
    }
    return { timeline: nodes };
  }
  function createCompletion(ctx) {
    const o = ctx.test;
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const feedback = o.end_of_task_feedback;
        let body = "";
        if (feedback === "score" || feedback === "summary") {
          const s = calculateScores(ctx.jsPsych.data.get());
          body = ctx.text.result_summary({
            partial_score: s.partial_credit_load,
            total_items: s.total_items,
            processing_accuracy: s.processing_accuracy,
            summary: feedback === "summary",
            absolute_score: s.absolute_score,
            perfect_trials: s.n_perfect_trials,
            n_trials: s.n_trials
          });
        }
        return `<div class="${cls("text")}"><h2>${ctx.text.task_complete}</h2>${body}</div>`;
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
    if (o.instruction_format === "text") {
      timeline.push(createInstructions(ctx));
      if (o.instruction_demonstration !== "none") timeline.push(createInstructionWalkthrough(ctx));
    }
    timeline.push(...createPractice(ctx));
    if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));
    timeline.push(...createTest(ctx));
    timeline.push(createCompletion(ctx));
    return { timeline };
  }
  var timelineUnits = {
    createContext,
    createInstructions,
    createInstructionWalkthrough,
    createTestIntro,
    createTransition,
    createMemorandum,
    createInterItem,
    createProcessing,
    createRecall,
    createRecallFeedback,
    createProblemFeedback,
    createSpanTrial,
    planTrial,
    createPracticePart,
    createPractice,
    createTest,
    createCompletion
  };
  var utils = {
    scoring: { calculateScores, getSummary, scoreRecall },
    constants: {
      TASK_NAME,
      VERSION,
      TASK_CLASS,
      DEFAULT_OPTIONS,
      PHASE_OPTIONS,
      LETTERS,
      DIGITS,
      GRID_COLUMNS,
      PROCESSING_ACCURACY_TARGET,
      FALLBACK_DEADLINE_MS,
      MIN_CALIBRATION_ROWS,
      INSTRUCTION_MAX_ATTEMPTS
    },
    text: { defaultText },
    deadlines: __spreadProps(__spreadValues({}, deadlines), { calibrationRts, resolve: resolveWindow }),
    /** The bundled memorandum sets, and the helpers that read a set and generate problems. */
    stimuli: { letters, digits, words, generateProblem },
    /** Reads a memorandum set: its items, normalised to `{ id, text }`, in order. */
    items: { buildPool },
    sequence: { scheduleBlocks, fixedOrder, practiceSetSizes },
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map