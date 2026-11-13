/**
 * Browser layout check (PACKAGE-STANDARD 5, stage anchoring). Not part of `npm test`: it needs a
 * Chrome and puppeteer-core.
 *
 * It serves a page that runs the package's browser bundle with given options, steps through the
 * task by pressing keys and clicking buttons, records the stage's bounding rect on every distinct
 * screen type, and asserts the stage centre is the same (within `tolerancePx`) on all of them, that
 * the text region below does not overlap the stage and that the response buttons stay inside the
 * viewport. The task supplies the selectors and how to tell its screens apart; the rest is shared.
 *
 * CommonJS so that jest, `node` and the CLI can all load it. The CLI is `scripts/layout-check.mjs`.
 */
const fs = require("fs");
const http = require("http");
const path = require("path");

/**
 * @typedef {Object} LayoutVariant
 * @property {string} name label, e.g. "keyboard 390x800"
 * @property {Object} options task options for `createTimeline`
 * @property {{width: number, height: number, hasTouch?: boolean}} viewport
 * @property {Record<string, string>} [keys] key to press on a screen kind: `{ array: "z" }`
 */
/**
 * @typedef {Object} LayoutConfig
 * @property {string} bundle path to the package's `dist/index.browser.js`
 * @property {string} global the bundle's global name, e.g. `jsPsychTimelineFlanker`
 * @property {string} stageSelector the fixed-size stage the standard anchors, e.g. `.jspsych-timelines-flanker-stage`
 * @property {string} [belowSelector] the text/button region below the stage
 * @property {(stage: Element | null, doc: Document) => string} screenKind names the screen type
 *   from the DOM. It is serialised and run in the page, so it must not use anything from this file.
 * @property {LayoutVariant[]} variants
 * @property {string[]} [expectKinds] screen kinds that must be seen at least once in every variant
 * @property {number} [tolerancePx] default 1
 * @property {number} [maxMs] stepping time limit per variant, default 60000
 * @property {string} [jspsychJs] default: the jspsych in node_modules
 * @property {string} [jspsychCss]
 * @property {string} [executablePath] Chrome; default: $CHROME_PATH or a standard location
 */

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
];

function findChrome(explicit) {
  const candidates = [explicit, process.env.CHROME_PATH, ...CHROME_PATHS].filter(Boolean);
  return candidates.find((p) => fs.existsSync(p));
}

/**
 * Compare samples of the screens seen in one variant. Pure; `samples` are what the page sampler
 * returns, one per distinct screen.
 * @returns {{ok: boolean, failures: string[], reference: {cx: number, cy: number} | null}}
 */
function assessScreens(samples, { tolerancePx = 1, expectKinds = [] } = {}) {
  const failures = [];
  const staged = samples.filter((s) => s.cx !== null);
  const ref = staged[0] ?? null;
  for (const s of staged) {
    const dx = Math.abs(s.cx - ref.cx);
    const dy = Math.abs(s.cy - ref.cy);
    if (dx > tolerancePx || dy > tolerancePx) {
      failures.push(
        `stage moved on "${s.kind}": centre (${s.cx.toFixed(1)}, ${s.cy.toFixed(
          1
        )}) vs (${ref.cx.toFixed(1)}, ${ref.cy.toFixed(1)}) on "${ref.kind}"`
      );
    }
    if (s.overlap) failures.push(`text region overlaps the stage on "${s.kind}"`);
    if (s.btnsVisible === false)
      failures.push(`response buttons outside the viewport on "${s.kind}"`);
  }
  const kinds = new Set(samples.map((s) => s.kind));
  for (const k of expectKinds) if (!kinds.has(k)) failures.push(`screen kind "${k}" never seen`);
  if (!staged.length) failures.push("no screen with a stage was seen");
  return {
    ok: failures.length === 0,
    failures,
    reference: ref ? { cx: ref.cx, cy: ref.cy } : null,
  };
}

/** Runs in the page. Serialised, so it is self-contained. */
function pageSampler(stageSelector, belowSelector, kindSource) {
  const content = document.querySelector("#jspsych-content");
  if (!content) return null;
  const stage = document.querySelector(stageSelector);
  const below = belowSelector ? document.querySelector(belowSelector) : null;
  const r = stage ? stage.getBoundingClientRect() : null;
  const bw = below ? below.getBoundingClientRect() : null;
  const kind = (0, eval)("(" + kindSource + ")")(stage, document);
  const txt = (below ? below.textContent || "" : "").trim().replace(/\s+/g, " ").slice(0, 24);
  const buttons = [...document.querySelectorAll(".jspsych-btn")].map((b) =>
    b.getBoundingClientRect()
  );
  return {
    kind,
    txt,
    btn: !!document.querySelector("#jspsych-html-button-response-btngroup"),
    vw: innerWidth,
    vh: innerHeight,
    cx: r ? r.x + r.width / 2 : null,
    cy: r ? r.y + r.height / 2 : null,
    stage: r ? `${Math.round(r.width)}x${Math.round(r.height)}` : "-",
    btnsVisible: buttons.length
      ? buttons.every(
          (b) => b.top >= 0 && b.bottom <= innerHeight && b.left >= 0 && b.right <= innerWidth
        )
      : null,
    overlap: r && bw ? bw.top < r.bottom - 0.5 : null,
    done: document.body.dataset.done === "1",
  };
}

