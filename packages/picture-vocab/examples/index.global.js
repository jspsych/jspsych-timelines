var jsPsychTimelinePictureVocabTimeline = (function (exports) {
  'use strict';

  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
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
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
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
            if (typeof state == "object")
              copy(state, xg);
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
            if (typeof state == "object")
              copy(state, xg);
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
            if (typeof state == "object")
              copy(state, xg);
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
            while (X.length < 8)
              X.push(0);
            for (j = 0; j < 8 && X[j] === 0; ++j)
              ;
            if (j == 8)
              X[7] = -1;
            else
              X[j];
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
          if (seed == null)
            seed = +/* @__PURE__ */ new Date();
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
            if (state.x)
              copy(state, xg);
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
              if (seed2)
                v ^= seed2.charCodeAt((j + 32) % seed2.length);
              if (j === 0)
                w = v;
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
          if (seed == null)
            seed = +/* @__PURE__ */ new Date();
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
            if (state.X)
              copy(state, xg);
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
            if (typeof state == "object")
              copy(state, xg);
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
            } else
              return prng2;
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
  __toESM(require_auto_bind(), 1);
  __toESM(require_random_words(), 1);
  __toESM(require_alea(), 1);
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
  var _HtmlButtonResponsePlugin = class {
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
  var HtmlButtonResponsePlugin = _HtmlButtonResponsePlugin;
  (() => {
    _HtmlButtonResponsePlugin.info = info;
  })();

  // src/text.ts
  var englishText = {
    welcome_message: "Welcome to the test. Tap the button to begin.",
    begin_button: "Begin",
    instructions_hearing: "You will hear a word and see pictures on the screen.",
    instructions_tap: "Tap the picture that means the same as the word you just heard.",
    instructions_difficulty: "Some words will be easy and some will be harder. Just do the best you can.",
    instructions_replay: "If you need to hear a word again, you can tap the Play again button.",
    instructions_back: "If you think you made a mistake and want to change your last answer, tap the Back button to hear the last word again.",
    instructions_ready: "Are you ready?",
    next_button: "Next",
    practice_intro: "Let's try one for practice. Tap the picture of {word}.",
    practice_correct: "You picked the {word}! Let's move on.",
    practice_incorrect: "You did not pick the {word}. Let's try again.",
    try_again_button: "Try Again",
    live_instruction: "Tap the picture that means {word}.",
    transition_message: "Now you're going to do some more.",
    transition_reminder: "Remember, you will hear a word and then you will see pictures. One of the pictures will show what the word means.",
    transition_action: "Tap that picture. Then you will hear a new word and see more pictures. Just do the best you can.",
    transition_ready: "Are you ready?",
    start_button: "Start",
    thank_you: "Thank you for completing the test!",
    finish_button: "Finish"
  };

  // src/images.ts
  var images = {
    appleSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M359.612 287.101c-67.154 7.126-118.967 74.586-139.36 115.568-94.098 189.508 149.126 490.461 237.423 470.383 13.471-3.058 27.419-14.276 58.214-17.177 42.772-4.034 65.714 12.996 91.548 15.975 56.243 6.492 107.115-55.994 142.759-99.762 40.201-49.366 157.161-192.987 112.667-346.601-7.229-24.926-25.641-88.545-85.577-123.419-3.875-2.266-74.722-42.181-141.23-17.233-25.142 9.427-34.478 22.524-65.714 27.193-28.801 4.306-49.648-2.266-72.514-7.93-37.038-9.087-101.382-20.903-138.217-16.995z" fill="#FA1919" /><path d="M751.795 634.281c-18.321 82.416-92.907 173.861-163.733 176.921-26.15 1.133-42.953-10.198-80.501-1.734-49.943 11.228-93.587 47.7-88.658 61.534 3.398 9.427 29.198 8.102 31.724 7.93 28.972-1.711 36.438-20.394 59.063-23.045 25.686-2.991 36.608 18.717 61.817 27.193 42.737 14.343 90.822-21.38 117.664-41.322 94.041-69.851 220.553-251.405 170.292-428.279-8.838-31.102-25.062-85.158-76.988-118.683-43.905-28.325-115.419-43.213-139.45-15.862-44.788 50.917 145.683 189.316 108.77 355.347z" fill="#C40000" /><path d="M598.237 907.506c-0.121 0.001-0.263 0.002-0.407 0.002-6.681 0-13.12-1.035-19.165-2.957-7.881-2.506-15.246-6.969-22.359-11.287-12.032-7.298-23.407-14.196-41.127-14.73-18.423-0.577-31.294 6.278-43.769 12.893-6.969 3.705-13.597 7.194-20.903 9.393-59.551 17.778-151.461-58.747-216.123-142.476-3.329-3.92-5.354-9.037-5.354-14.628 0-12.515 10.146-22.661 22.661-22.661 7.615 0 14.352 3.757 18.461 9.517 72.401 93.758 143.691 133.878 167.337 126.82 3.037-0.907 7.693-3.398 12.61-5.993 15.206-8.066 36.019-19.125 66.453-18.128 29.617 0.929 49.025 12.701 63.2 21.301 5.042 3.058 9.812 5.948 12.939 6.934 18.128 5.722 73.646-20.1 140.075-95.435 48.505-54.974 87.174-118.831 108.871-179.798 31.521-88.557 19.261-148.346 3.398-182.915-10.311-22.457-27.193-46.759-45.15-65.013-16.122-16.383-41.921-36.935-73.329-41.74-38.602-5.914-103.829 8.43-132.925 16.838-3.093 0.895-6.141 1.813-9.212 2.741-18.411 5.552-39.27 11.851-68.559 12.226-29.957 0.386-50.793-5.438-70.95-11.069-3.172-0.883-6.368-1.779-9.597-2.639-31.001-8.304-93.145-21.097-129.458-16.406-60.729 7.84-106.277 70.79-121.868 102.98-14.809 30.593-19.918 66.531-15.182 106.934 4.373 37.389 16.995 77.702 37.389 119.793 1.433 2.889 2.27 6.289 2.27 9.885 0 12.517-10.147 22.663-22.663 22.663-8.921 0-16.637-5.153-20.335-12.646-22.719-46.801-36.678-91.987-41.641-134.439-5.744-49.129 0.794-93.532 19.42-131.974 20.722-42.748 77.045-117.833 156.854-128.155 52.243-6.798 131.611 13.461 146.998 17.585 3.398 0.907 6.742 1.849 10.073 2.777 18.638 5.212 34.716 9.71 58.158 9.404 22.898-0.294 39.010-5.155 56.062-10.3 3.229-0.974 6.457-1.948 9.722-2.889 9.597-2.775 95.354-26.829 152.368-18.128 34.58 5.292 68.74 24.224 98.777 54.746 2.050 2.074 6.368 6.278 11.919 12.464 0 0 25.674 28.847 42.114 65.409 16.779 37.299 25.742 122.082-1.054 214.785-27.883 96.409-82.982 161.703-118.366 196.816 0 0-30.705 43.927-96.443 85.486-27.465 17.313-51.607 26.014-72.185 26.014z" fill="#000000" /><path d="M217.521 717.42c-8.050-0.007-15.116-4.211-19.132-10.54l-0.697-1.106c-2.14-3.396-3.409-7.526-3.409-11.953 0-12.515 10.146-22.661 22.661-22.661 7.989 0 15.011 4.134 19.047 10.381l0.677 1.087c2.193 3.427 3.494 7.606 3.494 12.089 0 12.509-10.134 22.649-22.642 22.661z" fill="#000000" /><path d="M773.253 190.5c3.116-19.625-59.257-62.146-112.621-48.889-76.83 19.079-100.487 145.027-84.365 155.223 10.797 6.798 34.284-41.593 107.014-73.941 53.546-23.759 87.707-18.377 89.972-32.393z" fill="#6BE166" /><path d="M566.863 320.22c-5.234-0.011-10.101-1.577-14.165-4.26-13.867-8.769-18.251-28.054-13.267-58.838 6.98-43.191 36.823-120.723 104.407-137.502 44.029-10.934 94.381 8.418 121.358 33.197 18.502 16.995 20.587 31.815 19.081 41.264-1.269 7.93-6.062 18.843-21.641 25.187-6.379 2.605-13.675 4.192-22.898 6.198-14.615 3.185-34.637 7.546-58.577 18.186-39.792 17.697-63.302 40.482-78.87 55.518-6.096 5.914-10.922 10.582-15.76 14.060-3.547 2.605-10.922 6.991-19.669 6.991zM670.681 161.723c-0.067 0-0.146 0-0.226 0-5.551 0-10.942 0.685-16.091 1.977-23.542 5.863-39.926 26.598-49.398 42.958-12.317 21.039-20.479 45.925-22.708 72.5 41.782-61.22 88.203-85.409 139.611-95.883-31.746 6.784-8.667 1.595 6.878-1.805-12.076-8.835-26.563-15.137-42.285-17.817 14.842 3.257 0.228-1.932-15.783-1.932z" fill="#000000" /><path d="M504.989 325.749c-8.871-4.804-14.559-20.961-9.449-30.593 4.85-9.177 15.228-33.356 6.923-59.631-4.255-13.045-11.831-24.030-21.741-32.318 5.017 4.343 2.992-0.775 2.992-6.368 0-12.519 10.148-22.669 22.669-22.669 6.927 0 13.129 3.107 17.286 8.002 13.689 16.021 23.085 36.035 26.237 58.061 1.583 0.016 12.902 51.658-14.302 76.086-7.943 7.115-21.811 14.219-30.614 9.427z" fill="#000000" /></svg>',
    ballSVG: `<svg width="800px" height="800px" viewBox="0 0 512 512" version="1.1" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">

<g id="_x34_91_x2C__ball_x2C__sports_x2C__game_x2C__education">

<g>

<path d="M255.98,51c-0.54,2.01-16.38,59.25-74.32,114.21c-26.03-14.14-54.76-26.6-86.39-36.49    c4.86-6.12,10.11-12.02,15.77-17.68C151.06,71.03,203.53,51.01,255.98,51z" style="fill:#EA6A25;"/>

<path d="M109.04,121.79c39.608-39.599,91.411-59.603,143.32-60.021c2.414-6.389,3.486-10.272,3.62-10.77    c-52.45,0.01-104.92,20.03-144.94,60.04c-5.66,5.66-10.91,11.56-15.77,17.68c1.862,0.582,3.711,1.175,5.553,1.774    C103.46,127.534,106.198,124.632,109.04,121.79z" style="fill:#D85D27;"/>

<path d="M397.38,107.55L277.41,233.52c-26.74-24.4-58.47-48.07-95.75-68.31    C239.6,110.25,255.44,53.01,255.98,51C306.9,51,357.83,69.85,397.38,107.55z" style="fill:#F37C2A;"/>

<path d="M262.23,61.75c47.185,0,94.371,16.199,132.511,48.571l2.639-2.771C357.83,69.85,306.9,51,255.98,51    c-0.54,2.01-16.38,59.25-74.32,114.21c3.719,2.019,7.367,4.081,10.976,6.166C246.713,117.862,261.704,63.704,262.23,61.75z" style="fill:#DB6D23;"/>

<path d="M400.96,111.04C440.99,151.08,461,203.55,461,256.02c-1.92,0.51-53.84,14.88-106.23,66.21    c-18.88-27.311-44.319-58.57-77.359-88.71l119.97-125.97C398.59,108.69,399.78,109.86,400.96,111.04z" style="fill:#EA6A25;"/>

<path d="M397.38,122.55c1.21,1.14,2.4,2.31,3.58,3.49c36.251,36.26,56.082,82.713,59.504,130.129    c0.269-0.077,0.452-0.127,0.536-0.149c0-52.47-20.01-104.94-60.04-144.98c-1.18-1.18-2.37-2.35-3.58-3.49L277.41,233.52    c2.572,2.347,5.082,4.701,7.563,7.059L397.38,122.55z" style="fill:#D85D27;"/>

<path d="M354.77,322.23c31.19,45.09,44.53,79.409,44.801,80.1c-36.181,35.5-82.25,54.9-129.24,58.17    C291.4,397.58,323.17,353.18,354.77,322.23z" style="fill:#EA6A25;"/>

<path d="M353.937,337.23c21.295,30.784,34.263,56.538,40.438,70.007c1.751-1.604,3.487-3.231,5.195-4.907    c-0.271-0.69-13.61-35.01-44.801-80.1c-31.6,30.949-63.369,75.35-84.439,138.27c1.56-0.108,3.118-0.237,4.675-0.382    C295.884,405.263,324.979,365.593,353.937,337.23z" style="fill:#D85D27;"/>

<path d="M277.41,233.52c33.04,30.14,58.479,61.4,77.359,88.71c-31.6,30.949-63.369,75.35-84.439,138.27    c-4.771,0.33-9.55,0.5-14.33,0.5c-50.91,0-101.83-18.86-141.38-56.55L277.41,233.52z" style="fill:#F37C2A;"/>

<path d="M277.41,246.862c29.938,27.311,53.617,55.531,71.849,80.909c1.836-1.892,3.674-3.741,5.511-5.54    c-18.88-27.311-44.319-58.57-77.359-88.71L114.62,404.45c2.232,2.127,4.506,4.186,6.808,6.193L277.41,246.862z" style="fill:#DB6D23;"/>

<path d="M277.41,233.52L114.62,404.45c-1.21-1.141-2.4-2.311-3.58-3.49    C67.37,357.28,47.52,298.8,51.5,241.67c57.62-19.29,99.7-47.56,130.16-76.46C218.94,185.45,250.67,209.12,277.41,233.52z" style="fill:#EA6A25;"/>

<path d="M53,254.17c57.62-19.29,99.7-47.56,130.16-76.46c33.975,18.446,63.325,39.743,88.505,61.842    l5.745-6.032c-26.74-24.4-58.47-48.07-95.75-68.31c-30.46,28.9-72.54,57.17-130.16,76.46c-1.043,14.974-0.433,30.039,1.798,44.907    C52.35,275.799,52.248,264.961,53,254.17z" style="fill:#D85D27;"/>

<path d="M95.27,128.72c31.63,9.89,60.36,22.35,86.39,36.49c-30.46,28.9-72.54,57.17-130.16,76.46    C54.3,201.48,68.89,161.95,95.27,128.72z" style="fill:#F37C2A;"/>

<path d="M98.937,139.554c27.713,8.665,53.199,19.303,76.594,31.316c2.092-1.882,4.137-3.77,6.129-5.66    c-26.03-14.14-54.76-26.6-86.39-36.49C68.89,161.95,54.3,201.48,51.5,241.67c1.658-0.555,3.3-1.119,4.932-1.689    C61.14,204.152,75.303,169.325,98.937,139.554z" style="fill:#DB6D23;"/>

<path d="M400.96,400.96c-0.46,0.46-0.93,0.92-1.39,1.37c-0.271-0.69-13.61-35.01-44.801-80.1    C407.16,270.9,459.08,256.53,461,256.02C460.99,308.47,440.97,360.94,400.96,400.96z" style="fill:#F37C2A;"/>

<path d="M450.495,270.27c-0.008,39.904-11.61,79.813-34.773,114.249    C445.888,347.11,460.991,301.56,461,256.02c-1.92,0.51-53.84,14.88-106.23,66.21c0.641,0.927,1.263,1.841,1.889,2.758    C404.553,282.966,448.727,270.739,450.495,270.27z" style="fill:#DB6D23;"/>

<path d="M256,466c-54.194,0-105.628-20.573-144.829-57.931c-1.076-1.014-2.247-2.155-3.666-3.573    c-42.991-43.001-65.222-102.475-60.993-163.174c2.959-42.472,18.465-82.484,44.842-115.711c5.006-6.305,10.44-12.396,16.15-18.107    C147.166,67.853,199.895,46.01,255.979,46c54.218,0,105.661,20.574,144.851,57.931c1.088,1.025,2.26,2.167,3.666,3.575    C444.157,147.176,466,199.92,466,256.02c-0.011,56.085-21.853,108.814-61.504,148.475c-0.473,0.473-0.956,0.945-1.429,1.408    c-35.632,34.961-82.65,56.124-132.391,59.585C265.766,465.828,260.828,466,256,466z M255.98,56    c-53.414,0.01-103.632,20.813-141.405,58.576c-5.442,5.441-10.62,11.247-15.39,17.253c-25.115,31.637-39.88,69.739-42.698,110.188    c-4.027,57.811,17.145,114.455,58.088,155.407c1.347,1.347,2.451,2.423,3.474,3.387C155.402,436.407,204.387,456,256,456    c4.599,0,9.304-0.164,13.985-0.488c47.366-3.296,92.144-23.45,126.083-56.751c0.452-0.441,0.908-0.889,1.355-1.336    c37.764-37.772,58.566-87.991,58.576-141.406c0-53.429-20.803-103.662-58.576-141.444c-1.335-1.335-2.438-2.411-3.473-3.386    C356.607,75.593,307.616,56,255.98,56z"/>

<path d="M50.938,246.861c-2.123,0-4.092-1.362-4.766-3.494c-0.833-2.633,0.627-5.442,3.26-6.275l0.486-0.166    c50.126-16.781,93.294-42.131,128.3-75.344c56.88-53.955,72.304-109.54,72.933-111.88c0.019-0.072,0.04-0.143,0.063-0.214    c0.622-2.054,2.529-3.549,4.786-3.549c2.762,0,5,2.239,5,5c0,0.48-0.077,0.979-0.217,1.453    c-0.977,3.578-17.399,61.16-75.682,116.444c-36.071,34.224-80.487,60.324-132.014,77.574l-0.165,0.057    c-0.156,0.054-0.316,0.109-0.476,0.16C51.946,246.786,51.438,246.861,50.938,246.861z"/>

<path d="M270.135,466.061c-0.814,0-1.641-0.199-2.404-0.62c-2.193-1.206-3.123-3.815-2.289-6.095l0.036-0.108    c0.044-0.133,0.088-0.264,0.134-0.393c18.628-55.595,47.449-102.763,85.659-140.187c52.896-51.824,104.969-66.531,108.345-67.444    c0.473-0.139,0.968-0.214,1.444-0.214c2.762,0,5,2.239,5,5c0,2.253-1.489,4.157-3.537,4.782c-0.079,0.025-0.159,0.049-0.239,0.07    c-0.518,0.138-52.344,14.325-104.015,64.949c-37.086,36.322-65.077,82.176-83.197,136.286c-0.021,0.061-0.042,0.12-0.064,0.181    l-0.101,0.303c-0.101,0.311-0.232,0.62-0.386,0.897C273.61,465.124,271.899,466.061,270.135,466.061z"/>

<path d="M399.57,407.335c-2.19,0-4.053-1.406-4.729-3.366c-1.218-3.07-14.674-36.233-44.185-78.894    c-22.314-32.28-48.093-61.841-76.617-87.861c-29.014-26.475-60.897-49.222-94.766-67.61    c-26.996-14.665-55.761-26.814-85.497-36.112c-2.636-0.824-4.104-3.628-3.28-6.264c0.823-2.636,3.626-4.107,6.264-3.28    c30.354,9.49,59.72,21.895,87.285,36.868c34.577,18.773,67.123,41.991,96.733,69.01c29.081,26.529,55.359,56.662,78.103,89.561    c30.455,44.026,43.904,77.44,45.338,81.105c0.227,0.58,0.35,1.214,0.35,1.837C404.57,405.092,402.332,407.335,399.57,407.335z"/>

<path d="M114.59,409.46c-1.278,0-2.554-0.482-3.526-1.454c-1.953-1.953-1.973-5.099-0.02-7.051l282.714-296.854    c0.028-0.029,0.057-0.059,0.086-0.087c1.951-1.953,5.138-1.973,7.091-0.02c1.951,1.952,1.973,5.095,0.023,7.048L118.241,407.898    c-0.028,0.029-0.056,0.059-0.085,0.087C117.174,408.967,115.881,409.46,114.59,409.46z"/>

<path d="M411,466H71c-2.761,0-5-2.238-5-5s2.239-5,5-5h340c2.762,0,5,2.238,5,5S413.762,466,411,466z"/>

<path d="M451,466h-10c-2.762,0-5-2.238-5-5s2.238-5,5-5h10c2.762,0,5,2.238,5,5S453.762,466,451,466z"/>

</g>

</g>

<g id="Layer_1"/>

</svg>`,
    bananaSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M746.666667 234.666667c21.333333 0 149.333333-21.333333 149.333333 170.666666S618.666667 938.666667 234.666667 938.666667c-42.666667 0-85.333333-21.333333-85.333334-21.333334l-21.333333-64s21.333333-85.333333 149.333333-149.333333 218.944-117.632 273.344-172.010667C593.344 489.344 661.333333 405.333333 661.333333 341.333333c0-41.770667 42.666667-85.333333 42.666667-85.333333" fill="#FFE082" /><path d="M170.666667 874.666667s149.333333-42.666667 277.333333-106.666667 405.333333-256 320-533.333333c0 0 128-21.333333 128 170.666666S618.666667 938.666667 234.666667 938.666667c-42.666667 0-85.333333-21.333333-85.333334-21.333334l21.333334-42.666666z" fill="#FFCA28" /><path d="M876.010667 297.344C836.010667 211.562667 746.666667 256 746.666667 85.333333c-64 0-106.666667 42.666667-106.666667 42.666667s64 64 64 128c42.666667 0 77.056-3.349333 80.874667 101.333333 28.842667-122.218667 91.136-59.989333 91.136-59.989333z" fill="#C0CA33" /><path d="M661.333333 341.333333s-1.344-38.677333 42.666667-85.333333 85.994667-8.661333 85.994667-8.661333l-5.12 109.994666s-18.666667-69.333333-48-71.104C675.008 282.496 661.333333 341.333333 661.333333 341.333333z" fill="#C0CA33" /><path d="M128 874.666667l21.333333 42.666666h21.333334v-42.666666l-42.666667-21.333334z" fill="#5D4037" /><path d="M746.666667 85.333333c-64 0-106.666667 42.666667-106.666667 42.666667h64l42.666667-42.666667z" fill="#827717" /></svg>',
    burgerSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M32 831.328a160 160 0 0 0 160 160h640a160 160 0 0 0 160-160H32z" fill="#E29460" /><path d="M832 959.328H192a160 160 0 0 1-156.768-128H32a160 160 0 0 0 160 160h640a160 160 0 0 0 160-160h-3.232a160 160 0 0 1-156.768 128z" fill="" /><path d="M960 607.328H64a64 64 0 0 0 0 128h896a64 64 0 0 0 0-128z" fill="#EF4D4D" /><path d="M960 703.328H64a63.904 63.904 0 0 1-61.76-48c-1.312 5.184-2.24 10.464-2.24 16a64 64 0 0 0 64 64h896a64 64 0 0 0 64-64c0-5.568-0.928-10.848-2.24-16a63.872 63.872 0 0 1-61.76 48z" fill="" /><path d="M960 351.328H64a64 64 0 0 0 0 128h896a64 64 0 0 0 0-128z" fill="#EF4D4D" /><path d="M960 447.328H64a63.904 63.904 0 0 1-61.76-48c-1.312 5.184-2.24 10.464-2.24 16a64 64 0 0 0 64 64h896a64 64 0 0 0 64-64c0-5.568-0.928-10.848-2.24-16a63.872 63.872 0 0 1-61.76 48z" fill="" /><path d="M32 767.328h960v32H32z" fill="#469FCC" /><path d="M32 511.328h960v64H32z" fill="#EDD87E" /><path d="M405.024 765.056l-126.4 126.4a31.968 31.968 0 0 1-45.248 0l-126.4-126.4h-24.224l152.896 152.896a31.968 31.968 0 0 0 45.248 0l152.896-152.896h-28.768z" fill="" /><path d="M233.376 891.456a31.968 31.968 0 0 0 45.248 0l126.4-126.4H106.976l126.4 126.4zM570.496 765.056l92.128 92.128a31.968 31.968 0 0 0 45.248 0L800 765.056h-229.504z" fill="#EDD87E" /><path d="M800 765.056l-92.128 92.128a31.968 31.968 0 0 1-45.248 0l-92.128-92.128h-24.224l118.624 118.624a31.968 31.968 0 0 0 45.248 0l118.624-118.624H800zM928 383.328c-57.6 0-96-64-96-64s-64 64-160 64-160-64-160-64-38.4 64-96 64-96-64-96-64-64 64-160 64-160-64-160-64v32s64 64 160 64 160-64 160-64 38.4 64 96 64 96-64 96-64 64 64 160 64 160-64 160-64 38.4 64 96 64 96-64 96-64v-32s-38.4 64-96 64z" fill="" /><path d="M512.128 31.328c-256 0-480 96-480 224h960c0-128-224-224-480-224z" fill="#E29460" /><path d="M720.128 143.328m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="" /><path d="M592.128 111.328m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="" /><path d="M432.128 175.328m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="" /><path d="M464.128 111.328m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="" /><path d="M272.128 111.328m-16 0a16 16 0 1 0 32 0 16 16 0 1 0-32 0Z" fill="" /><path d="M864 223.328c-96 0-160 64-160 64s-38.4-64-96-64-96 64-96 64-64-64-160-64-160 64-160 64-38.4-64-96-64-96 64-96 64v32s64 64 160 64 160-64 160-64 38.4 64 96 64 96-64 96-64 64 64 160 64 160-64 160-64 38.4 64 96 64 96-64 96-64v-32s-64-64-160-64z" fill="#3AAD73" /></svg>',
    carSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M766.976 508.736c80.576 0 152.448 32.128 199.232 82.176" fill="#AEBCC3" /><path d="M64.704 684.992c10.816 19.2 32.064 32.192 56.576 32.192h784.64c35.84 0 64.832-27.648 64.832-61.76v-17.408h-36.608a15.744 15.744 0 0 1-16.064-15.296V550.912a277.568 277.568 0 0 0-150.144-44.16h1.6l-55.04-0.256c-53.632-115.2-157.504-210.752-294.208-210.752-136.512 0-251.008 89.728-282.176 210.688h-16.832c-35.456 0-56.128 27.392-56.128 61.184" fill="#E8447A" /><path d="M64.704 654.464h13.76a39.168 39.168 0 0 0 40.064-38.272v-17.6c0-21.12-17.92-38.208-40.064-38.208h-13.376" fill="#F5BB1D" /><path d="M160 684.992a101.632 96.832 0 1 0 203.264 0 101.632 96.832 0 1 0-203.264 0Z" fill="#455963" /><path d="M218.88 684.992a42.752 40.768 0 1 0 85.504 0 42.752 40.768 0 1 0-85.504 0Z" fill="#AEBCC3" /><path d="M652.032 684.992a101.568 96.832 0 1 0 203.136 0 101.568 96.832 0 1 0-203.136 0Z" fill="#455963" /><path d="M710.912 684.992a42.752 40.768 0 1 0 85.504 0 42.752 40.768 0 1 0-85.504 0Z" fill="#AEBCC3" /><path d="M966.272 591.104v-0.192a257.92 257.92 0 0 0-48.192-40V622.72c0 8.448 7.232 15.296 16.064 15.296h36.608v-42.304l-4.48-4.608z" fill="#F5BB1D" /><path d="M405.568 335.616c-104.896 6.336-191.296 76.8-216.64 170.816h216.64V335.616zM445.696 506.432h216.64c-41.216-86.848-117.12-159.616-216.64-170.048v170.048z" fill="#631536" /></svg>',
    cupcakeSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M512 213.333333m-85.333333 0a85.333333 85.333333 0 1 0 170.666666 0 85.333333 85.333333 0 1 0-170.666666 0Z" fill="#F44336" /><path d="M874.666667 554.666667c0-94.272-162.368-170.666667-362.666667-170.666667S149.333333 460.394667 149.333333 554.666667c0 22.634667 10.688 33.088 29.546667 36.010666C188.032 630.058667 329.685333 661.333333 512 661.333333c180.992 0 321.344-30.826667 332.266667-69.781333C863.936 590.613333 874.666667 580.629333 874.666667 554.666667z" fill="#795548" /><path d="M746.666667 874.666667H277.333333L170.666667 576l42.666666 42.666667 42.666667-42.666667 42.666667 42.666667 42.666666-42.666667 42.666667 42.666667 42.666667-42.666667 42.666666 42.666667 42.666667-42.666667 42.666667 42.666667 42.666666-42.666667 42.666667 42.666667 42.666667-42.666667 42.666666 42.666667 42.666667-42.666667 42.666667 42.666667 42.666666-42.666667z" fill="#FF80AB" /><path d="M874.666667 554.666667a82.986667 82.986667 0 0 0-3.776-23.317334l-18.453334-14.890666L810.666667 558.336l-12.501334-12.501333L768 515.669333l-30.165333 30.165334-12.501334 12.501333-12.501333-12.501333L682.666667 515.669333l-30.165334 30.165334-12.501333 12.501333-12.501333-12.501333L597.333333 515.669333l-30.165333 30.165334-12.501333 12.501333-12.501334-12.501333L512 515.669333l-30.165333 30.165334-12.501334 12.501333-12.501333-12.501333L426.666667 515.669333l-30.165334 30.165334-12.501333 12.501333-12.501333-12.501333L341.333333 515.669333l-30.165333 30.165334-12.501333 12.501333-12.501334-12.501333L256 515.669333l-30.165333 30.165334-12.501334 12.501333-42.666666-40.106667-19.562667 19.904A82.410667 82.410667 0 0 0 149.333333 554.666667c0 20.842667 9.386667 31.018667 25.557334 34.858666L170.666667 576l42.666666 42.666667 42.666667-42.666667 42.666667 42.666667 42.666666-42.666667 42.666667 42.666667 42.666667-42.666667 42.666666 42.666667 42.666667-42.666667 42.666667 42.666667 42.666666-42.666667 42.666667 42.666667 42.666667-42.666667 42.666666 42.666667 42.666667-42.666667 42.666667 42.666667 42.666666-42.666667-4.714666 15.04C865.450667 588.842667 874.666667 578.581333 874.666667 554.666667z" fill="#5D4037" /><path d="M426.666667 576l-42.666667 42.666667 45.354667 256h27.541333zM341.333333 576l-42.666666 42.666667 64 256h32.021333zM256 576l-42.666667 42.666667 85.333334 256h31.104zM597.077333 576L554.666667 618.666667l-13.098667 256h25.536zM682.410667 576L640 618.666667l-39.104 256h27.541333zM768 576l-42.666667 42.666667-62.229333 256 30.229333 0.896zM512 576l-42.666667 42.666667 16.021334 256H512zM810.666667 618.666667l42.666666-42.666667-106.666666 298.666667h-25.770667z" fill="#F8BBD0" /><path d="M744.810667 377.429333c0 96.426667-104.213333 36.757333-232.810667 36.757334s-232.810667 59.669333-232.810667-36.757334C279.189333 280.981333 383.402667 234.666667 512 234.666667s232.810667 46.314667 232.810667 142.762666z" fill="#FFE0B2" /></svg>',
    dogSVG: '<svg width="800px" height="800px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet"><path d="M28.94 63.15s-2.39 6.9-.99 14.22c1.41 7.32 3.38 14.08 3.38 14.08s.42 14.36 0 15.91c-.42 1.55-3.66 3.52-3.66 6.34s1.03 6.38 6.24 7.23s9.43-.89 11.17-3c2.51-3.05 2.02-5.21 2.02-7.46s.14-15.2.7-17.18c.56-1.97 1.41-3.1 2.96-2.96c1.55.14 3.24 2.53 3.38 7.04c.14 4.5.28 12.39.14 13.94c-.14 1.55-1.55 6.76-.42 8.87c1.13 2.11 6.24 4.16 10.18 3.94c5.16-.28 8.26-3.52 8.54-6.05c.28-2.53-1.41-8.31-1.41-10c0-1.69 1.97-13.23 2.53-13.94c.56-.7 2.28-.55 6.05-2.25c3.43-1.55 5.26-3.1 5.26-3.1s.09 10-.05 11.12c-.14 1.13-3.52 4.65-2.96 7.32s3.86 4.23 6.8 4.5c4.97.47 9.81-3.38 11.07-6.76c1.27-3.38.7-7.6.42-9.85c-.28-2.25-.28-10.14 0-12.25c.28-2.11.74-3.39.92-4.5c.28-1.83.21-3.87.21-3.87s4.86 0 7.74-1.9s5.91-5.21 7.25-9.29c1.31-3.99.99-5.21-.14-5.35c-1.13-.14-6.19 6.96-10.49 7.18c-6.83.35-6.15-6.97-11.36-11.4c-5.87-5-15.02-5.63-15.02-5.63s1.58-5.91 1.6-10.28c.07-19.08-9.22-25.55-9.22-25.55S60.61 3.95 47.94 4.51S25.98 15.14 25.98 15.14L19.01 45.9s1.76 5.91 4.58 10.21c2.96 4.5 5.35 7.04 5.35 7.04z" fill="#ffd2b1"></path><path d="M20.14 8.32C9.79 8.53 4.32 17.35 4.16 22.75c-.09 3.17-1.34 26.21 11.4 26.68c5.11.19 8.91-5.74 10.84-12.46c2.43-8.47 2.32-16.96 2.6-19.22c.45-3.61 1.2-6.26 1.2-6.26s-1.26-3.35-10.06-3.17z" fill="#865b52"></path><path d="M75.54 4.8c11.26.42 15.1 5.41 16.19 8.31c1.2 3.17 2.25 14.48.49 22.03c-1.43 6.16-3.59 9.29-8.66 9.08c-4.64-.19-6.99-6.88-10.49-15.98c-3.38-8.8-5.97-16.68-6.41-17.81c-.56-1.48-1.76-2.11-1.76-2.11s2.25-3.84 10.64-3.52z" fill="#865b52"></path><path d="M62.66 27.67c-5.56.35-8.22 6.53-7.04 12.74c1.27 6.69 5.66 9.86 11.19 9.15c6.05-.77 7.88-7.67 7.11-12.88c-.71-4.74-3.39-9.51-11.26-9.01z" fill="#d27856"></path><path d="M69.2 39c0 2.92-1.62 5.36-4.19 5.29c-3.49-.1-4.4-3.19-4.33-5.79c.08-3.04 1.9-4.48 4.5-4.41c2.32.05 4.02 1.99 4.02 4.91z" fill="#060401"></path><path d="M39.85 40.61c0 3.04-1.62 5.58-4.19 5.5c-3.49-.1-4.4-3.32-4.33-6.03c.08-3.17 2.25-4.52 4.29-4.37c2.31.17 4.23 1.86 4.23 4.9z" fill="#060401"></path><path d="M53.22 57.59s6.12-.63 5.84-5.07c-.28-4.43-4.43-4.72-7.67-4.65c-3.24.07-7.88 1.76-7.39 5.49c.49 3.73 5.77 4.22 5.77 4.22s-.01 2.76-1.83 2.96c-1.97.21-4.79-2.82-5.56-3.59c-.77-.77-1.97-.49-2.39.14s-.14 2.04 1.06 3.24s4.01 4.22 6.83 3.94c2.82-.28 2.89-1.76 4.01-1.83c1.13-.07 1.06 1.62 3.87 1.55c1.98-.05 5.97-3.53 6.69-4.15c1.62-1.41 2.04-2.82 1.34-3.73s-2.67.42-3.73 1.2c-1.06.77-2.77 2.59-4.43 2.89c-2.76.49-2.41-2.61-2.41-2.61z" fill="#060401"></path><path d="M78.21 50.99s-1.33 2.92-2.44 5.26c-1.34 2.82-3.26 5.28-3.26 5.28s2.17 14.84 15.08 13.56c4.62-.46 8.12-4.08 8.45-7.92c.56-6.48-1.9-9.51-5.72-12.47c-6.19-4.78-12.11-3.71-12.11-3.71z" fill="#d27856"></path><path d="M69.27 74.2c-2.29 2.1-1.06 6.05 1.97 6.48c3.03.42 4.66-2.1 4.43-4.01c-.34-2.96-3.79-4.86-6.4-2.47z" fill="#d27856"></path><path d="M39.36 70.3s-2.02 5.54 2.25 12.48c1.82 2.95 5.87 4.61 8.73 4.5c3.02-.11 5.75-1.16 8.09-4.08c3.73-4.65 2.67-12.39 2.67-12.39s-5.91 2.43-11.33 2.25C44 72.88 39.36 70.3 39.36 70.3z" fill="#d27856"></path><path d="M31.99 112.7c-1.47-.45-2.06 1.83-2.16 3.28s-.09 3.33 1.22 3.8c1.31.47 1.05-2.32 1.17-3.24c.24-1.77 1.32-3.37-.23-3.84z" fill="#d27856"></path><path d="M37.76 113.55c-.88-.04-1.81.85-1.92 3.43c-.09 2.16 0 3.94 1.22 4.04c1.64.13 1.18-1.97 1.27-3.71c.04-.99 1.26-3.67-.57-3.76z" fill="#d27856"></path><path d="M60.15 116.36c-1.41 0-1.45 1.6-1.45 3.33c0 1.74-.36 3.89 1.22 4.08c1.92.23 1.55-2.35 1.55-3.8c-.01-1.26.22-3.61-1.32-3.61z" fill="#d27856"></path><path d="M66.53 116.04c-1.13.23-1.03 1.78-.99 3.66c.05 1.88-.23 3.87 1.36 3.71c1.36-.14 1.27-2.35 1.22-4.04c-.04-1.46.15-3.7-1.59-3.33z" fill="#d27856"></path><path d="M85.86 103.81c-.97-.19-2.07.63-2.35 2.82c-.23 1.88-.14 3.53 1.5 3.89c.84.19.99-1.97 1.03-3.52c.05-1.34 1.04-2.95-.18-3.19z" fill="#d27856"></path><path d="M91.16 104.95c-.93-.15-1.84.42-2.08 2.75c-.14 1.36-.64 3.8 1.05 3.89c1.31.06 1.21-2.09 1.33-3.21c.19-1.77 1.23-3.17-.3-3.43z" fill="#d27856"></path></svg>',
    icecreamSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M288.281165 380.158787l220.496463 616.497343L764.821922 394.054196z" fill="#F1C84F" /><path d="M723.472906 409.13842L495.709816 960.441876l18.795839 49.793027 242.969624-600.697544z" fill="#F0841B" /><path d="M617.01802 739.099526a5.075322 5.075322 0 0 1-4.724393-6.917984l147.199207-376.574055H258.734559l59.434996 152.053913a5.073036 5.073036 0 0 1-9.447644 3.691039L243.87781 345.463701H774.350726l-152.609455 390.411166a5.07075 5.07075 0 0 1-4.723251 3.224659zM593.013118 800.507497a5.071893 5.071893 0 0 1-4.722108-6.917985l12.878059-32.941585a5.079895 5.079895 0 0 1 6.568199-2.880588 5.071893 5.071893 0 0 1 2.878302 6.571628l-12.875773 32.941585a5.075322 5.075322 0 0 1-4.726679 3.226945zM509.114839 1023.998857L356.261906 632.972708a5.069607 5.069607 0 0 1 2.878302-6.569342 5.07075 5.07075 0 0 1 6.570485 2.878302l143.404146 366.854355 66.599888-170.36851c1.02078-2.610819 3.963095-3.886508 6.570485-2.880589a5.075322 5.075322 0 0 1 2.878302 6.571628l-76.048675 194.540305zM346.196993 598.363353a5.074179 5.074179 0 0 1-4.725536-3.226945l-16.613679-42.500108a5.069607 5.069607 0 0 1 2.878302-6.570485 5.067321 5.067321 0 0 1 6.569342 2.878302l16.613679 42.500109a5.071893 5.071893 0 0 1-4.722108 6.919127z" fill="" /><path d="M312.994784 178.969124a210.209791 171.567613 0 1 0 420.419581 0 210.209791 171.567613 0 1 0-420.419581 0Z" fill="#EC7699" /><path d="M536.997105 7.399226c-7.062014 0-14.033723 0.323495-20.905984 0.933905 101.273256 9.489938 180.427708 91.450678 180.427708 191.173902 0 44.902885-16.09243 86.171886-42.977921 118.88028 50.574901-31.135502 83.555351-81.959597 83.555352-139.419332 0-94.755353-89.589726-171.568756-200.099155-171.568755z" fill="#D8476D" /><path d="M332.587357 83.811403a5.075322 5.075322 0 0 1-3.740193-8.497735c10.993102-12.004738 23.616252-22.92011 37.513948-32.440912a5.078752 5.078752 0 0 1 7.051726 1.319127 5.074179 5.074179 0 0 1-1.319127 7.051726C358.831574 60.324321 346.799402 70.727588 336.329835 82.165353a5.060462 5.060462 0 0 1-3.742478 1.64605z" fill="#040000" /><path d="M509.113696 394.797205c-126.47726 0-229.372562-88.549514-229.372561-197.391172 0-28.987635 7.130599-56.913338 21.195186-83.002096a5.073036 5.073036 0 0 1 8.92868 4.815841c-13.258708 24.591308-19.980081 50.897252-19.98008 78.186255 0 103.247373 98.345801 187.246243 219.228775 187.246243 120.881832 0 219.231062-83.99887 219.231062-187.246243 0-103.248516-98.348087-187.247386-219.231062-187.247387-35.019724 0-68.482558 6.843683-99.460314 20.342441a5.067321 5.067321 0 0 1-6.674506-2.623393 5.069607 5.069607 0 0 1 2.623393-6.674506c32.261446-14.058871 67.087988-21.188328 103.511427-21.188328 126.474974 0 229.373705 88.549514 229.373705 197.392316-0.001143 108.840515-102.89873 197.390029-229.373705 197.390029z" fill="#040000" /><path d="M517.027312 68.711177m-7.913616 0a7.913616 7.913616 0 1 0 15.827233 0 7.913616 7.913616 0 1 0-15.827233 0Z" fill="#E5C569" /><path d="M541.227684 52.885087m-7.912473 0a7.912473 7.912473 0 1 0 15.824946 0 7.912473 7.912473 0 1 0-15.824946 0Z" fill="#E5C569" /><path d="M541.227684 84.536123m-7.912473 0a7.912473 7.912473 0 1 0 15.824946 0 7.912473 7.912473 0 1 0-15.824946 0Z" fill="#E5C569" /><path d="M575.642713 60.79756a7.914759 7.914759 0 0 1-15.827233 0 7.914759 7.914759 0 0 1 15.827233 0z" fill="#E5C569" /><path d="M478.131368 92.844105m-10.375833 0a10.375833 10.375833 0 1 0 20.751667 0 10.375833 10.375833 0 1 0-20.751667 0Z" fill="#E5C569" /><path d="M575.642713 113.775238a7.914759 7.914759 0 1 1-7.912473-7.913617c4.367749 0 7.912473 3.543581 7.912473 7.913617z" fill="#E5C569" /><path d="M517.027312 44.972614m-7.913616 0a7.913616 7.913616 0 1 0 15.827233 0 7.913616 7.913616 0 1 0-15.827233 0Z" fill="#E5C569" /><path d="M575.642713 84.536123a7.914759 7.914759 0 1 1-7.912473-7.913616c4.367749 0 7.912473 3.543581 7.912473 7.913616z" fill="#E5C569" /><path d="M598.709138 84.536123m-7.913616 0a7.913616 7.913616 0 1 0 15.827232 0 7.913616 7.913616 0 1 0-15.827232 0Z" fill="#E5C569" /><path d="M606.621611 121.688854m-7.913616 0a7.913616 7.913616 0 1 0 15.827233 0 7.913616 7.913616 0 1 0-15.827233 0Z" fill="#E5C569" /><path d="M441.591334 455.016362l-6.524761-7.798165-30.623398 29.609477 6.524762 7.798164zM448.902541 447.947489l48.302437-46.703253-0.134884-0.161176-13.839398-0.434374-40.852916 39.500639zM397.131968 483.896546l-53.697825 51.919175 3.551583 10.673037 56.671003-54.794048zM475.179908 577.173883l-6.527047-7.800451-61.292518 59.264676 6.527047 7.799307zM520.426864 533.425519l48.302437-46.70211-6.527048-7.80045-48.302436 46.70211zM482.492259 570.103867l30.622254-29.608333-6.525904-7.80045-30.623397 29.608333zM400.049135 635.705837l-17.689327 17.104065 3.551582 10.675323 20.663649-19.978937zM637.178709 420.539606l-6.527047-7.800451-25.278306 24.441564 6.527048 7.80045zM604.591482 452.048898l-6.52819-7.80045-28.549831 27.604495 6.527047 7.80045zM644.489917 413.471877l7.782161-7.523823-14.137745-0.443519-0.171463 0.165748zM537.184572 635.468074l30.623398-29.608333-6.524761-7.798164-30.623398 29.609476zM523.34746 634.739926l-61.292518 59.263532 6.524761 7.797021 61.292519-59.262389zM726.145452 443.305398l2.970892-7.51925-5.119903 4.951869zM624.209203 537.219437l6.524762 7.798164 28.548688-27.604495-6.523619-7.798165zM692.658612 471.03792l6.523618 7.798164 20.910557-20.217844 1.808369-4.576935-5.217065-6.234416zM660.069099 502.547212l6.524761 7.797021 25.277163-24.44042-6.524761-7.797021zM568.594416 590.991562l6.524761 7.798164 48.301294-46.700967-6.524761-7.799307zM454.742591 701.073474l-42.615561 41.203844 3.551583 10.671894 45.58874-44.078717zM583.949552 691.358347l6.527048 7.799307 30.622254-29.608333-6.525904-7.80045zM514.55938 772.561217l-6.527048-7.799307-50.377146 48.709377 6.525905 7.799307zM628.411205 662.479305l17.968241-17.373834 9.028129-22.83895-33.522275 32.412334zM450.342836 820.541303l-9.212168 8.906962 3.551583 10.67418 12.186489-11.781835zM515.344683 757.691895l6.525904 7.798164 61.293662-59.26239-6.525904-7.799307zM574.114401 827.929097l7.580977-19.176488-13.059811 12.627722zM503.631434 884.229739l-33.497128 32.388329 3.551583 10.675323 36.471449-35.265488zM517.470832 884.957888l50.378289-48.709377-6.525904-7.799308-50.37829 48.71052zM723.996441 440.738017l-27.962282-33.418254-13.583346-0.426373 34.233278 40.913499z" fill="" /><path d="M716.684091 447.806889l5.217065 6.234416 4.244296-10.735907-2.149011-2.567381zM623.420471 552.088759l40.564856 48.478473 4.244296-10.738193-37.495658-44.811438zM562.202253 478.922959l7.311208-7.070016-58.860022-70.344653-13.290714-0.416085-0.157747 0.152031zM624.209203 537.219437l-48.168695-57.566044-7.311207 7.070016 48.166409 57.566043zM497.362725 401.092205l-0.292631-0.009145 0.134884 0.161176z" fill="" /><path d="M576.040508 479.653393l-6.527047-7.80045-7.311208 7.070016 6.527048 7.80045zM616.89571 544.289452l6.524761 7.799307 7.313494-7.071158-6.524762-7.798164zM660.069099 502.547212l-48.168695-57.566043-7.308922 7.067729 48.167552 57.566043zM659.282653 517.413106l25.517211 30.494228 4.24201-10.734764-22.448014-26.828337zM605.373356 437.180719l-28.100596-33.584002-13.58106-0.426373 34.371592 41.078104z" fill="" /><path d="M611.900404 444.981169l-6.527048-7.80045-7.310064 7.067729 6.52819 7.80045zM652.759034 509.614941l6.523619 7.798165 7.311207-7.068873-6.524761-7.797021zM529.872222 642.53809l46.766123 55.890272 7.311207-7.070015-46.76498-55.890273zM530.659811 627.671053l-48.167552-57.567186-7.312351 7.070016 48.167552 57.566043zM583.164249 706.227669l26.525418 31.701332 4.243152-10.738193-23.456219-28.033154zM346.232429 407.259179l-7.781018 6.507615 58.680557 70.129752 7.311207-7.068872zM410.967937 484.625838l-7.311208 7.068872 64.996132 77.678722 7.312351-7.070015z" fill="" /><path d="M410.967937 484.625838l-6.524762-7.798164-7.311207 7.068872 6.524761 7.798164zM482.492259 570.103867l-6.527047-7.80045-7.312351 7.070015 6.527047 7.800451zM529.872222 642.53809l7.31235-7.070016-6.524761-7.797021-7.312351 7.068873zM576.638345 698.428362l6.525904 7.799307 7.312351-7.070015-6.527048-7.799307zM442.37778 440.149325l-35.042585-41.87941-13.582203-0.42523 41.313581 49.373512zM614.57295 661.748871l7.31235-7.070016-46.766123-55.889129-7.311207 7.070015zM561.283209 598.061577l7.311207-7.070015-48.167552-57.566043-7.312351 7.070015zM506.588609 532.695084l7.311208-7.070015-64.997276-77.67758-7.311207 7.068873zM621.098854 669.549321l10.607881 12.676875 4.244295-10.73705-7.539825-9.009841zM448.902541 447.947489l-6.524761-7.798164-7.311207 7.068872 6.524761 7.798165zM520.426864 533.425519l-6.527047-7.80045-7.311208 7.070015 6.525904 7.80045zM561.283209 598.061577l6.524761 7.798164 7.311207-7.070015-6.524761-7.798164z" fill="" /><path d="M621.098854 669.549321l7.312351-7.070016-6.525905-7.80045-7.31235 7.070016zM637.96287 405.670283l-0.148602-0.176036-13.58106-0.42523 6.418454 7.670138zM685.346262 478.106792l7.31235-7.068872-48.168695-57.566043-7.311208 7.067729zM691.871023 485.903813l11.841275 14.152605 4.243153-10.734764-8.773221-10.48557z" fill="" /><path d="M644.489917 413.471877l-6.527047-7.801594-7.311208 7.068872 6.527047 7.800451zM691.871023 485.903813l7.311207-7.067729-6.523618-7.798164-7.31235 7.068872zM569.872391 838.666147l2.797143-7.07916-4.820413 4.661524zM561.323217 828.449203l7.31235-7.068872-46.76498-55.890272-7.311207 7.071158zM407.360343 628.638108l-54.855776-65.560819 8.730926 26.241931 38.813642 46.386617zM468.579703 701.800479l-7.31235 7.070016 46.764979 55.891415 7.312351-7.070015zM413.88739 636.437415l-7.312351 7.068873 48.167552 57.567186 7.312351-7.070016zM407.360343 628.638108l-7.311208 7.067729 6.525904 7.800451 7.312351-7.068873z" fill="" /><path d="M462.054942 694.003458l-7.312351 7.070016 6.524762 7.797021 7.31235-7.070016zM508.032332 764.76191l6.527048 7.799307 7.311207-7.071158-6.525904-7.798164zM561.323217 828.449203l6.525904 7.799308 4.820413-4.661524 1.444867-3.65789-5.478834-6.548766zM510.157338 892.027903l26.2305 31.34926 4.244296-10.738193-23.161302-27.681082zM457.655186 813.471287l-36.257691-43.332279 8.732069 26.245361 20.213272 24.156934zM464.181091 821.270594l-7.312351 7.070016 46.762694 55.889129 7.313493-7.070016z" fill="" /><path d="M457.655186 813.471287l-7.31235 7.070016 6.525904 7.799307 7.312351-7.070016zM503.631434 884.229739l6.525904 7.798164 7.313494-7.070015-6.525905-7.798165zM488.608937 972.144838l19.357096 23.136154 4.244296-10.737051-32.333461-38.642178z" fill="" /><path d="M590.797808 60.79756m-7.912473 0a7.912473 7.912473 0 1 0 15.824946 0 7.912473 7.912473 0 1 0-15.824946 0Z" fill="#E5C569" /><path d="M504.784812 97.950291m-7.912473 0a7.912473 7.912473 0 1 0 15.824946 0 7.912473 7.912473 0 1 0-15.824946 0Z" fill="#E5C569" /><path d="M626.592547 84.536123m-7.913616 0a7.913616 7.913616 0 1 0 15.827233 0 7.913616 7.913616 0 1 0-15.827233 0Z" fill="#E5C569" /><path d="M257.0485 333.573272s-78.637775 116.073993 49.148324 67.710972c0 0-26.46712 106.850395 95.021693 45.140649 33.86063-17.198941 42.594985 42.992781 42.594985 42.99278s54.606581 23.647115 90.650515-61.261655c36.040504-84.911057 38.228379 37.61454 80.826794 34.389881 42.593842-3.224659 69.894275-37.621398 76.448756-68.787763 6.549909-31.167509 55.707378 25.794983 61.164493 38.691331 5.460544 12.896348 70.346939-61.572576-20.753953-159.062202-58.981189-63.119177-84.417241-70.648715-93.150454-10.462708-8.738928 60.186007-32.374612 45.843649-73.949961-14.262341-20.111536-29.072223-73.08807-8.476017-97.291871 20.374447-15.248829 18.172855-52.33526 29.061936-81.825855-17.148646s-126.700163 7.524965-128.883466 81.685255z" fill="#FFFFFF" /><path d="M461.427385 497.515327c-11.544072 0-19.3068-3.303532-19.631438-3.444132l-2.593672-1.122515-0.409227-2.800572c-1.698633-11.610371-9.687693-41.74224-26.022458-41.742239-2.822291 0-5.938356 0.855032-9.256747 2.54109-25.788124 13.098675-47.199354 19.740032-63.638141 19.740032-13.863403 0-24.490716-4.595224-31.584736-13.659933-11.145133-14.240623-10.275241-35.859895-8.644052-47.972084-38.116356 13.199267-60.581516 11.859565-68.663166-3.374403-11.664097-21.989634 15.094511-64.705787 21.04887-73.732774 2.555951-55.258143 56.947631-102.307753 100.411366-102.307752 16.553095 0 29.610619 6.74995 37.760855 19.518272 12.704309 19.910352 27.980572 30.434787 44.174736 30.434787 13.194695 0 23.884878-7.136315 29.489452-13.816536 17.617312-21.000861 47.714888-36.241688 71.562044-36.241688 14.752727 0 26.436257 5.616004 33.786329 16.241032 8.671485 12.537418 35.060875 50.688067 49.239771 50.686924 6.898552-0.001143 12.265362-11.851563 15.520885-34.266428 2.839437-19.574284 8.999552-45.599027 29.617477-45.599027 15.932397 0 36.864672 15.451156 72.258187 53.32632 64.568616 69.096398 50.905254 124.073341 42.037157 144.501513-6.277854 14.455524-15.656912 24.550157-22.810373 24.550157-3.080629 0-5.642295-1.700919-6.847113-4.550644-4.378037-10.336968-34.831114-44.795435-47.541138-44.795434-1.016208 0-2.904593 0-3.993959 5.170198-6.858544 32.628378-35.140891 69.327302-81.025691 72.801155-21.634133 1.618616-33.707456-22.512026-43.294557-41.762815-4.759829-9.550522-11.274303-22.633194-15.490021-22.633194-1.056216 0-6.879119 1.299694-17.757912 26.930071-24.885083 58.626831-59.365268 67.380619-77.702728 67.380619z m-13.130682-11.927007c2.653113 0.762441 7.288346 1.783221 13.130682 1.783221 19.336521 0 46.894149-10.618169 68.36482-61.196499 9.852298-23.208169 17.954524-33.110763 27.096963-33.110762 10.493572 0 17.014904 13.09296 24.567304 28.254914 8.706921 17.475569 18.460913 37.255609 33.451403 36.170816 40.666592-3.078343 65.76086-35.734156 71.86725-64.77323 2.417637-11.509779 9.758565-13.228988 13.918271-13.228987 18.591226 0 48.375595 35.614131 55.702805 48.644221 3.440703-2.46336 10.698185-11.109698 15.21568-26.01217 6.757952-22.295982 10.140357-68.219648-43.16996-125.267871-20.097819-21.508393-48.688801-50.107377-64.846388-50.107377-3.516147 0-14.223476 0-19.579999 36.910396-2.677118 18.438052-8.238254 42.95163-25.556076 42.955059-13.846257 0.001143-30.533093-15.949543-57.585476-55.059245-5.44797-7.87818-14.007432-11.869853-25.442911-11.869853-20.765384 0-48.190414 14.022292-63.792457 32.616947-9.160728 10.918801-23.09043 17.437847-37.257896 17.437847-13.830253 0-34.202414-6.092673-52.72734-35.120316-7.821026-12.257361-20.200697-14.831601-29.207108-14.8316-35.259773 0-88.722121 39.444628-90.325877 93.9369L262.074669 335.196461l-0.826454 1.219678c-8.657768 12.794613-29.362568 49.32436-21.300351 64.513747 2.523944 4.758686 8.11823 7.071159 17.099493 7.071159 11.328028 0 27.260425-3.855645 47.353671-11.460627l9.021271-3.414411-2.302184 9.373343c-0.078873 0.316636-7.651849 31.936809 5.172485 48.294435 5.143908 6.56134 12.858626 9.74942 23.581959 9.74942 14.827028 0 34.6928-6.270995 59.044059-18.641522 4.755257-2.41535 9.414494-3.640744 13.849686-3.640744 24.608455 0.001143 33.415968 36.259977 35.528399 47.327381z" fill="#040000" /></svg>',
    spoonSVG: '<svg width="800px" height="800px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet"><path d="M64.52 50.91c-.26-9.45-.37-17.84-6.27-26.94C48.75 9.32 22.97-2.35 13.03 5.16C2.01 13.49 8.8 39.24 19.57 50.64C34.25 66.2 46.7 60.17 53.49 64.02c5.84 3.31 18.2 20.38 26.28 29.74s22.17 25.12 24.99 28.07c2.82 2.95 6.94 2.65 8.07 2.05c1.61-.84 4.72-3.45 4.34-4.47c-.38-1.03-45.35-52.82-45.35-52.82l-6.92-9.23c-.01-.01-.25-1.71-.38-6.45z" fill="#9d9d9d"></path><path d="M14.5 7.56c-8.95 7.36-3.08 28.02 3.79 36.53C31.75 60.75 44.26 55.3 51.82 58.38c7.56 3.08 8.97 6.54 18.33 16.92s36.29 46.35 43.39 47.97c.9.21 3.88-2.93 5.42-4.85c1.54-1.92 2.97-4.53 1.82-6.33c-1.15-1.79-52.94-54.73-55.63-57.42c-2.69-2.69-2.95-7.95-3.2-10.51c-.26-2.56-1.15-16.92-12.18-25.76S22.45 1.03 14.5 7.56z" fill="#c8c8c8"></path><path d="M53.72 29.36s1.23 14.27-11.43 12.47c-13.22-1.87-19.28-19.75-22.02-25.7c-2.58-5.61-7.84-4.81-8.03 2.27c-.22 8.27 5.78 26.76 21.93 33.17c15.2 6.03 24.94.76 24.66-8.22c-.3-9.16-5.11-13.99-5.11-13.99z" fill="#e0e0e0"></path><path d="M37.84 44.64c8.69 3.04 14.46-.57 15.02 5.01c.39 3.85-6.61 6.71-19.09 1.89s-18.71-18.9-19.65-21.92s-1.7-7.47.09-8.22s3.69 2.46 5.95 6.8s6.63 12.57 17.68 16.44z" fill="#ffffff"></path><path d="M105.55 111.81c-1.45 1.09 4.63 8.5 7.56 8.98c2.93.47 7.22-5.29 5.39-6.14c-1.23-.57-1.98 1.13-5.39.38c-3.4-.76-5.67-4.63-7.56-3.22z" fill="#ffffff"></path></svg>',
    orangeSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M510.75072 539.4944m-472.18176 0a472.18176 472.18176 0 1 0 944.36352 0 472.18176 472.18176 0 1 0-944.36352 0Z" fill="#FF7100" /><path d="M508.78976 219.22816c-20.6848-44.63616 19.46624-107.20256 89.68704-139.74528 70.21568-32.54272 143.90784-22.7328 164.59776 21.90336L508.78976 219.22816z" fill="#30C03F" /><path d="M508.78976 219.22816c20.6848 44.63616 94.37696 54.44608 164.59776 21.90336 70.21568-32.54272 110.37184-95.104 89.68704-139.74528L508.78976 219.22816z" fill="#97CF43" /><path d="M370.32448 220.49792m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M254.208 313.6768m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M743.41376 281.06752m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M859.53024 388.224m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M767.06816 434.816m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M631.59296 346.65472m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M878.16704 565.26848m-23.6544 0a23.6544 23.6544 0 1 0 47.3088 0 23.6544 23.6544 0 1 0-47.3088 0Z" fill="#FFA05F" /><path d="M504.02304 224.35328s-27.4944-173.22496-8.24832-192.47104 33.90976-12.17024 41.24672-5.49888c15.12448 13.7472-16.49664 159.47776-16.49664 178.72384 0 19.24608-8.24832 38.49216-16.50176 19.24608z" fill="#5A4530" /><path d="M460.36992 221.66016s33.19808-5.24288 54.16448 0c20.9664 5.24288 22.71232 6.9888 26.20928 12.23168 3.49184 5.24288-24.45824 3.49184-24.45824 3.49184s-19.22048-5.24288-31.44704-5.24288H463.872s-13.98272-5.23776-3.50208-10.48064z" fill="#5A4530" /></svg>',
    grapeSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M799.165 406.046c0.302 52.799-40.753 108.907-96.231 108.638-54.985-0.271-95.227-55.798-95.227-107.966 0-52.016 39.99-107.705 95.227-107.966s95.93 55.187 96.231 107.294z" fill="#713FCC" /><path d="M703.327 534.753h-0.491c-31.705-0.161-61.385-14.996-83.581-41.786-20.061-24.243-31.605-55.678-31.605-86.26s11.475-61.947 31.494-86.169c22.177-26.841 51.907-41.706 83.703-41.856s61.746 14.464 84.194 41.125c20.282 24.071 32.017 55.497 32.197 86.079 0.202 34.905-14.644 70.723-39.719 95.818-21.284 21.335-48.326 33.050-76.191 33.050zM703.327 318.813h-0.291c-19.69 0.091-38.496 9.789-52.959 27.293-13.961 16.901-22.308 39.559-22.308 60.613s8.364 43.742 22.378 60.653c14.483 17.483 33.27 27.161 52.889 27.262 22.067 0.121 38.345-11.484 48.085-21.233 17.403-17.412 28.086-43.13 27.984-67.203-0.121-21.065-8.636-43.671-22.778-60.493-14.574-17.372-33.391-26.901-53.009-26.901z" fill="#000000" /><path d="M727.007 604.023c0.331 52.799-40.793 108.908-96.231 108.638-54.985-0.271-95.227-55.798-95.227-107.966 0-52.016 39.99-107.705 95.227-107.966s95.929 55.187 96.231 107.294z" fill="#713FCC" /><path d="M631.168 732.72h-0.491c-31.705-0.161-61.385-15.046-83.582-41.786-20.061-24.244-31.606-55.678-31.606-86.26s11.475-61.947 31.494-86.169c22.178-26.841 51.907-41.707 83.703-41.856s61.746 14.464 84.194 41.125c20.282 24.071 32.017 55.497 32.197 86.079 0.202 34.905-14.644 70.724-39.719 95.818-21.284 21.344-48.326 33.050-76.191 33.050zM631.168 516.779h-0.291c-19.689 0.091-38.496 9.789-52.959 27.292-13.961 16.901-22.308 39.559-22.308 60.613s8.365 43.742 22.378 60.653c14.483 17.483 33.27 27.161 52.889 27.262 22.067 0.13 38.345-11.484 48.085-21.233 17.403-17.412 28.086-43.131 27.984-67.203-0.121-21.063-8.636-43.671-22.778-60.492-14.575-17.362-33.391-26.891-53.009-26.891z" fill="#000000" /><path d="M484.678 601.876c0.302 52.799-40.753 108.907-96.231 108.638-54.995-0.231-95.227-55.798-95.227-107.977 0-52.016 39.99-107.705 95.227-107.966s95.929 55.227 96.231 107.303z" fill="#7C45E0" /><path d="M388.838 730.574h-0.521c-31.705-0.161-61.385-14.996-83.581-41.786-20.061-24.244-31.605-55.678-31.605-86.26s11.475-61.947 31.494-86.169c22.178-26.841 51.907-41.707 83.703-41.856h0.482c31.665 0 61.375 14.603 83.712 41.125 20.282 24.071 32.017 55.497 32.187 86.079 0.202 34.905-14.644 70.724-39.719 95.818-21.244 21.344-48.285 33.050-76.15 33.050zM388.838 514.633h-0.281c-19.69 0.091-38.496 9.789-52.959 27.292-13.982 16.901-22.317 39.569-22.317 60.613s8.364 43.742 22.378 60.653c14.483 17.483 33.27 27.161 52.889 27.262 22.067 0.13 38.345-11.484 48.085-21.233 17.403-17.412 28.086-43.131 27.984-67.203-0.121-21.063-8.636-43.671-22.778-60.492-14.575-17.362-33.391-26.891-53.009-26.891z" fill="#000000" /><path d="M416.281 406.046c5.267 58.667-53.662 117.906-96.231 108.638-33.28-7.242-53.050-55.587-51.706-93.633 1.495-42.217 29.86-96.561 72.539-97.474 38.858-0.833 71.857 43.010 75.398 82.469z" fill="#884CF6" /><path d="M416.281 406.046c-2.548 65.558-87.322 106.882-95.287 99.38-6.079-5.738 35.306-37.492 43.13-98.889 6.841-53.591-17.142-88.527-8.708-92.901 10.421-5.386 62.919 39.458 60.863 92.409z" fill="#713FCC" /><path d="M320.442 534.753h-0.491c-31.705-0.161-61.385-14.996-83.582-41.786-20.080-24.253-31.605-55.689-31.605-86.26 0-0.002 0-0.003 0-0.005 0-11.079 8.981-20.061 20.060-20.061 11.079 0 20.061 8.981 20.061 20.061 0 0.002 0 0.004 0 0.005 0 21.063 8.364 43.741 22.378 60.652 14.483 17.483 33.27 27.162 52.85 27.273 22.067 0.121 38.345-11.484 48.085-21.233 17.403-17.412 28.086-43.131 27.984-67.203-0.119-21.065-8.636-43.673-22.778-60.492-14.644-17.412-33.561-26.941-53.29-26.862-12.788 0.060-24.946 4.013-36.108 11.735-3.184 2.219-7.131 3.547-11.389 3.547-11.079 0-20.061-8.981-20.061-20.061 0-6.821 3.405-12.847 8.606-16.471 16.609-11.753 37.183-18.79 59.394-18.874 31.274-0.117 61.164 14.467 83.612 41.127 20.282 24.071 32.017 55.497 32.187 86.079 0.202 34.905-14.644 70.723-39.719 95.818-21.284 21.294-48.325 33.009-76.191 33.009z" fill="#000000" /><path d="M237.472 375.222c-11.070-0.011-20.041-8.989-20.041-20.061 0-3.293 0.794-6.399 2.198-9.141q0.699-1.381 1.492-2.896c3.451-6.355 10.074-10.597 17.689-10.597 11.079 0 20.061 8.981 20.061 20.061 0 3.466-0.878 6.726-2.425 9.569q-0.509 0.897-1.050 2.010c-3.373 6.608-10.13 11.054-17.924 11.054z" fill="#000000" /><path d="M628.651 755.669c0.39 64.043-49.43 132.148-116.722 131.777-22.729-0.111-43.371-8.025-60.723-20.862-17.27-12.967-30.907-29.862-39.719-49.403q17.483 28.189 16.178 26.565c-14.913-18.608-25.404-41.385-29.521-66.309 1.845 13.837-1.697-3.474-1.726-21.609 0.004-62.417 48.509-129.97 115.511-130.291s116.361 66.942 116.722 130.132z" fill="#884CF6" /><path d="M608.39 681.146c-1.746 24.353-53.532 45.929-97.143 40.602s-88.948-38.967-84.495-63.371c4.172-22.88 51.415-34.464 85.167-32.848 45.847 2.197 98.297 30.262 96.471 55.617z" fill="#713FCC" /><path d="M622.512 786.834c-21.395 74.474-110.634 110.112-119.018 100.613-7.242-8.194 51.796-42.99 61.797-115.137 7.422-53.582-16.72-95.125-0.833-104.505 10.672-6.298 30.482 7.181 40.642 17.423 35.417 35.687 18.596 97.485 17.412 101.606z" fill="#713FCC" /><path d="M512.4 907.508h-0.572c-37.172-0.18-72.017-17.633-98.117-49.148-23.741-28.646-37.353-65.789-37.353-101.888s13.571-73.171 37.222-101.797c26.078-31.565 60.974-49.047 98.297-49.228s72.438 17.051 98.839 48.406c23.972 28.507 37.835 65.568 38.045 101.687 0.242 41.213-17.303 83.522-46.932 113.171-25.045 25.045-56.772 38.797-89.43 38.797zM512.4 645.578h-0.371c-25.165 0.119-49.148 12.427-67.514 34.655-17.554 21.244-28.035 49.749-28.035 76.23s10.512 55.035 28.086 76.289c18.385 22.197 42.337 34.484 67.423 34.614h0.401c28.086 0 48.647-14.675 60.974-27.011 21.886-21.906 35.366-54.314 35.196-84.585-0.151-26.51-10.852-54.956-28.637-76.1-18.466-21.986-42.448-34.093-67.534-34.093z" fill="#000000" /><path d="M628.651 551.153c8.335 66.351-46.329 132.158-116.722 131.777-68.887-0.371-123.713-63.973-115.508-130.965 7.202-58.766 60.995-104.505 121.577-101.757 56.791 2.578 103.883 47.061 110.653 100.944z" fill="#884CF6" /><path d="M613.615 490.21c3.511 25.207-45.758 61.826-93.433 60.934-56.169-1.003-107.324-54.164-99.3-79.359 9.027-28.286 92.971-21.917 97.143-21.564 26.22 2.167 91.766 12.628 95.588 39.99z" fill="#713FCC" /><path d="M619.603 603.962c-20.561 49.399-71.063 80.554-81.246 72.579-10.762-8.386 33.963-51.164 34.515-121.727 0.592-74.695-48.827-121.938-37.462-130.914 9.629-7.602 52.7 20.313 75.478 60.965 3.551 6.369 32.929 60.924 8.717 119.099z" fill="#713FCC" /><path d="M512.4 702.99h-0.572c-37.172-0.18-72.017-17.633-98.117-49.148-23.741-28.646-37.353-65.789-37.353-101.888s13.571-73.171 37.222-101.798c26.078-31.565 60.974-49.049 98.297-49.228s72.438 17.051 98.839 48.406c23.972 28.507 37.835 65.568 38.045 101.687 0.242 41.213-17.303 83.522-46.932 113.171-25.045 25.025-56.772 38.797-89.43 38.797zM512.4 441.061h-0.371c-25.165 0.119-49.148 12.427-67.514 34.655-17.554 21.244-28.035 49.749-28.035 76.23s10.512 55.035 28.086 76.289c18.385 22.197 42.337 34.484 67.423 34.614h0.401c28.086 0 48.647-14.675 60.974-27.011 21.886-21.906 35.366-54.314 35.196-84.585-0.151-26.51-10.852-54.956-28.637-76.1-18.466-21.986-42.448-34.093-67.534-34.093z" fill="#000000" /><path d="M608.049 406.046c0.302 52.799-40.753 108.907-96.231 108.638-54.985-0.271-95.227-55.798-95.227-107.966 0-52.016 39.99-107.705 95.227-107.966s95.929 55.187 96.231 107.294z" fill="#FFFFFF" /><path d="M608.049 406.046c6.32 58.085-51.225 117.253-96.231 108.649-31.977-6.119-52.158-45.407-55.849-76.23-6.019-50 27.443-111.918 73.643-113.222 38.527-1.073 74.044 40.352 78.436 80.803z" fill="#884CF6" /><path d="M608.049 406.046c-1.163 69.76-88.165 115.82-96.231 108.638-6.238-5.546 37.362-40.522 43.922-105.237 5.939-58.587-23.001-96.842-14.514-101.606 10.201-5.738 67.755 40.813 66.821 98.206z" fill="#713FCC" /><path d="M512.209 534.753h-0.521c-31.705-0.161-61.385-14.996-83.582-41.786-20.060-24.243-31.606-55.678-31.606-86.26s11.475-61.947 31.494-86.169c22.178-26.841 51.907-41.706 83.703-41.856s61.746 14.464 84.194 41.125c20.282 24.071 32.017 55.497 32.187 86.079 0.202 34.905-14.644 70.723-39.719 95.818-21.244 21.335-48.285 33.050-76.15 33.050zM512.209 318.813h-0.291c-19.689 0.091-38.497 9.789-52.959 27.293-13.961 16.901-22.308 39.559-22.308 60.613s8.364 43.742 22.378 60.653c14.483 17.483 33.27 27.161 52.889 27.262 22.067 0.121 38.346-11.484 48.086-21.233 17.403-17.412 28.086-43.13 27.984-67.203-0.119-21.065-8.636-43.671-22.778-60.493-14.575-17.372-33.391-26.901-53.009-26.901z" fill="#000000" /><path d="M324.252 172.361c5.125-21.696 76.642-33.761 131.337-8.225 34.353 16.049 69.601 50.433 62.418 68.206-8.455 20.933-75.227 17.693-124.686-2.899-27.363-11.374-73.553-38.105-69.068-57.082z" fill="#6BE166" /><path d="M476.311 266.625c-7.956-0.027-15.77-0.501-23.453-1.396-30.985-3.463-60.683-12.691-87.596-26.567 2.683 1.954-16.223-8.518-30.215-18.688-9.027-6.549-36.4-26.469-30.311-52.227 1.825-7.733 7.583-18.676 24.634-26.931 29.439-14.294 86.65-17.303 134.706 5.146 32.416 15.664 58.793 39.439 77.168 68.745 0.246-5.111-0.055 13.825-4.639 25.17-2.517 6.238-8.355 14.865-21.805 20.492-11.374 4.754-25.327 6.259-38.486 6.259zM346.53 177.045c2.688 3.009 7.834 7.804 17.493 14.213 26.617 17.628 58.173 30.132 92.14 35.313-32.545-6.177-6.327-0.441 21.162 0.123 4.624 0.665 15.066-1.061 20.131-2.656-1.897-3.541-5.948-9.328-13.772-16.73-18.477-17.341-41.622-29.919-67.348-35.652 11.481 1.628-12.944-2.825-36.254-1.661-16.65 0.833-27.875 4.282-33.55 7.052zM324.252 172.361z" fill="#000000" /><path d="M535.089 322.112c-0.009 0-0.022 0-0.034 0-7.143 0-13.415-3.734-16.969-9.356-8.393-13.442-26.999-49.433-19.609-94.918 10.201-62.519 60.754-93.321 70.793-98.848 2.65-1.378 5.786-2.188 9.111-2.188 11.079 0 20.060 8.981 20.060 20.060 0 7.289-3.888 13.671-9.702 17.183-7.271 4.062-43.471 26.018-50.652 70.182-5.206 32.037 8.025 57.634 13.993 67.143 1.933 3.029 3.081 6.721 3.081 10.683 0 11.079-8.981 20.061-20.061 20.061-0.005 0-0.007 0-0.012 0z" fill="#000000" /></svg>',
    forkSVG: `<svg fill="#000000" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
   viewBox="0 0 510.4 510.4" xml:space="preserve">
<g>
  <g>
    <path d="M505.2,80c-6.4-6.4-16-6.4-22.4,0l-89.6,89.6c-1.6,1.6-6.4,3.2-12.8,1.6c-4.8-1.6-9.6-3.2-14.4-6.4L468.4,62.4
      c6.4-6.4,6.4-16,0-22.4c-6.4-6.4-16-6.4-22.4,0L343.6,142.4c-3.2-4.8-4.8-9.6-4.8-12.8c-1.6-6.4-1.6-11.2,1.6-12.8L430,27.2
      c6.4-6.4,6.4-16,0-22.4c-6.4-6.4-16-6.4-22.4,0L290.8,121.6c-16,16-20.8,40-14.4,62.4l-264,256c-16,16-16,43.2,0,59.2
      c6.4,6.4,16,11.2,27.2,11.2c11.2,0,22.4-4.8,30.4-12.8L319.6,232c8,3.2,16,4.8,24,4.8c16,0,32-6.4,44.8-17.6l116.8-116.8
      C511.6,96,511.6,86.4,505.2,80z M46,475.2c-3.2,3.2-9.6,3.2-14.4,0c-3.2-3.2-3.2-9.6,1.6-12.8l257.6-249.6c0,0,1.6,1.6,1.6,3.2
      L46,475.2z M316.4,192c-14.4-14.4-16-35.2-4.8-48c4.8,11.2,11.2,22.4,20.8,32c9.6,9.6,20.8,16,32,20.8
      C351.6,208,329.2,206.4,316.4,192z"/>
  </g>
</g>
</svg>`,
    knifeSVG: `<svg fill="#000000" width="800px" height="800px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg">
  <path d="M226.14209,66.14209l-50.36646,53.64545L146.49072,90.49072l51.36719-52.63287a20,20,0,0,1,28.28418,28.28424Z" opacity="0.2"/>
  <path d="M231.79883,32.2002a28.05536,28.05536,0,0,0-39.667.06933L18.27441,210.41211a8,8,0,0,0,3.92676,13.38281,155.06019,155.06019,0,0,0,34.957,4.00293c33.4209-.001,66.877-10.86914,98.32813-32.1748,31.74512-21.50391,50.14551-45.79981,50.91406-46.82325a8.00114,8.00114,0,0,0-.74316-10.457L186.919,119.60547l44.97753-47.90332A28.03445,28.03445,0,0,0,231.79883,32.2002ZM189.207,144.52148a225.51045,225.51045,0,0,1-43.10351,38.13184c-34.47071,23.23145-70,32.665-105.83887,28.13477l106.29492-108.915,23.30176,23.30175q.208.22852.43847.44434l.082.07617Zm31.27832-84.03515c-.05957.05859-.11719.11914-.1748.18066l-44.71094,47.61914L157.73535,90.42187l45.77832-46.90722a12.00079,12.00079,0,1,1,16.97168,16.97168Z"/>
</svg>`,
    plateSVG: `<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
   width="800px" height="800px" viewBox="0 0 382.556 382.556"
   xml:space="preserve">
<g>
  <g>
    <path d="M166.722,105.916c-66.319,0-120.265,53.928-120.265,120.242c0,66.319,53.945,120.253,120.265,120.253
      c66.302,0,120.248-53.934,120.248-120.253C286.97,159.844,233.024,105.916,166.722,105.916z M166.722,335.768
      c-60.429,0-109.604-49.182-109.604-109.587c0-60.423,49.176-109.599,109.604-109.599c60.411,0,109.594,49.176,109.594,109.599
      C276.316,286.586,227.133,335.768,166.722,335.768z"/>
    <path d="M165.444,150.16c-42.733,0-77.496,34.763-77.496,77.508c0,42.734,34.763,77.474,77.496,77.474
      c42.728,0,77.491-34.739,77.491-77.474C242.935,184.923,208.171,150.16,165.444,150.16z M165.444,294.476
      c-36.843,0-66.824-29.977-66.824-66.809c0-36.866,29.993-66.836,66.824-66.836c36.837,0,66.813,29.982,66.813,66.836
      C232.257,264.5,202.292,294.476,165.444,294.476z"/>
    <path d="M37.964,146.029l-4.973-0.012l1.487,52.063l-5.972-0.012v-52.052l-4.369,0.012v52.377h-4.95v-52.377h-4.815v52.377H8.516
      l1.679-52.389H5.652l-5.507,44.32c0,0-0.145,1.679-0.145,2.294c0,6.832,3.178,12.949,8.127,16.922
      c16.324,18.428,5.188,37.227,5.188,41.688c0.012,4.95,0.012,81.041,0.012,81.041l0,0c0,0.069-0.023,0.116-0.023,0.186
      c0,4.659,3.782,8.436,8.447,8.436c4.665,0,8.446-3.788,8.446-8.436c0-0.069-0.023-0.116-0.023-0.162h0.012
      c0,0,0.012-75.15,0.012-80.901c-0.012-5.182-9.435-26.804,6.303-42.872c0.012-0.035,0.046-0.082,0.076-0.105
      c3.84-3.636,6.373-8.656,6.756-14.279c0.023-0.395,0.012-1.394,0.012-1.394L37.964,146.029z"/>
    <path d="M318.003,271.714c0.023-5.02-0.14-125.645-0.14-125.645l-4.009-0.041c0,0-21.204,12.67-21.204,106.666
      c17.242,4.74,9.992,23.586,8.68,25.979c0,4.787,0.36,53.935,0.36,53.935l0.046-0.023c-0.022,0.058-0.046,0.104-0.022,0.163
      c-0.023,4.531,3.647,8.18,8.133,8.156c4.484,0.012,8.156-3.672,8.156-8.156c0-0.047,0-0.105-0.023-0.14l0.023-0.034
      C318.003,332.574,318.003,277.234,318.003,271.714z"/>
    <path d="M305.339,36.146c23.539,0,42.629,19.084,42.629,42.629c0,23.545-19.09,42.629-42.629,42.629
      c-23.54,0-42.629-19.084-42.629-42.629C262.71,55.229,281.799,36.146,305.339,36.146z"/>
    <path d="M354.486,146.041L354.486,146.041c-0.07-0.012-0.372-0.012-0.453-0.012c0,0,0,0.012,0,0.023
      c-17.963,0.291-28.082,17.48-28.082,36.198c0,18.828,11.34,32.276,21.215,35.251c5.392,7.599,1.836,25.526-1.998,35.855
      c0,4.949,0,80.715,0,80.715h0.023c0,0.047-0.023,0.104-0.023,0.162c0,4.648,3.765,8.412,8.4,8.412c0.244,0,1.127-0.023,1.359,0
      c4.647-0.023,8.412-3.764,8.412-8.412c0-0.058-0.012-0.115-0.023-0.162h0.023c0,0,0-75.766,0-80.715
      c-3.834-10.329-7.39-28.257-1.986-35.844c9.887-2.986,21.203-16.435,21.203-35.263
      C382.58,163.533,372.449,146.354,354.486,146.041z M337.616,168.087c-0.047,1.336-0.104,3.236-0.187,5.536
      c-0.046,4.485-0.418,10.625,0.419,16.045c0.162,1.272,0.604,2.725,1.046,4.015c0.418,1.354,0.906,2.695,1.44,3.973
      c0.999,2.591,2.091,4.973,3.044,7.041c0.953,2.033,1.789,3.753,2.439,4.903c0.64,1.197,1.209,1.685,1.255,1.639
      c0,0.069-0.859-0.141-1.952-1.023c-1.115-0.859-2.532-2.23-4.043-4.066c-1.51-1.824-3.09-4.067-4.578-6.664
      c-0.72-1.295-1.405-2.689-2.045-4.165c-0.604-1.534-1.092-3.009-1.429-4.758c-0.615-3.352-0.511-6.582-0.174-9.533
      c0.325-2.957,0.976-5.658,1.661-7.895c0.674-2.248,1.476-4.084,2.115-5.321c0.639-1.261,1.149-1.853,1.149-1.853
      S337.662,166.769,337.616,168.087z"/>
  </g>
</g>
</svg>`,
    catSVG: '<svg width="800px" height="800px" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--noto" preserveAspectRatio="xMidYMid meet"><path d="M19.7 45.67c-.04 0-.08 0-.12-.01c-.06-.01-1.56-.18-4.11-.64c-2.78-.51-4.61-.72-4.63-.72c-.6-.07-1.04-.61-.97-1.22c.07-.6.62-1.04 1.22-.97c.08.01 1.92.22 4.78.74c2.47.45 3.95.62 3.96.62c.6.07 1.04.61.97 1.22c-.07.56-.55.98-1.1.98z" fill="#888071"></path><path d="M10.78 50.08c-.55 0-1.03-.41-1.09-.97a1.1 1.1 0 0 1 .97-1.22c.03 0 2.81-.33 4.22-.56c1.46-.23 4.74-.75 4.74-.75l.34 2.17l-4.73.75c-1.46.24-4.2.56-4.32.57c-.05 0-.09.01-.13.01z" fill="#888071"></path><path d="M12.51 54.68c-.48 0-.92-.31-1.06-.8c-.17-.58.17-1.19.76-1.36l7.88-2.25a1.102 1.102 0 0 1 .6 2.12l-7.88 2.25c-.09.02-.2.04-.3.04z" fill="#888071"></path><path d="M53.29 84.41l-10.84 8.31s.42 17.32.14 18.02c-.28.7-4.08 5.07-3.66 7.6c.33 1.97 1.83 2.67 5.91 2.82s12.39-1.69 12.39-1.69l-3.94-35.06z" fill="#b85c3e"></path><path d="M85.11 91.02l-8.02 4.5s1.13 3.38 1.13 8.17s-.42 7.79-.7 8.78c-.28.99-2.63 2.86-2.39 5.58c.11 1.26 1.69 2.25 4.5 2.11s6.9-.42 6.9-.42l4.08-26.61l-5.5-2.11z" fill="#b85c3e"></path><path d="M33.26 27.81s-1.31-4.6-.19-11.92c1.13-7.32 3-11.17 4.79-11.36c1.78-.19 5.16 3.19 7.79 7.23c2.63 4.04 4.79 11.17 4.79 11.17l-17.18 4.88z" fill="#fb8b02"></path><path d="M63.85 97.26s.09 8.45.28 12.2c.19 3.75.01 12.08-.75 13c-1.17 1.41-2.35 1.45-4.88 1.55c-1.51.06.47-9.29.47-9.67s.09-22.81.09-22.81l4.79 5.73z" fill="#fb8b02"></path><path d="M38.79 68.08s-2.25 7.13-1.69 12.48c.56 5.35 3.66 12.11 6.76 14.83s5.91 4.13 6.19 4.79c.28.66 1.41 9.95 1.03 11.92s-3.1 7.04-2.63 9.01c.47 1.97 2.33 3.21 7.13 3.1c6.24-.14 5.91-1.08 6.38-4.97c.32-2.62-.09-20.74-.09-20.74s3.85.38 9.29 0c5.44-.38 12.2-2.82 12.2-2.82s3.85 12.01 2.53 15.67c-1.31 3.66-3.47 5.73-3.1 8.26c.38 2.53 3.66 3.66 7.7 3.28c4.04-.38 7.13-3 7.32-6.48c.19-3.47.09-22.71.66-24.21c.56-1.5 2.63-6.66 2.44-11.83s-.56-7.23-.56-7.23s4.85-1.85 9.34-5.25c3.42-2.59 5.99-6 7.36-11.08c2.25-8.35-.84-16.61-7.04-19.43c-5.96-2.71-11.83-1.69-12.01 2.63s3.66 3.38 6.57 4.5c2.91 1.13 6.19 6.29 2.72 11.36c-3.47 5.07-9.57 6.66-11.45 6.85c-1.88.19-5.35-2.72-12.58-2.91c-7.23-.19-17.64 5.07-17.93 4.41c-.28-.66 10.32-7.51 11.07-16.42c.7-8.26-1.03-12.11-1.03-12.11s-1.31-13.98-3.19-20.55S67.7 3.69 66.01 3.79c-1.69.09-7.13 6.01-9.1 8.92s-4.13 7.6-4.13 7.6s-8.4-.31-12.11 1.03c-3.38 1.22-7.23 3.28-9.67 7.13s-3.19 6.1-4.32 6.66c-1.13.56-6.48 1.69-6.95 2.35c-.47.66-1.69 9.39-1.41 10.7s.5 4.37 2.06 6.1c1.78 1.97 6.71 5.3 10.61 7.79c3.77 2.4 7.43 4.32 7.8 6.01z" fill="#ffb800"></path><path d="M73.38 77.27c3.47-.05 3.38-4.22 3.43-9.39c.04-4.52-.14-7.18-.14-7.18s-1.99.27-3.75.94c-1.74.66-3.24 1.27-3.24 1.27v7.27c-.01 2.49.27 7.14 3.7 7.09z" fill="#ff9b31"></path><path d="M79.48 60.05s0 4.36.05 8.07c.05 3.99-.33 8.31 3.66 8.26c3.43-.04 3.43-4.41 3.47-9.34c.02-2.58.09-6.99.09-6.99s-1.69-.33-3.71-.28c-1.59.04-3.56.28-3.56.28z" fill="#ff9b31"></path><path d="M44.81 41.02c-.73 1.77-2.3 4.3-4.89 3.64c-1.66-.42-1.78-3.99-.81-6.11c1.15-2.5 2.68-3.63 4.47-3.42c1.97.24 2.16 3.62 1.23 5.89z" fill="#2c312c"></path><path d="M27.67 40.48c-.05-1.13-2.96-1.92-5.21-2.77c-1.91-.71-2.96-.75-3.47-.28s-1.13 1.69-1.41 3.57s-.18 5.06.28 7.04c.47 2.02 1.22 4.55 4.55 5.87c2.86 1.13 4.55-.42 5.77-1.27c1.55-1.07.88-3.61-1.31-2.3c-1.64.99-2.77 1.27-4.04.33c-1.74-1.29-2.16-5.11-2.02-5.44c.61-1.43 3.05-1.78 4.04-2.16c.99-.38 2.87-1.6 2.82-2.59z" fill="#2c312c"></path><path d="M47.34 50.45h-.08c-.03 0-3.19-.23-5.16-.28l-5.63-.14s-1.18.1-1.18-1.06c0-1.23 1.23-1.04 1.23-1.04l5.63.14c2.02.05 5.13.27 5.26.28c.58.04 1.01.55.97 1.12c-.04.56-.5.98-1.04.98z" fill="#888071"></path><path d="M45.55 57.3c-.15 0-.31-.03-.45-.1c-.02-.01-2.51-1.2-4.76-1.97c-2.34-.79-4.96-1.64-4.96-1.64c-.55-.18-.86-.77-.68-1.32c.18-.55.77-.86 1.32-.68c0 0 2.64.85 4.99 1.65c2.38.81 4.89 2.01 5 2.07c.52.25.74.88.49 1.4c-.18.37-.56.59-.95.59z" fill="#888071"></path><path d="M40.44 61.2c-.2 0-.41-.06-.59-.18c-.02-.01-1.78-1.21-2.96-1.94c-1.23-.75-3.44-2.17-3.44-2.17s-.99-.58-.35-1.5s1.48-.28 1.48-.28s2.2 1.4 3.41 2.15c1.23.75 2.97 1.95 3.05 2c.48.33.6.98.27 1.46c-.21.3-.54.46-.87.46z" fill="#888071"></path><path d="M64.35 12.33c-.48-.17-3.59 3.45-5.14 7.04c-1.55 3.59-2.11 5.56-1.97 6.19c.06.28 1.85 1.83 4.5 3.94c2.75 2.18 4.5 3.52 5.28 3.45c.77-.07.99-6.05.35-11.47s-2.25-8.87-3.02-9.15z" fill="#fed0ab"></path></svg>',
    fishSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M207.15 570.79L70.29 682.95a11.27 11.27 0 0 1-18-11.85Q96.12 520.35 98 493.25q1.9-26.8-21.48-154a11.27 11.27 0 0 1 18.67-10.36l126.59 115.27q153.3-210 387.37-210c214.7 0 343.67 140.79 343.67 281.57s-129 281.57-343.67 281.57q-257.07 0.05-402-226.51z" fill="#FFFFFF" /><path d="M486.38 656.9q81 0 100.8-46.24c19.8-46.24-31.46-61.14-78.62-61.14-22.18 0-45 30.16-76 53.68q-39.56 29.95 53.82 53.7z" fill="#FFFFFF" /><path d="M150.29 617.39q9.35-36.93 10.19-48.71 1.17-16.56 0-112.93l114.71 67.43q142.1-194.62 359.07-194.62C814.82 328.56 930 436 949.77 553.37c-20.65 127.2-145.08 244-340.62 244q-206.37 0-340.47-146-3.57-5.32-7.06-10.79l-1.5 1.23a593.39 593.39 0 0 1-53-71z" fill="#D2E4FF" /><path d="M758.53 260.3c123.69 47.14 194.29 151.31 194.29 255.47 0 140.79-129 281.57-343.67 281.57q-76.31 0-142.74-20 210.51-34.23 210.51-280.07 0.01-154.66 81.61-236.97z" fill="#648AFF" /><path d="M782.13 774.23l-17.93 12.34c-59.2-70.44-93.07-167.39-93.07-270.82S705 315.36 764.2 244.92l55.8 40.5c-52.24 62.16-103.8 137.29-103.8 230.33s13.72 196.32 65.93 258.48z" fill="#FFFFFF" /><path d="M486.38 656.9q81 0 100.8-46.24c19.8-46.24-31.46-61.14-78.62-61.14-22.18 0-45 30.16-76 53.68q-39.56 29.95 53.82 53.7z" fill="#FFFFFF" /><path d="M480.58 655.39q-43.52-18.77-14.26-40.92c31.07-23.52 53.86-53.68 76-53.68a194.76 194.76 0 0 1 31.36 2.41c15.73 9.53 23.2 24.7 13.45 47.47q-19.8 46.24-100.8 46.24-2.92-0.76-5.75-1.52z" fill="#D2E4FF" /><path d="M569.44 560.83c18.59 9.31 28.34 25.08 17.75 49.83q-17.4 40.64-82.08 45.56-46.16-19.11-16.24-41.75c31.07-23.52 53.86-53.68 76-53.68q2.29 0 4.57 0.04z" fill="#648AFF" /><path d="M339.43 334.65l-29.29-9.27c15.71-49.6 39.21-87.57 69.84-112.85 31.14-25.7 70-38.73 115.5-38.73 54.83 0 100.37 16.59 135.36 49.32l29.37 27.46-40.2-0.89c-3.58-0.08-7.23-0.12-10.86-0.12v-4.68c-29-26.79-67.27-40.37-113.67-40.37-77.27-0.01-128.32 42.56-156.05 130.13z" fill="" /><path d="M609.15 817.83c-88.86 0-169.3-19.94-239.09-59.28C306.24 722.58 250 669.63 202.62 601L83.27 698.79a31.75 31.75 0 0 1-50.61-33.4C68.35 542.52 76.8 503.18 77.61 491.8c0.64-9-1.26-40.41-21.19-148.9a31.74 31.74 0 0 1 25.49-37 31.93 31.93 0 0 1 27.09 7.81l110 100.18c49.39-63.24 105.33-112 166.54-145.21 67.29-36.47 142.53-55 223.64-55 54 0 104.94 8.56 151.28 25.43 43.54 15.89 82.11 38.7 114.68 67.81 62.38 55.74 98.16 131.87 98.16 208.85s-35.78 153.11-98.16 208.85c-32.58 29.11-71.17 51.91-114.71 67.77-46.34 16.88-97.24 25.44-151.28 25.44zM212 540.35l12.42 19.41c46.26 72.31 102 127.19 165.77 163.11 63.58 35.83 137.26 54 219 54 49.25 0 95.43-7.72 137.27-23 38.63-14.07 72.76-34.19 101.43-59.82 53.69-48 84.49-113 84.49-178.31s-30.8-130.33-84.49-178.31c-28.68-25.63-62.8-45.75-101.43-59.82-41.84-15.24-88-23-137.27-23-74.21 0-142.89 16.83-204.12 50-61.57 33.37-117.66 84.35-166.71 151.54l-13.46 18.44L101.54 362.3c16.73 94.36 17.74 120.81 16.92 132.39s-5.86 40.46-38.26 153.65z" fill="" /><path d="M743.24 785.26c-29-34.58-51.87-75.25-67.83-120.88a458.32 458.32 0 0 1 0-297.26c16-45.63 38.78-86.3 67.83-120.88l31.37 26.34c-25.85 30.78-46.21 67.13-60.53 108.07a417.37 417.37 0 0 0 0 270.21c14.32 40.93 34.69 77.29 60.53 108.07zM501.8 678q-8.29 0-17.09-0.72l-1.71-0.14-1.66-0.42c-52-13.22-76-28.13-80.41-49.85-2-10.07-0.35-25.19 19.24-40 9.32-7.06 18-14.9 26.4-22.49 20.11-18.17 39.1-35.34 62-35.34 27 0 75.22 4.52 95.19 34.78 7.13 10.81 13.31 29.1 2.26 54.9a92.09 92.09 0 0 1-44 46.65C545.24 673.79 525 678 501.8 678z m-12.06-41.41c41.21 3 67.65-8.43 78.61-34 4.69-10.94 2.06-14.92 1.2-16.22-5.2-7.89-26.51-16.37-61-16.37-7.14 0-22.33 13.73-34.54 24.77-8.62 7.79-18.4 16.63-29.14 24.76l-0.52 0.4c5.56 3.55 18.1 9.63 45.39 16.69z" fill="" /><path d="M783.81 493.25a33.8 33.79 0 1 0 67.6 0 33.8 33.79 0 1 0-67.6 0Z" fill="#FFFFFF" /><path d="M817.61 537.28a44 44 0 1 1 44-44 44.09 44.09 0 0 1-44 44z m0-67.58a23.55 23.55 0 1 0 23.56 23.55 23.58 23.58 0 0 0-23.56-23.55z" fill="" /></svg>',
    birdSVG: '<svg width="800px" height="800px" viewBox="0 0 1024 1024" class="icon"  version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M484.32 375.24C575.25 255.5 857.87 527.6 788.67 581.07c-94.76 73.21-491.01 39.99-304.35-205.83z" fill="#1C80AA" /><path d="M401.03 749.89l-4.85 133.8-77.69 21.37h66.36l19.42 35.27 4.86-35.27 40.46 6.14-38.84-25.89 8.09-114.91-17.81-20.51zM524.36 771.23l10.48 133.48-74.73 30.11 65.92-7.59 23.33 32.82 0.79-35.6 40.89 1.48-41.54-21.28-5.11-115.08-20.03-18.34z" fill="#3B5174" /><path d="M224.73 264.77l-24 50.19a21.7 21.7 0 0 1-37.73 2.5l-31.57-48.27a21.7 21.7 0 0 1 17.41-33.57l55.61-1.92a21.7 21.7 0 0 1 20.28 31.07z" fill="#DE7B56" /><path d="M900.53 638.76c-18.3 86.91-221.86 208.13-478 171.54C150.46 771.44 26 281.88 315 103.56c161.25-99.49 326.71 5 356.8 130.37C713 405.47 583.15 534.58 749.57 609c86.91 38.91 164.43-34.33 150.96 29.76z" fill="#FDD2BE" /><path d="M365.86 264.78m-32.45 0a32.45 32.45 0 1 0 64.9 0 32.45 32.45 0 1 0-64.9 0Z" fill="" /><path d="M512.24 366c137.48-60.86 253.34 314 166.92 327.31C560.81 711.56 230 490.92 512.24 366zM223.3 530c-9.34-2.6-17.2-12.8-23.94-31a195 195 0 0 1-7.64-27 7.28 7.28 0 0 1 14.3-2.79c4.79 24.5 15 46.44 21.91 46.93 1.12 0.08 11.43-0.5 27.23-45.51a7.28 7.28 0 1 1 13.74 4.82c-13.61 38.77-27 56.31-42 55.22a18.18 18.18 0 0 1-3.6-0.67zM340.8 590.36c-9.63 1.14-20.77-5.32-33.92-19.63a195 195 0 0 1-17.32-22.11 7.28 7.28 0 0 1 12.17-8c13.73 20.85 31.53 37.27 38.07 35.12 1.07-0.35 10.38-4.8 7.93-52.44a7.28 7.28 0 1 1 14.55-0.75c2.11 41-3.59 62.33-17.95 67a18.18 18.18 0 0 1-3.53 0.81zM261.5 659.71c-9-0.19-18.35-7.55-28.56-22.35a180.41 180.41 0 0 1-13-22.49 6.74 6.74 0 0 1 12.18-5.77c9.9 20.88 24.1 38.21 30.37 37.08 1-0.18 10.13-3.07 14-47a6.74 6.74 0 1 1 13.43 1.18c-3.34 37.87-11.31 56.66-25.07 59.12a16.82 16.82 0 0 1-3.35 0.23zM389.28 722.29c-9.26 2.85-21.38-1.51-36.89-13.22a195 195 0 0 1-21-18.64 7.28 7.28 0 0 1 10.53-10.06c17.25 18.05 37.7 31 43.75 27.71 1-0.54 9.35-6.59-1.61-53a7.28 7.28 0 1 1 14.17-3.35c9.44 40 7.65 62-5.63 69.16a18.18 18.18 0 0 1-3.32 1.4z" fill="#22B0C3" /></svg>'
  };

  // src/index.ts
  function resolveImages(providedImages, word) {
    if (providedImages && providedImages.length > 0 && providedImages.every((img) => img && img.trim().length > 0)) {
      return providedImages;
    }
    if (word) {
      const wordLower = word.toLowerCase();
      const matchingKeys = Object.keys(images).filter(
        (key) => key.toLowerCase().includes(wordLower) || wordLower.includes(key.toLowerCase().replace("svg", ""))
      );
      if (matchingKeys.length > 0) {
        return matchingKeys.map((key) => images[key]);
      }
    }
    const imageKeys = Object.keys(images);
    return imageKeys.slice(0, Math.min(4, imageKeys.length)).map((key) => images[key]);
  }
  function createSvgImageButton(choice, choice_index) {
    if (choice.trim().startsWith("<svg")) {
      return `<button class="jspsych-btn responsive-image-btn" style="
      margin: 8px; 
      background-color: #f0f0f0;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
      width: 140px;
      height: 140px;
      flex: 0 0 140px;
    " onmouseover="this.style.backgroundColor='#e0e0e0'; this.style.borderColor='#999';" onmouseout="this.style.backgroundColor='#f0f0f0'; this.style.borderColor='#ddd';">
      <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow: hidden;">
        <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
          ${choice}
        </div>
      </div>
    </button>`;
    }
    const commonViewBoxes = [
      "0 0 24 24",
      "0 0 100 100",
      "0 0 256 256",
      "0 0 512 512",
      "0 0 1024 1024"
    ];
    const viewBox = commonViewBoxes[1];
    return `<button class="jspsych-btn responsive-image-btn" style="
    margin: 8px; 
    background-color: #f0f0f0;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    width: 140px;
    height: 140px;
    flex: 0 0 140px;
  " onmouseover="this.style.backgroundColor='#e0e0e0'; this.style.borderColor='#999';" onmouseout="this.style.backgroundColor='#f0f0f0'; this.style.borderColor='#ddd';">
    <div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center;">
      <svg width="80" height="80" viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%; max-height:100%; fill: #333; stroke: #333; stroke-width: 1;">
        ${choice}
      </svg>
    </div>
  </button>`;
  }
  function createTimeline(jsPsych, config, options = {}) {
    const welcomeScreen = {
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${englishText.welcome_message}</p>`,
      choices: [englishText.begin_button]
    };
    const instructions = {
      type: HtmlButtonResponsePlugin,
      stimulus: `
      <p>${englishText.instructions_hearing}</p>
      <p>${englishText.instructions_tap}</p>
      <p>${englishText.instructions_difficulty}</p>
      <p>${englishText.instructions_replay}</p>
      <p>${englishText.instructions_back}</p>
      <p>${englishText.instructions_ready}</p>
    `,
      choices: [englishText.next_button]
    };
    function makePracticeTrial(word, images2, correctIndex) {
      let attempts = 0;
      return {
        timeline: [
          {
            type: HtmlButtonResponsePlugin,
            stimulus: `<p>${englishText.practice_intro.replace("{word}", word)}</p>`,
            choices: images2,
            button_html: createSvgImageButton,
            data: { trial_id: "practice-choice" },
            on_load: () => {
              const btnGroup = document.querySelector(".jspsych-html-button-response-btngroup");
              if (btnGroup) {
                btnGroup.classList.add("image-button-group");
                const buttons = btnGroup.querySelectorAll(".jspsych-btn");
                buttons.forEach((button) => {
                  button.classList.add("responsive-image-btn");
                });
              }
            },
            on_finish: (data) => {
              attempts++;
              data.correct = data.response === correctIndex;
            }
          },
          {
            type: HtmlButtonResponsePlugin,
            stimulus: () => {
              const lastChoiceTrial = jsPsych.data.get().filter({ trial_id: "practice-choice" }).last(1).values()[0];
              return lastChoiceTrial && lastChoiceTrial.correct ? `<p>${englishText.practice_correct.replace("{word}", word)}</p>` : `<p>${englishText.practice_incorrect.replace("{word}", word)}</p>`;
            },
            choices: () => {
              const lastChoiceTrial = jsPsych.data.get().filter({ trial_id: "practice-choice" }).last(1).values()[0];
              return lastChoiceTrial && lastChoiceTrial.correct ? [englishText.next_button] : [englishText.try_again_button];
            }
          }
        ],
        loop_function: () => {
          const lastChoiceTrial = jsPsych.data.get().filter({ trial_id: "practice-choice" }).last(1).values()[0];
          return attempts < 3 && lastChoiceTrial && !lastChoiceTrial.correct;
        }
      };
    }
    function makeLiveTrial(word, images2, correctIndex) {
      return {
        type: HtmlButtonResponsePlugin,
        stimulus: `<p style="text-align: center; margin-bottom: 20px; font-size: 18px;">${englishText.live_instruction.replace("{word}", `<strong>${word}</strong>`)}</p>`,
        choices: images2,
        // array of SVG strings
        button_html: (choice, index) => {
          return `
        <button class="jspsych-btn responsive-image-btn" style="
          background-color: #f0f0f0;
          border: 2px solid #ddd;
          border-radius: 8px;
          padding: 10px;
          margin: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          width: 140px;
          height: 140px;
          flex: 0 0 140px;
          display: flex;
          align-items: center;
          justify-content: center;
        " onmouseover="this.style.backgroundColor='#e0e0e0'; this.style.borderColor='#999';" onmouseout="this.style.backgroundColor='#f0f0f0'; this.style.borderColor='#ddd';">
          <div style="width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
            ${choice}
          </div>
        </button>`;
        },
        on_load: () => {
          const btnGroup = document.querySelector(".jspsych-html-button-response-btngroup");
          if (btnGroup) {
            btnGroup.classList.add("image-button-group");
            const buttons = btnGroup.querySelectorAll(".jspsych-btn");
            buttons.forEach((button) => {
              button.classList.add("responsive-image-btn");
            });
          }
        },
        on_finish: (data) => {
          data.correct = data.response === correctIndex;
        }
      };
    }
    const transition = {
      type: HtmlButtonResponsePlugin,
      stimulus: `
      <p>${englishText.transition_message}</p>
      <p>${englishText.transition_reminder}</p>
      <p>${englishText.transition_action}</p>
      <p>${englishText.transition_ready}</p>
    `,
      choices: [englishText.start_button]
    };
    function autoCorrectIndex(word, images2) {
      const wordLower = word.toLowerCase();
      const idx = images2.findIndex((svg) => svg.toLowerCase().includes(wordLower));
      if (idx === -1)
        console.warn(`No match for '${word}'`);
      return idx >= 0 ? idx : 0;
    }
    const practiceItems = options.shuffleTrials ? jsPsych.randomization.shuffle(config.practiceItems) : config.practiceItems;
    const liveItems = options.shuffleTrials ? jsPsych.randomization.shuffle(config.liveItems) : config.liveItems;
    const practiceTimeline = practiceItems.map((item) => {
      let images2 = [...item.images];
      let correctIndex = item.correctIndex;
      const resolvedImages = resolveImages(images2, item.word);
      if (images2.length === 0 || !images2.every((img) => img && img.trim().length > 0)) {
        correctIndex = autoCorrectIndex(item.word, resolvedImages);
      }
      if (options.shuffleImageChoices) {
        const originalImage = resolvedImages[correctIndex];
        const shuffledImages = jsPsych.randomization.shuffle(resolvedImages);
        correctIndex = shuffledImages.findIndex((img) => img === originalImage);
        images2 = shuffledImages;
      } else {
        images2 = resolvedImages;
      }
      return makePracticeTrial(item.word, images2, correctIndex);
    });
    const liveTimeline = liveItems.map((item) => {
      let images2 = [...item.images];
      let correctIndex = item.correctIndex;
      const resolvedImages = resolveImages(images2, item.word);
      if (images2.length === 0 || !images2.every((img) => img && img.trim().length > 0)) {
        correctIndex = autoCorrectIndex(item.word, resolvedImages);
      }
      if (options.shuffleImageChoices) {
        const originalImage = resolvedImages[correctIndex];
        const shuffledImages = jsPsych.randomization.shuffle(resolvedImages);
        correctIndex = shuffledImages.findIndex((img) => img === originalImage);
        images2 = shuffledImages;
      } else {
        images2 = resolvedImages;
      }
      return makeLiveTrial(item.word, images2, correctIndex);
    });
    const thankYouScreen = {
      type: HtmlButtonResponsePlugin,
      stimulus: `<p>${englishText.thank_you}</p>`,
      choices: [englishText.finish_button]
    };
    return [welcomeScreen, instructions, ...practiceTimeline, transition, ...liveTimeline, thankYouScreen];
  }
  var timelineUnits = {};
  var utils = {};

  exports.createTimeline = createTimeline;
  exports.images = images;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.global.js.map