/**
 * Two-step task checks. The checks for options every package shares (counts, blocks, durations,
 * response window) live in `@jspsych-timelines/testing`; the contract that points them at this
 * package's data is `./contract.ts`. This file has the checks for the task's own options, and one
 * replacement: the shared `response_keys` check asserts that every key is some row's correct response,
 * which a task without a correct answer cannot meet. This one asserts the same about the keys that were
 * pressed and the keys the trials listen for.
 */
import { Check, CheckSet, sharedChecks } from "@jspsych-timelines/testing";

import { MAX_TRIAL_REPEATS } from "../src/constants";
import type { ResolvedOptions, TwoStepTaskOptions } from "../src/options";
import { renderShip } from "../src/stimuli";
import { scheduleLabel } from "../src/trials";
import { contract } from "./contract";
import { evalStimulus, rowsOf, trialsOf } from "./harness";
import type { Run } from "./harness";

const test = (r: Run) => rowsOf(r, "test", "response");
type TwoStepCheck = Check<TwoStepTaskOptions, ResolvedOptions>;

const sd = (xs: number[]) => {
  const m = xs.reduce((a, b) => a + b, 0) / xs.length;
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};

const OPTIONS = ["option_1", "option_2"] as const;
const STATES = ["red", "blue"] as const;

