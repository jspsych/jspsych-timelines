#!/usr/bin/env node

/**
 * Browser check of the standard's stage anchoring (PACKAGE-STANDARD 5).
 *
 *   node ../testing/scripts/layout-check.mjs reproduction/layout.config.mjs     (from a package)
 *
 * The config module default-exports a `LayoutConfig` (see src/layout.d.cts). Needs Chrome
 * ($CHROME_PATH or a standard location) and the package built (`npm run build`).
 * Exit code 1 if any screen moves the stage by more than the tolerance.
 */
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { runLayoutCheck, formatLayoutResults } = require("../src/layout.cjs");

const file = process.argv[2];
if (!file) {
  console.error("usage: layout-check.mjs <layout.config.mjs>");
  process.exit(2);
}
const config = (await import(pathToFileURL(resolve(file)).href)).default;
const results = await runLayoutCheck(config);
console.log(formatLayoutResults(results));
process.exit(results.every((r) => r.ok) ? 0 : 1);
