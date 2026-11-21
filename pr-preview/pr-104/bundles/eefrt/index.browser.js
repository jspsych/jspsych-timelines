var jsPsychTimelineEefrt = (function (exports) {
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
      module.exports = words;
      words.wordList = wordList;
    }
  });

  // package.json
  var version = "0.0.1";

  // src/constants.ts
  var TASK_NAME = "eefrt";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-eefrt";
  var EFFORT_PLUGIN_NAME = "eefrt-effort";
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_CORRECT_MS = 900;
  var MAX_SESSION_TRIALS = 600;
  var REWARD_BINS = ["low", "mid", "high"];
  var FIRST_N_TRIALS = 50;
  var SIMULATION = {
    choice: {
      /** log-odds of choosing the hard task at probability .5 and a hard reward 2.77 times the easy one */
      intercept: -0.2,
      /** per unit of win probability above .5 */
      per_probability: 3.5,
      /** per unit of (hard reward / easy reward) above 2.77 (the mean of 1.24..4.30 over $1) */
      per_reward_ratio: 0.9,
      reward_ratio_centre: 2.77,
      /** chance of not choosing in time when there is a window (the task then assigns one at random) */
      timeout: 0.02,
      /** ex-Gaussian choice RT, ms */
      rt: { mu: 1100, sigma: 250, tau: 500 }
    },
    /** presses per second: mean and between-trial sd; within a trial the gaps vary by `gap_cv` */
    press_rate: {
      easy: { mean: 5.8, sd: 0.7 },
      hard: { mean: 5.3, sd: 0.55 },
      gap_cv: 0.2,
      min_gap_ms: 60
    }
  };

  // src/offers.ts
  var round2 = (x) => Math.round(x * 100) / 100;
  function rewardLevels(h) {
    if ("levels" in h) return [...h.levels];
    if ("uniform" in h) return null;
    if (h.n_levels === 1) return [round2(h.min)];
    return Array.from(
      { length: h.n_levels },
      (_, i) => round2(h.min + (h.max - h.min) * i / (h.n_levels - 1))
    );
  }
  function rewardRange(h) {
    if ("levels" in h) return { min: Math.min(...h.levels), max: Math.max(...h.levels) };
    if ("uniform" in h) return h.uniform;
    return { min: h.min, max: h.max };
  }
  function fixedOrder(n) {
    return Array.from({ length: n }, (_, i) => i).map((i) => ({ i, key: Math.imul(i + 1, 2654435761) >>> 0 })).sort((a, b) => a.key - b.key || a.i - b.i).map((x) => x.i);
  }
  function fixedWin(probability, occurrence) {
    return Math.floor((occurrence + 1) * probability + 0.5) > Math.floor(occurrence * probability + 0.5);
  }
  var OfferStream = class {
    constructor(jsPsych, o, order) {
      this.jsPsych = jsPsych;
      this.o = o;
      this.order = order;
      this.queue = [];
      this.levels = rewardLevels(o.reward_magnitude.hard);
      this.occurrence = o.reward_probability.map(() => 0);
    }
    drawReward() {
      const h = this.o.reward_magnitude.hard;
      if ("uniform" in h) {
        return this.jsPsych.randomization.randomInt(
          Math.round(h.uniform.min * 100),
          Math.round(h.uniform.max * 100)
        ) / 100;
      }
      throw new Error("eefrt: drawReward called for a list of levels");
    }
    make(pi, ri, win) {
      var _a, _b;
      const nR = (_b = (_a = this.levels) == null ? void 0 : _a.length) != null ? _b : 1;
      return {
        probability: this.o.reward_probability[pi],
        hard_reward: this.levels && ri !== null ? this.levels[ri] : this.drawReward(),
        easy_reward: this.o.reward_magnitude.easy,
        win,
        cell: ri === null ? null : pi * nR + ri
      };
    }
    fillPass() {
      var _a, _b;
      const R = this.jsPsych.randomization;
      const P2 = this.o.reward_probability;
      const nR = (_b = (_a = this.levels) == null ? void 0 : _a.length) != null ? _b : 1;
      const cells = [];
      for (let pi = 0; pi < P2.length; pi++)
        for (let ri = 0; ri < nR; ri++) cells.push({ pi, ri: this.levels ? ri : null });
      const order = this.order === "fixed_sequence" ? fixedOrder(cells.length) : R.shuffle(cells.map((_, i) => i));
      const flags = P2.map((p) => {
        if (this.order === "fixed_sequence") return [];
        if (nR === 1) return [R.sampleBernoulli(p) === 1];
        const k = Math.round(p * nR);
        return R.shuffle([...Array(k).fill(true), ...Array(nR - k).fill(false)]);
      });
      for (const idx of order) {
        const { pi, ri } = cells[idx];
        let win;
        if (this.order === "fixed_sequence") win = fixedWin(P2[pi], this.occurrence[pi]++);
        else win = flags[pi][ri != null ? ri : 0];
        this.queue.push(this.make(pi, ri, win));
      }
    }
    next() {
      if (this.order === "random") {
        const R = this.jsPsych.randomization;
        const P2 = this.o.reward_probability;
        const pi = R.randomInt(0, P2.length - 1);
        const ri = this.levels ? R.randomInt(0, this.levels.length - 1) : null;
        return this.make(pi, ri, R.sampleBernoulli(P2[pi]) === 1);
      }
      if (this.queue.length === 0) this.fillPass();
      return this.queue.shift();
    }
  };

  // src/options.ts
  var PHASE_OPTIONS = [
    "feedback_duration_ms",
    "fixation_duration_ms",
    "pre_block_countdown_ms",
    "response_window_ms",
    "difficulty_levels",
    "reward_magnitude",
    "reward_probability",
    "progress_indicator",
    "response_key_mapping"
  ];
  var DEFAULT_OPTIONS = {
    feedback_duration_ms: { completion: 2e3, reward: 2e3 },
    fixation_duration_ms: 1e3,
    pre_block_countdown_ms: 1e3,
    response_window_ms: { choice: 5e3, easy: 7e3, hard: 21e3 },
    session_duration_min: 20,
    difficulty_levels: { easy: 30, hard: 100 },
    n_test_trials: 48,
    outcome_type: "money",
    outcome_valence: "gain",
    reward_magnitude: { easy: 1, hard: { min: 1.24, max: 4.3, n_levels: 8 } },
    reward_probability: [0.12, 0.5, 0.88],
    trial_order: "fixed_sequence",
    missed_response_handling: "random_assignment",
    response_keys: ["e", "i"],
    response_key_mapping: { easy: "space", hard: "space" },
    device_eligibility: "computer_only",
    practice_trials: 4,
    practice_forced_tasks: ["easy", "hard"],
    pretraining: "none",
    task_end_rule: "fixed_time",
    payout_rule: "two_random_win_trials_paid",
    progress_indicator: "progress_bar",
    instruction_demonstration: "interactive",
    instruction_format: "text",
    practice: {}
  };
  function normaliseKey(key) {
    return key.toLowerCase() === "space" ? " " : key;
  }
  var isRange = (v) => typeof v === "object" && v !== null && "min" in v && "max" in v;
  function isFeedbackMap(v) {
    return typeof v === "object" && v !== null && !isRange(v);
  }
  function mergeMaps(layer, merged) {
    var _a, _b, _c;
    const fd = layer.feedback_duration_ms;
    if (fd !== void 0) {
      merged.feedback_duration_ms = isFeedbackMap(fd) ? __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.feedback_duration_ms), stripUndefined(fd)) : { completion: fd, reward: fd };
    } else merged.feedback_duration_ms = __spreadValues({}, DEFAULT_OPTIONS.feedback_duration_ms);
    const rw2 = layer.response_window_ms;
    if (rw2 === void 0) merged.response_window_ms = __spreadValues({}, DEFAULT_OPTIONS.response_window_ms);
    else if (rw2 === null || typeof rw2 === "number") {
      merged.response_window_ms = __spreadProps(__spreadValues({}, DEFAULT_OPTIONS.response_window_ms), { choice: rw2 });
    } else {
      merged.response_window_ms = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.response_window_ms), stripUndefined(rw2));
    }
    merged.difficulty_levels = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.difficulty_levels), stripUndefined((_a = layer.difficulty_levels) != null ? _a : {}));
    merged.reward_magnitude = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.reward_magnitude), stripUndefined((_b = layer.reward_magnitude) != null ? _b : {}));
    merged.response_key_mapping = __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.response_key_mapping), stripUndefined((_c = layer.response_key_mapping) != null ? _c : {}));
  }
  function stripUndefined(o) {
    return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== void 0));
  }
  function resolveOptions(user = {}, phase = "test") {
    const _a = user, { practice, text: _text } = _a, top = __objRest(_a, ["practice", "text"]);
    let layer = stripUndefined(__spreadValues({}, top));
    if (phase === "practice") layer = __spreadValues(__spreadValues({}, layer), stripUndefined(practice != null ? practice : {}));
    const merged = __spreadValues({}, DEFAULT_OPTIONS);
    delete merged.practice;
    for (const [k, v] of Object.entries(layer)) if (v !== void 0) merged[k] = v;
    mergeMaps(layer, merged);
    if (layer.practice_forced_tasks === void 0) {
      merged.practice_forced_tasks = DEFAULT_OPTIONS.practice_forced_tasks.slice(
        0,
        Math.max(0, merged.practice_trials)
      );
    }
    const t = stripUndefined(top);
    const timeGiven = t.session_duration_min !== void 0;
    const countGiven = t.n_test_trials !== void 0;
    if (t.task_end_rule === "fixed_time" && countGiven) {
      throw new Error(
        'eefrt: n_test_trials contradicts task_end_rule "fixed_time" (the session ends on time); use task_end_rule "fixed_trial_count".'
      );
    }
    if (t.task_end_rule === "fixed_trial_count" && timeGiven) {
      throw new Error(
        'eefrt: session_duration_min contradicts task_end_rule "fixed_trial_count"; use task_end_rule "fixed_time".'
      );
    }
    if (t.task_end_rule === void 0) {
      if (timeGiven && countGiven) {
        throw new Error(
          "eefrt: session_duration_min and n_test_trials both given without task_end_rule; the test ends on time or on a count, not both. Give task_end_rule."
        );
      }
      if (countGiven) merged.task_end_rule = "fixed_trial_count";
      else merged.task_end_rule = "fixed_time";
    }
    return merged;
  }
  var NOT_IMPLEMENTED = [
    [
      "outcome_type",
      ["points_exchanged_for_candy", "food_portions"],
      'use "money" or "points" and translate the payout text (`text.payout_sentence`, `text.amount`)'
    ],
    [
      "outcome_valence",
      ["loss", "gain_and_loss", "mixed"],
      "only gains are implemented; the dossier does not describe the loss trials of S008's review table"
    ],
    [
      "pretraining",
      ["stimulus_preexposure", "pavlovian", "familiarization"],
      "only none is implemented; the maximal-pressing pretest of S008 is not (see DEFAULTS.md)"
    ],
    [
      "device_eligibility",
      ["browser_restricted", "hardware_required"],
      "only none and computer_only are implemented"
    ],
    [
      "payout_rule",
      ["fixed_noncontingent_with_deception"],
      "a deception that the researcher, not the package, would carry out; pay outside the package"
    ],
    [
      "instruction_format",
      ["audio", "video"],
      "no media is bundled; supply your own instruction trials"
    ],
    [
      "instruction_demonstration",
      ["examples", "animated", "guided_trial"],
      "use interactive (real screens, repeat until correct) or none"
    ]
  ];
  var positive = (x) => typeof x === "number" && Number.isFinite(x) && x > 0;
  function validateDuration(name, d) {
    if (typeof d === "number") {
      if (!(d >= 0)) throw new Error(`eefrt: ${name} must be 0 or more.`);
      return;
    }
    if (!isRange(d) || !(d.min >= 0) || !(d.max >= d.min) || d.step !== void 0 && !(d.step > 0)) {
      throw new Error(`eefrt: ${name}: { min, max, step } needs 0 <= min <= max and step > 0.`);
    }
  }
  function validateHardRewards(h) {
    if ("levels" in h) {
      if (!Array.isArray(h.levels) || h.levels.length === 0 || h.levels.some((x) => !(x >= 0))) {
        throw new Error(
          "eefrt: reward_magnitude.hard.levels needs a non-empty list of amounts of 0 or more."
        );
      }
    } else if ("uniform" in h) {
      const u = h.uniform;
      if (!u || !(u.min >= 0) || !(u.max >= u.min)) {
        throw new Error("eefrt: reward_magnitude.hard.uniform needs 0 <= min <= max.");
      }
    } else if ("n_levels" in h) {
      if (!Number.isInteger(h.n_levels) || h.n_levels < 1 || !(h.min >= 0) || !(h.max >= h.min)) {
        throw new Error(
          "eefrt: reward_magnitude.hard { min, max, n_levels } needs an integer n_levels of 1 or more and 0 <= min <= max."
        );
      }
      if (h.n_levels === 1 && h.min !== h.max) {
        throw new Error("eefrt: reward_magnitude.hard with n_levels 1 needs min equal to max.");
      }
    } else {
      throw new Error(
        "eefrt: reward_magnitude.hard must be { levels }, { min, max, n_levels } or { uniform: { min, max } }."
      );
    }
  }
  function validateOptions(o) {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`eefrt: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    if (o.task_end_rule === "fixed_time") {
      if (o.session_duration_min === null || o.session_duration_min === void 0) {
        throw new Error(
          'eefrt: task_end_rule "fixed_time" needs session_duration_min (null would never end the session); use "fixed_trial_count" to end on a count.'
        );
      }
      if (!positive(o.session_duration_min)) {
        throw new Error("eefrt: session_duration_min must be more than 0.");
      }
    } else if (!Number.isInteger(o.n_test_trials) || o.n_test_trials < 1) {
      throw new Error("eefrt: n_test_trials must be a positive integer.");
    }
    if (!Number.isInteger(o.practice_trials) || o.practice_trials < 0) {
      throw new Error("eefrt: practice_trials must be a whole number of 0 or more.");
    }
    const w = o.response_window_ms;
    if (w.choice !== null && !positive(w.choice)) {
      throw new Error("eefrt: response_window_ms.choice must be more than 0, or null for untimed.");
    }
    for (const task of ["easy", "hard"]) {
      if (!positive(w[task])) {
        throw new Error(
          `eefrt: response_window_ms.${task} must be a finite time in ms (null would never end the ${task} task).`
        );
      }
      if (!Number.isInteger(o.difficulty_levels[task]) || o.difficulty_levels[task] < 1) {
        throw new Error(
          `eefrt: difficulty_levels.${task} must be a positive whole number of presses.`
        );
      }
    }
    validateDuration("feedback_duration_ms.completion", o.feedback_duration_ms.completion);
    validateDuration("feedback_duration_ms.reward", o.feedback_duration_ms.reward);
    validateDuration("fixation_duration_ms", o.fixation_duration_ms);
    validateDuration("pre_block_countdown_ms", o.pre_block_countdown_ms);
    if (!(o.reward_magnitude.easy >= 0))
      throw new Error("eefrt: reward_magnitude.easy must be 0 or more.");
    validateHardRewards(o.reward_magnitude.hard);
    if (!Array.isArray(o.reward_probability) || o.reward_probability.length === 0 || o.reward_probability.some((p) => !(p > 0 && p <= 1))) {
      throw new Error(
        'eefrt: reward_probability must be a non-empty list of proportions above 0 and at most 1 (0.12, not 12 or "12%").'
      );
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
      throw new Error(
        "eefrt: response_keys must list exactly two keys (first = easy task, second = hard task)."
      );
    }
    if (o.response_keys[0].toLowerCase() === o.response_keys[1].toLowerCase()) {
      throw new Error("eefrt: response_keys needs two different keys.");
    }
    if (!Array.isArray(o.practice_forced_tasks) || o.practice_forced_tasks.some((t) => t !== "easy" && t !== "hard")) {
      throw new Error('eefrt: practice_forced_tasks must be a list of "easy" and "hard".');
    }
    if (o.practice_forced_tasks.length > o.practice_trials) {
      throw new Error(
        "eefrt: practice_forced_tasks assigns more tasks than practice_trials; raise practice_trials or shorten the list."
      );
    }
    const effort = [o.response_key_mapping.easy, o.response_key_mapping.hard].map(
      (k) => normaliseKey(k).toLowerCase()
    );
    for (const k of o.response_keys) {
      if (effort.includes(normaliseKey(k).toLowerCase())) {
        throw new Error(
          `eefrt: the choice key "${k}" is also an effort key; a key held down from the choice would count as a press. Use different keys.`
        );
      }
    }
  }
  function sampleDuration(jsPsych, spec) {
    if (typeof spec === "number") return spec;
    const step = spec.step && spec.step > 0 ? spec.step : 1;
    const n = Math.floor((spec.max - spec.min) / step + 1e-9);
    return spec.min + step * jsPsych.randomization.randomInt(0, n);
  }

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

  // src/simulation.ts
  function hasForcedRt(jsPsych) {
    var _a, _b;
    const o = jsPsych.simulationOptions;
    return ((_b = (_a = o == null ? void 0 : o.default) == null ? void 0 : _a.data) == null ? void 0 : _b.rt) !== void 0;
  }
  function hardChoiceProbability(offer) {
    const c = SIMULATION.choice;
    const ratio2 = offer.easy_reward > 0 ? offer.hard_reward / offer.easy_reward : offer.hard_reward;
    const logit = c.intercept + c.per_probability * (offer.probability - 0.5) + c.per_reward_ratio * (ratio2 - c.reward_ratio_centre);
    return 1 / (1 + Math.exp(-logit));
  }
  function simulateChoice(jsPsych, offer, windowMs) {
    const R = jsPsych.randomization;
    const c = SIMULATION.choice;
    const draw = R.sampleExGaussian(c.rt.mu, c.rt.sigma, 1 / c.rt.tau, true);
    const rt = Math.max(250, Math.round(draw));
    const missed = windowMs !== null && (R.sampleBernoulli(c.timeout) === 1 || rt > windowMs);
    if (missed) return { task: null, rt: null };
    return { task: R.sampleBernoulli(hardChoiceProbability(offer)) === 1 ? "hard" : "easy", rt };
  }
  function simulatePressRate(jsPsych, task) {
    const r = SIMULATION.press_rate[task];
    return Math.max(1, jsPsych.randomization.sampleNormal(r.mean, r.sd));
  }
  function simulatePressTimes(jsPsych, required, limit, rate, gapCv = SIMULATION.press_rate.gap_cv) {
    const R = jsPsych.randomization;
    const mean = 1e3 / rate;
    const times = [];
    let t = 0;
    while (times.length < required) {
      t += Math.max(SIMULATION.press_rate.min_gap_ms, R.sampleNormal(mean, mean * gapCv));
      if (limit !== null && t > limit) break;
      times.push(Math.round(t));
    }
    return times;
  }

  // src/stimuli.ts
  var P = "jspsych-timelines-eefrt";
  function renderScreen(stage, below = "") {
    const region = below ? `<div class="${P}-below"><div class="${P}-text">${below}</div></div>` : "";
    return `<div class="${P}-screen"><div class="${P}-stage">${stage}</div>${region}</div>`;
  }
  function renderFixation(text, below = "") {
    return renderScreen(
      `<div class="${P}-fixation-layer"><span class="${P}-fixation">${text.fixation}</span></div>`,
      below
    );
  }
  function renderCenterText(html, kind = "", below = "") {
    return renderScreen(`<div class="${P}-center ${kind}">${html}</div>`, below);
  }
  function renderChoice(a) {
    var _a;
    const t = a.text;
    const card = (task) => {
      const amount = t.amount({
        value: task === "easy" ? a.offer.easy_reward : a.offer.hard_reward,
        outcome_type: a.outcome_type
      });
      return `<div class="${P}-card" data-task="${task}"><div class="${P}-card-title">${t.task_title({ task })}</div><div class="${P}-card-reward">${t.reward_line({ amount })}</div><div class="${P}-card-effort">${t.effort_requirement({
      presses: task === "easy" ? a.easy_presses : a.hard_presses,
      seconds: task === "easy" ? a.easy_seconds : a.hard_seconds
    })}</div><div class="${P}-card-key">${t.choice_key_label({
      key: task === "easy" ? a.easy_key : a.hard_key
    })}</div></div>`;
    };
    const chance = a.probability_shown ? `<div class="${P}-chance">${t.win_probability({ probability: a.offer.probability })}</div>` : `<div class="${P}-chance"></div>`;
    return renderScreen(
      `<div class="${P}-choice">${chance}<div class="${P}-cards">${card("easy")}${card(
      "hard"
    )}</div></div>`,
      (_a = a.below) != null ? _a : ""
    );
  }
  function renderEffort(a) {
    const pct = Math.min(100, 100 * a.count / a.required);
    const bar = a.progress_indicator === "progress_bar" ? `<div class="${P}-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${a.required}" aria-valuenow="${a.count}"><div class="${P}-bar-fill" style="width:${pct}%"></div></div>` : "";
    const counter = a.progress_indicator === "counter" ? `<div class="${P}-count">${a.counter_text(a.count, a.required)}</div>` : "";
    return renderScreen(`<div class="${P}-effort">${bar}${counter}</div>`, a.prompt);
  }
  function updateEffort(root, a) {
    const fill = root.querySelector(`.${P}-bar-fill`);
    if (fill) fill.style.width = `${Math.min(100, 100 * a.count / a.required)}%`;
    const bar = root.querySelector(`.${P}-bar`);
    if (bar) bar.setAttribute("aria-valuenow", String(a.count));
    const count = root.querySelector(`.${P}-count`);
    if (count) count.textContent = a.counter_text(a.count, a.required);
  }

  // src/plugin.ts
  var info = {
    name: EFFORT_PLUGIN_NAME,
    version,
    parameters: {
      /** Keys that count as presses (event.key values; " " is the space bar). */
      keys: { type: ParameterType.KEYS, default: void 0 },
      /** Presses needed to complete the trial. */
      required_presses: { type: ParameterType.INT, default: void 0 },
      /** Time allowed, in ms, from the start of the screen. */
      time_limit: { type: ParameterType.INT, default: void 0 },
      /** "progress_bar", "counter" or "none". */
      progress_indicator: { type: ParameterType.STRING, default: "progress_bar" },
      /** HTML shown below the progress display. */
      prompt: { type: ParameterType.HTML_STRING, default: "" },
      /** Text of the counter: `(count, required) => string`. */
      counter_text: {
        type: ParameterType.FUNCTION,
        default: (count, required) => `${count} / ${required}`
      }
    },
    data: {
      /** Number of presses made. */
      press_count: { type: ParameterType.INT },
      /** Time of every press, ms from the start of the screen. */
      press_times: { type: ParameterType.INT, array: true },
      /** Whether the required number of presses was reached within the time limit. */
      completed: { type: ParameterType.BOOL },
      /** Time to the last required press, or the time limit when the target was not reached. */
      task_duration_ms: { type: ParameterType.INT },
      /** Time of the first press, or null if there was none. */
      rt: { type: ParameterType.INT },
      required_presses: { type: ParameterType.INT },
      time_limit: { type: ParameterType.INT }
    }
  };
  var EffortPressPlugin = class {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      var _a;
      const required = trial.required_presses;
      const limit = trial.time_limit;
      const counter_text = trial.counter_text;
      const indicator = trial.progress_indicator;
      display_element.innerHTML = renderEffort({
        progress_indicator: indicator,
        required,
        count: 0,
        counter_text,
        prompt: (_a = trial.prompt) != null ? _a : ""
      });
      const times = [];
      let ended = false;
      const finish = (completed) => {
        if (ended) return;
        ended = true;
        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
        this.jsPsych.pluginAPI.clearAllTimeouts();
        display_element.innerHTML = "";
        this.jsPsych.finishTrial({
          press_count: times.length,
          press_times: times,
          completed,
          task_duration_ms: completed ? times[times.length - 1] : limit,
          rt: times.length > 0 ? times[0] : null,
          required_presses: required,
          time_limit: limit
        });
      };
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: (press) => {
          if (ended) return;
          times.push(press.rt);
          updateEffort(display_element, {
            progress_indicator: indicator,
            required,
            count: times.length,
            counter_text
          });
          if (times.length >= required) finish(true);
        },
        valid_responses: trial.keys,
        rt_method: "performance",
        persist: true,
        allow_held_key: false
      });
      this.jsPsych.pluginAPI.setTimeout(() => finish(false), limit);
    }
    simulationData(trial, simulation_options) {
      var _a, _b;
      const o = simulation_options != null ? simulation_options : {};
      const required = trial.required_presses;
      const limit = trial.time_limit;
      const rate = (_b = o.press_rate) != null ? _b : simulatePressRate(this.jsPsych, (_a = o.task) != null ? _a : "easy");
      const effectiveLimit = o.force_complete ? null : limit;
      const times = simulatePressTimes(this.jsPsych, required, effectiveLimit, rate);
      const completed = times.length >= required;
      const default_data = {
        press_count: times.length,
        press_times: times,
        completed,
        task_duration_ms: completed ? times[times.length - 1] : limit,
        rt: times.length > 0 ? times[0] : null,
        required_presses: required,
        time_limit: limit
      };
      return this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode === "data-only") {
        load_callback();
        this.jsPsych.finishTrial(this.simulationData(trial, simulation_options));
        return;
      }
      const data = this.simulationData(trial, simulation_options);
      this.trial(this.jsPsych.getDisplayElement(), trial);
      load_callback();
      const key = trial.keys[0];
      for (const t of data.press_times) this.jsPsych.pluginAPI.pressKey(key, t);
    }
  };
  EffortPressPlugin.info = info;
  var plugin_default = EffortPressPlugin;

  // src/scoring.ts
  var ratio = (a, b) => b > 0 ? a / b : null;
  function rewardBin(value, min, max) {
    if (!(max > min)) return "low";
    const third = (max - min) / 3;
    return value < min + third ? "low" : value < min + 2 * third ? "mid" : "high";
  }
  function payoutFor(rule, rows, paid) {
    if (!rule) return null;
    const total = rows.reduce((a, r) => {
      var _a;
      return a + ((_a = r.reward_won) != null ? _a : 0);
    }, 0);
    if (rule === "percent_of_total_5") return Math.round(total * 5) / 100;
    if (rule === "percent_of_total_10") return Math.round(total * 10) / 100;
    if (rule === "two_random_win_trials_paid") {
      if (paid === void 0) return null;
      return paid.reduce(
        (a, i) => {
          var _a, _b;
          return a + ((_b = (_a = rows.find((r) => r.trial_index_in_block === i)) == null ? void 0 : _a.reward_won) != null ? _b : 0);
        },
        0
      );
    }
    return null;
  }
  function calculateScores(data, options = {}) {
    var _a, _b, _c, _d;
    const first_n = (_a = options.first_n) != null ? _a : FIRST_N_TRIALS;
    const trials = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
    const rows = trials.values();
    const free = trials.filterCustom((r) => r.choice === "easy" || r.choice === "hard");
    const hard = (c) => c.filter({ choice: "hard" }).count();
    const prop = (c) => ({
      n_valid_choices: c.count(),
      proportion_hard: ratio(hard(c), c.count())
    });
    const probabilities = [...new Set(rows.map((r) => r.win_probability))].sort(
      (a, b) => a - b
    );
    const rewards = rows.map((r) => r.hard_reward);
    const lo = rewards.length ? Math.min(...rewards) : 0;
    const hi = rewards.length ? Math.max(...rewards) : 0;
    const third = (hi - lo) / 3;
    const inBin = (bin) => (r) => rewardBin(r.hard_reward, lo, hi) === bin;
    const binRange = (bin) => {
      const i = REWARD_BINS.indexOf(bin);
      return { min: lo + i * third, max: i === 2 ? hi : lo + (i + 1) * third };
    };
    const done = (task) => trials.filter({ chosen_task: task });
    const completionRate = (c) => ratio(c.filter({ completed: true }).count(), c.count());
    const pressRate = (c) => {
      const usable = c.filterCustom((r) => r.task_duration_ms > 0);
      if (usable.count() === 0) return null;
      return usable.select("press_count").sum() / (usable.select("task_duration_ms").sum() / 1e3);
    };
    const completion = data.filter({ task: TASK_NAME, part: "completion" }).values()[0];
    const rule = (_c = (_b = options.payout_rule) != null ? _b : completion == null ? void 0 : completion.payout_rule) != null ? _c : null;
    const paid = (_d = options.paid_trials) != null ? _d : completion == null ? void 0 : completion.paid_trials;
    const chosenEv = free.values().map((r) => r.win_probability * (r.choice === "hard" ? r.hard_reward : r.easy_reward));
    const firstN = free.filterCustom((r) => r.trial_index_in_block <= first_n);
    return {
      n_trials: trials.count(),
      n_forced: trials.filter({ choice_forced: true }).count(),
      n_valid_choices: free.count(),
      n_hard_chosen: hard(free),
      proportion_hard: ratio(hard(free), free.count()),
      proportion_hard_first_n: ratio(hard(firstN), firstN.count()),
      first_n,
      proportion_hard_by_probability: probabilities.map((p) => __spreadValues({
        probability: p
      }, prop(free.filter({ win_probability: p })))),
      proportion_hard_by_reward_bin: REWARD_BINS.map((bin) => __spreadValues(__spreadValues({
        bin
      }, binRange(bin)), prop(free.filterCustom(inBin(bin))))),
      proportion_hard_by_probability_and_reward_bin: probabilities.flatMap(
        (p) => REWARD_BINS.map((bin) => __spreadValues({
          probability: p,
          bin
        }, prop(free.filter({ win_probability: p }).filterCustom(inBin(bin)))))
      ),
      mean_expected_value_chosen: chosenEv.length ? chosenEv.reduce((a, b) => a + b, 0) / chosenEv.length : null,
      n_easy_tasks: done("easy").count(),
      n_hard_tasks: done("hard").count(),
      n_completed: trials.filter({ completed: true }).count(),
      completion_rate: completionRate(trials),
      completion_rate_easy: completionRate(done("easy")),
      completion_rate_hard: completionRate(done("hard")),
      mean_press_rate_easy: pressRate(done("easy")),
      mean_press_rate_hard: pressRate(done("hard")),
      n_wins: trials.filterCustom((r) => r.reward_won > 0).count(),
      total_reward: Math.round(rows.reduce((a, r) => {
        var _a2;
        return a + ((_a2 = r.reward_won) != null ? _a2 : 0);
      }, 0) * 100) / 100,
      payout: payoutFor(rule, rows, paid),
      payout_rule: rule
    };
  }
  function getSummary(data, options = {}) {
    const s = calculateScores(data, options);
    return {
      n_trials: s.n_trials,
      proportion_hard: s.proportion_hard,
      proportion_hard_first_n: s.proportion_hard_first_n,
      completion_rate: s.completion_rate,
      completion_rate_hard: s.completion_rate_hard,
      total_reward: s.total_reward,
      payout: s.payout
    };
  }

  // src/text.ts
  var NAMED_KEYS = {
    " ": "space",
    ArrowLeft: "left arrow",
    ArrowRight: "right arrow",
    ArrowUp: "up arrow",
    ArrowDown: "down arrow",
    Enter: "Enter"
  };
  var joinList = (xs) => xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
  var plural = (n, one, many) => n === 1 ? one : many;
  var secs = (s) => `${Number.isInteger(s) ? s : s.toFixed(1)} ${plural(s, "second", "seconds")}`;
  var presses = (n) => `${n} ${plural(n, "press", "presses")}`;
  var defaultText = {
    continue_button: "Continue",
    ok_button: "OK",
    fixation: "+",
    amount: ({ value, outcome_type }) => outcome_type === "points" ? `${Number.isInteger(value) ? value : value.toFixed(2)} ${value === 1 ? "point" : "points"}` : `$${value.toFixed(2)}`,
    key_name: (key) => {
      var _a;
      return (_a = NAMED_KEYS[key]) != null ? _a : key.length === 1 ? key.toUpperCase() : key;
    },
    task_title: ({ task }) => task === "easy" ? "Easy task" : "Hard task",
    win_probability: ({ probability }) => `${Math.round(probability * 100)}% chance of winning`,
    effort_requirement: ({ presses: n, seconds: seconds2 }) => `${presses(n)} in ${secs(seconds2)}`,
    choice_key_label: ({ key }) => `Press ${key}`,
    reward_line: ({ amount }) => `Reward: ${amount}`,
    ready_text: ({ task }) => task === "easy" ? "Get ready: easy task" : "Get ready: hard task",
    effort_prompt: ({ key, finger }) => `Press ${key} as fast as you can, ${finger}.`,
    effort_counter: ({ count, required }) => `${count} / ${required}`,
    finger_instruction: ({ task }) => task === "easy" ? "with the index finger of your dominant hand" : "with the little finger of your non-dominant hand",
    assigned_notice: ({ task, reason }) => reason === "timeout" ? `You did not choose in time, so the ${task} task was picked for you.` : `The ${task} task is assigned on this trial.`,
    feedback_completed: "Task completed",
    feedback_not_completed: "Task not completed",
    reward_win: ({ amount }) => `You win ${amount}`,
    reward_no_win: "No win on this trial",
    reward_not_completed: "No reward: the task was not completed",
    instruction_intro: (f) => `<p>On every trial you choose between two tasks, an easy one and a hard one. Both are the same kind of task: press a key again and again, as fast as you can, to fill a bar. The easy task needs fewer presses than the hard task and pays less.</p>`,
    instruction_tasks: (f) => f.same_effort_key ? `<p>Both tasks use the same key, ${f.easy_effort_key}.</p><p><strong>Easy task:</strong> ${presses(f.easy_presses)} in ${secs(f.easy_seconds)}, ${f.easy_finger}.</p><p><strong>Hard task:</strong> ${presses(f.hard_presses)} in ${secs(f.hard_seconds)}, ${f.hard_finger}.</p>` : `<p><strong>Easy task:</strong> press ${f.easy_effort_key} ${f.easy_presses} times in ${secs(f.easy_seconds)}, ${f.easy_finger}.</p><p><strong>Hard task:</strong> press ${f.hard_effort_key} ${f.hard_presses} times in ${secs(f.hard_seconds)}, ${f.hard_finger}.</p>`,
    instruction_rewards: (f) => `<p>Completing a task can win a reward. The easy task is worth ${f.easy_reward}. ` + (f.hard_reward_varies ? `The hard task is worth more, and its value changes from trial to trial: ${f.hard_reward}.</p>` : `The hard task is worth ${f.hard_reward}.</p>`),
    instruction_chance: (f) => f.probability_shown ? `<p>Winning is not certain. Before you choose, you are told the chance that the trial pays out (${joinList(
    f.probabilities
  )}). The chance is the same for both tasks. You win only if you complete the task <em>and</em> the trial turns out to be a winning trial.</p>` : `<p>You win the reward whenever you complete the task.</p>`,
    instruction_choice: (f) => `<p>Choose the easy task by pressing ${f.easy_choice_key} and the hard task by pressing ${f.hard_choice_key}.` + (f.choice_seconds === null ? ` Take your time to choose.</p>` : ` You have ${secs(
    f.choice_seconds
  )} to choose. If you do not choose in time, the computer picks a task at random for that trial.</p>`),
    instruction_session_length: (f) => {
      var _a;
      return f.task_end_rule === "fixed_time" ? `<p>The task lasts ${f.session_minutes} ${plural(
      (_a = f.session_minutes) != null ? _a : 0,
      "minute",
      "minutes"
    )} in total. The hard task takes longer than the easy task, so choosing it means fewer trials in that time. The task ends when the time is up.</p>` : `<p>There are ${f.n_trials} trials in all.</p>`;
    },
    instruction_payout: (f) => f.payout_rule === "percent_of_total_5" ? `<p>At the end you receive 5% of the total you won.</p>` : f.payout_rule === "percent_of_total_10" ? `<p>At the end you receive 10% of the total you won.</p>` : `<p>At the end, two of the trials you won are picked at random, and you receive the rewards of those two trials.</p>`,
    instruction_demo_intro: () => `<p>Next you try the parts of a trial, one at a time: choosing, and then the easy task. Nothing here is rewarded.</p>`,
    instruction_practice_intro: (f) => `<p>Now you practise. From here on, trials run at the real pace of the task: a fixation mark, the choice` + (f.choice_seconds === null ? `` : ` (${secs(f.choice_seconds)} to choose)`) + `, a ready screen, and then the pressing.</p>` + (f.practice_forced_tasks.length > 0 ? `<p>On the first ${plural(
    f.practice_forced_tasks.length,
    "practice trial",
    `${f.practice_forced_tasks.length} practice trials`
  )} the task is assigned to you (${joinList(
    f.practice_forced_tasks
  )}), so you feel both. After that you choose.</p>` : ``) + `<p>Practice rewards are not paid. The main task starts after the ${f.practice_trials} practice ${plural(f.practice_trials, "trial", "trials")}.</p>`,
    instruction_test_intro: (f) => {
      var _a;
      return `<p>The practice is over. Now the main task begins. ` + (f.task_end_rule === "fixed_time" ? `It runs for ${f.session_minutes} ${plural((_a = f.session_minutes) != null ? _a : 0, "minute", "minutes")}.` : `There are ${f.n_trials} trials.`) + ` Rewards now count.</p>`;
    },
    demo_choose: ({ wanted, wanted_key }) => `Choose the <strong>${wanted}</strong> task: press ${wanted_key}.` + (wanted === "hard" ? ` You will not have to do it now.` : ``),
    demo_choose_hint: ({ wanted, wanted_key }) => `That chose the ${wanted === "easy" ? "hard" : "easy"} task. This time press ${wanted_key} to choose the <strong>${wanted}</strong> task.`,
    demo_choose_reveal: ({ wanted, wanted_key }) => `The ${wanted} task is chosen with ${wanted_key}. On to the next step.`,
    demo_effort: (f) => `Try the easy task: press ${f.easy_effort_key} ${f.easy_presses} times in ${secs(
    f.easy_seconds
  )}, ${f.easy_finger}.`,
    demo_effort_hint: (f) => `The bar did not fill in time. Press ${f.easy_effort_key} faster: ${presses(
    f.easy_presses
  )} in ${secs(f.easy_seconds)}.`,
    demo_effort_reveal: () => `That is fine. You will practise the tasks next.`,
    instruction_correct: "Good!",
    device_not_supported: "This task needs a physical keyboard for rapid key pressing. Please open it on a computer.",
    task_complete: "Task complete",
    result_summary: (r) => `<p>You completed ${r.n_completed} of ${r.n_trials} trials and won on ${r.n_wins}.</p>` + (r.proportion_hard !== null ? `<p>You chose the hard task on ${Math.round(
    r.proportion_hard * 100
  )}% of the trials you chose (${r.n_hard_chosen} of ${r.n_valid_choices}).</p>` : ``) + `<p>${r.payout_rule === "percent_of_total_5" ? "5% of your total" : r.payout_rule === "percent_of_total_10" ? "10% of your total" : "Two winning trials picked at random"}: ${r.payout}.</p>`
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
  styleInject(".jspsych-timelines-eefrt .jspsych-timelines-eefrt-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-text h2 {\n  text-align: center;\n  font-size: 1em;\n}\n.jspsych-timelines-eefrt {\n  --eefrt-stage-h: max(min(280px, 40vh), 200px);\n  --eefrt-stage-w: 640px;\n  --eefrt-btn-reserve: 64px;\n}\n.jspsych-timelines-eefrt:has(.jspsych-timelines-eefrt-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-screen {\n  display: contents;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: var(--eefrt-stage-w);\n  max-width: calc(100vw - 16px);\n  height: var(--eefrt-stage-h);\n  padding: 10px;\n  overflow: hidden;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-below {\n  position: absolute;\n  top: calc(50% + var(--eefrt-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-below .jspsych-timelines-eefrt-text {\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-below p {\n  margin: 0.4em 0;\n}\n.jspsych-timelines-eefrt:has(#jspsych-html-button-response-btngroup) .jspsych-timelines-eefrt-below {\n  bottom: var(--eefrt-btn-reserve);\n}\n.jspsych-timelines-eefrt:has(.jspsych-timelines-eefrt-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-center {\n  text-align: center;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-center.win,\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-center.not-completed {\n  font-weight: bold;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-fixation-layer {\n  position: absolute;\n  top: 50%;\n  right: 0;\n  left: 0;\n  height: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-fixation {\n  font-size: 3em;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-choice {\n  display: flex;\n  flex-direction: column;\n  align-items: stretch;\n  gap: 10px;\n  width: 100%;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-chance {\n  min-height: 1.4em;\n  text-align: center;\n  font-weight: bold;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-cards {\n  display: flex;\n  gap: 12px;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-card {\n  flex: 1 1 0;\n  min-width: 0;\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  padding: 10px 8px;\n  text-align: center;\n  border: 2px solid currentColor;\n  border-radius: 8px;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-card-title {\n  font-weight: bold;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-effort {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n  width: 100%;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-bar {\n  box-sizing: border-box;\n  width: min(100%, 480px);\n  height: 32px;\n  border: 2px solid currentColor;\n  border-radius: 6px;\n  overflow: hidden;\n}\n.jspsych-timelines-eefrt .jspsych-timelines-eefrt-bar-fill {\n  height: 100%;\n  background: currentColor;\n}\n.jspsych-timelines-eefrt kbd {\n  font-family: inherit;\n  font-size: 1em;\n  padding: 0 0.35em;\n  border: 1px solid currentColor;\n  border-radius: 4px;\n}\n");

  // ../../node_modules/@jspsych/plugin-html-button-response/dist/index.js
  var version2 = "2.1.0";
  var info2 = {
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
  _HtmlButtonResponsePlugin.info = info2;
  var HtmlButtonResponsePlugin = _HtmlButtonResponsePlugin;

  // ../../node_modules/@jspsych/plugin-html-keyboard-response/dist/index.js
  var version3 = "2.1.0";
  var info3 = {
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
  _HtmlKeyboardResponsePlugin.info = info3;
  var HtmlKeyboardResponsePlugin = _HtmlKeyboardResponsePlugin;

  // src/trials.ts
  function createContext(jsPsych, options = {}) {
    const text = __spreadValues(__spreadValues({}, defaultText), options.text);
    const test = resolveOptions(options, "test");
    const practice = resolveOptions(options, "practice");
    validateOptions(test);
    validateOptions(practice);
    if (test.trial_order === "fixed_sequence" && "uniform" in test.reward_magnitude.hard) {
      throw new Error(
        'eefrt: trial_order "fixed_sequence" cannot be combined with a per-trial uniform hard reward (it would draw random numbers, so the sequence would differ between participants); use "shuffled_list" or "random".'
      );
    }
    return {
      jsPsych,
      text,
      user: options,
      practice,
      test,
      state: {
        plan: null,
        stream: null,
        n_trials: 0,
        elapsed_ms: 0,
        wall_start: null,
        last_reward: 0
      }
    };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
  var kbd = (ctx, key) => `<kbd>${ctx.text.key_name(normaliseKey(key))}</kbd>`;
  var effortKey = (o, task) => normaliseKey(o.response_key_mapping[task]);
  var percent = (p) => `${Math.round(p * 100)}%`;
  var seconds = (ms) => ms / 1e3;
  function taskFacts(ctx, o = ctx.test) {
    const amount = (value) => ctx.text.amount({ value, outcome_type: outcomeKind(o) });
    const range = rewardRange(o.reward_magnitude.hard);
    const probs = [...o.reward_probability].sort((a, b) => a - b);
    const sameKey = effortKey(o, "easy") === effortKey(o, "hard");
    return {
      outcome_type: outcomeKind(o),
      easy_presses: o.difficulty_levels.easy,
      hard_presses: o.difficulty_levels.hard,
      easy_seconds: seconds(o.response_window_ms.easy),
      hard_seconds: seconds(o.response_window_ms.hard),
      easy_effort_key: kbd(ctx, o.response_key_mapping.easy),
      hard_effort_key: kbd(ctx, o.response_key_mapping.hard),
      same_effort_key: sameKey,
      easy_finger: ctx.text.finger_instruction({ task: "easy" }),
      hard_finger: ctx.text.finger_instruction({ task: "hard" }),
      easy_choice_key: kbd(ctx, o.response_keys[0]),
      hard_choice_key: kbd(ctx, o.response_keys[1]),
      easy_reward: amount(o.reward_magnitude.easy),
      hard_reward: range.min === range.max ? amount(range.min) : `${amount(range.min)} to ${amount(range.max)}`,
      hard_reward_varies: range.min !== range.max,
      probabilities: probs.map(percent),
      probability_shown: !(probs.length === 1 && probs[0] === 1),
      choice_seconds: o.response_window_ms.choice === null ? null : seconds(o.response_window_ms.choice),
      task_end_rule: o.task_end_rule,
      session_minutes: o.session_duration_min,
      n_trials: o.task_end_rule === "fixed_trial_count" ? o.n_test_trials : null,
      payout_rule: o.payout_rule,
      practice_forced_tasks: [...o.practice_forced_tasks],
      practice_trials: o.practice_trials,
      progress_indicator: o.progress_indicator
    };
  }
  function outcomeKind(o) {
    return o.outcome_type === "points" ? "points" : "money";
  }
  function sumMs(d) {
    return d.completion + d.reward;
  }
  function sessionClock(ctx) {
    const wall = ctx.state.wall_start === null ? 0 : performance.now() - ctx.state.wall_start;
    return Math.max(ctx.state.elapsed_ms, wall);
  }
  function planDuration(p) {
    var _a, _b;
    const choice = p.forced_task !== null ? 0 : (_b = (_a = p.choice_rt) != null ? _a : p.o.response_window_ms.choice) != null ? _b : 0;
    return p.fixation_ms + choice + p.ready_ms + p.task_duration_ms + sumMs({ completion: p.completion_ms, reward: p.reward_ms });
  }
  function newPlan(ctx, phase) {
    var _a;
    const o = phase === "practice" ? ctx.practice : ctx.test;
    const s = ctx.state;
    s.n_trials += 1;
    const R = ctx.jsPsych;
    const forced = phase === "practice" ? (_a = o.practice_forced_tasks[s.n_trials - 1]) != null ? _a : null : null;
    return {
      phase,
      o,
      trial_index_in_block: s.n_trials,
      offer: s.stream.next(),
      forced_task: forced,
      fixation_ms: sampleDuration(R, o.fixation_duration_ms),
      ready_ms: sampleDuration(R, o.pre_block_countdown_ms),
      completion_ms: sampleDuration(R, o.feedback_duration_ms.completion),
      reward_ms: sampleDuration(R, o.feedback_duration_ms.reward),
      session_elapsed_ms: phase === "test" ? Math.round(sessionClock(ctx)) : 0,
      choice: "none",
      choice_rt: null,
      choice_forced: forced !== null,
      forced_by: forced !== null ? "practice" : null,
      chosen_task: forced,
      press_count: 0,
      completed: false,
      task_duration_ms: 0,
      reward_won: 0
    };
  }
  var plan = (ctx) => ctx.state.plan;
  function createDisplayTrial(a) {
    var _a;
    return {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: a.stimulus,
      choices: "NO_KEYS",
      trial_duration: a.duration,
      data: baseData(__spreadValues(__spreadValues({
        phase: a.phase,
        part: a.part
      }, a.phase === "instructions" ? {} : { block: 1 }), (_a = a.data) != null ? _a : {})),
      on_finish: (d) => {
        var _a2;
        delete d.stimulus;
        (_a2 = a.finish) == null ? void 0 : _a2.call(a, d);
      }
    };
  }
  var rowFields = (p) => ({
    trial_index_in_block: p.trial_index_in_block,
    win_probability: p.offer.probability,
    hard_reward: p.offer.hard_reward,
    easy_reward: p.offer.easy_reward
  });
  var when = (condition, node) => ({
    timeline: [node],
    conditional_function: condition
  });
  function createFixation(ctx, phase) {
    return when(
      () => plan(ctx).fixation_ms > 0,
      createDisplayTrial({
        phase,
        part: "fixation",
        stimulus: () => renderFixation(ctx.text),
        duration: () => plan(ctx).fixation_ms,
        finish: (d) => {
          const p = plan(ctx);
          d.trial_index_in_block = p.trial_index_in_block;
          d.duration_ms = p.fixation_ms;
          d.fixation_duration = p.fixation_ms;
        }
      })
    );
  }
  function choiceArgs(ctx, o, offer, below = "") {
    const f = taskFacts(ctx, o);
    return {
      offer,
      text: ctx.text,
      outcome_type: f.outcome_type,
      easy_presses: f.easy_presses,
      hard_presses: f.hard_presses,
      easy_seconds: f.easy_seconds,
      hard_seconds: f.hard_seconds,
      easy_key: f.easy_choice_key,
      hard_key: f.hard_choice_key,
      probability_shown: f.probability_shown,
      below
    };
  }
  function taskOfKey(o, key) {
    if (typeof key !== "string") return null;
    const k = key.toLowerCase();
    if (k === o.response_keys[0].toLowerCase()) return "easy";
    if (k === o.response_keys[1].toLowerCase()) return "hard";
    return null;
  }
  function createChoice(ctx, phase) {
    const node = {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const p = plan(ctx);
        return renderChoice(choiceArgs(ctx, p.o, p.offer));
      },
      choices: [...(phase === "practice" ? ctx.practice : ctx.test).response_keys],
      trial_duration: (() => plan(ctx).o.response_window_ms.choice),
      data: baseData({ phase, part: "choice", block: 1 }),
      // data-only simulation: a logistic choice that rises with probability and reward (simulation.ts)
      simulation_options: () => {
        const p = plan(ctx);
        const sim = simulateChoice(ctx.jsPsych, p.offer, p.o.response_window_ms.choice);
        const key = sim.task === "easy" ? p.o.response_keys[0] : sim.task === "hard" ? p.o.response_keys[1] : null;
        if (hasForcedRt(ctx.jsPsych)) return key === null ? {} : { data: { response: key } };
        return { data: { response: key, rt: sim.rt } };
      },
      on_finish: (d) => {
        const p = plan(ctx);
        delete d.stimulus;
        const chosen = taskOfKey(p.o, d.response);
        const timeout = chosen === null;
        if (timeout) {
          d.response = null;
          d.rt = null;
        }
        p.choice_rt = timeout ? null : d.rt;
        p.choice = chosen != null ? chosen : "none";
        if (timeout) {
          p.choice_forced = true;
          p.forced_by = "timeout";
          p.chosen_task = ctx.jsPsych.randomization.sampleWithoutReplacement(
            ["easy", "hard"],
            1
          )[0];
        } else {
          p.chosen_task = chosen;
        }
        Object.assign(d, rowFields(p), {
          timeout,
          choice: p.choice,
          choice_forced: p.choice_forced,
          forced_by: p.forced_by,
          chosen_task: p.chosen_task,
          response_window: p.o.response_window_ms.choice,
          response_keys: [...p.o.response_keys]
        });
      }
    };
    return when(() => plan(ctx).forced_task === null, node);
  }
  function assignedNotice(ctx, p) {
    return p.choice_forced && p.forced_by !== null ? `<p>${ctx.text.assigned_notice({ task: p.chosen_task, reason: p.forced_by })}</p>` : "";
  }
  function createReady(ctx, phase) {
    return when(
      () => plan(ctx).ready_ms > 0,
      createDisplayTrial({
        phase,
        part: "ready",
        stimulus: () => {
          const p = plan(ctx);
          return renderCenterText(
            ctx.text.ready_text({ task: p.chosen_task }),
            "ready",
            assignedNotice(ctx, p)
          );
        },
        duration: () => plan(ctx).ready_ms,
        finish: (d) => {
          const p = plan(ctx);
          d.trial_index_in_block = p.trial_index_in_block;
          d.duration_ms = p.ready_ms;
          d.chosen_task = p.chosen_task;
        }
      })
    );
  }
  function effortParams(ctx, o, task, prompt) {
    return {
      keys: [effortKey(o, task)],
      required_presses: o.difficulty_levels[task],
      time_limit: o.response_window_ms[task],
      progress_indicator: o.progress_indicator,
      prompt,
      counter_text: (count, required) => ctx.text.effort_counter({ count, required })
    };
  }
  function effortPrompt(ctx, o, task, notice = "") {
    return notice + `<p>${ctx.text.effort_prompt({
    key: kbd(ctx, o.response_key_mapping[task]),
    finger: ctx.text.finger_instruction({ task }),
    task
  })}</p>`;
  }
  function createEffort(ctx, phase) {
    const lazy = (k) => () => {
      const p = plan(ctx);
      return effortParams(
        ctx,
        p.o,
        p.chosen_task,
        effortPrompt(ctx, p.o, p.chosen_task, assignedNotice(ctx, p))
      )[k];
    };
    return {
      type: plugin_default,
      css_classes: [TASK_CLASS],
      keys: lazy("keys"),
      required_presses: lazy("required_presses"),
      time_limit: lazy("time_limit"),
      progress_indicator: lazy("progress_indicator"),
      prompt: lazy("prompt"),
      counter_text: (count, required) => ctx.text.effort_counter({ count, required }),
      data: baseData({ phase, part: "response", block: 1 }),
      // data-only simulation: press rates drawn for the chosen task (simulation.ts)
      simulation_options: () => ({ task: plan(ctx).chosen_task }),
      on_finish: (d) => {
        const p = plan(ctx);
        const task = p.chosen_task;
        const amount = (value) => ctx.text.amount({ value, outcome_type: outcomeKind(p.o) });
        p.press_count = d.press_count;
        p.completed = d.completed === true;
        p.task_duration_ms = typeof d.task_duration_ms === "number" ? d.task_duration_ms : p.o.response_window_ms[task];
        const reward = task === "easy" ? p.offer.easy_reward : p.offer.hard_reward;
        p.reward_won = p.completed && p.offer.win ? reward : 0;
        Object.assign(d, rowFields(p), {
          win: p.offer.win,
          choice: p.choice,
          choice_forced: p.choice_forced,
          forced_by: p.forced_by,
          chosen_task: task,
          choice_rt: p.choice_rt,
          effort_key: effortKey(p.o, task),
          response_window: p.o.response_window_ms[task],
          progress_indicator: p.o.progress_indicator,
          reward_won: p.reward_won,
          reward_won_prev: ctx.state.last_reward,
          session_elapsed_ms: p.session_elapsed_ms,
          easy_reward_text: amount(p.offer.easy_reward),
          hard_reward_text: amount(p.offer.hard_reward)
        });
        delete d.time_limit;
        ctx.state.last_reward = p.reward_won;
      }
    };
  }
  function createFeedback(ctx, phase, stage) {
    const part = `${stage}_feedback`;
    const ms = (p) => stage === "completion" ? p.completion_ms : p.reward_ms;
    return when(
      () => ms(plan(ctx)) > 0,
      createDisplayTrial({
        phase,
        part,
        stimulus: () => {
          const p = plan(ctx);
          if (stage === "completion") {
            return renderCenterText(
              p.completed ? ctx.text.feedback_completed : ctx.text.feedback_not_completed,
              p.completed ? "completed" : "not-completed"
            );
          }
          const amount = ctx.text.amount({ value: p.reward_won, outcome_type: outcomeKind(p.o) });
          return renderCenterText(
            p.reward_won > 0 ? ctx.text.reward_win({ amount }) : p.completed ? ctx.text.reward_no_win : ctx.text.reward_not_completed,
            p.reward_won > 0 ? "win" : "no-win"
          );
        },
        duration: () => ms(plan(ctx)),
        finish: (d) => {
          const p = plan(ctx);
          d.trial_index_in_block = p.trial_index_in_block;
          d.feedback_stage = stage;
          d.duration_ms = ms(p);
          d.feedback_duration = ms(p);
          if (stage === "reward") d.reward_won = p.reward_won;
        }
      })
    );
  }
  function createTrialLoop(ctx, phase) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    const nodes = [
      createFixation(ctx, phase),
      createChoice(ctx, phase),
      createReady(ctx, phase),
      createEffort(ctx, phase),
      createFeedback(ctx, phase, "completion"),
      createFeedback(ctx, phase, "reward")
    ];
    const more = () => {
      const n = ctx.state.n_trials;
      if (phase === "practice") return n < o.practice_trials;
      if (o.task_end_rule === "fixed_trial_count") return n < o.n_test_trials;
      if (n >= MAX_SESSION_TRIALS) return false;
      return sessionClock(ctx) < o.session_duration_min * 6e4;
    };
    return {
      timeline: nodes,
      on_timeline_start: () => {
        const s = ctx.state;
        s.n_trials = 0;
        s.elapsed_ms = 0;
        s.last_reward = 0;
        s.wall_start = phase === "test" ? performance.now() : null;
        s.stream = new OfferStream(ctx.jsPsych, o, phase === "practice" ? "random" : o.trial_order);
        s.plan = newPlan(ctx, phase);
      },
      loop_function: () => {
        const p = plan(ctx);
        if (phase === "test") ctx.state.elapsed_ms += planDuration(p);
        if (!more()) return false;
        ctx.state.plan = newPlan(ctx, phase);
        return true;
      }
    };
  }
  function textPage(ctx, html, phase, part, label) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: `<div class="${P}-text">${html}</div>`,
      choices: [label != null ? label : ctx.text.continue_button],
      data: baseData({ phase, part })
    };
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const f = taskFacts(ctx, o);
    const pages = [
      t.instruction_intro(f),
      t.instruction_tasks(f),
      t.instruction_rewards(f),
      t.instruction_chance(f),
      t.instruction_choice(f),
      t.instruction_session_length(f),
      t.instruction_payout(f)
    ];
    return { timeline: pages.map((html) => textPage(ctx, html, "instructions", "instruction")) };
  }
  function createPracticeIntro(ctx) {
    return textPage(
      ctx,
      ctx.text.instruction_practice_intro(taskFacts(ctx, ctx.practice)),
      "instructions",
      "instruction"
    );
  }
  function createTestIntro(ctx) {
    return textPage(
      ctx,
      ctx.text.instruction_test_intro(taskFacts(ctx, ctx.test)),
      "instructions",
      "instruction"
    );
  }
  function demoOffer(o) {
    const probs = [...o.reward_probability].sort((a, b) => a - b);
    const r = rewardRange(o.reward_magnitude.hard);
    return {
      probability: probs[Math.floor((probs.length - 1) / 2)],
      hard_reward: round2((r.min + r.max) / 2),
      easy_reward: o.reward_magnitude.easy,
      win: true,
      cell: null
    };
  }
  function createInstructionWalkthrough(ctx) {
    const o = ctx.test;
    if (o.instruction_format !== "text" || o.instruction_demonstration === "none") {
      return { timeline: [] };
    }
    const t = ctx.text;
    const f = taskFacts(ctx, o);
    const offer = demoOffer(o);
    const nodes = [textPage(ctx, t.instruction_demo_intro(f), "instructions", "instruction")];
    const steps = [
      { kind: "choose", wanted: "easy" },
      { kind: "choose", wanted: "hard" },
      { kind: "effort", wanted: "easy" }
    ];
    const caption = (html) => html;
    for (const step of steps) {
      const state = { attempt: 0, correct: null };
      const wantedKey = step.kind === "choose" ? step.wanted === "easy" ? f.easy_choice_key : f.hard_choice_key : "";
      const stepName = step.kind === "choose" ? `choose_${step.wanted}` : `effort_${step.wanted}`;
      const stepData = {
        phase: "instructions",
        step: stepName,
        win_probability: offer.probability,
        hard_reward: offer.hard_reward,
        easy_reward: offer.easy_reward
      };
      let response;
      if (step.kind === "choose") {
        const wantedIndex = step.wanted === "easy" ? 0 : 1;
        response = {
          type: HtmlKeyboardResponsePlugin,
          css_classes: [TASK_CLASS],
          stimulus: () => renderChoice(
            choiceArgs(
              ctx,
              o,
              offer,
              caption(t.demo_choose({ wanted: step.wanted, wanted_key: wantedKey }))
            )
          ),
          choices: [...o.response_keys],
          trial_duration: null,
          data: baseData(__spreadProps(__spreadValues({}, stepData), {
            part: "instruction_check",
            correct_response: o.response_keys[wantedIndex]
          })),
          // data-only simulation answers correctly
          simulation_options: { data: { response: o.response_keys[wantedIndex], rt: 800 } },
          on_finish: (d) => {
            delete d.stimulus;
            const chosen = taskOfKey(o, d.response);
            state.attempt++;
            state.correct = chosen === step.wanted;
            d.choice = chosen != null ? chosen : "none";
            d.correct = state.correct;
            d.attempt = state.attempt;
          }
        };
      } else {
        response = __spreadProps(__spreadValues({
          type: plugin_default,
          css_classes: [TASK_CLASS]
        }, effortParams(ctx, o, "easy", `<p>${t.demo_effort(f)}</p>`)), {
          data: baseData(__spreadProps(__spreadValues({}, stepData), { part: "instruction_check" })),
          simulation_options: { task: "easy", force_complete: true },
          on_finish: (d) => {
            state.attempt++;
            state.correct = d.completed === true;
            d.correct = state.correct;
            d.attempt = state.attempt;
            d.effort_key = effortKey(o, "easy");
            delete d.time_limit;
          }
        });
      }
      const shownChoice = (html) => renderChoice(choiceArgs(ctx, o, offer, html));
      const note = (html, kind) => ({
        type: HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => step.kind === "choose" ? shownChoice(`<p>${html}</p>`) : renderCenterText(html),
        choices: [t.continue_button],
        data: baseData(__spreadProps(__spreadValues({}, stepData), { part: "instruction_feedback", feedback_kind: kind })),
        on_finish: (d) => {
          delete d.stimulus;
        }
      });
      const confirm = createDisplayTrial({
        phase: "instructions",
        part: "instruction_feedback",
        stimulus: () => step.kind === "choose" ? shownChoice(`<p><strong>${t.instruction_correct}</strong></p>`) : renderCenterText(`<strong>${t.instruction_correct}</strong>`),
        duration: () => INSTRUCTION_CORRECT_MS,
        data: __spreadProps(__spreadValues({}, stepData), { feedback_kind: "correct" })
      });
      const hintText = step.kind === "choose" ? t.demo_choose_hint({ wanted: step.wanted, wanted_key: wantedKey }) : t.demo_effort_hint(f);
      const revealText = step.kind === "choose" ? t.demo_choose_reveal({ wanted: step.wanted, wanted_key: wantedKey }) : t.demo_effort_reveal(f);
      const again = () => state.correct === false && state.attempt < INSTRUCTION_MAX_ATTEMPTS;
      nodes.push({
        timeline: [
          response,
          { timeline: [confirm], conditional_function: () => state.correct === true },
          { timeline: [note(hintText, "hint")], conditional_function: again },
          {
            timeline: [note(revealText, "reveal")],
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
  function choosePaidTrials(ctx, rows) {
    if (ctx.test.payout_rule !== "two_random_win_trials_paid") return [];
    const won = rows.filter((r) => r.reward_won > 0).map((r) => r.trial_index_in_block);
    return ctx.jsPsych.randomization.sampleWithoutReplacement(won, Math.min(2, won.length)).sort((a, b) => a - b);
  }
  function createCompletion(ctx, calculate) {
    let paid = [];
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        var _a;
        const rows = ctx.jsPsych.data.get().filter({ task: TASK_NAME, phase: "test", part: "response" }).values();
        paid = choosePaidTrials(ctx, rows);
        const s = calculate(ctx.jsPsych.data.get(), {
          paid_trials: paid,
          payout_rule: ctx.test.payout_rule
        });
        return `<div class="${P}-text"><h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
        n_trials: s.n_trials,
        n_hard_chosen: s.n_hard_chosen,
        n_valid_choices: s.n_valid_choices,
        proportion_hard: s.proportion_hard,
        n_completed: s.n_completed,
        n_wins: s.n_wins,
        payout: ctx.text.amount({ value: (_a = s.payout) != null ? _a : 0, outcome_type: outcomeKind(ctx.test) }),
        payout_rule: ctx.test.payout_rule
      })}</div>`;
      },
      choices: [ctx.text.continue_button],
      data: baseData({ phase: "completion", part: "completion" }),
      on_finish: (d) => {
        const s = calculate(ctx.jsPsych.data.get(), {
          paid_trials: paid,
          payout_rule: ctx.test.payout_rule
        });
        d.payout_rule = ctx.test.payout_rule;
        d.paid_trials = paid;
        d.payout = s.payout;
        delete d.stimulus;
      }
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
    if (o.practice_trials > 0) {
      if (o.instruction_format === "text") timeline.push(createPracticeIntro(ctx));
      timeline.push(createTrialLoop(ctx, "practice"));
    }
    if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));
    timeline.push(createTrialLoop(ctx, "test"));
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
    createDisplayTrial,
    createTrialLoop,
    createCompletion: (ctx) => createCompletion(ctx, calculateScores)
  };
  var utils = {
    scoring: { calculateScores, getSummary, payoutFor, rewardBin },
    constants: {
      TASK_NAME,
      VERSION,
      TASK_CLASS,
      DEFAULT_OPTIONS,
      PHASE_OPTIONS,
      EFFORT_PLUGIN_NAME,
      FIRST_N_TRIALS,
      MAX_SESSION_TRIALS,
      REWARD_BINS,
      SIMULATION
    },
    text: { defaultText },
    stimuli: { renderChoice, renderEffort, renderFixation },
    offers: { OfferStream, rewardLevels, rewardRange, fixedOrder, fixedWin },
    options: { resolveOptions, validateOptions, normaliseKey, taskFacts },
    simulation: { hardChoiceProbability, simulateChoice, simulatePressTimes },
    plugins: { EffortPressPlugin: plugin_default }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map