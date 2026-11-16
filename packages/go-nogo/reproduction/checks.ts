/**
 * Go/no-go checks. The checks for options every package shares (counts, blocks, proportions, order,
 * sequence constraints, durations, feedback, response keys and device) live in
 * `@jspsych-timelines/testing`; the contract that points them at the go/no-go data is `./contract.ts`.
 * This file has what is specific to this task:
 *
 * - checks for the task's own options (stimulus set, layout, termination rule, baseline blocks, ...)
 * - additional assertions on shared options (practice proportions, the rules that need cross-block or
 *   chunk checks)
 */
import { Check, CheckSet, distinct, extendCheck, sharedChecks } from "@jspsych-timelines/testing";
import { allocate } from "@jspsych/sequencer";

import { BASELINE_TRIALS } from "../src/constants";
import type { GoNogoOptions, ResolvedOptions } from "../src/options";
import { stimulusId } from "../src/stimuli";
import { defaultText } from "../src/text";
import { contract } from "./contract";
import { evalStimulus, rowsOf, run, trialsOf } from "./harness";
import type { Run } from "./harness";

const test = (r: Run) => rowsOf(r, "test", "response");
type GoNogoCheck = Check<GoNogoOptions, ResolvedOptions>;

const withoutBaseline = (rows: any[]) => rows.filter((x) => x.condition !== "go_control");