/** Checks for the task's own options. */
const taskOnly: Record<string, TwoStepCheck> = {
  common_transition_prob: {
    requires: [],
    kind: "behaviour",
    fn: async (r, { harness }) => {
      const p = r.eff.common_transition_prob;
      const runs = [r, ...(await harness.runSeeds(r.opts, ["a", "b", "c"]))];
      const rows = runs.flatMap((x) => test(x));
      rows.forEach((x) => {
        expect(["common", "rare"]).toContain(x.transition);
        expect(x.transition).toBe(x.planned_transition);
        expect(x.condition).toBe(x.transition);
      });
      const share = rows.filter((x) => x.transition === "common").length / rows.length;
      const se = Math.sqrt((p * (1 - p)) / rows.length);
      expect(Math.abs(share - p)).toBeLessThan(4 * se);
      // the state reached follows the transition: option A usually leads to red, B to blue
      rows.forEach((x) => {
        const common = x.stage1_choice === "A" ? "red" : "blue";
        expect(x.stage2_state).toBe(
          x.transition === "common" ? common : common === "red" ? "blue" : "red"
        );
      });
    },
  },
  reward_probability: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      // the first trial's probabilities are the starting values
      const first = test(r)[0].reward_probs;
      for (const s of STATES) {
        for (const o of OPTIONS) {
          const spec = r.eff.reward_probability[s][o];
          const p = first[s][o];
          if (typeof spec === "number") expect(p).toBeCloseTo(spec, 10);
          else {
            expect(p).toBeGreaterThanOrEqual(spec.min - 1e-12);
            expect(p).toBeLessThanOrEqual(spec.max + 1e-12);
          }
        }
      }
    },
  },
  reward_schedule: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const s = r.eff.reward_schedule as any;
      expect(s.kind).toBe("random_walk");
      const rows = test(r);
      rows.forEach((x) => expect(x.reward_walk).toBe(scheduleLabel(r.eff)));
      const steps: number[] = [];
      rows.forEach((x, i) => {
        for (const st of STATES)
          for (const o of OPTIONS) {
            const p = x.reward_probs[st][o];
            expect(p).toBeGreaterThanOrEqual(s.bounds[0] - 1e-12);
            expect(p).toBeLessThanOrEqual(s.bounds[1] + 1e-12);
            if (i > 0) steps.push(p - rows[i - 1].reward_probs[st][o]);
          }
      });
      // steps are Gaussian with the schedule's SD (a reversed or reflected step keeps its size)
      expect(sd(steps)).toBeGreaterThan(0.6 * s.sd);
      expect(sd(steps)).toBeLessThan(1.4 * s.sd);
    },
  },
  sequence_constraints: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      expect(r.eff.sequence_constraints).toBeNull();
      expect(test(r).length).toBeGreaterThan(0);
    },
  },
  timeout_message_ms: {
    requires: [],
    kind: "recorded-parameter",
    fn: async (r, { harness }) => {
      const v = r.eff.timeout_message_ms;
      // a normal run has no missed choices, so no message
      expect(rowsOf(r, "test", "timeout_message")).toHaveLength(0);
      const slow = await harness.runSlow(r.opts);
      const rows = rowsOf(slow, "test", "timeout_message");
      if (v === 0) return expect(rows).toHaveLength(0);
      expect(rows.length).toBeGreaterThan(0);
      rows.forEach((x) => {
        expect(x.stage).toBe(1);
        if (typeof v === "number") expect(x.timeout_message).toBe(v);
        else {
          expect(x.timeout_message).toBeGreaterThanOrEqual(v.min);
          expect(x.timeout_message).toBeLessThanOrEqual(v.max);
        }
      });
    },
  },
  missed_response_handling: {
    requires: [],
    kind: "behaviour",
    fn: async (r, { harness }) => {
      const mode = r.eff.missed_response_handling;
      test(r).forEach((x) => {
        expect(x.missed).toBe(false);
        expect(x.attempt).toBe(1);
        expect(x.reward === 0 || x.reward === 1).toBe(true);
      });
      // a participant too slow for every choice
      const slow = await harness.runSlow(r.opts);
      const rows = test(slow);
      rows.forEach((x) => {
        expect(x.missed).toBe(true);
        expect(x.missed_stage).toBe(1);
        expect(x.reward).toBeNull();
        expect(x.stage1_choice).toBeNull();
      });
      const n = r.eff.n_test_trials;
      if (mode === "skip_trial") {
        expect(rows).toHaveLength(n);
        rows.forEach((x) => expect(x.attempt).toBe(1));
      } else {
        // each trial is run again, up to the cap
        expect(rows).toHaveLength(n * (1 + MAX_TRIAL_REPEATS));
        expect(Math.max(...rows.map((x) => x.attempt))).toBe(1 + MAX_TRIAL_REPEATS);
      }
    },
  },
  option_side_assignment: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const mode = r.eff.option_side_assignment;
      const rows = test(r);
      const left = rows.map((x) => x.stage1_left);
      if (mode === "fixed") {
        expect(new Set(left).size).toBe(1);
        for (const s of STATES) {
          expect(
            new Set(rows.filter((x) => x.stage2_state === s).map((x) => x.stage2_left)).size
          ).toBe(1);
        }
      } else {
        expect(new Set(left).size).toBe(2);
        expect(new Set(rows.map((x) => x.stage2_left)).size).toBe(2);
      }
      if (mode === "counterbalanced") {
        const sizes = contract.blockSizes(r.eff);
        sizes.forEach((size, i) => {
          const inBlock = rows.filter((x) => x.block === i + 1);
          const a = inBlock.filter((x) => x.stage1_left === "A").length;
          expect(Math.abs(a - (size - a))).toBeLessThanOrEqual(1);
        });
      }
      // the recorded sides are what was drawn: the choice rows show the options in that order
      rowsOf(r, "test", "choice")
        .filter((x) => x.stage === 1)
        .forEach((x, i) => expect(x.left).toBe(left[i]));
    },
  },
  response_keys: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const keys = r.eff.response_keys;
      const lower = keys.map((k) => k.toLowerCase());
      const choiceTrials = trialsOf(r, "choice");
      expect(choiceTrials.length).toBeGreaterThan(0);
      choiceTrials.forEach((t) => expect(t.choices).toEqual(keys));
      const rows = rowsOf(r, "test", "choice");
      rows
        .filter((x) => x.response !== null)
        .forEach((x) => {
          expect(lower).toContain(String(x.response).toLowerCase());
          expect(x.side).toBe(String(x.response).toLowerCase() === lower[0] ? "left" : "right");
        });
      lower.forEach((k) =>
        expect(rows.some((x) => String(x.response).toLowerCase() === k)).toBe(true)
      );
      test(r).forEach((x) => expect(lower).toContain(String(x.response).toLowerCase()));
    },
  },
  comprehension_check: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      expect(r.eff.comprehension_check).toBe("none");
      expect(r.rows.filter((x) => x.part === "comprehension_check")).toHaveLength(0);
    },
  },
  fullscreen_enforcement: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      expect(r.eff.fullscreen_enforcement).toBe("none");
      expect(r.rows.filter((x) => String(x.trial_type).includes("fullscreen"))).toHaveLength(0);
    },
  },
  population_protocol: {
    requires: [],
    kind: "structure",
    fn: (r) => expect(r.eff.population_protocol).toBe("standard"),
  },
  manipulation_check: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rows = rowsOf(r, "test", "manipulation_check");
      if (r.eff.manipulation_check === "none") return expect(rows).toHaveLength(0);
      expect(rows.map((x) => x.ship)).toEqual(["A", "B"]);
      rows.forEach((x) => expect(typeof x.correct).toBe("boolean"));
    },
  },
  rest_breaks: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rows = rowsOf(r, "test", "rest");
      expect(rows).toHaveLength(r.eff.rest_breaks === "self_paced" ? r.eff.n_blocks - 1 : 0);
    },
  },
  response_acknowledgement: {
    requires: [],
    kind: "recorded-parameter",
    fn: (r) => {
      const acks = rowsOf(r, "test", "acknowledgement");
      if (r.eff.response_acknowledgement === "none") return expect(acks).toHaveLength(0);
      // one after each choice (no choice is missed in this run)
      expect(acks).toHaveLength(2 * test(r).length);
      acks.forEach((x) => expect(x.response_acknowledgement).toBe(x.duration_ms));
      trialsOf(r, "acknowledgement")
        .filter((t) => t.data.phase === "test")
        .forEach((t) => expect(t.trial_duration).toBe(r.eff.response_acknowledgement_ms));
    },
  },
  running_score_display: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const rows = rowsOf(r, "test", "feedback");
      expect(rows.length).toBeGreaterThan(0);
      if (r.eff.running_score_display === "none") {
        return rows.forEach((x) => expect(x.running_total).toBeNull());
      }
      let total = 0;
      rows.forEach((x) => {
        total += x.reward;
        expect(x.running_total).toBe(total);
      });
      // the displayed total is the sum of the trial rewards
      expect(total).toBe(test(r).reduce((a, x) => a + (x.reward ?? 0), 0));
    },
  },
  contingency_disclosure: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const steps = r.rows.filter((x) => x.part === "instruction_check").map((x) => x.step);
      const level = r.eff.contingency_disclosure;
      const expected =
        level === "none"
          ? ["first_choice", "second_choice"]
          : level === "partial"
          ? ["first_choice", "second_choice", "statement_transitions", "statement_drift"]
          : ["first_choice", "second_choice", "mapping_A", "mapping_B", "statement_drift"];
      expect(steps).toEqual(expected);
    },
  },
  instruction_format: {
    requires: [],
    kind: "behaviour",
    fn: (r) => {
      const pages = r.rows.filter((x) => x.phase === "instructions" && x.part === "instruction");
      if (r.eff.instruction_format === "experimenter") expect(pages).toHaveLength(0);
      else expect(pages.length).toBeGreaterThan(0);
    },
  },
  instruction_framing: {
    requires: [],
    kind: "structure",
    fn: (r) => {
      const framing = r.eff.instruction_framing as "abstract_symbols" | "spaceship_planet_alien";
      const first = evalStimulus(trialsOf(r, "choice").find((t) => t.data.stage === 1)!);
      expect(first).toContain(renderShip(framing, "A"));
      const otherFraming =
        framing === "abstract_symbols" ? "spaceship_planet_alien" : "abstract_symbols";
      expect(first).not.toContain(renderShip(otherFraming, "A"));
    },
  },
};

export const CHECKS: CheckSet<TwoStepTaskOptions, ResolvedOptions> = {
  ...sharedChecks,
  ...taskOnly,
};

export type { Run };
