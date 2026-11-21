var jsPsychTimelineSelfOrderedPointing = (function (exports) {
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
  var TASK_NAME = "self-ordered-pointing";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-self-ordered-pointing";
  var PICK_CLASS = `${TASK_CLASS}-pick`;
  var POOL_SIZE = 48;
  var MAX_SET_SIZE = 12;
  var INSTRUCTION_SET_SIZE = 3;
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_CORRECT_MS = 900;
  var DEFAULT_RESHUFFLE_PROPORTION = 0.5;
  var DEFAULT_POSITION_REPEAT_MAX = 2;

  // src/options.ts
  var PHASE_OPTIONS = [
    "trial_feedback",
    "feedback_duration_ms",
    "response_window_ms",
    "iti_ms",
    "set_sizes"
  ];
  var TEST_ONLY = ["set_sizes", "block_order"];
  var DEFAULT_OPTIONS = {
    iti_ms: 250,
    response_window_ms: null,
    feedback_duration_ms: 800,
    stimulus_layout: "fixed_grid_slots",
    stimulus_set: { items: "abstract_designs", pool: "nested_first_n" },
    rearrangement_rule: "full_reshuffle_each_page",
    reshuffle_proportion: DEFAULT_RESHUFFLE_PROPORTION,
    block_order: "ascending",
    set_sizes: [6, 8, 10, 12],
    trials_per_condition: 3,
    position_repeat_rule: "none",
    position_repeat_max: DEFAULT_POSITION_REPEAT_MAX,
    response_device: "mouse",
    error_correction_procedure: "none",
    adaptive: null,
    practice_trials: 0,
    population_protocol: "standard",
    trial_feedback: "none",
    end_of_task_feedback: "none",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    practice: { set_sizes: [3], trial_feedback: "accuracy" }
  };
  var NOT_IMPLEMENTED = [
    [
      "block_order",
      ["counterbalanced", "alternating"],
      "use ascending, descending, fixed, random or random_within_block"
    ],
    [
      "trial_feedback",
      ["rt", "accuracy_rt", "points", "reward_outcome", "correct_answer"],
      "use accuracy or none"
    ],
    [
      "error_correction_procedure",
      ["retry", "correction_trial", "answer_change_allowed"],
      "a repeat never ends or repeats the series; S056's terminate-on-repeat-errors has no count in the spec either"
    ],
    [
      "population_protocol",
      ["child", "gamified_child", "clinical"],
      "the preschool protocol needs picture cards, pre-training and a discontinue rule that the spec gives no count for"
    ],
    [
      "instruction_format",
      ["audio", "video"],
      "no media is bundled; supply your own instruction trials"
    ],
    [
      "instruction_demonstration",
      ["examples", "animated", "guided_trial"],
      "use interactive (real picks, repeat until correct) or none"
    ]
  ];
  var DEVICES_IMPLEMENTED = ["mouse", "touch"];
  function resolveOptions(user = {}, phase = "test") {
    var _b;
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
    return merged;
  }
  function poolCapacity(items) {
    if (typeof items === "object") return "words" in items ? items.words.length : items.images.length;
    return POOL_SIZE;
  }
  var isDuration = (v) => typeof v === "number" ? v >= 0 : typeof v === "object" && v !== null;
  function checkDuration(name, v, allowNull) {
    if (v === null && allowNull) return;
    if (!isDuration(v) || v === null) {
      throw new Error(
        `self-ordered-pointing: ${name} must be a duration (a number of ms, or { min, max, step })${allowNull ? " or null" : ""}.`
      );
    }
    if (typeof v === "object") {
      const w = v;
      if (!(w.min >= 0 && w.max >= w.min)) {
        throw new Error(`self-ordered-pointing: ${name}: { min, max } needs 0 <= min <= max.`);
      }
    }
  }
  function itemsNeeded(pool, testSizes, practiceSizes, walkthroughSize) {
    if (pool === "nested_first_n") return Math.max(...testSizes, ...practiceSizes, walkthroughSize);
    const uniq = (l) => [...new Set(l)].reduce((a, b) => a + b, 0);
    return uniq(testSizes) + uniq(practiceSizes) + walkthroughSize;
  }
  function validateOptions(o, phase = "test") {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(
          `self-ordered-pointing: ${String(key)}: "${o[key]}" is not implemented (${why}).`
        );
      }
    }
    if (o.adaptive !== null) {
      throw new Error(
        "self-ordered-pointing: adaptive is not implemented: only a fixed schedule of set sizes (adaptive: null). IRT-CAT (S040) and ascending-until-fail (S056) need an item bank and a discontinue rule."
      );
    }
    if (!DEVICES_IMPLEMENTED.includes(o.response_device)) {
      throw new Error(
        `self-ordered-pointing: response_device: "${o.response_device}" is not implemented (mouse and touch only: the response is a click or tap on an item).`
      );
    }
    const items = o.stimulus_set.items;
    if (items === "representational_drawings") {
      throw new Error(
        'self-ordered-pointing: stimulus_set.items: "representational_drawings" is not implemented (no licensed drawing set is bundled); use "abstract_designs", "words", "nonwords", { words: [...] } or { images: [...] }.'
      );
    }
    if (typeof items === "object" && !("words" in items && Array.isArray(items.words) || "images" in items && Array.isArray(items.images))) {
      throw new Error(
        "self-ordered-pointing: stimulus_set.items as an object must be { words: [...] } or { images: [...] }."
      );
    }
    if (!["nested_first_n", "distinct_per_set_size"].includes(o.stimulus_set.pool)) {
      throw new Error(
        `self-ordered-pointing: stimulus_set.pool: "${o.stimulus_set.pool}" is not a pool rule (nested_first_n or distinct_per_set_size).`
      );
    }
    if (!["fixed_grid_slots", "free_positions_in_area"].includes(o.stimulus_layout)) {
      throw new Error(
        `self-ordered-pointing: stimulus_layout: "${o.stimulus_layout}" is not implemented.`
      );
    }
    if (!Array.isArray(o.set_sizes) || o.set_sizes.length === 0 || o.set_sizes.some((n) => !Number.isInteger(n) || n < 2 || n > MAX_SET_SIZE)) {
      throw new Error(
        `self-ordered-pointing: set_sizes must be a list of integers from 2 to ${MAX_SET_SIZE} (the grid layout is built for that range).`
      );
    }
    if (new Set(o.set_sizes).size !== o.set_sizes.length) {
      throw new Error(
        "self-ordered-pointing: set_sizes must not repeat a size; use trials_per_condition."
      );
    }
    if (phase === "test" && !(Number.isInteger(o.trials_per_condition) && o.trials_per_condition >= 1)) {
      throw new Error(
        "self-ordered-pointing: trials_per_condition must be a whole number of at least 1."
      );
    }
    if (!(Number.isInteger(o.practice_trials) && o.practice_trials >= 0)) {
      throw new Error("self-ordered-pointing: practice_trials must be a whole number of at least 0.");
    }
    checkDuration("iti_ms", o.iti_ms, false);
    checkDuration("feedback_duration_ms", o.feedback_duration_ms, false);
    checkDuration("response_window_ms", o.response_window_ms, true);
    if (typeof o.response_window_ms === "number" && o.response_window_ms <= 0) {
      throw new Error(
        "self-ordered-pointing: response_window_ms must be above 0, or null for untimed."
      );
    }
    if (!(o.reshuffle_proportion > 0 && o.reshuffle_proportion <= 1)) {
      throw new Error("self-ordered-pointing: reshuffle_proportion must be in (0, 1].");
    }
    if (!["none", "instructed", "enforced", "detect_and_remind"].includes(o.position_repeat_rule)) {
      throw new Error(
        `self-ordered-pointing: position_repeat_rule: "${o.position_repeat_rule}" is not a rule (none, instructed, enforced, detect_and_remind).`
      );
    }
    if (o.position_repeat_rule !== "none") {
      if (o.stimulus_layout !== "fixed_grid_slots") {
        throw new Error(
          `self-ordered-pointing: position_repeat_rule "${o.position_repeat_rule}" and stimulus_layout "${o.stimulus_layout}" contradict each other: a position is only defined on the fixed grid.`
        );
      }
      if (!(Number.isInteger(o.position_repeat_max) && o.position_repeat_max >= 1)) {
        throw new Error(
          "self-ordered-pointing: position_repeat_max must be a whole number of at least 1."
        );
      }
    }
  }
  function checkPool(test, practice, walkthroughSize) {
    const needed = itemsNeeded(
      test.stimulus_set.pool,
      test.set_sizes,
      practice.practice_trials > 0 ? practice.set_sizes : [],
      walkthroughSize
    );
    const cap = poolCapacity(test.stimulus_set.items);
    if (needed > cap) {
      throw new Error(
        `self-ordered-pointing: stimulus_set.pool "${test.stimulus_set.pool}" with these set sizes needs ${needed} different items but the item set has ${cap}. Use "nested_first_n", fewer or smaller sets, or give more items.`
      );
    }
  }

  // src/schedule.ts
  function scheduleBlocks(jsPsych, sizes, reps, order) {
    const r = jsPsych.randomization;
    const grouped = (levels) => levels.map((s) => Array(reps).fill(s));
    switch (order) {
      case "ascending":
        return grouped([...sizes].sort((a, b) => a - b));
      case "descending":
        return grouped([...sizes].sort((a, b) => b - a));
      case "fixed":
        return grouped([...sizes]);
      case "random":
        return [r.shuffle(Array.from({ length: reps }, () => sizes).flat())];
      case "random_within_block":
        return Array.from({ length: reps }, () => r.shuffle([...sizes]));
      default:
        throw new Error(`self-ordered-pointing: block_order "${order}" is not implemented.`);
    }
  }
  function practiceSetSizes(jsPsych, sizes, n) {
    const out = [];
    while (out.length < n) out.push(...jsPsych.randomization.shuffle([...sizes]));
    return out.slice(0, n);
  }

  // ../../node_modules/jspsych/dist/index.js
  __toESM(require_auto_bind());
  __toESM(require_random_words());
  __toESM(require_alea());
  function deepCopy(obj) {
    if (!obj) return obj;
    let out;
    if (Array.isArray(obj)) {
      out = [];
      for (const x of obj) {
        out.push(deepCopy(x));
      }
      return out;
    } else if (typeof obj === "object" && obj !== null) {
      out = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          out[key] = deepCopy(obj[key]);
        }
      }
      return out;
    } else {
      return obj;
    }
  }
  var DataColumn = class _DataColumn {
    constructor(values = []) {
      this.values = values;
    }
    sum() {
      let s = 0;
      for (const v of this.values) {
        s += v;
      }
      return s;
    }
    mean() {
      let sum = 0;
      let count = 0;
      for (const value of this.values) {
        if (typeof value !== "undefined" && value !== null) {
          sum += value;
          count++;
        }
      }
      if (count === 0) {
        return void 0;
      }
      return sum / count;
    }
    median() {
      if (this.values.length === 0) {
        return void 0;
      }
      const numbers = this.values.slice(0).sort(function(a, b) {
        return a - b;
      });
      const middle = Math.floor(numbers.length / 2);
      const isEven = numbers.length % 2 === 0;
      return isEven ? (numbers[middle] + numbers[middle - 1]) / 2 : numbers[middle];
    }
    min() {
      return Math.min.apply(null, this.values);
    }
    max() {
      return Math.max.apply(null, this.values);
    }
    count() {
      return this.values.length;
    }
    variance() {
      const mean = this.mean();
      let sum_square_error = 0;
      for (const x of this.values) {
        sum_square_error += Math.pow(x - mean, 2);
      }
      const mse = sum_square_error / (this.values.length - 1);
      return mse;
    }
    sd() {
      const mse = this.variance();
      const rmse = Math.sqrt(mse);
      return rmse;
    }
    frequencies() {
      const unique = {};
      for (const x of this.values) {
        if (typeof unique[x] === "undefined") {
          unique[x] = 1;
        } else {
          unique[x]++;
        }
      }
      return unique;
    }
    all(eval_fn) {
      for (const x of this.values) {
        if (!eval_fn(x)) {
          return false;
        }
      }
      return true;
    }
    subset(eval_fn) {
      const out = [];
      for (const x of this.values) {
        if (eval_fn(x)) {
          out.push(x);
        }
      }
      return new _DataColumn(out);
    }
  };
  function saveTextToFile(textstr, filename) {
    const blobToSave = new Blob([textstr], {
      type: "text/plain"
    });
    let blobURL = "";
    if (typeof window.webkitURL !== "undefined") {
      blobURL = window.webkitURL.createObjectURL(blobToSave);
    } else {
      blobURL = window.URL.createObjectURL(blobToSave);
    }
    const link = document.createElement("a");
    link.id = "jspsych-download-as-text-link";
    link.style.display = "none";
    link.download = filename;
    link.href = blobURL;
    link.click();
  }
  function JSON2CSV(objArray) {
    const array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    let line = "";
    let result = "";
    const columns = [];
    for (const row of array) {
      for (const key in row) {
        let keyString = key + "";
        keyString = '"' + keyString.replace(/"/g, '""') + '",';
        if (!columns.includes(key)) {
          columns.push(key);
          line += keyString;
        }
      }
    }
    line = line.slice(0, -1);
    result += line + "\r\n";
    for (const row of array) {
      line = "";
      for (const col of columns) {
        let value = typeof row[col] === "undefined" ? "" : row[col];
        if (typeof value == "object") {
          value = JSON.stringify(value);
        }
        const valueString = value + "";
        line += '"' + valueString.replace(/"/g, '""') + '",';
      }
      line = line.slice(0, -1);
      result += line + "\r\n";
    }
    return result;
  }
  var DataCollection = class _DataCollection {
    constructor(data = []) {
      this.trials = data;
    }
    push(new_data) {
      this.trials.push(new_data);
      return this;
    }
    join(other_data_collection) {
      this.trials = this.trials.concat(other_data_collection.values());
      return this;
    }
    top() {
      if (this.trials.length <= 1) {
        return this;
      } else {
        return new _DataCollection([this.trials[this.trials.length - 1]]);
      }
    }
    /**
     * Queries the first n elements in a collection of trials.
     *
     * @param n A positive integer of elements to return. A value of
     *          n that is less than 1 will throw an error.
     *
     * @return First n objects of a collection of trials. If fewer than
     *         n trials are available, the trials.length elements will
     *         be returned.
     *
     */
    first(n = 1) {
      if (n < 1) {
        throw `You must query with a positive nonzero integer. Please use a
               different value for n.`;
      }
      if (this.trials.length === 0) return new _DataCollection();
      if (n > this.trials.length) n = this.trials.length;
      return new _DataCollection(this.trials.slice(0, n));
    }
    /**
     * Queries the last n elements in a collection of trials.
     *
     * @param n A positive integer of elements to return. A value of
     *          n that is less than 1 will throw an error.
     *
     * @return Last n objects of a collection of trials. If fewer than
     *         n trials are available, the trials.length elements will
     *         be returned.
     *
     */
    last(n = 1) {
      if (n < 1) {
        throw `You must query with a positive nonzero integer. Please use a
               different value for n.`;
      }
      if (this.trials.length === 0) return new _DataCollection();
      if (n > this.trials.length) n = this.trials.length;
      return new _DataCollection(this.trials.slice(this.trials.length - n, this.trials.length));
    }
    values() {
      return this.trials;
    }
    count() {
      return this.trials.length;
    }
    readOnly() {
      return new _DataCollection(deepCopy(this.trials));
    }
    addToAll(properties) {
      for (const trial of this.trials) {
        Object.assign(trial, properties);
      }
      return this;
    }
    addToLast(properties) {
      if (this.trials.length > 0) {
        Object.assign(this.trials[this.trials.length - 1], properties);
      }
      return this;
    }
    filter(filters) {
      let f;
      if (!Array.isArray(filters)) {
        f = deepCopy([filters]);
      } else {
        f = deepCopy(filters);
      }
      const filtered_data = [];
      for (const trial of this.trials) {
        let keep = false;
        for (const filter of f) {
          let match = true;
          for (const key of Object.keys(filter)) {
            if (typeof trial[key] !== "undefined" && trial[key] === filter[key]) ;
            else {
              match = false;
            }
          }
          if (match) {
            keep = true;
            break;
          }
        }
        if (keep) {
          filtered_data.push(trial);
        }
      }
      return new _DataCollection(filtered_data);
    }
    filterCustom(fn) {
      return new _DataCollection(this.trials.filter(fn));
    }
    filterColumns(columns) {
      return new _DataCollection(
        this.trials.map(
          (trial) => Object.fromEntries(columns.filter((key) => key in trial).map((key) => [key, trial[key]]))
        )
      );
    }
    select(column) {
      const values = [];
      for (const trial of this.trials) {
        if (typeof trial[column] !== "undefined") {
          values.push(trial[column]);
        }
      }
      return new DataColumn(values);
    }
    ignore(columns) {
      if (!Array.isArray(columns)) {
        columns = [columns];
      }
      const o = deepCopy(this.trials);
      for (const trial of o) {
        for (const delete_key of columns) {
          delete trial[delete_key];
        }
      }
      return new _DataCollection(o);
    }
    uniqueNames() {
      const names = [];
      for (const trial of this.trials) {
        for (const key of Object.keys(trial)) {
          if (!names.includes(key)) {
            names.push(key);
          }
        }
      }
      return names;
    }
    csv() {
      return JSON2CSV(this.trials);
    }
    json(pretty = false) {
      if (pretty) {
        return JSON.stringify(this.trials, null, "	");
      }
      return JSON.stringify(this.trials);
    }
    localSave(format, filename) {
      format = format.toLowerCase();
      let data_string;
      if (format === "json") {
        data_string = this.json();
      } else if (format === "csv") {
        data_string = this.csv();
      } else {
        throw new Error('Invalid format specified for localSave. Must be "json" or "csv".');
      }
      saveTextToFile(data_string, filename);
    }
  };
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

  // src/scoring.ts
  function bySeries(rows) {
    const m = /* @__PURE__ */ new Map();
    for (const r of rows) {
      const k = r.series;
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(r);
    }
    return m;
  }
  function calculateScores(data) {
    const rows = data.filter({ task: TASK_NAME, phase: "test", part: "response" }).values();
    const picks = rows.filter((r) => !r.timeout);
    const series = bySeries(rows);
    const errors = rows.filter((r) => r.is_repeat_error === true);
    const sizes = [...new Set(rows.map((r) => r.set_size))].sort((a, b) => a - b);
    const errors_by_set_size = sizes.map((s) => {
      const inSize = [...series.values()].filter((p) => p[0].set_size === s);
      const e = inSize.reduce((a, p) => a + p.filter((r) => r.is_repeat_error === true).length, 0);
      return {
        set_size: s,
        n_series: inSize.length,
        errors: e,
        mean_errors_per_series: inSize.length > 0 ? e / inSize.length : 0
      };
    });
    const maxChoice = rows.reduce((a, r) => {
      var _a;
      return Math.max(a, (_a = r.choice_index) != null ? _a : 0);
    }, 0);
    const error_rate_by_choice_order = [];
    for (let c = 1; c <= maxChoice; c++) {
      const at = picks.filter((r) => r.choice_index === c);
      if (at.length === 0) continue;
      const e = at.filter((r) => r.is_repeat_error === true).length;
      error_rate_by_choice_order.push({
        choice_index: c,
        n_picks: at.length,
        errors: e,
        error_rate: e / at.length
      });
    }
    const spans = [...series.values()].map((p) => {
      const ordered = [...p].sort((a, b) => a.choice_index - b.choice_index);
      const first = ordered.findIndex((r) => r.is_repeat_error === true);
      return (first < 0 ? ordered : ordered.slice(0, first)).filter((r) => r.correct === true).length;
    });
    const clean = [...series.values()].filter((p) => p.every((r) => r.correct === true)).map((p) => p[0].set_size);
    const rtRows = data.filter({ task: TASK_NAME, phase: "test", part: "response" }).filterCustom((r) => typeof r.rt === "number");
    return {
      n_series: series.size,
      n_pages: rows.length,
      n_picks: picks.length,
      n_timeouts: rows.length - picks.length,
      total_errors: errors.length,
      mean_errors_per_series: series.size > 0 ? errors.length / series.size : null,
      errors_by_set_size,
      error_rate_by_choice_order,
      mean_accuracy: picks.length > 0 ? picks.filter((r) => r.is_repeat_error !== true).length / picks.length : null,
      span_before_first_error: spans.length > 0 ? new DataCollection(spans.map((span) => ({ span }))).select("span").mean() : null,
      max_set_size_completed: clean.length > 0 ? Math.max(...clean) : null,
      perseverative_errors: errors.filter(
        (r) => r.previous_item_id != null && r.chosen_item_id === r.previous_item_id
      ).length,
      mean_rt: rtRows.count() > 0 ? rtRows.select("rt").mean() : null,
      n_position_repeat_violations: rows.filter((r) => r.position_rule_violation === true).length
    };
  }
  function getSummary(data) {
    return __spreadProps(__spreadValues({}, calculateScores(data)), { task: TASK_NAME, version: VERSION });
  }

  // src/simulate.ts
  function recognitionProbability(setSize) {
    return Math.min(1, Math.max(0.5, 1 - 0.03 * (setSize - 2)));
  }
  function simulateMemoryPick(jsPsych, page) {
    const n = page.arrangement.length;
    const m = recognitionProbability(n);
    const r = jsPsych.randomization;
    const eligible = [];
    page.arrangement.forEach((item, slot) => {
      if (slot === page.disabled_slot) return;
      if (!page.picked.has(item) || r.randomInt(0, 9999) / 1e4 >= m) eligible.push(slot);
    });
    const pool = eligible.length > 0 ? eligible : page.arrangement.map((_, s) => s).filter((s) => s !== page.disabled_slot);
    return pool[r.randomInt(0, pool.length - 1)];
  }
  function simulateCorrectPick(jsPsych, page) {
    const slots = page.arrangement.map((item, slot) => ({ item, slot })).filter((x) => !page.picked.has(x.item) && x.slot !== page.disabled_slot).map((x) => x.slot);
    return slots[jsPsych.randomization.randomInt(0, slots.length - 1)];
  }

  // src/shapes.ts
  var DESIGN_PATHS = [
    "M85 51L68 65L62 93L36 88L25 76L29 47L12 24L37 21L57 22L85 32Z",
    "M71 56L64 65L43 71L26 56L34 35L38 27L61 33Z",
    "M89 41L83 72L50 70L22 82L32 55L27 36L39 35L53 21L80 17Z",
    "M69 45L65 61L51 88L31 68L28 50L25 24L40 6L80 19Z",
    "M77 42L62 63L47 68L15 71L25 27L46 12L68 29Z",
    "M71 45L88 74L55 84L37 89L5 58L10 42L35 17L52 31L69 28Z",
    "M94 39L61 72L41 72L33 56L12 33L45 22L71 34Z",
    "M71 45L81 83L31 91L19 57L16 31L33 11L76 13Z",
    "M89 40L65 87L48 94L15 62L35 38L49 14L62 27Z",
    "M82 42L68 70L57 84L41 70L20 69L32 46L43 30L48 4L75 31Z",
    "M87 41L62 66L45 87L16 77L14 44L22 29L54 25L73 20Z",
    "M94 46L78 86L48 74L42 68L33 59L32 45L41 33L56 33L73 38Z",
    "M75 48L73 60L63 76L39 76L23 65L33 47L12 27L46 27L62 6L72 37Z",
    "M96 50L76 81L57 93L36 88L11 70L12 39L25 18L63 19L81 20Z",
    "M68 46L73 76L53 93L35 77L20 55L13 27L41 31L60 22L75 28Z",
    "M88 42L65 61L55 95L23 74L28 51L32 30L47 11L65 35Z",
    "M70 48L79 83L50 68L33 92L10 64L7 36L31 14L65 11L69 37Z",
    "M72 51L67 60L52 70L45 78L12 68L9 54L15 20L41 34L60 22L81 16Z",
    "M73 53L63 66L59 90L36 60L21 50L26 15L44 28L63 36Z",
    "M93 46L75 65L50 69L31 71L15 69L9 29L44 33L52 10L80 30Z",
    "M94 40L73 77L52 78L38 67L18 58L35 28L47 5L81 29Z",
    "M77 43L81 79L40 73L13 74L35 40L40 11L65 38Z",
    "M82 43L85 71L57 77L40 75L24 77L6 42L21 24L30 14L56 25L84 21Z",
    "M88 41L71 65L58 80L32 75L6 61L17 21L51 28L68 37Z",
    "M70 46L82 75L69 89L41 82L19 65L28 52L21 36L35 11L58 32L78 29Z",
    "M86 43L76 75L61 80L44 82L17 76L22 50L22 35L40 32L59 30L70 37Z",
    "M68 51L68 67L42 95L11 64L15 26L42 32L79 28Z",
    "M86 41L63 65L52 68L27 86L31 58L15 28L35 17L60 20L67 34Z",
    "M88 42L78 70L53 84L39 69L15 68L13 31L30 29L66 13L64 39Z",
    "M86 43L70 77L56 88L36 82L35 60L33 43L41 30L53 17L66 36Z",
    "M93 54L82 80L61 70L43 68L27 71L6 41L24 25L35 19L57 6L83 21Z",
    "M70 51L64 65L70 88L45 73L24 69L11 58L20 21L45 12L59 31L83 30Z",
    "M75 45L88 74L57 69L42 67L24 57L29 48L25 12L50 14L67 27Z",
    "M90 38L64 71L51 86L29 54L35 39L33 10L72 25Z",
    "M77 44L63 72L52 73L36 64L22 45L26 35L54 16L72 18Z",
    "M93 58L78 73L58 66L46 70L13 67L9 51L34 43L40 15L56 25L72 27Z",
    "M91 45L60 66L46 69L27 67L6 45L37 32L46 25L68 37Z",
    "M73 44L76 82L56 85L28 64L19 44L35 39L58 17L80 25Z",
    "M76 45L70 72L56 89L36 89L17 66L14 40L36 25L58 6L70 38Z",
    "M92 38L62 66L32 84L19 59L33 41L42 23L81 24Z",
    "M70 45L69 75L59 84L37 73L18 57L21 40L29 12L52 19L66 40Z",
    "M94 41L79 78L55 75L43 95L22 69L26 47L24 36L38 15L57 24L79 21Z",
    "M67 54L80 70L58 93L45 71L26 64L14 51L30 41L33 11L57 32L82 18Z",
    "M77 53L83 66L55 83L45 74L16 80L15 48L23 26L47 18L58 33L83 19Z",
    "M81 43L77 72L52 80L19 83L21 48L17 21L40 9L78 15Z",
    "M68 49L84 74L56 72L41 92L19 77L18 47L29 40L42 16L59 11L63 36Z",
    "M96 53L76 80L61 88L36 75L8 63L32 40L28 11L55 32L64 40Z",
    "M95 48L60 74L45 90L33 61L36 38L46 23L70 32Z"
  ];

  // src/wordlists.ts
  var WORDS = [
    "apple",
    "river",
    "chair",
    "cloud",
    "stone",
    "horse",
    "table",
    "spoon",
    "bridge",
    "candle",
    "window",
    "garden",
    "pencil",
    "ladder",
    "basket",
    "jacket",
    "button",
    "mirror",
    "rabbit",
    "planet",
    "bottle",
    "carpet",
    "pillow",
    "ribbon",
    "hammer",
    "island",
    "lemon",
    "mouse",
    "ocean",
    "plant",
    "tiger",
    "towel",
    "whale",
    "wheel",
    "zebra",
    "anchor",
    "blanket",
    "cheese",
    "engine",
    "feather",
    "guitar",
    "helmet",
    "kettle",
    "magnet",
    "needle",
    "orange",
    "saddle",
    "violin"
  ];
  var NONWORDS = [
    "bavet",
    "delun",
    "fomik",
    "gurba",
    "hevol",
    "jikan",
    "kolem",
    "lunat",
    "mirod",
    "navep",
    "pelki",
    "quvan",
    "rotub",
    "sevid",
    "tamul",
    "vorek",
    "wadin",
    "zelop",
    "bokup",
    "cadin",
    "dufel",
    "fegom",
    "galup",
    "hasik",
    "jemor",
    "kivat",
    "lopun",
    "mudel",
    "nofiv",
    "pabek",
    "ritum",
    "sagol",
    "tevak",
    "vubin",
    "wokel",
    "zimap",
    "baluf",
    "dorek",
    "fanub",
    "gitol",
    "hupem",
    "kadiv",
    "lemuk",
    "motab",
    "nuvel",
    "pilok",
    "radun",
    "sotef"
  ];

  // src/stimuli.ts
  var cls = (name) => `${TASK_CLASS}-${name}`;
  function buildPool(set) {
    if (set === "abstract_designs") {
      return DESIGN_PATHS.map((d, i) => ({
        id: `design-${String(i + 1).padStart(2, "0")}`,
        kind: "design",
        content: d
      }));
    }
    if (set === "words") return WORDS.map((w) => ({ id: w, kind: "text", content: w }));
    if (set === "nonwords") return NONWORDS.map((w) => ({ id: w, kind: "text", content: w }));
    if (typeof set === "object" && "words" in set)
      return set.words.map((w) => ({ id: w, kind: "text", content: w }));
    if (typeof set === "object" && "images" in set)
      return set.images.map((u, i) => ({ id: `image-${i + 1}`, kind: "image", content: u }));
    throw new Error(
      `self-ordered-pointing: stimulus_set.items: ${JSON.stringify(set)} is not implemented.`
    );
  }
  function itemNouns(set) {
    if (set === "abstract_designs") return { singular: "design", plural: "designs" };
    if (set === "words" || typeof set === "object" && "words" in set)
      return { singular: "word", plural: "words" };
    if (set === "nonwords") return { singular: "made-up word", plural: "made-up words" };
    return { singular: "picture", plural: "pictures" };
  }
  function assignItems(pool, rule, walkthroughSize, practiceSizes, testSizes) {
    const out = { walkthrough: [], practice: /* @__PURE__ */ new Map(), test: /* @__PURE__ */ new Map() };
    let at = 0;
    const take = (n) => {
      if (rule === "nested_first_n") return pool.slice(0, n);
      const slice = pool.slice(at, at + n);
      at += n;
      return slice;
    };
    if (walkthroughSize > 0) out.walkthrough = take(walkthroughSize);
    for (const n of new Set(practiceSizes)) out.practice.set(n, take(n));
    for (const n of new Set(testSizes)) out.test.set(n, take(n));
    return out;
  }
  var ROWS = {
    2: 1,
    3: 1,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
    9: 3,
    10: 2,
    11: 3,
    12: 3
  };
  function gridDims(n) {
    var _a;
    const rows = (_a = ROWS[n]) != null ? _a : Math.ceil(n / 5);
    return { rows, cols: Math.ceil(n / rows) };
  }
  function slotRowCol(slot, n) {
    const { cols } = gridDims(n);
    return { row: Math.floor(slot / cols) + 1, col: slot % cols + 1 };
  }
  var range = (n) => Array.from({ length: n }, (_, i) => i);
  var sameArrangement = (a, b) => a.every((x, i) => x === b[i]);
  function nextArrangement(jsPsych, n, rule, proportion, prev) {
    const r = jsPsych.randomization;
    if (rule === "partial_reshuffle_each_page" && prev) {
      const k = Math.min(n, Math.max(2, Math.round(n * proportion)));
      const slots = r.sampleWithoutReplacement(range(n), k);
      const next = [...prev];
      slots.forEach((s, j) => {
        next[s] = prev[slots[(j + 1) % k]];
      });
      return next;
    }
    const fresh = r.shuffle(range(n));
    if (prev && sameArrangement(fresh, prev)) return [...fresh.slice(1), fresh[0]];
    return fresh;
  }
  function drawJitter(jsPsych, n) {
    const f = () => jsPsych.randomization.randomInt(0, 100) / 100;
    return range(n).map(() => ({ u: f(), v: f() }));
  }
  function sampleDuration(jsPsych, v) {
    if (typeof v === "number") return v;
    const step = v.step && v.step > 0 ? v.step : 1;
    return v.min + jsPsych.randomization.randomInt(0, Math.floor((v.max - v.min) / step + 1e-9)) * step;
  }
  var esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function renderItem(item) {
    if (item.kind === "design")
      return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="${item.content}" fill="currentColor"/></svg>`;
    if (item.kind === "image") return `<img src="${esc(item.content)}" alt="" draggable="false">`;
    return `<span class="${cls("item-text")}">${esc(item.content)}</span>`;
  }
  function itemButtonHtml(a) {
    const { row, col } = slotRowCol(a.slot, a.n);
    const style = a.jitter ? ` style="--row:${row - 1};--col:${col - 1};--u:${a.jitter.u};--v:${a.jitter.v}"` : "";
    return `<button class="jspsych-btn ${cls("item")}" data-item="${esc(
    a.item.id
  )}" aria-label="${esc(a.aria_label)}"${style}${a.disabled ? " disabled" : ""}>${renderItem(
    a.item
  )}</button>`;
  }
  var textBlock = (html) => `<div class="${cls("text")}">${html}</div>`;
  var renderNotice = (html, kind = "") => `<div class="${cls("notice")} ${kind}">${html}</div>`;
  function renderScreen(stage, below = "") {
    return `<div class="${cls("screen")}"><div class="${cls("stage")}">${stage}</div>` + (below ? `<div class="${cls("below")}">${below}</div>` : "") + `</div>`;
  }
  function renderPickScreen(below = "") {
    return `<div class="${cls("screen")}">` + (below ? `<div class="${cls("below")}">${below}</div>` : "") + `</div>`;
  }

  // src/text.ts
  var capital = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  var defaultText = {
    instruction_intro: (r) => `<h2>Self-ordered pointing</h2><p>On each screen you will see several ${r.nouns} at once.</p><p>${capital(r.verb)} one ${r.noun} on each screen.</p>`,
    instruction_rule: (r) => `<p>Pick a ${r.noun} you have <strong>not picked before</strong> in this set. After every pick the screen changes, ${r.partial_reshuffle ? `and some of the ${r.nouns} move to new places` : `and the ${r.nouns} move to new places`}, so remember which ${r.nouns} you have picked, not where they were.</p><p>When you have picked every ${r.noun} in the set once, the set is done and the next one begins.</p>`,
    instruction_position_rule: (r) => r.position_rule === "enforced" ? `<p>Do not rely on screen position. If your last ${r.position_max === 1 ? "pick was" : `${r.position_max} picks were`} in the same position, that position is switched off for the next screen.</p>` : r.position_rule === "detect_and_remind" ? `<p>Do not rely on screen position. Try not to pick the same position more than ${r.position_max} times in a row. If you do, you will see a reminder.</p>` : `<p>Do not rely on screen position. Do not pick the same position more than ${r.position_max} times in a row.</p>`,
    instruction_time_limit: (r) => r.limit_seconds !== null ? `<p>Each pick has a time limit of ${r.limit_seconds} seconds. If time runs out, the screen moves on without a pick.</p>` : `<p>Each pick has a time limit. If time runs out, the screen moves on without a pick.</p>`,
    instruction_demo_intro: (r) => `<p>Let us try it with a small set of three ${r.nouns}. Do exactly what each message says.</p>`,
    instruction_step: (r) => r.step === "first" ? `Pick any ${r.noun}.` : r.step === "new" ? `${r.partial_reshuffle ? `Some of the ${r.nouns} have` : `The ${r.nouns} have`} moved. Pick a ${r.noun} you have not picked yet.` : `You have picked ${r.n_picked} of ${r.set_size}. Pick the ${r.noun} that is left.`,
    instruction_hint: (r) => `<p>You already picked that ${r.noun}. Pick one you have <strong>not</strong> picked yet. ${r.partial_reshuffle ? `Some of the ${r.nouns}` : `The ${r.nouns}`} will move again.</p>`,
    instruction_reveal: (r) => `<p>This is the ${r.noun} you had not picked yet. In the task, pick a new one each time.</p>`,
    instruction_correct: "Correct",
    instruction_demo_done: (r) => `<p>That was one set. In the task the sets are bigger, and you pick every ${r.noun} in a set once.</p>`,
    practice_intro: (r) => `<h2>Practice</h2><p>Now you will practice with ${r.n_series} ${r.n_series === 1 ? "set" : "sets"} of ${r.set_sizes.join(", ")} ${r.nouns}.</p><p>${r.feedback ? `After each pick you will see whether it was new or a repeat. ` : `You will not see a message after each pick. `}These sets run at the pace of the real task, and the main task follows.</p>`,
    test_intro: (r) => `<h2>Main task</h2><p>${r.after_practice ? "Practice is over. " : ""}The main task starts now, at the same pace. You will do ${r.n_series} ${r.n_series === 1 ? "set" : "sets"}, with ${r.set_sizes.join(
    ", "
  )} ${r.nouns} ${r.set_sizes.length > 1 ? "in the sets" : r.n_series === 1 ? "in the set" : "in each set"}. ${r.feedback ? "After each pick you will see whether it was new or a repeat." : "You will not see a message after each pick."}</p><p>Pick a ${r.noun} you have not picked before in the set.</p>`,
    series_intro: (r) => `<h2>${r.phase === "practice" ? "Practice set" : "Set"} ${r.series} of ${r.n_series}</h2><p>This set has ${r.set_size} ${r.nouns}. Pick each one once.</p>`,
    feedback_new: "New",
    feedback_repeat: "Picked before",
    position_reminder: (r) => `<p>Reminder: do not pick the same position more than ${r.position_max} times in a row. Remember the ${r.nouns} you picked, not where they were.</p>`,
    item_button_label: (r) => `Item ${r.position}`,
    continue_button: "Continue",
    task_complete: "Task complete",
    result_summary: (r) => `<p>Repeat errors: ${r.total_errors} in ${r.n_series} ${r.n_series === 1 ? "set" : "sets"}.</p>` + (r.by_set_size.length > 1 ? `<p>${r.by_set_size.map((s) => `${s.set_size} items: ${s.errors}`).join("; ")}.</p>` : "")
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
  styleInject(".jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-text h2 {\n  text-align: center;\n}\n.jspsych-timelines-self-ordered-pointing {\n  --sopt-stage-w: min(380px, calc(100vw - 16px));\n  --sopt-stage-h: min(292px, 62vh);\n  --sopt-gap: 8px;\n  --sopt-pad: 8px;\n  --sopt-max-item: 84px;\n  --sopt-btn-reserve: 76px;\n}\n.jspsych-timelines-self-ordered-pointing:has(.jspsych-timelines-self-ordered-pointing-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-screen {\n  display: contents;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: var(--sopt-stage-w);\n  height: var(--sopt-stage-h);\n  padding: var(--sopt-pad);\n  overflow: hidden;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-below {\n  position: absolute;\n  top: calc(50% + var(--sopt-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-below .jspsych-timelines-self-ordered-pointing-text {\n  padding: 0 12px;\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-below .jspsych-timelines-self-ordered-pointing-text p {\n  margin: 0.3em 0;\n}\n.jspsych-timelines-self-ordered-pointing:not(.jspsych-timelines-self-ordered-pointing-pick):has(.jspsych-timelines-self-ordered-pointing-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-self-ordered-pointing:not(.jspsych-timelines-self-ordered-pointing-pick):has(#jspsych-html-button-response-btngroup) .jspsych-timelines-self-ordered-pointing-below {\n  bottom: var(--sopt-btn-reserve);\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-notice {\n  font-size: 1em;\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-reveal {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 12px;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-demo-item {\n  width: 80px;\n  height: 80px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-demo-item svg,\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-demo-item img {\n  width: 100%;\n  height: 100%;\n}\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick #jspsych-html-button-response-btngroup {\n  --cell: min( var(--sopt-max-item), calc((var(--sopt-stage-w) - 2 * var(--sopt-pad) - (var(--cols, 4) - 1) * var(--sopt-gap)) / var(--cols, 4)), calc((var(--sopt-stage-h) - 2 * var(--sopt-pad) - (var(--rows, 3) - 1) * var(--sopt-gap)) / var(--rows, 3)) );\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: grid;\n  grid-template-columns: repeat(var(--cols, 4), var(--cell)) !important;\n  grid-template-rows: repeat(var(--rows, 3), var(--cell)) !important;\n  gap: var(--sopt-gap);\n  justify-content: center;\n  align-content: center;\n  width: var(--sopt-stage-w);\n  max-width: none;\n  margin: 0;\n  height: var(--sopt-stage-h);\n  padding: var(--sopt-pad);\n  overflow: hidden;\n}\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick #jspsych-html-button-response-btngroup .jspsych-btn {\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: var(--cell);\n  height: var(--cell);\n  min-width: 0;\n  min-height: 0;\n  margin: 0;\n  padding: 6px;\n  line-height: 1;\n}\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick #jspsych-html-button-response-btngroup .jspsych-btn svg,\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick #jspsych-html-button-response-btngroup .jspsych-btn img {\n  display: block;\n  width: 100%;\n  height: 100%;\n  object-fit: contain;\n}\n.jspsych-timelines-self-ordered-pointing .jspsych-timelines-self-ordered-pointing-item-text {\n  font-size: clamp(11px, calc(var(--cell, 70px) * 0.19), 18px);\n  overflow-wrap: anywhere;\n}\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick #jspsych-html-button-response-btngroup .jspsych-btn:disabled {\n  opacity: 0.35;\n}\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick.jspsych-timelines-self-ordered-pointing-free #jspsych-html-button-response-btngroup {\n  --cell: min( var(--sopt-max-item), calc((var(--sopt-stage-w) - 2 * var(--sopt-pad)) / var(--cols, 4) * 0.8), calc((var(--sopt-stage-h) - 2 * var(--sopt-pad)) / var(--rows, 3) * 0.8) );\n  display: block;\n}\n.jspsych-timelines-self-ordered-pointing.jspsych-timelines-self-ordered-pointing-pick.jspsych-timelines-self-ordered-pointing-free #jspsych-html-button-response-btngroup .jspsych-btn {\n  position: absolute;\n  left: calc(var(--sopt-pad) + var(--col) * ((100% - 2 * var(--sopt-pad)) / var(--cols, 4)) + var(--u) * ((100% - 2 * var(--sopt-pad)) / var(--cols, 4) - var(--cell)));\n  top: calc(var(--sopt-pad) + var(--row) * ((100% - 2 * var(--sopt-pad)) / var(--rows, 3)) + var(--v) * ((100% - 2 * var(--sopt-pad)) / var(--rows, 3) - var(--cell)));\n}\n@media (max-height: 520px) {\n  .jspsych-timelines-self-ordered-pointing {\n    --sopt-gap: 6px;\n    --sopt-pad: 6px;\n  }\n}\n");

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
    const walkthrough = test.instruction_format === "text" && test.instruction_demonstration === "interactive" ? INSTRUCTION_SET_SIZE : 0;
    checkPool(test, practice, walkthrough);
    const items = assignItems(
      buildPool(test.stimulus_set.items),
      test.stimulus_set.pool,
      walkthrough,
      test.practice_trials > 0 ? practice.set_sizes : [],
      test.set_sizes
    );
    return {
      jsPsych,
      text,
      user: options,
      practice,
      test,
      items,
      nouns: itemNouns(test.stimulus_set.items)
    };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
  var textItems = (ctx, o) => ({
    noun: ctx.nouns.singular,
    nouns: ctx.nouns.plural,
    verb: o.response_device === "touch" ? "tap" : "click"
  });
  var limitSeconds = (o) => typeof o.response_window_ms === "number" ? o.response_window_ms / 1e3 : null;
  function instructionArgs(ctx, o) {
    return __spreadProps(__spreadValues({}, textItems(ctx, o)), {
      position_rule: o.position_repeat_rule,
      position_max: o.position_repeat_max,
      limit_seconds: limitSeconds(o),
      timed: o.response_window_ms !== null,
      free_positions: o.stimulus_layout === "free_positions_in_area",
      partial_reshuffle: o.rearrangement_rule === "partial_reshuffle_each_page"
    });
  }
  function createDisplayTrial(a) {
    var _a, _b;
    return {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: renderScreen(a.stage, (_a = a.below) != null ? _a : ""),
      choices: "NO_KEYS",
      trial_duration: a.duration,
      data: baseData(__spreadValues({
        phase: a.phase,
        part: a.part,
        duration_ms: a.duration
      }, (_b = a.data) != null ? _b : {})),
      on_finish: (d) => {
        delete d.stimulus;
      }
    };
  }
  function textPage(ctx, html, phase, part, data = {}) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: textBlock(html),
      choices: [ctx.text.continue_button],
      data: baseData(__spreadValues({ phase, part }, data)),
      on_finish: (d) => {
        delete d.stimulus;
      }
    };
  }
  var newSeriesState = () => ({
    picked: /* @__PURE__ */ new Set(),
    slots: [],
    prev_item: null,
    prev_arrangement: null,
    errors: 0,
    last: null
  });
  function forbiddenSlot(o, state) {
    if (o.position_repeat_rule !== "enforced") return null;
    const m = o.position_repeat_max;
    if (state.slots.length < m) return null;
    const last = state.slots.slice(-m);
    return last.every((s) => s !== null && s === last[0]) ? last[0] : null;
  }
  function positionRun(slots, slot) {
    let run = 1;
    for (let i = slots.length - 1; i >= 0 && slots[i] === slot; i--) run++;
    return run;
  }
  function planPage(jsPsych, o, items, state) {
    const n = items.length;
    const arrangement = nextArrangement(
      jsPsych,
      n,
      o.rearrangement_rule,
      o.reshuffle_proportion,
      state.prev_arrangement
    );
    const disabled = forbiddenSlot(o, state);
    if (disabled !== null) {
      const open = arrangement.map((item, slot) => ({ item, slot })).filter((x) => !state.picked.has(x.item));
      if (open.length === 1 && open[0].slot === disabled) {
        const other = (disabled + 1) % n;
        [arrangement[disabled], arrangement[other]] = [arrangement[other], arrangement[disabled]];
      }
    }
    state.prev_arrangement = arrangement;
    return {
      arrangement,
      jitter: o.stimulus_layout === "free_positions_in_area" ? drawJitter(jsPsych, n) : void 0,
      disabled_slot: disabled
    };
  }
  function createPickTrial(a) {
    const { ctx, o, items, state } = a;
    const n = items.length;
    const { rows, cols } = gridDims(n);
    const free = o.stimulus_layout === "free_positions_in_area";
    let plan = null;
    const ensure = () => {
      if (!plan) plan = planPage(ctx.jsPsych, o, items, state);
      return plan;
    };
    const windowRec = { value: null };
    const aria = (slot) => ctx.text.item_button_label({ position: slot + 1 });
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS, PICK_CLASS, ...free ? [cls("free")] : []],
      stimulus: () => {
        ensure();
        return renderPickScreen(a.below ? a.below() : "");
      },
      choices: () => ensure().arrangement.map((i) => items[i].id),
      button_html: (_choice, slot) => {
        var _a;
        const p = ensure();
        return itemButtonHtml({
          item: items[p.arrangement[slot]],
          slot,
          n,
          aria_label: aria(slot),
          jitter: (_a = p.jitter) == null ? void 0 : _a[slot],
          disabled: p.disabled_slot === slot
        });
      },
      button_layout: "grid",
      grid_columns: cols,
      grid_rows: rows,
      trial_duration: () => {
        windowRec.value = o.response_window_ms === null ? null : sampleDuration(ctx.jsPsych, o.response_window_ms);
        return windowRec.value;
      },
      data: baseData(__spreadValues({
        phase: a.phase,
        part: a.part,
        set_size: n,
        stimulus_layout: o.stimulus_layout,
        rearrangement_rule: o.rearrangement_rule,
        response_device: o.response_device
      }, a.data)),
      on_load: () => {
        const g = document.getElementById("jspsych-html-button-response-btngroup");
        if (g) {
          g.style.setProperty("--cols", String(cols));
          g.style.setProperty("--rows", String(rows));
        }
      },
      // data-only simulation: a slot, from a participant with a memory that gets worse with set size
      simulation_options: () => {
        const p = ensure();
        const page = {
          arrangement: p.arrangement,
          picked: state.picked,
          disabled_slot: p.disabled_slot
        };
        return {
          data: {
            response: a.simulateCorrect ? simulateCorrectPick(ctx.jsPsych, page) : simulateMemoryPick(ctx.jsPsych, page)
          }
        };
      },
      on_finish: (d) => {
        var _a;
        const p = ensure();
        delete d.stimulus;
        const timeout = typeof d.rt !== "number";
        const slot = timeout ? null : d.response;
        const itemIndex = slot === null ? null : p.arrangement[slot];
        const item = itemIndex === null ? null : items[itemIndex];
        const repeat = itemIndex !== null && state.picked.has(itemIndex);
        const run = slot === null ? 0 : positionRun(state.slots, slot);
        const violation = slot !== null && o.position_repeat_rule !== "none" && run > o.position_repeat_max;
        const { row, col } = slot === null ? { row: null, col: null } : slotRowCol(slot, n);
        d.response = item ? item.id : null;
        if (timeout) d.rt = null;
        d.timeout = timeout;
        d.response_window = windowRec.value;
        d.chosen_item_id = item ? item.id : null;
        d.previous_item_id = state.prev_item;
        d.chosen_position = slot === null ? null : slot + 1;
        d.chosen_row = row;
        d.chosen_col = col;
        d.item_arrangement = p.arrangement.map((i) => items[i].id);
        if (p.jitter) d.item_offsets = p.jitter;
        d.disabled_position = p.disabled_slot === null ? null : p.disabled_slot + 1;
        d.n_picked_before = state.picked.size;
        d.is_repeat_error = repeat;
        d.correct = !timeout && !repeat;
        d.same_position_run = run;
        d.position_rule_violation = violation;
        const out = {
          timeout,
          repeat,
          correct: !timeout && !repeat,
          violation,
          item_id: item ? item.id : null,
          slot
        };
        if (itemIndex !== null && !repeat) state.picked.add(itemIndex);
        if (repeat) state.errors++;
        state.slots.push(slot);
        state.prev_item = item ? item.id : null;
        state.last = out;
        plan = null;
        (_a = a.onOutcome) == null ? void 0 : _a.call(a, d, out);
      }
    };
  }
  function createSeries(ctx, o, s) {
    const t = ctx.text;
    const state = newSeriesState();
    const phase = s.phase;
    const rowData = {
      block: s.block,
      trial_index_in_block: s.trial_index_in_block,
      series: s.series,
      set_size_trial: s.set_size_trial
    };
    const ti = textItems(ctx, o);
    const pages = [];
    for (let k = 0; k < s.set_size; k++) {
      const nodes = [];
      if (o.iti_ms !== 0) {
        const iti = sampleDuration(ctx.jsPsych, o.iti_ms);
        nodes.push(
          createDisplayTrial({
            phase,
            part: "iti",
            duration: iti,
            stage: "",
            data: __spreadProps(__spreadValues({}, rowData), { set_size: s.set_size, choice_index: k + 1, iti })
          })
        );
      }
      nodes.push(
        createPickTrial({
          ctx,
          o,
          items: s.items,
          state,
          phase,
          part: "response",
          data: __spreadProps(__spreadValues({}, rowData), { choice_index: k + 1 })
        })
      );
      if (o.trial_feedback === "accuracy") {
        const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
        nodes.push({
          timeline: [
            __spreadProps(__spreadValues({}, createDisplayTrial({
              phase,
              part: "feedback",
              duration: ms,
              stage: "",
              data: __spreadProps(__spreadValues({}, rowData), {
                set_size: s.set_size,
                choice_index: k + 1,
                feedback_kind: "accuracy",
                feedback_duration: ms
              })
            })), {
              stimulus: () => {
                var _a, _b;
                return renderScreen(
                  renderNotice(
                    `<strong>${((_a = state.last) == null ? void 0 : _a.repeat) ? t.feedback_repeat : t.feedback_new}</strong>`,
                    ((_b = state.last) == null ? void 0 : _b.repeat) ? "repeat" : "new"
                  )
                );
              },
              on_finish: (d) => {
                var _a, _b;
                delete d.stimulus;
                d.correct = (_b = (_a = state.last) == null ? void 0 : _a.correct) != null ? _b : null;
              }
            })
          ],
          conditional_function: () => state.last !== null && !state.last.timeout
        });
      }
      if (o.position_repeat_rule === "detect_and_remind") {
        nodes.push({
          timeline: [
            textPage(
              ctx,
              t.position_reminder({
                noun: ti.noun,
                nouns: ti.nouns,
                position_max: o.position_repeat_max
              }),
              phase,
              "reminder",
              __spreadProps(__spreadValues({}, rowData), { set_size: s.set_size, choice_index: k + 1 })
            )
          ],
          conditional_function: () => {
            var _a;
            return ((_a = state.last) == null ? void 0 : _a.violation) === true;
          }
        });
      }
      pages.push({ timeline: nodes });
    }
    return {
      timeline: [
        textPage(
          ctx,
          t.series_intro(__spreadProps(__spreadValues({}, ti), {
            phase,
            series: s.series,
            n_series: s.n_series,
            set_size: s.set_size
          })),
          phase,
          "transition",
          __spreadProps(__spreadValues({}, rowData), { set_size: s.set_size })
        ),
        ...pages
      ],
      on_timeline_start: () => {
        Object.assign(state, newSeriesState());
      }
    };
  }
  function planSeries(ctx, phase) {
    const o = phase === "test" ? ctx.test : ctx.practice;
    let blocks;
    if (phase === "test") {
      blocks = scheduleBlocks(ctx.jsPsych, o.set_sizes, o.trials_per_condition, o.block_order);
    } else {
      blocks = o.practice_trials > 0 ? [practiceSetSizes(ctx.jsPsych, o.set_sizes, o.practice_trials)] : [];
    }
    const total = blocks.reduce((a, b) => a + b.length, 0);
    const perSize = /* @__PURE__ */ new Map();
    const plans = [];
    let series = 0;
    blocks.forEach((sizes, b) => {
      sizes.forEach((size, i) => {
        var _a;
        series++;
        const k = ((_a = perSize.get(size)) != null ? _a : 0) + 1;
        perSize.set(size, k);
        const items = (phase === "test" ? ctx.items.test : ctx.items.practice).get(size);
        if (!items) throw new Error(`self-ordered-pointing: no items assigned to set size ${size}.`);
        plans.push({
          phase,
          block: b + 1,
          trial_index_in_block: i + 1,
          series,
          set_size: size,
          set_size_trial: k,
          n_series: total,
          items
        });
      });
    });
    return plans;
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const a = instructionArgs(ctx, o);
    const pages = [t.instruction_intro(a), t.instruction_rule(a)];
    if (o.position_repeat_rule !== "none") pages.push(t.instruction_position_rule(a));
    if (o.response_window_ms !== null) pages.push(t.instruction_time_limit(a));
    return {
      timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction"))
    };
  }
  var phaseIntroArgs = (ctx, o, plans, after) => __spreadProps(__spreadValues({}, textItems(ctx, o)), {
    n_series: plans.length,
    set_sizes: [...new Set(plans.map((p) => p.set_size))].sort((a, b) => a - b),
    feedback: o.trial_feedback === "accuracy",
    after_practice: after
  });
  function createPractice(ctx) {
    const o = ctx.practice;
    const plans = planSeries(ctx, "practice");
    if (plans.length === 0) return [];
    const nodes = [];
    if (ctx.test.instruction_format === "text")
      nodes.push(
        textPage(
          ctx,
          ctx.text.practice_intro(phaseIntroArgs(ctx, o, plans, false)),
          "instructions",
          "instruction"
        )
      );
    nodes.push(...plans.map((p) => createSeries(ctx, o, p)));
    return nodes;
  }
  function createTestIntro(ctx, plans = planSeries(ctx, "test")) {
    return textPage(
      ctx,
      ctx.text.test_intro(phaseIntroArgs(ctx, ctx.test, plans, ctx.test.practice_trials > 0)),
      "instructions",
      "instruction"
    );
  }
  function createTest(ctx, plans = planSeries(ctx, "test")) {
    var _a;
    const blocks = /* @__PURE__ */ new Map();
    for (const p of plans) blocks.set(p.block, [...(_a = blocks.get(p.block)) != null ? _a : [], p]);
    return [...blocks.values()].map((b) => ({
      timeline: b.map((p) => createSeries(ctx, ctx.test, p))
    }));
  }
  function createInstructionWalkthrough(ctx) {
    const o = ctx.test;
    if (o.instruction_format !== "text" || o.instruction_demonstration !== "interactive")
      return { timeline: [] };
    const t = ctx.text;
    const items = ctx.items.walkthrough;
    const state = newSeriesState();
    const wo = __spreadProps(__spreadValues({}, o), { response_window_ms: null, position_repeat_rule: "none" });
    const ti = textItems(ctx, o);
    const stepArgs = (step) => __spreadProps(__spreadValues({}, ti), {
      step,
      set_size: items.length,
      n_picked: state.picked.size,
      partial_reshuffle: o.rearrangement_rule === "partial_reshuffle_each_page"
    });
    const stepNames = ["first", "new", "last"];
    const nodes = [textPage(ctx, t.instruction_demo_intro(ti), "instructions", "instruction")];
    for (const step of stepNames) {
      const st = { attempt: 0, correct: null };
      const again = () => st.correct === false && st.attempt < INSTRUCTION_MAX_ATTEMPTS;
      const pick = createPickTrial({
        ctx,
        o: wo,
        items,
        state,
        phase: "instructions",
        part: "instruction_check",
        data: { condition: step },
        below: () => textBlock(t.instruction_step(stepArgs(step))),
        simulateCorrect: true,
        onOutcome: (d, out) => {
          st.attempt++;
          st.correct = out.correct;
          d.attempt = st.attempt;
        }
      });
      const confirm = createDisplayTrial({
        phase: "instructions",
        part: "instruction_feedback",
        duration: INSTRUCTION_CORRECT_MS,
        stage: renderNotice(`<strong>${t.instruction_correct}</strong>`),
        data: { condition: step, feedback_kind: "correct" }
      });
      const note = (stage, kind) => ({
        type: HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => renderScreen(stage()),
        choices: [t.continue_button],
        data: baseData({
          phase: "instructions",
          part: "instruction_feedback",
          condition: step,
          feedback_kind: kind
        }),
        on_finish: (d) => {
          delete d.stimulus;
        }
      });
      const reveal = note(() => {
        const left = items.findIndex((_, i) => !state.picked.has(i));
        return `<div class="${cls("reveal")}"><div class="${cls("demo-item")}">${renderItem(
        items[left]
      )}</div>` + renderNotice(t.instruction_reveal(stepArgs(step))) + `</div>`;
      }, "reveal");
      const revealOnFinish = reveal.on_finish;
      reveal.on_finish = (d) => {
        const left = items.findIndex((_, i) => !state.picked.has(i));
        if (left >= 0) {
          state.picked.add(left);
          d.revealed_item_id = items[left].id;
        }
        revealOnFinish(d);
      };
      nodes.push({
        timeline: [
          pick,
          { timeline: [confirm], conditional_function: () => st.correct === true },
          {
            timeline: [note(() => renderNotice(t.instruction_hint(stepArgs(step))), "hint")],
            conditional_function: again
          },
          {
            timeline: [reveal],
            conditional_function: () => st.correct === false && !again()
          }
        ],
        on_timeline_start: () => {
          st.attempt = 0;
          st.correct = null;
        },
        loop_function: again
      });
    }
    nodes.push(textPage(ctx, t.instruction_demo_done(ti), "instructions", "instruction"));
    return {
      timeline: nodes,
      on_timeline_start: () => {
        Object.assign(state, newSeriesState());
      }
    };
  }
  function createCompletion(ctx) {
    const o = ctx.test;
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        let body = "";
        if (o.end_of_task_feedback === "score") {
          const s = calculateScores(ctx.jsPsych.data.get());
          body = ctx.text.result_summary({
            total_errors: s.total_errors,
            n_series: s.n_series,
            by_set_size: s.errors_by_set_size.map((x) => ({
              set_size: x.set_size,
              errors: x.errors
            }))
          });
        }
        return textBlock(`<h2>${ctx.text.task_complete}</h2>${body}`);
      },
      choices: [ctx.text.continue_button],
      data: baseData({ phase: "completion", part: "completion" }),
      on_finish: (d) => {
        delete d.stimulus;
      }
    };
  }

  // src/index.ts
  function createTimeline(jsPsych, options = {}) {
    const ctx = createContext(jsPsych, options);
    const o = ctx.test;
    const timeline = [];
    if (o.instruction_format === "text") {
      timeline.push(createInstructions(ctx));
      if (o.instruction_demonstration === "interactive")
        timeline.push(createInstructionWalkthrough(ctx));
    }
    timeline.push(...createPractice(ctx));
    const plans = planSeries(ctx, "test");
    if (o.instruction_format === "text") timeline.push(createTestIntro(ctx, plans));
    timeline.push(...createTest(ctx, plans));
    timeline.push(createCompletion(ctx));
    return { timeline };
  }
  var timelineUnits = {
    createContext,
    createInstructions,
    createInstructionWalkthrough,
    createTestIntro,
    createPickTrial,
    createDisplayTrial,
    createSeries,
    planSeries,
    createPractice,
    createTest,
    createCompletion
  };
  var utils = {
    scoring: { calculateScores, getSummary },
    constants: {
      TASK_NAME,
      VERSION,
      TASK_CLASS,
      DEFAULT_OPTIONS,
      PHASE_OPTIONS,
      POOL_SIZE,
      MAX_SET_SIZE,
      INSTRUCTION_SET_SIZE,
      INSTRUCTION_MAX_ATTEMPTS,
      DEFAULT_RESHUFFLE_PROPORTION,
      DEFAULT_POSITION_REPEAT_MAX
    },
    text: { defaultText },
    stimuli: { buildPool, assignItems, gridDims, nextArrangement },
    sequence: { scheduleBlocks, practiceSetSizes },
    simulation: { recognitionProbability, simulateMemoryPick, simulateCorrectPick },
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map