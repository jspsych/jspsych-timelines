var jsPsychTimelineTwoStepTask = (function (exports) {
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
  var TASK_NAME = "two-step-task";
  var VERSION = version;
  var TASK_CLASS = "jspsych-timelines-two-step-task";
  var SHIP_IDS = ["A", "B"];
  var STATE_IDS = ["red", "blue"];
  var OPTION_IDS = ["option_1", "option_2"];
  var COMMON_STATE = { A: "red", B: "blue" };
  var INSTRUCTION_MAX_ATTEMPTS = 3;
  var INSTRUCTION_CORRECT_MS = 900;
  var MAX_TRIAL_REPEATS = 5;
  var SIMULATION = {
    /** weight of the model-based values in the first-stage choice (0 = model-free, 1 = model-based) */
    w: 0.5,
    /** learning rate */
    alpha: 0.4,
    /** softmax inverse temperature */
    beta: 4,
    /** ex-Gaussian RT (ms): mu, sigma, tau */
    rt: { mu: 450, sigma: 60, tau: 120 },
    /** extra second-stage RT after a rare transition, ms (the RT signature of model-based control) */
    rare_rt_cost: 80
  };

  // src/options.ts
  var FULL_RANGE = { min: 0.25, max: 0.75 };
  var DEFAULT_OPTIONS = {
    feedback_duration_ms: 500,
    fixation_duration_ms: 0,
    iti_ms: 1e3,
    response_window_ms: 2e3,
    timeout_message_ms: 1500,
    response_acknowledgement_ms: 1e3,
    n_blocks: 2,
    n_test_trials: 200,
    trials_per_block: 100,
    common_transition_prob: 0.7,
    reward_probability: {
      red: { option_1: FULL_RANGE, option_2: FULL_RANGE },
      blue: { option_1: FULL_RANGE, option_2: FULL_RANGE }
    },
    reward_schedule: {
      kind: "random_walk",
      sd: 0.025,
      bounds: [0.25, 0.75],
      boundary: "reverse_step"
    },
    sequence_constraints: null,
    missed_response_handling: "skip_trial",
    option_side_assignment: "random_per_trial",
    response_keys: ["ArrowLeft", "ArrowRight"],
    comprehension_check: "none",
    fullscreen_enforcement: "none",
    manipulation_check: "none",
    practice_trials: 50,
    rest_breaks: "none",
    response_acknowledgement: "highlight",
    running_score_display: "running_total",
    contingency_disclosure: "partial",
    instruction_format: "text",
    instruction_demonstration: "interactive",
    instruction_framing: "abstract_symbols",
    population_protocol: "standard",
    practice: {}
  };
  var PHASE_OPTIONS = [
    "feedback_duration_ms",
    "fixation_duration_ms",
    "iti_ms",
    "response_window_ms",
    "timeout_message_ms",
    "response_acknowledgement_ms",
    "common_transition_prob",
    "reward_probability",
    "reward_schedule",
    "missed_response_handling",
    "option_side_assignment",
    "response_acknowledgement",
    "running_score_display"
  ];
  function mergeProbabilities(over) {
    var _a, _b;
    const out = {};
    for (const s of STATE_IDS) {
      out[s] = {};
      for (const o of OPTION_IDS) {
        out[s][o] = (_b = (_a = over == null ? void 0 : over[s]) == null ? void 0 : _a[o]) != null ? _b : DEFAULT_OPTIONS.reward_probability[s][o];
      }
    }
    return out;
  }
  function reconcileCounts(given, phase) {
    var _a, _b, _c;
    if (phase === "practice") {
      return { n_test_trials: 0, n_blocks: 1, trials_per_block: 0 };
    }
    const D = DEFAULT_OPTIONS;
    const hasN = given.n_test_trials !== void 0;
    const hasB = given.n_blocks !== void 0;
    const hasP = given.trials_per_block !== void 0;
    let n = (_a = given.n_test_trials) != null ? _a : D.n_test_trials;
    let b = (_b = given.n_blocks) != null ? _b : D.n_blocks;
    let p = (_c = given.trials_per_block) != null ? _c : D.trials_per_block;
    if (hasN && hasB && hasP) {
      if (n !== b * p) {
        throw new Error(
          `two-step-task: n_test_trials (${n}), n_blocks (${b}) and trials_per_block (${p}) disagree: n_test_trials must equal n_blocks * trials_per_block.`
        );
      }
    } else if (hasN && hasP) {
      if (n % p !== 0) {
        throw new Error(
          `two-step-task: n_test_trials (${n}) is not a multiple of trials_per_block (${p}); give n_blocks as well, or change one of them.`
        );
      }
      b = n / p;
    } else if (hasB && hasP) {
      n = b * p;
    } else if (hasP) {
      n = b * p;
    } else {
      p = Math.ceil(n / b);
    }
    return { n_test_trials: n, n_blocks: b, trials_per_block: p };
  }
  function resolveOptions(user = {}, phase = "test") {
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
    merged.reward_probability = mergeProbabilities(layer.reward_probability);
    Object.assign(merged, reconcileCounts(top, phase));
    if (merged.sequence_constraints && Object.keys(merged.sequence_constraints).length === 0) {
      merged.sequence_constraints = null;
    }
    return merged;
  }
  var NOT_IMPLEMENTED = [
    [
      "comprehension_check",
      ["quiz", "quiz_with_repeat", "knowledge_test"],
      "the interactive walkthrough has its own check questions (instruction_demonstration)"
    ],
    ["fullscreen_enforcement", ["fullscreen", "fullscreen_and_focus"], "not implemented"],
    ["manipulation_check", ["in_task_probe", "debrief"], "only questionnaire is implemented"],
    [
      "rest_breaks",
      ["fixed_interval"],
      "the break schedule is not defined in the spec; use self_paced"
    ],
    ["response_acknowledgement", ["keypress_mark"], "only highlight is implemented"],
    [
      "instruction_format",
      ["audio", "video"],
      "no media is bundled; supply your own instruction trials"
    ],
    [
      "instruction_framing",
      ["magic_carpet_mountain_genie", "ship_island_chest"],
      "only abstract_symbols and spaceship_planet_alien are drawn"
    ],
    [
      "population_protocol",
      ["child", "gamified_child", "clinical"],
      "it bundles a deadline, audio, a tutorial and breaks; set those options one by one"
    ],
    ["missed_response_handling", ["none"], "use skip_trial or repeat_trial"]
  ];
  var isNumber = (x) => typeof x === "number" && Number.isFinite(x);
  function checkProbability(where, v, lo, hi) {
    const range = typeof v === "number" ? { min: v, max: v } : v;
    if (!isNumber(range == null ? void 0 : range.min) || !isNumber(range == null ? void 0 : range.max) || range.min > range.max) {
      throw new Error(`two-step-task: reward_probability.${where} must be a number or { min, max }.`);
    }
    if (range.min < lo || range.max > hi) {
      throw new Error(
        `two-step-task: reward_probability.${where} (${range.min}..${range.max}) lies outside reward_schedule.bounds [${lo}, ${hi}].`
      );
    }
  }
  function validateOptions(o) {
    for (const [key, values, why] of NOT_IMPLEMENTED) {
      if (values.includes(o[key])) {
        throw new Error(`two-step-task: ${key}: "${o[key]}" is not implemented (${why}).`);
      }
    }
    const sch = o.reward_schedule;
    if (!sch || sch.kind !== "random_walk") {
      throw new Error(
        `two-step-task: reward_schedule: kind "${sch == null ? void 0 : sch.kind}" is not implemented (only "random_walk").`
      );
    }
    if (!(sch.sd > 0) || !Array.isArray(sch.bounds) || !(sch.bounds[0] < sch.bounds[1])) {
      throw new Error(
        "two-step-task: reward_schedule needs sd > 0 and bounds [lower, upper] with lower < upper."
      );
    }
    if (sch.boundary !== "reflect" && sch.boundary !== "reverse_step") {
      throw new Error(`two-step-task: reward_schedule.boundary must be "reflect" or "reverse_step".`);
    }
    for (const s of STATE_IDS)
      for (const opt of OPTION_IDS)
        checkProbability(`${s}.${opt}`, o.reward_probability[s][opt], sch.bounds[0], sch.bounds[1]);
    if (!(o.common_transition_prob >= 0 && o.common_transition_prob <= 1)) {
      throw new Error("two-step-task: common_transition_prob must be between 0 and 1.");
    }
    if (!Array.isArray(o.response_keys) || o.response_keys.length !== 2) {
      throw new Error(
        "two-step-task: response_keys must list exactly two keys (first = left option)."
      );
    }
    if (o.response_keys[0] === o.response_keys[1]) {
      throw new Error("two-step-task: response_keys must be two different keys.");
    }
    for (const k of ["n_blocks", "n_test_trials", "trials_per_block"]) {
      if (o[k] !== 0 && (!(o[k] >= 1) || !Number.isInteger(o[k]))) {
        throw new Error(`two-step-task: ${k} must be a positive integer.`);
      }
    }
    if (o.sequence_constraints !== null) {
      throw new Error(
        "two-step-task: sequence_constraints: ordering rules are not implemented; transitions are drawn independently (use null or {})."
      );
    }
  }

  // src/schedule.ts
  function uniform(jsPsych) {
    return jsPsych.randomization.randomInt(0, __pow(2, 30) - 1) / __pow(2, 30);
  }
  function drawStart(jsPsych, v) {
    return typeof v === "number" ? v : v.min + uniform(jsPsych) * (v.max - v.min);
  }
  function stepProbability(p, step, bounds, boundary) {
    const [lo, hi] = bounds;
    let next = p + step;
    if (boundary === "reverse_step") {
      if (next < lo || next > hi) next = p - step;
      return Math.min(hi, Math.max(lo, next));
    }
    for (let i = 0; i < 100 && (next < lo || next > hi); i++) {
      if (next > hi) next = 2 * hi - next;
      if (next < lo) next = 2 * lo - next;
    }
    return Math.min(hi, Math.max(lo, next));
  }
  function generateWalk(jsPsych, start, schedule, n) {
    const out = [];
    let cur = start;
    for (let t = 0; t < n; t++) {
      if (t > 0) {
        const next = {};
        for (const s of STATE_IDS) {
          next[s] = {};
          for (const o of OPTION_IDS) {
            const step = jsPsych.randomization.sampleNormal(0, schedule.sd);
            next[s][o] = stepProbability(cur[s][o], step, schedule.bounds, schedule.boundary);
          }
        }
        cur = next;
      }
      out.push(cur);
    }
    return out;
  }
  function drawSides(jsPsych, mode, n, blockSizes2) {
    const R = jsPsych.randomization;
    if (mode === "fixed") return new Array(n).fill(R.sampleBernoulli(0.5) === 1);
    if (mode === "counterbalanced") {
      const out = [];
      for (const size of blockSizes2) {
        const half = Math.floor(size / 2);
        const flags = R.shuffle([
          ...new Array(half).fill(true),
          ...new Array(half).fill(false),
          ...size % 2 ? [R.sampleBernoulli(0.5) === 1] : []
        ]);
        out.push(...flags);
      }
      return out;
    }
    return Array.from({ length: n }, () => R.sampleBernoulli(0.5) === 1);
  }
  function buildSchedule(jsPsych, o, n, block_sizes = [n]) {
    const schedule = o.reward_schedule;
    const start = {};
    for (const s of STATE_IDS) {
      start[s] = {};
      for (const opt of OPTION_IDS) start[s][opt] = drawStart(jsPsych, o.reward_probability[s][opt]);
    }
    const walk = generateWalk(jsPsych, start, schedule, n);
    const R = jsPsych.randomization;
    const shipSides = drawSides(jsPsych, o.option_side_assignment, n, block_sizes);
    const alienSides = {
      red: drawSides(jsPsych, o.option_side_assignment, n, block_sizes),
      blue: drawSides(jsPsych, o.option_side_assignment, n, block_sizes)
    };
    return walk.map((probs, t) => {
      const common = R.sampleBernoulli(o.common_transition_prob) === 1;
      const rewards = {};
      for (const s of STATE_IDS) {
        rewards[s] = {};
        for (const opt of OPTION_IDS) rewards[s][opt] = R.sampleBernoulli(probs[s][opt]) === 1;
      }
      return {
        index: t + 1,
        common,
        probs,
        rewards,
        ship_left: shipSides[t] ? "A" : "B",
        alien_left: {
          red: alienSides.red[t] ? "option_1" : "option_2",
          blue: alienSides.blue[t] ? "option_1" : "option_2"
        }
      };
    });
  }
  function splitTrials(total, parts) {
    const base = Math.floor(total / parts);
    const extra = total - base * parts;
    return Array.from({ length: parts }, (_, i) => base + (i < extra ? 1 : 0));
  }

  // src/scoring.ts
  function trialTable(data, phase = "test") {
    return data.filter({ task: TASK_NAME, phase, part: "response" }).values().map((r) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      return {
        block: (_a = r.block) != null ? _a : null,
        trial_index_in_block: (_b = r.trial_index_in_block) != null ? _b : null,
        attempt: (_c = r.attempt) != null ? _c : 1,
        stage1_choice: (_d = r.stage1_choice) != null ? _d : null,
        stage1_rt: (_e = r.stage1_rt) != null ? _e : null,
        stage2_state: (_f = r.stage2_state) != null ? _f : null,
        transition: (_g = r.transition) != null ? _g : null,
        stage2_choice: (_h = r.stage2_choice) != null ? _h : null,
        stage2_rt: (_i = r.stage2_rt) != null ? _i : null,
        reward: (_j = r.reward) != null ? _j : null,
        reward_probs: (_k = r.reward_probs) != null ? _k : null,
        missed: r.missed === true,
        missed_stage: (_l = r.missed_stage) != null ? _l : null
      };
    });
  }
  var mean = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
  function columnMean(rows, field, keep = () => true) {
    const col = rows.filterCustom((r) => keep(r) && typeof r[field] === "number").select(field);
    return col.count() > 0 ? col.mean() : null;
  }
  function bestOption(probs) {
    if (!probs || probs.option_1 === probs.option_2) return null;
    return probs.option_1 > probs.option_2 ? "option_1" : "option_2";
  }
  function calculateScores(data) {
    const trials = trialTable(data, "test");
    const done = trials.filter((t) => !t.missed);
    const cells = {
      common_rewarded: [],
      common_unrewarded: [],
      rare_rewarded: [],
      rare_unrewarded: []
    };
    const all = [];
    for (let i = 0; i + 1 < trials.length; i++) {
      const a = trials[i];
      const b = trials[i + 1];
      if (a.missed || b.missed || a.block !== b.block) continue;
      if (!a.stage1_choice || !b.stage1_choice || a.transition === null || a.reward === null)
        continue;
      const stay = a.stage1_choice === b.stage1_choice ? 1 : 0;
      all.push(stay);
      cells[`${a.transition}_${a.reward ? "rewarded" : "unrewarded"}`].push(
        stay
      );
    }
    const cell = (k) => mean(cells[k]);
    const cr = cell("common_rewarded");
    const cu = cell("common_unrewarded");
    const rr = cell("rare_rewarded");
    const ru = cell("rare_unrewarded");
    const full = cr !== null && cu !== null && rr !== null && ru !== null;
    const rows = data.filter({ task: TASK_NAME, phase: "test", part: "response" });
    const completed = (r) => r.missed !== true;
    const rtAfter = (kind) => columnMean(rows, "stage2_rt", (r) => completed(r) && r.transition === kind);
    const rtRare = rtAfter("rare");
    const rtCommon = rtAfter("common");
    const withTransition = trials.filter((t) => t.transition !== null);
    const judged = done.map((t) => {
      var _a, _b;
      return { best: bestOption((_b = t.reward_probs) == null ? void 0 : _b[(_a = t.stage2_state) != null ? _a : ""]), t };
    }).filter((x) => x.best !== null);
    return {
      n_trials: trials.length,
      n_completed: done.length,
      n_missed: trials.length - done.length,
      n_missed_stage_1: trials.filter((t) => t.missed_stage === 1).length,
      n_missed_stage_2: trials.filter((t) => t.missed_stage === 2).length,
      total_reward: done.filter((t) => t.reward === 1).length,
      reward_rate: columnMean(rows, "reward", completed),
      common_transition_rate: withTransition.length ? withTransition.filter((t) => t.transition === "common").length / withTransition.length : null,
      stage1_mean_rt: columnMean(rows, "stage1_rt"),
      stage2_mean_rt: columnMean(rows, "stage2_rt", completed),
      stage2_best_option_rate: judged.length ? judged.filter((x) => x.t.stage2_choice === x.best).length / judged.length : null,
      n_stay_pairs: all.length,
      stay_probability: mean(all),
      stay_common_rewarded: cr,
      stay_common_unrewarded: cu,
      stay_rare_rewarded: rr,
      stay_rare_unrewarded: ru,
      n_stay_common_rewarded: cells.common_rewarded.length,
      n_stay_common_unrewarded: cells.common_unrewarded.length,
      n_stay_rare_rewarded: cells.rare_rewarded.length,
      n_stay_rare_unrewarded: cells.rare_unrewarded.length,
      mf_index: full ? (cr + rr - cu - ru) / 2 : null,
      mb_index: full ? (cr - cu - rr + ru) / 2 : null,
      mb_rt_index: rtRare !== null && rtCommon !== null ? rtRare - rtCommon : null
    };
  }
  function getSummary(data) {
    return __spreadProps(__spreadValues({}, calculateScores(data)), { task: TASK_NAME, version: VERSION });
  }

  // src/simulation.ts
  var params = __spreadValues({}, SIMULATION);
  function setSimulatedAgent(p) {
    params = __spreadValues(__spreadValues({}, SIMULATION), p != null ? p : {});
  }
  function getSimulatedAgent() {
    return params;
  }
  function hasForcedRt(jsPsych) {
    var _a, _b;
    const o = jsPsych.simulationOptions;
    return ((_b = (_a = o == null ? void 0 : o.default) == null ? void 0 : _a.data) == null ? void 0 : _b.rt) !== void 0;
  }
  var HybridAgent = class {
    constructor(jsPsych, commonProb) {
      this.jsPsych = jsPsych;
      this.commonProb = commonProb;
      /** model-free value of each first-stage option */
      this.q1 = { A: 0.5, B: 0.5 };
      /** value of each second-stage option */
      this.q2 = {
        red: { option_1: 0.5, option_2: 0.5 },
        blue: { option_1: 0.5, option_2: 0.5 }
      };
    }
    draw() {
      return this.jsPsych.randomization.randomInt(0, __pow(2, 30) - 1) / __pow(2, 30);
    }
    /** Probability of choosing the first of two options with values (a, b). */
    softmax(a, b) {
      return 1 / (1 + Math.exp(-params.beta * (a - b)));
    }
    best(state) {
      return Math.max(this.q2[state].option_1, this.q2[state].option_2);
    }
    /** The model-based value of a first-stage option, from the second-stage values and the transition model. */
    mbValue(ship) {
      const common = COMMON_STATE[ship];
      const rare = common === "red" ? "blue" : "red";
      return this.commonProb * this.best(common) + (1 - this.commonProb) * this.best(rare);
    }
    value(ship) {
      return params.w * this.mbValue(ship) + (1 - params.w) * this.q1[ship];
    }
    chooseFirst() {
      return this.draw() < this.softmax(this.value("A"), this.value("B")) ? "A" : "B";
    }
    chooseSecond(state) {
      const q = this.q2[state];
      return this.draw() < this.softmax(q.option_1, q.option_2) ? "option_1" : "option_2";
    }
    /** Learn from a finished trial. */
    update(ship, state, option, reward) {
      this.q2[state][option] += params.alpha * (reward - this.q2[state][option]);
      this.q1[ship] += params.alpha * (reward - this.q1[ship]);
    }
    /** A response time in ms (ex-Gaussian), longer after a rare transition at the second stage. */
    rt(rare = false) {
      const { mu, sigma, tau } = params.rt;
      const base = this.jsPsych.randomization.sampleExGaussian(mu, sigma, 1 / tau, true);
      return Math.round(Math.max(150, base + (rare ? params.rare_rt_cost : 0)));
    }
  };

  // src/stimuli.ts
  var SAFE_COLOR = /^[#a-zA-Z0-9(),.%\s-]+$/;
  var COLORS = {
    space: { bg: "#17181d", fg: "#f1f5f9" },
    red: { bg: "#3a1520", fg: "#f1f5f9", planet: "#b23a48" },
    blue: { bg: "#102a4c", fg: "#f1f5f9", planet: "#3a6ea5" }
  };
  function svg(inner, size) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true">${inner}</svg>`;
  }
  var SHIPS = {
    abstract_symbols: {
      A: `<circle cx="50" cy="50" r="32" fill="none" stroke="#ffd166" stroke-width="12"/>`,
      B: `<path d="M50 14v72M14 50h72" stroke="#06d6a0" stroke-width="14" stroke-linecap="butt"/>`
    },
    spaceship_planet_alien: {
      A: `<path d="M50 8C64 24 68 44 66 68H34C32 44 36 24 50 8Z" fill="#ff8c42"/><path d="M34 52 20 76l14-4ZM66 52l14 24-14-4Z" fill="#d1495b"/><circle cx="50" cy="42" r="8" fill="#f1f5f9"/><path d="M42 68h16l-8 22Z" fill="#ffd166"/>`,
      B: `<ellipse cx="50" cy="60" rx="42" ry="14" fill="#2ec4b6"/><path d="M30 56C32 30 68 30 70 56Z" fill="#a8dadc"/><circle cx="26" cy="62" r="3" fill="#ffd166"/><circle cx="50" cy="66" r="3" fill="#ffd166"/><circle cx="74" cy="62" r="3" fill="#ffd166"/>`
    }
  };
  var OPTIONS = {
    abstract_symbols: {
      red: {
        option_1: `<circle cx="50" cy="50" r="34" fill="#ffd6a5"/>`,
        option_2: `<rect x="18" y="18" width="64" height="64" fill="#caffbf"/>`
      },
      blue: {
        option_1: `<path d="M50 14 88 82H12Z" fill="#bdb2ff"/>`,
        option_2: `<path d="M50 10 90 50 50 90 10 50Z" fill="#9bf6ff"/>`
      }
    },
    spaceship_planet_alien: {
      red: {
        option_1: `<circle cx="50" cy="54" r="34" fill="#7bd88f"/><circle cx="50" cy="50" r="12" fill="#f1f5f9"/><circle cx="50" cy="50" r="5" fill="#16202e"/>`,
        option_2: `<rect x="20" y="24" width="60" height="58" rx="8" fill="#ffd166"/><circle cx="38" cy="46" r="6" fill="#16202e"/><circle cx="62" cy="46" r="6" fill="#16202e"/><rect x="38" y="64" width="24" height="5" fill="#16202e"/><path d="M50 24V10" stroke="#ffd166" stroke-width="5"/>`
      },
      blue: {
        option_1: `<path d="M50 14 90 84H10Z" fill="#ff8fab"/><circle cx="40" cy="62" r="6" fill="#16202e"/><circle cx="60" cy="62" r="6" fill="#16202e"/><path d="M38 14 30 4M62 14 70 4" stroke="#ff8fab" stroke-width="5"/>`,
        option_2: `<ellipse cx="50" cy="54" rx="26" ry="38" fill="#b388eb"/><circle cx="38" cy="44" r="5" fill="#f1f5f9"/><circle cx="62" cy="44" r="5" fill="#f1f5f9"/><circle cx="50" cy="62" r="5" fill="#f1f5f9"/>`
      }
    }
  };
  function renderShip(framing, ship, size = 96) {
    return svg(SHIPS[framing][ship], size);
  }
  function renderOption(framing, state, option, size = 96) {
    return svg(OPTIONS[framing][state][option], size);
  }
  function renderState(framing, state, size = 96) {
    const c = COLORS[state].planet;
    return framing === "spaceship_planet_alien" ? svg(
      `<circle cx="50" cy="50" r="38" fill="${c}"/><ellipse cx="50" cy="52" rx="48" ry="10" fill="none" stroke="#f1f5f9" stroke-width="3" opacity=".7"/>`,
      size
    ) : svg(`<rect x="14" y="14" width="72" height="72" rx="6" fill="${c}"/>`, size);
  }
  function renderCoin(rewarded, size = 40) {
    return rewarded ? svg(
      `<circle cx="50" cy="50" r="42" fill="#f4c430" stroke="#b8860b" stroke-width="6"/><circle cx="50" cy="50" r="26" fill="none" stroke="#b8860b" stroke-width="5"/>`,
      size
    ) : svg(
      `<circle cx="50" cy="50" r="40" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="10 8"/><path d="M26 74 74 26" stroke="#94a3b8" stroke-width="6"/>`,
      size
    );
  }
  function paintDisplay(colors, framing, state) {
    for (const c of [colors.bg, colors.fg]) {
      if (!SAFE_COLOR.test(c)) throw new Error(`two-step-task: unsupported colour "${c}".`);
    }
    const planet = state !== null && framing === "spaceship_planet_alien" ? `radial-gradient(ellipse 130% 30% at 50% 108%, ${COLORS[state].planet} 0 62%, transparent 64%), ` : "";
    return `<style>.jspsych-display-element:has(.jspsych-timelines-two-step-task){background:${planet}${colors.bg};color:${colors.fg};}</style>`;
  }
  function colorsFor(state) {
    return state === null ? COLORS.space : COLORS[state];
  }
  function renderScreen(stage, below = "") {
    const region = below ? `<div class="ts-below">${below}</div>` : "";
    return `<div class="ts-screen">${stage}${region}</div>`;
  }
  function renderStage(inner, framing, state, below = "") {
    return paintDisplay(colorsFor(state), framing, state) + renderScreen(`<div class="ts-stage"><div class="ts-center">${inner}</div></div>`, below);
  }
  function renderPair(a) {
    var _a;
    const cell = (side, html) => {
      const cls = a.chosen == null ? "ts-item" : a.chosen === side ? "ts-item ts-chosen" : "ts-item ts-dim";
      return `<div class="${cls}" data-side="${side}">${html}</div>`;
    };
    return renderStage(
      `<div class="ts-pair">${cell("left", a.left)}${cell("right", a.right)}</div>`,
      a.framing,
      a.state,
      (_a = a.below) != null ? _a : ""
    );
  }
  function renderFixation(framing, mark) {
    return renderStage(`<span class="ts-fixation">${mark}</span>`, framing, null);
  }
  function renderMessage(framing, state, text) {
    return renderStage(`<div class="ts-message">${text}</div>`, framing, state);
  }

  // src/text.ts
  var abstract = {
    first: "symbol",
    first_plural: "symbols",
    second: "symbol",
    second_plural: "symbols",
    state: "screen",
    state_plural: "screens",
    first_name: { A: "the ring", B: "the cross" },
    state_name: { red: "the red screen", blue: "the blue screen" }
  };
  var spaceship = {
    first: "spaceship",
    first_plural: "spaceships",
    second: "alien",
    second_plural: "aliens",
    state: "planet",
    state_plural: "planets",
    first_name: { A: "the rocket", B: "the flying saucer" },
    state_name: { red: "the red planet", blue: "the blue planet" }
  };
  var sideOf = (s) => s;
  var defaultText = {
    framing_words: ({ framing }) => framing === "abstract_symbols" ? abstract : spaceship,
    instruction_intro: ({ words: w }) => `<p>In this task you collect coins. Every trial has two steps. In the first step you choose one of two ${w.first_plural}. It takes you to one of two ${w.state_plural}, a red one or a blue one. There you choose one of two ${w.second_plural}, and the ${w.second} you choose may give you a coin.</p><p>Collect as many coins as you can.</p>`,
    instruction_response: ({
      words: w,
      left_key,
      right_key,
      window_seconds,
      repeat_missed,
      sides_vary
    }) => `<p>Press <kbd>${left_key}</kbd> to choose the ${w.first} on the left, and <kbd>${right_key}</kbd> to choose the one on the right. You use the same two keys for the ${w.second_plural}.${sides_vary ? ` The two options are not always on the same side, so look before you choose.` : ""}</p>${window_seconds === null ? "" : `<p>You have ${window_seconds} ${window_seconds === 1 ? "second" : "seconds"} for each choice. If you are too slow, ${repeat_missed ? "you get the same trial again" : "the trial is skipped"}.</p>`}`,
    instruction_transitions: ({ words: w, common_percent, mapping }) => `<p>Each ${w.first} usually takes you to the same ${w.state}: about ${common_percent} times out of 100. The rest of the time it takes you to the other ${w.state}.</p>${mapping ? `<p>${cap(w.first_name.A)} usually takes you to ${w.state_name.red}. ${cap(
    w.first_name.B
  )} usually takes you to ${w.state_name.blue}.</p>` : `<p>You will have to find out which ${w.state} each ${w.first} usually takes you to.</p>`}`,
    instruction_drift: ({ words: w }) => `<p>How likely the ${w.second_plural} are to give a coin changes slowly during the task. One that is good now may get worse later, and one that is poor now may get better. Keep an eye on which ones give coins.</p>`,
    instruction_demo_intro: ({ words: w }) => `<p>Let's try one trial. You will choose a ${w.first}, see where it takes you, and then choose one of two ${w.second_plural}. This trial is for learning the keys, so which one you choose does not matter.</p>`,
    instruction_practice_intro: ({ timed, sides_vary }) => `<p>Now you will practice. The trials run at the pace of the real task${timed ? `: you have a limited time for each choice` : ""}${sides_vary ? `${timed ? ", and" : ": "} the two options of each choice change places from trial to trial` : ""}. The coins you get in practice are not counted.</p><p>When practice is over, the main task starts.</p>`,
    instruction_test_intro: `<p>Practice is over. Now the main task starts. Collect as many coins as you can.</p>`,
    step_first: ({ words: w, side, key }) => `Choose the ${w.first} on the ${sideOf(side)}: press <kbd>${key}</kbd>.`,
    step_first_hint: ({ words: w, side, key }) => `That was the other one. Choose the ${w.first} on the ${side}: press <kbd>${key}</kbd>.`,
    step_first_reveal: ({ words: w, side, key }) => `Press <kbd>${key}</kbd> to choose the ${w.first} on the ${side}.`,
    step_second: ({ words: w, side, key, state_name }) => `The ${w.first} took you to ${state_name}. Choose the ${w.second} on the ${side}: press <kbd>${key}</kbd>.`,
    step_second_hint: ({ words: w, side, key }) => `That was the other one. Choose the ${w.second} on the ${side}: press <kbd>${key}</kbd>.`,
    step_second_reveal: ({ words: w, side, key }) => `Press <kbd>${key}</kbd> to choose the ${w.second} on the ${side}.`,
    step_outcome: ({ words: w }) => `This ${w.second} gave you a coin. Not every choice does.`,
    check_mapping: ({ words: w, first_name, left_key, right_key }) => `Which ${w.state} does ${first_name} usually take you to? Press <kbd>${left_key}</kbd> for the one on the left, or <kbd>${right_key}</kbd> for the one on the right.`,
    check_mapping_hint: ({ first_name, state_name, side, key }) => `Not quite: ${first_name} usually takes you to ${state_name}. It is on the ${side}: press <kbd>${key}</kbd>.`,
    check_mapping_reveal: ({ first_name, state_name }) => `${cap(first_name)} usually takes you to ${state_name}.`,
    check_statement: ({ left_key, right_key }) => `Which sentence is true? Press <kbd>${left_key}</kbd> for the one on the left, or <kbd>${right_key}</kbd> for the one on the right.`,
    check_statement_hint: ({ side, key }) => `Not quite. The true sentence is on the ${side}: press <kbd>${key}</kbd>.`,
    check_statement_reveal: ({ side }) => `The true sentence is the one on the ${side}.`,
    statement_transitions_true: ({ words: w }) => `A ${w.first} usually takes you to the same ${w.state}, but not always.`,
    statement_transitions_false: ({ words: w }) => `A ${w.first} takes you to either ${w.state} equally often.`,
    statement_drift_true: ({ words: w }) => `How likely the ${w.second_plural} are to give a coin changes slowly.`,
    statement_drift_false: ({ words: w }) => `How likely the ${w.second_plural} are to give a coin never changes.`,
    instruction_correct: "Correct!",
    continue_button: "Continue",
    fixation: "+",
    too_slow: "Too slow",
    outcome_coin: "You got a coin",
    outcome_none: "No coin",
    running_total: ({ total }) => `Coins: ${total}`,
    block_complete: ({ block, n_blocks }) => `<p>You have finished block ${block} of ${n_blocks}. Take a short break if you like.</p>`,
    questionnaire_intro: `<p>One last question about the task.</p>`,
    questionnaire_question: ({ words: w, first_name, left_key, right_key }) => `Which ${w.state} did ${first_name} take you to most of the time? Press <kbd>${left_key}</kbd> for the one on the left, or <kbd>${right_key}</kbd> for the one on the right.`,
    task_complete: "Task complete",
    result_summary: ({ coins, n_trials, n_missed }) => `<p>You collected ${coins} coins in ${n_trials} trials${n_missed > 0 ? ` (${n_missed} ${n_missed === 1 ? "trial was" : "trials were"} missed)` : ""}.</p>`
  };
  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

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
  styleInject(".jspsych-timelines-two-step-task .ts-text {\n  max-width: 600px;\n  margin: 0 auto;\n  padding: 0 20px;\n  text-align: left;\n}\n.jspsych-timelines-two-step-task .ts-text h2 {\n  margin: 0 0 0.6em;\n  font-size: 1em;\n  font-weight: bold;\n  text-align: center;\n}\n.jspsych-timelines-two-step-task .ts-text svg,\n.jspsych-timelines-two-step-task .ts-inline svg {\n  vertical-align: middle;\n}\n.jspsych-timelines-two-step-task {\n  --ts-stage-h: min(280px, 34vh);\n  --ts-btn-reserve: 62px;\n}\n.jspsych-timelines-two-step-task:has(.ts-screen) {\n  position: relative;\n  box-sizing: border-box;\n  width: 100%;\n  max-width: none;\n  height: 100vh;\n  margin: 0;\n  overflow: hidden;\n}\n.jspsych-timelines-two-step-task .ts-screen {\n  display: contents;\n}\n.jspsych-timelines-two-step-task .ts-stage {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  box-sizing: border-box;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 640px;\n  max-width: calc(100vw - 16px);\n  height: var(--ts-stage-h);\n  padding: 12px;\n  overflow: hidden;\n}\n.jspsych-timelines-two-step-task .ts-below {\n  position: absolute;\n  top: calc(50% + var(--ts-stage-h) / 2 + 8px);\n  right: 0;\n  bottom: 0;\n  left: 0;\n  overflow-y: auto;\n  overscroll-behavior: contain;\n}\n.jspsych-timelines-two-step-task .ts-below .ts-text {\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-two-step-task .ts-below .ts-text p {\n  margin: 0.4em 0;\n}\n.jspsych-timelines-two-step-task:has(#jspsych-html-button-response-btngroup) .ts-below {\n  bottom: var(--ts-btn-reserve);\n}\n.jspsych-timelines-two-step-task:has(.ts-screen) #jspsych-html-button-response-btngroup {\n  position: absolute;\n  right: 0;\n  bottom: 12px;\n  left: 0;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n}\n.jspsych-timelines-two-step-task .ts-center {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 100%;\n}\n.jspsych-timelines-two-step-task .ts-pair {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  gap: min(160px, 20vw);\n}\n.jspsych-timelines-two-step-task .ts-item {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 6px;\n  border: 3px solid transparent;\n  border-radius: 12px;\n  line-height: 0;\n}\n.jspsych-timelines-two-step-task .ts-item svg {\n  max-width: 100%;\n  height: auto;\n}\n.jspsych-timelines-two-step-task .ts-item.ts-chosen {\n  border-color: #f4c430;\n}\n.jspsych-timelines-two-step-task .ts-item.ts-dim {\n  opacity: 0.3;\n}\n.jspsych-timelines-two-step-task .ts-outcome {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 6px;\n  line-height: 0;\n}\n.jspsych-timelines-two-step-task .ts-pair:has(.ts-statement) {\n  gap: 16px;\n}\n.jspsych-timelines-two-step-task .ts-statement {\n  box-sizing: border-box;\n  width: min(250px, calc(50vw - 40px));\n  padding: 10px;\n  border: 2px solid currentColor;\n  border-radius: 8px;\n  font-size: 1em;\n  line-height: 1.3;\n  text-align: center;\n  text-wrap: balance;\n}\n.jspsych-timelines-two-step-task .ts-fixation {\n  font-size: 3em;\n}\n.jspsych-timelines-two-step-task .ts-message {\n  font-size: 1em;\n  font-weight: bold;\n}\n.jspsych-timelines-two-step-task .ts-outcome-text {\n  font-weight: bold;\n}\n");

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
    validateOptions(test);
    validateOptions(practice);
    const framing = test.instruction_framing;
    return {
      jsPsych,
      text,
      user: options,
      practice,
      test,
      words: text.framing_words({ framing }),
      state: { total: { practice: 0, test: 0 } },
      agent: new HybridAgent(jsPsych, test.common_transition_prob)
    };
  }
  var baseData = (extra) => __spreadValues({
    task: TASK_NAME,
    task_version: VERSION
  }, extra);
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
  function sampleDuration(jsPsych, v) {
    var _a;
    if (typeof v === "number") return v;
    const step = (_a = v.step) != null ? _a : 1;
    return v.min + step * jsPsych.randomization.randomInt(0, Math.floor((v.max - v.min) / step));
  }
  var other = (a, pair) => a === pair[0] ? pair[1] : pair[0];
  var SHIPS2 = ["A", "B"];
  var OPTIONS2 = ["option_1", "option_2"];
  var STATES = ["red", "blue"];
  var framingOf = (o) => o.instruction_framing;
  function sideOfKey(o, key) {
    if (key === null) return null;
    return key.toLowerCase() === o.response_keys[0].toLowerCase() ? "left" : "right";
  }
  var keyLabel = (o, side) => keyName(o.response_keys[side === "left" ? 0 : 1]);
  var textHtml = (html) => `<div class="ts-text">${html}</div>`;
  var keyForSide = (o, side) => o.response_keys[side === "left" ? 0 : 1];
  function newTrialState(plan) {
    return {
      plan,
      attempt: 0,
      stage1: { choice: null, key: null, side: null, rt: null },
      state: null,
      transition: null,
      stage2: { choice: null, key: null, side: null, rt: null },
      reward: null,
      missed_stage: null,
      sim: { 1: null, 2: null }
    };
  }
  function shipsHtml(o, plan, chosen = null, below = "") {
    const left = plan.ship_left;
    const right = other(left, SHIPS2);
    return renderPair({
      left: renderShip(framingOf(o), left),
      right: renderShip(framingOf(o), right),
      chosen,
      framing: framingOf(o),
      state: null,
      below
    });
  }
  function optionsHtml(o, plan, state, chosen = null, below = "") {
    const left = plan.alien_left[state];
    const right = other(left, OPTIONS2);
    return renderPair({
      left: renderOption(framingOf(o), state, left),
      right: renderOption(framingOf(o), state, right),
      chosen,
      framing: framingOf(o),
      state,
      below
    });
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
        (_a2 = a.on_finish) == null ? void 0 : _a2.call(a, d);
      }
    };
  }
  function drawDurations(jsPsych, o) {
    return {
      fixation: sampleDuration(jsPsych, o.fixation_duration_ms),
      iti: sampleDuration(jsPsych, o.iti_ms),
      feedback: sampleDuration(jsPsych, o.feedback_duration_ms),
      acknowledgement_1: sampleDuration(jsPsych, o.response_acknowledgement_ms),
      acknowledgement_2: sampleDuration(jsPsych, o.response_acknowledgement_ms),
      timeout_message: sampleDuration(jsPsych, o.timeout_message_ms),
      window: o.response_window_ms === null ? null : sampleDuration(jsPsych, o.response_window_ms)
    };
  }
  function scheduleLabel(o) {
    const s = o.reward_schedule;
    return `random_walk sd=${s.sd} bounds=[${s.bounds[0]},${s.bounds[1]}] boundary=${s.boundary}`;
  }
  function createChoice(a, st, d, stage) {
    const { ctx, o, plan } = a;
    const keys = [...o.response_keys];
    const idsOnScreen = () => {
      if (stage === 1) return { left: plan.ship_left, right: other(plan.ship_left, SHIPS2) };
      const left = plan.alien_left[st.state];
      return { left, right: other(left, OPTIONS2) };
    };
    return {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => stage === 1 ? shipsHtml(o, plan) : optionsHtml(o, plan, st.state),
      choices: keys,
      trial_duration: d.window,
      data: baseData({
        phase: a.phase,
        part: "choice",
        stage,
        block: a.block,
        trial_index_in_block: a.trial_index_in_block,
        response_window: d.window
      }),
      on_start: () => {
        if (stage === 1) {
          Object.assign(st, newTrialState(plan), { attempt: st.attempt + 1 });
        }
      },
      on_finish: (row) => {
        delete row.stimulus;
        const key = typeof row.response === "string" ? row.response : null;
        const side = sideOfKey(o, key);
        const ids = idsOnScreen();
        const choice = side === null ? null : side === "left" ? ids.left : ids.right;
        row.response = key;
        row.rt = key === null ? null : row.rt;
        row.timeout = key === null;
        row.attempt = st.attempt;
        row.side = side;
        row.left = ids.left;
        row.right = ids.right;
        row.choice = choice;
        row.state = stage === 1 ? null : st.state;
        row.condition = st.transition;
        if (stage === 1) {
          st.stage1 = { choice, key, side, rt: row.rt };
          if (choice === null) {
            st.missed_stage = 1;
          } else {
            const common = COMMON_STATE[choice];
            st.state = plan.common ? common : other(common, STATES);
            st.transition = plan.common ? "common" : "rare";
            row.condition = st.transition;
          }
        } else {
          st.stage2 = { choice, key, side, rt: row.rt };
          if (choice === null) {
            st.missed_stage = 2;
          } else {
            const reward = plan.rewards[st.state][choice] ? 1 : 0;
            st.reward = reward;
            ctx.state.total[a.phase] += reward;
            ctx.agent.update(
              st.stage1.choice,
              st.state,
              choice,
              reward
            );
          }
        }
      },
      // data-only simulation: a hybrid learner (see simulation.ts)
      simulation_options: () => {
        if (hasForcedRt(ctx.jsPsych)) return {};
        if (st.sim[stage] === null) {
          let side;
          if (stage === 1) {
            const ship = ctx.agent.chooseFirst();
            side = plan.ship_left === ship ? "left" : "right";
          } else {
            const option = ctx.agent.chooseSecond(st.state);
            side = plan.alien_left[st.state] === option ? "left" : "right";
          }
          const rt = ctx.agent.rt(stage === 2 && st.transition === "rare");
          const missed = d.window !== null && rt > d.window;
          st.sim[stage] = missed ? { response: null, rt: null } : { response: keyForSide(o, side), rt };
        }
        return { data: st.sim[stage] };
      }
    };
  }
  function createAcknowledgement(a, st, ms, stage) {
    const { o, plan } = a;
    return createDisplayTrial({
      phase: a.phase,
      part: "acknowledgement",
      block: a.block,
      stimulus: () => {
        const side = stage === 1 ? st.stage1.side : st.stage2.side;
        return stage === 1 ? shipsHtml(o, plan, side) : optionsHtml(o, plan, st.state, side);
      },
      duration: ms,
      data: { stage, trial_index_in_block: a.trial_index_in_block, response_acknowledgement: ms },
      on_finish: (row) => {
        row.attempt = st.attempt;
      }
    });
  }
  function outcomeHtml(ctx, o, st, phase, captionHtml) {
    const t = ctx.text;
    const rewarded = st.reward === 1;
    const side = st.stage2.side;
    const left = st.plan.alien_left[st.state];
    const id = side === "left" ? left : other(left, OPTIONS2);
    const total = o.running_score_display === "running_total" ? `<p>${t.running_total({ total: ctx.state.total[phase] })}</p>` : "";
    const caption = captionHtml != null ? captionHtml : `<div class="ts-text"><p class="ts-outcome-text">${rewarded ? t.outcome_coin : t.outcome_none}</p>${total}</div>`;
    return renderStage(
      `<div class="ts-outcome">${renderOption(
      framingOf(o),
      st.state,
      id,
      72
    )}${renderCoin(rewarded, 40)}</div>`,
      framingOf(o),
      st.state,
      caption
    );
  }
  function createOutcome(a, st, ms) {
    return createDisplayTrial({
      phase: a.phase,
      part: "feedback",
      block: a.block,
      stimulus: () => outcomeHtml(a.ctx, a.o, st, a.phase),
      duration: ms,
      data: {
        trial_index_in_block: a.trial_index_in_block,
        feedback_duration: ms,
        feedback_kind: "outcome"
      },
      on_finish: (row) => {
        row.attempt = st.attempt;
        row.reward = st.reward;
        row.running_total = a.o.running_score_display === "running_total" ? a.ctx.state.total[a.phase] : null;
      }
    });
  }
  function createTimeoutMessage(a, st, ms) {
    return createDisplayTrial({
      phase: a.phase,
      part: "timeout_message",
      block: a.block,
      stimulus: () => renderMessage(framingOf(a.o), st.missed_stage === 2 ? st.state : null, a.ctx.text.too_slow),
      duration: ms,
      data: { trial_index_in_block: a.trial_index_in_block, timeout_message: ms },
      on_finish: (row) => {
        row.attempt = st.attempt;
        row.stage = st.missed_stage;
      }
    });
  }
  function createSummary(a, st, d) {
    const { o, plan } = a;
    return {
      type: HtmlKeyboardResponsePlugin,
      css_classes: [TASK_CLASS],
      // a blank, painted display (as the ITI): an empty one could flash the page colour for a frame
      stimulus: renderStage("", framingOf(o), null),
      choices: "NO_KEYS",
      trial_duration: 0,
      data: baseData({
        phase: a.phase,
        part: "response",
        block: a.block,
        trial_index_in_block: a.trial_index_in_block,
        response_window: d.window,
        common_transition_prob: o.common_transition_prob,
        reward_walk: scheduleLabel(o)
      }),
      on_finish: (row) => {
        delete row.stimulus;
        const missed = st.missed_stage !== null;
        row.attempt = st.attempt;
        row.condition = st.transition;
        row.stage1_choice = st.stage1.choice;
        row.stage1_key = st.stage1.key;
        row.stage1_side = st.stage1.side;
        row.stage1_rt = st.stage1.rt;
        row.stage1_left = plan.ship_left;
        row.stage2_state = st.state;
        row.transition = st.transition;
        row.stage2_choice = st.stage2.choice;
        row.stage2_key = st.stage2.key;
        row.stage2_side = st.stage2.side;
        row.stage2_rt = st.stage2.rt;
        row.stage2_left = st.state === null ? null : plan.alien_left[st.state];
        row.reward = st.reward;
        row.reward_probs = plan.probs;
        row.planned_transition = plan.common ? "common" : "rare";
        row.missed = missed;
        row.missed_stage = st.missed_stage;
        row.response = st.stage1.key;
        row.rt = st.stage1.rt;
        row.timeout = missed;
      }
    };
  }
  function createTrial(a) {
    const { ctx, o } = a;
    const d = drawDurations(ctx.jsPsych, o);
    const st = newTrialState(a.plan);
    const ack = o.response_acknowledgement === "highlight";
    const nodes = [];
    if (d.fixation > 0) {
      nodes.push(
        createDisplayTrial({
          phase: a.phase,
          part: "fixation",
          block: a.block,
          stimulus: renderFixation(framingOf(o), ctx.text.fixation),
          duration: d.fixation,
          data: { trial_index_in_block: a.trial_index_in_block, fixation_duration: d.fixation }
        })
      );
    }
    nodes.push(createChoice(a, st, d, 1));
    if (ack && d.acknowledgement_1 > 0) {
      nodes.push({
        timeline: [createAcknowledgement(a, st, d.acknowledgement_1, 1)],
        conditional_function: () => st.stage1.choice !== null
      });
    }
    const second = [createChoice(a, st, d, 2)];
    if (ack && d.acknowledgement_2 > 0) {
      second.push({
        timeline: [createAcknowledgement(a, st, d.acknowledgement_2, 2)],
        conditional_function: () => st.stage2.choice !== null
      });
    }
    if (d.feedback > 0) {
      second.push({
        timeline: [createOutcome(a, st, d.feedback)],
        conditional_function: () => st.stage2.choice !== null
      });
    }
    nodes.push({ timeline: second, conditional_function: () => st.stage1.choice !== null });
    if (d.timeout_message > 0) {
      nodes.push({
        timeline: [createTimeoutMessage(a, st, d.timeout_message)],
        conditional_function: () => st.missed_stage !== null
      });
    }
    nodes.push(createSummary(a, st, d));
    if (d.iti > 0) {
      nodes.push(
        createDisplayTrial({
          phase: a.phase,
          part: "iti",
          block: a.block,
          stimulus: renderStage("", framingOf(o), null),
          duration: d.iti,
          data: { trial_index_in_block: a.trial_index_in_block, iti: d.iti }
        })
      );
    }
    const repeat = o.missed_response_handling === "repeat_trial";
    return {
      timeline: nodes,
      loop_function: () => repeat && st.missed_stage !== null && st.attempt <= MAX_TRIAL_REPEATS
    };
  }
  function createBlock(ctx, phase, block, plans) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    return {
      timeline: plans.map(
        (plan, i) => createTrial({ ctx, o, phase, block, trial_index_in_block: i + 1, plan })
      )
    };
  }
  function blockSizes(o) {
    return splitTrials(o.n_test_trials, o.n_blocks);
  }
  function createSchedule(ctx, phase) {
    const o = phase === "practice" ? ctx.practice : ctx.test;
    return phase === "practice" ? buildSchedule(ctx.jsPsych, o, o.practice_trials) : buildSchedule(ctx.jsPsych, o, o.n_test_trials, blockSizes(o));
  }
  function textPage(ctx, html, phase, part, label) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: textHtml(html),
      choices: [label != null ? label : ctx.text.continue_button],
      data: baseData({ phase, part }),
      on_finish: (d) => {
        delete d.stimulus;
      }
    };
  }
  function createTransition(ctx, html, phase, part = "transition") {
    return textPage(ctx, html, phase, part);
  }
  function createInstructions(ctx) {
    const o = ctx.test;
    if (o.instruction_format === "experimenter") return { timeline: [] };
    const t = ctx.text;
    const words = ctx.words;
    const pages = [
      t.instruction_intro({ words }),
      t.instruction_response({
        words,
        left_key: keyName(o.response_keys[0]),
        right_key: keyName(o.response_keys[1]),
        repeat_missed: o.missed_response_handling === "repeat_trial",
        sides_vary: o.option_side_assignment !== "fixed",
        window_seconds: o.response_window_ms === null ? null : typeof o.response_window_ms === "number" ? o.response_window_ms / 1e3 : o.response_window_ms.max / 1e3
      })
    ];
    if (o.contingency_disclosure !== "none") {
      pages.push(
        t.instruction_transitions({
          words,
          common_percent: Math.round(o.common_transition_prob * 100),
          mapping: o.contingency_disclosure === "full"
        }),
        t.instruction_drift({ words })
      );
    }
    return { timeline: pages.map((p) => textPage(ctx, p, "instructions", "instruction")) };
  }
  var statement = (html) => `<div class="ts-statement">${html}</div>`;
  function demoPlan() {
    const probs = {
      red: { option_1: 0.5, option_2: 0.5 },
      blue: { option_1: 0.5, option_2: 0.5 }
    };
    const rewards = {
      red: { option_1: true, option_2: true },
      blue: { option_1: true, option_2: true }
    };
    return {
      index: 0,
      common: true,
      probs,
      rewards,
      ship_left: "A",
      alien_left: { red: "option_1", blue: "option_1" }
    };
  }
  function demoSteps(ctx) {
    const o = ctx.test;
    const t = ctx.text;
    const words = ctx.words;
    const framing = framingOf(o);
    const plan = demoPlan();
    const key = (side) => keyLabel(o, side);
    const steps = [];
    const s1 = { words, side: "left", key: key("left") };
    steps.push({
      id: "first_choice",
      render: (cap2) => shipsHtml(o, plan, null, cap2),
      side: "left",
      prompt: t.step_first(s1),
      hint: t.step_first_hint(s1),
      reveal: t.step_first_reveal(s1)
    });
    const stateName = words.state_name.red;
    const s2 = { words, side: "right", key: key("right"), state_name: stateName };
    steps.push({
      id: "second_choice",
      render: (cap2) => optionsHtml(o, plan, "red", null, cap2),
      side: "right",
      prompt: t.step_second(s2),
      hint: t.step_second_hint(s2),
      reveal: t.step_second_reveal(s2)
    });
    if (o.contingency_disclosure === "full") {
      SHIPS2.forEach((ship, i) => {
        const side = i === 0 ? "right" : "left";
        const common = COMMON_STATE[ship];
        const names = { first_name: words.first_name[ship], state_name: words.state_name[common] };
        const a = __spreadValues({ words, side, key: key(side) }, names);
        const q = {
          words,
          first_name: names.first_name,
          left_key: key("left"),
          right_key: key("right")
        };
        const picture = `<span class="ts-inline">${renderShip(framing, ship, 40)}</span> `;
        const pair = (cap2) => {
          const left = side === "left" ? common : other(common, STATES);
          const right = other(left, STATES);
          return renderPair({
            left: renderState(framing, left),
            right: renderState(framing, right),
            framing,
            state: null,
            below: cap2
          });
        };
        steps.push({
          id: `mapping_${ship}`,
          render: (cap2) => pair(cap2),
          side,
          prompt: picture + t.check_mapping(q),
          hint: picture + t.check_mapping_hint(a),
          reveal: picture + t.check_mapping_reveal(a)
        });
      });
    } else if (o.contingency_disclosure === "partial") {
      const side = "left";
      const a = { words, side, key: key(side) };
      const q = { words, left_key: key("left"), right_key: key("right") };
      steps.push({
        id: "statement_transitions",
        render: (cap2) => renderPair({
          left: statement(t.statement_transitions_true({ words })),
          right: statement(t.statement_transitions_false({ words })),
          framing,
          state: null,
          below: cap2
        }),
        side,
        prompt: t.check_statement(q),
        hint: t.check_statement_hint(a),
        reveal: t.check_statement_reveal(a)
      });
    }
    if (o.contingency_disclosure !== "none") {
      const side = "right";
      const a = { words, side, key: key(side) };
      const q = { words, left_key: key("left"), right_key: key("right") };
      steps.push({
        id: "statement_drift",
        render: (cap2) => renderPair({
          left: statement(t.statement_drift_false({ words })),
          right: statement(t.statement_drift_true({ words })),
          framing,
          state: null,
          below: cap2
        }),
        side,
        prompt: t.check_statement(q),
        hint: t.check_statement_hint(a),
        reveal: t.check_statement_reveal(a)
      });
    }
    return steps;
  }
  function createInstructionWalkthrough(ctx) {
    const o = ctx.test;
    if (o.instruction_format !== "text" || o.instruction_demonstration === "none") {
      return { timeline: [] };
    }
    const t = ctx.text;
    const nodes = [
      textPage(ctx, t.instruction_demo_intro({ words: ctx.words }), "instructions", "instruction")
    ];
    const steps = demoSteps(ctx);
    const plan = demoPlan();
    steps.forEach((step) => {
      const state = { attempt: 0, correct: null };
      const correctKey = keyForSide(o, step.side);
      const shown = (html) => step.render(textHtml(html));
      const stepData = { phase: "instructions", step: step.id };
      const response = {
        type: HtmlKeyboardResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => shown(step.prompt),
        choices: [...o.response_keys],
        data: baseData(__spreadProps(__spreadValues({}, stepData), { part: "instruction_check", correct_response: correctKey })),
        // data-only simulation answers correctly
        simulation_options: { data: { response: correctKey, rt: 600 } },
        on_finish: (d) => {
          const key = typeof d.response === "string" ? d.response : null;
          const correct = key !== null && key.toLowerCase() === correctKey.toLowerCase();
          state.attempt++;
          state.correct = correct;
          delete d.stimulus;
          d.response = key;
          d.timeout = key === null;
          d.correct = correct;
          d.attempt = state.attempt;
        }
      };
      const confirm = createDisplayTrial({
        phase: "instructions",
        part: "instruction_feedback",
        stimulus: () => shown(`<p><strong>${t.instruction_correct}</strong></p>`),
        duration: INSTRUCTION_CORRECT_MS,
        data: __spreadProps(__spreadValues({}, stepData), { feedback_kind: "correct" })
      });
      const note = (html, kind) => ({
        type: HtmlButtonResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: () => shown(`<p>${html}</p>`),
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
          { timeline: [note(step.hint, "hint")], conditional_function: again },
          {
            timeline: [note(step.reveal, "reveal")],
            conditional_function: () => state.correct === false && !again()
          }
        ],
        on_timeline_start: () => {
          state.attempt = 0;
          state.correct = null;
        },
        loop_function: again
      });
      if (step.id === "second_choice") {
        nodes.push({
          type: HtmlButtonResponsePlugin,
          css_classes: [TASK_CLASS],
          stimulus: () => {
            const st = newTrialState(plan);
            st.state = "red";
            st.stage2.side = "right";
            st.reward = 1;
            return outcomeHtml(
              ctx,
              o,
              st,
              "test",
              textHtml(`<p>${t.step_outcome({ words: ctx.words })}</p>`)
            );
          },
          choices: [t.continue_button],
          data: baseData({ phase: "instructions", part: "instruction_example", step: "outcome" }),
          on_finish: (d) => {
            delete d.stimulus;
          }
        });
      }
    });
    return { timeline: nodes };
  }
  function createPracticeIntro(ctx) {
    return textPage(
      ctx,
      ctx.text.instruction_practice_intro({
        words: ctx.words,
        timed: ctx.practice.response_window_ms !== null,
        sides_vary: ctx.practice.option_side_assignment !== "fixed"
      }),
      "instructions",
      "instruction"
    );
  }
  function createTestIntro(ctx) {
    return textPage(ctx, ctx.text.instruction_test_intro, "instructions", "instruction");
  }
  function createRestBreak(ctx, block) {
    return textPage(
      ctx,
      ctx.text.block_complete({ block, n_blocks: ctx.test.n_blocks }),
      "test",
      "rest"
    );
  }
  function createQuestionnaire(ctx) {
    const o = ctx.test;
    const framing = framingOf(o);
    const t = ctx.text;
    const trials = SHIPS2.map((ship, i) => {
      const common = COMMON_STATE[ship];
      const trueSide = i === 0 ? "left" : "right";
      const left = trueSide === "left" ? common : other(common, STATES);
      const caption = `<div class="ts-text"><p><span class="ts-inline">${renderShip(
      framing,
      ship,
      40
    )}</span> ${t.questionnaire_question({
      words: ctx.words,
      first_name: ctx.words.first_name[ship],
      left_key: keyLabel(o, "left"),
      right_key: keyLabel(o, "right")
    })}</p></div>`;
      return {
        type: HtmlKeyboardResponsePlugin,
        css_classes: [TASK_CLASS],
        stimulus: renderPair({
          left: renderState(framing, left),
          right: renderState(framing, other(left, STATES)),
          framing,
          state: null,
          below: caption
        }),
        choices: [...o.response_keys],
        data: baseData({ phase: "test", part: "manipulation_check", ship }),
        on_finish: (d) => {
          const key = typeof d.response === "string" ? d.response : null;
          const side = sideOfKey(o, key);
          const answer = side === null ? null : side === "left" ? left : other(left, STATES);
          delete d.stimulus;
          d.response = key;
          d.rt = key === null ? null : d.rt;
          d.answer = answer;
          d.common_state = common;
          d.correct = answer === common;
        }
      };
    });
    return {
      timeline: [textPage(ctx, t.questionnaire_intro, "test", "manipulation_check_intro"), ...trials]
    };
  }
  function createCompletion(ctx, calculate) {
    return {
      type: HtmlButtonResponsePlugin,
      css_classes: [TASK_CLASS],
      stimulus: () => {
        const s = calculate(ctx.jsPsych.data.get());
        return textHtml(
          `<h2>${ctx.text.task_complete}</h2>${ctx.text.result_summary({
          coins: s.total_reward,
          n_trials: s.n_trials,
          n_missed: s.n_missed
        })}`
        );
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
    const instructed = o.instruction_format === "text";
    if (instructed) {
      timeline.push(createInstructions(ctx));
      if (o.instruction_demonstration !== "none") timeline.push(createInstructionWalkthrough(ctx));
    }
    const practicePlans = createSchedule(ctx, "practice");
    const plans = createSchedule(ctx, "test");
    if (o.practice_trials > 0) {
      if (instructed) timeline.push(createPracticeIntro(ctx));
      timeline.push(createBlock(ctx, "practice", 1, practicePlans));
    }
    if (instructed) timeline.push(createTestIntro(ctx));
    let start = 0;
    blockSizes(o).forEach((n, i) => {
      const block = i + 1;
      timeline.push(createBlock(ctx, "test", block, plans.slice(start, start + n)));
      start += n;
      if (o.rest_breaks === "self_paced" && block < o.n_blocks)
        timeline.push(createRestBreak(ctx, block));
    });
    if (o.manipulation_check === "questionnaire") timeline.push(createQuestionnaire(ctx));
    timeline.push(createCompletion(ctx, calculateScores));
    return { timeline };
  }
  var timelineUnits = {
    createContext,
    createInstructions,
    createInstructionWalkthrough,
    createPracticeIntro,
    createTestIntro,
    createSchedule,
    createBlock,
    createTrial,
    createDisplayTrial,
    createTransition,
    createRestBreak,
    createQuestionnaire,
    createCompletion: (ctx) => createCompletion(ctx, calculateScores)
  };
  var utils = {
    scoring: { calculateScores, getSummary, trialTable },
    constants: {
      TASK_NAME,
      VERSION,
      TASK_CLASS,
      DEFAULT_OPTIONS,
      PHASE_OPTIONS,
      SHIP_IDS,
      STATE_IDS,
      OPTION_IDS,
      INSTRUCTION_MAX_ATTEMPTS,
      INSTRUCTION_CORRECT_MS,
      SIMULATION
    },
    text: { defaultText },
    stimuli: { renderShip, renderOption, renderState, renderCoin, renderPair, keyName },
    schedule: { buildSchedule, generateWalk, stepProbability, splitTrials },
    simulation: { setSimulatedAgent, getSimulatedAgent, HybridAgent },
    options: { resolveOptions, validateOptions }
  };

  exports.createTimeline = createTimeline;
  exports.timelineUnits = timelineUnits;
  exports.utils = utils;

  return exports;

})({});
//# sourceMappingURL=index.browser.js.map
//# sourceMappingURL=index.browser.js.map