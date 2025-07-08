var jsPsychTimelineFlankerInhibitory = (function (exports) {
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
  var version = "2.1.0";
  var info = {
    name: "html-button-response",
    version,
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

  // src/text.ts
  var trial_text = {
    // Button texts
    continue_button: "Continue",
    start_button: "Start",
    ready_button: "I'm Ready",
    end_button: "End",
    practice_button: "Practice Again",
    left_button: "\u2190",
    right_button: "\u2192",
    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the flanker inhibitory control task.",
    // Practice phase text
    practice_header: "Practice Round",
    practice_intro_message: "Let's practice! Look at the middle fish and click the button that shows which way it's swimming.",
    practice_complete_header: "Practice Complete!",
    practice_complete_message: "Great job! Now you're ready for the real task.",
    practice_failed_message: "Let's try the practice again. Remember to focus on the middle fish only.",
    // Main task instructions and headers
    main_task_header: "Main Task",
    main_task_intro: "Now we'll start the real task. Remember to focus on the middle fish!",
    main_task_prompt: "Look at the middle fish. Click the button for the direction it's swimming.",
    // Performance summary labels
    performance_title: "Your Performance:",
    accuracy_label: "Accuracy:",
    response_time_label: "Average Response Time:",
    // Fixation and inter-trial
    fixation_cross: "+",
    // Feedback messages
    correct_feedback: "Correct!",
    incorrect_feedback: "Incorrect",
    too_slow_message: "Please respond faster",
    // Progress messages
    block_progress: "Block {current} of {total}",
    trial_progress: "Trial {current} of {total}"
  };
  var tts_config = {
    // Voice settings
    voice_name: "",
    // Empty string uses default voice, or specify like 'Google US English'
    rate: 1,
    // Speech rate (0.1 to 10)
    pitch: 1,
    // Speech pitch (0 to 2)
    volume: 1,
    // Speech volume (0 to 1)
    // Language and locale
    lang: "en-US",
    // Language code for speech synthesis
    // What text to speak aloud (can be disabled per element)
    speak_instructions: true,
    // Speak instruction page content
    speak_prompts: true,
    // Speak trial prompts
    speak_feedback: true,
    // Speak correct/incorrect feedback
    speak_completion: true,
    // Speak task completion messages
    // Auto-play settings
    auto_speak_on_load: true,
    // Automatically start speaking when page loads
    speak_button_text: false,
    // Whether to also speak button labels
    // Timing
    speech_delay: 500,
    // Delay before starting speech (ms)
    allow_skip: true
    // Allow users to skip/stop speech
  };
  var tts_text = {
    // Instruction spoken versions
    welcome_spoken: "Welcome to the Flanker Inhibitory Control Task. This is an attention and focus test.",
    task_explanation_spoken: "You will see a group of fish swimming on the screen. Your job is to focus only on the middle fish and ignore the other fish around it.",
    directions_spoken: "Look at which direction the middle fish is swimming and click the corresponding button. Click the left arrow if it's swimming left, or the right arrow if it's swimming right.",
    // Trial spoken versions  
    trial_prompt_spoken: "Look at the middle fish. Click the direction it's swimming.",
    // Feedback spoken versions
    correct_spoken: "Correct",
    incorrect_spoken: "Incorrect",
    // Practice spoken versions
    practice_start_spoken: "Let's practice. Look at the middle fish and click the button that shows which way it's swimming.",
    practice_complete_spoken: "Practice complete. Great job! Now you're ready for the real task.",
    // Main task spoken versions
    main_task_start_spoken: "Now we'll start the real task. Remember to focus on the middle fish.",
    task_complete_spoken: "Task complete. Thank you for participating.",
    // Controls
    skip_speech_text: "Press space to skip speech",
    speech_controls_note: "Speech can be skipped by pressing the space bar at any time."
  };
  var instruction_pages = [
    {
      header: "Flanker Inhibitory Control Task",
      header2: "Attention and Focus Test",
      description: "In this task, you will see a group of fish swimming on the screen.",
      task_explanation: "Your job is to <strong>focus only on the middle fish</strong> and ignore the other fish around it.",
      performance_note: "Look at which direction the middle fish is swimming and click the corresponding button.",
      start_prompt: "Click continue to learn more about the task.",
      buttons: ["Continue"]
    },
    {
      strategy_title: "Instructions",
      strategy_intro: "For each trial:",
      strategy_points: [
        "Look at the <strong>middle fish only</strong> - ignore the other fish",
        "See which direction the middle fish is swimming",
        "Click the \u2190 button if it's swimming left",
        "Click the \u2192 button if it's swimming right",
        "Try to respond as quickly and accurately as possible"
      ],
      start_prompt: "The other fish around the middle fish might be swimming in different directions - don't let them distract you!",
      buttons: ["Continue"]
    },
    {
      header2: "Button Instructions",
      description: "Use these buttons to respond:",
      task_explanation: "\u2190 Left Button = Middle fish swimming left<br/>\u2192 Right Button = Middle fish swimming right",
      performance_note: "Remember: Only pay attention to the middle fish, even if the other fish are swimming in different directions.",
      start_prompt: "Click continue to start the practice round.",
      buttons: ["Continue"]
    }
  ];

  // src/stimuli.ts
  var fish_svg = `<svg viewBox="0 0 1024 1024" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" fill="#000000" stroke="#000000" transform="matrix(-1, 0, 0, 1, 0, 0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g>
  <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier">
  <path d="M228.6 632.9c57.6-65.4 57.6-164.1-0.1-229.5-79.5 28.3-128.4 70.8-128.4 114.7 0 43.6 47.8 86.1 128.5 114.8zM491.2 705.1l0.1-3.7c-15.5 0.9-31.1 1.4-46.8 1.4-17 0-34-0.6-50.8-1.6 22.4 15.1 48.9 23.6 76.8 24.1 5.5 0.1 10.6-1.9 14.5-5.7 3.9-4 6.1-9.1 6.2-14.5zM632.4 337.8c0.4-17.5-26.1-37.6-64.9-38.6-73.3-1.9-144.1 11.9-202 38.3 25.7-2.6 52-3.9 78.9-3.9 66.4 0 130.7 8 187.5 23.4l0.5-19.2zM639.8 699.6c27.6 0 51-18.2 59-43.1-28.6 12.3-61.2 22.5-97 30.1 10.6 8.3 23.9 13 38 13z" fill="#663333"></path>
  <path d="M850.4 518.2c0-50.5 17.3-98.9 48.5-137.6-47.3 3.8-89.3 31.5-111.5 74.2-0.1 0.3-2 3.1-3 4.2-6.9 7.1-18.2 7.4-25.4 0.5-25.4-24.5-65.3-45.8-115.2-61.5-58.7-18.5-127.7-28.3-199.5-28.3-56.1 0-109.6 5.8-159.1 17.3-6.8 1.6-13.4 3.2-19.9 5 56.3 74.4 56.3 178.1 0.1 252.5 25.3 6.9 52.4 12.2 80.9 16 31.7 4.2 64.7 6.3 97.9 6.3 41.8 0 82.7-3.3 121.6-9.9 84.7-14.3 155.1-43.4 193.1-80 7.1-6.9 18.5-6.7 25.4 0.5 1 1 1.8 2.1 2.5 3.3 0.2 0.3 0.4 0.6 0.5 1 0 0.1 0.1 0.1 0.1 0.2 22.1 42.6 64.1 70.2 111.3 74-31-38.8-48.3-87.2-48.3-137.7z" fill="#663333"></path>
  <path d="M956.5 360.3c1.8 6.7-0.4 13.8-5.7 18.3-41 34.9-64.5 85.8-64.5 139.6s23.5 104.7 64.5 139.6c5.3 4.5 7.5 11.6 5.7 18.2-1.8 6.7-7.2 11.8-14 13.1-10.5 2-21.4 3-32.4 3-57.7 0-110.7-28.2-143-74.9-9 6.9-18.8 13.6-29.6 19.8v0.6c0 53.9-43.9 97.8-97.8 97.8-32.1 0-61.7-15.5-79.8-41.3-10.8 1.6-21.7 3-32.7 4.2l-0.1 7.3c-0.3 15-6.4 29.1-17.2 39.6-10.6 10.2-24.4 15.8-39.1 15.8h-1c-53.1-0.9-102-24.9-135.4-66.1-38-5.4-73.7-13.5-106.2-24.3-104.2-34.2-164-89.8-164-152.4 0-37.4 21.7-73 62.6-103 36.2-26.5 86.7-48 146.1-62.2 70.8-59.2 180.8-92.6 295.5-89.6 57.1 1.5 100.9 34.6 99.9 75.4l-0.8 29.2c39.9 13.8 73.7 31.2 99.5 51.2 32.3-46.7 85.2-74.9 143-74.9 11 0 21.9 1 32.4 3 6.9 1.3 12.3 6.3 14.1 13z" fill="#663333"></path>
  <path d="M641 466.7c3-9.4-2.3-19.5-11.7-22.5-54-17.1-118-26.1-184.9-26.1-9.9 0-18 8-18 18 0 9.9 8 18 18 18 63.3 0 123.5 8.4 174 24.4 1.8 0.6 3.6 0.8 5.4 0.8 7.7-0.1 14.7-5 17.2-12.6z" fill="#4EC8D8"></path><path d="M898.9 380.6c-31.2 38.7-48.5 87.1-48.5 137.6s17.3 98.9 48.5 137.6c-47.2-3.8-89.2-31.4-111.3-74 0-0.1-0.1-0.1-0.1-0.2-0.2-0.4-0.4-0.7-0.5-1-0.7-1.1-1.5-2.2-2.5-3.3-6.9-7.1-18.2-7.4-25.4-0.5-38 36.6-108.4 65.7-193.1 80-38.9 6.6-79.8 9.9-121.6 9.9-33.3 0-66.2-2.1-97.9-6.3-28.5-3.8-55.6-9.1-80.9-16 56.2-74.4 56.2-178.1-0.1-252.5 6.5-1.7 13.1-3.4 19.9-5 49.5-11.5 103-17.3 159.1-17.3 71.8 0 140.8 9.8 199.5 28.3 49.9 15.8 89.8 37.1 115.2 61.5 7.1 6.9 18.5 6.7 25.4-0.5 1-1.1 2.9-3.9 3-4.2 22-42.6 64-70.3 111.3-74.1z" fill="#4EC8D8"></path>
  <path d="M698.7 656.5c-8 25-31.4 43.1-59 43.1-14.1 0-27.3-4.7-38-13 35.8-7.7 68.4-17.8 97-30.1z" fill="#92E4EA"></path><path d="M629.3 444.2c9.4 3 14.7 13.1 11.7 22.5-2.4 7.7-9.5 12.6-17.1 12.6-1.8 0-3.6-0.3-5.4-0.8-50.6-16-110.8-24.4-174-24.4-9.9 0-18-8-18-18 0-9.9 8-18 18-18 66.8 0 130.7 9 184.8 26.1z" fill="#663333"></path><path d="M567.5 299.2c38.8 1 65.4 21.2 64.9 38.6l-0.5 19.2c-56.8-15.3-121.1-23.4-187.5-23.4-26.9 0-53.3 1.3-78.9 3.9 57.9-26.3 128.7-40.2 202-38.3zM491.2 701.3l-0.1 3.7c-0.1 5.5-2.3 10.6-6.2 14.3-3.9 3.8-9.1 5.8-14.5 5.7-27.9-0.5-54.4-9-76.8-24.1 16.8 1.1 33.8 1.6 50.8 1.6 15.8 0.2 31.4-0.3 46.8-1.2z" fill="#92E4EA"></path>
  <path d="M225.7 491.2c0-11.4-9.3-20.7-20.7-20.7-11.4 0-20.7 9.3-20.7 20.7 0 11.4 9.3 20.7 20.7 20.7 11.4 0 20.7-9.2 20.7-20.7z" fill="#663333"></path><path d="M228.5 403.4c57.7 65.4 57.7 164.1 0.1 229.5-80.7-28.7-128.5-71.2-128.5-114.7 0-43.9 48.9-86.5 128.4-114.8z" fill="#92E4EA"></path>
<path d="M205 491.2m-20.7 0a20.7 20.7 0 1 0 41.4 0 20.7 20.7 0 1 0-41.4 0Z" fill="#663333"></path></g>
</svg>`;
  var arrow_svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <path fill="rgba(0,0,0,0.8)" stroke="white" stroke-width="1" d="m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z"/>
</svg>`;
  var layered_stimuli = [
    fish_svg,
    arrow_svg
  ];
  var fish_only = [
    fish_svg
  ];
  var arrow_only = [
    arrow_svg
  ];
  var custom_stimulus = {
    left: [
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" fill="yellow"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><polygon points="10,24 30,10 30,38" fill="blue"/></svg>'
    ],
    right: [
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><circle cx="24" cy="24" r="15" fill="yellow"/></svg>',
      '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><polygon points="38,24 18,10 18,38" fill="orange"/></svg>'
    ]
  };

  // src/index.ts
  var currentUtterance = null;
  var speechEnabled = false;
  function initializeTTS(config = tts_config) {
    speechEnabled = "speechSynthesis" in window;
    if (!speechEnabled) {
      console.warn("Text-to-Speech not supported in this browser");
      return false;
    }
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    return true;
  }
  function getAvailableVoices() {
    return speechSynthesis.getVoices();
  }
  function createUtterance(text, config = tts_config) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;
    utterance.lang = config.lang;
    if (config.voice_name) {
      const voices = getAvailableVoices();
      const selectedVoice = voices.find(
        (voice) => voice.name.includes(config.voice_name) || voice.lang === config.lang
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    return utterance;
  }
  function stopSpeech() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    currentUtterance = null;
  }
  function speakText(text, config = tts_config, delay = config.speech_delay) {
    return new Promise((resolve) => {
      if (!speechEnabled || !text.trim()) {
        resolve();
        return;
      }
      setTimeout(() => {
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
        }
        currentUtterance = createUtterance(text, config);
        currentUtterance.onend = () => {
          currentUtterance = null;
          resolve();
        };
        currentUtterance.onerror = () => {
          currentUtterance = null;
          resolve();
        };
        speechSynthesis.speak(currentUtterance);
      }, delay);
    });
  }
  function speakInstructionPage(pageContent, config = tts_config) {
    if (!config.speak_instructions) {
      return Promise.resolve();
    }
    const cleanText = pageContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return speakText(cleanText, config);
  }
  function speakTrialPrompt(config = tts_config) {
    if (!config.speak_prompts) {
      return Promise.resolve();
    }
    return speakText(tts_text.trial_prompt_spoken, config);
  }
  function speakFeedback(isCorrect, config = tts_config) {
    if (!config.speak_feedback) {
      return Promise.resolve();
    }
    const feedbackText = isCorrect ? tts_text.correct_spoken : tts_text.incorrect_spoken;
    return speakText(feedbackText, config);
  }
  function addSpeechControls(config = tts_config) {
    if (!config.allow_skip) return void 0;
    const handleKeyPress = (event) => {
      if (event.code === "Space" && speechSynthesis.speaking) {
        event.preventDefault();
        stopSpeech();
      }
    };
    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }
  function flipSVG(svgString) {
    if (!svgString || typeof svgString !== "string") return svgString;
    const hasExistingTransform = svgString.includes("matrix(-1,") || svgString.includes("matrix(-1 ") || svgString.includes("scaleX(-1)") || svgString.includes("scale(-1");
    if (hasExistingTransform) {
      return svgString.replace(/transform="matrix\(-1,\s*0,\s*0,\s*1,\s*0,\s*0\)"/g, "").replace(/transform="matrix\(-1\s+0\s+0\s+1\s+0\s+0\)"/g, "").replace(/transform="scaleX\(-1\)"/g, "").replace(/transform="scale\(-1,\s*1\)"/g, "").replace(/transform="scale\(-1\s+1\)"/g, "").replace(/style="[^"]*transform:\s*scaleX\(-1\)[^"]*"/g, (match) => {
        return match.replace(/transform:\s*scaleX\(-1\);?/, "").replace(/style=""/, "");
      });
    }
    const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
    const widthMatch = svgString.match(/width="([^"]+)"/);
    let translateX = 0;
    if (viewBoxMatch) {
      const viewBox = viewBoxMatch[1].split(/\s+/);
      if (viewBox.length >= 3) {
        translateX = parseFloat(viewBox[2]) || 0;
      }
    } else if (widthMatch) {
      translateX = parseFloat(widthMatch[1]) || 0;
    }
    if (translateX > 0) {
      return svgString.replace(
        /<svg([^>]*)>/,
        `<svg$1><g transform="scale(-1,1) translate(-${translateX},0)">`
      ).replace(/<\/svg>$/, "</g></svg>");
    } else {
      return `<span style="display: inline-block; transform: scaleX(-1);">${svgString}</span>`;
    }
  }
  function layerSVGs(svgArray, flip = false) {
    if (!svgArray || !Array.isArray(svgArray) || svgArray.length === 0) return "";
    if (svgArray.length === 1) return flip ? flipSVG(svgArray[0]) : svgArray[0];
    return `<span style="position: relative; display: inline-block;">
    ${svgArray.map(
    (svg, index) => `<span style="position: ${index === 0 ? "relative" : "absolute"}; top: 0; left: 0;">${flip ? flipSVG(svg) : svg}</span>`
  ).join("")}
  </span>`;
  }
  function processStimuli(stimuli) {
    if (stimuli && typeof stimuli === "object" && !Array.isArray(stimuli) && typeof stimuli.left === "string" && typeof stimuli.right === "string") {
      return stimuli;
    }
    if (Array.isArray(stimuli)) {
      return {
        right: layerSVGs(stimuli, false),
        left: layerSVGs(stimuli, true)
      };
    }
    if (stimuli && typeof stimuli === "object") {
      const obj = stimuli;
      if (obj.left && obj.right) {
        return {
          left: layerSVGs(obj.left, false),
          right: layerSVGs(obj.right, false)
        };
      } else if (obj.right) {
        return {
          right: layerSVGs(obj.right, false),
          left: layerSVGs(obj.right, true)
        };
      } else if (obj.left) {
        return {
          left: layerSVGs(obj.left, false),
          right: layerSVGs(obj.left, true)
        };
      }
    }
    return {
      right: layerSVGs(layered_stimuli, false),
      left: layerSVGs(layered_stimuli, true)
    };
  }
  var default_stimuli = processStimuli(layered_stimuli);
  var fish_stimuli = processStimuli(fish_only);
  var arrow_stimuli = processStimuli(arrow_only);
  function createFlankerStim(direction, congruent, stimuli = layered_stimuli, stimuli_amount = 5) {
    let safeAmount = typeof stimuli_amount === "number" && !isNaN(stimuli_amount) && isFinite(stimuli_amount) ? stimuli_amount : 5;
    const validAmount = Math.max(3, safeAmount % 2 === 0 ? safeAmount + 1 : safeAmount);
    const halfFlankers = Math.floor(validAmount / 2);
    const processedStimuli = processStimuli(stimuli);
    const center = processedStimuli[direction];
    const flanker = congruent ? processedStimuli[direction] : processedStimuli[direction === "left" ? "right" : "left"];
    let html = `<div class="flanker-stim" style="--stimuli-count: ${validAmount};">`;
    for (let i = 0; i < halfFlankers; i++) {
      html += `<span>${flanker}</span>`;
    }
    html += `<span class="center">${center}</span>`;
    for (let i = 0; i < halfFlankers; i++) {
      html += `<span>${flanker}</span>`;
    }
    html += `</div>`;
    return html;
  }
  function createPracticeStim(direction, congruent, stimuli = layered_stimuli, stimuli_amount = 5) {
    let safeAmount = typeof stimuli_amount === "number" && !isNaN(stimuli_amount) && isFinite(stimuli_amount) ? stimuli_amount : 5;
    const validAmount = Math.max(3, safeAmount % 2 === 0 ? safeAmount + 1 : safeAmount);
    const halfFlankers = Math.floor(validAmount / 2);
    const processedStimuli = processStimuli(stimuli);
    const center = processedStimuli[direction];
    const flanker = congruent ? processedStimuli[direction] : processedStimuli[direction === "left" ? "right" : "left"];
    let html = `<div class="flanker-stim practice" style="--stimuli-count: ${validAmount};">`;
    for (let i = 0; i < halfFlankers; i++) {
      html += `<span>${flanker}</span>`;
    }
    html += `<span class="center highlighted">${center}</span>`;
    for (let i = 0; i < halfFlankers; i++) {
      html += `<span>${flanker}</span>`;
    }
    html += `</div>`;
    return html;
  }
  function calculatePerformance(data) {
    const trial_data = data.filter((d) => d.task === "flanker");
    if (trial_data.length === 0) {
      return { accuracy: 0, mean_rt: 0, total_trials: 0 };
    }
    const correct_trials = trial_data.filter((d) => d.correct);
    const accuracy = correct_trials.length / trial_data.length * 100;
    const mean_rt = correct_trials.length > 0 ? correct_trials.reduce((sum, d) => sum + d.rt, 0) / correct_trials.length : 0;
    return {
      accuracy,
      mean_rt,
      total_trials: trial_data.length,
      correct_trials: correct_trials.length
    };
  }
  function createTimeline(jsPsych, config = {}) {
    const {
      stimuli_type = "layered",
      svg,
      stimuli_amount = 5,
      fixation_duration = 500,
      show_instructions = true,
      show_practice = true,
      num_practice = 8,
      num_trials = 20,
      // TTS configuration
      enable_tts = false,
      tts_voice = tts_config.voice_name,
      tts_rate = tts_config.rate,
      tts_pitch = tts_config.pitch,
      tts_volume = tts_config.volume,
      tts_lang = tts_config.lang,
      speak_instructions = tts_config.speak_instructions,
      speak_prompts = tts_config.speak_prompts,
      speak_feedback = tts_config.speak_feedback,
      auto_speak = tts_config.auto_speak_on_load
    } = config;
    let ttsSettings = __spreadValues({}, tts_config);
    let speechCleanup;
    if (enable_tts) {
      ttsSettings = __spreadProps(__spreadValues({}, tts_config), {
        voice_name: tts_voice,
        rate: tts_rate,
        pitch: tts_pitch,
        volume: tts_volume,
        lang: tts_lang,
        speak_instructions,
        speak_prompts,
        speak_feedback,
        auto_speak_on_load: auto_speak
      });
      const ttsInitialized = initializeTTS(ttsSettings);
      if (ttsInitialized) {
        speechCleanup = addSpeechControls(ttsSettings);
      }
    }
    let stimuli;
    if (svg) {
      stimuli = processStimuli(svg);
    } else if (stimuli_type === "custom") {
      stimuli = processStimuli(custom_stimulus);
    } else if (stimuli_type === "arrow") {
      stimuli = arrow_stimuli;
    } else if (stimuli_type === "fish") {
      stimuli = fish_stimuli;
    } else {
      stimuli = default_stimuli;
    }
    const timeline = [];
    if (show_instructions) {
      instruction_pages.forEach((page, index) => {
        timeline.push({
          type: HtmlButtonResponsePlugin,
          stimulus: `
          <div class="flanker-instructions">
            ${page.header ? `<h1>${page.header}</h1>` : ""}
            ${page.header2 ? `<h2>${page.header2}</h2>` : ""}
            ${page.description ? `<p>${page.description}</p>` : ""}
            ${page.task_explanation ? `<p>${page.task_explanation}</p>` : ""}
            ${page.performance_note ? `<p class="performance-note">${page.performance_note}</p>` : ""}
            ${page.strategy_title ? `<h2>${page.strategy_title}</h2>` : ""}
            ${page.strategy_intro ? `<p>${page.strategy_intro}</p>` : ""}
            ${page.strategy_points ? `
              <ul>
                ${page.strategy_points.map((point) => `<li>${point}</li>`).join("")}
              </ul>
            ` : ""}
            ${page.start_prompt ? `<p class="start-prompt">${page.start_prompt}</p>` : ""}
            ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ""}
          </div>
        `,
          choices: page.buttons || [trial_text.continue_button],
          data: { task: "instructions", page: index + 1 },
          on_load: enable_tts ? function() {
            if (index === 0) {
              speakText(tts_text.welcome_spoken, ttsSettings);
            } else if (index === 1) {
              speakText(tts_text.task_explanation_spoken, ttsSettings);
            } else if (index === 2) {
              speakText(tts_text.directions_spoken, ttsSettings);
            }
          } : void 0
        });
      });
    }
    if (show_practice) {
      timeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: `
        <div class="flanker-instructions">
          <h2>${trial_text.practice_header}</h2>
          <p>${trial_text.practice_intro_message}</p>
          ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ""}
        </div>
      `,
        choices: [trial_text.start_button],
        data: { task: "practice-intro" },
        on_load: enable_tts ? function() {
          speakText(tts_text.practice_start_spoken, ttsSettings);
        } : void 0
      });
      if (num_practice > 0) {
        const practice_variables = [
          { direction: "left", congruent: true },
          { direction: "left", congruent: false },
          { direction: "right", congruent: true },
          { direction: "right", congruent: false }
        ];
        const practice_trials = jsPsych.randomization.repeat(practice_variables, Math.floor(num_practice / 4)).concat(jsPsych.randomization.sampleWithoutReplacement(practice_variables, num_practice % 4));
        const practice_fixation = {
          type: HtmlButtonResponsePlugin,
          stimulus: `<div class="fixation">${trial_text.fixation_cross}</div>`,
          choices: [],
          trial_duration: fixation_duration,
          data: { task: "fixation", phase: "practice" }
        };
        const practice_trial = {
          type: HtmlButtonResponsePlugin,
          stimulus: function() {
            const direction = jsPsych.evaluateTimelineVariable("direction");
            const congruent = jsPsych.evaluateTimelineVariable("congruent");
            return `
            <div class="flanker-trial">
              <div class="trial-prompt">${trial_text.main_task_prompt}</div>
              ${createPracticeStim(direction, congruent, stimuli, stimuli_amount)}
            </div>
          `;
          },
          choices: [trial_text.left_button, trial_text.right_button],
          data: {
            task: "flanker",
            phase: "practice",
            direction: jsPsych.timelineVariable("direction"),
            congruent: jsPsych.timelineVariable("congruent")
          },
          on_load: enable_tts ? function() {
            if (ttsSettings.speak_prompts) {
              speakTrialPrompt(ttsSettings);
            }
          } : void 0,
          on_finish: function(data) {
            const correct_response = data.direction === "left" ? 0 : 1;
            data.correct = data.response === correct_response;
          }
        };
        const practice_feedback = {
          type: HtmlButtonResponsePlugin,
          stimulus: () => {
            const last_trial = jsPsych.data.get().last(1).values()[0];
            const feedback = last_trial.correct ? trial_text.correct_feedback : trial_text.incorrect_feedback;
            return `<div class="feedback ${last_trial.correct ? "correct" : "incorrect"}">${feedback}</div>`;
          },
          choices: [],
          trial_duration: 1e3,
          data: { task: "feedback", phase: "practice" },
          on_load: enable_tts ? function() {
            if (ttsSettings.speak_feedback) {
              const last_trial = jsPsych.data.get().last(1).values()[0];
              speakFeedback(last_trial.correct, ttsSettings);
            }
          } : void 0
        };
        timeline.push({
          timeline: [practice_fixation, practice_trial, practice_feedback],
          timeline_variables: practice_trials,
          randomize_order: true
        });
      }
      timeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: () => {
          const practice_data = jsPsych.data.get().filter({ task: "flanker", phase: "practice" }).values();
          const performance2 = calculatePerformance(practice_data);
          return `
          <div class="flanker-instructions">
            <h2>${trial_text.practice_complete_header}</h2>
            <p>${trial_text.practice_complete_message}</p>
            <p>${trial_text.accuracy_label} ${performance2.accuracy.toFixed(1)}%</p>
            ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ""}
          </div>
        `;
        },
        choices: [trial_text.continue_button],
        data: { task: "practice-complete" },
        on_load: enable_tts ? function() {
          speakText(tts_text.practice_complete_spoken, ttsSettings);
        } : void 0
      });
    }
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
      <div class="flanker-instructions">
        <h2>${trial_text.main_task_header}</h2>
        <p>${trial_text.main_task_intro}</p>
        ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ""}
      </div>
    `,
      choices: [trial_text.ready_button],
      data: { task: "main-intro" },
      on_load: enable_tts ? function() {
        speakText(tts_text.main_task_start_spoken, ttsSettings);
      } : void 0
    });
    if (num_trials > 0) {
      const trial_variables = [
        { direction: "left", congruent: true },
        { direction: "left", congruent: false },
        { direction: "right", congruent: true },
        { direction: "right", congruent: false }
      ];
      const main_trials = jsPsych.randomization.repeat(trial_variables, Math.floor(num_trials / 4)).concat(jsPsych.randomization.sampleWithoutReplacement(trial_variables, num_trials % 4));
      const fixation = {
        type: HtmlButtonResponsePlugin,
        stimulus: `<div class="fixation">${trial_text.fixation_cross}</div>`,
        choices: [],
        trial_duration: fixation_duration,
        data: { task: "fixation", phase: "main" }
      };
      const flanker_trial = {
        type: HtmlButtonResponsePlugin,
        stimulus: function() {
          const direction = jsPsych.evaluateTimelineVariable("direction");
          const congruent = jsPsych.evaluateTimelineVariable("congruent");
          return `
          <div class="flanker-trial">
            <div class="trial-prompt">${trial_text.main_task_prompt}</div>
            ${createFlankerStim(direction, congruent, stimuli, stimuli_amount)}
          </div>
        `;
        },
        choices: [trial_text.left_button, trial_text.right_button],
        data: {
          task: "flanker",
          phase: "main",
          direction: jsPsych.timelineVariable("direction"),
          congruent: jsPsych.timelineVariable("congruent")
        },
        on_load: enable_tts ? function() {
          if (ttsSettings.speak_prompts) {
            speakTrialPrompt(ttsSettings);
          }
        } : void 0,
        on_finish: function(data) {
          const correct_response = data.direction === "left" ? 0 : 1;
          data.correct = data.response === correct_response;
        }
      };
      timeline.push({
        timeline: [fixation, flanker_trial],
        timeline_variables: main_trials,
        randomize_order: true
      });
    }
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: () => {
        const main_data = jsPsych.data.get().filter({ task: "flanker", phase: "main" }).values();
        const performance2 = calculatePerformance(main_data);
        return `
        <div class="flanker-instructions">
          <h2>${trial_text.task_complete_header}</h2>
          <p>${trial_text.task_complete_message}</p>
          <div class="performance-summary">
            <h3>${trial_text.performance_title}</h3>
            <p>${trial_text.accuracy_label} ${performance2.accuracy.toFixed(1)}%</p>
            <p>${trial_text.response_time_label} ${performance2.mean_rt.toFixed(0)}ms</p>
          </div>
          ${enable_tts && ttsSettings.allow_skip ? `<p class="speech-controls">${tts_text.speech_controls_note}</p>` : ""}
        </div>
      `;
      },
      choices: [trial_text.end_button],
      data: { task: "complete" },
      on_load: enable_tts ? function() {
        if (ttsSettings.speak_completion) {
          speakText(tts_text.task_complete_spoken, ttsSettings);
        }
      } : void 0,
      on_finish: function() {
        if (speechCleanup) {
          speechCleanup();
        }
        stopSpeech();
      }
    });
    return {
      timeline
    };
  }
  var timelineUnits = {
    instructions: "Instructions for the flanker inhibitory control task",
    practice: "Practice trials with feedback",
    main: "Main flanker task trials",
    completion: "Task completion screen"
  };
  var utils = {
    calculatePerformance,
    createFlankerStim,
    createPracticeStim,
    // TTS utilities
    initializeTTS,
    speakText,
    stopSpeech,
    getAvailableVoices,
    speakInstructionPage,
    speakTrialPrompt,
    speakFeedback,
    addSpeechControls
  };
  var src_default = { createTimeline, timelineUnits, utils };

  exports.addSpeechControls = addSpeechControls;
  exports.arrow_stimuli = arrow_stimuli;
  exports.calculatePerformance = calculatePerformance;
  exports.createFlankerStim = createFlankerStim;
  exports.createPracticeStim = createPracticeStim;
  exports.createTimeline = createTimeline;
  exports.createUtterance = createUtterance;
  exports.default = src_default;
  exports.default_stimuli = default_stimuli;
  exports.fish_stimuli = fish_stimuli;
  exports.getAvailableVoices = getAvailableVoices;
  exports.initializeTTS = initializeTTS;
  exports.instruction_pages = instruction_pages;
  exports.speakFeedback = speakFeedback;
  exports.speakInstructionPage = speakInstructionPage;
  exports.speakText = speakText;
  exports.speakTrialPrompt = speakTrialPrompt;
  exports.stopSpeech = stopSpeech;
  exports.timelineUnits = timelineUnits;
  exports.trial_text = trial_text;
  exports.tts_config = tts_config;
  exports.tts_text = tts_text;
  exports.utils = utils;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=index.global.js.map
//# sourceMappingURL=index.global.js.map