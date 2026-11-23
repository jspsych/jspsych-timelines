var jsPsychTimelineGoNogo = (function (exports) {
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
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
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
  var version = "0.5.0";

  // src/constants.ts
  var TASK_NAME = "go-nogo";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-go-nogo";
  var STIMULUS_SIZE_PX = 100;
  var BASELINE_TRIALS = 16;
  var FIXED_SEQUENCE_SEED = 20240611;
  var DEADLINE_FALLBACK_MS = 1250;
  var DEADLINE_MIN_RTS = 5;
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_NOGO_WAIT_MS = 2500;
  var INSTRUCTION_CORRECT_MS = 900;
  var ACKNOWLEDGE_MS = 150;

  // src/deadlines.ts
  var deadlines_exports = {};
  __export(deadlines_exports, {
    meanPlusSd: () => meanPlusSd,
    percentile: () => percentile
  });

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

  // src/deadlines.ts
  function practiceRts(ctx) {
    if (ctx.phase === "practice") return [];
    return ctx.jsPsych.data.get().filter({
      task: TASK_NAME,
      phase: "practice",
      part: "response",
      condition: "go",
      correct: true
    }).select("rt").values.filter((x) => typeof x === "number");
  }
  function rule(label, compute, bounds) {
    const fn = (ctx) => {
      const rts = practiceRts(ctx);
      if (rts.length < DEADLINE_MIN_RTS) return DEADLINE_FALLBACK_MS;
      let v = compute(rts);
      if (bounds.min !== void 0) v = Math.max(bounds.min, v);
      if (bounds.max !== void 0) v = Math.min(bounds.max, v);
      return Math.round(v);
    };
    fn.label = label;
    return fn;
  }
  function meanPlusSd(k, bounds = {}) {
    return rule(
      `mean + ${k} SD of correct practice RTs`,
      (rts) => {
        const col = new DataCollection(rts.map((rt) => ({ rt }))).select("rt");
        return col.mean() + k * col.sd();
      },
      bounds
    );
  }
  function percentile(p, bounds = {}) {
    return rule(
      `${p}th percentile of correct practice RTs`,
      (rts) => {
        const sorted = [...rts].sort((a, b) => a - b);
        const pos = p / 100 * (sorted.length - 1);
        const lo = Math.floor(pos);
        const hi = Math.ceil(pos);
        return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
      },
      bounds
    );
  }

  // src/options.ts
  var PHASE_OPTIONS = [
    "trial_feedback",
    "feedback_condition",
    "feedback_duration_ms",
    "response_window_ms",
    "iti_ms",
    "stimulus_duration_ms",
    "trial_termination_rule",
    "inter_trial_display",
    "condition_proportions",
    "trial_order",
    "sequence_constraints"
  ];
  var DEFAULT_OPTIONS = {
    feedback_duration_ms: 1e3,
    iti_ms: 0,
    pre_block_countdown_ms: 0,
    response_window_ms: { min: 1e3, max: 1500 },
    stimulus_duration_ms: 750,
    trial_termination_rule: "fixed_duration",
    inter_trial_display: "blank",
    stimulus_layout: "center",
    stimulus_modality: "visual",
    stimulus_set: {
      go: [{ shape: "square", color: "blue" }],
      nogo: [{ shape: "square", color: "orange" }]
    },
    condition_proportions: { go: 0.9, nogo: 0.1 },
    n_blocks: 1,
    n_test_trials: 350,
    sequence_constraints: {},
    single_task_blocks: "none",
    stimulus_role_assignment: "random_per_participant",
    trial_order: "shuffled_list",
    response_device: "keyboard",
    response_keys: [" "],
    practice_trials: 10,
    block_feedback: "none",
    feedback_condition: "all",
    response_acknowledgement: "none",
    trial_feedback: "none",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    rule_reminder: "none",
    speed_accuracy_emphasis: "speed",
    practice: { trial_feedback: "accuracy", condition_proportions: { go: 0.5, nogo: 0.5 } }
  };
  var NOT_IMPLEMENTED = [
    [
      "trial_termination_rule",
      ["response_terminated"],
      "a no-go trial has no response to end it; use fixed_duration or response_or_timeout"
    ],
    [
      "stimulus_modality",
      ["auditory", "audiovisual", "tactile"],
      "only visual stimuli are implemented"
    ],
    [
      "response_device",
      ["microphone", "eye_tracker", "gamepad"],
      "only keyboard, mouse and touch are implemented"
    ],
    ["block_feedback", ["points"], "go/no-go has no points"],
    ["trial_feedback", ["points", "reward_outcome"], "go/no-go has no points or reward"],
    [
      "stimulus_role_assignment",
      ["counterbalanced", "rotated"],
      "counterbalanced needs an external participant counter (use random_per_participant); a reversal between blocks (rotated) is not implemented"
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
    ]
  ];
  function asList(x, fallback) {
    if (x === void 0) return fallback;
    return Array.isArray(x) ? x : [x];
  }
  var FORMS = ["shape", "text", "image", "svg"];
  var SHAPES = ["square", "circle", "triangle", "diamond", "cross"];
  function resolveItems(set) {
    let pictures = 0;
    const seen = /* @__PURE__ */ new Map();
    const one = (role, x, i) => {
      const where = `stimulus_set.${role}[${i}]`;
      if (typeof x === "string") x = { text: x };
      if (typeof x !== "object" || x === null || Array.isArray(x)) {
        throw new Error(
          `go-nogo: ${where} must be a string or an object with shape, text, image or svg.`
        );
      }
      const given = FORMS.filter((k) => x[k] !== void 0);
      if (given.length !== 1) {
        throw new Error(
          `go-nogo: ${where} needs exactly one of shape, text, image or svg${given.length ? ` (it has ${given.join(" and ")})` : ""}.`
        );
      }
      const form = given[0];
      const value = x[form];
      if (typeof value !== "string" || value === "") {
        throw new Error(`go-nogo: ${where}.${form} must be a non-empty string.`);
      }
      if (form === "shape" && !SHAPES.includes(value)) {
        throw new Error(`go-nogo: ${where}.shape "${value}" is not one of ${SHAPES.join(", ")}.`);
      }
      if ((form === "image" || form === "svg") && x.color !== void 0) {
        throw new Error(`go-nogo: ${where}: color applies to a shape or text, not to ${form}.`);
      }
      const color = x.color;
      if (form === "image" || form === "svg") pictures++;
      const named = x.id !== void 0;
      const id = named ? String(x.id) : form === "shape" ? [value, color].filter(Boolean).join("_") : form === "text" ? value : `picture-${pictures}`;
      const prev = seen.get(id);
      if (prev !== void 0) {
        throw new Error(
          prev !== role ? `go-nogo: stimulus_set: "${id}" is both a go and a no-go stimulus (ids must be unique).` : `go-nogo: stimulus_set.${role}: the id "${id}" is used twice (ids must be unique).`
        );
      }
      seen.set(id, role);
      return __spreadValues({ id, named, [form]: value }, color !== void 0 ? { color } : {});
    };
    return {
      go: set.go.map((x, i) => one("go", x, i)),
      nogo: set.nogo.map((x, i) => one("nogo", x, i))
    };
  }
  function resolveOptions(user = {}, phase = "test") {
    var _b, _c, _d, _e;
    const _a = user, { practice, text: _text } = _a, top = __objRest(_a, ["practice", "text"]);
    const topKeys = new Set(Object.keys(top).filter((k) => top[k] !== void 0));
    let layer = __spreadValues({}, top);
    if (phase === "practice") {
      delete layer.sequence_constraints;
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
    merged.stimulus_set = resolveItems({
      go: asList((_b = layer.stimulus_set) == null ? void 0 : _b.go, DEFAULT_OPTIONS.stimulus_set.go),
      nogo: asList((_c = layer.stimulus_set) == null ? void 0 : _c.nogo, DEFAULT_OPTIONS.stimulus_set.nogo)
    });
    const props = layer.condition_proportions;
    if (props !== void 0) {
      if (Array.isArray(props)) {
        throw new Error(
          "go-nogo: condition_proportions: a list of maps (one per block) is not implemented; give one map."
        );
      }
      const keys = Object.keys(props);
      const bad = keys.filter((k) => k !== "go" && k !== "nogo");
      if (bad.length) {
        throw new Error(
          `go-nogo: condition_proportions: unknown trial type ${bad.join(", ")} (use go and nogo).`
        );
      }
      if (Object.values(props).some((v) => v !== null && typeof v === "object")) {
        throw new Error("go-nogo: condition_proportions: crossed factors are not used by this task.");
      }
      merged.condition_proportions = { go: (_d = props.go) != null ? _d : 0, nogo: (_e = props.nogo) != null ? _e : 0 };
      if (keys.length === 1) {
        const given = keys[0];
        const p = props[given];
        if (p > 1)
          throw new Error("go-nogo: condition_proportions: a single proportion must be at most 1.");
        merged.condition_proportions = given === "go" ? { go: p, nogo: 1 - p } : { go: 1 - p, nogo: p };
      }
    }
    return merged;
  }
  function validateOptions(o) {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`go-nogo: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    if (o.inter_trial_display !== "blank" && o.inter_trial_display !== "fixation_cross") {
      throw new Error(
        `go-nogo: inter_trial_display: "${o.inter_trial_display}" is not implemented (use blank or fixation_cross).`
      );
    }
    if (!["center", "top_center", "random_2x2_grid"].includes(o.stimulus_layout)) {
      throw new Error(
        `go-nogo: stimulus_layout: "${o.stimulus_layout}" is not implemented (use center, top_center or random_2x2_grid).`
      );
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== 1) {
      throw new Error("go-nogo: response_keys must list exactly one key (the go response).");
    }
    if (!(o.n_blocks >= 1) || !Number.isInteger(o.n_blocks)) {
      throw new Error("go-nogo: n_blocks must be a positive integer.");
    }
    const { go, nogo } = o.condition_proportions;
    if (!(go >= 0) || !(nogo >= 0) || !(go + nogo > 0)) {
      throw new Error("go-nogo: condition_proportions must be non-negative and sum to more than 0.");
    }
    if (o.stimulus_set.go.length === 0 || o.stimulus_set.nogo.length === 0) {
      throw new Error("go-nogo: stimulus_set needs at least one go and one no-go stimulus.");
    }
    const w = o.response_window_ms;
    const termination = o.trial_termination_rule;
    if (w === null) {
      if (termination === "fixed_duration") {
        throw new Error(
          'go-nogo: response_window_ms is null but trial_termination_rule is "fixed_duration": the trial would never end.'
        );
      }
      if (nogo > 0) {
        throw new Error(
          "go-nogo: response_window_ms is null but condition_proportions has no-go trials: a no-go trial would never end."
        );
      }
    }
    if (o.stimulus_duration_ms !== null && o.stimulus_duration_ms !== void 0) {
      if (!(o.stimulus_duration_ms > 0)) {
        throw new Error("go-nogo: stimulus_duration_ms must be positive or null.");
      }
      const shortest = typeof w === "number" ? w : w && typeof w === "object" && "min" in w ? w.min : null;
      if (shortest !== null && o.stimulus_duration_ms > shortest) {
        throw new Error(
          `go-nogo: stimulus_duration_ms (${o.stimulus_duration_ms}) is longer than the response window (${shortest}); the trial would end first.`
        );
      }
    }
  }
  var SEQUENCE_KEYS = [
    "max_run",
    "min_gap",
    "max_gap",
    "run_length",
    "start_with",
    "no_immediate_repeat",
    "balanced_transitions",
    "cycle_length"
  ];

  // ../../node_modules/simple-statistics/dist/simple-statistics.mjs
  var epsilon = 1e-4;
  function inverseErrorFunction(x) {
    var a = 8 * (Math.PI - 3) / (3 * Math.PI * (4 - Math.PI));
    var inv = Math.sqrt(
      Math.sqrt(
        Math.pow(2 / (Math.PI * a) + Math.log(1 - x * x) / 2, 2) - Math.log(1 - x * x) / a
      ) - (2 / (Math.PI * a) + Math.log(1 - x * x) / 2)
    );
    if (x >= 0) {
      return inv;
    } else {
      return -inv;
    }
  }
  function probit(p) {
    if (p === 0) {
      p = epsilon;
    } else if (p >= 1) {
      p = 1 - epsilon;
    }
    return Math.sqrt(2) * inverseErrorFunction(2 * p - 1);
  }

  // src/scoring.ts
  function adjust(rate, n) {
    if (rate <= 0) return 1 / (2 * n);
    if (rate >= 1) return 1 - 1 / (2 * n);
    return rate;
  }
  function calculateScores(data) {
    const test = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
    const go = test.filter({ condition: "go" });
    const nogo = test.filter({ condition: "nogo" });
    const baseline = test.filter({ condition: "go_control" });
    const meanOrNull = (col) => col.count() > 0 ? col.select("rt").mean() : null;
    const rates = (g2, n2) => {
      const hits = g2.filter({ responded: true });
      const commissions = n2.filter({ responded: true });
      return {
        hits,
        commissions,
        commission_error_rate: n2.count() > 0 ? commissions.count() / n2.count() : null,
        omission_error_rate: g2.count() > 0 ? (g2.count() - hits.count()) / g2.count() : null,
        mean_correct_go_rt: meanOrNull(hits)
      };
    };
    const r = rates(go, nogo);
    const nGo = go.count();
    const nNogo = nogo.count();
    const hitRate = nGo > 0 ? r.hits.count() / nGo : null;
    const faRate = nNogo > 0 ? r.commissions.count() / nNogo : null;
    let dPrime = null;
    let criterion = null;
    if (hitRate !== null && faRate !== null) {
      const zh = probit(adjust(hitRate, nGo));
      const zf = probit(adjust(faRate, nNogo));
      dPrime = zh - zf;
      criterion = -(zh + zf) / 2;
    }
    const n = nGo + nNogo;
    const baselineResponded = baseline.filter({ responded: true });
    const blocks = Array.from(
      new Set(
        test.filterCustom((t) => t.condition === "go" || t.condition === "nogo").select("block").values.filter((b) => typeof b === "number")
      )
    ).sort((a, b) => a - b);
    return {
      n_trials: n,
      n_go: nGo,
      n_nogo: nNogo,
      hits: r.hits.count(),
      omissions: nGo - r.hits.count(),
      commissions: r.commissions.count(),
      correct_rejections: nNogo - r.commissions.count(),
      commission_error_rate: r.commission_error_rate,
      omission_error_rate: r.omission_error_rate,
      nogo_accuracy: r.commission_error_rate === null ? null : 1 - r.commission_error_rate,
      accuracy: n > 0 ? (r.hits.count() + nNogo - r.commissions.count()) / n : null,
      mean_correct_go_rt: r.mean_correct_go_rt,
      go_rt_sd: r.hits.count() > 1 ? r.hits.select("rt").sd() : null,
      false_alarm_rt: meanOrNull(r.commissions),
      d_prime: dPrime,
      criterion_c: criterion,
      d_prime_correction: "macmillan_kaplan",
      baseline_n_trials: baseline.count(),
      baseline_mean_rt: meanOrNull(baselineResponded),
      by_block: blocks.map((block) => {
        const b = rates(go.filter({ block }), nogo.filter({ block }));
        return {
          block,
          n_trials: go.filter({ block }).count() + nogo.filter({ block }).count(),
          commission_error_rate: b.commission_error_rate,
          omission_error_rate: b.omission_error_rate,
          mean_correct_go_rt: b.mean_correct_go_rt
        };
      })
    };
  }
  function getSummary(data) {
    return __spreadProps(__spreadValues({}, calculateScores(data)), { task: TASK_NAME, version: VERSION });
  }

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
  function matcher(rule2, key, values) {
    if (values === void 0)
      throw new TypeError(
        `${rule2}(): \`values\` is required: the key values to count, e.g. { key: isTarget, values: [true] }.`
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

  // src/stimuli.ts
  var SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;
  function checkColor(color) {
    if (!SAFE_COLOR.test(color))
      throw new Error(`go-nogo: unsupported colour "${color}" in stimulus_set.`);
    return color;
  }
  var escapeHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function stimulusId(item) {
    return item.id;
  }
  function stimulusName(item, text) {
    if (item.named) return item.id;
    if (item.text !== void 0) return item.text;
    if (item.shape !== void 0) {
      const shape = text.shape_names[item.shape];
      return item.color ? text.stimulus_name({ color: item.color, shape }) : shape;
    }
    return text.picture_name;
  }
  function namesOf(items, text) {
    return items.map((i) => stimulusName(i, text)).join(` ${text.list_or} `);
  }
  var isResolved = (x) => typeof x === "object" && x !== null && "named" in x;
  function renderItem(given, size) {
    var _a, _b;
    const item = isResolved(given) ? given : resolveItems({ go: [given], nogo: [] }).go[0];
    if (item.image !== void 0) {
      return `<img class="jspsych-timelines-go-nogo-picture" src="${escapeHtml(
      item.image
    )}" alt="${escapeHtml(item.id)}" style="width:${size}px;height:${size}px">`;
    }
    if (item.svg !== void 0) {
      return `<span class="jspsych-timelines-go-nogo-picture" role="img" aria-label="${escapeHtml(
      item.id
    )}" style="width:${size}px;height:${size}px">${item.svg}</span>`;
    }
    const color = checkColor((_a = item.color) != null ? _a : "currentColor");
    if (item.text !== void 0) {
      return `<span class="jspsych-timelines-go-nogo-letter" style="font-size:${Math.round(
      size * 0.7
    )}px;color:${color}">${escapeHtml(item.text)}</span>`;
    }
    const shape = (_b = item.shape) != null ? _b : "square";
    let inner;
    switch (shape) {
      case "square":
        inner = `<rect x="6" y="6" width="36" height="36" fill="${color}"/>`;
        break;
      case "circle":
        inner = `<circle cx="24" cy="24" r="19" fill="${color}"/>`;
        break;
      case "triangle":
        inner = `<path d="M24 5 44 41H4Z" fill="${color}"/>`;
        break;
      case "diamond":
        inner = `<path d="M24 4 44 24 24 44 4 24Z" fill="${color}"/>`;
        break;
      case "cross":
        inner = `<path d="M10 10 38 38M38 10 10 38" stroke="${color}" stroke-width="5" fill="none"/>`;
        break;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="${escapeHtml(
    item.id
  )}">${inner}</svg>`;
  }
  var GRID_CELLS = ["top_left", "top_right", "bottom_left", "bottom_right"];
  function locationsOf(layout) {
    return layout === "random_2x2_grid" ? GRID_CELLS : [layout === "top_center" ? "top_center" : "center"];
  }
  function renderScreen(stage, below = "") {
    const region = below ? `<div class="jspsych-timelines-go-nogo-below">${below}</div>` : "";
    return `<div class="jspsych-timelines-go-nogo-screen">${stage}${region}</div>`;
  }
  function renderStimulusScreen(itemHtml2, location, below = "", ackClass = "") {
    const grid = location !== "center" && location !== "top_center";
    const body = grid ? GRID_CELLS.map(
      (c) => `<div class="jspsych-timelines-go-nogo-cell">${c === location ? `<div class="jspsych-timelines-go-nogo-item ${ackClass}">${itemHtml2}</div>` : ""}</div>`
    ).join("") : `<div class="jspsych-timelines-go-nogo-item ${ackClass}">${itemHtml2}</div>`;
    const stage = `<div class="jspsych-timelines-go-nogo-stage" data-location="${location}"><div class="jspsych-timelines-go-nogo-field ${grid ? "grid" : ""}" data-location="${location}">${body}</div></div>`;
    return renderScreen(stage, below);
  }
  function renderStage(inner, below = "") {
    const stage = `<div class="jspsych-timelines-go-nogo-stage"><div class="jspsych-timelines-go-nogo-center">${inner}</div></div>`;
    return renderScreen(stage, below);
  }
  function backgroundFixation(cross) {
    return `<div class="jspsych-timelines-go-nogo-bgfix">${cross}</div>`;
  }

  // src/sequence.ts
  var TRIAL_FIELDS = ["condition", "stimulus", "stimulus_location"];
  var sequencerRng = (jsPsych) => () => jsPsych.randomization.randomInt(0, __pow(2, 30) - 1) / __pow(2, 30);
  function fixedRng(seed = FIXED_SEQUENCE_SEED) {
    let a = seed >>> 0;
    return () => {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function expandDuration(d) {
    if (typeof d === "number") return [d];
    const step = d.step && d.step > 0 ? d.step : 1;
    const out = [];
    for (let v = d.min; v <= d.max + 1e-9; v += step) out.push(v);
    return out;
  }
  var CONDITIONS = ["go", "nogo"];
  function recordOf(rule2, v, check, what) {
    if (v === null || typeof v !== "object" || Array.isArray(v)) {
      throw new Error(
        `go-nogo: sequence_constraints.${rule2} must be a map from trial type to ${what}.`
      );
    }
    for (const [k, x] of Object.entries(v)) {
      if (!CONDITIONS.includes(k)) {
        throw new Error(
          `go-nogo: sequence_constraints.${rule2}: unknown trial type "${k}" (use go or nogo).`
        );
      }
      if (!check(x)) throw new Error(`go-nogo: sequence_constraints.${rule2}.${k} must be ${what}.`);
    }
    return v;
  }
  var isCount = (x) => typeof x === "number" && Number.isInteger(x) && x >= 0;
  function toConstraints(sc) {
    const rules = [];
    let start = null;
    let cycle = null;
    if (!sc) return { rules, start, cycle_length: cycle };
    const unknown = Object.keys(sc).filter((k) => !SEQUENCE_KEYS.includes(k));
    if (unknown.length) {
      throw new Error(
        `go-nogo: sequence_constraints: unknown rule ${unknown.join(
        ", "
      )} (rules: ${SEQUENCE_KEYS.join(", ")}).`
      );
    }
    const key = "condition";
    if (sc.max_run !== void 0) {
      if (typeof sc.max_run === "number") {
        if (!(sc.max_run >= 1))
          throw new Error("go-nogo: sequence_constraints.max_run must be at least 1.");
        rules.push(maxRun({ key, max: sc.max_run }));
      } else {
        const m = recordOf(
          "max_run",
          sc.max_run,
          (x) => typeof x === "number" && x >= 1,
          "a number of at least 1"
        );
        for (const [c, n] of Object.entries(m)) rules.push(maxRun({ key, values: [c], max: n }));
      }
    }
    if (sc.min_gap !== void 0) {
      const m = recordOf("min_gap", sc.min_gap, isCount, "a whole number");
      for (const [c, n] of Object.entries(m)) rules.push(minGap({ key, values: [c], gap: n }));
    }
    if (sc.max_gap !== void 0) {
      const m = recordOf("max_gap", sc.max_gap, isCount, "a whole number");
      for (const [c, n] of Object.entries(m)) rules.push(maxGap({ key, values: [c], gap: n }));
    }
    if (sc.run_length !== void 0) {
      const m = recordOf(
        "run_length",
        sc.run_length,
        (x) => Array.isArray(x) && x.length > 0 && x.every((n) => Number.isInteger(n) && n >= 1),
        "a list of run lengths"
      );
      for (const [c, a] of Object.entries(m)) rules.push(runLength({ key, values: [c], allowed: a }));
    }
    if (sc.start_with !== void 0) {
      const m = recordOf(
        "start_with",
        sc.start_with,
        (x) => isCount(x) && x >= 1,
        "a whole number"
      );
      const entries = Object.entries(m);
      if (entries.length !== 1) {
        throw new Error("go-nogo: sequence_constraints.start_with names one trial type.");
      }
      start = startWith({ key, values: [entries[0][0]], count: entries[0][1] });
    }
    if (sc.no_immediate_repeat !== void 0) {
      const v = sc.no_immediate_repeat;
      if (v === true) rules.push(noRepeat({ key }));
      else if (Array.isArray(v)) {
        for (const f of v) {
          if (!TRIAL_FIELDS.includes(f)) {
            throw new Error(
              `go-nogo: sequence_constraints.no_immediate_repeat: unknown trial field "${f}" (fields: ${TRIAL_FIELDS.join(
              ", "
            )}).`
            );
          }
          rules.push(noRepeat({ key: f }));
        }
      } else if (v !== false) {
        throw new Error(
          "go-nogo: sequence_constraints.no_immediate_repeat must be true or a list of trial fields."
        );
      }
    }
    if (sc.balanced_transitions !== void 0 && sc.balanced_transitions !== false) {
      rules.push(balancedTransitions({ key }));
    }
    if (sc.cycle_length !== void 0) {
      if (!(Number.isInteger(sc.cycle_length) && sc.cycle_length >= 2)) {
        throw new Error(
          "go-nogo: sequence_constraints.cycle_length must be a whole number of at least 2."
        );
      }
      cycle = sc.cycle_length;
    }
    return { rules, start, cycle_length: cycle };
  }
  var Deck = class {
    constructor(base, shuffle) {
      this.base = base;
      this.shuffle = shuffle;
      this.i = 0;
      this.list = shuffle([...base]);
    }
    next() {
      if (this.i >= this.list.length) {
        this.list = this.shuffle([...this.base]);
        this.i = 0;
      }
      return this.list[this.i++];
    }
  };
  function combosOf(cond, items, locations) {
    const out = [];
    for (const item of items)
      for (const loc of locations)
        out.push({ condition: cond, item, stimulus: stimulusId(item), stimulus_location: loc });
    return out;
  }
  function spread(counts, n) {
    const placed = counts.map(() => 0);
    const out = [];
    for (let i = 0; i < n; i++) {
      let best = -1;
      let bestScore = -Infinity;
      counts.forEach((c, k) => {
        if (placed[k] >= c) return;
        const score2 = (i + 0.5) * c / n - placed[k];
        if (score2 > bestScore + 1e-12) {
          best = k;
          bestScore = score2;
        }
      });
      placed[best]++;
      out.push(best);
    }
    return out;
  }
  function buildBlocks(ctx, sizes, constraints) {
    var _a;
    const { jsPsych, o } = ctx;
    const R = jsPsych.randomization;
    const set = (_a = ctx.stimulus_set) != null ? _a : o.stimulus_set;
    const locations = locationsOf(o.stimulus_layout);
    const order = o.trial_order;
    const present = CONDITIONS.filter((c) => o.condition_proportions[c] > 0);
    const weights = present.map((c) => o.condition_proportions[c]);
    const { rules, start, cycle_length } = toConstraints(constraints);
    const constrained = rules.length > 0 || start !== null || cycle_length !== null;
    if (cycle_length !== null && order === "random") {
      throw new Error(
        'go-nogo: sequence_constraints.cycle_length needs exact proportions, but trial_order is "random" (independent draws).'
      );
    }
    const shuffle = (x) => order === "fixed_sequence" ? x : R.shuffle(x);
    const pools = new Map(
      present.map((c) => [c, combosOf(c, set[c], locations)])
    );
    const poolFor = (c) => pools.get(c);
    const chunks = [];
    sizes.forEach((n, b) => {
      const decks = new Map(present.map((c) => [c, new Deck(poolFor(c), shuffle)]));
      const parts = cycle_length ? chunkSizes(n, cycle_length) : [n];
      parts.forEach((m, k) => {
        if (order === "random") {
          const pool = [];
          const w = [];
          present.forEach((c, i) => {
            const list2 = poolFor(c);
            list2.forEach((t) => {
              pool.push(t);
              w.push(weights[i] / list2.length);
            });
          });
          const source = {
            n: m,
            draw: () => R.sampleWithReplacement(pool, 1, w)[0]
          };
          chunks.push({ block: b, first: k === 0, source });
          return;
        }
        const counts = allocate(weights, m);
        const list = [];
        if (order === "fixed_sequence" && !constrained) {
          for (const i of spread(counts, m)) list.push(decks.get(present[i]).next());
        } else {
          present.forEach((c, i) => {
            for (let j = 0; j < counts[i]; j++) list.push(decks.get(c).next());
          });
        }
        chunks.push({ block: b, first: k === 0, source: list });
      });
    });
    const rng = order === "fixed_sequence" ? fixedRng() : sequencerRng(jsPsych);
    const rulesFor = (i) => start && chunks[i].first ? [...rules, start] : rules;
    let ordered;
    if (!constrained) {
      ordered = chunks.map(
        (c) => Array.isArray(c.source) ? order === "fixed_sequence" ? c.source : R.shuffle(c.source) : sampleAll(c.source)
      );
    } else {
      try {
        ordered = sequenceBlocks(
          chunks.map((c) => c.source),
          rulesFor,
          { rng }
        );
      } catch (e) {
        if (e instanceof SequenceError) {
          throw new Error(
            `go-nogo: sequence_constraints cannot be satisfied for ${sizes.join(
            "+"
          )} trials with proportions ${JSON.stringify(o.condition_proportions)}: ${e.message}`
          );
        }
        throw e;
      }
    }
    const blocks = sizes.map(() => []);
    chunks.forEach((c, i) => blocks[c.block].push(...ordered[i]));
    return blocks;
  }
  function sampleAll(s) {
    return Array.from({ length: s.n }, () => s.draw());
  }
  function chunkSizes(n, size) {
    const out = [];
    for (let left = n; left > 0; left -= size) out.push(Math.min(size, left));
    return out;
  }
  function buildBaselineBlock(ctx) {
    var _a;
    const { jsPsych, o } = ctx;
    const set = (_a = ctx.stimulus_set) != null ? _a : o.stimulus_set;
    const locations = locationsOf(o.stimulus_layout);
    const deck = new Deck(
      combosOf("go_control", set.go, locations),
      (x) => jsPsych.randomization.shuffle(x)
    );
    return Array.from({ length: BASELINE_TRIALS }, () => deck.next());
  }
  function sampleDuration(jsPsych, d) {
    const values = expandDuration(d);
    return values.length === 1 ? values[0] : jsPsych.randomization.sampleWithReplacement(values, 1)[0];
  }

  // src/text.ts
  var act = (device) => device === "keyboard" ? "press" : device === "touch" ? "tap" : "click";
  var defaultText = {
    instruction_intro: (r) => `<h2>Go/No-go Task</h2>
    <p>On each trial one shape will appear on the screen.</p>
    <p>When you see ${r.go_stimuli} (${r.go_names}), <strong>respond</strong>.</p>
    <p>When you see ${r.nogo_stimuli} (${r.nogo_names}), <strong>do not respond</strong>.</p>`,
    instruction_response: (r) => `<h2>How to Respond</h2><p>To respond, ${act(r.device)} <strong>${r.response}</strong>.</p>
    <p>If you should not respond, simply wait until the next shape.</p>`,
    instruction_demo_intro: `<h2>Let's Try It</h2>
    <p>Here are the shapes you will see. Respond to each one as you would in the task.</p>
    <p>There is no time limit when you should respond. If you respond incorrectly, you will get a hint and try again.</p>`,
    instruction_examples_intro: `<h2>Examples</h2>
    <p>Here are the shapes you will see, with the correct response for each.</p>`,
    instruction_step: (r) => r.condition === "go" ? `<p>This is the ${r.stimulus_name}. Respond: ${act(r.device)} <strong>${r.response}</strong>.</p>` : `<p>This is the ${r.stimulus_name}. Do <strong>not</strong> respond. Just wait.</p>`,
    instruction_hint: (r) => r.condition === "go" ? `<p>Not quite. The ${r.stimulus_name} means respond: ${act(r.device)} <strong>${r.response}</strong>.</p><p>Let's try again.</p>` : `<p>The ${r.stimulus_name} means do <strong>not</strong> respond. Wait until it disappears.</p><p>Let's try again.</p>`,
    instruction_reveal: (r) => r.condition === "go" ? `<p>For the ${r.stimulus_name}, ${act(r.device)} <strong>${r.response}</strong>. Let's move on.</p>` : `<p>With the ${r.stimulus_name}, do not respond at all. Let's move on.</p>`,
    instruction_correct: "Correct!",
    emphasis_speed: "Respond as quickly as you can.",
    emphasis_accuracy: "Try to be as accurate as you can.",
    emphasis_both: "Respond as quickly and as accurately as you can.",
    rule_reminder: (r) => `${act(r.device) === "press" ? "Press" : act(r.device) === "tap" ? "Tap" : "Click"} ${r.response} for ${r.go_names}. Do not respond to ${r.nogo_names}.`,
    instruction_practice_intro: `<h2>Practice</h2><p>Now some practice at the pace of the real task. The main task starts after the practice.</p>`,
    instruction_test_intro: `<h2>Main Task</h2><p>Now the main task begins.</p>`,
    instruction_baseline_intro: `<h2>Go-only Block</h2><p>In this block every shape is a go shape: respond to each one.</p>`,
    shape_names: {
      square: "square",
      circle: "circle",
      triangle: "triangle",
      diamond: "diamond",
      cross: "cross"
    },
    list_or: "or",
    stimulus_name: (r) => `${r.color} ${r.shape}`,
    picture_name: "picture",
    go_button: "Respond",
    continue_button: "Continue",
    correct_feedback: "Correct",
    incorrect_feedback: "Incorrect",
    timeout_feedback: "Too slow!",
    feedback_rt: (r) => `${Math.round(r.rt)} ms`,
    feedback_correct_nogo: "Do not respond to this one",
    feedback_correct_go: (r) => `Respond with ${r.response}`,
    fixation: "+",
    countdown: () => "Get ready...",
    block_feedback: (r) => {
      const parts = [`Block ${r.block} of ${r.n_blocks} complete.`];
      if ((r.kind === "accuracy" || r.kind === "accuracy_rt") && r.accuracy !== null) {
        parts.push(`Accuracy: ${Math.round(r.accuracy * 100)}%`);
      }
      if ((r.kind === "rt" || r.kind === "accuracy_rt") && r.mean_rt !== null) {
        parts.push(`Mean response time: ${Math.round(r.mean_rt)} ms`);
      }
      return parts.map((p) => `<p>${p}</p>`).join("");
    },
    task_complete: "Task Complete",
    result_summary: (r) => {
      let html = "";
      if (r.commission_error_rate !== null)
        html += `<p><strong>Responses to no-go shapes:</strong> ${(r.commission_error_rate * 100).toFixed(1)}%</p>`;
      if (r.omission_error_rate !== null)
        html += `<p><strong>Missed go shapes:</strong> ${(r.omission_error_rate * 100).toFixed(
        1
      )}%</p>`;
      if (r.mean_correct_go_rt !== null)
        html += `<p><strong>Mean response time:</strong> ${r.mean_correct_go_rt.toFixed(0)} ms</p>`;
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
  styleInject('.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-text h2 {\n  text-align: center;\n}\n.jspsych-timelines-go-nogo {\n  --go-nogo-stage-h: min(280px, 40vh);\n  --go-nogo-btn-reserve: 76px;\n}\n.jspsych-timelines-go-nogo:has(.jspsych-timelines-go-nogo-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-screen {\n  display: contents;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 640px;\n  max-width: calc(100vw - 16px);\n  height: var(--go-nogo-stage-h);\n  padding: 20px;\n  overflow: hidden;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-below {\n  position: absolute;\n  top: calc(50% + var(--go-nogo-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-below .jspsych-timelines-go-nogo-text {\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-go-nogo:has(#jspsych-html-button-response-btngroup) .jspsych-timelines-go-nogo-below {\n  bottom: var(--go-nogo-btn-reserve);\n}\n.jspsych-timelines-go-nogo:has(.jspsych-timelines-go-nogo-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-field {\n  position: relative;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n  height: 100%;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-field[data-location=top_center] {\n  align-items: flex-start;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-field.grid {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  grid-template-rows: 1fr 1fr;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-cell {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-item {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  line-height: 1;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-item svg {\n  display: block;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-item.acknowledge-highlight {\n  outline: 4px solid red;\n  outline-offset: 6px;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-item.acknowledge-mark::after {\n  content: "\\2713";\n  position: absolute;\n  bottom: 4px;\n  left: 50%;\n  transform: translateX(-50%);\n  font-size: 1.4em;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-picture {\n  display: block;\n  object-fit: contain;\n}\n.jspsych-timelines-go-nogo span.jspsych-timelines-go-nogo-picture > svg {\n  width: 100%;\n  height: 100%;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-letter {\n  font-family: monospace;\n  font-weight: bold;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-inline {\n  display: inline-block;\n  vertical-align: middle;\n  margin: 0 4px;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  min-height: 80px;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-fixation {\n  font-size: 3em;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-bgfix {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  visibility: hidden;\n}\n.jspsych-timelines-go-nogo:has([id$=-stimulus][style*=hidden]) .jspsych-timelines-go-nogo-bgfix {\n  visibility: visible;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-feedback {\n  font-size: 1em;\n}\n.jspsych-timelines-go-nogo .jspsych-timelines-go-nogo-feedback.incorrect {\n  font-weight: bold;\n}\n');

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
    validateOptions(test);
    validateOptions(practice);
    let stimulus_set = test.stimulus_set;
    if (test.stimulus_role_assignment === "random_per_participant") {
      if (jsPsych.randomization.randomInt(0, 1) === 1) {
        stimulus_set = { go: test.stimulus_set.nogo, nogo: test.stimulus_set.go };
      }
    }
    return { jsPsych, text, user: options, practice, test, stimulus_set, state: { last: null } };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
  var isKeyboard = (o) => o.response_device === "keyboard";
  var deviceOf = (o) => o.response_device;
  var KEY_NAMES = {
    " ": "the space bar",
    ArrowLeft: "the left arrow",
    ArrowRight: "the right arrow",
    ArrowUp: "the up arrow",
    ArrowDown: "the down arrow",
    Enter: "Enter"
  };
  function keyName2(key) {
    var _a;
    return (_a = KEY_NAMES[key]) != null ? _a : key.length === 1 ? key.toUpperCase() : key;
  }
  function responseLabel(ctx, o) {
    return isKeyboard(o) ? `<kbd>${keyName2(o.response_keys[0])}</kbd>` : ctx.text.go_button;
  }
  function itemHtml(item, size = STIMULUS_SIZE_PX) {
    return renderItem(item, size);
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
        var _a2;
        delete d.stimulus;
        if (((_a2 = a.data) == null ? void 0 : _a2.stimulus) !== void 0) d.stimulus = a.data.stimulus;
      }
    };
  }
  function createIti(ctx, o, phase, block) {
    const ms = sampleDuration(ctx.jsPsych, o.iti_ms);
    const cross = `<span class="jspsych-timelines-go-nogo-fixation">${ctx.text.fixation}</span>`;
    return createDisplayTrial({
      phase,
      part: "iti",
      block,
      duration: ms,
      stimulus: renderStage(o.inter_trial_display === "fixation_cross" ? cross : ""),
      data: { iti: ms }
    });
  }
  function createCountdown(ctx, o, phase, block) {
    return createDisplayTrial({
      phase,
      part: "transition",
      block,
      duration: o.pre_block_countdown_ms,
      stimulus: renderStage(
        `<div class="jspsych-timelines-go-nogo-feedback">${ctx.text.countdown({
        phase,
        block
      })}</div>`
      ),
      data: { transition: "countdown" }
    });
  }
  var hasResponse = (d) => (typeof d.response === "string" || typeof d.response === "number") && typeof d.rt === "number";
  function windowOf(ctx, o, phase, block, trialInBlock) {
    var _a;
    const w = o.response_window_ms;
    const state = { value: null, rule: null };
    if (typeof w === "function") {
      state.rule = (_a = w.label) != null ? _a : "function";
      const trial_duration = () => {
        const ctxArg = {
          jsPsych: ctx.jsPsych,
          phase,
          block,
          trial_index_in_block: trialInBlock
        };
        state.value = w(ctxArg);
        return state.value;
      };
      return { state, trial_duration };
    }
    state.value = w === null ? null : sampleDuration(ctx.jsPsych, w);
    return { state, trial_duration: state.value };
  }
  function acknowledge(o, keyboard) {
    let cleanup = null;
    return {
      on_load: () => {
        var _a;
        cleanup = null;
        if (o.response_acknowledgement === "none" || typeof document === "undefined") return;
        const mark = () => {
          const el = document.querySelector(".jspsych-timelines-go-nogo-item");
          if (!el) return;
          const cls = o.response_acknowledgement === "highlight" ? "acknowledge-highlight" : "acknowledge-mark";
          el.classList.add(cls);
          setTimeout(() => el.classList.remove(cls), ACKNOWLEDGE_MS);
        };
        if (keyboard) {
          const key = o.response_keys[0].toLowerCase();
          const onKey = (e) => {
            if (e.key.toLowerCase() === key) {
              mark();
              document.removeEventListener("keydown", onKey);
            }
          };
          document.addEventListener("keydown", onKey);
          cleanup = () => document.removeEventListener("keydown", onKey);
        } else {
          (_a = document.querySelector("#jspsych-html-button-response-btngroup")) == null ? void 0 : _a.addEventListener("click", mark, { once: true });
        }
      },
      cleanup: () => cleanup == null ? void 0 : cleanup()
    };
  }
  function ruleReminder(ctx, o) {
    if (o.rule_reminder !== "on_screen") return "";
    const t = ctx.text;
    return t.rule_reminder({
      go_names: namesOf(ctx.stimulus_set.go, t),
      nogo_names: namesOf(ctx.stimulus_set.nogo, t),
      response: isKeyboard(o) ? keyName2(o.response_keys[0]) : t.go_button,
      device: deviceOf(o)
    });
  }
  function createResponseTrial(ctx, o, spec, phase, block, trialInBlock, extra = {}) {
    const keyboard = isKeyboard(o);
    const nogo = spec.condition === "nogo";
    const correctResponse = nogo ? null : keyboard ? o.response_keys[0] : 0;
    const { state, trial_duration } = windowOf(ctx, o, phase, block != null ? block : 0, trialInBlock);
    const data = baseData(__spreadValues({
      phase,
      part: "response",
      block,
      trial_index_in_block: trialInBlock,
      condition: spec.condition,
      stimulus: spec.stimulus,
      stimulus_location: spec.stimulus_location,
      correct_response: correctResponse,
      stimulus_duration: o.stimulus_duration_ms,
      trial_termination: o.trial_termination_rule,
      response_device: o.response_device
    }, extra));
    const ack = acknowledge(o, keyboard);
    const onFinish = (d) => {
      ack.cleanup();
      const responded = hasResponse(d);
      if (!responded) {
        d.response = null;
        d.rt = null;
      }
      const correct = nogo ? !responded : responded;
      d.stimulus = spec.stimulus;
      d.responded = responded;
      d.timeout = !responded;
      d.correct = correct;
      d.response_window = state.value;
      if (state.rule) d.response_window_rule = state.rule;
      ctx.state.last = { condition: spec.condition, correct, responded, rt: d.rt };
    };
    const reminder = ruleReminder(ctx, o);
    const fixation = o.inter_trial_display === "fixation_cross" && o.stimulus_duration_ms !== null ? backgroundFixation(
      `<span class="jspsych-timelines-go-nogo-fixation">${ctx.text.fixation}</span>`
    ) : "";
    const prompt = (reminder ? `<div class="jspsych-timelines-go-nogo-below"><div class="jspsych-timelines-go-nogo-text">${reminder}</div></div>` : "") + fixation;
    const common = __spreadValues({
      css_classes: [TASK_CLASS],
      stimulus: renderStimulusScreen(itemHtml(spec.item), spec.stimulus_location),
      stimulus_duration: o.stimulus_duration_ms,
      trial_duration,
      response_ends_trial: o.trial_termination_rule !== "fixed_duration",
      prompt: prompt || null,
      data,
      on_load: ack.on_load,
      on_finish: onFinish
    }, nogo ? { simulation_options: "nogo" } : {});
    if (keyboard) {
      return __spreadValues({ type: HtmlKeyboardResponsePlugin, choices: [...o.response_keys] }, common);
    }
    return __spreadValues({
      type: HtmlButtonResponsePlugin,
      choices: [ctx.text.go_button],
      button_html: (choice) => `<button class="jspsych-btn">${choice}</button>`
    }, common);
  }
  function feedbackText(ctx, o, out) {
    const t = ctx.text;
    const nogo = out.condition === "nogo";
    const acc = out.correct ? t.correct_feedback : nogo ? t.incorrect_feedback : t.timeout_feedback;
    const rt = out.responded && !nogo && out.rt !== null ? t.feedback_rt({ rt: out.rt }) : null;
    switch (o.trial_feedback) {
      case "accuracy":
        return acc;
      case "rt":
        return rt != null ? rt : acc;
      case "accuracy_rt":
        return rt ? `${acc} \u2014 ${rt}` : acc;
      case "correct_answer":
        if (out.correct) return acc;
        return `${acc}. ${nogo ? t.feedback_correct_nogo : t.feedback_correct_go({
        response: isKeyboard(o) ? keyName2(o.response_keys[0]) : t.go_button
      })}`;
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
    const ms = sampleDuration(ctx.jsPsych, o.feedback_duration_ms);
    const trial = createDisplayTrial({
      phase,
      part: "feedback",
      block,
      duration: ms,
      stimulus: () => {
        const out = ctx.state.last;
        const cls = out.correct ? "correct" : "incorrect";
        return renderStage(
          `<div class="jspsych-timelines-go-nogo-feedback ${cls}">${feedbackText(ctx, o, out)}</div>`
        );
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
    const tl = [createResponseTrial(ctx, o, spec, phase, block, trialInBlock, extra)];
    if (o.trial_feedback !== "none") tl.push(createFeedback(ctx, o, phase, block));
    const itiOff = typeof o.iti_ms === "number" && o.iti_ms === 0;
    if (!itiOff) tl.push(createIti(ctx, o, phase, block));
    return { timeline: tl };
  }
  function createBlock(ctx, phase, block, specs) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    const tl = [];
    if (o.pre_block_countdown_ms > 0) tl.push(createCountdown(ctx, o, phase, block));
    specs.forEach((s, i) => tl.push(createTrialSequence(ctx, o, s, phase, block, i + 1)));
    return { timeline: tl };
  }
  function createBaselineBlock(ctx, index) {
    const o = ctx.test;
    const specs = buildBaselineBlock({ jsPsych: ctx.jsPsych, o, stimulus_set: ctx.stimulus_set });
    const tl = [];
    if (o.instruction_format === "text") {
      tl.push(textPage(ctx, ctx.text.instruction_baseline_intro, "test", "instruction"));
    }
    specs.forEach(
      (s, i) => tl.push(createTrialSequence(ctx, o, s, "test", null, i + 1, { baseline_block: index }))
    );
    return { timeline: tl };
  }
  function buildPhaseBlocks(ctx, phase, sizes) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    return buildBlocks(
      { jsPsych: ctx.jsPsych, o, stimulus_set: ctx.stimulus_set },
      sizes,
      o.sequence_constraints
    );
  }
  function splitTrials(total2, parts) {
    const base = Math.floor(total2 / parts);
    const extra = total2 - base * parts;
    return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
  }
  function textPage(ctx, html, phase, part, label) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: `<div class="jspsych-timelines-go-nogo-text">${html}</div>`,
      choices: [label != null ? label : ctx.text.continue_button],
      data: baseData({ phase, part })
    };
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const small = (items) => items.map((i) => `<span class="jspsych-timelines-go-nogo-inline">${itemHtml(i, 36)}</span>`).join(" ");
    const emphasis = o.speed_accuracy_emphasis === "speed" ? t.emphasis_speed : o.speed_accuracy_emphasis === "accuracy" ? t.emphasis_accuracy : o.speed_accuracy_emphasis === "both" ? t.emphasis_both : "";
    const pages = [
      t.instruction_intro({
        go_stimuli: small(ctx.stimulus_set.go),
        nogo_stimuli: small(ctx.stimulus_set.nogo),
        go_names: namesOf(ctx.stimulus_set.go, t),
        nogo_names: namesOf(ctx.stimulus_set.nogo, t)
      }),
      t.instruction_response({ device: deviceOf(o), response: responseLabel(ctx, o) }) + (emphasis ? `<p>${emphasis}</p>` : "")
    ];
    return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
  }
  function demoSteps(ctx) {
    const o = ctx.test;
    const location = locationsOf(o.stimulus_layout)[0];
    const mk = (condition, item) => ({
      spec: { condition, item, stimulus: stimulusId(item), stimulus_location: location }
    });
    const go = ctx.stimulus_set.go.map((i) => mk("go", i));
    const nogo = ctx.stimulus_set.nogo.map((i) => mk("nogo", i));
    const steps = [];
    for (let i = 0; i < Math.max(go.length, nogo.length); i++) {
      if (go[i]) steps.push(go[i]);
      if (nogo[i]) steps.push(nogo[i]);
    }
    return steps;
  }
  function stepArgs(ctx, step) {
    const o = ctx.test;
    return {
      condition: step.spec.condition,
      device: deviceOf(o),
      stimulus_name: stimulusName(step.spec.item, ctx.text),
      response: responseLabel(ctx, o)
    };
  }
  var demoText = (html) => `<div class="jspsych-timelines-go-nogo-text">${html}</div>`;
  var stepHtml = (ctx, step, html) => renderStimulusScreen(itemHtml(step.spec.item), step.spec.stimulus_location, demoText(html));
  function createExamples(ctx, steps) {
    const pages = steps.map((step) => ({
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => stepHtml(ctx, step, ctx.text.instruction_step(stepArgs(ctx, step))),
      choices: [ctx.text.continue_button],
      data: baseData({
        phase: "instructions",
        part: "instruction_example",
        condition: step.spec.condition,
        stimulus: step.spec.stimulus
      }),
      on_finish: (d) => {
        d.stimulus = step.spec.stimulus;
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
      const { spec } = step;
      const nogo = spec.condition === "nogo";
      const correctResponse = nogo ? null : keyboard ? o.response_keys[0] : 0;
      const args = stepArgs(ctx, step);
      const state = { attempt: 0, correct: null };
      const shown = (html) => stepHtml(ctx, step, html);
      const stepData = { phase: "instructions", condition: spec.condition, stimulus: spec.stimulus };
      const response = __spreadProps(__spreadValues({
        type: keyboard ? HtmlKeyboardResponsePlugin : HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => shown(t.instruction_step(args))
      }, keyboard ? { choices: [...o.response_keys] } : {
        choices: [t.go_button],
        button_html: (choice) => `<button class="jspsych-btn">${choice}</button>`
      }), {
        trial_duration: nogo ? INSTRUCTION_NOGO_WAIT_MS : null,
        data: baseData(__spreadProps(__spreadValues({}, stepData), { part: "instruction_check", correct_response: correctResponse })),
        // data-only simulation answers correctly (and withholds on no-go)
        simulation_options: { data: { response: correctResponse, rt: nogo ? null : 600 } },
        on_finish: (d) => {
          const responded = hasResponse(d);
          if (!responded) {
            d.response = null;
            d.rt = null;
          }
          const correct = nogo ? !responded : responded;
          state.attempt++;
          state.correct = correct;
          d.stimulus = spec.stimulus;
          d.responded = responded;
          d.correct = correct;
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
          d.stimulus = spec.stimulus;
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
        const rts = correct.filter({ condition: "go" }).select("rt");
        return `<div class="jspsych-timelines-go-nogo-text">${ctx.text.block_feedback({
        block,
        n_blocks: o.n_blocks,
        accuracy: n > 0 ? correct.count() / n : null,
        mean_rt: rts.count() > 0 ? rts.mean() : null,
        kind: o.block_feedback
      })}</div>`;
      },
      choices: [ctx.text.continue_button],
      data: baseData({ phase: "test", part: "block_feedback", block })
    };
  }
  function createCompletion(ctx, calculate) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const s = calculate(ctx.jsPsych.data.get());
        return `<div class="jspsych-timelines-go-nogo-text"><h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
        commission_error_rate: s.commission_error_rate,
        omission_error_rate: s.omission_error_rate,
        mean_correct_go_rt: s.mean_correct_go_rt
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
    if (o.instruction_format === "text") timeline.push(createInstructions(ctx));
    if (o.instruction_format === "text" && o.instruction_demonstration !== "none") {
      timeline.push(createInstructionWalkthrough(ctx));
    }
    if (o.practice_trials > 0) {
      if (o.instruction_format === "text") timeline.push(createPracticeIntro(ctx));
      const [specs2] = buildPhaseBlocks(ctx, "practice", [o.practice_trials]);
      timeline.push(createBlock(ctx, "practice", 1, specs2));
    }
    if (o.instruction_format === "text") timeline.push(createTestIntro(ctx));
    const sizes = splitTrials(o.n_test_trials, o.n_blocks);
    const specs = buildPhaseBlocks(ctx, "test", sizes);
    let baseline = 0;
    if (o.single_task_blocks === "before_dual") timeline.push(createBaselineBlock(ctx, ++baseline));
    sizes.forEach((_, i) => {
      const block = i + 1;
      if (o.single_task_blocks === "interleaved") timeline.push(createBaselineBlock(ctx, ++baseline));
      timeline.push(createBlock(ctx, "test", block, specs[i]));
      if (o.block_feedback !== "none") timeline.push(createBlockFeedback(ctx, block));
    });
    if (o.single_task_blocks === "after_dual") timeline.push(createBaselineBlock(ctx, ++baseline));
    timeline.push(createCompletion(ctx, calculateScores));
    return { timeline };
  }
  var timelineUnits = {
    createContext,
    createInstructions,
    createInstructionWalkthrough,
    createPracticeIntro,
    createTestIntro,
    createResponseTrial,
    createFeedback,
    createIti,
    createCountdown,
    createDisplayTrial,
    createTrialSequence,
    createBlock,
    createBaselineBlock,
    createBlockFeedback,
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
      BASELINE_TRIALS,
      ACKNOWLEDGE_MS,
      DEADLINE_FALLBACK_MS,
      DEADLINE_MIN_RTS
    },
    text: { defaultText },
    stimuli: { renderItem },
    sequence: { buildBlocks, buildBaselineBlock, toConstraints, splitTrials },
    deadlines: deadlines_exports,
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map