/** Checks for the task's own options. */
const goNogoOnly: Record<string, GoNogoCheck> = {
  pre_block_countdown_ms: {
    requires: [],
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.pre_block_countdown_ms;
      const inTest = rowsOf(r, "test", "transition");
      const inPractice = rowsOf(r, "practice", "transition");
      if (v === 0) {
        expect(inTest).toHaveLength(0);
        expect(inPractice).toHaveLength(0);
        return;
      }
      expect(inTest).toHaveLength(r.eff.n_blocks);
      expect(inPractice).toHaveLength(r.eff.practice_trials > 0 ? 1 : 0);
      [...inTest, ...inPractice].forEach((x) => expect(x.duration_ms).toBe(v));
      // the countdown comes before the block's first trial
      const rows = r.rows;
      const first = rows.findIndex((x) => x.phase === "test" && x.part === "response");
      const idx = rows.findIndex((x) => x.phase === "test" && x.part === "transition");
      expect(idx).toBeLessThan(first);
    },
  },
  trial_termination_rule: {
    requires: [],
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.trial_termination_rule;
      test(r).forEach((x) => expect(x.trial_termination).toBe(v));
      // a response ends the trial only with response_or_timeout (data-only simulation ignores time)
      trialsOf(r, "response")
        .filter((t) => t.data.phase === "test")
        .forEach((t) => expect(t.response_ends_trial).toBe(v !== "fixed_duration"));
    },
  },
  stimulus_layout: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.stimulus_layout;
      const rows = test(r);
      const allowed =
        v === "random_2x2_grid"
          ? ["top_left", "top_right", "bottom_left", "bottom_right"]
          : [v === "top_center" ? "top_center" : "center"];
      rows.forEach((x) => expect(allowed).toContain(x.stimulus_location));
      if (v === "random_2x2_grid")
        expect(distinct(rows.map((x) => x.stimulus_location))).toHaveLength(4);
      // the rendered stage carries the recorded location
      const t = trialsOf(r, "response")[0];
      expect(evalStimulus(t)).toContain(`data-location="${t.data.stimulus_location}"`);
    },
  },
  stimulus_modality: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      expect(r.eff.stimulus_modality).toBe("visual");
      const html = evalStimulus(trialsOf(r, "response")[0]);
      expect(html).toMatch(/<svg|go-nogo-letter/);
    },
  },
  stimulus_set: {
    requires: [],
    kind: "behaviour",
    fn: async (r) => {
      const set = r.eff.stimulus_set;
      const goIds = set.go.map(stimulusId).sort();
      const nogoIds = set.nogo.map(stimulusId).sort();
      const rows = withoutBaseline(test(r));
      const seen = (cond: string) =>
        distinct(rows.filter((x) => x.condition === cond).map((x) => x.stimulus)).sort();
      const [g, n] = [seen("go"), seen("nogo")];
      // the two sets may have swapped roles (stimulus_role_assignment: random_per_participant)
      const swapped = r.eff.stimulus_role_assignment === "random_per_participant";
      const direct = JSON.stringify([g, n]) === JSON.stringify([goIds, nogoIds]);
      const swap = JSON.stringify([g, n]) === JSON.stringify([nogoIds, goIds]);
      expect(direct || (swapped && swap)).toBe(true);
      // every stimulus is drawn on the screen (shape or text), with its colour
      for (const item of [...set.go, ...set.nogo]) {
        const t = trialsOf(r, "response").find((x) => x.data.stimulus === stimulusId(item));
        expect(t).toBeDefined();
        const html = evalStimulus(t);
        if (item.text !== undefined && item.shape === undefined) expect(html).toContain(item.text);
        else expect(html).toContain("<svg");
        if (item.color) expect(html).toContain(item.color);
      }
    },
  },
  inter_trial_display: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.inter_trial_display;
      const cross = defaultText.fixation;
      const iti = trialsOf(r, "iti").filter((t) => t.data.phase === "test");
      const resp = trialsOf(r, "response").filter((t) => t.data.phase === "test");
      iti.forEach((t) => {
        const html = evalStimulus(t);
        if (v === "fixation_cross") expect(html).toContain("go-nogo-fixation");
        else expect(html).not.toContain(cross);
      });
      resp.forEach((t) => {
        // the cross is shown behind the trial once the stimulus has been hidden
        const bg = (t.prompt ?? "").includes("go-nogo-bgfix");
        expect(bg).toBe(v === "fixation_cross" && r.eff.stimulus_duration_ms !== null);
      });
    },
  },
  single_task_blocks: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const v = r.eff.single_task_blocks;
      const all = test(r);
      const base = all.filter((x) => x.condition === "go_control");
      const main = withoutBaseline(all);
      expect(main).toHaveLength(r.eff.n_test_trials);
      if (v === "none") return expect(base).toHaveLength(0);
      const blocks = v === "interleaved" ? r.eff.n_blocks : 1;
      expect(base).toHaveLength(blocks * BASELINE_TRIALS);
      base.forEach((x) => {
        expect(x.block).toBeNull();
        expect(x.correct_response).not.toBeNull();
      });
      expect(distinct(base.map((x) => x.baseline_block))).toHaveLength(blocks);
      const idx = (x: any) => r.rows.indexOf(x);
      if (v === "before_dual") expect(idx(base[0])).toBeLessThan(idx(main[0]));
      if (v === "after_dual") expect(idx(base[0])).toBeGreaterThan(idx(main[main.length - 1]));
    },
  },
  stimulus_role_assignment: {
    requires: [],
    kind: "behaviour",
    fn: async (r, { harness }) => {
      const v = r.eff.stimulus_role_assignment;
      const goIds = r.eff.stimulus_set.go.map(stimulusId).sort();
      const goOf = (run: Run) =>
        distinct(
          withoutBaseline(test(run))
            .filter((x) => x.condition === "go")
            .map((x) => x.stimulus)
        ).sort();
      if (v === "fixed") return expect(goOf(r)).toEqual(goIds);
      // drawn once per participant: stable within a run, both assignments occur across participants
      const short = { ...r.opts, n_test_trials: 10, practice_trials: 0 };
      const runs = await harness.runSeeds(short, ["a", "b", "c", "d", "e", "f", "g", "h"]);
      const sets = distinct(runs.map((x) => JSON.stringify(goOf(x))));
      expect(sets.length).toBe(2);
    },
  },
  block_feedback: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const v = r.eff.block_feedback;
      const rows = rowsOf(r, "test", "block_feedback");
      if (v === "none") return expect(rows).toHaveLength(0);
      expect(rows).toHaveLength(r.eff.n_blocks);
      const html = evalStimulus(trialsOf(r, "block_feedback")[0]);
      expect(html.includes("Accuracy")).toBe(v === "accuracy" || v === "accuracy_rt");
      expect(html.includes("response time")).toBe(v === "rt" || v === "accuracy_rt");
    },
  },
  response_acknowledgement: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.response_acknowledgement;
      const t = trialsOf(r, "response")[0];
      const keyboard = r.eff.response_device === "keyboard";
      // the button plugin renders the button group itself; stand it in for the click
      document.body.innerHTML =
        evalStimulus(t) +
        (keyboard
          ? ""
          : '<div id="jspsych-html-button-response-btngroup"><button>go</button></div>');
      t.on_load();
      const item = document.querySelector(".jspsych-timelines-go-nogo-item")!;
      if (keyboard)
        document.dispatchEvent(new KeyboardEvent("keydown", { key: r.eff.response_keys[0] }));
      else document.querySelector("button")!.click();
      const cls = v === "highlight" ? "acknowledge-highlight" : "acknowledge-mark";
      expect(item.classList.contains(cls)).toBe(v !== "none");
      expect(
        item.classList.contains("acknowledge-highlight") ||
          item.classList.contains("acknowledge-mark")
      ).toBe(v !== "none");
    },
  },
  rule_reminder: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.rule_reminder;
      trialsOf(r, "response")
        .filter((t) => t.data.phase === "test")
        .forEach((t) => {
          const has = (t.prompt ?? "").includes("Do not respond to");
          expect(has).toBe(v === "on_screen");
        });
    },
  },
  speed_accuracy_emphasis: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const v = r.eff.speed_accuracy_emphasis;
      const page = trialsOf(r, "instruction")[1].stimulus as string;
      const texts: Record<string, string> = {
        speed: defaultText.emphasis_speed,
        accuracy: defaultText.emphasis_accuracy,
        both: defaultText.emphasis_both,
      };
      for (const [k, text] of Object.entries(texts))
        expect(page.includes(text)).toBe(k === v && v !== "none");
    },
  },
};

/** Additional assertions on shared options. */
const proportionsPractice: Pick<GoNogoCheck, "fn"> = {
  fn: (r) => {
    // the practice block follows the practice override of the proportions
    const p = r.effP.condition_proportions;
    const rows = rowsOf(r, "practice", "response");
    // independent draws (trial_order: random) are only approximately balanced
    if (rows.length === 0 || r.effP.trial_order === "random") return;
    const [go, nogo] = allocate([p.go, p.nogo], rows.length);
    expect(rows.filter((x) => x.condition === "go")).toHaveLength(go);
    expect(rows.filter((x) => x.condition === "nogo")).toHaveLength(nogo);
  },
};

export const CHECKS: CheckSet<GoNogoOptions, ResolvedOptions> = {
  ...sharedChecks,
  ...goNogoOnly,
  condition_proportions: extendCheck(sharedChecks.condition_proportions, proportionsPractice),
};

export { contract, run };
