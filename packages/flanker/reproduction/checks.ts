/**
 * One check per option. Each reads the resolved option from the run and asserts that it took effect
 * in the simulated data or in the built timeline. Used by level 1 (one setting) and level 2 (a whole
 * study configuration).
 */
import { allocateCounts } from "../src/sequence";
import { defaultText } from "../src/text";
import { splitTrials } from "../src/trials";
import { Run, collectTrials, evalStimulus, rowsOf, run } from "./harness";

export type CheckKind = "behaviour" | "recorded-parameter" | "structure";
export interface Check {
  kind: CheckKind | ((sub: string) => CheckKind);
  fn: (r: Run) => Promise<void> | void;
}

const test = (r: Run) => rowsOf(r, "test", "response");
const practice = (r: Run) => rowsOf(r, "practice", "response");
const distinct = (xs: any[]) => [...new Set(xs)];
const coarse = (c: string) => (c.startsWith("neutral") ? "neutral" : c);
const trialsOf = (r: Run, part: string) =>
  collectTrials(r.built.timeline).filter((t) => t.data?.part === part);
const PX_PER_DEG = 37.8;

function expectedCountsPerBlock(r: Run, block: number) {
  const o = r.eff;
  const n = splitTrials(o.n_test_trials, o.n_blocks)[block - 1];
  const conds = Object.keys(o.condition_proportions).filter((k) => k !== "cued" && k !== "uncued");
  const counts = allocateCounts(
    conds.map((c) => (o.condition_proportions as any)[c]),
    n
  );
  return Object.fromEntries(conds.map((c, i) => [c, counts[i]]));
}

function observedCountsPerBlock(r: Run, block: number) {
  const rows = test(r).filter((x) => x.block === block);
  const keys = Object.keys(r.eff.condition_proportions).filter(
    (k) => k !== "cued" && k !== "uncued"
  );
  const out: Record<string, number> = {};
  for (const k of keys) {
    out[k] = rows.filter((x) =>
      k === "neutral" ? x.congruency === "neutral" : x.flanker_condition === k
    ).length;
  }
  return out;
}

