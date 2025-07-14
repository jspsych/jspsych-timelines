var jsPsychTimelinePatternComparisonTask = (function (exports) {
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
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

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

  // ../../node_modules/@jspsych/plugin-instructions/dist/index.js
  var version2 = "2.1.0";
  var info2 = {
    name: "instructions",
    version: version2,
    parameters: {
      /** Each element of the array is the content for a single page. Each page should be an HTML-formatted string.  */
      pages: {
        type: ParameterType.HTML_STRING,
        default: void 0,
        array: true
      },
      /** This is the key that the participant can press in order to advance to the next page. This key should be
       * specified as a string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). */
      key_forward: {
        type: ParameterType.KEY,
        default: "ArrowRight"
      },
      /** This is the key that the participant can press to return to the previous page. This key should be specified as a
       * string (e.g., `'a'`, `'ArrowLeft'`, `' '`, `'Enter'`). */
      key_backward: {
        type: ParameterType.KEY,
        default: "ArrowLeft"
      },
      /** If true, the participant can return to previous pages of the instructions. If false, they may only advace to the next page. */
      allow_backward: {
        type: ParameterType.BOOL,
        default: true
      },
      /** If `true`, the participant can use keyboard keys to navigate the pages. If `false`, they may not. */
      allow_keys: {
        type: ParameterType.BOOL,
        default: true
      },
      /** If true, then a `Previous` and `Next` button will be displayed beneath the instructions. Participants can
       * click the buttons to navigate. */
      show_clickable_nav: {
        type: ParameterType.BOOL,
        default: false
      },
      /** If true, and clickable navigation is enabled, then Page x/y will be shown between the nav buttons. */
      show_page_number: {
        type: ParameterType.BOOL,
        default: false
      },
      /** The text that appears before x/y pages displayed when show_page_number is true.*/
      page_label: {
        type: ParameterType.STRING,
        default: "Page"
      },
      /** The text that appears on the button to go backwards. */
      button_label_previous: {
        type: ParameterType.STRING,
        default: "Previous"
      },
      /** The text that appears on the button to go forwards. */
      button_label_next: {
        type: ParameterType.STRING,
        default: "Next"
      },
      /** The callback function when page changes */
      on_page_change: {
        type: ParameterType.FUNCTION,
        pretty_name: "Page change callback",
        default: function(current_page) {
        }
      }
    },
    data: {
      /** An array containing the order of pages the participant viewed (including when the participant returned to previous pages)
       *  and the time spent viewing each page. Each object in the array represents a single page view,
       * and contains keys called `page_index` (the page number, starting with 0) and `viewing_time`
       * (duration of the page view). This will be encoded as a JSON string when data is saved using the `.json()` or `.csv()`
       * functions.
       */
      view_history: {
        type: ParameterType.COMPLEX,
        array: true,
        nested: {
          page_index: {
            type: ParameterType.INT
          },
          viewing_time: {
            type: ParameterType.INT
          }
        }
      },
      /** The response time in milliseconds for the participant to view all of the pages. */
      rt: {
        type: ParameterType.INT
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  var _InstructionsPlugin = class {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    trial(display_element, trial) {
      var current_page = 0;
      var view_history = [];
      var start_time = performance.now();
      var last_page_update_time = start_time;
      function btnListener() {
        if (this.id === "jspsych-instructions-back") {
          back();
        } else if (this.id === "jspsych-instructions-next") {
          next();
        }
      }
      function show_current_page() {
        var html = trial.pages[current_page];
        var pagenum_display = "";
        if (trial.show_page_number) {
          pagenum_display = "<span style='margin: 0 1em;' class='jspsych-instructions-pagenum'>" + trial.page_label + " " + (current_page + 1) + "/" + trial.pages.length + "</span>";
        }
        if (trial.show_clickable_nav) {
          var nav_html = "<div class='jspsych-instructions-nav' style='padding: 10px 0px;'>";
          if (trial.allow_backward) {
            var allowed = current_page > 0 ? "" : "disabled='disabled'";
            nav_html += "<button id='jspsych-instructions-back' class='jspsych-btn' style='margin-right: 5px;' " + allowed + ">&lt; " + trial.button_label_previous + "</button>";
          }
          if (trial.pages.length > 1 && trial.show_page_number) {
            nav_html += pagenum_display;
          }
          nav_html += "<button id='jspsych-instructions-next' class='jspsych-btn'style='margin-left: 5px;'>" + trial.button_label_next + " &gt;</button></div>";
          html += nav_html;
          display_element.innerHTML = html;
          if (current_page != 0 && trial.allow_backward) {
            display_element.querySelector("#jspsych-instructions-back").addEventListener("click", btnListener, { once: true });
          }
          display_element.querySelector("#jspsych-instructions-next").addEventListener("click", btnListener, { once: true });
        } else {
          if (trial.show_page_number && trial.pages.length > 1) {
            html += "<div class='jspsych-instructions-pagenum'>" + pagenum_display + "</div>";
          }
          display_element.innerHTML = html;
        }
      }
      function next() {
        add_current_page_to_view_history();
        current_page++;
        if (current_page >= trial.pages.length) {
          endTrial();
        } else {
          show_current_page();
        }
        trial.on_page_change(current_page);
      }
      function back() {
        add_current_page_to_view_history();
        current_page--;
        show_current_page();
        trial.on_page_change(current_page);
      }
      function add_current_page_to_view_history() {
        var current_time = performance.now();
        var page_view_time = Math.round(current_time - last_page_update_time);
        view_history.push({
          page_index: current_page,
          viewing_time: page_view_time
        });
        last_page_update_time = current_time;
      }
      const endTrial = () => {
        if (trial.allow_keys) {
          this.jsPsych.pluginAPI.cancelKeyboardResponse(keyboard_listener);
        }
        var trial_data = {
          view_history,
          rt: Math.round(performance.now() - start_time)
        };
        this.jsPsych.finishTrial(trial_data);
      };
      const after_response = (info22) => {
        keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: [trial.key_forward, trial.key_backward],
          rt_method: "performance",
          persist: false,
          allow_held_key: false
        });
        if (this.jsPsych.pluginAPI.compareKeys(info22.key, trial.key_backward)) {
          if (current_page !== 0 && trial.allow_backward) {
            back();
          }
        }
        if (this.jsPsych.pluginAPI.compareKeys(info22.key, trial.key_forward)) {
          next();
        }
      };
      show_current_page();
      if (trial.allow_keys) {
        var keyboard_listener = this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: after_response,
          valid_responses: [trial.key_forward, trial.key_backward],
          rt_method: "performance",
          persist: false
        });
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
      var _a, _b, _c, _d, _e, _f;
      let curr_page = 0;
      let rt = 0;
      let view_history = [];
      if (!((_a = simulation_options.data) == null ? void 0 : _a.view_history) && !((_b = simulation_options.data) == null ? void 0 : _b.rt)) {
        while (curr_page !== trial.pages.length) {
          const view_time = Math.round(
            this.jsPsych.randomization.sampleExGaussian(3e3, 300, 1 / 300)
          );
          view_history.push({ page_index: curr_page, viewing_time: view_time });
          rt += view_time;
          if (curr_page == 0 || !trial.allow_backward) {
            curr_page++;
          } else {
            if (this.jsPsych.randomization.sampleBernoulli(0.9) == 1) {
              curr_page++;
            } else {
              curr_page--;
            }
          }
        }
      }
      if (!((_c = simulation_options.data) == null ? void 0 : _c.view_history) && ((_d = simulation_options.data) == null ? void 0 : _d.rt)) {
        rt = simulation_options.data.rt;
        while (curr_page !== trial.pages.length) {
          view_history.push({ page_index: curr_page, viewing_time: null });
          if (curr_page == 0 || !trial.allow_backward) {
            curr_page++;
          } else {
            if (this.jsPsych.randomization.sampleBernoulli(0.9) == 1) {
              curr_page++;
            } else {
              curr_page--;
            }
          }
        }
        const avg_rt_per_page = simulation_options.data.rt / view_history.length;
        let total_time = 0;
        for (const page of view_history) {
          const t = Math.round(
            this.jsPsych.randomization.sampleExGaussian(
              avg_rt_per_page,
              avg_rt_per_page / 10,
              1 / (avg_rt_per_page / 10)
            )
          );
          page.viewing_time = t;
          total_time += t;
        }
        const diff = simulation_options.data.rt - total_time;
        const diff_per_page = Math.round(diff / view_history.length);
        for (const page of view_history) {
          page.viewing_time += diff_per_page;
        }
      }
      if (((_e = simulation_options.data) == null ? void 0 : _e.view_history) && !((_f = simulation_options.data) == null ? void 0 : _f.rt)) {
        view_history = simulation_options.data.view_history;
        rt = 0;
        for (const page of simulation_options.data.view_history) {
          rt += page.viewing_time;
        }
      }
      const default_data = {
        view_history,
        rt
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
      const advance = (rt) => {
        if (trial.allow_keys) {
          this.jsPsych.pluginAPI.pressKey(trial.key_forward, rt);
        } else if (trial.show_clickable_nav) {
          this.jsPsych.pluginAPI.clickTarget(
            display_element.querySelector("#jspsych-instructions-next"),
            rt
          );
        }
      };
      const backup = (rt) => {
        if (trial.allow_keys) {
          this.jsPsych.pluginAPI.pressKey(trial.key_backward, rt);
        } else if (trial.show_clickable_nav) {
          this.jsPsych.pluginAPI.clickTarget(
            display_element.querySelector("#jspsych-instructions-back"),
            rt
          );
        }
      };
      let curr_page = 0;
      let t = 0;
      for (let i = 0; i < data.view_history.length; i++) {
        if (i == data.view_history.length - 1) {
          advance(t + data.view_history[i].viewing_time);
        } else {
          if (data.view_history[i + 1].page_index > curr_page) {
            advance(t + data.view_history[i].viewing_time);
          }
          if (data.view_history[i + 1].page_index < curr_page) {
            backup(t + data.view_history[i].viewing_time);
          }
          t += data.view_history[i].viewing_time;
          curr_page = data.view_history[i + 1].page_index;
        }
      }
    }
  };
  var InstructionsPlugin = _InstructionsPlugin;
  (() => {
    _InstructionsPlugin.info = info2;
  })();

  // src/test-categories.ts
  var test_categories = [
    // Category 1: Color discrimination - Different objects with fill variations
    {
      "smiley_face": [
        `<svg viewBox="0 0 293.246 293.246">
        <circle cx="146.623" cy="100" r="80" fill="none" stroke="#E67E22" stroke-width="4"/>
        <circle cx="120" cy="85" r="8" fill="#2C3E50"/>
        <circle cx="173" cy="85" r="8" fill="#2C3E50"/>
        <path d="M130,110 Q146.623,125 163,110" fill="none" stroke="#2C3E50" stroke-width="3"/>
      </svg>`,
        `<svg viewBox="0 0 293.246 293.246">
        <circle cx="146.623" cy="100" r="80" fill="#FDBCB4" stroke="#E67E22" stroke-width="4"/>
        <circle cx="120" cy="85" r="8" fill="#2C3E50"/>
        <circle cx="173" cy="85" r="8" fill="#2C3E50"/>
        <path d="M130,110 Q146.623,125 163,110" fill="none" stroke="#2C3E50" stroke-width="3"/>
      </svg>`
      ],
      "heart_shape": [
        `<svg viewBox="0 0 471.701 471.701">
        <path d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4C471.801,124.501,458.301,91.701,433.601,67.001z" fill="none" stroke="#E74C3C" stroke-width="8"/>
      </svg>`,
        `<svg viewBox="0 0 471.701 471.701">
        <path d="M433.601,67.001c-24.7-24.7-57.4-38.2-92.3-38.2s-67.7,13.6-92.4,38.3l-12.9,12.9l-13.1-13.1c-24.7-24.7-57.6-38.4-92.5-38.4c-34.8,0-67.6,13.6-92.2,38.2c-24.7,24.7-38.3,57.5-38.2,92.4c0,34.9,13.7,67.6,38.4,92.3l187.8,187.8c2.6,2.6,6.1,4,9.5,4c3.4,0,6.9-1.3,9.5-3.9l188.2-187.5c24.7-24.7,38.3-57.5,38.3-92.4C471.801,124.501,458.301,91.701,433.601,67.001z" fill="#E74C3C"/>
      </svg>`
      ],
      "star_shape": [
        `<svg viewBox="0 0 33 33">
        <polygon points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22" fill="none" stroke="#FFD700" stroke-width="2"/>
      </svg>`,
        `<svg viewBox="0 0 33 33">
        <polygon points="27.865 31.83 17.615 26.209 7.462 32.009 9.553 20.362 0.99 12.335 12.532 10.758 17.394 0 22.436 10.672 34 12.047 25.574 20.22" fill="#FFD700"/>
      </svg>`
      ],
      "circle_shape": [
        `<svg viewBox="0 0 1024 1024">
        <circle cx="512" cy="512" r="256" fill="none" stroke="#2196F3" stroke-width="32"/>
      </svg>`,
        `<svg viewBox="0 0 1024 1024">
        <circle cx="512" cy="512" r="256" fill="#2196F3"/>
      </svg>`
      ]
    },
    // Category 2: Adding/taking elements - Objects where you can add/remove parts
    {
      "tree_bare": [
        `<svg viewBox="0 0 512 512">
        <path d="M273.067,261.267H256h-17.067c0,0,8.533,230.4-59.733,230.4h153.6C264.533,491.667,273.067,261.267,273.067,261.267" fill="#805333"/>
        <path d="M503.467,500.2H8.533c-4.71,0-8.533-3.814-8.533-8.533c0-4.719,3.823-8.533,8.533-8.533h494.933c4.71,0,8.533,3.814,8.533,8.533C512,496.386,508.177,500.2,503.467,500.2" fill="#95A5A5"/>
        <path d="M418.133,184.467c0-32.99-26.743-59.733-59.733-59.733c-7.04,0-13.756,1.28-20.028,3.516c-5.265-19.635-17.323-36.489-33.545-47.838C306.364,75.547,307.2,70.367,307.2,65c0-28.279-22.921-51.2-51.2-51.2c-28.279,0-51.2,22.921-51.2,51.2c0,5.367,0.836,10.547,2.372,15.412c-16.222,11.349-28.28,28.203-33.545,47.838c-6.272-2.236-12.988-3.516-20.028-3.516c-32.99,0-59.733,26.743-59.733,59.733c0,24.567,14.842,45.708,36.003,54.8c-21.161,9.092-36.003,30.233-36.003,54.8c0,32.99,26.743,59.733,59.733,59.733c16.887,0,32.145-7.013,43.061-18.26c10.916,11.247,26.174,18.26,43.061,18.26c16.887,0,32.145-7.013,43.061-18.26c10.916,11.247,26.174,18.26,43.061,18.26c32.99,0,59.733-26.743,59.733-59.733c0-24.567-14.842-45.708-36.003-54.8C403.291,230.175,418.133,209.034,418.133,184.467z" fill="#24AE5F"/>
      </svg>`,
        `<svg viewBox="0 0 512 512">
        <path d="M273.067,261.267H256h-17.067c0,0,8.533,230.4-59.733,230.4h153.6C264.533,491.667,273.067,261.267,273.067,261.267" fill="#805333"/>
        <path d="M503.467,500.2H8.533c-4.71,0-8.533-3.814-8.533-8.533c0-4.719,3.823-8.533,8.533-8.533h494.933c4.71,0,8.533,3.814,8.533,8.533C512,496.386,508.177,500.2,503.467,500.2" fill="#95A5A5"/>
      </svg>`
      ],
      "house_building": [
        `<svg viewBox="0 0 512 512">
        <polygon points="256,50 150,150 150,400 362,400 362,150" fill="#E74C3C"/>
        <rect x="150" y="150" width="212" height="250" fill="#3498DB"/>
        <rect x="220" y="300" width="60" height="100" fill="#8B4513"/>
        <rect x="180" y="200" width="40" height="40" fill="#87CEEB"/>
        <rect x="290" y="200" width="40" height="40" fill="#87CEEB"/>
      </svg>`,
        `<svg viewBox="0 0 512 512">
        <polygon points="256,50 150,150 150,400 362,400 362,150" fill="#E74C3C"/>
        <rect x="150" y="150" width="212" height="250" fill="#3498DB"/>
        <rect x="220" y="300" width="60" height="100" fill="#8B4513"/>
        <rect x="180" y="200" width="40" height="40" fill="#87CEEB"/>
      </svg>`
      ],
      "clock_time": [
        `<svg viewBox="0 0 490 490">
        <circle cx="245" cy="245" r="204.3" fill="none" stroke="#2C3E50" stroke-width="40"/>
        <circle cx="245" cy="245" r="15" fill="#2C3E50"/>
      </svg>`,
        `<svg viewBox="0 0 490 490">
        <circle cx="245" cy="245" r="204.3" fill="none" stroke="#2C3E50" stroke-width="40"/>
        <circle cx="245" cy="245" r="15" fill="#2C3E50"/>
        <line x1="245" y1="245" x2="245" y2="120" stroke="#2C3E50" stroke-width="8" stroke-linecap="round"/>
        <line x1="245" y1="245" x2="320" y2="245" stroke="#2C3E50" stroke-width="6" stroke-linecap="round"/>
      </svg>`
      ],
      "face_glasses": [
        `<svg viewBox="0 0 293.246 293.246">
        <circle cx="146.623" cy="100" r="80" fill="#FDBCB4" stroke="#E67E22" stroke-width="4"/>
        <circle cx="120" cy="85" r="8" fill="#2C3E50"/>
        <circle cx="173" cy="85" r="8" fill="#2C3E50"/>
        <path d="M130,110 Q146.623,125 163,110" fill="none" stroke="#2C3E50" stroke-width="3"/>
      </svg>`,
        `<svg viewBox="0 0 293.246 293.246">
        <circle cx="146.623" cy="100" r="80" fill="#FDBCB4" stroke="#E67E22" stroke-width="4"/>
        <circle cx="120" cy="85" r="8" fill="#2C3E50"/>
        <circle cx="173" cy="85" r="8" fill="#2C3E50"/>
        <path d="M130,110 Q146.623,125 163,110" fill="none" stroke="#2C3E50" stroke-width="3"/>
        <ellipse cx="105" cy="85" rx="20" ry="15" fill="none" stroke="#2C3E50" stroke-width="3"/>
        <ellipse cx="188" cy="85" rx="20" ry="15" fill="none" stroke="#2C3E50" stroke-width="3"/>
        <line x1="125" y1="85" x2="168" y2="85" stroke="#2C3E50" stroke-width="3"/>
      </svg>`
      ]
    },
    // Category 3: Quantity variation - Different objects in different quantities
    {
      "gift_box": [
        `<svg viewBox="0 0 512 512">
        <path style="fill:#FFE14D;" d="M379.931,19.548c-26.08-26.066-68.503-26.063-94.565-0.001C276.374,28.533,265.133,45.04,256,63.421
          c-9.131-18.38-20.372-34.886-29.362-43.87c-26.066-26.067-68.49-26.068-94.573,0c-26.075,26.075-26.075,68.499,0,94.574
          c14.649,14.65,44.887,32.01,70.338,40.382c1.686,0.554,3.45,0.837,5.225,0.837h41.729c2.302,0,4.556-0.495,6.638-1.397
          c2.083,0.904,4.339,1.397,6.647,1.397h41.729c1.775,0,3.539-0.283,5.225-0.837c25.451-8.374,55.69-25.734,70.337-40.382
          C406.008,88.051,406.008,45.627,379.931,19.548z"/>
        <path style="fill:#E6E9EE;" d="M89.655,195.862v285.517c0,16.569,13.431,30,30,30h272.69c16.569,0,30-13.431,30-30V195.862H89.655z"/>
        <rect x="249.655" y="180.965" style="fill:#F06262;" width="12.69" height="345.414"/>
      </svg>`,
        `<svg viewBox="0 0 512 512">
        <g transform="translate(-140,0) scale(0.35)">
          <path style="fill:#FFE14D;" d="M379.931,19.548c-26.08-26.066-68.503-26.063-94.565-0.001C276.374,28.533,265.133,45.04,256,63.421
            c-9.131-18.38-20.372-34.886-29.362-43.87c-26.066-26.067-68.49-26.068-94.573,0c-26.075,26.075-26.075,68.499,0,94.574
            c14.649,14.65,44.887,32.01,70.338,40.382c1.686,0.554,3.45,0.837,5.225,0.837h41.729c2.302,0,4.556-0.495,6.638-1.397
            c2.083,0.904,4.339,1.397,6.647,1.397h41.729c1.775,0,3.539-0.283,5.225-0.837c25.451-8.374,55.69-25.734,70.337-40.382
            C406.008,88.051,406.008,45.627,379.931,19.548z"/>
          <path style="fill:#E6E9EE;" d="M89.655,195.862v285.517c0,16.569,13.431,30,30,30h272.69c16.569,0,30-13.431,30-30V195.862H89.655z"/>
          <rect x="249.655" y="180.965" style="fill:#F06262;" width="12.69" height="345.414"/>
        </g>
        <g transform="translate(0,0) scale(0.35)">
          <path style="fill:#FFE14D;" d="M379.931,19.548c-26.08-26.066-68.503-26.063-94.565-0.001C276.374,28.533,265.133,45.04,256,63.421
            c-9.131-18.38-20.372-34.886-29.362-43.87c-26.066-26.067-68.49-26.068-94.573,0c-26.075,26.075-26.075,68.499,0,94.574
            c14.649,14.65,44.887,32.01,70.338,40.382c1.686,0.554,3.45,0.837,5.225,0.837h41.729c2.302,0,4.556-0.495,6.638-1.397
            c2.083,0.904,4.339,1.397,6.647,1.397h41.729c1.775,0,3.539-0.283,5.225-0.837c25.451-8.374,55.69-25.734,70.337-40.382
            C406.008,88.051,406.008,45.627,379.931,19.548z"/>
          <path style="fill:#E6E9EE;" d="M89.655,195.862v285.517c0,16.569,13.431,30,30,30h272.69c16.569,0,30-13.431,30-30V195.862H89.655z"/>
          <rect x="249.655" y="180.965" style="fill:#F06262;" width="12.69" height="345.414"/>
        </g>
        <g transform="translate(140,0) scale(0.35)">
          <path style="fill:#FFE14D;" d="M379.931,19.548c-26.08-26.066-68.503-26.063-94.565-0.001C276.374,28.533,265.133,45.04,256,63.421
            c-9.131-18.38-20.372-34.886-29.362-43.87c-26.066-26.067-68.49-26.068-94.573,0c-26.075,26.075-26.075,68.499,0,94.574
            c14.649,14.65,44.887,32.01,70.338,40.382c1.686,0.554,3.45,0.837,5.225,0.837h41.729c2.302,0,4.556-0.495,6.638-1.397
            c2.083,0.904,4.339,1.397,6.647,1.397h41.729c1.775,0,3.539-0.283,5.225-0.837c25.451-8.374,55.69-25.734,70.337-40.382
            C406.008,88.051,406.008,45.627,379.931,19.548z"/>
          <path style="fill:#E6E9EE;" d="M89.655,195.862v285.517c0,16.569,13.431,30,30,30h272.69c16.569,0,30-13.431,30-30V195.862H89.655z"/>
          <rect x="249.655" y="180.965" style="fill:#F06262;" width="12.69" height="345.414"/>
        </g>
      </svg>`
      ],
      "apple_fruit": [
        `<svg viewBox="0 0 950.458 950.458">
        <path d="M616.395,235.458c40.617-21.654,72.93-58.561,92.375-99.952c16.842-35.848,25.32-75.332,24.163-114.967C732.606,9.351,723.837,0,712.394,0c-3.062,0-6.044,0.732-8.743,2.03c-0.967,0.161-1.928,0.409-2.877,0.757c-27.547,10.102-55.697,18.297-82.406,30.593c-26.518,12.208-50.176,29.639-72.618,48.138c-31.717,26.144-60.03,57.561-79.92,93.625" fill="#228B22"/>
        <ellipse cx="475" cy="600" rx="300" ry="350" fill="#FF6B6B"/>
        <path d="M450,200 Q470,180 490,200" fill="#8B4513" stroke="#654321" stroke-width="3"/>
      </svg>`,
        `<svg viewBox="0 0 950.458 950.458">
        <g transform="translate(-200,0) scale(0.6)">
          <ellipse cx="475" cy="600" rx="300" ry="350" fill="#FF6B6B"/>
          <path d="M450,200 Q470,180 490,200" fill="#8B4513"/>
        </g>
        <g transform="translate(200,0) scale(0.6)">
          <ellipse cx="475" cy="600" rx="300" ry="350" fill="#FF6B6B"/>
          <path d="M450,200 Q470,180 490,200" fill="#8B4513"/>
        </g>
      </svg>`
      ],
      "car_vehicle": [
        `<svg viewBox="0 0 512 512">
        <path style="fill:#FFDD09;" d="M450.413,144.067H57.88C42.52,165.4,37.4,191.853,42.52,220.013L57.88,280.6h392.533l15.36-60.587C472.6,193.56,466.627,165.4,450.413,144.067"/>
        <path style="fill:#54C9FD;" d="M101.4,186.733H41.667c-0.853,10.24-0.853,21.333,0.853,33.28l4.267,17.92H127L101.4,186.733z"/>
        <circle cx="120" cy="320" r="40" fill="#2C3E50"/>
        <circle cx="390" cy="320" r="40" fill="#2C3E50"/>
      </svg>`,
        `<svg viewBox="0 0 512 512">
        <g transform="translate(-130,20) scale(0.7)">
          <path style="fill:#FFDD09;" d="M450.413,144.067H57.88C42.52,165.4,37.4,191.853,42.52,220.013L57.88,280.6h392.533l15.36-60.587C472.6,193.56,466.627,165.4,450.413,144.067"/>
          <circle cx="120" cy="320" r="40" fill="#2C3E50"/>
          <circle cx="390" cy="320" r="40" fill="#2C3E50"/>
        </g>
        <g transform="translate(130,20) scale(0.7)">
          <path style="fill:#FFDD09;" d="M450.413,144.067H57.88C42.52,165.4,37.4,191.853,42.52,220.013L57.88,280.6h392.533l15.36-60.587C472.6,193.56,466.627,165.4,450.413,144.067"/>
          <circle cx="120" cy="320" r="40" fill="#2C3E50"/>
          <circle cx="390" cy="320" r="40" fill="#2C3E50"/>
        </g>
      </svg>`
      ]
    }
  ];

  // src/text.ts
  var trial_text = {
    // Instruction pages buttons text, these will always have arrows < and >
    // these do not work right now due to CSS fixed position, might fix later
    next_button: "",
    back_button: "",
    // Task completion messages
    task_complete_header: "Task Complete!",
    task_complete_message: "Thank you for participating in the pattern comparison task.",
    // Main task instructions
    prompt: "Are these two patterns the same?",
    // Fixation and inter-trial
    fixation_cross: "+",
    // Button text
    same_button: "Same",
    different_button: "Different"
  };
  var instruction_pages = [
    "You will see two patterns side by side.",
    "Your job is to determine if they are the same or different.",
    "Look carefully at all visual elements: shape, color, size, and quantity.",
    "Click 'Same' if the patterns are identical.",
    "Click 'Different' if the patterns vary in any way.",
    "Work quickly but carefully.",
    "Let's begin the task."
  ];

  // src/index.ts
  var currentGoogleAudio = null;
  function speakText(_0) {
    return __async(this, arguments, function* (text, options = {}) {
      stopAllSpeech();
      const preferredMethod = options.method || "google";
      try {
        if (preferredMethod === "google") {
          yield speakWithGoogleTTS(text, options.lang || "en");
          return;
        } else {
          yield speakWithSystemTTS(text, options);
          return;
        }
      } catch (preferredSpeechError) {
      }
      stopAllSpeech();
      yield new Promise((resolve) => setTimeout(resolve, 100));
      try {
        yield speakWithGoogleTTS(text, options.lang || "en");
        return;
      } catch (googleError) {
      }
      stopAllSpeech();
      yield new Promise((resolve) => setTimeout(resolve, 100));
      try {
        yield speakWithSystemTTS(text, options);
        return;
      } catch (systemError) {
        console.warn("\u{1F50A} TTS unavailable");
      }
    });
  }
  function stopAllSpeech() {
    if ("speechSynthesis" in window) {
      speechSynthesis.cancel();
      speechSynthesis.pause();
      speechSynthesis.resume();
      speechSynthesis.cancel();
    }
    if (currentGoogleAudio) {
      try {
        currentGoogleAudio.pause();
        currentGoogleAudio.currentTime = 0;
        currentGoogleAudio.src = "";
      } catch (e) {
      }
      currentGoogleAudio = null;
    }
  }
  function speakWithSystemTTS(text, options = {}) {
    return new Promise((resolve, reject) => {
      var _a, _b, _c;
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = (_a = options.rate) != null ? _a : 0.8;
        utterance.volume = (_b = options.volume) != null ? _b : 0.8;
        utterance.pitch = (_c = options.pitch) != null ? _c : 1;
        if (options.lang) {
          utterance.lang = options.lang;
        }
        utterance.onstart = () => resolve();
        utterance.onend = () => resolve();
        utterance.onerror = (e) => {
          if (e.error === "not-allowed" || e.error === "synthesis-failed") {
            reject(new Error(e.error));
          } else {
            resolve();
          }
        };
        speechSynthesis.speak(utterance);
      } else {
        reject(new Error("speechSynthesis not supported"));
      }
    });
  }
  function speakWithGoogleTTS(text, lang) {
    return new Promise((resolve, reject) => {
      try {
        const googleLang = lang ? lang.substring(0, 2).toLowerCase() : "en";
        const encodedText = encodeURIComponent(text);
        const googleTTSUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${googleLang}&client=tw-ob&q=${encodedText}`;
        const audio = new Audio(googleTTSUrl);
        currentGoogleAudio = audio;
        audio.oncanplay = () => {
          if (currentGoogleAudio !== audio) {
            audio.pause();
            reject(new Error("Cancelled while loading"));
            return;
          }
          audio.play().then(resolve).catch(reject);
        };
        audio.onended = () => {
          if (currentGoogleAudio === audio) {
            currentGoogleAudio = null;
          }
          resolve();
        };
        audio.onerror = (e) => {
          audio.pause();
          if (currentGoogleAudio === audio) {
            currentGoogleAudio = null;
          }
          reject(new Error("Google TTS failed"));
        };
        audio.load();
      } catch (error) {
        reject(error);
      }
    });
  }
  function extractTextFromHtml(htmlString) {
    var _a;
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return ((_a = doc.body.textContent) == null ? void 0 : _a.replace(/\s+/g, " ").trim()) || "";
  }
  function createInstructions(instruction_pages_data = instruction_pages, enable_tts = false, ttsOptions = {}) {
    let handleButtonClick = null;
    return {
      type: InstructionsPlugin,
      pages: instruction_pages_data.map((page) => `<div class="instructions-container"><p>${page}</p></div>`),
      show_clickable_nav: true,
      allow_keys: true,
      key_forward: "ArrowRight",
      key_backward: "ArrowLeft",
      button_label_previous: trial_text.back_button,
      button_label_next: trial_text.next_button,
      on_start: function() {
        stopAllSpeech();
      },
      on_load: function() {
        if (enable_tts) {
          const speakCurrentPage = () => {
            const instructionsContent = document.querySelector(".instructions-container");
            if (instructionsContent) {
              const pageText = extractTextFromHtml(instructionsContent.innerHTML);
              if (pageText.trim()) {
                speakText(pageText, ttsOptions);
              }
            }
          };
          handleButtonClick = (event) => {
            const target = event.target;
            if (target && (target.id === "jspsych-instructions-next" || target.id === "jspsych-instructions-back")) {
              stopAllSpeech();
              setTimeout(speakCurrentPage, 100);
            }
          };
          document.addEventListener("click", handleButtonClick);
          setTimeout(speakCurrentPage, 100);
        }
      },
      on_finish: function(data) {
        stopAllSpeech();
        if (handleButtonClick) {
          document.removeEventListener("click", handleButtonClick);
          handleButtonClick = null;
        }
        data.phase = "instructions";
      }
    };
  }
  function generateTrials(config) {
    const test_svg = config.test_categories || test_categories;
    const num_trials = config.num_trials || 20;
    const trials = [];
    for (let i = 0; i < num_trials; i++) {
      const category_index = Math.floor(Math.random() * test_svg.length);
      const selected_category = test_svg[category_index];
      const test_names = Object.keys(selected_category);
      const test_name = test_names[Math.floor(Math.random() * test_names.length)];
      const [original_svg, edited_svg] = selected_category[test_name];
      const is_same = Math.random() < 0.5;
      const pattern1 = original_svg;
      const pattern2 = is_same ? original_svg : edited_svg;
      trials.push({
        pattern1,
        pattern2,
        correct_answer: is_same ? 0 : 1,
        // 0 for same, 1 for different
        category_index,
        test_name,
        is_same
      });
    }
    return trials;
  }
  function createTimeline(jsPsych, config = {}) {
    const {
      prompt = trial_text.prompt,
      enable_tts = false,
      same_button_text = trial_text.same_button,
      different_button_text = trial_text.different_button,
      trial_timeout = 1e4,
      inter_trial_interval = 500,
      show_instructions = false,
      instruction_texts = instruction_pages,
      tts_method = "google",
      tts_rate = 1,
      tts_pitch = 1,
      tts_volume = 1,
      tts_lang = "ar-SA"
    } = config;
    const ttsOptions = {
      method: tts_method,
      rate: tts_rate,
      pitch: tts_pitch,
      volume: tts_volume,
      lang: tts_lang
    };
    const trials = generateTrials(config);
    const timeline = [];
    trials.forEach((trial, index) => {
      timeline.push({
        type: HtmlButtonResponsePlugin,
        stimulus: `
        <div class="pattern-comparison-container">
          <div class="pattern-instructions">${prompt}</div>
          <div class="patterns-container">
            <div class="pattern">${trial.pattern1}</div>
            <div class="pattern">${trial.pattern2}</div>
          </div>
        </div>
      `,
        choices: [same_button_text, different_button_text],
        margin_horizontal: "20px",
        margin_vertical: "15px",
        button_html: function(choice, choice_index) {
          return `<button class="jspsych-btn continue-button pattern-trial-button">${choice}</button>`;
        },
        trial_duration: trial_timeout,
        data: {
          task: "pattern-comparison",
          trial_number: index + 1,
          correct_answer: trial.correct_answer,
          category_index: trial.category_index,
          test_name: trial.test_name,
          is_same: trial.is_same,
          pattern1: trial.pattern1,
          pattern2: trial.pattern2
        },
        on_finish: function(data) {
          data.correct = data.response === data.correct_answer;
          data.reaction_time = data.rt;
          stopAllSpeech();
        },
        on_start: function() {
          if (enable_tts) {
            speakText(prompt, ttsOptions);
          }
        }
      });
      if (index < trials.length - 1) {
        timeline.push({
          type: HtmlButtonResponsePlugin,
          stimulus: `<div class="pattern-fixation">${trial_text.fixation_cross}</div>`,
          choices: [],
          trial_duration: inter_trial_interval
        });
      }
    });
    timeline.push({
      type: HtmlButtonResponsePlugin,
      stimulus: `
      <div class="pattern-end-screen">
        <h2>${trial_text.task_complete_header}</h2>
        <p>${trial_text.task_complete_message}</p>
      </div>
    `,
      choices: ["End"],
      button_html: function(choice, choice_HTML) {
        return `<button class="jspsych-btn continue-button pattern-continue-button">${choice}</button>`;
      }
    });
    const task_timeline = {
      timeline
    };
    if (show_instructions) {
      const detailed_instructions = createInstructions(instruction_texts, enable_tts, ttsOptions);
      const nested_timeline = {
        timeline: [detailed_instructions, task_timeline]
      };
      return nested_timeline;
    } else {
      return task_timeline;
    }
  }
  function calculatePerformance(data) {
    const trial_data = data.filter((d) => d.task === "pattern-comparison");
    const correct = trial_data.filter((d) => d.correct).length;
    const total = trial_data.length;
    const accuracy = total > 0 ? correct / total * 100 : 0;
    const valid_rts = trial_data.filter((d) => d.correct && d.rt !== null).map((d) => d.rt);
    const mean_rt = valid_rts.length > 0 ? valid_rts.reduce((a, b) => a + b, 0) / valid_rts.length : null;
    const category_performance = [0, 1, 2].map((category_index) => {
      const category_trials = trial_data.filter((d) => d.category_index === category_index);
      const category_correct = category_trials.filter((d) => d.correct).length;
      const category_total = category_trials.length;
      const category_accuracy = category_total > 0 ? category_correct / category_total * 100 : 0;
      const category_valid_rts = category_trials.filter((d) => d.correct && d.rt !== null).map((d) => d.rt);
      const category_mean_rt = category_valid_rts.length > 0 ? category_valid_rts.reduce((a, b) => a + b, 0) / category_valid_rts.length : null;
      return {
        category_index,
        accuracy: category_accuracy,
        mean_reaction_time: category_mean_rt,
        total_trials: category_total,
        correct_trials: category_correct
      };
    });
    return {
      overall: {
        accuracy,
        mean_reaction_time: mean_rt,
        total_trials: total,
        correct_trials: correct
      },
      by_category: category_performance
    };
  }
  var timelineUnits = {
    instructions: "Instructions for the pattern comparison task",
    trial: "Single pattern comparison trial",
    interTrialInterval: "Fixation cross between trials",
    endScreen: "Task completion screen"
  };
  var utils = {
    generateTrials,
    createInstructions,
    speakText,
    calculatePerformance
  };
  var src_default = { createTimeline, timelineUnits, utils };

  exports.createInstructions = createInstructions;
  exports.createTimeline = createTimeline;
  exports.default = src_default;
  exports.instruction_pages = instruction_pages;
  exports.timelineUnits = timelineUnits;
  exports.trial_text = trial_text;
  exports.utils = utils;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=out.js.map
//# sourceMappingURL=index.global.js.map