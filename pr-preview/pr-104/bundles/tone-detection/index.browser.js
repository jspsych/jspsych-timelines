var jsPsychTimelineToneDetection = (function (exports) {
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
  var TASK_NAME = "tone-detection";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-tone-detection";
  var LEVEL_UNITS = { snr: "dB SNR", full_scale: "dB FS" };
  var AUDIO = {
    /** Noise before the first interval of a trial (the masker is on while the intervals play), ms. */
    masker_lead_ms: 300,
    /** Fade of the masker at its start and end, ms. */
    masker_fade_ms: 20,
    /** The sound starts this long after the trial starts, so the audio clock has time to begin, ms. */
    start_delay_ms: 50,
    /** The masker is kept this many standard deviations inside full scale when levels are checked (noise peaks reach about 4.5). */
    noise_peak_sd: 4.5,
    /** The calibration noise is looped for this long before it repeats, s (white noise has no audible seam). */
    calibration_loop_s: 4
  };
  var DEFAULT_MASKER_LEVEL_DB = -20;
  var DEFAULT_SENSATION_LEVEL_DB = 40;
  var DEFAULT_QUIET_CALIBRATION_DB = -60;
  var WALKTHROUGH_SNR_DB = 6;
  var WALKTHROUGH_QUIET_RE_CALIBRATION_DB = 36;
  var HEADPHONE_SCREEN = {
    frequency_hz: 200,
    tone_ms: 1e3,
    ramp_ms: 20,
    gap_ms: 500,
    /** the target is this much quieter than the two other tones, dB */
    target_attenuation_db: 6,
    level_db: -24
  };
  var MAX_TRIALS_PER_TRACK = 200;
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_CORRECT_MS = 900;
  var SIMULATION = {
    /** level at which the unlapsed observer is at its 50% point between guessing and perfect, with a masker (dB SNR) */
    threshold_snr_db: -21,
    /** the same in quiet (dB FS) */
    threshold_quiet_db: -60,
    /** logistic scale, dB */
    slope_db: 1.5,
    lapse_rate: 0.02,
    /** response time after the last sound, ms: ex-Gaussian */
    rt: { mu: 500, sigma: 80, tau: 300 },
    /** headphone screen: probability of a correct answer (a listener wearing headphones, mostly) */
    headphone_accuracy: 0.9
  };

  // src/audio.ts
  var toneAmplitude = (db) => Math.pow(10, db / 20);
  var noiseRms = (db) => Math.pow(10, db / 20) / Math.SQRT2;
  var samples = (ms, sampleRate) => Math.round(ms / 1e3 * sampleRate);
  var ramp = (i, n) => n <= 1 ? 1 : Math.pow(Math.sin(Math.PI / 2 * (i / (n - 1))), 2);
  function renderTone(s) {
    const n = samples(s.duration_ms, s.sampleRate);
    const r = Math.min(samples(s.ramp_ms, s.sampleRate), Math.floor(n / 2));
    const amp = toneAmplitude(s.level_db);
    const out = new Float32Array(n);
    const w = 2 * Math.PI * s.frequency_hz / s.sampleRate;
    for (let i = 0; i < n; i++) {
      let g = 1;
      if (i < r) g = ramp(i, r);
      else if (i >= n - r) g = ramp(n - 1 - i, r);
      out[i] = amp * g * Math.sin(w * i);
    }
    return out;
  }
  function renderNoise(n, level_db, gauss, fade_samples = 0) {
    const raw = new Float64Array(n);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      raw[i] = gauss();
      sum += raw[i] * raw[i];
    }
    const rms2 = n > 0 ? Math.sqrt(sum / n) : 1;
    const scale = rms2 > 0 ? noiseRms(level_db) / rms2 : 0;
    const out = new Float32Array(n);
    const f = Math.min(fade_samples, Math.floor(n / 2));
    for (let i = 0; i < n; i++) {
      let g = 1;
      if (i < f) g = ramp(i, f);
      else if (i >= n - f) g = ramp(n - 1 - i, f);
      out[i] = raw[i] * scale * g;
    }
    return out;
  }
  var rms = (x, from = 0, to = x.length) => {
    let s = 0;
    for (let i = from; i < to; i++) s += x[i] * x[i];
    return to > from ? Math.sqrt(s / (to - from)) : 0;
  };
  var peakOf = (channels) => {
    let p = 0;
    for (const c of channels) for (let i = 0; i < c.length; i++) p = Math.max(p, Math.abs(c[i]));
    return p;
  };
  var levelDb = (x, from = 0, to = x.length) => 20 * Math.log10(Math.max(rms(x, from, to) * Math.SQRT2, 1e-12));
  function trialIntervals(n_intervals, tone_ms, isi_ms) {
    const out = [];
    let t = AUDIO.masker_lead_ms;
    for (let i = 0; i < n_intervals; i++) {
      out.push({ start_ms: t, end_ms: t + tone_ms });
      t += tone_ms + isi_ms;
    }
    return out;
  }
  function headphoneIntervals(n_intervals) {
    const out = [];
    let t = 0;
    for (let i = 0; i < n_intervals; i++) {
      out.push({ start_ms: t, end_ms: t + HEADPHONE_SCREEN.tone_ms });
      t += HEADPHONE_SCREEN.tone_ms + HEADPHONE_SCREEN.gap_ms;
    }
    return out;
  }
  function renderTrialSound(s, gauss) {
    const intervals = trialIntervals(s.n_intervals, s.tone_ms, s.isi_ms);
    const total_ms = intervals[intervals.length - 1].end_ms;
    const n = samples(total_ms, s.sampleRate);
    const out = s.masker_db === null ? new Float32Array(n) : renderNoise(n, s.masker_db, gauss, samples(AUDIO.masker_fade_ms, s.sampleRate));
    const tone = renderTone({
      sampleRate: s.sampleRate,
      frequency_hz: s.frequency_hz,
      duration_ms: s.tone_ms,
      ramp_ms: s.ramp_ms,
      level_db: s.tone_db
    });
    const at = samples(intervals[s.target_interval - 1].start_ms, s.sampleRate);
    for (let i = 0; i < tone.length && at + i < n; i++) out[at + i] += tone[i];
    const peak = peakOf([out]);
    const limited = peak > 1;
    if (limited) for (let i = 0; i < n; i++) out[i] /= peak;
    return { channels: [out], intervals, total_ms, peak, limited };
  }
  function renderHeadphoneSound(s) {
    const H = HEADPHONE_SCREEN;
    const intervals = headphoneIntervals(s.kinds.length);
    const total_ms = intervals[intervals.length - 1].end_ms;
    const n = samples(total_ms, s.sampleRate);
    const left = new Float32Array(n);
    const right = new Float32Array(n);
    s.kinds.forEach((kind, k) => {
      const tone = renderTone({
        sampleRate: s.sampleRate,
        frequency_hz: H.frequency_hz,
        duration_ms: H.tone_ms,
        ramp_ms: H.ramp_ms,
        level_db: H.level_db - (kind === "target" ? H.target_attenuation_db : 0)
      });
      const at = samples(intervals[k].start_ms, s.sampleRate);
      for (let i = 0; i < tone.length && at + i < n; i++) {
        left[at + i] = tone[i];
        right[at + i] = kind === "antiphase" ? -tone[i] : tone[i];
      }
    });
    return {
      channels: [left, right],
      intervals,
      total_ms,
      peak: peakOf([left, right]),
      limited: false
    };
  }
  function renderCalibrationSound(sampleRate, sound, level_db, frequency_hz, gauss) {
    const seconds = AUDIO.calibration_loop_s;
    if (sound === "noise") return renderNoise(Math.round(seconds * sampleRate), level_db, gauss);
    const cycles = Math.max(1, Math.round(frequency_hz * seconds));
    const n = Math.round(cycles / frequency_hz * sampleRate);
    const out = new Float32Array(n);
    const amp = toneAmplitude(level_db);
    const w = 2 * Math.PI * cycles / n;
    for (let i = 0; i < n; i++) out[i] = amp * Math.sin(w * i);
    return out;
  }
  function toWav(channels, sampleRate) {
    const n = channels[0].length;
    const nCh = channels.length;
    const bytes = new Uint8Array(44 + n * nCh * 2);
    const v = new DataView(bytes.buffer);
    const str = (o2, t) => [...t].forEach((c, i) => v.setUint8(o2 + i, c.charCodeAt(0)));
    str(0, "RIFF");
    v.setUint32(4, 36 + n * nCh * 2, true);
    str(8, "WAVE");
    str(12, "fmt ");
    v.setUint32(16, 16, true);
    v.setUint16(20, 1, true);
    v.setUint16(22, nCh, true);
    v.setUint32(24, sampleRate, true);
    v.setUint32(28, sampleRate * nCh * 2, true);
    v.setUint16(32, nCh * 2, true);
    v.setUint16(34, 16, true);
    str(36, "data");
    v.setUint32(40, n * nCh * 2, true);
    let o = 44;
    for (let i = 0; i < n; i++) {
      for (let c = 0; c < nCh; c++) {
        const x = Math.max(-1, Math.min(1, channels[c][i]));
        v.setInt16(o, Math.round(x * 32767), true);
        o += 2;
      }
    }
    return bytes;
  }
  var AUDIO_NONE = "none";
  var AUDIO_UNPLAYED = "unplayed";
  var silent = { state: AUDIO_NONE, scheduled_at: null, stop: () => {
  } };
  function audioContextOf(jsPsych) {
    var _a, _b;
    try {
      const ctx = (_b = (_a = jsPsych.pluginAPI).audioContext) == null ? void 0 : _b.call(_a);
      return ctx != null ? ctx : null;
    } catch (e) {
      return null;
    }
  }
  function audioSampleRate(jsPsych) {
    const ctx = audioContextOf(jsPsych);
    return ctx && typeof ctx.sampleRate === "number" ? ctx.sampleRate : null;
  }
  function play(jsPsych, channels, opts = {}) {
    try {
      const ctx = audioContextOf(jsPsych);
      if (!ctx) return silent;
      if (ctx.state === "suspended") void ctx.resume();
      const buffer = ctx.createBuffer(channels.length, channels[0].length, ctx.sampleRate);
      channels.forEach((c, i) => buffer.copyToChannel(c, i));
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = opts.loop === true;
      source.connect(ctx.destination);
      const at = ctx.currentTime + AUDIO.start_delay_ms / 1e3;
      source.start(at);
      return {
        state: ctx.state,
        scheduled_at: at,
        stop: () => {
          try {
            source.stop();
            source.disconnect();
          } catch (e) {
          }
        }
      };
    } catch (e) {
      return silent;
    }
  }

  // src/design.ts
  function sampleDuration(jsPsych, d) {
    if (typeof d === "number") return d;
    const step = d.step && d.step > 0 ? d.step : 1;
    const k = jsPsych.randomization.randomInt(0, Math.floor((d.max - d.min) / step + 1e-9));
    return d.min + k * step;
  }
  var conditionLabel = (frequency_hz) => `${frequency_hz}_hz`;
  function buildTrackSpecs(jsPsych, o) {
    const out = [];
    for (let round = 1; round <= o.trials_per_condition; round++) {
      let order = [...o.tone_frequency_hz];
      switch (o.block_order) {
        case "random_within_block":
          order = jsPsych.randomization.shuffle(order);
          break;
        case "ascending":
          order.sort((a, b) => a - b);
          break;
        case "descending":
          order.sort((a, b) => b - a);
          break;
      }
      for (const f of order) {
        out.push({
          block: out.length + 1,
          track_id: round,
          condition: conditionLabel(f),
          frequency_hz: f
        });
      }
    }
    return out;
  }
  function allocateLevels(jsPsych, levels, n) {
    const R = jsPsych.randomization;
    const each = Math.floor(n / levels.length);
    const rest = n - each * levels.length;
    const list2 = [
      ...each > 0 ? levels.flatMap((l) => Array.from({ length: each }, () => l)) : [],
      ...rest > 0 ? R.sampleWithoutReplacement(levels, rest) : []
    ];
    return R.shuffle(list2);
  }
  function plannedTrials(o, phase, practiceTrials) {
    var _a, _b;
    if (phase === "practice") return practiceTrials;
    if (o.adaptive === null) return o.trials_per_block;
    return (_b = (_a = o.adaptive.discontinue_rule) == null ? void 0 : _a.trials) != null ? _b : null;
  }

  // src/options.ts
  var PHASE_OPTIONS = [
    "trial_feedback",
    "feedback_condition",
    "feedback_duration_ms",
    "iti_ms",
    "inter_item_interval_ms",
    "stimulus_duration_ms",
    "tone_ramp_ms",
    "presentation_level_db",
    "adaptive",
    "difficulty_levels",
    "progress_indicator"
  ];
  var DEFAULT_ADAPTIVE = {
    procedure: "staircase_1up_3down",
    start_level: -13.75,
    step_sizes: [
      { up: 1.5, down: 1.5 },
      { up: 0.75, down: 0.75 }
    ],
    target_accuracy: 0.794,
    bounds: [-60, 10],
    discontinue_rule: { trials: 40 },
    tracks: "per_condition",
    reset: "block"
  };
  var DEFAULT_ADAPTIVE_QUIET = {
    start_level: -40,
    bounds: [-100, -6],
    step_sizes: [
      { up: 3, down: 3 },
      { up: 1.5, down: 1.5 }
    ]
  };
  var DEFAULT_PRACTICE_CRITERION = {
    accuracy: 0.8,
    window: null,
    on_fail: "repeat",
    max_repeats: 2
  };
  var DEFAULT_OPTIONS = {
    inter_item_interval_ms: 250,
    stimulus_duration_ms: 250,
    tone_ramp_ms: 10,
    iti_ms: 500,
    feedback_duration_ms: 1e3,
    presentation_level_db: DEFAULT_MASKER_LEVEL_DB,
    stimulus_set: { tone: "pure_tone", masker: "white_noise" },
    tone_frequency_hz: [1e3],
    block_order: "random_within_block",
    difficulty_levels: null,
    task_variant: "3I-3AFC_which_contains_tone",
    trials_per_condition: 3,
    trials_per_block: null,
    response_device: "keyboard",
    adaptive: DEFAULT_ADAPTIVE,
    device_eligibility: "none",
    headphone_check: "screening_task",
    headphone_screen: "antiphase_quietest_tone",
    headphone_check_trials: 6,
    participant_eligibility: "none",
    practice_criterion: null,
    practice_trials: 6,
    volume_calibration: "participant_adjusted",
    calibration_target: "just_detectable",
    feedback_condition: "all",
    performance_incentive: "none",
    progress_indicator: "counter",
    trial_feedback: "none",
    environment_instructions: "quiet_room",
    judgment_wording: "which_interval_contains_tone",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    practice: { trial_feedback: "accuracy", adaptive: null }
  };
  var NOT_IMPLEMENTED = [
    [
      "task_variant",
      [
        "3I-3AFC_oddity",
        "2I-2AFC_which_higher",
        "standard_then_comparison_louder_softer",
        "same_different",
        "AXB",
        "2I-2AFC_tone_sequences_oddity"
      ],
      "only the two detection variants are implemented; discrimination and oddity trials need a standard and a comparison tone and a log-frequency or log-intensity level"
    ],
    [
      "judgment_wording",
      ["which_higher_in_pitch", "comparison_louder_or_softer"],
      "it goes with the discrimination variants, which are not implemented"
    ],
    [
      "response_device",
      ["microphone", "eye_tracker", "gamepad"],
      "only keyboard, mouse and touch (buttons) are implemented"
    ],
    [
      "device_eligibility",
      ["computer_only", "browser_restricted", "hardware_required"],
      "no device or browser check is implemented"
    ],
    ["headphone_check", ["self_report"], 'use "screening_task" or "none"'],
    [
      "headphone_screen",
      ["huggins_pitch", "antiphase_plus_NoSpi_chirp"],
      'only "antiphase_quietest_tone" is implemented (the Huggins pitch and NoSpi chirp stimuli need an FFT-built binaural noise)'
    ],
    [
      "participant_eligibility",
      ["vision", "clinical", "fasting"],
      'only "hearing" (a self-report question) is implemented'
    ],
    [
      "volume_calibration",
      ["calibrated_spl", "intensity_workup"],
      "absolute levels cannot be set in a browser; use participant_adjusted"
    ],
    [
      "performance_incentive",
      ["bonus", "points_only", "fixed_payment"],
      "incentives are not implemented"
    ],
    ["progress_indicator", ["progress_bar"], 'use "counter" or "none"'],
    ["environment_instructions", ["no_aids"], 'only "quiet_room" is implemented'],
    [
      "instruction_format",
      ["audio", "video"],
      "no media is bundled; supply your own instruction trials"
    ],
    [
      "instruction_demonstration",
      ["animated", "guided_trial"],
      "use interactive (real sounds, repeat until correct), examples or none"
    ],
    [
      "trial_feedback",
      ["rt", "accuracy_rt", "points", "reward_outcome", "correct_answer"],
      'use "accuracy" or "none"; a tone detection trial has no response time to give back, and no points'
    ],
    [
      "block_order",
      ["random", "counterbalanced", "alternating"],
      'use "random_within_block", "fixed", "ascending" or "descending": a track is a block, and every condition is tested the same number of times'
    ]
  ];
  var isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
  var round3 = (x) => Math.round(x * 1e3) / 1e3;
  var NATURAL_TARGET = {
    staircase_1up_1down: 0.5,
    staircase_1up_2down: 0.707,
    staircase_1up_3down: 0.794
  };
  var PROCEDURES = Object.keys(NATURAL_TARGET);
  function resolveStep(raw, procedure, given) {
    const natural = NATURAL_TARGET[procedure];
    if (typeof raw === "number") {
      if (!(raw > 0)) throw new Error("tone-detection: adaptive.step_size must be > 0.");
      if (procedure === "staircase_1up_1down" && given !== void 0) {
        if (!(given > 0 && given < 1)) {
          throw new Error("tone-detection: adaptive.target_accuracy must be between 0 and 1.");
        }
        const down = given > 0.5 ? raw * ((1 - given) / given) : raw;
        const up = given > 0.5 ? raw : raw * (given / (1 - given));
        return { step: { up: round3(up), down: round3(down) }, target: given };
      }
      if (given !== void 0 && Math.abs(given - natural) > 0.02) {
        throw new Error(
          `tone-detection: adaptive.target_accuracy ${given} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
        );
      }
      return { step: { up: raw, down: raw }, target: given != null ? given : natural };
    }
    if (!isObj(raw) || !(raw.up > 0) || !(raw.down > 0)) {
      throw new Error("tone-detection: adaptive.step_size { up, down } must both be > 0.");
    }
    if (procedure === "staircase_1up_1down") {
      const implied = raw.up / (raw.up + raw.down);
      if (given !== void 0 && Math.abs(given - implied) > 0.02) {
        throw new Error(
          `tone-detection: adaptive.step_size { up: ${raw.up}, down: ${raw.down} } and target_accuracy ${given} contradict each other (the steps imply ${implied.toFixed(
          3
        )}; p x down must equal (1 - p) x up).`
        );
      }
      return { step: { up: raw.up, down: raw.down }, target: given != null ? given : round3(implied) };
    }
    if (raw.up !== raw.down) {
      throw new Error(
        `tone-detection: adaptive.procedure "${procedure}" needs equal up and down steps.`
      );
    }
    if (given !== void 0 && Math.abs(given - natural) > 0.02) {
      throw new Error(
        `tone-detection: adaptive.target_accuracy ${given} contradicts adaptive.procedure "${procedure}", which converges near ${natural}.`
      );
    }
    return { step: { up: raw.up, down: raw.down }, target: given != null ? given : natural };
  }
  function resolveAdaptive(user, masker) {
    var _a, _b, _c, _d, _e, _f, _g;
    const procedure = (_a = user.procedure) != null ? _a : DEFAULT_ADAPTIVE.procedure;
    if (!PROCEDURES.includes(procedure)) {
      throw new Error(
        `tone-detection: adaptive.procedure: "${procedure}" is not implemented (use staircase_1up_1down, staircase_1up_2down or staircase_1up_3down; the dossier's "3down1up" is staircase_1up_3down).`
      );
    }
    const proc = procedure;
    const defaultSteps = (masker ? DEFAULT_ADAPTIVE.step_sizes : DEFAULT_ADAPTIVE_QUIET.step_sizes).map((s) => s.up);
    const rawSteps = Array.isArray(user.step_size) ? user.step_size : user.step_size !== void 0 ? [user.step_size] : defaultSteps;
    if (rawSteps.length === 0)
      throw new Error("tone-detection: adaptive.step_size must not be an empty list.");
    const resolved = rawSteps.map(
      (s, i) => resolveStep(s, proc, i === rawSteps.length - 1 ? user.target_accuracy : void 0)
    );
    const bounds = (_b = user.bounds) != null ? _b : masker ? DEFAULT_ADAPTIVE.bounds : DEFAULT_ADAPTIVE_QUIET.bounds;
    if (!Array.isArray(bounds) || bounds.length !== 2) {
      throw new Error("tone-detection: adaptive.bounds must be [min, max] (null for no limit).");
    }
    const start = (_c = user.start_level) != null ? _c : masker ? DEFAULT_ADAPTIVE.start_level : DEFAULT_ADAPTIVE_QUIET.start_level;
    if (typeof start !== "number" || !Number.isFinite(start)) {
      throw new Error("tone-detection: adaptive.start_level must be a number (dB).");
    }
    if (bounds[0] !== null && bounds[1] !== null && !(bounds[0] < bounds[1])) {
      throw new Error("tone-detection: adaptive.bounds must have min < max.");
    }
    if (bounds[0] !== null && start < bounds[0] || bounds[1] !== null && start > bounds[1]) {
      throw new Error(
        `tone-detection: adaptive.start_level ${start} is outside adaptive.bounds [${bounds[0]}, ${bounds[1]}].`
      );
    }
    const tracks = (_d = user.tracks) != null ? _d : "per_condition";
    const reset = (_e = user.reset) != null ? _e : "block";
    if (tracks !== "per_condition") {
      throw new Error(
        'tone-detection: adaptive.tracks: "single" is not implemented: every track is its own staircase ("per_condition").'
      );
    }
    if (reset !== "block") {
      throw new Error(
        `tone-detection: adaptive.reset: "${reset}" is not implemented: every track starts at start_level ("block").`
      );
    }
    const rule = user.discontinue_rule === void 0 ? DEFAULT_ADAPTIVE.discontinue_rule : user.discontinue_rule;
    return {
      procedure: proc,
      start_level: start,
      step_sizes: resolved.map((r) => r.step),
      target_accuracy: round3(resolved[resolved.length - 1].target),
      bounds: [(_f = bounds[0]) != null ? _f : null, (_g = bounds[1]) != null ? _g : null],
      discontinue_rule: rule,
      tracks: "per_condition",
      reset: "block"
    };
  }
  function resolveOptions(user = {}, phase = "test") {
    var _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
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
    const variant = merged.task_variant;
    merged.n_intervals = variant === "2I-2AFC_which_contains_tone" ? 2 : 3;
    const set = (_b = top.stimulus_set) != null ? _b : {};
    merged.stimulus_set = {
      tone: (_c = set.tone) != null ? _c : DEFAULT_OPTIONS.stimulus_set.tone,
      masker: (_d = set.masker) != null ? _d : DEFAULT_OPTIONS.stimulus_set.masker
    };
    const masker = merged.stimulus_set.masker !== "none";
    merged.level_unit = masker ? "dB SNR" : "dB FS";
    const f = (_e = layer.tone_frequency_hz) != null ? _e : DEFAULT_OPTIONS.tone_frequency_hz;
    merged.tone_frequency_hz = Array.isArray(f) ? [...f] : [f];
    const layers = phase === "practice" ? [practice != null ? practice : {}, DEFAULT_OPTIONS.practice] : [top];
    let fixed = null;
    let levels = null;
    let adaptiveInput = {};
    for (const l of layers) {
      const hasA = l.adaptive !== void 0;
      const hasL = l.difficulty_levels !== void 0 && l.difficulty_levels !== null;
      if (!hasA && !hasL) continue;
      if (hasA && hasL && l.adaptive !== null) {
        throw new Error(
          "tone-detection: adaptive and difficulty_levels both set the level of the tone; give one (adaptive: null with difficulty_levels is fixed levels)."
        );
      }
      fixed = hasL || l.adaptive === null;
      if (hasL) levels = l.difficulty_levels;
      else if (isObj(l.adaptive)) adaptiveInput = l.adaptive;
      break;
    }
    if (fixed === null) fixed = false;
    if (fixed) {
      merged.adaptive = null;
      if (levels === null && phase === "practice") {
        const testFixed = top.adaptive === null || ((_f = top.difficulty_levels) != null ? _f : null) !== null;
        levels = testFixed ? (_g = top.difficulty_levels) != null ? _g : null : [resolveAdaptive(isObj(top.adaptive) ? top.adaptive : {}, masker).start_level];
      }
      merged.difficulty_levels = levels;
    } else {
      merged.adaptive = resolveAdaptive(adaptiveInput, masker);
      merged.difficulty_levels = null;
    }
    merged.presentation_level_db = (_h = layer.presentation_level_db) != null ? _h : DEFAULT_OPTIONS.presentation_level_db;
    merged.response_keys = (_i = top.response_keys) != null ? _i : Array.from({ length: merged.n_intervals }, (_, i) => String(i + 1));
    if (top.headphone_screen !== void 0 && top.headphone_check === void 0) {
      merged.headphone_check = "screening_task";
    }
    const calGiven = top.calibration_level_db;
    merged.calibration_level_db = merged.volume_calibration === "participant_adjusted" ? calGiven != null ? calGiven : masker ? merged.presentation_level_db - DEFAULT_SENSATION_LEVEL_DB : DEFAULT_QUIET_CALIBRATION_DB : null;
    const pc = layer.practice_criterion;
    merged.practice_criterion = pc === void 0 || pc === null ? null : {
      accuracy: (_j = pc.accuracy) != null ? _j : DEFAULT_PRACTICE_CRITERION.accuracy,
      window: pc.window === void 0 ? DEFAULT_PRACTICE_CRITERION.window : pc.window,
      on_fail: (_k = pc.on_fail) != null ? _k : DEFAULT_PRACTICE_CRITERION.on_fail,
      max_repeats: (_l = pc.max_repeats) != null ? _l : DEFAULT_PRACTICE_CRITERION.max_repeats
    };
    return merged;
  }
  var checkDuration = (name, d, allowZero) => {
    const lo = typeof d === "number" ? d : d == null ? void 0 : d.min;
    const hi = typeof d === "number" ? d : d == null ? void 0 : d.max;
    if (typeof lo !== "number" || typeof hi !== "number" || !Number.isFinite(lo) || !Number.isFinite(hi) || hi < lo || lo < 0 || !allowZero && lo === 0) {
      throw new Error(
        `tone-detection: ${name} must be a number of ms${allowZero ? " >= 0" : " > 0"}, or { min, max } with min <= max.`
      );
    }
  };
  var minOf = (d) => typeof d === "number" ? d : d.min;
  function validateOptions(o, user = {}, phase = "test") {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`tone-detection: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    if (o.stimulus_set.tone !== "pure_tone") {
      throw new Error(
        `tone-detection: stimulus_set.tone: "${o.stimulus_set.tone}" is not implemented (only pure_tone is synthesised).`
      );
    }
    if (o.stimulus_set.masker === "threshold_equalizing_noise_lowpass_6kHz") {
      throw new Error(
        'tone-detection: stimulus_set.masker: "threshold_equalizing_noise_lowpass_6kHz" is not implemented (only white_noise, or none for quiet).'
      );
    }
    if (o.stimulus_set.masker !== "white_noise" && o.stimulus_set.masker !== "none") {
      throw new Error(
        `tone-detection: stimulus_set.masker: unknown value "${o.stimulus_set.masker}".`
      );
    }
    const masker = o.stimulus_set.masker !== "none";
    if (o.stimulus_duration_ms === null) {
      throw new Error(
        "tone-detection: stimulus_duration_ms must be a duration: a tone has to end, so null is not possible."
      );
    }
    checkDuration("stimulus_duration_ms", o.stimulus_duration_ms, false);
    checkDuration("inter_item_interval_ms", o.inter_item_interval_ms, true);
    checkDuration("tone_ramp_ms", o.tone_ramp_ms, true);
    checkDuration("iti_ms", o.iti_ms, true);
    checkDuration("feedback_duration_ms", o.feedback_duration_ms, true);
    const maxRamp = typeof o.tone_ramp_ms === "number" ? o.tone_ramp_ms : o.tone_ramp_ms.max;
    if (2 * maxRamp > minOf(o.stimulus_duration_ms)) {
      throw new Error(
        "tone-detection: tone_ramp_ms: the two ramps must fit inside stimulus_duration_ms (2 x ramp <= duration)."
      );
    }
    if (!Array.isArray(o.tone_frequency_hz) || o.tone_frequency_hz.length === 0 || o.tone_frequency_hz.some((f) => typeof f !== "number" || !(f >= 20 && f <= 2e4))) {
      throw new Error(
        "tone-detection: tone_frequency_hz must be a frequency, or a list of frequencies, between 20 and 20000 Hz."
      );
    }
    if (new Set(o.tone_frequency_hz).size !== o.tone_frequency_hz.length) {
      throw new Error(
        "tone-detection: tone_frequency_hz names a frequency twice; each frequency is one condition."
      );
    }
    if (!Number.isInteger(o.trials_per_condition) || o.trials_per_condition < 1) {
      throw new Error("tone-detection: trials_per_condition must be a positive integer.");
    }
    if (!(typeof o.presentation_level_db === "number" && Number.isFinite(o.presentation_level_db) && o.presentation_level_db <= 0)) {
      throw new Error(
        "tone-detection: presentation_level_db must be a number <= 0 (dB re full scale)."
      );
    }
    if (!masker && user.presentation_level_db !== void 0 && phase === "test") {
      throw new Error(
        `tone-detection: presentation_level_db is the level of the masker, and stimulus_set.masker is "none" (detection in quiet): the tone's level is the tracked level (adaptive.start_level or difficulty_levels).`
      );
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== o.n_intervals) {
      throw new Error(
        `tone-detection: response_keys must list one key per interval (${o.n_intervals} for task_variant "${o.task_variant}").`
      );
    }
    if (new Set(o.response_keys).size !== o.response_keys.length) {
      throw new Error("tone-detection: response_keys must be distinct.");
    }
    if (o.adaptive === null) {
      const dl = o.difficulty_levels;
      if (!Array.isArray(dl) || dl.length === 0 || dl.some((v) => typeof v !== "number" || !Number.isFinite(v))) {
        throw new Error(
          "tone-detection: with adaptive: null the level needs difficulty_levels: a list of levels in dB (dB SNR with a masker, dB FS in quiet)."
        );
      }
      if (phase === "test") {
        if (!(typeof o.trials_per_block === "number" && Number.isInteger(o.trials_per_block) && o.trials_per_block >= 1)) {
          throw new Error(
            "tone-detection: fixed levels (adaptive: null) need trials_per_block: the number of trials in each track."
          );
        }
      }
    } else {
      if (o.adaptive.discontinue_rule === null && phase === "test") {
        throw new Error(
          "tone-detection: adaptive.discontinue_rule must be given: a track with no end rule would never finish (use { trials: 40 } or { reversals: 8 })."
        );
      }
      const rule = o.adaptive.discontinue_rule;
      if (rule) {
        const known = [
          "trials",
          "reversals",
          "consecutive_failures",
          "failures_at_level",
          "ceiling",
          "mistakes"
        ];
        const unknown = Object.keys(rule).filter((k) => !known.includes(k));
        if (unknown.length) {
          throw new Error(
            `tone-detection: adaptive.discontinue_rule: unknown rule ${unknown.join(
            ", "
          )} (known: ${known.join(", ")}).`
          );
        }
        for (const k of Object.keys(rule)) {
          const v = rule[k];
          if (!Number.isInteger(v) || v < 1) {
            throw new Error(
              `tone-detection: adaptive.discontinue_rule.${k} must be a positive integer.`
            );
          }
        }
        if (Object.keys(rule).length === 0 && phase === "test") {
          throw new Error(
            "tone-detection: adaptive.discontinue_rule is empty: a track needs an end rule."
          );
        }
      }
      const upper = o.adaptive.bounds[1];
      if (masker && upper !== null) {
        const sd = Math.pow(10, o.presentation_level_db / 20) / Math.SQRT2;
        const toneAmp = Math.pow(10, (o.presentation_level_db + upper) / 20);
        if (toneAmp + 4.5 * sd > 1) {
          throw new Error(
            `tone-detection: adaptive.bounds: the loudest tone (${upper} dB SNR) on a masker of ${o.presentation_level_db} dB FS would clip; lower the upper bound or presentation_level_db.`
          );
        }
      }
      if (!masker && (o.adaptive.bounds[1] === null || o.adaptive.bounds[1] > 0)) {
        throw new Error(
          "tone-detection: adaptive.bounds: in quiet the level is in dB FS and must have an upper bound <= 0."
        );
      }
    }
    if (o.difficulty_levels) {
      for (const v of o.difficulty_levels) {
        if (!masker && v > 0)
          throw new Error(
            "tone-detection: difficulty_levels: levels in quiet are in dB FS and must be <= 0."
          );
        if (masker) {
          const sd = Math.pow(10, o.presentation_level_db / 20) / Math.SQRT2;
          if (Math.pow(10, (o.presentation_level_db + v) / 20) + 4.5 * sd > 1) {
            throw new Error(
              `tone-detection: difficulty_levels: ${v} dB SNR on a masker of ${o.presentation_level_db} dB FS would clip.`
            );
          }
        }
      }
    }
    if (!Number.isInteger(o.practice_trials) || o.practice_trials < 0) {
      throw new Error("tone-detection: practice_trials must be an integer >= 0.");
    }
    if (!Number.isInteger(o.headphone_check_trials) || o.headphone_check_trials < 1) {
      throw new Error("tone-detection: headphone_check_trials must be a positive integer.");
    }
    if (o.volume_calibration !== "participant_adjusted") {
      if (user.calibration_level_db !== void 0) {
        throw new Error(
          `tone-detection: calibration_level_db is the level of the volume-setting sound, but volume_calibration is "${o.volume_calibration}" (no volume-setting screen).`
        );
      }
      if (user.calibration_target !== void 0) {
        throw new Error(
          `tone-detection: calibration_target needs volume_calibration "participant_adjusted", not "${o.volume_calibration}".`
        );
      }
    } else if (o.calibration_level_db !== null && !(Number.isFinite(o.calibration_level_db) && o.calibration_level_db <= 0)) {
      throw new Error(
        "tone-detection: calibration_level_db must be a number <= 0 (dB re full scale)."
      );
    }
    if (user.headphone_screen !== void 0 && user.headphone_check === "none") {
      throw new Error(
        'tone-detection: headphone_screen names a screen, but headphone_check is "none".'
      );
    }
    const pc = o.practice_criterion;
    if (pc) {
      if (!(pc.accuracy > 0 && pc.accuracy <= 1))
        throw new Error("tone-detection: practice_criterion.accuracy must be in (0, 1].");
      if (pc.window !== null && !(pc.window >= 1))
        throw new Error("tone-detection: practice_criterion.window must be >= 1 or null.");
      if (!["repeat", "continue", "end"].includes(pc.on_fail)) {
        throw new Error(
          'tone-detection: practice_criterion.on_fail must be "repeat", "continue" or "end".'
        );
      }
      if (!(pc.max_repeats >= 0) || !Number.isInteger(pc.max_repeats)) {
        throw new Error("tone-detection: practice_criterion.max_repeats must be an integer >= 0.");
      }
      if (phase === "test" && o.practice_trials === 0) {
        throw new Error("tone-detection: practice_criterion needs practice_trials > 0.");
      }
    }
  }

  // src/scoring.ts
  var DEFAULT_LAST_N_REVERSALS = 6;
  var isNum = (x) => typeof x === "number" && Number.isFinite(x);
  var meanOfList = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  function modeOf(levels) {
    const col = levels.select("level");
    if (!col.count()) return null;
    const freq = col.frequencies();
    const entries = Object.entries(freq);
    const max = Math.max(...entries.map(([, n]) => n));
    return meanOfList(entries.filter(([, n]) => n === max).map(([k]) => Number(k)));
  }
  function scoreTrack(rows, lastN) {
    var _a, _b, _c, _d, _e;
    const reversals = rows.filter({ is_reversal: true });
    const nRev = reversals.count();
    const last = (_a = rows.last(1).values()[0]) != null ? _a : {};
    const n = rows.count();
    const nCorrect = rows.filter({ correct: true }).count();
    return {
      block: (_b = last.block) != null ? _b : null,
      track_id: (_c = last.track_id) != null ? _c : null,
      condition: (_d = last.condition) != null ? _d : null,
      frequency_hz: (_e = last.tone_frequency) != null ? _e : null,
      n_trials: n,
      n_correct: nCorrect,
      accuracy: n ? nCorrect / n : null,
      n_reversals: nRev,
      threshold: nRev ? reversals.last(lastN).select("level").mean() : null,
      threshold_mode: modeOf(rows),
      threshold_final: isNum(last.next_level) ? last.next_level : null
    };
  }
  function calculateScores(data, options = {}) {
    var _a, _b, _c, _d;
    const lastN = (_a = options.last_n_reversals) != null ? _a : DEFAULT_LAST_N_REVERSALS;
    const rows = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
    const blocks = [...new Set(rows.select("block").values)];
    const tracks = blocks.map((b) => scoreTrack(rows.filter({ block: b }), lastN));
    const names = [...new Set(tracks.map((t) => t.condition).filter((c) => c !== null))];
    const conditions = names.map((condition) => {
      var _a2, _b2;
      const own = tracks.filter((t) => t.condition === condition);
      const condRows = rows.filter({ condition });
      const n2 = condRows.count();
      const nCorrect = condRows.filter({ correct: true }).count();
      const pick = (f) => meanOfList(own.map(f).filter((x) => x !== null));
      return {
        condition,
        frequency_hz: (_b2 = (_a2 = own[0]) == null ? void 0 : _a2.frequency_hz) != null ? _b2 : null,
        n_tracks: own.length,
        n_trials: n2,
        accuracy: n2 ? nCorrect / n2 : null,
        threshold: pick((t) => t.threshold),
        threshold_mode: pick((t) => t.threshold_mode),
        threshold_final: pick((t) => t.threshold_final)
      };
    });
    const n = rows.count();
    const correct = rows.filter({ correct: true });
    const rt = correct.filterCustom((t) => isNum(t.rt)).select("rt");
    const single = conditions.length === 1 ? conditions[0] : null;
    const unit = rows.select("level_unit").values[0];
    return {
      n_trials: n,
      n_tracks: tracks.length,
      accuracy: n ? correct.count() / n : null,
      mean_rt: rt.count() ? rt.mean() : null,
      threshold: (_b = single == null ? void 0 : single.threshold) != null ? _b : null,
      threshold_mode: (_c = single == null ? void 0 : single.threshold_mode) != null ? _c : null,
      threshold_final: (_d = single == null ? void 0 : single.threshold_final) != null ? _d : null,
      last_n_reversals: lastN,
      level_unit: typeof unit === "string" ? unit : null,
      conditions,
      tracks
    };
  }
  function getSummary(data, options = {}) {
    return __spreadProps(__spreadValues({}, calculateScores(data, options)), { task: TASK_NAME, version: VERSION });
  }

  // src/simulation.ts
  function hasForcedRt(jsPsych) {
    var _a, _b;
    const o = jsPsych.simulationOptions;
    return ((_b = (_a = o == null ? void 0 : o.default) == null ? void 0 : _a.data) == null ? void 0 : _b.rt) !== void 0;
  }
  var draw = (jsPsych) => jsPsych.randomization.randomInt(0, 1e6) / 1e6;
  function probabilityCorrect(level, n_intervals, masker) {
    const threshold = masker ? SIMULATION.threshold_snr_db : SIMULATION.threshold_quiet_db;
    const guess = 1 / n_intervals;
    const f = 1 / (1 + Math.exp(-(level - threshold) / SIMULATION.slope_db));
    return guess + (1 - guess - SIMULATION.lapse_rate) * f;
  }
  function simulateListener(jsPsych, trial) {
    const R = jsPsych.randomization;
    const correct = draw(jsPsych) < probabilityCorrect(trial.level, trial.n_intervals, trial.masker);
    let response = trial.target_interval;
    if (!correct) {
      const others = Array.from({ length: trial.n_intervals }, (_, i) => i + 1).filter(
        (i) => i !== trial.target_interval
      );
      response = others[R.randomInt(0, others.length - 1)];
    }
    const rt = Math.max(
      150,
      Math.round(
        R.sampleExGaussian(SIMULATION.rt.mu, SIMULATION.rt.sigma, 1 / SIMULATION.rt.tau, true)
      )
    );
    return { response_interval: response, rt };
  }
  var answerCorrectly = (target_interval) => ({
    response_interval: target_interval,
    rt: 600
  });
  function simulateHeadphoneAnswer(jsPsych, target_interval, n_intervals) {
    const R = jsPsych.randomization;
    const correct = draw(jsPsych) < SIMULATION.headphone_accuracy;
    const others = Array.from({ length: n_intervals }, (_, i) => i + 1).filter(
      (i) => i !== target_interval
    );
    return {
      response_interval: correct ? target_interval : others[R.randomInt(0, others.length - 1)],
      rt: Math.max(
        150,
        Math.round(
          R.sampleExGaussian(SIMULATION.rt.mu, SIMULATION.rt.sigma, 1 / SIMULATION.rt.tau, true)
        )
      )
    };
  }

  // src/stimuli.ts
  var CLS = {
    stage: `${TASK_CLASS}-stage`,
    screen: `${TASK_CLASS}-screen`,
    below: `${TASK_CLASS}-below`,
    markers: `${TASK_CLASS}-markers`,
    marker: `${TASK_CLASS}-marker`,
    lit: `${TASK_CLASS}-lit`,
    text: `${TASK_CLASS}-text`,
    feedback: `${TASK_CLASS}-feedback`,
    sound: `${TASK_CLASS}-sound`
  };
  function renderScreen(stage, below = "") {
    const region = below ? `<div class="${CLS.below}">${below}</div>` : "";
    return `<div class="${CLS.screen}">${stage}${region}</div>`;
  }
  function renderStage(labels, below = "", lit = null, extra = "") {
    const markers = labels.map(
      (label, i) => `<span class="${CLS.marker}${lit === i + 1 ? ` ${CLS.lit}` : ""}" data-interval="${i + 1}">${label}</span>`
    ).join("");
    const stage = `<div class="${CLS.stage}"><div class="${CLS.markers}">${markers}</div>${extra}</div>`;
    return renderScreen(stage, below);
  }
  var textBlock = (html) => `<div class="${CLS.text}">${html}</div>`;

  // src/text.ts
  var act = (device2) => device2 === "keyboard" ? "press" : device2 === "touch" ? "tap" : "click";
  var list = (items) => items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
  var heard = (r) => r.masker ? `You will hear noise in every interval, and a short beep of ${r.frequency_hz} Hz in one of them.` : `The intervals are silent, except one that has a short beep of ${r.frequency_hz} Hz.`;
  var defaultText = {
    instruction_intro: (r) => `<h2>Tone Detection</h2>
    <p>This task measures the quietest sound you can hear. You will listen through headphones.</p>
    <p>On each trial you hear ${r.n_intervals} intervals one after another, marked 1 to ${r.n_intervals} on the screen. ${r.masker ? "Each interval is filled with a noise like a hiss. One of them also contains a short beep." : "One of them contains a short beep; the others are silent."} Your job is to say which interval contained the beep.</p>`,
    instruction_environment: `<h2>Before You Start</h2>
    <p>Use <strong>headphones</strong> and sit in a <strong>quiet place</strong>. Turn off anything that could make a sound, such as notifications.</p>
    <p>Do not change the volume once you have set it in the next steps.</p>`,
    instruction_response: (r) => `<h2>How to Respond</h2>
    <p>After the last interval, ${act(
    r.device
  )} the number of the interval that contained the beep: ${list(
    r.responses.map((x) => `<strong>${x}</strong>`)
  )}.</p>
    <p>You can only answer after all ${r.n_intervals} intervals have played.</p>`,
    instruction_guess: `<h2>When You Are Not Sure</h2>
    <p>The beep gets quieter as you do well, so many trials will be hard. When you cannot hear it, <strong>guess</strong>: always give an answer.</p>`,
    instruction_demo_intro: `<h2>Let's Listen</h2>
    <p>First you will hear some examples where the beep is easy to hear. Answer each one as you would in the task.</p>
    <p>If you answer wrongly, you will get a hint and hear the example again.</p>`,
    instruction_examples_intro: `<h2>Examples</h2>
    <p>First you will hear an example where the beep is easy to hear. You can play it as often as you like.</p>`,
    instruction_listen: (r) => `<p>Listen: the beep is in <strong>interval ${r.target_interval}</strong>. ${heard(r)}</p>`,
    instruction_step: (r) => `<p>${heard(r)} ${act(r.device)[0].toUpperCase()}${act(r.device).slice(
    1
  )} the number of the interval with the beep.</p>`,
    instruction_hint: (r) => `<p>Not quite. The beep was in <strong>interval ${r.target_interval}</strong>: ${act(
    r.device
  )} ${r.response_for(r.target_interval)}.</p><p>Listen again.</p>`,
    instruction_reveal: (r) => `<p>For this one the beep was in interval ${r.target_interval}: ${act(
    r.device
  )} ${r.response_for(r.target_interval)}. Let's move on.</p>`,
    instruction_correct: "Correct!",
    instruction_practice_intro: `<h2>Practice</h2>
    <p>Now some practice. From here the trials run at the pace of the real task, and the beeps are quieter than in the examples.</p>
    <p>You will be told whether each answer is correct. The main task starts after the practice.</p>`,
    instruction_test_intro: (r) => `<h2>Main Task</h2>
    <p>Now the main task begins. You will do ${r.n_tracks} ${r.n_tracks === 1 ? "run" : "runs"}. The beep gets quieter as you answer correctly and louder when you make a mistake, and there is no feedback.</p>`,
    practice_repeat: `<h2>Practice Again</h2><p>Let's practice once more. Listen for the beep in each trial.</p>`,
    practice_ended: `<h2>Practice Not Passed</h2><p>The task ends here. Thank you.</p>`,
    hearing_question: `<h2>Your Hearing</h2><p>Do you have any known difficulty with your hearing?</p>`,
    hearing_no_difficulty: "No",
    hearing_some_difficulty: "Yes",
    calibration_page: (r) => `<h2>Set the Volume</h2>
    <p>${r.sound === "noise" ? "A soft noise is playing." : "A soft beep is playing."} ${r.target === "just_detectable" ? "Adjust the volume of your device until you can <strong>just</strong> hear it: as quiet as you can make it while still hearing it." : "Adjust the volume of your device until it is <strong>comfortable</strong>."}</p>
    <p>Then press Continue. Do not change the volume afterwards.</p>`,
    calibration_play: "Play sound",
    calibration_stop: "Stop sound",
    calibration_done: "Continue",
    headphone_intro: `<h2>Headphone Check</h2>`,
    headphone_instructions: (r) => `<p>This checks that you are wearing headphones. You will hear three tones, ${r.n_trials} times. Each time, say which tone was the <strong>quietest</strong>.</p>`,
    headphone_listen: "Listen to the three tones.",
    headphone_question: (r) => `Which tone was the quietest? ${act(r.device)[0].toUpperCase()}${act(r.device).slice(1)} ${list(
    r.responses
  )}.`,
    headphone_done: `<h2>Headphone Check Done</h2><p>Thank you. Keep your headphones on for the rest of the task.</p>`,
    listen: "Listen.",
    response_prompt: (r) => `Which interval contained the beep? ${act(r.device)[0].toUpperCase()}${act(r.device).slice(
    1
  )} ${list(r.responses)}.`,
    interval_label: (r) => String(r.interval),
    progress: (r) => r.of === null ? `Trial ${r.trial}` : `Progress: ${r.trial}/${r.of}`,
    continue_button: "Continue",
    replay_button: "Listen again",
    correct_feedback: "Correct",
    incorrect_feedback: "Wrong",
    track_complete: (r) => `Run ${r.track} of ${r.n_tracks} complete. Take a short break if needed.`,
    task_complete: "Task Complete",
    result_summary: (r) => {
      let html = "";
      if (r.threshold !== null)
        html += `<p><strong>Threshold:</strong> ${r.threshold.toFixed(1)} ${r.level_unit}</p>`;
      if (r.accuracy !== null)
        html += `<p><strong>Correct:</strong> ${(r.accuracy * 100).toFixed(0)}% of ${r.n_trials} trials</p>`;
      return html;
    }
  };

  // src/track.ts
  var N_DOWN = {
    staircase_1up_1down: 1,
    staircase_1up_2down: 2,
    staircase_1up_3down: 3
  };
  var Track = class {
    /**
     * @param ignoreStop a practice staircase runs for a fixed number of trials, so its stop rules are left out
     */
    constructor(jsPsych, cfg, label, ignoreStop = false) {
      this.cfg = cfg;
      this.errors = 0;
      this.capped = false;
      var _a;
      const _b = (_a = cfg.discontinue_rule) != null ? _a : {}, { mistakes: _m } = _b, core = __objRest(_b, ["mistakes"]);
      this.staircase = jsPsych.adaptive.createStaircase(__spreadValues({
        label,
        start_level: cfg.start_level,
        up: 1,
        down: N_DOWN[cfg.procedure],
        correct_moves: "down",
        step_sizes: cfg.step_sizes,
        bounds: cfg.bounds
      }, !ignoreStop && Object.keys(core).length ? { stop: core } : {}));
      this.ignoreStop = ignoreStop;
    }
    get level() {
      return this.staircase.level;
    }
    get trialCount() {
      return this.staircase.trial_count;
    }
    get done() {
      return this.stopReason !== null;
    }
    /** Why the track ended: a core rule, `mistakes`, `cap`, or null while it runs. */
    get stopReason() {
      var _a;
      if (this.staircase.done) return this.staircase.stop_reason;
      const m = (_a = this.cfg.discontinue_rule) == null ? void 0 : _a.mistakes;
      if (!this.ignoreStop && m !== void 0 && this.errors >= m) return "mistakes";
      if (this.capped) return "cap";
      return null;
    }
    /** The step that the next move will use (by reversals so far). */
    currentStep() {
      const steps = this.cfg.step_sizes;
      return steps[Math.min(this.staircase.reversals, steps.length - 1)];
    }
    update(correct) {
      if (this.done) throw new Error("tone-detection: update() on a track that is already done.");
      const level = this.staircase.level;
      const next = this.staircase.update(correct);
      const step = this.currentStep();
      if (!correct) this.errors++;
      if (!this.ignoreStop && this.staircase.trial_count >= MAX_TRIALS_PER_TRACK && !this.staircase.done) {
        this.capped = true;
      }
      const last = this.staircase.history[this.staircase.history.length - 1];
      return {
        level,
        correct,
        is_reversal: last.reversal,
        reversal_count: this.staircase.reversals,
        next_level: next,
        step_up: step.up,
        step_down: step.down
      };
    }
    /** The running estimate: the mean of the last `n` reversal levels (all if fewer), or null before the first reversal. */
    estimate(n) {
      return this.staircase.estimate(n === void 0 ? {} : { last_n_reversals: n });
    }
    /** The staircase after the last update, without its history (small enough for every trial row). */
    compact() {
      const _a = this.staircase.toJSON(), { history: _h, config: _c } = _a, rest = __objRest(_a, ["history", "config"]);
      return __spreadProps(__spreadValues({}, rest), { errors: this.errors, stop_reason: this.stopReason });
    }
    /** Full `toJSON()`, history included. */
    snapshot() {
      return __spreadProps(__spreadValues({}, JSON.parse(JSON.stringify(this.staircase.toJSON()))), {
        errors: this.errors,
        stop_reason: this.stopReason
      });
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
  styleInject(".jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-text h2 {\n  text-align: center;\n}\n.jspsych-timelines-tone-detection {\n  --td-stage-h: min(200px, 34vh);\n  --td-btn-reserve: 76px;\n}\n.jspsych-timelines-tone-detection:has(.jspsych-timelines-tone-detection-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-screen {\n  display: contents;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 480px;\n  max-width: calc(100vw - 16px);\n  height: var(--td-stage-h);\n  padding: 20px;\n  overflow: hidden;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-below {\n  position: absolute;\n  top: calc(50% + var(--td-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-below .jspsych-timelines-tone-detection-text {\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-tone-detection:has(#jspsych-html-button-response-btngroup) .jspsych-timelines-tone-detection-below {\n  bottom: var(--td-btn-reserve);\n}\n.jspsych-timelines-tone-detection:has(.jspsych-timelines-tone-detection-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-markers {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: 24px;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-marker {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 72px;\n  height: 72px;\n  border: 3px solid currentColor;\n  border-radius: 8px;\n  font-size: 2em;\n  opacity: 0.55;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-marker.jspsych-timelines-tone-detection-lit {\n  background: #2f6fed;\n  border-color: #2f6fed;\n  color: #ffffff;\n  opacity: 1;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-feedback {\n  font-size: 1em;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-feedback.incorrect {\n  font-weight: bold;\n}\n.jspsych-timelines-tone-detection .jspsych-timelines-tone-detection-sound {\n  display: block;\n  min-width: 140px;\n  margin: 0 auto;\n  padding: 8px 16px;\n  font: inherit;\n  cursor: pointer;\n}\n");

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
      throw new Error("tone-detection: needs jsPsych 8.4.0 or later (jsPsych.adaptive).");
    }
    const text = __spreadValues(__spreadValues({}, defaultText), options.text);
    const test = resolveOptions(options, "test");
    const practice = resolveOptions(options, "practice");
    validateOptions(test, options, "test");
    validateOptions(practice, options, "practice");
    return {
      jsPsych,
      text,
      user: options,
      practice,
      test,
      state: {
        last: null,
        plan: null,
        practice_failed: false,
        ended: false,
        headphone: { n_trials: 0, n_correct: 0 }
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
  function keyName(key) {
    var _a;
    return (_a = KEY_NAMES[key]) != null ? _a : key.length === 1 ? key.toUpperCase() : key;
  }
  function responseLabelHtml(ctx, o, i) {
    if (isKeyboard(o)) return `<kbd>${keyName(o.response_keys[i - 1])}</kbd>`;
    return ctx.text.interval_label({ interval: i });
  }
  var device = (o) => o.response_device;
  var labelsOf = (ctx, n) => Array.from({ length: n }, (_, i) => ctx.text.interval_label({ interval: i + 1 }));
  var progressHtml = (ctx, o, trial, of) => o.progress_indicator === "counter" ? `<p>${ctx.text.progress({ trial, of })}</p>` : "";
  function levelsFor(o, level) {
    return o.stimulus_set.masker === "none" ? { tone_db: level, masker_db: null } : { tone_db: o.presentation_level_db + level, masker_db: o.presentation_level_db };
  }
  function walkthroughLevel(o) {
    var _a;
    return o.stimulus_set.masker === "none" ? ((_a = o.calibration_level_db) != null ? _a : DEFAULT_QUIET_CALIBRATION_DB) + WALKTHROUGH_QUIET_RE_CALIBRATION_DB : WALKTHROUGH_SNR_DB;
  }
  function createDisplayTrial(a) {
    var _a, _b;
    return {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: a.stimulus,
      choices: "NO_KEYS",
      trial_duration: a.duration,
      data: baseData(__spreadValues({ phase: a.phase, part: a.part, block: (_a = a.block) != null ? _a : null }, (_b = a.data) != null ? _b : {})),
      on_finish: (d) => {
        var _a2;
        delete d.stimulus;
        (_a2 = a.onFinish) == null ? void 0 : _a2.call(a, d);
      }
    };
  }
  function buildPair(c) {
    const { ctx, o } = c;
    const keyboard = isKeyboard(o);
    const labels = labelsOf(ctx, o.n_intervals);
    let plan = null;
    const ensure = () => {
      if (plan === null || plan.used) {
        plan = c.begin();
        ctx.state.plan = plan;
      }
      return plan;
    };
    const stateOf = (p) => p.playback ? p.playback.state : audioContextOf(ctx.jsPsych) ? AUDIO_UNPLAYED : AUDIO_NONE;
    const presentation = {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => renderStage(labels, c.caption(ensure(), "listen")),
      choices: "NO_KEYS",
      trial_duration: () => ensure().total_ms + AUDIO.start_delay_ms,
      data: baseData(__spreadProps(__spreadValues({}, c.data), { phase: c.phase, part: "stimulus" })),
      on_load: () => {
        const p = ensure();
        const display = ctx.jsPsych.getDisplayElement();
        const rate = audioSampleRate(ctx.jsPsych);
        if (rate !== null) {
          const gauss = () => ctx.jsPsych.randomization.sampleNormal(0, 1);
          p.sound = c.makeSound(p, rate, gauss);
          p.playback = play(ctx.jsPsych, p.sound.channels);
        }
        c.intervals(p).forEach((iv, k) => {
          const marker = () => display.querySelector(`.${CLS.marker}[data-interval="${k + 1}"]`);
          ctx.jsPsych.pluginAPI.setTimeout(
            () => {
              var _a;
              return (_a = marker()) == null ? void 0 : _a.classList.add(CLS.lit);
            },
            AUDIO.start_delay_ms + iv.start_ms
          );
          ctx.jsPsych.pluginAPI.setTimeout(
            () => {
              var _a;
              return (_a = marker()) == null ? void 0 : _a.classList.remove(CLS.lit);
            },
            AUDIO.start_delay_ms + iv.end_ms
          );
        });
      },
      on_finish: (d) => {
        var _a;
        delete d.stimulus;
        const p = ensure();
        d.target_interval = p.target_interval;
        d.tone_frequency = p.frequency_hz;
        d.condition = p.condition;
        d.level = p.level;
        d.tone_level_db = p.tone_db;
        d.masker_level_db = p.masker_db;
        d.tone_duration = p.tone_ms;
        d.tone_ramp = p.ramp_ms;
        d.inter_item_interval = p.isi_ms;
        d.sound_duration = p.total_ms;
        d.audio_context_state = stateOf(p);
        d.peak_before_limiting = p.sound ? p.sound.peak : null;
        d.sound_limited = p.sound ? p.sound.limited : null;
        d.progress_text = p.progress;
        (_a = c.finishSound) == null ? void 0 : _a.call(c, d, p);
      }
    };
    const common = {
      css_classes: [TASK_CLASS],
      stimulus: () => renderStage(labels, c.caption(ensure(), "ask")),
      response_ends_trial: true,
      data: baseData(__spreadProps(__spreadValues({}, c.data), {
        phase: c.phase,
        part: c.responsePart,
        n_alternatives: o.n_intervals,
        response_device: o.response_device
      })),
      on_finish: (d) => {
        const p = ensure();
        delete d.stimulus;
        const responded = (typeof d.response === "string" || typeof d.response === "number") && typeof d.rt === "number";
        let given = null;
        if (responded) {
          given = keyboard ? o.response_keys.findIndex((k) => k.toLowerCase() === String(d.response).toLowerCase()) + 1 : d.response + 1;
          if (given < 1) given = null;
        }
        if (!responded || given === null) {
          d.response = null;
          d.rt = null;
        }
        const correct = given !== null && given === p.target_interval;
        d.response_interval = given;
        d.target_interval = p.target_interval;
        d.correct_response = keyboard ? o.response_keys[p.target_interval - 1] : p.target_interval - 1;
        d.correct = correct;
        d.condition = p.condition;
        d.tone_frequency = p.frequency_hz;
        d.standard_value = p.frequency_hz;
        d.trial_index_in_block = p.trial_in_block;
        d.audio_context_state = stateOf(p);
        c.finish(d, p, { correct, responded: given !== null });
        ctx.state.last = { correct, rt: d.rt };
        p.used = true;
      },
      simulation_options: () => {
        var _a;
        const p = ensure();
        if (((_a = ctx.jsPsych.simulationOptions) == null ? void 0 : _a[c.responsePart]) !== void 0)
          return c.responsePart;
        if (c.honourForcedRt && hasForcedRt(ctx.jsPsych)) return {};
        const r = c.simulate(p);
        return {
          data: {
            response: keyboard ? o.response_keys[r.response_interval - 1] : r.response_interval - 1,
            rt: r.rt
          }
        };
      }
    };
    const choices = keyboard ? o.response_keys.slice() : labels;
    const response = __spreadValues({
      type: keyboard ? HtmlKeyboardResponsePlugin : HtmlButtonResponsePlugin,
      choices
    }, common);
    if (!keyboard) {
      response.button_html = (choice) => `<button class="jspsych-btn">${choice}</button>`;
    }
    return { presentation, response, plan: () => plan };
  }
  function feedbackText(ctx, o, out) {
    return o.trial_feedback === "accuracy" ? out.correct ? ctx.text.correct_feedback : ctx.text.incorrect_feedback : "";
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
  function createFeedback(ctx, o, phase, block, getPlan) {
    const labels = labelsOf(ctx, o.n_intervals);
    const trial = createDisplayTrial({
      phase,
      part: "feedback",
      block: block != null ? block : void 0,
      duration: () => {
        var _a, _b;
        return (_b = (_a = getPlan()) == null ? void 0 : _a.feedback_ms) != null ? _b : 0;
      },
      stimulus: () => {
        const out = ctx.state.last;
        const cls = out.correct ? "correct" : "incorrect";
        return renderStage(
          labels,
          textBlock(`<div class="${CLS.feedback} ${cls}">${feedbackText(ctx, o, out)}</div>`)
        );
      },
      onFinish: (d) => {
        var _a, _b;
        d.feedback_duration = (_b = (_a = getPlan()) == null ? void 0 : _a.feedback_ms) != null ? _b : null;
        d.feedback_text = feedbackText(ctx, o, ctx.state.last);
      }
    });
    trial.data.feedback_kind = o.trial_feedback;
    trial.data.feedback_condition = o.feedback_condition;
    return { timeline: [trial], conditional_function: () => shouldShowFeedback(o, ctx.state.last) };
  }
  function createIti(ctx, o, phase, block, getPlan) {
    const labels = labelsOf(ctx, o.n_intervals);
    return {
      timeline: [
        createDisplayTrial({
          phase,
          part: "iti",
          block: block != null ? block : void 0,
          duration: () => {
            var _a, _b;
            return (_b = (_a = getPlan()) == null ? void 0 : _a.iti_ms) != null ? _b : 0;
          },
          stimulus: () => renderStage(labels),
          onFinish: (d) => {
            var _a, _b;
            d.iti = (_b = (_a = getPlan()) == null ? void 0 : _a.iti_ms) != null ? _b : null;
          }
        })
      ],
      conditional_function: () => {
        var _a, _b;
        return ((_b = (_a = getPlan()) == null ? void 0 : _a.iti_ms) != null ? _b : 0) > 0;
      }
    };
  }
  function taskPlan(ctx, o, spec, level, trialInBlock) {
    const R = ctx.jsPsych.randomization;
    const { tone_db, masker_db } = levelsFor(o, level);
    const tone_ms = sampleDuration(ctx.jsPsych, o.stimulus_duration_ms);
    const isi_ms = sampleDuration(ctx.jsPsych, o.inter_item_interval_ms);
    const iv = trialIntervals(o.n_intervals, tone_ms, isi_ms);
    return {
      n_intervals: o.n_intervals,
      target_interval: R.randomInt(1, o.n_intervals),
      frequency_hz: spec.frequency_hz,
      condition: spec.condition,
      level,
      tone_db,
      masker_db,
      tone_ms,
      ramp_ms: sampleDuration(ctx.jsPsych, o.tone_ramp_ms),
      isi_ms,
      iti_ms: sampleDuration(ctx.jsPsych, o.iti_ms),
      feedback_ms: sampleDuration(ctx.jsPsych, o.feedback_duration_ms),
      total_ms: iv[iv.length - 1].end_ms,
      trial_in_block: trialInBlock,
      sound: null,
      playback: null,
      progress: null,
      used: false
    };
  }
  var soundOf = (p, sampleRate, gauss) => renderTrialSound(
    {
      sampleRate,
      n_intervals: p.n_intervals,
      target_interval: p.target_interval,
      frequency_hz: p.frequency_hz,
      tone_ms: p.tone_ms,
      ramp_ms: p.ramp_ms,
      isi_ms: p.isi_ms,
      tone_db: p.tone_db,
      masker_db: p.masker_db
    },
    gauss
  );
  var intervalsOf = (p) => trialIntervals(p.n_intervals, p.tone_ms, p.isi_ms);
  function createBlock(ctx, phase, spec, extra = {}) {
    var _a;
    const o = phase === "practice" ? ctx.practice : ctx.test;
    const jsPsych = ctx.jsPsych;
    const n = phase === "practice" ? ctx.test.practice_trials : o.adaptive === null ? o.trials_per_block : null;
    const of = plannedTrials(o, phase, ctx.test.practice_trials);
    const st = { count: 0, track: null, fixed: [] };
    const pair = buildPair({
      ctx,
      o,
      phase,
      responsePart: "response",
      begin: () => {
        const level = st.track ? st.track.level : st.fixed[st.count];
        return taskPlan(ctx, o, spec, level, st.count + 1);
      },
      makeSound: soundOf,
      intervals: intervalsOf,
      caption: (p, stage) => {
        p.progress = o.progress_indicator === "counter" ? ctx.text.progress({ trial: p.trial_in_block, of }) : null;
        return textBlock(
          `<p>${stage === "listen" ? ctx.text.listen : ctx.text.response_prompt({
          device: device(o),
          n_intervals: o.n_intervals,
          responses: o.response_keys.map((_, i) => responseLabelHtml(ctx, o, i + 1))
        })}</p>${progressHtml(ctx, o, p.trial_in_block, of)}`
        );
      },
      data: __spreadValues({
        block: spec.block,
        track_id: spec.track_id
      }, phase === "practice" ? { practice_attempt: (_a = extra.attempt) != null ? _a : 1 } : {}),
      simulate: (p) => simulateListener(jsPsych, {
        level: p.level,
        n_intervals: p.n_intervals,
        target_interval: p.target_interval,
        masker: o.stimulus_set.masker !== "none"
      }),
      honourForcedRt: true,
      finish: (d, p) => {
        var _a2;
        d.level_unit = o.level_unit;
        d.trial_in_track = p.trial_in_block;
        d.block = spec.block;
        d.track_id = spec.track_id;
        d.masker_level_db = p.masker_db;
        d.tone_level_db = p.tone_db;
        d.calibration_level_db = o.calibration_level_db;
        d.level_re_calibration_db = o.calibration_level_db === null ? null : ((_a2 = p.masker_db) != null ? _a2 : p.tone_db) - o.calibration_level_db;
        d.inter_item_interval = p.isi_ms;
        d.tone_duration = p.tone_ms;
        d.tone_ramp = p.ramp_ms;
        d.iti = p.iti_ms;
        d.level = p.level;
        if (st.track) {
          const u = st.track.update(d.correct);
          d.step_size = u.step_down;
          d.step_size_up = u.step_up;
          d.is_reversal = u.is_reversal;
          d.reversal_count = u.reversal_count;
          d.next_level = u.next_level;
          d.track_threshold = st.track.estimate();
          d.track_state = st.track.compact();
          d.track_done = st.track.done;
          if (st.track.done) d.track_final = st.track.snapshot();
        } else {
          d.step_size = null;
          d.is_reversal = null;
          d.reversal_count = null;
          d.next_level = null;
          d.track_threshold = null;
        }
        st.count++;
      }
    });
    const blockDone = () => n !== null && st.count >= n || n === null && st.track !== null && st.track.done;
    return {
      timeline: [
        pair.presentation,
        pair.response,
        createFeedback(ctx, o, phase, spec.block, pair.plan),
        createIti(ctx, o, phase, spec.block, pair.plan)
      ],
      on_timeline_start: () => {
        st.count = 0;
        if (o.adaptive) {
          st.track = new Track(
            jsPsych,
            o.adaptive,
            `${phase}-${spec.block}-${spec.condition}`,
            phase === "practice"
          );
          st.fixed = [];
        } else {
          st.track = null;
          st.fixed = allocateLevels(jsPsych, o.difficulty_levels, n);
        }
      },
      loop_function: () => !blockDone()
    };
  }
  function textPage(ctx, html, phase, part, label) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: textBlock(html),
      choices: [label != null ? label : ctx.text.continue_button],
      data: baseData({ phase, part }),
      // a click is the moment the browser lets audio start: ask for the context now (jsPsych resumes it), so the first sound is not left waiting
      on_finish: () => {
        audioContextOf(ctx.jsPsych);
      }
    };
  }
  function createTransition(ctx, html, phase, part = "transition") {
    return textPage(ctx, `<p>${html}</p>`, phase, part);
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const masker = o.stimulus_set.masker !== "none";
    const pages = [t.instruction_intro({ n_intervals: o.n_intervals, masker })];
    if (o.environment_instructions === "quiet_room") pages.push(t.instruction_environment);
    pages.push(
      t.instruction_response({
        device: device(o),
        n_intervals: o.n_intervals,
        responses: o.response_keys.map((_, i) => responseLabelHtml(ctx, o, i + 1))
      })
    );
    pages.push(t.instruction_guess);
    return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
  }
  function createHearingCheck(ctx) {
    const t = ctx.text;
    return {
      timeline: [
        {
          type: HtmlButtonResponsePlugin,
          css_classes: [TASK_CLASS],
          stimulus: textBlock(t.hearing_question),
          choices: [t.hearing_no_difficulty, t.hearing_some_difficulty],
          data: baseData({ phase: "instructions", part: "hearing_check" }),
          // the answer is recorded and nobody is excluded
          on_finish: (d) => {
            delete d.stimulus;
            d.hearing_difficulty = d.response === 1;
          }
        }
      ],
      conditional_function: () => ctx.test.participant_eligibility === "hearing"
    };
  }
  function createVolumeCalibration(ctx) {
    const o = ctx.test;
    const t = ctx.text;
    const masker = o.stimulus_set.masker !== "none";
    const sound = masker ? "noise" : "tone";
    const level = o.calibration_level_db;
    let playback = null;
    let plays = 0;
    let startState = "none";
    const start = (c) => {
      const rate = audioSampleRate(ctx.jsPsych);
      if (rate === null) return;
      const gauss = () => ctx.jsPsych.randomization.sampleNormal(0, 1);
      const samples2 = renderCalibrationSound(rate, sound, level, o.tone_frequency_hz[0], gauss);
      playback = play(ctx.jsPsych, [samples2], { loop: true });
      plays++;
      startState = playback.state;
      if (c) c.textContent = t.calibration_stop;
    };
    const stop = (c) => {
      playback == null ? void 0 : playback.stop();
      playback = null;
      if (c) c.textContent = t.calibration_play;
    };
    return {
      timeline: [
        {
          type: HtmlButtonResponsePlugin,
          css_classes: [TASK_CLASS],
          stimulus: textBlock(
            `${t.calibration_page({
            target: o.calibration_target,
            sound
          })}<p><button type="button" class="${CLS.sound}">${t.calibration_play}</button></p>`
          ),
          choices: [t.calibration_done],
          data: baseData({
            phase: "instructions",
            part: "volume_calibration",
            calibration_level_db: level,
            calibration_target: o.calibration_target,
            calibration_sound: sound,
            device_volume_setting: o.volume_calibration,
            presentation_level_db: o.presentation_level_db
          }),
          on_load: () => {
            plays = 0;
            startState = "none";
            const btn = ctx.jsPsych.getDisplayElement().querySelector(`.${CLS.sound}`);
            start(btn);
            btn == null ? void 0 : btn.addEventListener("click", () => playback ? stop(btn) : start(btn));
          },
          on_finish: (d) => {
            delete d.stimulus;
            playback == null ? void 0 : playback.stop();
            playback = null;
            d.calibration_plays = plays;
            d.audio_context_state = startState;
          }
        }
      ],
      conditional_function: () => ctx.test.volume_calibration === "participant_adjusted"
    };
  }
  function createHeadphoneCheck(ctx) {
    const o = ctx.test;
    const t = ctx.text;
    const nTrials = o.headphone_check_trials;
    const nIntervals = 3;
    const labels = labelsOf(ctx, nIntervals);
    const jsPsych = ctx.jsPsych;
    const R = jsPsych.randomization;
    const keys = isKeyboard(o) ? Array.from({ length: nIntervals }, (_, i) => String(i + 1)) : [];
    const ho = __spreadProps(__spreadValues({}, o), {
      n_intervals: nIntervals,
      response_keys: keys.length ? keys : o.response_keys
    });
    const hResponses = keys.length ? keys.map((k) => `<kbd>${keyName(k)}</kbd>`) : labels;
    const pair = buildPair({
      ctx,
      o: ho,
      phase: "instructions",
      responsePart: "headphone_check",
      begin: () => {
        const target = R.randomInt(1, nIntervals);
        const others = [1, 2, 3].filter((i) => i !== target);
        const anti = others[R.randomInt(0, 1)];
        const kinds = [1, 2, 3].map(
          (i) => i === target ? "target" : i === anti ? "antiphase" : "foil"
        );
        const iv = headphoneIntervals(nIntervals);
        return {
          n_intervals: nIntervals,
          target_interval: target,
          frequency_hz: HEADPHONE_SCREEN.frequency_hz,
          condition: "headphone_check",
          level: null,
          tone_db: HEADPHONE_SCREEN.level_db,
          masker_db: null,
          tone_ms: HEADPHONE_SCREEN.tone_ms,
          ramp_ms: HEADPHONE_SCREEN.ramp_ms,
          isi_ms: HEADPHONE_SCREEN.gap_ms,
          iti_ms: 0,
          feedback_ms: 0,
          total_ms: iv[iv.length - 1].end_ms,
          trial_in_block: ctx.state.headphone.n_trials + 1,
          kinds,
          sound: null,
          playback: null,
          progress: null,
          used: false
        };
      },
      makeSound: (p, sampleRate) => renderHeadphoneSound({ sampleRate, kinds: p.kinds }),
      intervals: () => headphoneIntervals(nIntervals),
      caption: (_p, stage) => textBlock(
        `<p>${stage === "listen" ? t.headphone_listen : t.headphone_question({ device: device(o), responses: hResponses })}</p>`
      ),
      data: { headphone_screen: o.headphone_screen },
      simulate: (p) => simulateHeadphoneAnswer(jsPsych, p.target_interval, nIntervals),
      honourForcedRt: true,
      finish: (d, p) => {
        ctx.state.headphone.n_trials++;
        if (d.correct) ctx.state.headphone.n_correct++;
        d.headphone_check_n_correct = ctx.state.headphone.n_correct;
        d.headphone_check_n_trials = ctx.state.headphone.n_trials;
        d.antiphase_interval = p.kinds.indexOf("antiphase") + 1;
      }
    });
    const pages = o.instruction_format === "text";
    return {
      timeline: [
        ...pages ? [
          textPage(
            ctx,
            t.headphone_intro + t.headphone_instructions({ n_trials: nTrials }),
            "instructions",
            "instruction"
          )
        ] : [],
        {
          timeline: [{ timeline: [pair.presentation, pair.response], repetitions: nTrials }],
          on_timeline_start: () => {
            ctx.state.headphone = { n_trials: 0, n_correct: 0 };
          }
        },
        ...pages ? [textPage(ctx, t.headphone_done, "instructions", "instruction")] : []
      ],
      conditional_function: () => ctx.test.headphone_check === "screening_task"
    };
  }
  function walkthroughTargets(nIntervals) {
    return nIntervals === 3 ? { listen: 2, steps: [3, 1] } : { listen: 1, steps: [2, 1] };
  }
  function walkthroughArgs(ctx, target) {
    const o = ctx.test;
    return {
      n_intervals: o.n_intervals,
      target_interval: target,
      masker: o.stimulus_set.masker !== "none",
      response_for: (i) => responseLabelHtml(ctx, o, i),
      device: device(o),
      frequency_hz: o.tone_frequency_hz[0]
    };
  }
  function walkthroughPlan(ctx, target) {
    const o = ctx.test;
    const p = taskPlan(
      ctx,
      o,
      { condition: conditionLabel(o.tone_frequency_hz[0]), frequency_hz: o.tone_frequency_hz[0] },
      walkthroughLevel(o),
      1
    );
    return __spreadProps(__spreadValues({}, p), { target_interval: target, iti_ms: 0, feedback_ms: 0 });
  }
  function createInstructionWalkthrough(ctx) {
    const o = ctx.test;
    const mode = o.instruction_demonstration;
    if (o.instruction_format !== "text" || mode === "none") return { timeline: [] };
    const t = ctx.text;
    const labels = labelsOf(ctx, o.n_intervals);
    const targets = walkthroughTargets(o.n_intervals);
    const nodes = [
      textPage(
        ctx,
        mode === "examples" ? t.instruction_examples_intro : t.instruction_demo_intro,
        "instructions",
        "instruction"
      )
    ];
    const listenArgs = walkthroughArgs(ctx, targets.listen);
    const listenPair = buildPair({
      ctx,
      o,
      phase: "instructions",
      responsePart: "instruction_check",
      begin: () => walkthroughPlan(ctx, targets.listen),
      makeSound: soundOf,
      intervals: intervalsOf,
      caption: () => textBlock(`<p>${t.listen}</p>`),
      data: {},
      simulate: () => answerCorrectly(targets.listen),
      honourForcedRt: false,
      finish: () => {
      }
    });
    const listenNote = {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => renderStage(labels, textBlock(t.instruction_listen(listenArgs))),
      // Continue first: the layout check (and a quick participant) takes the first button; "Listen again" is the second
      choices: [t.continue_button, t.replay_button],
      data: baseData({
        phase: "instructions",
        part: "instruction_example",
        target_interval: targets.listen
      }),
      on_finish: (d) => {
        delete d.stimulus;
        d.replayed = d.response === 1;
      },
      // data-only simulation goes on at once
      simulation_options: { data: { response: 0, rt: 400 } }
    };
    nodes.push({
      timeline: [listenPair.presentation, listenNote],
      loop_function: (data) => {
        var _a;
        return ((_a = data.last(1).values()[0]) == null ? void 0 : _a.response) === 1;
      }
    });
    if (mode === "examples") return { timeline: nodes };
    for (const target of targets.steps) {
      const args = walkthroughArgs(ctx, target);
      const state = { attempt: 0, correct: null };
      const shown = (html) => renderStage(labels, textBlock(html));
      const stepData = { phase: "instructions", target_interval: target };
      const pair = buildPair({
        ctx,
        o,
        phase: "instructions",
        responsePart: "instruction_check",
        begin: () => walkthroughPlan(ctx, target),
        makeSound: soundOf,
        intervals: intervalsOf,
        caption: (_p, stage) => textBlock(stage === "listen" ? `<p>${t.listen}</p>` : t.instruction_step(args)),
        data: {},
        // data-only simulation answers correctly
        simulate: () => answerCorrectly(target),
        honourForcedRt: false,
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
          pair.presentation,
          pair.response,
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
  function createTestIntro(ctx, nTracks) {
    return textPage(
      ctx,
      ctx.text.instruction_test_intro({ n_tracks: nTracks }),
      "instructions",
      "instruction"
    );
  }
  function practiceAccuracy(ctx, attempt, window2) {
    const rows = ctx.jsPsych.data.get().filter({ task: TASK_NAME, phase: "practice", part: "response", practice_attempt: attempt }).values();
    const recent = window2 === null ? rows : rows.slice(-window2);
    if (!recent.length) return null;
    return recent.filter((r) => r.correct === true).length / recent.length;
  }
  function createPractice(ctx) {
    const crit = ctx.test.practice_criterion;
    const n = ctx.test.practice_trials;
    if (n <= 0) return [];
    const spec = {
      block: 1,
      track_id: 1,
      condition: conditionLabel(ctx.test.tone_frequency_hz[0]),
      frequency_hz: ctx.test.tone_frequency_hz[0]
    };
    const out = [];
    if (ctx.test.instruction_format === "text") out.push(createPracticeIntro(ctx));
    if (!crit) {
      out.push(createBlock(ctx, "practice", spec, { attempt: 1 }));
      return out;
    }
    const attempts = crit.on_fail === "repeat" ? crit.max_repeats + 1 : 1;
    for (let k = 1; k <= attempts; k++) {
      const nodes = [];
      if (k > 1) nodes.push(textPage(ctx, ctx.text.practice_repeat, "instructions", "instruction"));
      nodes.push(createBlock(ctx, "practice", spec, { attempt: k }));
      out.push({
        timeline: nodes,
        conditional_function: () => !ctx.state.ended && (k === 1 || ctx.state.practice_failed),
        on_timeline_finish: () => {
          const acc = practiceAccuracy(ctx, k, crit.window);
          const met = acc === null || acc >= crit.accuracy;
          ctx.state.practice_failed = !met;
          if (!met && crit.on_fail === "end") ctx.state.ended = true;
          ctx.jsPsych.data.addDataToLastTrial({
            practice_criterion_met: met,
            practice_accuracy: acc
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
  function createRestBreak(ctx, track, nTracks) {
    return __spreadProps(__spreadValues({}, textPage(
      ctx,
      `<p>${ctx.text.track_complete({ track, n_tracks: nTracks })}</p>`,
      "test",
      "rest"
    )), {
      data: baseData({ phase: "test", part: "rest", block: track })
    });
  }
  function createCompletion(ctx, calculate) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        var _a;
        const s = calculate(ctx.jsPsych.data.get());
        return textBlock(
          `<h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
          threshold: s.threshold,
          level_unit: (_a = s.level_unit) != null ? _a : ctx.test.level_unit,
          n_trials: s.n_trials,
          accuracy: s.accuracy
        })}`
        );
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
    timeline.push(createHearingCheck(ctx));
    if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
    timeline.push(createVolumeCalibration(ctx));
    timeline.push(createHeadphoneCheck(ctx));
    if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
      timeline.push(createInstructionWalkthrough(ctx));
    }
    timeline.push(...createPractice(ctx));
    const specs = buildTrackSpecs(jsPsych, o);
    if (o.instruction_format === "text") {
      timeline.push({
        timeline: [createTestIntro(ctx, specs.length)],
        conditional_function: () => !ctx.state.ended
      });
    }
    specs.forEach((spec, i) => {
      const nodes = [createBlock(ctx, "test", spec)];
      if (i < specs.length - 1) nodes.push(createRestBreak(ctx, spec.block, specs.length));
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
    createHearingCheck,
    createVolumeCalibration,
    createHeadphoneCheck,
    createBlock,
    createPractice,
    createRestBreak,
    createTransition,
    createDisplayTrial,
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
      LEVEL_UNITS,
      AUDIO,
      HEADPHONE_SCREEN,
      SIMULATION
    },
    text: { defaultText },
    /** Sound synthesis as plain functions (samples out): tones, noise, whole trials, the antiphase screen, WAV files. */
    audio: {
      renderTone,
      renderNoise,
      renderTrialSound,
      renderHeadphoneSound,
      renderCalibrationSound,
      toWav,
      toneAmplitude,
      noiseRms,
      levelDb
    },
    stimuli: { renderStage },
    sequence: { buildTrackSpecs, allocateLevels, conditionLabel, sampleDuration },
    adaptive: { resolveAdaptive, Track },
    simulation: { probabilityCorrect },
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map