export const CHECKS: Record<string, Check> = {
  // -- timing --
  cue_target_interval_ms: {
    kind: "behaviour",
    fn: (r) => {
      const v = r.eff.cue_target_interval_ms;
      const cues = rowsOf(r, "test", "cue");
      if (v === 0) {
        expect(cues).toHaveLength(0);
        test(r).forEach((x) => expect(x.cued).toBeNull());
      } else {
        const cued = test(r).filter((x) => x.cued === true);
        expect(cued.length).toBeGreaterThan(0);
        cued.forEach((x) => expect(x.cue_target_interval).toBe(v));
        const first = cues.filter((c) => !c.cue_gap);
        expect(first.length).toBe(cued.length);
        first.forEach((c) => expect(c.duration_ms).toBe(Math.min(250, v)));
        const gaps = cues.filter((c) => c.cue_gap);
        gaps.forEach((c) => expect(c.duration_ms).toBe(v - 250));
        expect(gaps.length).toBe(v > 250 ? cued.length : 0);
      }
    },
  },
  feedback_duration_ms: {
    kind: "recorded-parameter",
    fn: (r) => {
      const fb = rowsOf(r, "test", "feedback");
      expect(fb.length).toBeGreaterThan(0);
      fb.forEach((x) => expect(x.duration_ms).toBe(r.eff.feedback_duration_ms));
      trialsOf(r, "feedback")
        .filter((t) => t.data.phase === "test")
        .forEach((t) => expect(t.trial_duration).toBe(r.eff.feedback_duration_ms));
    },
  },
  fixation_duration_ms: {
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.fixation_duration_ms;
      const fx = rowsOf(r, "test", "fixation");
      if (v === 0) return expect(fx).toHaveLength(0);
      expect(fx).toHaveLength(test(r).length);
      if (typeof v === "number") fx.forEach((x) => expect(x.duration_ms).toBe(v));
      else {
        const step = v.step ?? 1;
        fx.forEach((x) => {
          expect(x.duration_ms).toBeGreaterThanOrEqual(v.min);
          expect(x.duration_ms).toBeLessThanOrEqual(v.max);
          expect((x.duration_ms - v.min) % step).toBe(0);
        });
        expect(distinct(fx.map((x) => x.duration_ms)).length).toBeGreaterThan(1);
      }
    },
  },
  iti_ms: {
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.iti_ms;
      const iti = rowsOf(r, "test", "iti");
      if (v === 0) return expect(iti).toHaveLength(0);
      expect(iti).toHaveLength(test(r).length);
      iti.forEach((x) => expect(x.duration_ms).toBe(v));
    },
  },
  response_window_ms: {
    kind: "behaviour",
    fn: async (r) => {
      const v = r.eff.response_window_ms;
      test(r).forEach((x) => expect(x.response_window).toBe(v));
      collectTrials(r.built.timeline)
        .filter((t) => t.data?.part === "response")
        .forEach((t) => expect(t.trial_duration).toBe(v));
      // a participant who is slower than the window times out; with no window nobody does
      const slow = await run(r.opts, { default: { data: { rt: 50000 } } });
      const slowRows = test(slow).filter((x) => x.congruency !== "nogo");
      if (v === null) slowRows.forEach((x) => expect(x.timeout).toBe(false));
      else slowRows.forEach((x) => expect(x.timeout).toBe(true));
    },
  },
  soa_ms: {
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.soa_ms;
      const pv = rowsOf(r, "test", "preview");
      test(r).forEach((x) => expect(x.flanker_target_soa).toBe(v));
      if (v === 0) expect(pv).toHaveLength(0);
      else {
        expect(pv).toHaveLength(test(r).length);
        pv.forEach((x) => expect(x.duration_ms).toBe(Math.abs(v)));
        // negative: flankers lead, so only the target slot is hidden; positive: only the flankers are
        const html = evalStimulus(trialsOf(r, "preview")[0]);
        const items = html
          .split('jspsych-timelines-flanker-item"')
          .slice(1)
          .map((x) => x.includes("visibility:hidden"));
        const mid = (items.length - 1) / 2;
        items.forEach((hidden, i) => expect(hidden).toBe(v < 0 ? i === mid : i !== mid));
      }
    },
  },
  stimulus_duration_ms: {
    kind: "recorded-parameter",
    fn: (r) => {
      const v = r.eff.stimulus_duration_ms;
      test(r).forEach((x) => expect(x.stimulus_duration).toBe(v));
      collectTrials(r.built.timeline)
        .filter((t) => t.data?.part === "response")
        .forEach((t) => expect(t.stimulus_duration).toBe(v));
    },
  },

  // -- stimulus --
  stimulus_color: {
    kind: "structure",
    fn: (r) => {
      const [fg, bg] = r.eff.stimulus_color.split(/\s+on\s+/);
      for (const part of ["response", "fixation"]) {
        const t = trialsOf(r, part)[0];
        // the colours paint the whole display, scoped to the task class (stimuli.ts paintDisplay)
        expect(evalStimulus(t)).toContain(
          `.jspsych-display-element:has(.jspsych-timelines-flanker){background:${bg};color:${fg};}`
        );
      }
    },
  },
  stimulus_layout: {
    // spacing is read from the data fields; position and orientation from the rendered HTML
    kind: (sub) => (sub === "spacing" ? "recorded-parameter" : "structure"),
    fn: (r) => {
      const { flanker_spacing: sp, array_position: pos, orientation } = r.eff.stimulus_layout;
      const rows = test(r);
      if (sp === "adjacent") {
        rows.forEach((x) => expect(x.flanker_distance).toBe(0));
      } else if (sp) {
        const gaps = Array.isArray(sp.gap) ? sp.gap : [sp.gap];
        rows.forEach((x) => {
          expect(gaps).toContain(x.flanker_distance);
          expect(x.flanker_distance_unit).toBe(sp.unit);
        });
        if (gaps.length > 1)
          expect(distinct(rows.map((x) => x.flanker_distance)).length).toBe(gaps.length);
        // rendered gap in px
        const t = trialsOf(r, "response")[0];
        const g =
          t.data.flanker_distance * (t.data.flanker_distance_unit === "deg" ? PX_PER_DEG : 1);
        expect(evalStimulus(t)).toContain(`gap:${g}px`);
      }
      const html = evalStimulus(trialsOf(r, "response")[0]);
      expect(html).toContain(`data-orientation="${orientation}"`);
      expect(html).toContain(`flex-direction:${orientation === "vertical" ? "column" : "row"}`);
      const m = /translateY\((-?[\d.]+)px\)/.exec(html)!;
      const off = parseFloat(m[1]);
      if (pos === "above_fixation") expect(off).toBeLessThan(0);
      else if (pos === "below_fixation") expect(off).toBeGreaterThan(0);
      else expect(off).toBe(0);
    },
  },
  stimulus_set: {
    kind: "behaviour",
    fn: (r) => {
      const ss = r.eff.stimulus_set;
      const rows = test(r);
      if (ss.target === "arrows") {
        rows
          .filter((x) => x.congruency !== "nogo")
          .forEach((x) => expect(["left", "right"]).toContain(x.target));
      } else if (ss.target) {
        const all = ss.target.letters.flat();
        rows.filter((x) => x.congruency !== "nogo").forEach((x) => expect(all).toContain(x.target));
        ss.target.letters.forEach((grp) =>
          grp.forEach((l) => expect(rows.some((x) => x.target === l)).toBe(true))
        );
      }
      const per = ss.flanker?.per_side ?? 2;
      const pers = Array.isArray(per) ? per : [per];
      rows.forEach((x) => expect(pers).toContain(x.flankers_per_side));
      pers.forEach((p) => expect(rows.some((x) => x.flankers_per_side === p)).toBe(true));
      const n = rows[0].flankers_per_side;
      const html = evalStimulus(
        trialsOf(r, "response").find((t) => t.data.flankers_per_side === n)!
      );
      expect((html.match(/jspsych-timelines-flanker-item"/g) ?? []).length).toBe(2 * n + 1);
      const forms = Array.isArray(ss.neutral_flanker)
        ? ss.neutral_flanker
        : [ss.neutral_flanker ?? "dashes"];
      const generic = rows.filter(
        (x) =>
          x.congruency === "neutral" &&
          !["neutral_dash", "neutral_empty"].includes(x.flanker_condition)
      );
      // independent of the package: which glyph each form must produce
      const glyphOf: Record<string, string> = {
        dashes: "dash",
        blank: "blank",
        straight_lines: "line",
        squares: "square",
        plus_signs: "plus",
        diamonds: "diamond",
        vertical_arrows: "up",
      };
      const taken = new Set(
        ss.target !== "arrows" && ss.target
          ? ss.target.letters.flat().map((l) => l.toUpperCase())
          : []
      );
      generic.forEach((x) => {
        const form = x.flanker_condition.slice("neutral_".length);
        const want = form === "unmapped_letter" ? x.flankers : glyphOf[form];
        expect(x.flankers).toBe(want);
        if (form === "unmapped_letter") {
          expect(taken.has(String(x.flankers).toUpperCase())).toBe(false);
          expect(String(x.flankers)).toMatch(/^[A-Z]$/);
        }
      });
      if (generic.length) {
        forms.forEach((f) =>
          expect(generic.some((x) => x.flanker_condition === `neutral_${f}`)).toBe(true)
        );
        generic.forEach((x) =>
          expect(forms.map((f) => `neutral_${f}`)).toContain(x.flanker_condition)
        );
      }
      rows
        .filter((x) => x.flanker_condition === "neutral_dash")
        .forEach((x) => expect(x.flankers).toBe("dash"));
      rows
        .filter((x) => x.flanker_condition === "neutral_empty")
        .forEach((x) => expect(x.flankers).toBe("blank"));
      const cue = ss.cue ?? "none";
      expect(rowsOf(r, "test", "cue").length > 0).toBe(cue !== "none");
    },
  },
  stimulus_size: {
    kind: "structure",
    fn: (r) => {
      const { value, unit } = r.eff.stimulus_size;
      const px =
        unit === "deg"
          ? value * PX_PER_DEG
          : unit === "screen_height_fraction"
          ? value * 768
          : value;
      const html = evalStimulus(trialsOf(r, "response")[0]);
      expect(html).toContain(`width:${px}px;height:${px}px`);
    },
  },
  targets_per_response: {
    kind: "behaviour",
    fn: (r) => {
      const t = r.eff.stimulus_set.target;
      const k = r.eff.targets_per_response;
      if (t === "arrows") return expect(k).toBe(1);
      t!.letters.forEach((g) => {
        expect(g).toHaveLength(k);
        g.forEach((l) => expect(test(r).some((x) => x.target === l)).toBe(true));
      });
    },
  },

  // -- design --
  concurrent_task: {
    kind: "behaviour",
    fn: (r) => {
      expect(r.eff.concurrent_task).toBe("none");
      expect(distinct(test(r).map((x) => x.task))).toEqual(["flanker"]);
    },
  },
  condition_proportions: {
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff;
      for (let b = 1; b <= o.n_blocks; b++) {
        if (o.trial_order === "random") break;
        expect(observedCountsPerBlock(r, b)).toEqual(expectedCountsPerBlock(r, b));
      }
      const { cued, uncued } = o.condition_proportions;
      if (cued !== undefined || uncued !== undefined) {
        const rows = test(r).filter((x) => x.block === 1);
        const nc = allocateCounts([cued ?? 0, uncued ?? 0], rows.length)[0];
        expect(rows.filter((x) => x.cued === true).length).toBe(nc);
      }
    },
  },
  condition_set: {
    kind: "behaviour",
    fn: (r) => {
      const seen = distinct(test(r).map((x) => coarse(x.flanker_condition))).sort();
      const want = distinct(r.eff.condition_set.map(coarse)).sort();
      expect(seen).toEqual(want);
    },
  },
  n_blocks: {
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff;
      expect(distinct(test(r).map((x) => x.block)).sort((a, b) => a - b)).toEqual(
        Array.from({ length: o.n_blocks }, (_, i) => i + 1)
      );
      splitTrials(o.n_test_trials, o.n_blocks).forEach((n, i) =>
        expect(test(r).filter((x) => x.block === i + 1)).toHaveLength(n)
      );
    },
  },
  n_test_trials: {
    kind: "behaviour",
    fn: (r) => expect(test(r)).toHaveLength(r.eff.n_test_trials),
  },
  trial_order: {
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff;
      if (o.trial_order === "random") {
        // independent draws: proportions are only approximate
        expect(test(r)).toHaveLength(o.n_test_trials);
        const exact = Array.from({ length: o.n_blocks }, (_, i) => i + 1).every(
          (b) =>
            JSON.stringify(observedCountsPerBlock(r, b)) ===
            JSON.stringify(expectedCountsPerBlock(r, b))
        );
        expect(exact).toBe(false);
      } else if (o.trial_order === "shuffled_list") {
        for (let b = 1; b <= o.n_blocks; b++) {
          expect(observedCountsPerBlock(r, b)).toEqual(expectedCountsPerBlock(r, b));
        }
        // shuffled: the first block is not grouped by condition
        const seq = test(r)
          .filter((x) => x.block === 1)
          .map((x) => x.flanker_condition);
        const runs = seq.filter((c, i) => i > 0 && c !== seq[i - 1]).length;
        if (seq.length >= 8) expect(runs).toBeGreaterThan(distinct(seq).length);
      } else {
        const seq = test(r)
          .filter((x) => x.block === 1)
          .map((x) => x.flanker_condition);
        expect(seq.slice(0, distinct(seq).length)).toEqual(distinct(seq));
      }
    },
  },

  // -- response --
  response_device: {
    kind: "behaviour",
    fn: (r) => {
      const d = r.eff.response_device;
      const trialType = d === "keyboard" ? "html-keyboard-response" : "html-button-response";
      test(r).forEach((x) => {
        expect(x.response_device).toBe(d);
        expect(x.trial_type).toBe(trialType);
      });
      if (d === "keyboard") {
        test(r).forEach((x) =>
          expect(typeof x.response === "string" || x.response === null).toBe(true)
        );
      } else {
        test(r).forEach((x) =>
          expect(typeof x.response === "number" || x.response === null).toBe(true)
        );
        expect(trialsOf(r, "response")[0].choices).toHaveLength(2);
      }
    },
  },
  response_hand: {
    kind: "structure",
    fn: (r) => {
      const page = rowsOf(r, "instructions", "instruction")[1].stimulus as string;
      const s =
        r.eff.response_hand === "one_hand_dominant"
          ? defaultText.hand_one_hand_dominant
          : defaultText.hand_two_hands_index_fingers;
      if (r.eff.response_device === "keyboard") expect(page).toContain(s);
    },
  },
  response_keys: {
    kind: "behaviour",
    fn: (r) => {
      const keys = r.eff.response_keys;
      if (r.eff.response_device !== "keyboard") return; // buttons are used instead of keys
      expect(trialsOf(r, "response")[0].choices).toEqual(keys);
      const lower = keys.map((k) => k.toLowerCase());
      test(r).forEach((x) => expect(lower).toContain(String(x.correct_response).toLowerCase()));
      lower.forEach((k) =>
        expect(test(r).some((x) => String(x.correct_response).toLowerCase() === k)).toBe(true)
      );
      test(r)
        .filter((x) => x.response !== null)
        .forEach((x) => expect(lower).toContain(String(x.response).toLowerCase()));
    },
  },
  response_mapping_counterbalancing: {
    kind: "behaviour",
    fn: async (r) => {
      const o = r.eff;
      const mappingOf = (rows: any[]) => {
        const m: Record<string, Set<string>> = {};
        rows.forEach((x) => (m[x.target] ??= new Set()).add(String(x.correct_response)));
        return JSON.stringify(
          Object.entries(m)
            .map(([k, v]) => [k, [...v]])
            .sort()
        );
      };
      if (o.response_mapping_counterbalancing === "fixed") {
        const [a, b] = (o.stimulus_set.target as any).letters.map((g: string[]) => g[0]);
        const first = test(r).find((x) => x.target === a)!;
        const second = test(r).find((x) => x.target === b)!;
        expect(first.correct_response).toBe(o.response_keys[0]);
        expect(second.correct_response).toBe(o.response_keys[1]);
      } else if (o.response_mapping_counterbalancing === "random_per_participant") {
        const seen = new Set<string>();
        for (const seed of ["a", "b", "c", "d", "e", "f", "g", "h"]) {
          const rr = await run(r.opts, { default: { data: { rt: 400 } } }, seed);
          // within a participant each letter keeps one key through the whole task
          expect(
            distinct(
              test(rr)
                .filter((x) => x.target === test(rr)[0].target)
                .map((x) => x.correct_response)
            )
          ).toHaveLength(1);
          seen.add(mappingOf(test(rr)));
        }
        expect(seen.size).toBeGreaterThan(1);
      } else if (o.response_mapping_counterbalancing === "within_participant") {
        const t = test(r);
        const letter = t[0].target;
        const b1 = t.find((x) => x.block === 1 && x.target === letter)!.correct_response;
        const b2 = t.find((x) => x.block === 2 && x.target === letter)!.correct_response;
        expect(b1).not.toBe(b2);
      }
    },
  },

  // -- procedure --
  attention_checks: {
    kind: "behaviour",
    fn: (r) => {
      const rows = rowsOf(r, "instructions", "attention_check");
      expect(rows).toHaveLength(r.eff.attention_checks === "instructed_items" ? 2 : 0);
      rows.forEach((x) => expect(x.correct_response).toBeDefined());
    },
  },
  device_eligibility: {
    kind: "behaviour",
    fn: async (r) => {
      if (r.eff.device_eligibility === "none") {
        return expect(rowsOf(r, "instructions", "device_check")).toHaveLength(0);
      }
      // desktop: passes silently
      expect(rowsOf(r, "instructions", "device_check")).toHaveLength(0);
      expect(test(r).length).toBeGreaterThan(0);
      // touch-only device: message, then the experiment ends
      const mm = (window as any).matchMedia;
      (window as any).matchMedia = (q: string) => ({ matches: q.includes("coarse") });
      try {
        const phone = await run(r.opts);
        expect(rowsOf(phone, "instructions", "device_check")).toHaveLength(1);
        expect(test(phone)).toHaveLength(0);
      } finally {
        (window as any).matchMedia = mm;
      }
    },
  },
  practice_trials: {
    kind: "behaviour",
    fn: (r) => expect(practice(r)).toHaveLength(r.eff.practice_trials),
  },
  rest_breaks: {
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff;
      const rest = rowsOf(r, "test", "rest");
      expect(rest).toHaveLength(o.rest_breaks === "self_paced" ? o.n_blocks - 1 : 0);
    },
  },
  screen_calibration: {
    kind: "structure",
    fn: (r) => {
      const v = r.eff.screen_calibration;
      const nodes = r.built.timeline.filter((n: any) => n.data?.part === "calibration");
      if (v === "none") return expect(nodes).toHaveLength(0);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].type.info.name).toBe("virtual-chinrest");
      expect(nodes[0].blindspot_reps).toBe(v === "credit_card" ? 0 : 5);
      expect(nodes[0].data.calibration).toBe(v);
    },
  },

  // -- feedback --
  block_feedback: {
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff;
      const rows = rowsOf(r, "test", "block_feedback");
      expect(rows).toHaveLength(o.block_feedback === "none" ? 0 : o.n_blocks);
      if (o.block_feedback === "accuracy" || o.block_feedback === "accuracy_rt") {
        rows.forEach((x) => expect(x.stimulus).toContain("Accuracy"));
      }
      if (o.block_feedback === "accuracy_rt")
        rows.forEach((x) => expect(x.stimulus).toContain("response time"));
    },
  },
  feedback_condition: {
    kind: "behaviour",
    fn: (r) => {
      const o = r.eff;
      const fb = rowsOf(r, "test", "feedback");
      const rows = test(r);
      if (o.trial_feedback === "none") return expect(fb).toHaveLength(0);
      const n =
        o.feedback_condition === "all"
          ? rows.length
          : o.feedback_condition === "errors_only"
          ? rows.filter((x) => !x.correct).length
          : rows.filter((x) => x.correct).length;
      expect(fb).toHaveLength(n);
    },
  },
  trial_feedback: {
    kind: "behaviour",
    fn: (r) => {
      const fb = rowsOf(r, "test", "feedback");
      const o = r.eff;
      if (o.trial_feedback === "none") expect(fb).toHaveLength(0);
      else {
        expect(fb.length).toBeGreaterThan(0);
        fb.forEach((x) => expect(x.feedback_kind).toBe(o.trial_feedback));
        if (o.trial_feedback === "accuracy_rt") {
          expect(fb.some((x) => /\d+ ms/.test(x.feedback_text))).toBe(true);
        }
        if (o.trial_feedback === "accuracy")
          fb.forEach((x) => expect(x.feedback_text).not.toMatch(/ ms/));
      }
      // practice follows the practice override (or the top-level value if one was given)
      const pf = rowsOf(r, "practice", "feedback");
      if (r.effP.trial_feedback === "none") expect(pf).toHaveLength(0);
      else {
        expect(pf.length).toBeGreaterThan(0);
        pf.forEach((x) => expect(x.feedback_kind).toBe(r.effP.trial_feedback));
      }
    },
  },

  // -- instructions --
  instruction_format: {
    kind: "behaviour",
    fn: (r) => {
      const ins = rowsOf(r, "instructions", "instruction");
      expect(ins.length > 0).toBe(r.eff.instruction_format === "text");
    },
  },
  speed_accuracy_emphasis: {
    kind: "structure",
    fn: (r) => {
      const o = r.eff;
      const page = rowsOf(r, "instructions", "instruction")[1].stimulus as string;
      const sentence = {
        speed: defaultText.emphasis_speed,
        accuracy: defaultText.emphasis_accuracy,
        both: defaultText.emphasis_both,
        none: "",
      }[o.speed_accuracy_emphasis];
      if (sentence) expect(page).toContain(sentence);
      else {
        for (const s of [
          defaultText.emphasis_speed,
          defaultText.emphasis_accuracy,
          defaultText.emphasis_both,
        ]) {
          expect(page).not.toContain(s);
        }
      }
    },
  },
};
