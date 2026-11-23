import { simulateTimeline } from "@jspsych/test-utils";
import { DataCollection, JsPsych, initJsPsych } from "jspsych";

import { version } from "../package.json";
import { DEFAULT_OPTIONS, GoNogoOptions, resolveOptions, validateOptions } from "./options";
import { createTimeline, timelineUnits, utils } from ".";

async function simulate(
  jsPsych: JsPsych,
  options: GoNogoOptions,
  sim: Record<string, any> = { default: { data: { rt: 400 } } }
) {
  const { timeline } = createTimeline(jsPsych, options);
  const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", sim, jsPsych);
  await expectFinished();
  return getData().values() as any[];
}

const row = (o: Record<string, unknown>) => ({
  task: "go-nogo",
  task_version: version,
  phase: "test",
  part: "response",
  ...o,
});

function allTrials(tl: any, out: any[] = []): any[] {
  if (Array.isArray(tl)) tl.forEach((t) => allTrials(t, out));
  else if (tl?.timeline) allTrials(tl.timeline, out);
  else if (tl?.type) out.push(tl);
  return out;
}

describe("go-nogo", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("unit");
  });

  describe("createTimeline", () => {
    it("builds with default options and runs the Expfactory defaults: 10 practice and 350 test trials", async () => {
      const rows = await simulate(jsPsych, {});
      const count = (phase: string, part: string) =>
        rows.filter((r) => r.phase === phase && r.part === part).length;
      expect(count("practice", "response")).toBe(10);
      expect(count("test", "response")).toBe(350);
      // Expfactory: feedback in practice only, no ITI
      expect(count("practice", "feedback")).toBe(10);
      expect(count("test", "feedback")).toBe(0);
      expect(count("test", "iti")).toBe(0);
      expect(rows.filter((r) => r.part === "completion")).toHaveLength(1);
      const test = rows.filter((r) => r.phase === "test" && r.part === "response");
      expect(test.filter((r) => r.condition === "nogo")).toHaveLength(35);
      expect(rows.filter((r) => r.phase === "practice" && r.condition === "nogo")).toHaveLength(5);
    });

    it("builds a non-default configuration", async () => {
      const rows = await simulate(jsPsych, {
        n_test_trials: 24,
        n_blocks: 3,
        practice_trials: 0,
        condition_proportions: { go: 0.75, nogo: 0.25 },
        iti_ms: 300,
        block_feedback: "accuracy",
        trial_feedback: "accuracy",
        feedback_condition: "errors_only",
        instruction_format: "experimenter",
        single_task_blocks: "interleaved",
      });
      const test = rows.filter((r) => r.phase === "test" && r.part === "response");
      const main = test.filter((r) => r.condition !== "go_control");
      expect(main).toHaveLength(24);
      expect(test.filter((r) => r.condition === "go_control")).toHaveLength(48);
      expect(main.filter((r) => r.condition === "nogo")).toHaveLength(6);
      expect(rows.filter((r) => r.phase === "practice")).toHaveLength(0);
      // the experimenter explains the baseline blocks too
      expect(rows.filter((r) => r.part === "instruction")).toHaveLength(0);
      expect(rows.filter((r) => r.part === "block_feedback")).toHaveLength(3);
      expect(rows.filter((r) => r.part === "iti")).toHaveLength(72);
      expect(rows.filter((r) => r.part === "feedback")).toHaveLength(
        test.filter((r) => !r.correct).length
      );
    });

    it("tags every row with task and task_version, and every trial with the scoped class", async () => {
      const options: GoNogoOptions = {
        practice_trials: 2,
        n_test_trials: 4,
        iti_ms: 100,
        pre_block_countdown_ms: 200,
        block_feedback: "rt",
        trial_feedback: "accuracy",
      };
      const rows = await simulate(jsPsych, options);
      expect(rows.length).toBeGreaterThan(20);
      rows.forEach((r) => {
        expect(r.task).toBe("go-nogo");
        expect(r.task_version).toBe(version);
      });
      const { timeline } = createTimeline(initJsPsych(), options);
      const trials = allTrials(timeline);
      trials.forEach((t) => expect(t.css_classes).toEqual(["jspsych-timelines-go-nogo"]));
    });

    it("writes the response row fields and never the global trial_index", async () => {
      const rows = await simulate(jsPsych, { practice_trials: 0, n_test_trials: 10 });
      const t = rows.filter((r) => r.phase === "test" && r.part === "response");
      expect(t.map((r) => r.trial_index_in_block)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      t.forEach((r) => {
        expect(r.block).toBe(1);
        expect(["go", "nogo"]).toContain(r.condition);
        expect(typeof r.stimulus).toBe("string");
        expect(r.stimulus_location).toBe("center");
        expect(r.response_window).toBeGreaterThanOrEqual(1000);
        expect(r.response_window).toBeLessThanOrEqual(1500);
        expect(r.stimulus_duration).toBe(750);
        expect(r.trial_termination).toBe("fixed_duration");
        expect(r.response_device).toBe("keyboard");
        expect(r.correct_response).toBe(r.condition === "go" ? " " : null);
      });
    });
  });

  describe("no-response trials", () => {
    it("scores a no-go response as a commission error, and a withheld one as a correct rejection", async () => {
      // jsPsych's default simulated participant responds on every trial: every no-go is a commission error
      const base: GoNogoOptions = {
        practice_trials: 0,
        n_test_trials: 20,
        condition_proportions: { go: 0.5, nogo: 0.5 },
      };
      const all = (await simulate(jsPsych, base)).filter(
        (r) => r.phase === "test" && r.part === "response"
      );
      all
        .filter((r) => r.condition === "go")
        .forEach((r) => {
          expect(r.responded).toBe(true);
          expect(r.correct).toBe(true);
          expect(r.timeout).toBe(false);
        });
      all
        .filter((r) => r.condition === "nogo")
        .forEach((r) => {
          expect(r.responded).toBe(true);
          expect(r.correct).toBe(false);
          expect(r.rt).toBe(400);
        });
      // the named simulation options "nogo" let the caller withhold on no-go trials
      const withheld = (
        await simulate(initJsPsych(), base, {
          default: { data: { rt: 400 } },
          nogo: { data: { response: null, rt: null } },
        })
      ).filter((r) => r.phase === "test" && r.part === "response");
      withheld.filter((r) => r.condition === "go").forEach((r) => expect(r.correct).toBe(true));
      withheld
        .filter((r) => r.condition === "nogo")
        .forEach((r) => {
          expect(r.responded).toBe(false);
          expect(r.correct).toBe(true);
          expect(r.timeout).toBe(true);
          expect(r.response).toBeNull();
          expect(r.rt).toBeNull();
        });
    });

    it("scores a slow participant's go trials as omissions (timeouts)", async () => {
      const rows = await simulate(
        jsPsych,
        { practice_trials: 0, n_test_trials: 10 },
        { default: { data: { rt: 50000 } } }
      );
      const t = rows.filter((r) => r.phase === "test" && r.part === "response");
      t.filter((r) => r.condition === "go").forEach((r) => {
        expect(r.responded).toBe(false);
        expect(r.timeout).toBe(true);
        expect(r.correct).toBe(false);
      });
    });

    it("a response does not end a fixed-duration trial; it does with response_or_timeout", () => {
      const fixed = allTrials(
        createTimeline(jsPsych, { practice_trials: 0, n_test_trials: 2 }).timeline
      ).filter((t) => t.data?.part === "response");
      fixed.forEach((t) => expect(t.response_ends_trial).toBe(false));
      const ends = allTrials(
        createTimeline(jsPsych, {
          practice_trials: 0,
          n_test_trials: 2,
          trial_termination_rule: "response_or_timeout",
        }).timeline
      ).filter((t) => t.data?.part === "response");
      ends.forEach((t) => expect(t.response_ends_trial).toBe(true));
    });

    it("samples the response window per trial from a jitter range and records it", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 40,
        response_window_ms: { min: 1000, max: 1500, step: 100 },
      });
      const w = rows
        .filter((r) => r.phase === "test" && r.part === "response")
        .map((r) => r.response_window);
      expect(new Set(w).size).toBeGreaterThan(1);
      w.forEach((x) => expect([1000, 1100, 1200, 1300, 1400, 1500]).toContain(x));
    });

    it("uses a function-valued response window per trial and records its label", async () => {
      const fn: any = ({ phase }: any) => (phase === "practice" ? 900 : 1100);
      fn.label = "test rule";
      const rows = await simulate(jsPsych, {
        practice_trials: 3,
        n_test_trials: 3,
        response_window_ms: fn,
        stimulus_duration_ms: 500,
      });
      rows
        .filter((r) => r.part === "response")
        .forEach((r) => {
          expect(r.response_window).toBe(r.phase === "practice" ? 900 : 1100);
          expect(r.response_window_rule).toBe("test rule");
        });
    });
  });

  describe("phase overrides", () => {
    it("practice has feedback and equal proportions by default; the test has none", () => {
      const p = resolveOptions({}, "practice");
      const t = resolveOptions({}, "test");
      expect(p.trial_feedback).toBe("accuracy");
      expect(t.trial_feedback).toBe("none");
      expect(p.condition_proportions).toEqual({ go: 0.5, nogo: 0.5 });
      expect(t.condition_proportions).toEqual({ go: 0.9, nogo: 0.1 });
    });

    it("precedence: practice > top level > package practice default > package default", () => {
      expect(resolveOptions({ trial_feedback: "none" }, "practice").trial_feedback).toBe("none");
      expect(
        resolveOptions({ trial_feedback: "none", practice: { trial_feedback: "rt" } }, "practice")
          .trial_feedback
      ).toBe("rt");
      expect(
        resolveOptions({ condition_proportions: { go: 0.8, nogo: 0.2 } }, "practice")
          .condition_proportions
      ).toEqual({ go: 0.8, nogo: 0.2 });
      expect(
        resolveOptions(
          {
            condition_proportions: { go: 0.8, nogo: 0.2 },
            practice: { condition_proportions: { go: 0.6 } },
          },
          "practice"
        ).condition_proportions
      ).toEqual({ go: 0.6, nogo: 0.4 });
    });

    it("sequence_constraints at the top level apply to the test only", () => {
      const sc = { max_run: { nogo: 2 } };
      expect(resolveOptions({ sequence_constraints: sc }, "test").sequence_constraints).toEqual(sc);
      expect(resolveOptions({ sequence_constraints: sc }, "practice").sequence_constraints).toEqual(
        {}
      );
      expect(
        resolveOptions(
          { sequence_constraints: sc, practice: { sequence_constraints: { max_run: 3 } } },
          "practice"
        ).sequence_constraints
      ).toEqual({ max_run: 3 });
    });

    it("applies the practice override to the built practice trials", () => {
      const { timeline } = createTimeline(jsPsych, {
        practice_trials: 2,
        n_test_trials: 2,
        iti_ms: 200,
        practice: {
          iti_ms: 0,
          trial_feedback: "none",
          response_window_ms: 2000,
          stimulus_duration_ms: 400,
        },
      });
      const trials = allTrials(timeline);
      const resp = (phase: string) =>
        trials.filter((t) => t.data?.part === "response" && t.data?.phase === phase);
      resp("practice").forEach((t) => expect(t.trial_duration).toBe(2000));
      resp("test").forEach((t) => expect(t.trial_duration).toBeGreaterThanOrEqual(1000));
      expect(
        trials.filter((t) => t.data?.part === "iti" && t.data?.phase === "practice")
      ).toHaveLength(0);
      expect(trials.filter((t) => t.data?.part === "iti" && t.data?.phase === "test")).toHaveLength(
        2
      );
    });
  });

  describe("single_task_blocks (go-only baseline)", () => {
    it("adds 16 go_control trials per baseline block with block null, outside n_blocks and n_test_trials", async () => {
      for (const where of ["before_dual", "after_dual"] as const) {
        const rows = await simulate(initJsPsych(), {
          practice_trials: 0,
          n_test_trials: 8,
          single_task_blocks: where,
        });
        const t = rows.filter((r) => r.phase === "test" && r.part === "response");
        const base = t.filter((r) => r.condition === "go_control");
        expect(base).toHaveLength(16);
        base.forEach((r) => {
          expect(r.block).toBeNull();
          expect(r.baseline_block).toBe(1);
          expect(r.correct).toBe(true);
        });
        expect(t.filter((r) => r.condition !== "go_control")).toHaveLength(8);
        const idx = (r: any) => rows.indexOf(r);
        const main = t.find((r) => r.condition !== "go_control")!;
        if (where === "before_dual") expect(idx(base[0])).toBeLessThan(idx(main));
        else expect(idx(base[0])).toBeGreaterThan(idx(main));
      }
    });

    it("announces each baseline block when the instructions are text", async () => {
      const rows = await simulate(initJsPsych(), {
        practice_trials: 0,
        n_test_trials: 8,
        n_blocks: 2,
        instruction_demonstration: "none",
        single_task_blocks: "interleaved",
      });
      // two instruction pages, the test intro, and one intro per baseline block
      expect(rows.filter((r) => r.part === "instruction")).toHaveLength(5);
    });

    it("baseline trials do not enter the scores", () => {
      const data = new DataCollection([
        row({ condition: "go_control", responded: true, correct: true, rt: 300, block: null }),
        row({ condition: "go_control", responded: true, correct: true, rt: 400, block: null }),
        row({ condition: "go", responded: true, correct: true, rt: 500, block: 1 }),
      ]);
      const s = utils.scoring.calculateScores(data);
      expect(s.n_trials).toBe(1);
      expect(s.baseline_n_trials).toBe(2);
      expect(s.baseline_mean_rt).toBe(350);
      expect(s.mean_correct_go_rt).toBe(500);
    });
  });

  describe("stimulus roles", () => {
    it("draws the go and no-go roles once per participant from jsPsych.randomization", () => {
      const goColours = new Set<string>();
      for (let i = 0; i < 12; i++) {
        const js = initJsPsych();
        js.randomization.setSeed(`roles-${i}`);
        const ctx = timelineUnits.createContext(js, {});
        goColours.add((ctx.stimulus_set.go[0] as any).color);
        expect(ctx.stimulus_set.go[0]).not.toEqual(ctx.stimulus_set.nogo[0]);
      }
      expect(goColours).toEqual(new Set(["blue", "orange"]));
      const fixed = timelineUnits.createContext(initJsPsych(), {
        stimulus_role_assignment: "fixed",
      });
      expect((fixed.stimulus_set.go[0] as any).color).toBe("blue");
    });

    it("cycles the stimuli of each trial type in a balanced way and records them", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 40,
        stimulus_role_assignment: "fixed",
        condition_proportions: { go: 0.5, nogo: 0.5 },
        stimulus_set: {
          go: [{ text: "A" }, { text: "B" }],
          nogo: { text: "X" },
        },
      });
      const t = rows.filter((r) => r.phase === "test" && r.part === "response");
      const count = (s: string) => t.filter((r) => r.stimulus === s).length;
      expect(count("A")).toBe(10);
      expect(count("B")).toBe(10);
      expect(count("X")).toBe(20);
    });

    it("accepts a researcher's own pictures, SVG and string items, and records their ids", async () => {
      const own: GoNogoOptions = {
        practice_trials: 0,
        n_test_trials: 20,
        stimulus_role_assignment: "fixed",
        condition_proportions: { go: 0.5, nogo: 0.5 },
        stimulus_set: {
          go: [{ image: "img/car.png", id: "car" }, "P"],
          nogo: [{ svg: '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"/></svg>' }],
        },
      };
      const rows = await simulate(jsPsych, own);
      const t = rows.filter((r) => r.phase === "test" && r.part === "response");
      expect(new Set(t.map((r) => r.stimulus))).toEqual(new Set(["car", "P", "picture-2"]));

      const ctx = timelineUnits.createContext(initJsPsych(), own);
      const html = [...ctx.stimulus_set.go, ...ctx.stimulus_set.nogo]
        .map((item) =>
          timelineUnits.createResponseTrial(
            ctx,
            ctx.test,
            { condition: "go", item, stimulus: item.id, stimulus_location: "center" },
            "test",
            1,
            1
          )
        )
        .map((tr: any) => tr.stimulus ?? tr.timeline?.[0]?.stimulus)
        .join("");
      expect(html).toContain('src="img/car.png"');
      expect(html).toContain('<circle cx="5"');
    });

    it("names the stimuli in the instructions by id, text, colour and shape, or 'picture'", () => {
      const ctx = timelineUnits.createContext(initJsPsych(), {
        stimulus_role_assignment: "fixed",
        instruction_demonstration: "none",
        stimulus_set: {
          go: [
            { image: "img/car.png", id: "car" },
            { shape: "circle", color: "green" },
          ],
          nogo: [{ image: "img/dog.png" }],
        },
      });
      const html = JSON.stringify(timelineUnits.createInstructions(ctx));
      expect(html).toContain("(car or green circle)");
      expect(html).toContain("(picture)");
    });

    it("throws a clear error for a malformed item or a duplicate id", () => {
      const make = (stimulus_set: any) => () => createTimeline(initJsPsych(), { stimulus_set });
      expect(make({ go: { shape: "square", text: "A" } })).toThrow(
        /stimulus_set.go\[0\] needs exactly one of shape, text, image or svg \(it has shape and text\)/
      );
      expect(make({ go: { color: "red" } })).toThrow(/needs exactly one of shape, text, image/);
      expect(make({ go: { shape: "star" } })).toThrow(/shape "star" is not one of/);
      expect(make({ go: { image: "a.png", color: "red" } })).toThrow(/color applies to a shape/);
      expect(make({ go: ["A", { text: "B", id: "A" }] })).toThrow(/the id "A" is used twice/);
      expect(make({ go: "A", nogo: { image: "x.png", id: "A" } })).toThrow(
        /"A" is both a go and a no-go stimulus/
      );
    });

    it("random_2x2_grid draws a cell per trial and records it", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 40,
        stimulus_layout: "random_2x2_grid",
      });
      const locs = rows
        .filter((r) => r.phase === "test" && r.part === "response")
        .map((r) => r.stimulus_location);
      expect(new Set(locs)).toEqual(
        new Set(["top_left", "top_right", "bottom_left", "bottom_right"])
      );
    });
  });

  describe("response devices", () => {
    it("mouse and touch use one on-screen button", async () => {
      for (const device of ["mouse", "touch"] as const) {
        const rows = await simulate(initJsPsych(), {
          practice_trials: 0,
          n_test_trials: 6,
          response_device: device,
          condition_proportions: { go: 0.5, nogo: 0.5 },
        });
        const t = rows.filter((r) => r.phase === "test" && r.part === "response");
        t.forEach((r) => {
          expect(r.trial_type).toBe("html-button-response");
          expect(r.response_device).toBe(device);
          expect(r.correct_response).toBe(r.condition === "go" ? 0 : null);
          // the default simulated participant clicks on every trial: right for go, a commission error for no-go
          expect(r.correct).toBe(r.condition === "go");
        });
      }
    });

    it("keyboard uses the configured key", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 0,
        n_test_trials: 6,
        response_keys: ["j"],
      });
      rows
        .filter((r) => r.phase === "test" && r.part === "response" && r.condition === "go")
        .forEach((r) => {
          expect(r.correct_response).toBe("j");
          expect(r.response).toBe("j");
        });
    });
  });

  describe("block feedback and pre-block countdown", () => {
    it("shows a countdown before each block and a summary after each test block", async () => {
      const rows = await simulate(jsPsych, {
        practice_trials: 2,
        n_test_trials: 8,
        n_blocks: 2,
        pre_block_countdown_ms: 500,
        block_feedback: "accuracy_rt",
      });
      expect(rows.filter((r) => r.part === "transition")).toHaveLength(3);
      rows.filter((r) => r.part === "transition").forEach((r) => expect(r.duration_ms).toBe(500));
      expect(rows.filter((r) => r.part === "block_feedback")).toHaveLength(2);
    });
  });

  describe("scoring", () => {
    it("scores a hand-built DataCollection", () => {
      const data = new DataCollection([
        // 10 go: 8 hits (rt 400 each, one 500), 2 omissions; 10 nogo: 2 commissions, 8 correct rejections
        ...Array.from({ length: 8 }, (_, i) =>
          row({
            condition: "go",
            responded: true,
            correct: true,
            rt: i === 0 ? 500 : 400,
            block: 1,
          })
        ),
        ...Array.from({ length: 2 }, () =>
          row({ condition: "go", responded: false, correct: false, rt: null, block: 1 })
        ),
        ...Array.from({ length: 2 }, () =>
          row({ condition: "nogo", responded: true, correct: false, rt: 350, block: 1 })
        ),
        ...Array.from({ length: 8 }, () =>
          row({ condition: "nogo", responded: false, correct: true, rt: null, block: 1 })
        ),
        row({ phase: "practice", condition: "nogo", responded: true, correct: false, rt: 200 }),
        { task: "other", phase: "test", part: "response", condition: "go", responded: true },
      ]);
      const s = utils.scoring.calculateScores(data);
      expect(s).toMatchObject({
        n_trials: 20,
        n_go: 10,
        n_nogo: 10,
        hits: 8,
        omissions: 2,
        commissions: 2,
        correct_rejections: 8,
        commission_error_rate: 0.2,
        omission_error_rate: 0.2,
        nogo_accuracy: 0.8,
        accuracy: 0.8,
        false_alarm_rt: 350,
      });
      expect(s.mean_correct_go_rt).toBeCloseTo(412.5, 6);
      expect(s.go_rt_sd).toBeCloseTo(35.355, 2);
      // d' = z(.8) - z(.2) = 1.6832; c = 0
      expect(s.d_prime).toBeCloseTo(1.6832, 2);
      expect(s.criterion_c).toBeCloseTo(0, 6);
      expect(s.by_block).toEqual([
        {
          block: 1,
          n_trials: 20,
          commission_error_rate: 0.2,
          omission_error_rate: 0.2,
          mean_correct_go_rt: s.mean_correct_go_rt,
        },
      ]);
    });

    it("applies the Macmillan and Kaplan adjustment to rates of 0 and 1", () => {
      const perfect = new DataCollection([
        ...Array.from({ length: 10 }, () =>
          row({ condition: "go", responded: true, correct: true, rt: 400, block: 1 })
        ),
        ...Array.from({ length: 10 }, () =>
          row({ condition: "nogo", responded: false, correct: true, rt: null, block: 1 })
        ),
      ]);
      const s = utils.scoring.calculateScores(perfect);
      // hit rate 1 -> .95, false alarm rate 0 -> .05: d' = 2 * z(.95) = 3.2897
      // (probit from simple-statistics is accurate to about 0.003 here)
      expect(s.d_prime).toBeCloseTo(3.2897, 2);
      expect(s.criterion_c).toBeCloseTo(0, 6);
      expect(s.d_prime_correction).toBe("macmillan_kaplan");
    });

    it("returns 0 counts and null values for empty data, never NaN", () => {
      const s = utils.scoring.calculateScores(new DataCollection([]));
      expect(s).toMatchObject({
        n_trials: 0,
        n_go: 0,
        n_nogo: 0,
        hits: 0,
        omissions: 0,
        commissions: 0,
        correct_rejections: 0,
        commission_error_rate: null,
        omission_error_rate: null,
        nogo_accuracy: null,
        accuracy: null,
        mean_correct_go_rt: null,
        go_rt_sd: null,
        false_alarm_rt: null,
        d_prime: null,
        criterion_c: null,
        baseline_n_trials: 0,
        baseline_mean_rt: null,
        by_block: [],
      });
      expect(JSON.stringify(s)).not.toContain("NaN");
    });

    it("go-only data has no d', no-go-only data has no omission rate", () => {
      const goOnly = utils.scoring.calculateScores(
        new DataCollection([
          row({ condition: "go", responded: true, correct: true, rt: 300, block: 1 }),
        ])
      );
      expect(goOnly.d_prime).toBeNull();
      expect(goOnly.commission_error_rate).toBeNull();
      const nogoOnly = utils.scoring.calculateScores(
        new DataCollection([
          row({ condition: "nogo", responded: true, correct: false, rt: 300, block: 1 }),
        ])
      );
      expect(nogoOnly.omission_error_rate).toBeNull();
      expect(nogoOnly.commission_error_rate).toBe(1);
    });

    it("scores a simulated run and exposes getSummary", async () => {
      const rows = await simulate(
        jsPsych,
        { practice_trials: 0, n_test_trials: 50 },
        { default: { data: { rt: 400 } }, nogo: { data: { response: null, rt: null } } }
      );
      const s = utils.scoring.getSummary(new DataCollection(rows));
      expect(s.task).toBe("go-nogo");
      expect(s.n_trials).toBe(50);
      expect(s.commission_error_rate).toBe(0);
      expect(s.omission_error_rate).toBe(0);
      // a participant who responds to everything commits a commission error on every no-go trial
      const all = utils.scoring.calculateScores(
        new DataCollection(await simulate(initJsPsych(), { practice_trials: 0, n_test_trials: 50 }))
      );
      expect(all.commission_error_rate).toBe(1);
      expect(all.hits).toBe(45);
    });
  });

  describe("validation", () => {
    const throwsOn = (o: GoNogoOptions, re: RegExp) =>
      expect(() => createTimeline(initJsPsych(), o)).toThrow(re);

    it("throws on unimplemented vocabulary values, naming the option", () => {
      throwsOn({ stimulus_modality: "auditory" }, /stimulus_modality.*not implemented/);
      throwsOn({ response_device: "gamepad" }, /response_device.*not implemented/);
      throwsOn(
        { stimulus_role_assignment: "rotated" },
        /stimulus_role_assignment.*not implemented/
      );
      throwsOn({ trial_feedback: "points" }, /trial_feedback.*not implemented/);
      throwsOn(
        { trial_termination_rule: "response_terminated" },
        /trial_termination_rule.*not implemented/
      );
      throwsOn(
        { instruction_demonstration: "animated" },
        /instruction_demonstration.*not implemented/
      );
      throwsOn({ condition_proportions: [{ go: 0.5, nogo: 0.5 }] as any }, /list of maps/);
    });

    it("throws on contradictory options", () => {
      throwsOn({ response_window_ms: null }, /fixed_duration/);
      throwsOn(
        { response_window_ms: null, trial_termination_rule: "response_or_timeout" },
        /no-go trial would never end/
      );
      throwsOn({ stimulus_duration_ms: 2000 }, /longer than the response window/);
    });

    it("rejects malformed options", () => {
      throwsOn({ n_blocks: 0 }, /n_blocks/);
      throwsOn({ response_keys: ["a", "b"] }, /response_keys/);
      throwsOn({ condition_proportions: { stop: 1 } as any }, /unknown trial type/);
      throwsOn(
        {
          stimulus_set: {
            go: { shape: "square", color: "red" },
            nogo: { shape: "square", color: "red" },
          },
        },
        /both a go and a no-go/
      );
    });

    it("exports the standard API", () => {
      expect(typeof createTimeline).toBe("function");
      expect(utils.constants.TASK_NAME).toBe("go-nogo");
      expect(utils.constants.VERSION).toBe(version);
      expect(utils.constants.DEFAULT_OPTIONS).toBe(DEFAULT_OPTIONS);
      expect(utils.text.defaultText.go_button).toBeDefined();
      expect(typeof utils.deadlines.meanPlusSd).toBe("function");
      expect(typeof timelineUnits.createResponseTrial).toBe("function");
      validateOptions(resolveOptions({}));
    });
  });
});