function pageHtml(globalName) {
  return `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="stylesheet" href="/jspsych.css"></head><body>
<script src="/jspsych.js"></script><script src="/bundle.js"></script>
<script>
  const options = JSON.parse(decodeURIComponent(location.hash.slice(1)) || "{}");
  const jsPsych = initJsPsych({ on_finish: () => { document.body.dataset.done = "1"; } });
  jsPsych.run([window.${globalName}.createTimeline(jsPsych, options)]);
</script></body></html>`;
}

function serve(files, html) {
  const server = http.createServer((req, res) => {
    const url = req.url.split("#")[0].split("?")[0];
    if (url === "/") return void res.writeHead(200, { "content-type": "text/html" }).end(html);
    const f = files[url];
    if (!f) return void res.writeHead(404).end();
    const type = url.endsWith(".css") ? "text/css" : "text/javascript";
    res.writeHead(200, { "content-type": type }).end(fs.readFileSync(f));
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Run the layout check. Resolves to one result per variant:
 * `{ name, samples, ok, failures, reference }`.
 * @param {LayoutConfig} config
 */
async function runLayoutCheck(config) {
  let puppeteer;
  try {
    puppeteer = require("puppeteer-core");
  } catch {
    throw new Error(
      "the layout check needs puppeteer-core (it is a devDependency of @jspsych-timelines/testing)"
    );
  }
  const executablePath = findChrome(config.executablePath);
  if (!executablePath)
    throw new Error("no Chrome found: set $CHROME_PATH or config.executablePath");
  const resolveFrom = (m) => require.resolve(m, { paths: [process.cwd(), __dirname] });
  // jspsych's package exports expose only css/*; the browser build sits next to it
  const css = config.jspsychCss ?? resolveFrom("jspsych/css/jspsych.css");
  const files = {
    "/bundle.js": path.resolve(config.bundle),
    "/jspsych.js":
      config.jspsychJs ?? path.join(path.dirname(css), "..", "dist", "index.browser.js"),
    "/jspsych.css": css,
  };
  for (const f of Object.values(files)) {
    if (!fs.existsSync(f))
      throw new Error(`missing file for the layout page: ${f} (build the package first?)`);
  }
  const server = await serve(files, pageHtml(config.global));
  const base = `http://127.0.0.1:${server.address().port}/`;
  const browser = await puppeteer.launch({ executablePath, headless: "new" });
  const results = [];
  try {
    for (const variant of config.variants) {
      const page = await browser.newPage();
      await page.setViewport({ hasTouch: false, ...variant.viewport });
      await page.goto(base + "#" + encodeURIComponent(JSON.stringify(variant.options)));
      const seen = new Map();
      const kindSource = config.screenKind.toString();
      const t0 = Date.now();
      let done = false;
      while (!done && Date.now() - t0 < (config.maxMs ?? 60000)) {
        await sleep(40);
        const s = await page
          .evaluate(pageSampler, config.stageSelector, config.belowSelector ?? null, kindSource)
          .catch(() => null);
        if (s) {
          const key = `${s.kind}|${s.txt}|btn=${s.btn}`;
          if (!seen.has(key)) seen.set(key, s);
          done = s.done;
        } else if (await page.evaluate(() => document.body.dataset.done === "1").catch(() => false))
          done = true;
        const buttons = await page.$$(".jspsych-btn:not([disabled])").catch(() => []);
        if (buttons.length) await buttons[0].click().catch(() => {});
        else if (s && variant.keys && variant.keys[s.kind])
          await page.keyboard.press(variant.keys[s.kind]);
      }
      await page.close();
      const samples = [...seen.values()];
      results.push({
        name: variant.name,
        samples,
        finished: done,
        ...assessScreens(samples, {
          tolerancePx: config.tolerancePx,
          expectKinds: config.expectKinds,
        }),
      });
    }
  } finally {
    await browser.close();
    server.close();
  }
  return results;
}

/** One line per screen, then a verdict; for the CLI. */
function formatLayoutResults(results) {
  const lines = [];
  for (const r of results) {
    lines.push(`\n== ${r.name}${r.finished ? "" : " (did not finish)"}`);
    for (const s of r.samples) {
      lines.push(
        `   ${s.kind.padEnd(10)} btn=${s.btn ? 1 : 0} centre=(${s.cx?.toFixed(1)}, ${s.cy?.toFixed(
          1
        )}) stage=${s.stage} ` +
          `vp=${s.vw}x${s.vh} btnVisible=${s.btnsVisible} overlap=${s.overlap} "${s.txt}"`
      );
    }
    for (const f of r.failures) lines.push(`   FAIL ${f}`);
  }
  const bad = results.reduce((a, r) => a + r.failures.length, 0);
  lines.push(bad ? `\nFAIL: ${bad} problem(s)` : "\nALL STAGE CENTRES IDENTICAL");
  return lines.join("\n");
}

module.exports = { runLayoutCheck, assessScreens, formatLayoutResults, findChrome };
