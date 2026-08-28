import { startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import { version } from "../package.json";
import { createTimeline, timelineUnits, utils } from "./index";

jest.useFakeTimers();

describe("Fitts Timeline", () => {
  describe("createTimeline", () => {
    it("should create a timeline object", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should include instructions when showInstructions is true", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { showInstructions: true });
      expect(timeline.timeline.length).toBeGreaterThan(2);
    });

    it("should skip instructions when showInstructions is false", () => {
      const jsPsych = initJsPsych();
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });
      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });

    it("should skip practice when showPractice is false", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });

    it("should include landscape orientation trial by default", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      // First item should be the orientation check
      expect(timeline.timeline.length).toBeGreaterThan(0);
    });

    it("should skip landscape orientation when requireLandscape is false", () => {
      const jsPsych = initJsPsych();
      const withLandscape = createTimeline(jsPsych, { requireLandscape: true });
      const withoutLandscape = createTimeline(jsPsych, { requireLandscape: false });
      expect(withoutLandscape.timeline.length).toBeLessThan(withLandscape.timeline.length);
    });
  });

  describe("parameter validation", () => {
    const build = (options: any) => () => createTimeline(initJsPsych(), options);

    it("should accept the default configuration", () => {
      expect(build({})).not.toThrow();
    });

    it.each([
      ["empty conditions array", { conditions: [] }, /conditions must be a non-empty array/],
      ["non-array conditions", { conditions: null }, /conditions must be a non-empty array/],
      [
        "zero width",
        { conditions: [{ width: 0, distance: 200 }] },
        /conditions\[0\]\.width must be a number > 0, got 0/,
      ],
      [
        "negative width",
        { conditions: [{ width: -60, distance: 200 }] },
        /conditions\[0\]\.width must be a number > 0, got -60/,
      ],
      [
        "zero distance",
        { conditions: [{ width: 60, distance: 0 }] },
        /conditions\[0\]\.distance must be a number > 0, got 0/,
      ],
      [
        "a bad condition after a good one",
        {
          conditions: [
            { width: 60, distance: 200 },
            { width: 60, distance: -1 },
          ],
        },
        /conditions\[1\]\.distance must be a number > 0, got -1/,
      ],
      ["zero taps", { tapsPerCondition: 0 }, /tapsPerCondition must be an integer >= 2, got 0/],
      ["one tap", { tapsPerCondition: 1 }, /tapsPerCondition must be an integer >= 2, got 1/],
      [
        "negative taps",
        { tapsPerCondition: -5 },
        /tapsPerCondition must be an integer >= 2, got -5/,
      ],
      [
        "fractional taps",
        { tapsPerCondition: 2.5 },
        /tapsPerCondition must be an integer >= 2, got 2.5/,
      ],
      [
        "zero repetitions",
        { repetitionsPerCondition: 0 },
        /repetitionsPerCondition must be an integer >= 1, got 0/,
      ],
      [
        "fractional repetitions",
        { repetitionsPerCondition: 1.5 },
        /repetitionsPerCondition must be an integer >= 1, got 1.5/,
      ],
      [
        "zero practice conditions while practice is on",
        { showPractice: true, numPracticeConditions: 0 },
        /numPracticeConditions must be an integer >= 1 when showPractice is true, got 0/,
      ],
      [
        "NaN opacity",
        { inactiveTargetOpacity: NaN },
        /inactiveTargetOpacity must be a number between 0 and 1, got NaN/,
      ],
      [
        "opacity above 1",
        { inactiveTargetOpacity: 1.5 },
        /inactiveTargetOpacity must be a number between 0 and 1, got 1.5/,
      ],
      [
        "negative opacity",
        { inactiveTargetOpacity: -0.2 },
        /inactiveTargetOpacity must be a number between 0 and 1, got -0.2/,
      ],
      [
        "empty targetColor",
        { targetColor: "   " },
        /targetColor must be a non-empty CSS color string/,
      ],
      [
        "targetColor that breaks out of the style attribute",
        { targetColor: 'red" onclick="alert(1)' },
        /targetColor must not contain quotes, angle brackets or backslashes/,
      ],
    ])("should reject %s", (_label, options, message) => {
      expect(build(options)).toThrow(message);
    });

    it("should name the task in every validation message", () => {
      expect(build({ tapsPerCondition: 0 })).toThrow(/^\[fitts\]/);
    });

    it("should ignore numPracticeConditions when practice is disabled", () => {
      expect(build({ showPractice: false, numPracticeConditions: 0 })).not.toThrow();
    });

    it("should allow a negative index of difficulty", () => {
      // width > 2 * distance is a valid floor-effect baseline condition, not an error.
      expect(build({ conditions: [{ width: 500, distance: 100 }] })).not.toThrow();
    });

    it("should allow numPracticeConditions above the number of conditions", () => {
      expect(build({ numPracticeConditions: 99 })).not.toThrow();
    });

    it("should accept the full opacity range including the endpoints", () => {
      expect(build({ inactiveTargetOpacity: 0 })).not.toThrow();
      expect(build({ inactiveTargetOpacity: 1 })).not.toThrow();
    });

    it("should accept CSS color forms that contain punctuation", () => {
      expect(build({ targetColor: "rgb(74, 144, 217)" })).not.toThrow();
      expect(build({ targetColor: "var(--fitts-target)" })).not.toThrow();
    });
  });
  describe("recorded data fields", () => {
    // Walks nested blocks so a trial cannot hide from the invariant.
    const allTrials = (node: any): any[] =>
      node.timeline ? node.timeline.flatMap(allTrials) : [node];

    const build = (options: any = {}) => allTrials(createTimeline(initJsPsych(), options));

    it("tags every trial with the task and its version", () => {
      const trials = build({});
      expect(trials.length).toBeGreaterThan(3);
      for (const t of trials) {
        expect(t.data).toBeDefined();
        expect(t.data.task).toBe("fitts");
        expect(t.data.task_version).toBe(version);
      }
    });

    it("tags the orientation check, which records nothing of its own", () => {
      const withCheck = build({ requireLandscape: true });
      const orientation = withCheck.find((t) => t.data?.part === "orientation");
      expect(orientation).toBeDefined();
      expect(orientation.data.task).toBe("fitts");
      expect(orientation.data.phase).toBe("instructions");

      const without = build({ requireLandscape: false });
      expect(without.find((t) => t.data?.part === "orientation")).toBeUndefined();
    });

    it("emits only the documented phase and part values", () => {
      const trials = build({});
      const phases = new Set(trials.map((t) => t.data.phase));
      const parts = new Set(trials.map((t) => t.data.part).filter(Boolean));
      expect([...phases].sort()).toEqual(["completion", "instructions", "practice", "test"]);
      expect([...parts].sort()).toEqual(["instruction", "orientation", "response"]);
    });

    it("gives every instruction screen a part", () => {
      const instructions = build({}).filter((t) => t.data.part === "instruction");
      // intro, practice and main
      expect(instructions).toHaveLength(3);
      expect(instructions.map((t) => t.data.phase)).toEqual(["instructions", "practice", "test"]);
    });
  });

  describe("timeline execution", () => {
    it("should display introduction instructions", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          requireLandscape: false,
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Tapping Task");
    });
  });

  describe("utils.scoring", () => {
    it("should calculate scores from empty data", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.averageMT).toBe(0);
      expect(scores.accuracy).toBe(0);
      expect(scores.throughput).toBeNull();
      expect(scores.totalTaps).toBe(0);
      expect(scores.totalErrors).toBe(0);
    });

    it("should have correct scoring structure", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores).toHaveProperty("averageMT");
      expect(scores).toHaveProperty("accuracy");
      expect(scores).toHaveProperty("throughput");
      expect(scores).toHaveProperty("totalTaps");
      expect(scores).toHaveProperty("totalErrors");
      expect(scores).toHaveProperty("conditionPerformance");
    });
  });

  describe("utils.getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("fitts");
      expect(summary.version).toBe(version);
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("fitts");
      expect(utils.constants.VERSION).toBe(version);
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
      expect(utils.constants.DEFAULT_CONDITIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.tapsPerCondition).toBe(10);
      expect(defaults.repetitionsPerCondition).toBe(2);
      expect(defaults.showPractice).toBe(true);
      expect(defaults.numPracticeConditions).toBe(2);
      expect(defaults.requireLandscape).toBe(true);
    });

    it("should have default conditions", () => {
      expect(utils.constants.DEFAULT_CONDITIONS.length).toBe(6);
      utils.constants.DEFAULT_CONDITIONS.forEach((cond) => {
        expect(cond).toHaveProperty("width");
        expect(cond).toHaveProperty("distance");
        expect(cond.width).toBeGreaterThan(0);
        expect(cond.distance).toBeGreaterThan(0);
      });
    });
  });

  describe("timelineUnits", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createFittsTrial).toBe("function");
      expect(typeof timelineUnits.createFittsBlock).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
      expect(typeof timelineUnits.calculateID).toBe("function");
      expect(typeof timelineUnits.createFittsHTML).toBe("function");
    });
  });

  describe("index of difficulty calculation", () => {
    it("should calculate ID from the centre-to-centre amplitude", () => {
      // Shannon: ID = log2(A/W + 1), A = distance + width.
      // gap=300, W=50 -> A=350 -> log2(350/50 + 1) = log2(8) = 3
      expect(timelineUnits.calculateID(300, 50)).toBe(3);
      expect(timelineUnits.calculateID(200, 50)).toBeCloseTo(Math.log2(6), 10);
    });

    it("should not treat the inter-edge gap as the amplitude", () => {
      // The bars are `distance` apart at their inner edges, so the participant
      // travels distance + width. Using the gap alone understates every ID.
      expect(timelineUnits.calculateID(200, 50)).not.toBeCloseTo(Math.log2(200 / 50 + 1), 6);
    });

    it("should use the Shannon formulation, not log2(2D/W)", () => {
      expect(timelineUnits.calculateID(200, 50)).not.toBeCloseTo(Math.log2((2 * 200) / 50), 6);
    });

    it("should stay finite for a target wider than the amplitude", () => {
      // Shannon cannot go negative, unlike log2(2D/W).
      expect(timelineUnits.calculateID(100, 500)).toBeGreaterThan(0);
    });

    it("should increase ID with distance", () => {
      const id1 = timelineUnits.calculateID(100, 50);
      const id2 = timelineUnits.calculateID(200, 50);
      expect(id2).toBeGreaterThan(id1);
    });

    it("should increase ID with smaller width", () => {
      const id1 = timelineUnits.calculateID(200, 60);
      const id2 = timelineUnits.calculateID(200, 30);
      expect(id2).toBeGreaterThan(id1);
    });
  });

  describe("Fitts HTML generation", () => {
    it("should create HTML with left and right targets", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 60, 200, "left");
      expect(html).toContain("fitts-left");
      expect(html).toContain("fitts-right");
    });

    it("should set correct target width", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 80, 200, "left");
      expect(html).toContain("width: 80px");
    });

    it("should highlight only the active target", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const htmlLeft = timelineUnits.createFittsHTML(config, 60, 200, "left");
      // Both bars are rendered; only the active one is fully opaque.
      expect(htmlLeft).toMatch(/fitts-left.*opacity: 1;/s);
      expect(htmlLeft).toMatch(/fitts-right.*opacity: 0\.35;/s);

      const htmlRight = timelineUnits.createFittsHTML(config, 60, 200, "right");
      expect(htmlRight).toMatch(/fitts-left.*opacity: 0\.35;/s);
      expect(htmlRight).toMatch(/fitts-right.*opacity: 1;/s);
    });

    it("should apply inactiveTargetOpacity to the non-active bar", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        inactiveTargetOpacity: 0,
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 60, 200, "left");
      expect(html).toMatch(/fitts-left.*opacity: 1;/s);
      expect(html).toMatch(/fitts-right.*opacity: 0;/s);
    });

    it("should use target color from config", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        targetColor: "#FF0000",
        text: utils.text,
      };
      const html = timelineUnits.createFittsHTML(config, 60, 200, "left");
      expect(html).toContain("#FF0000");
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          requireLandscape: false,
          text: {
            instruction_intro: "<p>Custom intro text</p>",
            continue_button: "Next",
          },
        }).timeline
      );

      expect(displayElement.innerHTML).toContain("Custom intro text");
      expect(displayElement.innerHTML).toContain("Next");
    });

    it("should merge partial text with defaults", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        text: {
          continue_button: "Custom Continue",
        },
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("configuration options", () => {
    it("should accept custom conditions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        conditions: [
          { width: 40, distance: 150 },
          { width: 80, distance: 300 },
        ],
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom taps per condition", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        tapsPerCondition: 15,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom repetitions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        repetitionsPerCondition: 3,
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom target color", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        targetColor: "#FF0000",
      });

      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of practice conditions", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numPracticeConditions: 3,
      });

      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.orientation_message).toBeDefined();
      expect(utils.text.instruction_intro).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.ready_prompt).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("Fitts trial creation", () => {
    it("should create Fitts trial", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createFittsTrial(
        jsPsych,
        config,
        { width: 60, distance: 200 },
        0,
        1,
        false
      );
      expect(trial).toBeDefined();
      expect(trial.data.target_width).toBe(60);
      expect(trial.data.target_distance).toBe(200);
      expect(trial.data.condition_index).toBe(0);
      expect(trial.data.trial_number).toBe(1);
    });

    it("should calculate ID for trial", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const trial = timelineUnits.createFittsTrial(
        jsPsych,
        config,
        { width: 50, distance: 200 },
        0,
        1,
        false
      );
      // log2((200 + 50)/50 + 1) = log2(6)
      expect(trial.data.index_of_difficulty).toBeCloseTo(Math.log2(6), 10);
    });
  });

  describe("tap recording", () => {
    const buildTrial = (tapsPerCondition: number, overrides: any = {}) => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        tapsPerCondition,
        ...overrides,
        text: utils.text,
      };
      const trial: any = timelineUnits.createFittsTrial(
        jsPsych,
        config,
        { width: 60, distance: 200 },
        0,
        1,
        false
      );
      const root = document.createElement("div");
      root.innerHTML = trial.stimulus();
      jsPsych.getDisplayElement = () => root as any;
      let finished: any = null;
      jsPsych.finishTrial = ((d: any) => {
        finished = d;
      }) as any;
      trial.on_load();

      const bars = () => Array.from(root.querySelectorAll(".fitts-target")) as HTMLElement[];
      const bar = (side: string) => bars().find((e) => e.dataset.target === side)!;
      // The sequence is deterministic: it starts on the left and flips on each hit,
      // so the helpers track it directly rather than inferring it from opacity.
      let side: "left" | "right" = "left";
      const active = () => bar(side);
      const inactive = () => bar(side === "left" ? "right" : "left");
      // Reads the rendered highlight, for asserting the DOM actually follows along.
      const highlighted = () => bars().find((e) => e.style.opacity === "1")!;
      const click = (el: Element) => el.dispatchEvent(new MouseEvent("click", { bubbles: true }));

      return {
        root,
        active,
        inactive,
        highlighted,
        bar,
        hit: () => {
          click(active());
          side = side === "left" ? "right" : "left";
        },
        missInactiveBar: () => click(inactive()),
        missGap: () => click(root.querySelector(".fitts-container")!),
        result: () => finished,
      };
    };

    it("records a clean run as fully accurate", () => {
      const t = buildTrial(3);
      t.hit();
      t.hit();
      t.hit();
      expect(t.result()).not.toBeNull();
      expect(t.result().taps_completed).toBe(3);
      expect(t.result().errors).toBe(0);
      expect(t.result().accuracy).toBe(100);
    });

    it("counts a tap on the inactive bar as an error", () => {
      const t = buildTrial(2);
      t.missInactiveBar();
      t.hit();
      t.hit();
      expect(t.result().errors).toBe(1);
      expect(t.result().taps_completed).toBe(2);
    });

    it("counts a tap on the gap between bars as an error", () => {
      const t = buildTrial(2);
      t.missGap();
      t.missGap();
      t.hit();
      t.hit();
      expect(t.result().errors).toBe(2);
    });

    it("does not advance the target on a miss", () => {
      const t = buildTrial(4);
      const before = t.highlighted().dataset.target;
      t.missInactiveBar();
      expect(t.highlighted().dataset.target).toBe(before);
      t.hit();
      expect(t.highlighted().dataset.target).not.toBe(before);
    });

    it("computes accuracy from hits and misses", () => {
      const t = buildTrial(2);
      t.missGap();
      t.hit();
      t.missGap();
      t.hit();
      expect(t.result().taps_completed).toBe(2);
      expect(t.result().errors).toBe(2);
      expect(t.result().accuracy).toBe(50);
    });

    it("records one movement per target-to-target tap, not per tap", () => {
      const t = buildTrial(3);
      t.missGap();
      t.hit();
      t.hit();
      t.hit();
      // Three taps yield two movements; the first tap has no target to move from.
      expect(t.result().taps_completed).toBe(3);
      expect(t.result().movement_times).toHaveLength(2);
      expect(t.result().tap_positions).toHaveLength(2);
    });

    it("records the interval before the first tap as initiation_time", () => {
      // A participant who takes 200ms to orient, then taps every 50ms. Before this
      // was separated out, the 200ms landed in movement_times and doubled the mean.
      const clock = jest.spyOn(performance, "now");
      clock.mockReturnValue(0); // on_load reads the clock twice
      const t = buildTrial(3);
      try {
        clock.mockReturnValue(200);
        t.hit();
        clock.mockReturnValue(250);
        t.hit();
        clock.mockReturnValue(300);
        t.hit();
      } finally {
        clock.mockRestore();
      }

      const r = t.result();
      expect(r.initiation_time).toBe(200);
      expect(r.movement_times).toEqual([50, 50]);
      expect(r.total_time).toBe(300);
    });

    it("keeps movement_times and tap_positions index-aligned", () => {
      const t = buildTrial(4);
      t.hit();
      t.hit();
      t.missGap();
      t.hit();
      t.hit();
      const r = t.result();
      expect(r.movement_times).toHaveLength(r.tap_positions.length);
      expect(r.movement_times).toHaveLength(r.taps_completed - 1);
    });

    it("still records misses when the inactive bar is invisible", () => {
      const t = buildTrial(2, { inactiveTargetOpacity: 0 });
      t.missInactiveBar();
      t.missGap();
      t.hit();
      t.hit();
      expect(t.result().errors).toBe(2);
      expect(t.result().accuracy).toBe(50);
    });

    it("keeps applying inactiveTargetOpacity to whichever bar is dimmed", () => {
      const t = buildTrial(4, { inactiveTargetOpacity: 0.1 });
      // Each bar is dimmed by its own assignment, so check both in turn.
      t.hit(); // active moves right, left bar dims
      expect(t.bar("left").style.opacity).toBe("0.1");
      expect(t.bar("right").style.opacity).toBe("1");
      t.hit(); // active moves back left, right bar dims
      expect(t.bar("right").style.opacity).toBe("0.1");
      expect(t.bar("left").style.opacity).toBe("1");
    });

    it("alternates the highlighted target as taps land", () => {
      const t = buildTrial(3);
      expect(t.highlighted().dataset.target).toBe("left");
      t.hit();
      expect(t.highlighted().dataset.target).toBe("right");
      t.hit();
      expect(t.highlighted().dataset.target).toBe("left");
    });
  });

  describe("Fitts block creation", () => {
    it("should create block with correct number of trials", () => {
      const jsPsych = initJsPsych();
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        text: utils.text,
      };
      const conditions = [
        { width: 60, distance: 200 },
        { width: 40, distance: 200 },
      ];
      const block = timelineUnits.createFittsBlock(jsPsych, config, conditions, 2, false);
      // 2 conditions * 2 repetitions = 4 trials
      expect(block.timeline.length).toBe(4);
    });

    it("numbers trials by position and indexes conditions by identity", () => {
      const jsPsych = initJsPsych();
      const config = { ...utils.constants.DEFAULT_OPTIONS, text: utils.text };
      const conditions = [
        { width: 60, distance: 200 },
        { width: 40, distance: 200 },
        { width: 30, distance: 400 },
      ];
      const block: any = timelineUnits.createFittsBlock(jsPsych, config, conditions, 2, false);
      const rows = block.timeline.map((t: any) => t.data);

      // trial_number is the position in the block: 1..n, contiguous, no repeats.
      expect(rows.map((r: any) => r.trial_number)).toEqual([1, 2, 3, 4, 5, 6]);

      // condition_index survives the shuffle and still identifies the condition.
      for (const r of rows) {
        expect(conditions[r.condition_index]).toEqual({
          width: r.target_width,
          distance: r.target_distance,
        });
      }
      // Every condition appears exactly twice, whatever order they landed in.
      const counts = new Map<number, number>();
      for (const r of rows) counts.set(r.condition_index, (counts.get(r.condition_index) ?? 0) + 1);
      expect([...counts.keys()].sort()).toEqual([0, 1, 2]);
      expect([...counts.values()]).toEqual([2, 2, 2]);
    });
  });
});
