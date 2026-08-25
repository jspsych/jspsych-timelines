import { readFileSync } from "fs";
import { join } from "path";

import htmlButtonResponse from "@jspsych/plugin-html-button-response";
import { simulateTimeline, startTimeline } from "@jspsych/test-utils";
import { initJsPsych } from "jspsych";

import { createTimeline, timelineUnits, utils } from "./index";

jest.useFakeTimers();

describe("Continuous Performance Test", () => {
  describe("createTimeline", () => {
    it("should create a timeline object for standard mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "standard" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create a timeline object for inhibition mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "inhibition" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create a timeline object for ax mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { mode: "ax" });
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should default to standard mode", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych);
      expect(timeline).toBeDefined();
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("instructions vary by mode", () => {
    it("should show standard instructions for standard mode", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { mode: "standard", showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("Continuous Performance Test");
      expect(displayElement.innerHTML).toContain("target letter");
    });

    it("should show inhibition instructions for inhibition mode", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { mode: "inhibition", showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("every");
      expect(displayElement.innerHTML).toContain("not");
    });

    it("should show AX instructions for ax mode", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { mode: "ax", showInstructions: true }).timeline
      );
      expect(displayElement.innerHTML).toContain("cue");
      expect(displayElement.innerHTML).toContain("probe");
    });
  });

  describe("practice configuration", () => {
    it("should include practice when showPractice is true", () => {
      const jsPsych = initJsPsych();
      const withPractice = createTimeline(jsPsych, { showPractice: true });
      const withoutPractice = createTimeline(jsPsych, { showPractice: false });
      expect(withoutPractice.timeline.length).toBeLessThan(withPractice.timeline.length);
    });

    it("should skip instructions when showInstructions is false", () => {
      const jsPsych = initJsPsych();
      const withInstructions = createTimeline(jsPsych, { showInstructions: true });
      const withoutInstructions = createTimeline(jsPsych, { showInstructions: false });
      expect(withoutInstructions.timeline.length).toBeLessThan(withInstructions.timeline.length);
    });
  });

  describe("trial sequence generation - standard mode", () => {
    it("should generate correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      expect(sequence.length).toBe(100);
    });

    it("should have correct proportion of targets", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        targetProbability: 0.2,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      const targetCount = sequence.filter((s) => s.isTarget).length;
      expect(targetCount).toBe(20);
    });

    it("should have target letter for target trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        targetLetter: "X",
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const targets = sequence.filter((s) => s.isTarget);
      targets.forEach((t) => {
        expect(t.letter).toBe("X");
      });
    });

    it("should not use target letter for non-target trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "standard" as const,
        targetLetter: "X",
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const nontargets = sequence.filter((s) => !s.isTarget);
      nontargets.forEach((t) => {
        expect(t.letter).not.toBe("X");
      });
    });
  });

  describe("trial sequence generation - inhibition mode", () => {
    it("should generate correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "inhibition" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      expect(sequence.length).toBe(100);
    });

    it("should have correct proportion of nontargets (no-go)", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "inhibition" as const,
        nontargetProbability: 0.1,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      const nontargetCount = sequence.filter((s) => !s.isTarget).length;
      expect(nontargetCount).toBe(10);
    });
  });

  describe("trial sequence generation - AX mode", () => {
    it("should generate correct number of trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      expect(sequence.length).toBe(100);
    });

    it("should generate correct AX trial types", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        axProbability: 0.4,
        ayProbability: 0.2,
        bxProbability: 0.2,
        byProbability: 0.2,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 100);
      const axCount = sequence.filter((s) => s.trialType === "ax").length;
      const ayCount = sequence.filter((s) => s.trialType === "ay").length;
      const bxCount = sequence.filter((s) => s.trialType === "bx").length;
      const byCount = sequence.filter((s) => s.trialType === "by").length;

      expect(axCount).toBe(40);
      expect(ayCount).toBe(20);
      expect(bxCount).toBe(20);
      // BY gets remainder
      expect(byCount).toBe(20);
    });

    it("should only have AX trials marked as targets", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const axTrials = sequence.filter((s) => s.trialType === "ax");
      const nonAxTrials = sequence.filter((s) => s.trialType !== "ax");

      axTrials.forEach((t) => expect(t.isTarget).toBe(true));
      nonAxTrials.forEach((t) => expect(t.isTarget).toBe(false));
    });

    it("should have correct cue and probe letters for AX trials", () => {
      const config = {
        ...utils.constants.DEFAULT_OPTIONS,
        mode: "ax" as const,
        cueLetter: "A",
        probeLetter: "X",
        text: utils.text,
      };
      const sequence = utils.sequence.generateTrialSequence(config, 50);
      const axTrials = sequence.filter((s) => s.trialType === "ax");

      axTrials.forEach((t) => {
        expect(t.cue).toBe("A");
        expect(t.probe).toBe("X");
      });
    });
  });

  describe("sequence distribution", () => {
    const cfg = (over: any = {}) => ({
      ...utils.constants.DEFAULT_OPTIONS,
      text: utils.text,
      ...over,
    });
    const longestRun = (seq: any[], pred: (s: any) => boolean) => {
      let max = 0;
      let run = 0;
      for (const s of seq) {
        run = pred(s) ? run + 1 : 0;
        if (run > max) max = run;
      }
      return max;
    };
    /**
     * Mean position of the matching trials, scaled to 0..1. An unbiased sequence
     * centres on 0.5; crowding them toward either end moves it off centre. This is
     * a sharper probe than counting halves, which stays at 50% under a bias big
     * enough to matter.
     */
    const meanPosition = (mode: string, pred: (s: any) => boolean, n = 100, runs = 300) => {
      let sum = 0;
      let count = 0;
      for (let r = 0; r < runs; r++) {
        const seq = utils.sequence.generateTrialSequence(cfg({ mode }), n);
        seq.forEach((s, i) => {
          if (pred(s)) {
            sum += i / (n - 1);
            count++;
          }
        });
      }
      return sum / count;
    };

    // The defect this guards: inhibition mode's rare no-go trials were all crammed
    // into the first half of the run, leaving later blocks with nothing to score.
    it.each([
      ["inhibition no-go", "inhibition", (s: any) => !s.isTarget],
      ["standard target", "standard", (s: any) => s.isTarget],
      ["AX target", "ax", (s: any) => s.isTarget],
    ])("centres %s trials in the run rather than crowding one end", (_label, mode, pred) => {
      const position = meanPosition(mode, pred);
      expect(position).toBeGreaterThan(0.485);
      expect(position).toBeLessThan(0.515);
    });

    // Holding a class to exactly its minimum feasible run makes the rare stimulus
    // land on a near-fixed cycle, which a participant can learn. Gaps between
    // no-go trials must stay irregular.
    it("keeps the spacing between inhibition no-go trials irregular", () => {
      const gaps: number[] = [];
      for (let r = 0; r < 200; r++) {
        const seq = utils.sequence.generateTrialSequence(cfg({ mode: "inhibition" }), 100);
        let previous = -1;
        seq.forEach((s, i) => {
          if (!s.isTarget) {
            if (previous >= 0) gaps.push(i - previous);
            previous = i;
          }
        });
      }
      const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      const sd = Math.sqrt(gaps.reduce((a, b) => a + (b - mean) ** 2, 0) / gaps.length);
      expect(sd / mean).toBeGreaterThan(0.35);
    });

    it("reaches the end of a long inhibition run with no-go trials still to come", () => {
      // A 360-trial run previously placed its last no-go trial around trial 138.
      const seq = utils.sequence.generateTrialSequence(cfg({ mode: "inhibition" }), 360);
      const lastNoGo = seq.reduce((last, s, i) => (!s.isTarget ? i : last), -1);
      expect(lastNoGo).toBeGreaterThan(240);
    });

    it.each([
      ["standard", 3, 8],
      ["ax", 3, 8],
    ])("holds %s mode to runs of %i targets and %i non-targets", (mode, maxT, maxN) => {
      for (let r = 0; r < 50; r++) {
        const seq = utils.sequence.generateTrialSequence(cfg({ mode }), 100);
        expect(longestRun(seq, (s) => s.isTarget)).toBeLessThanOrEqual(maxT);
        expect(longestRun(seq, (s) => !s.isTarget)).toBeLessThanOrEqual(maxN);
      }
    });

    it("holds inhibition mode to limits its 90/10 split can actually satisfy", () => {
      // Reusing the rare-target limits here is what broke the distribution: 90 go
      // trials cannot be held to runs of 3 by any arrangement. The iteration count
      // is high because a run of 3 no-go trials is rare enough that a short loop
      // misses a loosened limit.
      let longestNoGo = 0;
      for (let r = 0; r < 400; r++) {
        const seq = utils.sequence.generateTrialSequence(cfg({ mode: "inhibition" }), 100);
        longestNoGo = Math.max(
          longestNoGo,
          longestRun(seq, (s) => !s.isTarget)
        );
        expect(longestRun(seq, (s) => s.isTarget)).toBeLessThanOrEqual(18);
      }
      expect(longestNoGo).toBeLessThanOrEqual(2);
      // and the limit is genuinely reached, so the assertion above is not vacuous
      expect(longestNoGo).toBe(2);
    });

    it.each(["standard", "inhibition", "ax"])(
      "preserves the exact trial counts in %s mode",
      (mode) => {
        const seq = utils.sequence.generateTrialSequence(cfg({ mode }), 100);
        expect(seq).toHaveLength(100);
        const targets = seq.filter((s) => s.isTarget).length;
        expect(targets).toBe(mode === "standard" ? 20 : mode === "inhibition" ? 90 : 40);
      }
    );

    it.each([
      ["a pure-target block", { mode: "standard", targetProbability: 1 }],
      ["a pure-nontarget block", { mode: "standard", targetProbability: 0 }],
      ["a single trial", { mode: "standard" }],
    ])("builds %s without stranding trials", (_label, over) => {
      const n = "targetProbability" in over ? 40 : 1;
      const seq = utils.sequence.generateTrialSequence(cfg(over), n);
      expect(seq).toHaveLength(n);
      expect(seq.every((s) => s !== undefined)).toBe(true);
    });
  });

  describe("stimulus offset timer", () => {
    const resolved = (over: any = {}) => ({
      ...utils.constants.DEFAULT_OPTIONS,
      text: utils.text,
      ...over,
    });

    afterEach(() => {
      document.body.innerHTML = "";
    });

    /**
     * Stands in for the DOM a trial renders into, and points the jsPsych instance
     * at it the way the framework would once the trial is on screen.
     *
     * The display is attached to the document, and a previous mount is torn down
     * the way cleanupTrial would, so that a document-wide lookup at timer time
     * would genuinely resolve to the current trial's stimulus.
     */
    const mountTrial = (jsPsych: any, config: any) => {
      document.body.innerHTML = "";
      const display = document.createElement("div");
      display.innerHTML =
        '<div id="jspsych-html-button-response-stimulus">' +
        '<div class="cpt-trial-content"><span class="cpt-stimulus">X</span></div>' +
        "</div>";
      document.body.appendChild(display);
      jsPsych.getDisplayElement = () => display;
      const stimulus = display.querySelector("#jspsych-html-button-response-stimulus")!;
      const trial = timelineUnits.createTestBlock(jsPsych, config, 1, 1).timeline[0].timeline[0];
      return { display, stimulus, trial };
    };

    it("swaps the stimulus for the fixation cross after stimulusDuration", () => {
      const jsPsych = initJsPsych();
      const config = resolved({ stimulusDuration: 250, showFixation: true });
      const { stimulus, trial } = mountTrial(jsPsych, config);

      trial.on_load();
      expect(stimulus.innerHTML).toContain("cpt-stimulus");
      jest.advanceTimersByTime(250);
      expect(stimulus.innerHTML).toContain("cpt-fixation");
    });

    // The defect this guards: a bare setTimeout survived its own trial, and a
    // document-wide lookup then erased the stimulus of the trial that followed.
    it("cancels the pending swap when the trial ends early", () => {
      const jsPsych = initJsPsych();
      const config = resolved({ stimulusDuration: 250 });
      const { stimulus, trial } = mountTrial(jsPsych, config);

      trial.on_load();
      // jsPsych clears plugin-API timers in cleanupTrial when the trial ends.
      jsPsych.pluginAPI.clearAllTimeouts();
      jest.advanceTimersByTime(1000);

      expect(stimulus.innerHTML).toContain("cpt-stimulus");
      expect(stimulus.innerHTML).not.toContain("cpt-fixation");
    });

    it("writes to the trial it was scheduled from, not whatever is on screen later", () => {
      const jsPsych = initJsPsych();
      const config = resolved({ stimulusDuration: 250 });
      const first = mountTrial(jsPsych, config);

      first.trial.on_load();
      // A later trial replaces the display before the timer is due.
      const second = mountTrial(jsPsych, config);
      jest.advanceTimersByTime(1000);

      expect(second.stimulus.innerHTML).toContain("cpt-stimulus");
      expect(second.stimulus.innerHTML).not.toContain("cpt-fixation");
    });

    it("keeps the stimulus box occupied when showFixation is false", () => {
      const jsPsych = initJsPsych();
      const config = resolved({ stimulusDuration: 250, showFixation: false });
      const { stimulus, trial } = mountTrial(jsPsych, config);

      trial.on_load();
      jest.advanceTimersByTime(250);

      // An empty string here would collapse the sized box and shift the button.
      expect(stimulus.innerHTML).not.toBe("");
      expect(stimulus.innerHTML).toContain("trial-content");
      expect(stimulus.innerHTML).not.toContain("cpt-stimulus");
      expect(stimulus.innerHTML).not.toContain("cpt-fixation");
    });
  });

  describe("CSS containment", () => {
    const CSS_ROOT = "jspsych-continuous-performance-test";
    // The stylesheet as it ships, read the same way the bundler inlines it.
    const stylesheet = readFileSync(join(__dirname, "styles.css"), "utf8");
    const selectors = stylesheet
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .split("}")
      .flatMap((rule: string) => rule.split("{")[0].split(","))
      .map((sel: string) => sel.trim())
      .filter(Boolean);

    it("defines no bare element, body or universal selectors", () => {
      const bare = selectors.filter((sel: string) => /(^|\s)(?![.#])[a-z]+\d?(\s|$)/.test(sel));
      // Element selectors are only allowed as descendants of a cpt- class.
      const unscoped = bare.filter((sel: string) => !/\.cpt-/.test(sel));
      expect(unscoped).toEqual([]);
      expect(selectors.filter((sel: string) => /^(body|html|\*)\b/.test(sel))).toEqual([]);
    });

    it("scopes every jsPsych-owned selector under the timeline root", () => {
      const jsPsychOwned = selectors.filter((sel: string) => /(^|\s)[.#]jspsych-/.test(sel));
      expect(jsPsychOwned.length).toBeGreaterThan(0);
      jsPsychOwned.forEach((sel: string) => expect(sel.startsWith(`.${CSS_ROOT} `)).toBe(true));
    });

    it("prefixes every class it defines", () => {
      const classes = new Set(
        selectors
          .flatMap((sel: string) => sel.match(/\.[a-zA-Z][\w-]*/g) ?? [])
          .map((c: string) => c.slice(1))
      );
      classes.forEach((cls: string) => {
        if (cls === CSS_ROOT) return;
        // jspsych-btn is core's, and is only reached via the scoped rule above.
        if (cls === "jspsych-btn") return;
        expect(cls.startsWith("cpt-")).toBe(true);
      });
    });

    // Prefixed but unstyled classes are deliberate hooks for researchers to target;
    // an unprefixed one would not be acceptable. Listed so a new one is a decision.
    const UNSTYLED_HOOKS = ["cpt-feedback"];

    it("emits no unprefixed class into the global namespace", () => {
      const markup = [
        readFileSync(join(__dirname, "index.ts"), "utf8"),
        readFileSync(join(__dirname, "text.ts"), "utf8"),
      ].join("");
      const emitted = new Set(
        [...markup.matchAll(/class="([^"$]+)"/g)].flatMap((m) => m[1].split(/\s+/))
      );
      // jspsych-btn is core's own class, reused deliberately on the disabled buttons.
      const foreign = [...emitted].filter(
        (cls) => !cls.startsWith("cpt-") && cls !== "jspsych-btn"
      );
      expect(foreign).toEqual([]);
    });

    it("defines every class it emits, and emits every class it defines", () => {
      const source = readFileSync(join(__dirname, "index.ts"), "utf8");
      const text = readFileSync(join(__dirname, "text.ts"), "utf8");
      const emitted = new Set(
        [...`${source}${text}`.matchAll(/class="([^"$]+)"/g)]
          .flatMap((m) => m[1].split(/\s+/))
          .filter((c) => c.startsWith("cpt-"))
      );
      const defined = new Set([...stylesheet.matchAll(/\.(cpt-[\w-]+)/g)].map((m) => m[1]));
      expect([...emitted].filter((c) => !defined.has(c) && !UNSTYLED_HOOKS.includes(c))).toEqual(
        []
      );
      expect([...defined].filter((c) => !emitted.has(c))).toEqual([]);
    });

    it.each(["standard", "inhibition", "ax"])(
      "puts the root on every trial %s mode creates",
      (mode) => {
        const jsPsych = initJsPsych();
        const timeline = createTimeline(jsPsych, {
          mode: mode as any,
          numTrials: 2,
          numBlocks: 2,
          showInstructions: true,
          showPractice: true,
          numPracticeTrials: 1,
        });
        const roots: any[] = [];
        const walk = (node: any) => {
          if (Array.isArray(node.timeline)) return node.timeline.forEach(walk);
          roots.push(node.css_classes);
        };
        walk(timeline);
        expect(roots.length).toBeGreaterThan(0);
        roots.forEach((classes) => expect(classes).toEqual([CSS_ROOT]));
      }
    );

    it("removes the root before a foreign trial renders", async () => {
      const jsPsych = initJsPsych();
      const foreign = {
        type: htmlButtonResponse,
        stimulus: "<p>another task</p>",
        choices: ["ok"],
      };
      const cpt = createTimeline(jsPsych, {
        numTrials: 1,
        numBlocks: 1,
        showInstructions: false,
        showPractice: false,
      });
      const { getData } = await simulateTimeline([cpt, foreign], "data-only", {}, jsPsych);
      expect(getData().values().length).toBeGreaterThan(0);
      // jsPsych strips css_classes when a trial ends, so the class is not present
      // for a trial that never asked for it.
      expect(jsPsych.getDisplayElement()?.classList.contains(CSS_ROOT)).toBe(false);
    });
  });

  describe("recorded trial position", () => {
    /** Runs a whole timeline in data-only simulation and returns the rows. */
    const runToCompletion = async (options: any) => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, options);
      const { getData } = await simulateTimeline(timeline.timeline, "data-only", {}, jsPsych);
      return getData().values();
    };

    // The defect this guards: the package wrote its counter to `trial_index`,
    // which jsPsych overwrites with the whole-timeline index in processResult.
    // The value was discarded on every row.
    it("keeps a 1-indexed position within each block", async () => {
      const rows = (
        await runToCompletion({
          mode: "standard",
          numTrials: 6,
          numBlocks: 2,
          showInstructions: false,
          showPractice: false,
        })
      ).filter((r: any) => r.part === "stimulus");

      expect(rows).toHaveLength(6);
      const byBlock: Record<number, number[]> = {};
      rows.forEach((r: any) => (byBlock[r.block] ??= []).push(r.trial_number));
      expect(Object.keys(byBlock)).toHaveLength(2);
      for (const positions of Object.values(byBlock)) {
        expect(positions).toEqual(Array.from({ length: positions.length }, (_, i) => i + 1));
      }
    });

    it("survives the trial_index jsPsych writes over the data parameter", async () => {
      const rows = (
        await runToCompletion({
          mode: "standard",
          numTrials: 4,
          showInstructions: true,
          showPractice: false,
        })
      ).filter((r: any) => r.part === "stimulus");

      expect(rows.map((r: any) => r.trial_number)).toEqual([1, 2, 3, 4]);
      // jsPsych still stamps its own whole-timeline index. Instruction screens run
      // first, so it cannot start at 1 and the two fields are plainly different.
      expect(rows[0].trial_index).toBeGreaterThan(0);
      expect(rows.map((r: any) => r.trial_index)).not.toEqual([1, 2, 3, 4]);
    });

    it("numbers AX cue and probe rows as one pair", async () => {
      const rows = (
        await runToCompletion({
          mode: "ax",
          numTrials: 3,
          showInstructions: false,
          showPractice: false,
        })
      ).filter((r: any) => r.part === "cue" || r.part === "stimulus");

      // each pair shares one position: cue 1, probe 1, cue 2, probe 2, ...
      expect(rows.map((r: any) => r.trial_number)).toEqual([1, 1, 2, 2, 3, 3]);
      expect(rows.map((r: any) => r.ax_part)).toEqual([
        "cue",
        "probe",
        "cue",
        "probe",
        "cue",
        "probe",
      ]);
    });
  });

  describe("scoring functions", () => {
    /**
     * Pushes synthetic stimulus rows straight into the live collection, so scoring
     * can be checked against a hand-worked participant without running trials.
     */
    const withTrials = (rows: any[]) => {
      const jsPsych = initJsPsych();
      const data = jsPsych.data.get();
      rows.forEach((r) =>
        data.push({
          task: "continuous-performance-test",
          phase: "test",
          part: "stimulus",
          block: 1,
          ...r,
        })
      );
      return { jsPsych, data };
    };
    /** n trials of one class, the first `responded` of them answered at `rt`. */
    const trials = (n: number, isTarget: boolean, responded: number, rt: number | null = 400) =>
      Array.from({ length: n }, (_, i) => ({
        is_target: isTarget,
        stimulus_type: isTarget ? "target" : "nontarget",
        responded: i < responded,
        rt: i < responded ? rt : null,
      }));

    it("counts hits, misses and commissions from a hand-worked participant", () => {
      // 10 targets, 7 answered; 20 non-targets, 3 answered.
      const { data } = withTrials([...trials(10, true, 7), ...trials(20, false, 3)]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.totalTargets).toBe(10);
      expect(scores.totalNontargets).toBe(20);
      expect(scores.hits).toBe(7);
      expect(scores.commissions).toBe(3);
      expect(scores.hitRate).toBeCloseTo(0.7, 10);
      expect(scores.omissionRate).toBeCloseTo(0.3, 10);
      expect(scores.commissionRate).toBeCloseTo(0.15, 10);
    });

    it("averages RT over hits only, not over every response", () => {
      const { data } = withTrials([
        ...trials(2, true, 2, 300), // hits at 300ms
        ...trials(2, false, 2, 900), // false alarms at 900ms
      ]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.meanRT).toBe(300);
    });

    it("reports the standard deviation of hit RTs", () => {
      const { data } = withTrials([
        { is_target: true, responded: true, rt: 200 },
        { is_target: true, responded: true, rt: 400 },
        { is_target: false, responded: false, rt: null },
      ]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.meanRT).toBe(300);
      // sample SD of {200, 400} = sqrt(((100^2)+(100^2))/1)
      expect(scores.rtStd).toBeCloseTo(Math.sqrt(20000), 10);
    });

    it("leaves rtStd null when a single hit gives nothing to vary", () => {
      const { data } = withTrials([...trials(1, true, 1, 250), ...trials(1, false, 0)]);
      expect(utils.scoring.calculateScores(data).rtStd).toBeNull();
    });

    it("computes d-prime above zero when hits outnumber false alarms", () => {
      const { data } = withTrials([...trials(20, true, 18), ...trials(20, false, 2)]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.dPrime).not.toBeNull();
      expect(scores.dPrime!).toBeGreaterThan(1.5);
    });

    it("computes d-prime below zero when false alarms outnumber hits", () => {
      const { data } = withTrials([...trials(20, true, 2), ...trials(20, false, 18)]);
      expect(utils.scoring.calculateScores(data).dPrime!).toBeLessThan(-1.5);
    });

    // The mistake the null-guard invites: over-nulling. A d-prime of 0 from equal
    // hit and false-alarm rates is a real result, not a missing one.
    it("keeps a d-prime of zero when hit and false-alarm rates match", () => {
      const { data } = withTrials([...trials(20, true, 10), ...trials(20, false, 10)]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.dPrime).not.toBeNull();
      expect(scores.dPrime!).toBeCloseTo(0, 10);
    });

    it("applies the log-linear correction at ceiling performance", () => {
      const { data } = withTrials([...trials(20, true, 20), ...trials(20, false, 0)]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.hitRate).toBe(1);
      expect(scores.commissionRate).toBe(0);
      // (20 + 0.5) / 21 and (0 + 0.5) / 21 give d' ~= 3.96. Asserting only that the
      // value is finite would not detect a missing correction, because
      // inverseNormalCDF clamps p to [0.0001, 0.9999] and never returns infinity.
      expect(scores.dPrime!).toBeCloseTo(3.96, 1);
    });

    it("keeps a hit rate of zero, which means every target was missed", () => {
      const { data } = withTrials([...trials(10, true, 0), ...trials(10, false, 0)]);
      const scores = utils.scoring.calculateScores(data);

      expect(scores.hitRate).toBe(0);
      expect(scores.omissionRate).toBe(1);
    });

    it("reports a rate of null when the trials it describes do not exist", () => {
      // A pure-target block: no non-target was ever shown, so no commission was
      // ever possible. Reporting 0 would read as flawless inhibition.
      const { data } = withTrials(trials(10, true, 5));
      const scores = utils.scoring.calculateScores(data);

      expect(scores.hitRate).toBeCloseTo(0.5, 10);
      expect(scores.commissionRate).toBeNull();
      expect(scores.totalNontargets).toBe(0);
      expect(scores.dPrime).toBeNull();
      expect(scores.beta).toBeNull();
    });

    it("ignores practice trials and other tasks", () => {
      const { jsPsych, data } = withTrials(trials(4, true, 4));
      data.push({
        task: "continuous-performance-test",
        phase: "practice",
        part: "stimulus",
        is_target: true,
        responded: false,
        rt: null,
      });
      data.push({
        task: "some-other-task",
        phase: "test",
        part: "stimulus",
        is_target: true,
        responded: false,
        rt: null,
      });
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTargets).toBe(4);
      expect(scores.hitRate).toBe(1);
    });

    it("handles empty data without inventing zeros", () => {
      const jsPsych = initJsPsych();
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.hits).toBe(0);
      expect(scores.totalTargets).toBe(0);
      expect(scores.totalNontargets).toBe(0);
      expect(scores.commissions).toBe(0);
      expect(scores.hitRate).toBeNull();
      expect(scores.omissionRate).toBeNull();
      expect(scores.commissionRate).toBeNull();
      expect(scores.meanRT).toBeNull();
      expect(scores.rtStd).toBeNull();
      expect(scores.dPrime).toBeNull();
      expect(scores.beta).toBeNull();
    });

    it("scores each block separately for vigilance-decrement analysis", () => {
      const { jsPsych } = withTrials([]);
      const data = jsPsych.data.get();
      const push = (block: number, rows: any[]) =>
        rows.forEach((r) =>
          data.push({
            task: "continuous-performance-test",
            phase: "test",
            part: "stimulus",
            block,
            ...r,
          })
        );
      push(1, [...trials(10, true, 9), ...trials(10, false, 1)]);
      push(2, [...trials(10, true, 4), ...trials(10, false, 6)]);

      const summary = utils.scoring.getSummary(data);
      expect(summary.blockScores).toHaveLength(2);
      expect(summary.blockScores![0].hitRate).toBeCloseTo(0.9, 10);
      expect(summary.blockScores![1].hitRate).toBeCloseTo(0.4, 10);
      // the decrement the README tells researchers to look for
      expect(summary.blockScores![1].hitRate!).toBeLessThan(summary.blockScores![0].hitRate!);
    });

    it("scores each AX trial type separately", () => {
      const { jsPsych } = withTrials([]);
      const data = jsPsych.data.get();
      const push = (type: string, isTarget: boolean, n: number, responded: number, rt: number) =>
        Array.from({ length: n }, (_, i) =>
          data.push({
            task: "continuous-performance-test",
            phase: "test",
            part: "stimulus",
            block: 1,
            ax_trial_type: type,
            is_target: isTarget,
            responded: i < responded,
            rt: i < responded ? rt : null,
          })
        );
      push("ax", true, 10, 9, 300); // targets, mostly hit
      push("bx", false, 10, 4, 500); // the classic context-maintenance error

      const summary = utils.scoring.getSummary(data);
      expect(summary.axScores).toBeDefined();
      expect(summary.axScores!.ax.hitRate).toBeCloseTo(0.9, 10);
      expect(summary.axScores!.bx.commissionRate).toBeCloseTo(0.4, 10);
      // untouched types report nothing rather than a misleading zero
      expect(summary.axScores!.ay.totalTargets).toBe(0);
      expect(summary.axScores!.ay.hitRate).toBeNull();
      expect(summary.axScores!.ay.commissionRate).toBeNull();
    });

    it("leaves d-prime null per AX type, which never holds both trial classes", () => {
      const { jsPsych } = withTrials([]);
      const data = jsPsych.data.get();
      Array.from({ length: 6 }, (_, i) =>
        data.push({
          task: "continuous-performance-test",
          phase: "test",
          part: "stimulus",
          block: 1,
          ax_trial_type: "ax",
          is_target: true,
          responded: i < 3,
          rt: i < 3 ? 300 : null,
        })
      );
      const summary = utils.scoring.getSummary(data);
      expect(summary.axScores!.ax.totalNontargets).toBe(0);
      expect(summary.axScores!.ax.dPrime).toBeNull();
      expect(summary.axScores!.ax.beta).toBeNull();
      // but the overall summary still reports the rate it can compute
      expect(summary.axScores!.ax.hitRate).toBeCloseTo(0.5, 10);
    });

    it("averages RT over every response of an AX type, not only hits", () => {
      const { jsPsych } = withTrials([]);
      const data = jsPsych.data.get();
      [200, 400].forEach((rt) =>
        data.push({
          task: "continuous-performance-test",
          phase: "test",
          part: "stimulus",
          block: 1,
          ax_trial_type: "bx",
          is_target: false,
          responded: true,
          rt,
        })
      );
      const summary = utils.scoring.getSummary(data);
      // these are false alarms, not hits; a hits-only average would be null here
      expect(summary.axScores!.bx.meanRT).toBe(300);
    });

    it("omits blockScores when the run was a single block", () => {
      const { data } = withTrials([...trials(4, true, 2), ...trials(4, false, 1)]);
      expect(utils.scoring.getSummary(data).blockScores).toBeUndefined();
    });
  });

  describe("getSummary", () => {
    it("should include task name and version", () => {
      const jsPsych = initJsPsych();
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("continuous-performance-test");
      expect(summary.version).toBe("0.0.1");
    });
  });

  describe("ISI generation", () => {
    it("should use fixed ISI when isiMin equals isiMax", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isiMin: 1000,
        isiMax: 1000,
        numTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept isiSet parameter", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isiSet: [500, 1000, 1500],
        numTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept isiMin/isiMax range", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        isiMin: 500,
        isiMax: 1500,
        numTrials: 5,
        showInstructions: false,
        showPractice: false,
      });
      expect(timeline.timeline).toBeDefined();
    });
  });

  describe("text customization", () => {
    it("should use custom text when provided", async () => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, {
          showInstructions: true,
          text: {
            // arguments can be ignored: an override need not use the values
            instruction_standard: () => "<p>Custom intro text</p>",
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

  describe("instruction text tracks the configured stimuli", () => {
    const introHTML = async (options: any) => {
      const jsPsych = initJsPsych();
      const { displayElement } = await startTimeline(
        createTimeline(jsPsych, { showInstructions: true, ...options }).timeline
      );
      return displayElement.innerHTML;
    };

    // The defect this guards: the instructions hardcoded "X", "A" and "RESPOND"
    // while targetLetter, cueLetter, probeLetter and respond_button were all
    // separately configurable, so changing one silently desynced the other.
    it("names the configured target letter in standard mode", async () => {
      const html = await introHTML({ mode: "standard", targetLetter: "Z" });
      expect(html).toContain("<strong>Z</strong>");
      expect(html).not.toContain("target letter <strong>X</strong>");
    });

    it("names the configured no-go letter in inhibition mode", async () => {
      const html = await introHTML({ mode: "inhibition", targetLetter: "Q" });
      expect(html).toContain("<strong>Q</strong>");
      expect(html).not.toContain("letter <strong>X</strong>");
    });

    it("names the configured cue and probe letters in AX mode", async () => {
      const html = await introHTML({ mode: "ax", cueLetter: "M", probeLetter: "T" });
      // Asserting only that both letters appear would not catch them being swapped,
      // so this pins each letter to its role in the sentence.
      expect(html).toContain("<strong>T</strong> after the letter <strong>M</strong>");
      expect(html).not.toContain("<strong>A</strong>");
    });

    it("keeps the cue and probe the right way round", async () => {
      const html = await introHTML({ mode: "ax", cueLetter: "M", probeLetter: "T" });
      const probeAt = html.indexOf("<strong>T</strong>");
      const cueAt = html.indexOf("<strong>M</strong>");
      const afterAt = html.indexOf("after the letter");
      expect(probeAt).toBeLessThan(afterAt);
      expect(cueAt).toBeGreaterThan(afterAt);
    });

    it.each([
      ["standard", { mode: "standard" }],
      ["inhibition", { mode: "inhibition" }],
      ["ax", { mode: "ax" }],
    ])("names the configured respond button in %s mode", async (_label, options) => {
      const html = await introHTML({
        ...options,
        text: { respond_button: "PULSA" },
      });
      expect(html).toContain("<strong>PULSA</strong>");
      expect(html).not.toContain("<strong>RESPOND</strong>");
    });

    it("uses the same label on the button the instructions name", async () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        mode: "standard",
        showInstructions: false,
        showPractice: false,
        numTrials: 1,
        text: { respond_button: "PULSA" },
      });
      const labels: string[] = [];
      const walk = (node: any) => {
        if (Array.isArray(node.timeline)) return node.timeline.forEach(walk);
        if (node.choices) labels.push(...node.choices);
      };
      walk(timeline);
      expect(labels).toContain("PULSA");
    });

    it("lets a translation override ignore the arguments entirely", async () => {
      const html = await introHTML({
        mode: "standard",
        text: { instruction_standard: () => "<p>Sólo esto</p>" },
      });
      expect(html).toContain("Sólo esto");
    });
  });

  describe("constants export", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("continuous-performance-test");
      expect(utils.constants.VERSION).toBe("0.0.1");
      expect(utils.constants.DEFAULT_OPTIONS).toBeDefined();
    });

    it("should have valid default options", () => {
      const defaults = utils.constants.DEFAULT_OPTIONS;
      expect(defaults.mode).toBe("standard");
      expect(defaults.numTrials).toBe(100);
      expect(defaults.stimulusDuration).toBe(250);
      expect(defaults.isiMin).toBe(1000);
      expect(defaults.isiMax).toBe(1000);
      expect(defaults.targetProbability).toBe(0.2);
      expect(defaults.nontargetProbability).toBe(0.1);
      expect(defaults.showPractice).toBe(true);
      expect(defaults.numPracticeTrials).toBe(10);
    });
  });

  describe("timeline units export", () => {
    it("should export timeline unit functions", () => {
      expect(typeof timelineUnits.createInstructionTrials).toBe("function");
      expect(typeof timelineUnits.createPracticeBlock).toBe("function");
      expect(typeof timelineUnits.createTestBlock).toBe("function");
      expect(typeof timelineUnits.createRestScreen).toBe("function");
      expect(typeof timelineUnits.createCompletionTrial).toBe("function");
    });
  });

  describe("default text", () => {
    it("should have all required text fields", () => {
      expect(utils.text.continue_button).toBeDefined();
      expect(utils.text.start_button).toBeDefined();
      expect(utils.text.instruction_standard).toBeDefined();
      expect(utils.text.instruction_inhibition).toBeDefined();
      expect(utils.text.instruction_ax).toBeDefined();
      expect(utils.text.instruction_practice).toBeDefined();
      expect(utils.text.instruction_task).toBeDefined();
      expect(utils.text.rest_screen).toBeDefined();
      expect(utils.text.feedback_hit).toBeDefined();
      expect(utils.text.feedback_false_alarm).toBeDefined();
      expect(utils.text.feedback_miss).toBeDefined();
      expect(utils.text.feedback_correct_rejection).toBeDefined();
      expect(utils.text.task_complete).toBeDefined();
      expect(typeof utils.text.result_summary).toBe("function");
    });
  });

  describe("block configuration", () => {
    it("should create multiple blocks with rest screens", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numBlocks: 3,
        numTrials: 30,
        showInstructions: false,
        showPractice: false,
      });
      // 3 test blocks + 2 rest screens + 1 completion = 6
      expect(timeline.timeline.length).toBe(6);
    });

    it("should create single block without rest screens", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        numBlocks: 1,
        numTrials: 30,
        showInstructions: false,
        showPractice: false,
      });
      // 1 test block + 1 completion = 2
      expect(timeline.timeline.length).toBe(2);
    });
  });

  describe("configuration validation", () => {
    const build = (opts: any) => () => createTimeline(initJsPsych(), opts);

    it.each([
      ["numTrials of 0", { numTrials: 0 }, /numTrials must be an integer >= 1/],
      ["negative numTrials", { numTrials: -5 }, /numTrials must be an integer >= 1/],
      ["fractional numTrials", { numTrials: 10.5 }, /numTrials must be an integer >= 1/],
      ["numBlocks of 0", { numBlocks: 0 }, /numBlocks must be an integer >= 1/],
      [
        "more blocks than trials",
        { numTrials: 3, numBlocks: 5 },
        /numBlocks \(5\) cannot exceed numTrials \(3\)/,
      ],
      [
        "zero stimulusDuration",
        { stimulusDuration: 0 },
        /stimulusDuration must be a finite number >= 1/,
      ],
      ["inverted ISI range", { isiMin: 2000, isiMax: 500 }, /isiMax must be >= isiMin \(2000\)/],
      ["negative isiMin", { isiMin: -100, isiMax: 100 }, /isiMin must be a finite number >= 0/],
      ["empty isiSet", { isiSet: [] }, /isiSet must be a non-empty array/],
      [
        "negative value in isiSet",
        { isiSet: [500, -1] },
        /isiSet\[1\] must be a finite number >= 0/,
      ],
      [
        "zero practice trials while practice is shown",
        { showPractice: true, numPracticeTrials: 0 },
        /numPracticeTrials must be an integer >= 1/,
      ],
    ])("rejects %s", (_label, opts, message) => {
      expect(build(opts)).toThrow(message);
    });

    it.each([
      [
        "targetProbability above 1",
        { mode: "standard", targetProbability: 1.5 },
        /targetProbability must be a probability between 0 and 1/,
      ],
      [
        "negative targetProbability",
        { mode: "standard", targetProbability: -0.2 },
        /targetProbability must be a probability between 0 and 1/,
      ],
      [
        "nontargetProbability above 1",
        { mode: "inhibition", nontargetProbability: 2 },
        /nontargetProbability must be a probability between 0 and 1/,
      ],
      [
        "a stimuliPool holding only the target letter",
        { mode: "standard", targetLetter: "X", stimuliPool: ["X"] },
        /stimuliPool must contain at least one letter other than targetLetter \("X"\)/,
      ],
      [
        "an empty stimuliPool",
        { mode: "standard", stimuliPool: [] },
        /stimuliPool must be a non-empty array/,
      ],
      [
        "an empty targetLetter",
        { mode: "standard", targetLetter: "" },
        /targetLetter must be a non-empty string/,
      ],
    ])("rejects %s", (_label, opts, message) => {
      expect(build(opts)).toThrow(message);
    });

    it.each([
      [
        "AX probabilities summing above 1",
        {
          mode: "ax",
          axProbability: 0.5,
          ayProbability: 0.3,
          bxProbability: 0.3,
          byProbability: 0.3,
        },
        /must sum to 1, got 1\.4/,
      ],
      [
        "AX probabilities summing below 1",
        {
          mode: "ax",
          axProbability: 0.2,
          ayProbability: 0.2,
          bxProbability: 0.2,
          byProbability: 0.2,
        },
        /must sum to 1, got 0\.8/,
      ],
      [
        "cueDelay shorter than stimulusDuration",
        { mode: "ax", cueDelay: 80, stimulusDuration: 250 },
        /cueDelay must be >= stimulusDuration \(250\)/,
      ],
      [
        "AX counts that round past numTrials",
        {
          mode: "ax",
          numTrials: 1,
          axProbability: 0.5,
          ayProbability: 0.5,
          bxProbability: 0,
          byProbability: 0,
          showPractice: false,
        },
        /round to more than numTrials \(1\)/,
      ],
      [
        // Sums to exactly 1, so only the per-probability check can catch it.
        "an out-of-range AX probability that still sums to 1",
        { mode: "ax", axProbability: 1.5, ayProbability: -0.5, bxProbability: 0, byProbability: 0 },
        /axProbability must be a probability between 0 and 1, got 1\.5/,
      ],
      [
        "a negative AX probability that still sums to 1",
        {
          mode: "ax",
          axProbability: 0.5,
          ayProbability: 0.7,
          bxProbability: -0.2,
          byProbability: 0,
        },
        /bxProbability must be a probability between 0 and 1, got -0\.2/,
      ],
    ])("rejects %s", (_label, opts, message) => {
      expect(build(opts)).toThrow(message);
    });

    it("reports the offending value in the message", () => {
      expect(build({ numTrials: -5 })).toThrow("got -5");
    });

    it("names the package in every error", () => {
      expect(build({ numTrials: 0 })).toThrow(/^\[continuous-performance-test\]/);
    });

    it("accepts a pure-target block, which is a legitimate design", () => {
      expect(build({ mode: "standard", targetProbability: 1 })).not.toThrow();
    });

    it("accepts a pure-nontarget block, which is a legitimate design", () => {
      expect(build({ mode: "standard", targetProbability: 0 })).not.toThrow();
    });

    it("allows a stimuliPool of only the target letter when no pool letters are needed", () => {
      // targetProbability 1 means every trial is the target letter, so the pool is unused.
      expect(build({ mode: "standard", targetProbability: 1, stimuliPool: ["X"] })).not.toThrow();
    });

    it("ignores AX parameters when the mode is not ax", () => {
      // Leftover AX values must not block a standard run they cannot affect.
      expect(build({ mode: "standard", axProbability: 0.9, cueDelay: 1 })).not.toThrow();
    });

    it("ignores practice parameters when practice is disabled", () => {
      expect(build({ showPractice: false, numPracticeTrials: 0 })).not.toThrow();
    });

    it("ignores isiMin/isiMax when isiSet is supplied", () => {
      expect(build({ isiSet: [500, 1000], isiMin: 2000, isiMax: 100 })).not.toThrow();
    });

    it("accepts the documented Conners-style configuration", () => {
      expect(
        build({ mode: "inhibition", numTrials: 360, isiSet: [1000, 2000, 4000], numBlocks: 6 })
      ).not.toThrow();
    });

    it("accepts the documented AX-CPT configuration", () => {
      expect(build({ mode: "ax", numTrials: 120, cueDelay: 3000, numBlocks: 4 })).not.toThrow();
    });
  });

  describe("configuration options", () => {
    it("should accept custom number of trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { numTrials: 50 });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom stimulus duration", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { stimulusDuration: 500 });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom target letter", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { targetLetter: "Z" });
      expect(timeline.timeline).toBeDefined();
    });

    it("should accept custom number of practice trials", () => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, { numPracticeTrials: 5 });
      expect(timeline.timeline).toBeDefined();
    });
  });
});
