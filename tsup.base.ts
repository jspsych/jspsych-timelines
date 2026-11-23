import { defineConfig } from "tsup";

/**
 * Shared build configuration for every timeline package (PACKAGE-STANDARD §10).
 * Emits dist/index.js (ESM), dist/index.cjs (CJS), dist/index.d.ts and
 * dist/index.browser.js (IIFE exposing `globalName`).
 */
export function makeTimelineConfig(globalName: string) {
  return defineConfig({
    entry: ["src/index.ts"],
    format: ["esm", "cjs", "iife"],
    globalName,
    sourcemap: true,
    dts: true,
    treeshake: true,
    clean: true,
    injectStyle: true,
    outExtension({ format }) {
      return format === "iife" ? { js: ".browser.js" } : {};
    },
  });
}
