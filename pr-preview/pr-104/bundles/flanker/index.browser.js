var jsPsychTimelineFlanker = (function (exports) {
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
  var TASK_NAME = "flanker";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-flanker";
  var CUE_DURATION_MS = 250;
  var ATTENTION_CHECK_PROBES = 2;
  var DEFAULT_PX_PER_DEG = 37.8;
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_NOGO_WAIT_MS = 2500;
  var INSTRUCTION_CORRECT_MS = 900;

  // src/options.ts
  var PHASE_OPTIONS = [
    "trial_feedback",
    "feedback_condition",
    "feedback_duration_ms",
    "response_window_ms",
    "fixation_duration_ms",
    "iti_ms",
    "stimulus_duration_ms",
    "soa_ms",
    "cue_target_interval_ms",
    "condition_set",
    "condition_proportions",
    "trial_order",
    "stimulus_set",
    "stimulus_layout",
    "stimulus_size",
    "stimulus_color",
    "targets_per_response"
  ];
  var DEFAULT_OPTIONS = {
    cue_target_interval_ms: 0,
    feedback_duration_ms: 400,
    fixation_duration_ms: 500,
    iti_ms: 1e3,
    response_window_ms: 800,
    soa_ms: 0,
    stimulus_duration_ms: null,
    stimulus_color: "white on black",
    stimulus_layout: {
      flanker_spacing: { gap: 2, unit: "px" },
      array_position: "centre_at_fixation",
      orientation: "horizontal"
    },
    stimulus_set: {
      target: "arrows",
      flanker: { per_side: 2 },
      neutral_flanker: "dashes",
      cue: "none"
    },
    stimulus_size: { value: 40, unit: "px" },
    targets_per_response: 1,
    concurrent_task: "none",
    condition_proportions: {
      congruent: 0.25,
      incongruent: 0.25,
      neutral_dash: 0.25,
      neutral_empty: 0.25
    },
    condition_set: ["congruent", "incongruent", "neutral_dash", "neutral_empty"],
    n_blocks: 1,
    n_test_trials: 160,
    trial_order: "shuffled_list",
    response_device: "keyboard",
    response_hand: "two_hands_index_fingers",
    response_keys: ["z", "/"],
    response_mapping_counterbalancing: "fixed",
    attention_checks: "none",
    device_eligibility: "none",
    practice_trials: 8,
    rest_breaks: "none",
    screen_calibration: "none",
    block_feedback: "none",
    feedback_condition: "all",
    trial_feedback: "none",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    speed_accuracy_emphasis: "both",
    practice: { trial_feedback: "accuracy_rt" }
  };
  var NOT_IMPLEMENTED = [
    [
      "concurrent_task",
      ["simultaneous", "interleaved_trials", "alternating_blocks"],
      "compose this timeline with the simon-task package instead"
    ],
    [
      "response_device",
      ["microphone", "eye_tracker", "gamepad"],
      "only keyboard, mouse and touch are implemented"
    ],
    [
      "attention_checks",
      ["catch_trials", "consistency_items", "self_report"],
      "only instructed_items is implemented"
    ],
    [
      "device_eligibility",
      ["browser_restricted", "hardware_required"],
      "only computer_only is implemented"
    ],
    [
      "rest_breaks",
      ["fixed_interval"],
      "the break length is not defined in the spec; use self_paced"
    ],
    ["screen_calibration", ["self_report"], "only credit_card and virtual_chinrest are implemented"],
    ["block_feedback", ["points"], "flanker has no points"],
    ["trial_feedback", ["points", "reward_outcome"], "flanker has no points or reward"],
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
      ["counterbalanced"],
      "needs an external participant counter; use random_per_participant"
    ]
  ];
  var COARSE = { neutral_dash: "neutral", neutral_empty: "neutral" };
  var coarse = (c) => {
    var _a;
    return (_a = COARSE[c]) != null ? _a : c;
  };
  function mergeMap(base, over) {
    return __spreadValues(__spreadValues({}, base), over != null ? over : {});
  }
  function resolveOptions(user = {}, phase = "test") {
    var _b, _c, _d;
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
    merged.stimulus_set = __spreadProps(__spreadValues({}, mergeMap(DEFAULT_OPTIONS.stimulus_set, layer.stimulus_set)), {
      flanker: __spreadValues(__spreadValues({}, DEFAULT_OPTIONS.stimulus_set.flanker), (_c = (_b = layer.stimulus_set) == null ? void 0 : _b.flanker) != null ? _c : {})
    });
    merged.stimulus_layout = mergeMap(DEFAULT_OPTIONS.stimulus_layout, layer.stimulus_layout);
    const propConditions = (p) => Object.keys(p).filter((k) => k !== "cued" && k !== "uncued");
    const setGiven = layer.condition_set !== void 0;
    const givenConds = layer.condition_proportions ? propConditions(layer.condition_proportions) : [];
    const propGiven = givenConds.length > 0;
    const cuedOnly = layer.condition_proportions && !propGiven ? layer.condition_proportions : {};
    if (setGiven && propGiven) {
      const a = new Set(layer.condition_set.map(coarse));
      const b = new Set(givenConds.map(coarse));
      if (a.size !== b.size || [...a].some((c) => !b.has(c))) {
        throw new Error(
          "flanker: condition_set and condition_proportions name different trial types; give one of them or make them agree."
        );
      }
    } else if (setGiven || !propGiven && layer.condition_proportions) {
      const set = (_d = layer.condition_set) != null ? _d : DEFAULT_OPTIONS.condition_set;
      merged.condition_proportions = __spreadValues(__spreadValues({}, Object.fromEntries(set.map((c) => [c, 1]))), cuedOnly);
    } else if (propGiven) {
      merged.condition_set = givenConds;
    }
    return merged;
  }
  function validateOptions(o) {
    var _a;
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`flanker: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
      throw new Error("flanker: response_keys must list exactly two keys (first = left response).");
    }
    if (!(o.n_blocks >= 1) || !Number.isInteger(o.n_blocks)) {
      throw new Error("flanker: n_blocks must be a positive integer.");
    }
    if (!(o.targets_per_response === 1 || o.targets_per_response === 2)) {
      throw new Error("flanker: targets_per_response must be 1 or 2.");
    }
    const conds = Object.keys(o.condition_proportions).filter((k) => k !== "cued" && k !== "uncued");
    if (conds.includes("nogo") && o.response_window_ms === null) {
      throw new Error(
        "flanker: a nogo condition needs a response_window_ms (null would never end the trial)."
      );
    }
    const cue = (_a = o.stimulus_set.cue) != null ? _a : "none";
    if (cue !== "none" && !(o.cue_target_interval_ms > 0)) {
      throw new Error("flanker: stimulus_set.cue is set but cue_target_interval_ms is 0.");
    }
    if (cue === "none" && o.cue_target_interval_ms > 0) {
      throw new Error(
        'flanker: cue_target_interval_ms > 0 needs stimulus_set.cue other than "none".'
      );
    }
    if (o.device_eligibility === "computer_only" && o.response_device === "touch") {
      throw new Error(
        'flanker: device_eligibility "computer_only" contradicts response_device "touch".'
      );
    }
  }

  // src/scoring.ts
  function calculateScores(data) {
    const test = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
    const meanOrNull = (col, field) => {
      const sel = col.select(field);
      return sel.count() > 0 ? sel.mean() : null;
    };
    const accuracyOf = (col) => col.count() > 0 ? col.filter({ correct: true }).count() / col.count() : null;
    const byCongruency = (congruency) => test.filter({ congruency });
    const rtOf = (congruency) => meanOrNull(byCongruency(congruency).filter({ correct: true }), "rt");
    const n = test.count();
    const congruentAcc = accuracyOf(byCongruency("congruent"));
    const incongruentAcc = accuracyOf(byCongruency("incongruent"));
    const congruentRt = rtOf("congruent");
    const incongruentRt = rtOf("incongruent");
    const rtCorrect = test.filter({ correct: true }).filterCustom((t) => t.congruency !== "nogo");
    return {
      n_trials: n,
      n_correct: test.filter({ correct: true }).count(),
      n_timeouts: test.filter({ timeout: true }).count(),
      accuracy: accuracyOf(test),
      mean_rt: meanOrNull(rtCorrect, "rt"),
      congruent_accuracy: congruentAcc,
      incongruent_accuracy: incongruentAcc,
      neutral_accuracy: accuracyOf(byCongruency("neutral")),
      nogo_accuracy: accuracyOf(byCongruency("nogo")),
      congruent_rt: congruentRt,
      incongruent_rt: incongruentRt,
      neutral_rt: rtOf("neutral"),
      flanker_effect_rt: congruentRt !== null && incongruentRt !== null ? incongruentRt - congruentRt : null,
      flanker_effect_errors: congruentAcc !== null && incongruentAcc !== null ? congruentAcc - incongruentAcc : null
    };
  }
  function getSummary(data) {
    return __spreadProps(__spreadValues({}, calculateScores(data)), { task: TASK_NAME, version: VERSION });
  }

  // src/stimuli.ts
  var ARROW_RIGHT_PATH = "m24 40-2.1-2.15L34.25 25.5H8v-3h26.25L21.9 10.15 24 8l16 16Z";
  var ARROW_LEFT_PATH = "M24 40 8 24 24 8l2.1 2.1-12.4 12.4H40v3H13.7l12.4 12.4Z";
  function svg(inner, size, rotate = 0) {
    const t = rotate ? ` transform="rotate(${rotate} 24 24)"` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48"><g fill="currentColor"${t}>${inner}</g></svg>`;
  }
  function renderGlyph(glyph, size) {
    switch (glyph) {
      case "left":
        return svg(`<path d="${ARROW_LEFT_PATH}"/>`, size);
      case "right":
        return svg(`<path d="${ARROW_RIGHT_PATH}"/>`, size);
      case "up":
        return svg(`<path d="${ARROW_RIGHT_PATH}"/>`, size, -90);
      case "dash":
        return svg(`<rect x="8" y="22.5" width="32" height="3"/>`, size);
      case "line":
        return svg(`<rect x="22.5" y="8" width="3" height="32"/>`, size);
      case "square":
        return svg(`<rect x="12" y="12" width="24" height="24"/>`, size);
      case "plus":
        return svg(
          `<rect x="8" y="22.5" width="32" height="3"/><rect x="22.5" y="8" width="3" height="32"/>`,
          size
        );
      case "diamond":
        return svg(`<path d="M24 8 40 24 24 40 8 24Z"/>`, size);
      case "cross":
        return svg(
          `<path d="M12 12 36 36M36 12 12 36" stroke="currentColor" stroke-width="3.5" fill="none"/>`,
          size
        );
      case "blank":
        return "";
      default:
        return `<span class="letter" style="font-size:${size}px">${glyph}</span>`;
    }
  }
  function neutralGlyph(form, letter) {
    switch (form) {
      case "dashes":
        return "dash";
      case "blank":
        return "blank";
      case "straight_lines":
        return "line";
      case "squares":
        return "square";
      case "plus_signs":
        return "plus";
      case "diamonds":
        return "diamond";
      case "vertical_arrows":
        return "up";
      case "unmapped_letter":
        return letter;
    }
  }
  function toPx(value, unit, pxPerDeg2, viewportHeight2) {
    if (unit === "deg") return value * pxPerDeg2;
    if (unit === "screen_height_fraction") return value * viewportHeight2;
    return value;
  }
  function renderArray(a) {
    const cell = (g, hidden) => `<span class="jspsych-timelines-flanker-item" style="width:${a.size_px}px;height:${a.size_px}px;${hidden ? "visibility:hidden;" : ""}">${renderGlyph(g, a.size_px)}</span>`;
    const hideF = a.hide === "flankers";
    const hideT = a.hide === "target";
    const items = [
      ...[...a.flankers].reverse().map((g) => cell(g, hideF)),
      cell(a.target, hideT),
      ...a.flankers.map((g) => cell(g, hideF))
    ].join("");
    const dir = a.orientation === "vertical" ? "column" : "row";
    return `${paintDisplay(a.fg, a.bg)}<div class="jspsych-timelines-flanker-stage">
    <div class="jspsych-timelines-flanker-array" data-orientation="${a.orientation}" style="flex-direction:${dir};gap:${a.gap_px}px;transform:translateY(${a.offset_px}px);">${items}</div>
  </div>`;
  }
  function parseColors(spec) {
    const m = /^\s*(.+?)\s+on\s+(.+?)\s*$/i.exec(spec);
    if (!m)
      throw new Error(`flanker: stimulus_color must look like "white on black", got "${spec}".`);
    return { fg: m[1], bg: m[2] };
  }
  var SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;
  function paintDisplay(fg, bg) {
    if (!SAFE_COLOR.test(fg) || !SAFE_COLOR.test(bg))
      throw new Error(`flanker: unsupported colour in stimulus_color ("${fg}" on "${bg}").`);
    return `<style>.jspsych-display-element:has(.jspsych-timelines-flanker){background:${bg};color:${fg};}</style>`;
  }
  function renderStage(inner, fg, bg) {
    return `${paintDisplay(
    fg,
    bg
  )}<div class="jspsych-timelines-flanker-stage"><div class="jspsych-timelines-flanker-center">${inner}</div></div>`;
  }

  // src/sequence.ts
  function allocateCounts(weights, n) {
    const total = weights.reduce((a, b) => a + b, 0);
    if (!(total > 0)) throw new Error("flanker: condition proportions must sum to more than 0.");
    const exact = weights.map((w) => w / total * n);
    const counts = exact.map(Math.floor);
    let left = n - counts.reduce((a, b) => a + b, 0);
    const order = exact.map((e, i) => ({ i, r: e - Math.floor(e) })).sort((a, b) => b.r - a.r || a.i - b.i);
    for (let k = 0; left > 0; k = (k + 1) % order.length, left--) counts[order[k].i]++;
    return counts;
  }
  function expandDuration(d) {
    if (typeof d === "number") return [d];
    const step = d.step && d.step > 0 ? d.step : 1;
    const out = [];
    for (let v = d.min; v <= d.max + 1e-9; v += step) out.push(v);
    return out;
  }
  var NEUTRAL_LETTERS = ["S", "X", "O", "Z", "T"];
  function nonTargetLetter(groups) {
    var _a;
    const used = new Set(groups.flat().map((l) => l.toUpperCase()));
    return (_a = NEUTRAL_LETTERS.find((l) => !used.has(l))) != null ? _a : "#";
  }
  function balanced(ctx, values, n, shuffle) {
    const out = [];
    for (let i = 0; i < n; i++) out.push(values[i % values.length]);
    return shuffle ? ctx.jsPsych.randomization.shuffle(out) : out;
  }
  function buildTrialSpecs(ctx, n) {
    var _a, _b, _c, _d, _e;
    const { jsPsych, o } = ctx;
    const R = jsPsych.randomization;
    const props = o.condition_proportions;
    const conds = Object.keys(props).filter(
      (k) => {
        var _a2;
        return k !== "cued" && k !== "uncued" && ((_a2 = props[k]) != null ? _a2 : 0) > 0;
      }
    );
    const weights = conds.map((c) => props[c]);
    const order = o.trial_order;
    const target = (_a = o.stimulus_set.target) != null ? _a : "arrows";
    const letters = target === "arrows" ? null : target.letters;
    const perSides = (() => {
      var _a2, _b2;
      const p = (_b2 = (_a2 = o.stimulus_set.flanker) == null ? void 0 : _a2.per_side) != null ? _b2 : 2;
      return Array.isArray(p) ? p : [p];
    })();
    const spacing = (_b = o.stimulus_layout.flanker_spacing) != null ? _b : { gap: 0, unit: "px" };
    const gaps = spacing === "adjacent" ? [0] : Array.isArray(spacing.gap) ? spacing.gap : [spacing.gap];
    const gapUnit = spacing === "adjacent" ? "px" : spacing.unit;
    const neutralForms = (() => {
      var _a2;
      const f = (_a2 = o.stimulus_set.neutral_flanker) != null ? _a2 : "dashes";
      return Array.isArray(f) ? f : [f];
    })();
    let neutralCounter = 0;
    const spare = letters ? nonTargetLetter(letters) : "S";
    let condList;
    if (order === "random") {
      condList = R.sampleWithReplacement(conds, n, weights);
    } else {
      const counts = allocateCounts(weights, n);
      condList = [];
      if (order === "fixed_sequence") {
        const left = [...counts];
        while (left.some((c) => c > 0)) {
          conds.forEach((c, i) => {
            if (left[i] > 0) {
              condList.push(c);
              left[i]--;
            }
          });
        }
      } else {
        conds.forEach((c, i) => {
          for (let k = 0; k < counts[i]; k++) condList.push(c);
        });
      }
    }
    const shuffle = order === "shuffled_list";
    const rnd = order === "random";
    const groups = new Array(n);
    const byCond = /* @__PURE__ */ new Map();
    condList.forEach((c, i) => {
      var _a2;
      return byCond.set(c, [...(_a2 = byCond.get(c)) != null ? _a2 : [], i]);
    });
    byCond.forEach((idx) => {
      const dirs = rnd ? idx.map(() => R.randomInt(0, 1)) : balanced(ctx, [0, 1], idx.length, shuffle);
      idx.forEach((i, k) => groups[i] = dirs[k]);
    });
    const sides = rnd ? condList.map(() => R.sampleWithReplacement(perSides, 1)[0]) : balanced(ctx, perSides, n, shuffle);
    const gapList = rnd ? condList.map(() => R.sampleWithReplacement(gaps, 1)[0]) : balanced(ctx, gaps, n, shuffle);
    let cuedList = new Array(n).fill(null);
    if (((_c = o.stimulus_set.cue) != null ? _c : "none") !== "none") {
      const pc = (_d = props.cued) != null ? _d : props.uncued === void 0 ? 1 : 0;
      const pu = (_e = props.uncued) != null ? _e : 0;
      if (rnd) {
        cuedList = condList.map(
          () => R.sampleWithReplacement([true, false], 1, [pc || 1e-9, pu || 1e-9])[0]
        );
      } else {
        const [nc] = allocateCounts([pc, pu], n);
        const flags = [...new Array(nc).fill(true), ...new Array(n - nc).fill(false)];
        cuedList = shuffle ? R.shuffle(flags) : flags;
      }
    }
    const fixations = expandDuration(o.fixation_duration_ms);
    const pickLetter = (g, k) => {
      const grp = letters[g];
      return grp[k % grp.length];
    };
    const letterCounter = [0, 0];
    const specs = condList.map((c, i) => {
      const g = groups[i];
      const congruency = c === "congruent" ? "congruent" : c === "incongruent" ? "incongruent" : c === "nogo" ? "nogo" : "neutral";
      let tgt;
      let flank;
      let cond = c;
      const form = c === "neutral_dash" ? "dashes" : c === "neutral_empty" ? "blank" : neutralForms[neutralCounter++ % neutralForms.length];
      if (c === "neutral") cond = `neutral_${form}`;
      if (letters) {
        const k = letterCounter[g]++;
        const grp = letters[g];
        const rndLetter = rnd ? grp[R.randomInt(0, grp.length - 1)] : pickLetter(g, k);
        const other = letters[g === 0 ? 1 : 0];
        if (congruency === "nogo") {
          tgt = "cross";
          flank = other[0];
        } else {
          tgt = rndLetter;
          flank = congruency === "congruent" ? tgt : congruency === "incongruent" ? other[R.randomInt(0, other.length - 1)] : neutralGlyph(form, spare);
        }
      } else {
        const arrow = g === 0 ? "left" : "right";
        const opposite = g === 0 ? "right" : "left";
        if (congruency === "nogo") {
          tgt = "cross";
          flank = arrow;
        } else {
          tgt = arrow;
          flank = congruency === "congruent" ? arrow : congruency === "incongruent" ? opposite : neutralGlyph(form, spare);
        }
      }
      return {
        flanker_condition: cond,
        congruency,
        group: g,
        target: tgt,
        flanker: flank,
        per_side: sides[i],
        gap: gapList[i],
        gap_unit: gapUnit,
        cued: cuedList[i],
        fixation_ms: R.sampleWithReplacement(fixations, 1)[0]
      };
    });
    if (order === "shuffled_list") return R.shuffle(specs);
    return specs;
  }
  function buildDemoSpec(o, flanker_condition, form, group) {
    var _a, _b, _c, _d;
    const congruency = flanker_condition.startsWith("neutral") ? "neutral" : flanker_condition;
    const target = (_a = o.stimulus_set.target) != null ? _a : "arrows";
    const letters = target === "arrows" ? null : target.letters;
    const p = (_c = (_b = o.stimulus_set.flanker) == null ? void 0 : _b.per_side) != null ? _c : 2;
    const per_side = Array.isArray(p) ? p[0] : p;
    const spacing = (_d = o.stimulus_layout.flanker_spacing) != null ? _d : { gap: 0, unit: "px" };
    const gap = spacing === "adjacent" ? 0 : Array.isArray(spacing.gap) ? spacing.gap[0] : spacing.gap;
    const gap_unit = spacing === "adjacent" ? "px" : spacing.unit;
    const other = group === 0 ? 1 : 0;
    let tgt;
    let flank;
    if (letters) {
      tgt = letters[group][0];
      flank = congruency === "nogo" ? letters[other][0] : congruency === "congruent" ? tgt : congruency === "incongruent" ? letters[other][0] : neutralGlyph(form, nonTargetLetter(letters));
      if (congruency === "nogo") tgt = "cross";
    } else {
      const arrow = group === 0 ? "left" : "right";
      tgt = congruency === "nogo" ? "cross" : arrow;
      flank = congruency === "incongruent" ? group === 0 ? "right" : "left" : congruency === "neutral" ? neutralGlyph(form, "S") : arrow;
    }
    return {
      flanker_condition,
      congruency,
      group,
      target: tgt,
      flanker: flank,
      per_side,
      gap,
      gap_unit,
      cued: null,
      fixation_ms: 0
    };
  }

  // src/text.ts
  var defaultText = {
    instruction_intro_arrows: `<h2>Flanker Task</h2>
    <p>On each trial you will see a row of arrows.</p>
    <p>Your job is to identify the direction of the <strong>CENTER</strong> arrow and ignore the others.</p>`,
    instruction_intro_letters: `<h2>Flanker Task</h2>
    <p>On each trial you will see a row of letters.</p>
    <p>Your job is to identify the <strong>CENTER</strong> letter and ignore the others.</p>`,
    instruction_response: (r) => r.device === "keyboard" ? `<h2>How to Respond</h2>
    <p>Center ${r.left_target}: press <strong>${r.left_response}</strong>.</p>
    <p>Center ${r.right_target}: press <strong>${r.right_response}</strong>.</p>` : `<h2>How to Respond</h2>
    <p>Center ${r.left_target}: ${r.device === "touch" ? "tap" : "click"} <strong>${r.left_response}</strong>.</p>
    <p>Center ${r.right_target}: ${r.device === "touch" ? "tap" : "click"} <strong>${r.right_response}</strong>.</p>`,
    instruction_demo_intro: `<h2>Let's Try It</h2>
    <p>Here are a few examples of what you will see. Respond to each one as you would in the task.</p>
    <p>There is no time limit here. If you respond incorrectly, you will get a hint and try again.</p>`,
    instruction_examples_intro: `<h2>Examples</h2>
    <p>Here are a few examples of what you will see, with the correct response for each.</p>`,
    instruction_step: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      switch (r.condition) {
        case "congruent":
          return `<p>The items on the sides are the same as the center one. The center is ${r.target}, so ${act} <strong>${r.response}</strong>.</p>`;
        case "neutral":
          return `<p>The items on the sides are different from the center one, but they give no hint. The center is ${r.target}, so ${act} <strong>${r.response}</strong>.</p>`;
        case "incongruent":
          return `<p>The items on the sides are different from the center one. Ignore them. The center is ${r.target}, so ${act} <strong>${r.response}</strong>.</p>`;
        case "nogo":
          return `<p>The center item is a cross. When you see a cross, do <strong>not</strong> respond. Just wait.</p>`;
      }
    },
    instruction_hint: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      switch (r.condition) {
        case "incongruent":
          return `<p>That is the response for the items on the sides. Respond to the <strong>center</strong> one: it is ${r.target}, so ${act} <strong>${r.response}</strong>.</p><p>Let's try again.</p>`;
        case "nogo":
          return `<p>A cross means do <strong>not</strong> respond. Wait until it disappears.</p><p>Let's try again.</p>`;
        default:
          return `<p>Not quite. Look at the <strong>center</strong> item: it is ${r.target}, so ${act} <strong>${r.response}</strong>.</p><p>Let's try again.</p>`;
      }
    },
    instruction_reveal: (r) => {
      const act = r.device === "keyboard" ? "press" : r.device === "touch" ? "tap" : "click";
      return r.condition === "nogo" ? `<p>With a cross, do not respond at all. Let's move on.</p>` : `<p>For this one, ${act} <strong>${r.response}</strong>. Let's move on.</p>`;
    },
    instruction_correct: "Correct!",
    hand_two_hands_index_fingers: "Use the index finger of each hand, one for each response.",
    hand_one_hand_dominant: "Use your dominant hand for both responses.",
    emphasis_speed: "Respond as quickly as you can.",
    emphasis_accuracy: "Try to be as accurate as you can.",
    emphasis_both: "Respond as quickly and as accurately as you can.",
    instruction_practice_intro: `<h2>Practice</h2><p>First, a few practice trials.</p>`,
    instruction_test_intro: `<h2>Main Task</h2><p>Now the main task begins.</p>`,
    left_button: "Left",
    right_button: "Right",
    continue_button: "Continue",
    ok_button: "OK",
    correct_feedback: "Correct",
    incorrect_feedback: "Incorrect",
    timeout_feedback: "Too slow!",
    feedback_rt: (r) => `${Math.round(r.rt)} ms`,
    feedback_correct_answer: (r) => `Correct answer: ${r.answer}`,
    fixation: "+",
    block_complete: (blockNumber) => `Block ${blockNumber} complete. Take a short break if needed.`,
    block_feedback: (r) => {
      const parts = [`Block ${r.block} of ${r.n_blocks} complete.`];
      if (r.kind === "accuracy" || r.kind === "accuracy_rt") {
        parts.push(`Accuracy: ${Math.round(r.accuracy * 100)}%`);
      }
      if ((r.kind === "rt" || r.kind === "accuracy_rt") && r.mean_rt !== null) {
        parts.push(`Mean response time: ${Math.round(r.mean_rt)} ms`);
      }
      return parts.map((p) => `<p>${p}</p>`).join("");
    },
    attention_check_prompt: (r) => `<p>Attention check: please respond with <strong>${r.response_label}</strong>.</p>`,
    device_not_supported: "This task needs a laptop or desktop computer. Please return on a computer.",
    task_complete: "Task Complete",
    result_summary: (r) => {
      let html = "";
      if (r.accuracy !== null)
        html += `<p><strong>Accuracy:</strong> ${(r.accuracy * 100).toFixed(1)}%</p>`;
      if (r.flanker_effect_rt !== null) {
        html += `<p><strong>Flanker effect (RT):</strong> ${r.flanker_effect_rt.toFixed(0)} ms</p>`;
      }
      if (r.mean_rt !== null)
        html += `<p><strong>Mean response time:</strong> ${r.mean_rt.toFixed(0)} ms</p>`;
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
  styleInject(".jspsych-timelines-flanker .jspsych-timelines-flanker-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-text h2 {\n  text-align: center;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-stage {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 640px;\n  max-width: calc(100vw - 16px);\n  height: 280px;\n  margin: 0 auto;\n  padding: 20px;\n  overflow: hidden;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-array {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-item {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-item .letter {\n  font-family: monospace;\n  font-weight: bold;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 80px;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-fixation {\n  font-size: 3em;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-cue {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 40px;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-cue .dot {\n  width: 24px;\n  height: 24px;\n  border: 3px solid currentColor;\n  border-radius: 50%;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-feedback {\n  font-size: 1.6em;\n}\n.jspsych-timelines-flanker .jspsych-timelines-flanker-feedback.incorrect,\n.jspsych-timelines-flanker .jspsych-timelines-flanker-feedback.timeout {\n  font-weight: bold;\n}\n");

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

  // ../../node_modules/@jspsych/plugin-virtual-chinrest/dist/index.js
  var version4 = "3.1.0";
  var info3 = {
    name: "virtual-chinrest",
    version: version4,
    parameters: {
      /**
       * Units to resize the jsPsych content to after the trial is over: `"none"` `"cm"` `"inch"` or `"deg"`.
       * If `"none"`, no resizing will be done to the jsPsych content after the virtual-chinrest trial ends.
       */
      resize_units: {
        type: ParameterType.SELECT,
        options: ["none", "cm", "inch", "deg"],
        default: "none"
      },
      /**
       * After the scaling factor is applied, this many pixels will equal one unit of measurement, where
       * the units are indicated by `resize_units`. This is only used when resizing is done after the
       * trial ends (i.e. the `resize_units` parameter is not "none").
       */
      pixels_per_unit: {
        type: ParameterType.INT,
        default: 100
      },
      // mouse_adjustment: {
      //   type: ParameterType.BOOL,
      //   pretty_name: "Adjust Using Mouse?",
      //   default: true,
      // },
      /** This string can contain HTML markup. Any content here will be displayed
       * **below the card stimulus** during the resizing phase.
       */
      adjustment_prompt: {
        type: ParameterType.HTML_STRING,
        default: `
          <div style="text-align: left;">
          <p>Click and drag the lower right corner of the image until it is the same size as a credit card held up to the screen.</p>
          <p>You can use any card that is the same size as a credit card, like a membership card or driver's license.</p>
          <p>If you do not have access to a real card you can use a ruler to measure the image width to 3.37 inches or 85.6 mm.</p>
          </div>`
      },
      /** Content of the button displayed below the card stimulus during the resizing phase. */
      adjustment_button_prompt: {
        type: ParameterType.HTML_STRING,
        default: "Click here when the image is the correct size"
      },
      /** Path of the item to be presented in the card stimulus during the resizing phase. If `null` then no
       * image is shown, and a solid color background is used instead. _An example image is available in
       * `/examples/img/card.png`_
       */
      item_path: {
        type: ParameterType.IMAGE,
        default: null,
        preload: false
      },
      /** The known height of the physical item (e.g. credit card) to be measured, in mm. */
      item_height_mm: {
        type: ParameterType.FLOAT,
        default: 53.98
      },
      /** The known width of the physical item (e.g. credit card) to be measured, in mm. */
      item_width_mm: {
        type: ParameterType.FLOAT,
        default: 85.6
      },
      /** The initial size of the card stimulus, in pixels, along its largest dimension. */
      item_init_size: {
        type: ParameterType.INT,
        default: 250
      },
      /** How many times to measure the blindspot location. If `0`, blindspot will not be detected, and viewing distance and degree data will not be computed. */
      blindspot_reps: {
        type: ParameterType.INT,
        default: 5
      },
      /** This string can contain HTML markup. Any content here will be displayed **above the blindspot task**. */
      blindspot_prompt: {
        type: ParameterType.HTML_STRING,
        pretty_name: "Blindspot prompt",
        default: `
          <p>Now we will quickly measure how far away you are sitting.</p>
          <div style="text-align: left">
            <ol>
              <li>Put your left hand on the <b>space bar</b>.</li>
              <li>Cover your right eye with your right hand.</li>
              <li>Using your left eye, focus on the black square. Keep your focus on the black square.</li>
              <li>The <span style="color: red; font-weight: bold;">red ball</span> will disappear as it moves from right to left. Press the space bar as soon as the ball disappears.</li>
            </ol>
          </div>
          <p>Press the space bar when you are ready to begin.</p>
          `
      },
      /** Content of the start button for the blindspot tasks. */
      // blindspot_start_prompt: {
      //   type: ParameterType.HTML_STRING,
      //   pretty_name: "Blindspot start prompt",
      //   default: "Start"
      // },
      /** Text accompanying the remaining measurements counter that appears below the blindspot task. */
      blindspot_measurements_prompt: {
        type: ParameterType.HTML_STRING,
        default: "Remaining measurements: "
      },
      /** Estimated viewing distance data displayed after blindspot task. If `"none"` is given, viewing distance will not be reported to the participant. The HTML `span` element with `id = distance-estimate` returns the distance. */
      viewing_distance_report: {
        type: ParameterType.HTML_STRING,
        default: "<p>Based on your responses, you are sitting about <span id='distance-estimate' style='font-weight: bold;'></span> from the screen.</p><p>Does that seem about right?</p>"
      },
      /** Text for the button on the viewing distance report page to re-do the viewing distance estimate. If the participant click this button, the blindspot task starts again. */
      redo_measurement_button_label: {
        type: ParameterType.HTML_STRING,
        default: "No, that is not close. Try again."
      },
      /** Text for the button on the viewing distance report page that can be clicked to accept the viewing distance estimate. */
      blindspot_done_prompt: {
        type: ParameterType.HTML_STRING,
        default: "Yes"
      }
    },
    data: {
      /** The response time in milliseconds. */
      rt: {
        type: ParameterType.INT
      },
      /** The height in millimeters of the item to be measured. */
      item_height_mm: {
        type: ParameterType.FLOAT
      },
      /** The width in millimeters of the item to be measured. */
      item_width_mm: {
        type: ParameterType.FLOAT
      },
      /** Final height of the resizable div container, in degrees. */
      item_height_deg: {
        type: ParameterType.FLOAT
      },
      /** Final width of the resizable div container, in degrees. */
      item_width_deg: {
        type: ParameterType.FLOAT
      },
      /** Final width of the resizable div container, in pixels. */
      item_width_px: {
        type: ParameterType.FLOAT
      },
      /** Pixels to degrees conversion factor. */
      px2deg: {
        type: ParameterType.INT
      },
      /** Pixels to millimeters conversion factor. */
      px2mm: {
        type: ParameterType.FLOAT
      },
      /** Scaling factor that will be applied to the div containing jsPsych content. */
      scale_factor: {
        type: ParameterType.FLOAT
      },
      /** The interior width of the window in degrees. */
      win_width_deg: {
        type: ParameterType.FLOAT
      },
      /** The interior height of the window in degrees. */
      win_height_deg: {
        type: ParameterType.FLOAT
      },
      /** Estimated distance to the screen in millimeters. */
      view_dist_mm: {
        type: ParameterType.FLOAT
      }
    },
    // prettier-ignore
    citations: {
      "apa": "de Leeuw, J. R., Gilbert, R. A., & Luchterhandt, B. (2023). jsPsych: Enabling an Open-Source Collaborative Ecosystem of Behavioral Experiments. Journal of Open Source Software, 8(85), 5351. https://doi.org/10.21105/joss.05351 ",
      "bibtex": '@article{Leeuw2023jsPsych, 	author = {de Leeuw, Joshua R. and Gilbert, Rebecca A. and Luchterhandt, Bj{\\" o}rn}, 	journal = {Journal of Open Source Software}, 	doi = {10.21105/joss.05351}, 	issn = {2475-9066}, 	number = {85}, 	year = {2023}, 	month = {may 11}, 	pages = {5351}, 	publisher = {Open Journals}, 	title = {jsPsych: Enabling an {Open}-{Source} {Collaborative} {Ecosystem} of {Behavioral} {Experiments}}, 	url = {https://joss.theoj.org/papers/10.21105/joss.05351}, 	volume = {8}, }  '
    }
  };
  var _VirtualChinrestPlugin = class _VirtualChinrestPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
      this.ball_size = 30;
      this.ball = null;
      this.container = null;
      this.reps_remaining = 0;
      this.ball_animation_frame_id = null;
    }
    trial(display_element, trial) {
      if (!(trial.blindspot_reps > 0) && (trial.resize_units == "deg" || trial.resize_units == "degrees")) {
        console.error(
          "Blindspot repetitions set to 0, so resizing to degrees of visual angle is not possible!"
        );
        return;
      }
      this.reps_remaining = trial.blindspot_reps;
      let trial_data = {
        item_width_mm: trial.item_width_mm,
        item_height_mm: trial.item_height_mm
        //card dimension: 85.60 × 53.98 mm (3.370 × 2.125 in)
      };
      let blindspot_config_data = {
        ball_pos: [],
        slider_clck: false
      };
      let aspect_ratio = trial.item_width_mm / trial.item_height_mm;
      const start_div_height = aspect_ratio < 1 ? trial.item_init_size : Math.round(trial.item_init_size / aspect_ratio);
      const start_div_width = aspect_ratio < 1 ? Math.round(trial.item_init_size * aspect_ratio) : trial.item_init_size;
      const adjust_size = Math.round(start_div_width * 0.1);
      let pagesize_content = `
        <div id="page-size">
          <div id="item" style="border: none; height: ${start_div_height}px; width: ${start_div_width}px; margin: 5px auto; background-color: #ddd; position: relative; ${trial.item_path === null ? "" : `background-image: url(${trial.item_path}); background-size: 100% auto; background-repeat: no-repeat;`}">
            <div id="jspsych-resize-handle" style="cursor: nwse-resize; background-color: none; width: ${adjust_size}px; height: ${adjust_size}px; border: 5px solid red; border-left: 0; border-top: 0; position: absolute; bottom: 0; right: 0;">
            </div>
          </div>
          ${trial.adjustment_prompt}
          <button id="end_resize_phase" class="jspsych-btn">
            ${trial.adjustment_button_prompt}
          </button>
        </div>
      `;
      let blindspot_content = `
        <div id="blind-spot">
          ${trial.blindspot_prompt}
          <div id="svgDiv" style="height:100px; position:relative;"></div>
          <button class="btn btn-primary" id="proceed" style="display:none;"> +
            ${trial.blindspot_done_prompt} +
          </button>
          ${trial.blindspot_measurements_prompt} 
          <div id="click" style="display:inline; color: red"> ${trial.blindspot_reps} </div>
        </div>`;
      let report_content = `
        <div id="distance-report">
          <div id="info-h">
            ${trial.viewing_distance_report}
          </div>
          <button id="redo_blindspot" class="jspsych-btn">${trial.redo_measurement_button_label}</button>
          <button id="proceed" class="jspsych-btn">${trial.blindspot_done_prompt}</button>
        </div>
      `;
      display_element.innerHTML = `<div id="content" style="width: 900px; margin: 0 auto;"></div>`;
      const start_time = performance.now();
      startResizePhase();
      function startResizePhase() {
        display_element.querySelector("#content").innerHTML = pagesize_content;
        let dragging = false;
        let origin_x, origin_y;
        let cx, cy;
        const scale_div = display_element.querySelector("#item");
        function mouseupevent() {
          dragging = false;
        }
        document.addEventListener("mouseup", mouseupevent);
        function mousedownevent(e) {
          e.preventDefault();
          dragging = true;
          origin_x = e.pageX;
          origin_y = e.pageY;
          cx = parseInt(scale_div.style.width);
          cy = parseInt(scale_div.style.height);
        }
        display_element.querySelector("#jspsych-resize-handle").addEventListener("mousedown", mousedownevent);
        function resizeevent(e) {
          if (dragging) {
            let dx = e.pageX - origin_x;
            let dy = e.pageY - origin_y;
            if (Math.abs(dx) >= Math.abs(dy)) {
              scale_div.style.width = Math.round(Math.max(20, cx + dx * 2)) + "px";
              scale_div.style.height = Math.round(Math.max(20, cx + dx * 2) / aspect_ratio) + "px";
            } else {
              scale_div.style.height = Math.round(Math.max(20, cy + dy * 2)) + "px";
              scale_div.style.width = Math.round(aspect_ratio * Math.max(20, cy + dy * 2)) + "px";
            }
          }
        }
        display_element.addEventListener("mousemove", resizeevent);
        display_element.querySelector("#end_resize_phase").addEventListener("click", finishResizePhase);
      }
      function finishResizePhase() {
        const item_width_px = document.querySelector("#item").getBoundingClientRect().width;
        trial_data["item_width_px"] = Math.round(item_width_px);
        const px2mm = convertPixelsToMM(item_width_px);
        trial_data["px2mm"] = accurateRound(px2mm, 2);
        if (trial.blindspot_reps > 0) {
          startBlindSpotPhase();
        } else {
          endTrial();
        }
      }
      const startBlindSpotPhase = () => {
        blindspot_config_data = {
          ball_pos: [],
          slider_clck: false
        };
        display_element.querySelector("#content").innerHTML = blindspot_content;
        this.container = display_element.querySelector("#svgDiv");
        drawBall();
        resetAndWaitForBallStart();
      };
      const resetAndWaitForBallStart = () => {
        const rectX = this.container.getBoundingClientRect().width - this.ball_size;
        const ballX = rectX * 0.85;
        this.ball.style.left = `${ballX}px`;
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: startBall,
          valid_responses: [" "],
          rt_method: "performance",
          allow_held_key: false,
          persist: false
        });
      };
      const startBall = () => {
        this.jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: recordPosition,
          valid_responses: [" "],
          rt_method: "performance",
          allow_held_key: false,
          persist: false
        });
        this.ball_animation_frame_id = requestAnimationFrame(animateBall);
      };
      const finishBlindSpotPhase = () => {
        const angle = 13.5;
        const sum = blindspot_config_data["ball_pos"].reduce((a, b) => a + b, 0);
        const ballPosLen = blindspot_config_data["ball_pos"].length;
        blindspot_config_data["avg_ball_pos"] = accurateRound(sum / ballPosLen, 2);
        const ball_sqr_distance = (blindspot_config_data["square_pos"] - blindspot_config_data["avg_ball_pos"]) / trial_data["px2mm"];
        const viewDistance = ball_sqr_distance / Math.tan(deg_to_radians(angle));
        trial_data["view_dist_mm"] = accurateRound(viewDistance, 2);
        if (trial.viewing_distance_report == "none") {
          endTrial();
        } else {
          showReport();
        }
      };
      function showReport() {
        display_element.querySelector("#content").innerHTML = report_content;
        display_element.querySelector("#distance-estimate").innerHTML = `
          ${Math.round(trial_data["view_dist_mm"] / 10)} cm (${Math.round(
        trial_data["view_dist_mm"] * 0.0393701
      )} inches)
        `;
        display_element.querySelector("#redo_blindspot").addEventListener("click", startBlindSpotPhase);
        display_element.querySelector("#proceed").addEventListener("click", endTrial);
      }
      function computeTransformation() {
        trial_data.item_width_deg = 2 * Math.atan(trial_data["item_width_mm"] / 2 / trial_data["view_dist_mm"]) * 180 / Math.PI;
        trial_data.px2deg = trial_data["item_width_px"] / trial_data.item_width_deg;
        let px2unit_scr = 0;
        switch (trial.resize_units) {
          case "cm":
          case "centimeters":
            px2unit_scr = trial_data["px2mm"] * 10;
            break;
          case "inch":
          case "inches":
            px2unit_scr = trial_data["px2mm"] * 25.4;
            break;
          case "deg":
          case "degrees":
            px2unit_scr = trial_data["px2deg"];
            break;
        }
        if (px2unit_scr > 0) {
          let scale_factor = px2unit_scr / trial.pixels_per_unit;
          document.getElementById("jspsych-content").style.transform = "scale(" + scale_factor + ")";
          trial_data.px2deg = trial_data.px2deg / scale_factor;
          trial_data.px2mm = trial_data.px2mm / scale_factor;
          trial_data.item_width_px = trial_data.item_width_px / scale_factor;
          trial_data.scale_factor = scale_factor;
        }
        if (trial.blindspot_reps > 0) {
          trial_data.win_width_deg = window.innerWidth / trial_data.px2deg;
          trial_data.win_height_deg = window.innerHeight / trial_data.px2deg;
        } else {
          delete trial_data.px2deg;
          delete trial_data.item_width_deg;
        }
      }
      const endTrial = () => {
        trial_data.rt = Math.round(performance.now() - start_time);
        this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
        computeTransformation();
        this.jsPsych.finishTrial(trial_data);
      };
      const drawBall = () => {
        this.container.innerHTML = `
        <div id="virtual-chinrest-circle" style="position: absolute; background-color: #f00; width: ${this.ball_size}px; height: ${this.ball_size}px; border-radius:${this.ball_size}px;"></div>
        <div id="virtual-chinrest-square" style="position: absolute; background-color: #000; width: ${this.ball_size}px; height: ${this.ball_size}px;"></div>
      `;
        const ball = this.container.querySelector("#virtual-chinrest-circle");
        const square = this.container.querySelector("#virtual-chinrest-square");
        const rectX = this.container.getBoundingClientRect().width - this.ball_size;
        const ballX = rectX * 0.85;
        ball.style.left = `${ballX}px`;
        square.style.left = `${rectX}px`;
        this.ball = ball;
        blindspot_config_data["square_pos"] = accurateRound(getElementCenter(square).x, 2);
      };
      const animateBall = () => {
        const dx = -2;
        const x = parseInt(this.ball.style.left);
        this.ball.style.left = `${x + dx}px`;
        this.ball_animation_frame_id = requestAnimationFrame(animateBall);
      };
      const recordPosition = () => {
        cancelAnimationFrame(this.ball_animation_frame_id);
        blindspot_config_data["ball_pos"].push(accurateRound(getElementCenter(this.ball).x, 2));
        this.reps_remaining--;
        document.querySelector("#click").textContent = Math.max(
          this.reps_remaining,
          0
        ).toString();
        if (this.reps_remaining <= 0) {
          finishBlindSpotPhase();
        } else {
          resetAndWaitForBallStart();
        }
      };
      function convertPixelsToMM(item_width_px) {
        const px2mm = item_width_px / trial_data["item_width_mm"];
        return px2mm;
      }
      function accurateRound(value, decimals) {
        return Number(Math.round(Number(value + "e" + decimals)) + "e-" + decimals);
      }
      function getElementCenter(el) {
        const box = el.getBoundingClientRect();
        return {
          x: box.left + box.width / 2,
          y: box.top + box.height / 2
        };
      }
      const deg_to_radians = (degrees) => {
        return degrees * Math.PI / 180;
      };
    }
  };
  _VirtualChinrestPlugin.info = info3;
  var VirtualChinrestPlugin = _VirtualChinrestPlugin;

  // src/trials.ts
  function createContext(jsPsych, options = {}) {
    const text = __spreadValues(__spreadValues({}, defaultText), options.text);
    const test = resolveOptions(options, "test");
    const practice = resolveOptions(options, "practice");
    validateOptions(test);
    validateOptions(practice);
    const letters = test.stimulus_set.target !== "arrows";
    for (const o of [test, practice]) {
      const t = o.stimulus_set.target;
      if (t !== "arrows" && t !== void 0) {
        if (t.letters.length !== 2 || t.letters.some((g) => g.length !== o.targets_per_response)) {
          throw new Error(
            "flanker: stimulus_set.target.letters needs two groups, each with targets_per_response letters."
          );
        }
      } else if (o.targets_per_response !== 1) {
        throw new Error("flanker: targets_per_response 2 needs letters as target.");
      }
    }
    let response_of_group = [0, 1];
    if (letters && test.response_mapping_counterbalancing === "random_per_participant") {
      response_of_group = jsPsych.randomization.shuffle([0, 1]);
    }
    return {
      jsPsych,
      text,
      user: options,
      practice,
      test,
      state: { last: null, px_per_deg: null },
      base_mapping: { response_of_group }
    };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
  function isKeyboard(o) {
    return o.response_device === "keyboard";
  }
  function mappingFor(ctx, phase, block) {
    const o = ctx.test;
    if (o.stimulus_set.target === "arrows") return { response_of_group: [0, 1] };
    const [a, b] = ctx.base_mapping.response_of_group;
    if (o.response_mapping_counterbalancing === "within_participant" && phase === "test" && block % 2 === 0) {
      return { response_of_group: [b, a] };
    }
    return { response_of_group: [a, b] };
  }
  function groupText(o, g) {
    const t = o.stimulus_set.target;
    if (t === "arrows" || t === void 0) return g === 0 ? "left" : "right";
    return t.letters[g].join(" / ");
  }
  function groupHtml(o, g, size = 28) {
    const t = o.stimulus_set.target;
    if (t === "arrows" || t === void 0) return renderGlyph(g === 0 ? "left" : "right", size);
    return `<strong>${t.letters[g].join(" / ")}</strong>`;
  }
  function responseLabels(ctx, o, mapping) {
    const labels = ["", ""];
    [0, 1].forEach((g) => {
      const r = mapping.response_of_group[g];
      if (isKeyboard(o)) {
        labels[r] = o.response_keys[r];
      } else if (o.stimulus_set.target === "arrows" || o.stimulus_set.target === void 0) {
        labels[r] = r === 0 ? ctx.text.left_button : ctx.text.right_button;
      } else {
        labels[r] = groupText(o, g);
      }
    });
    return labels;
  }
  function responseLabelHtml(o, labels, r) {
    return isKeyboard(o) ? `<kbd>${o.response_keys[r] === " " ? "space" : o.response_keys[r]}</kbd>` : labels[r];
  }
  function pxPerDeg(ctx) {
    var _a;
    return (_a = ctx.state.px_per_deg) != null ? _a : DEFAULT_PX_PER_DEG;
  }
  function viewportHeight() {
    return typeof window !== "undefined" ? window.innerHeight : 768;
  }
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
  function createFixation(ctx, o, phase, block, ms) {
    const { fg, bg } = parseColors(o.stimulus_color);
    return createDisplayTrial({
      ctx,
      o,
      phase,
      part: "fixation",
      block,
      duration: ms,
      stimulus: renderStage(
        `<span class="jspsych-timelines-flanker-fixation">${ctx.text.fixation}</span>`,
        fg,
        bg
      ),
      data: { fixation_duration: ms }
    });
  }
  function createCue(ctx, o, phase, block) {
    const { fg, bg } = parseColors(o.stimulus_color);
    const interval = o.cue_target_interval_ms;
    const cueMs = Math.min(CUE_DURATION_MS, interval);
    const fix = `<span class="jspsych-timelines-flanker-fixation">${ctx.text.fixation}</span>`;
    const nodes = [
      createDisplayTrial({
        ctx,
        o,
        phase,
        part: "cue",
        block,
        duration: cueMs,
        stimulus: renderStage(
          `<div class="jspsych-timelines-flanker-cue"><span class="dot"></span>${fix}<span class="dot"></span></div>`,
          fg,
          bg
        ),
        data: { cue_target_interval: interval }
      })
    ];
    if (interval > cueMs) {
      nodes.push(
        createDisplayTrial({
          ctx,
          o,
          phase,
          part: "cue",
          block,
          duration: interval - cueMs,
          stimulus: renderStage(fix, fg, bg),
          data: { cue_gap: true, cue_target_interval: interval }
        })
      );
    }
    return nodes;
  }
  function createIti(ctx, o, phase, block) {
    const { fg, bg } = parseColors(o.stimulus_color);
    return createDisplayTrial({
      ctx,
      o,
      phase,
      part: "iti",
      block,
      duration: o.iti_ms,
      stimulus: renderStage("", fg, bg)
    });
  }
  function arrayHtml(ctx, o, spec, hide) {
    var _a, _b;
    const { fg, bg } = parseColors(o.stimulus_color);
    const ppd = pxPerDeg(ctx);
    const size = toPx(o.stimulus_size.value, o.stimulus_size.unit, ppd, viewportHeight());
    const gap = toPx(spec.gap, spec.gap_unit, ppd, viewportHeight());
    const pos = (_a = o.stimulus_layout.array_position) != null ? _a : "centre_at_fixation";
    const offset = pos === "above_fixation" ? -2 * size : pos === "below_fixation" ? 2 * size : 0;
    return renderArray({
      flankers: new Array(spec.per_side).fill(spec.flanker),
      target: spec.target,
      size_px: size,
      gap_px: gap,
      orientation: (_b = o.stimulus_layout.orientation) != null ? _b : "horizontal",
      offset_px: offset,
      fg,
      bg,
      hide
    });
  }
  function createPreview(ctx, o, spec, phase, block) {
    const soa = o.soa_ms;
    return createDisplayTrial({
      ctx,
      o,
      phase,
      part: "preview",
      block,
      duration: Math.abs(soa),
      stimulus: () => arrayHtml(ctx, o, spec, soa < 0 ? "target" : "flankers"),
      data: { flanker_target_soa: soa }
    });
  }
  function createResponseTrial(ctx, o, spec, phase, block, trialInBlock) {
    const mapping = mappingFor(ctx, phase, block);
    const labels = responseLabels(ctx, o, mapping);
    const keyboard = isKeyboard(o);
    const nogo = spec.congruency === "nogo";
    const correctIndex = mapping.response_of_group[spec.group];
    const correctResponse = nogo ? null : keyboard ? o.response_keys[correctIndex] : correctIndex;
    const flankerLabel = spec.flanker;
    const targetLabel = spec.target;
    const data = baseData({
      phase,
      part: "response",
      block,
      trial_in_block: trialInBlock,
      congruency: spec.congruency,
      flanker_condition: spec.flanker_condition,
      target: targetLabel,
      flankers: flankerLabel,
      flankers_per_side: spec.per_side,
      correct_response: correctResponse,
      flanker_distance: spec.gap,
      flanker_distance_unit: spec.gap_unit,
      flanker_target_soa: o.soa_ms,
      stimulus_duration: o.stimulus_duration_ms,
      response_window: o.response_window_ms,
      cued: spec.cued,
      cue_target_interval: spec.cued ? o.cue_target_interval_ms : 0,
      response_device: o.response_device
    });
    const onFinish = (d) => {
      const timeout = d.response === null || d.response === void 0;
      let correct;
      if (nogo) correct = timeout;
      else if (timeout) correct = false;
      else if (keyboard)
        correct = String(d.response).toLowerCase() === String(correctResponse).toLowerCase();
      else correct = d.response === correctResponse;
      delete d.stimulus;
      d.timeout = timeout;
      d.correct = correct;
      ctx.state.last = {
        correct,
        timeout,
        rt: timeout ? null : d.rt,
        correct_label: nogo ? "" : labels[correctIndex]
      };
    };
    const common = {
      css_classes: [TASK_CLASS],
      stimulus: () => arrayHtml(ctx, o, spec, null),
      stimulus_duration: o.stimulus_duration_ms,
      trial_duration: o.response_window_ms,
      data,
      on_finish: onFinish
    };
    if (keyboard) {
      return __spreadValues({ type: HtmlKeyboardResponsePlugin, choices: [...o.response_keys] }, common);
    }
    return __spreadValues({
      type: HtmlButtonResponsePlugin,
      choices: [...labels],
      button_html: (choice) => `<button class="jspsych-btn">${choice}</button>`,
      response_ends_trial: true
    }, common);
  }
  function feedbackText(ctx, o, out) {
    const t = ctx.text;
    const acc = out.timeout ? t.timeout_feedback : out.correct ? t.correct_feedback : t.incorrect_feedback;
    switch (o.trial_feedback) {
      case "accuracy":
        return acc;
      case "rt":
        return out.rt !== null ? t.feedback_rt({ rt: out.rt }) : t.timeout_feedback;
      case "accuracy_rt":
        return out.rt !== null ? `${acc} \u2014 ${t.feedback_rt({ rt: out.rt })}` : acc;
      case "correct_answer":
        return out.correct || out.correct_label === "" ? acc : `${acc}. ${t.feedback_correct_answer({ answer: out.correct_label })}`;
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
  function createFeedback(ctx, o, phase, block) {
    const { fg, bg } = parseColors(o.stimulus_color);
    const trial = createDisplayTrial({
      ctx,
      o,
      phase,
      part: "feedback",
      block,
      duration: o.feedback_duration_ms,
      stimulus: () => {
        const out = ctx.state.last;
        const cls = out.timeout ? "timeout" : out.correct ? "correct" : "incorrect";
        return renderStage(
          `<div class="jspsych-timelines-flanker-feedback ${cls}">${feedbackText(ctx, o, out)}</div>`,
          fg,
          bg
        );
      }
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
  function createTrialSequence(ctx, o, spec, phase, block, trialInBlock) {
    const tl = [];
    if (spec.fixation_ms > 0) tl.push(createFixation(ctx, o, phase, block, spec.fixation_ms));
    if (spec.cued) tl.push(...createCue(ctx, o, phase, block));
    if (o.soa_ms !== 0) tl.push(createPreview(ctx, o, spec, phase, block));
    tl.push(createResponseTrial(ctx, o, spec, phase, block, trialInBlock));
    if (o.trial_feedback !== "none") tl.push(createFeedback(ctx, o, phase, block));
    if (o.iti_ms > 0) tl.push(createIti(ctx, o, phase, block));
    return { timeline: tl };
  }
  function createBlock(ctx, phase, block, nTrials) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    const specs = buildTrialSpecs({ jsPsych: ctx.jsPsych, o }, nTrials);
    return {
      timeline: specs.map((s, i) => createTrialSequence(ctx, o, s, phase, block, i + 1))
    };
  }
  function splitTrials(total, parts) {
    const base = Math.floor(total / parts);
    const extra = total - base * parts;
    return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
  }
  function textPage(ctx, html, phase, part, label) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: `<div class="jspsych-timelines-flanker-text">${html}</div>`,
      choices: [label != null ? label : ctx.text.continue_button],
      data: baseData({ phase, part })
    };
  }
  function createTransition(ctx, html, phase, part = "transition") {
    return textPage(ctx, `<p>${html}</p>`, phase, part);
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const letters = o.stimulus_set.target !== "arrows";
    const mapping = mappingFor(ctx, "test", 1);
    const labels = responseLabels(ctx, o, mapping);
    const groupOfResponse = (r) => mapping.response_of_group[0] === r ? 0 : 1;
    const keyLabel = (r) => responseLabelHtml(o, labels, r);
    const pages = [];
    pages.push(letters ? t.instruction_intro_letters : t.instruction_intro_arrows);
    const emphasis = o.speed_accuracy_emphasis === "speed" ? t.emphasis_speed : o.speed_accuracy_emphasis === "accuracy" ? t.emphasis_accuracy : o.speed_accuracy_emphasis === "both" ? t.emphasis_both : "";
    const hand = o.response_hand === "one_hand_dominant" ? t.hand_one_hand_dominant : t.hand_two_hands_index_fingers;
    pages.push(
      t.instruction_response({
        device: o.response_device,
        left_response: keyLabel(0),
        right_response: keyLabel(1),
        left_target: groupHtml(o, groupOfResponse(0)),
        right_target: groupHtml(o, groupOfResponse(1))
      }) + (isKeyboard(o) ? `<p>${hand}</p>` : "") + (emphasis ? `<p>${emphasis}</p>` : "")
    );
    const timeline = pages.map((p) => textPage(ctx, p, "instructions", "instruction"));
    return { timeline };
  }
  var TEACHING_ORDER = {
    congruent: 0,
    neutral: 1,
    incongruent: 2,
    nogo: 3
  };
  function demoSteps(ctx) {
    var _a;
    const phases = [...ctx.test.practice_trials === 0 ? [] : [ctx.practice], ctx.test];
    const found = [];
    for (const o of phases) {
      for (const c of o.condition_set) {
        const forms = c === "neutral" ? [].concat((_a = o.stimulus_set.neutral_flanker) != null ? _a : "dashes") : c === "neutral_dash" ? ["dashes"] : c === "neutral_empty" ? ["blank"] : ["dashes"];
        for (const form of forms) {
          const cond = c === "neutral" ? `neutral_${form}` : c;
          if (!found.some((f) => f.cond === cond)) found.push({ cond, form, o });
        }
      }
    }
    const rank = (c) => TEACHING_ORDER[c.startsWith("neutral") ? "neutral" : c];
    found.sort((a, b) => rank(a.cond) - rank(b.cond));
    return found.map((f, i) => ({
      o: f.o,
      spec: buildDemoSpec(f.o, f.cond, f.form, i % 2)
    }));
  }
  function stepArgs(ctx, step) {
    const { o, spec } = step;
    const mapping = mappingFor(ctx, "test", 1);
    const labels = responseLabels(ctx, o, mapping);
    const nogo = spec.congruency === "nogo";
    return {
      condition: spec.congruency,
      device: o.response_device,
      target: nogo ? "" : groupHtml(o, spec.group),
      response: nogo ? "" : responseLabelHtml(o, labels, mapping.response_of_group[spec.group])
    };
  }
  var demoText = (html) => `<div class="jspsych-timelines-flanker-text">${html}</div>`;
  function createExamples(ctx, steps) {
    const pages = steps.map((step) => ({
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => arrayHtml(ctx, step.o, step.spec, null) + demoText(ctx.text.instruction_step(stepArgs(ctx, step))),
      choices: [ctx.text.continue_button],
      data: baseData({
        phase: "instructions",
        part: "instruction_example",
        condition: step.spec.flanker_condition,
        congruency: step.spec.congruency,
        target: step.spec.target,
        flankers: step.spec.flanker
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
    const keyboard = isKeyboard(o);
    const t = ctx.text;
    const nodes = [textPage(ctx, t.instruction_demo_intro, "instructions", "instruction")];
    for (const step of steps) {
      const { o: so, spec } = step;
      const mapping = mappingFor(ctx, "test", 1);
      const labels = responseLabels(ctx, so, mapping);
      const nogo = spec.congruency === "nogo";
      const correctIndex = mapping.response_of_group[spec.group];
      const correctResponse = nogo ? null : keyboard ? so.response_keys[correctIndex] : correctIndex;
      const args = stepArgs(ctx, step);
      const state = { attempt: 0, correct: null };
      const shown = (html) => arrayHtml(ctx, so, spec, null) + demoText(html);
      const stepData = {
        phase: "instructions",
        condition: spec.flanker_condition,
        congruency: spec.congruency,
        target: spec.target,
        flankers: spec.flanker
      };
      const response = __spreadProps(__spreadValues({
        type: keyboard ? HtmlKeyboardResponsePlugin : HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => shown(t.instruction_step(args))
      }, keyboard ? { choices: [...so.response_keys] } : {
        choices: [...labels],
        button_html: (choice) => `<button class="jspsych-btn">${choice}</button>`
      }), {
        trial_duration: nogo ? INSTRUCTION_NOGO_WAIT_MS : null,
        data: baseData(__spreadProps(__spreadValues({}, stepData), { part: "instruction_check", correct_response: correctResponse })),
        // data-only simulation answers correctly (and withholds on no-go)
        simulation_options: { data: { response: correctResponse, rt: nogo ? null : 600 } },
        on_finish: (d) => {
          const timeout = typeof d.response !== "string" && typeof d.response !== "number";
          if (timeout) d.response = null;
          const correct = nogo ? timeout : timeout ? false : keyboard ? String(d.response).toLowerCase() === String(correctResponse).toLowerCase() : d.response === correctResponse;
          state.attempt++;
          state.correct = correct;
          delete d.stimulus;
          d.timeout = timeout;
          d.correct = correct;
          d.attempt = state.attempt;
        }
      });
      const confirm = createDisplayTrial({
        ctx,
        o: so,
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
  function createBlockFeedback(ctx, block) {
    const o = ctx.test;
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const rows = ctx.jsPsych.data.get().filter({ task: TASK_NAME, phase: "test", part: "response", block });
        const n = rows.count();
        const correct = rows.filter({ correct: true });
        const rts = correct.filterCustom((t) => t.congruency !== "nogo").select("rt");
        return `<div class="jspsych-timelines-flanker-text">${ctx.text.block_feedback({
        block,
        n_blocks: o.n_blocks,
        accuracy: n > 0 ? correct.count() / n : 0,
        mean_rt: rts.count() > 0 ? rts.mean() : null,
        kind: o.block_feedback
      })}</div>`;
      },
      choices: [ctx.text.continue_button],
      data: baseData({ phase: "test", part: "block_feedback", block })
    };
  }
  function createRestBreak(ctx, block) {
    return __spreadProps(__spreadValues({}, textPage(ctx, `<p>${ctx.text.block_complete(block)}</p>`, "test", "rest")), {
      data: baseData({ phase: "test", part: "rest", block })
    });
  }
  function createAttentionChecks(ctx) {
    const o = ctx.test;
    const probes = [];
    const mapping = mappingFor(ctx, "test", 1);
    const labels = responseLabels(ctx, o, mapping);
    for (let i = 0; i < ATTENTION_CHECK_PROBES; i++) {
      const r = i % 2;
      const key = o.response_keys[r];
      const common = {
        css_classes: [TASK_CLASS],
        stimulus: `<div class="jspsych-timelines-flanker-text">${ctx.text.attention_check_prompt({
        response_label: labels[r]
      })}</div>`,
        data: baseData({
          phase: "instructions",
          part: "attention_check",
          probe: i + 1,
          correct_response: isKeyboard(o) ? key : r
        }),
        on_finish: (d) => {
          d.correct = isKeyboard(o) ? String(d.response).toLowerCase() === key.toLowerCase() : d.response === r;
        }
      };
      probes.push(
        isKeyboard(o) ? __spreadValues({ type: HtmlKeyboardResponsePlugin, choices: [...o.response_keys] }, common) : __spreadValues({ type: HtmlButtonResponsePlugin, choices: [...labels] }, common)
      );
    }
    return { timeline: probes };
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
  function createCalibration(ctx) {
    const card = ctx.test.screen_calibration === "credit_card";
    return {
      type: VirtualChinrestPlugin,
      css_classes: [TASK_CLASS],
      blindspot_reps: card ? 0 : 5,
      resize_units: "none",
      data: baseData({
        phase: "instructions",
        part: "calibration",
        calibration: ctx.test.screen_calibration
      }),
      on_finish: (d) => {
        if (typeof d.px2deg === "number") ctx.state.px_per_deg = d.px2deg;
        else if (typeof d.px2mm === "number") ctx.state.px_per_deg = d.px2mm * 9.96;
      }
    };
  }
  function createCompletion(ctx, calculate) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const s = calculate(ctx.jsPsych.data.get());
        return `<div class="jspsych-timelines-flanker-text"><h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
        accuracy: s.accuracy,
        mean_rt: s.mean_rt,
        flanker_effect_rt: s.flanker_effect_rt
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
    if (o.screen_calibration === "credit_card" || o.screen_calibration === "virtual_chinrest") {
      timeline.push(createCalibration(ctx));
    }
    if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
    if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
      timeline.push(createInstructionWalkthrough(ctx));
    }
    if (o.attention_checks === "instructed_items") timeline.push(createAttentionChecks(ctx));
    if (o.practice_trials > 0) {
      if (o.instruction_format === "text") timeline.push(createPracticeIntro(ctx));
      timeline.push(createBlock(ctx, "practice", 1, o.practice_trials));
    }
    if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));
    splitTrials(o.n_test_trials, o.n_blocks).forEach((n, i) => {
      const block = i + 1;
      timeline.push(createBlock(ctx, "test", block, n));
      if (o.block_feedback !== "none") timeline.push(createBlockFeedback(ctx, block));
      if (o.rest_breaks === "self_paced" && block < o.n_blocks)
        timeline.push(createRestBreak(ctx, block));
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
    createCalibration,
    createAttentionChecks,
    createFixation,
    createCue,
    createPreview,
    createResponseTrial,
    createFeedback,
    createIti,
    createDisplayTrial,
    createTrialSequence,
    createBlock,
    createBlockFeedback,
    createRestBreak,
    createTransition,
    createCompletion: (ctx) => createCompletion(ctx, calculateScores)
  };
  var utils = {
    scoring: { calculateScores, getSummary },
    constants: {
      TASK_NAME,
      VERSION,
      TASK_CLASS,
      DEFAULT_OPTIONS,
      PHASE_OPTIONS,
      CUE_DURATION_MS,
      ATTENTION_CHECK_PROBES,
      DEFAULT_PX_PER_DEG
    },
    text: { defaultText },
    stimuli: { renderArray, renderGlyph },
    sequence: { buildTrialSpecs, allocateCounts, splitTrials },
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map