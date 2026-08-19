import { readFileSync } from "fs";
import { join } from "path";

import { JsPsych, initJsPsych } from "jspsych";

import {
  createGridHTML,
  createMultiLevelNBackTimeline,
  createPracticeTimeline,
  createTimeline,
  presetConfigurations,
  utils,
} from "./index";

/* Test suite for Spatial N-Back Timeline
  In-depth HTML testing is in the Spatial N-Back plugin. */
describe("createTimeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should create timeline with default parameters", () => {
    const timeline = createTimeline(jsPsych);
    expect(timeline.timeline).toHaveLength(21);
    expect(timeline.timeline[0].rows).toBe(3);
    expect(timeline.timeline[0].cols).toBe(3);
    expect(timeline.timeline[0].data.n_back).toBe(1);
  });

  it("should create timeline with custom total_trials", () => {
    const timeline = createTimeline(jsPsych, { total_trials: 25 });
    expect(timeline.timeline).toHaveLength(26);
  });

  it("should create timeline with custom grid dimensions", () => {
    const timeline = createTimeline(jsPsych, { rows: 4, cols: 5 });
    expect(timeline.timeline[0].rows).toBe(4);
    expect(timeline.timeline[0].cols).toBe(5);
  });

  it("should set correct n_back in trial data", () => {
    const timeline = createTimeline(jsPsych, { n_back: 3 });
    // Exclude the last item (completion trial)
    timeline.timeline.slice(0, -1).forEach((trial) => {
      expect(trial.data.n_back).toBe(3);
    });
  });

  it("should omit the results screen when show_completion is false", () => {
    const timeline = createTimeline(jsPsych, { total_trials: 4, show_completion: false });

    expect(timeline.timeline).toHaveLength(4);
    timeline.timeline.forEach((trial: any) => {
      expect(trial.data.phase).toBe("test");
    });
  });

  it("should include the results screen by default", () => {
    const timeline = createTimeline(jsPsych, { total_trials: 4 });

    expect(timeline.timeline).toHaveLength(5);
    expect((timeline.timeline[4] as any).data.phase).toBe("completion");
  });

  it("should include instructions when specified", () => {
    const timeline = createTimeline(jsPsych, { include_instructions: true });
    expect(timeline.timeline).toHaveLength(3);
    expect(timeline.timeline[0].show_clickable_nav).toBeTruthy();
  });

  it("should set correct trial properties", () => {
    const timeline = createTimeline(jsPsych, {
      stimulus_duration: 1000,
      buttons: ["CLICK"],
      cell_size: 200,
    });

    expect(timeline.timeline[0].stimulus_duration).toBe(1000);
    expect(timeline.timeline[0].buttons).toEqual(["CLICK"]);
    expect(timeline.timeline[0].cell_size).toBe(200);
  });

  it("should generate correct trial numbers in data", () => {
    const timeline = createTimeline(jsPsych, { total_trials: 5 });
    // Exclude the last item (completion trial)
    timeline.timeline.slice(0, -1).forEach((trial, index) => {
      expect(trial.data.trial_number).toBe(index + 1);
      expect(trial.data.task).toBe("spatial-nback");
      expect(trial.data.task_version).toBeDefined();
    });
  });

  it("should include task_version in trial data", () => {
    const timeline = createTimeline(jsPsych, { total_trials: 3 });
    // Exclude the last item (completion trial)
    timeline.timeline.slice(0, -1).forEach((trial) => {
      expect(trial.data.task_version).toBe("0.3.0");
    });
  });
});

describe("createPracticeTimeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should create practice timeline with default 5 trials", () => {
    const timeline = createPracticeTimeline(jsPsych);
    expect(timeline.timeline).toHaveLength(6);
  });

  it("should enable feedback by default", () => {
    const timeline = createPracticeTimeline(jsPsych);
    expect(timeline.timeline[0].show_feedback_text).toBe(true);
    expect(timeline.timeline[0].show_feedback_border).toBe(true);
  });

  it("should accept custom options", () => {
    const timeline = createPracticeTimeline(jsPsych, { n_back: 2 });
    expect(timeline.timeline[0].data.n_back).toBe(2);
  });
});

describe("createMultiLevelNBackTimeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should create timeline with multiple levels", () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      n_backs: [1, 2, 3],
      trials_per_level: 10,
    });

    // levels block, then one results screen
    expect(timeline.timeline).toHaveLength(2);

    const levels = (timeline.timeline[0] as any).timeline;
    expect(levels).toHaveLength(3);
    levels.forEach((level: any) => {
      expect(level.timeline).toHaveLength(10);
    });
  });

  it("should show exactly one results screen, after every level", () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      n_backs: [1, 2, 3],
      trials_per_level: 4,
    });

    const flatten = (node: any): any[] => (node.timeline ? node.timeline.flatMap(flatten) : [node]);
    const trials = flatten(timeline);
    const completions = trials.filter((trial) => trial.data?.phase === "completion");

    expect(completions).toHaveLength(1);
    expect(trials[trials.length - 1]).toBe(completions[0]);
  });

  it("should not let randomize_order move the results screen", () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      randomize_levels: true,
    });

    // randomize_order must sit on the node holding the levels, not on the node
    // that also holds the results screen, or the screen can be shuffled inward
    expect((timeline as any).randomize_order).toBeUndefined();
    expect((timeline.timeline[0] as any).randomize_order).toBe(true);
    expect((timeline.timeline[1] as any).data.phase).toBe("completion");
  });

  it("should set correct n_back for each level", () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      n_backs: [1, 3],
      trials_per_level: 5,
    });

    const levels = (timeline.timeline[0] as any).timeline;
    expect(levels[0].timeline[0].data.n_back).toBe(1);
    expect(levels[1].timeline[0].data.n_back).toBe(3);
  });

  it("should randomize levels when specified", () => {
    const timeline = createMultiLevelNBackTimeline(jsPsych, {
      randomize_levels: true,
    });

    expect((timeline.timeline[0] as any).randomize_order).toBe(true);
  });
});

describe("presetConfigurations", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should create easy preset with correct parameters", () => {
    const timeline = presetConfigurations.easy(jsPsych);
    expect(timeline.timeline).toHaveLength(21);
    expect(timeline.timeline[0].data.n_back).toBe(1);
    expect(timeline.timeline[0].show_feedback_text).toBe(true);
  });

  it("should create medium preset with correct parameters", () => {
    const timeline = presetConfigurations.medium(jsPsych);
    expect(timeline.timeline).toHaveLength(31);
    expect(timeline.timeline[0].data.n_back).toBe(2);
    expect(timeline.timeline[0].show_feedback_text).toBe(false);
  });

  it("should create hard preset with correct parameters", () => {
    const timeline = presetConfigurations.hard(jsPsych);
    expect(timeline.timeline).toHaveLength(41);
    expect(timeline.timeline[0].data.n_back).toBe(3);
    expect(timeline.timeline[0].rows).toBe(4);
    expect(timeline.timeline[0].cols).toBe(4);
  });

  it("should create research preset with multi-level timeline", () => {
    const timeline = presetConfigurations.research(jsPsych);
    expect(timeline.timeline).toHaveLength(2);

    const levels = (timeline.timeline[0] as any).timeline;
    expect(levels).toHaveLength(3);
    expect((timeline.timeline[0] as any).randomize_order).toBe(true);

    // 50 trials per level, and no per-level results screen
    levels.forEach((levelTimeline: any) => {
      expect(levelTimeline.timeline).toHaveLength(50);
    });
  });
});

describe("timeline instruction customization", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should replace placeholders in trial prompt", () => {
    const timeline = createTimeline(jsPsych, {
      prompt: "Level {n_back}, Trial {trial} of {total}",
      n_back: 2,
      total_trials: 5,
    });

    expect(timeline.timeline[0].instructions).toBe("<p>Level 2, Trial 1 of 5</p>");
    expect(timeline.timeline[4].instructions).toBe("<p>Level 2, Trial 5 of 5</p>");
  });

  it("should use custom prompt parameter when provided", () => {
    const customPrompt = "Custom instruction: Position {n_back} back (Trial {trial}/{total})";
    const timeline = createTimeline(jsPsych, {
      prompt: customPrompt,
      n_back: 1,
      total_trials: 3,
    });

    expect(timeline.timeline[0].instructions).toBe(
      "<p>Custom instruction: Position 1 back (Trial 1/3)</p>"
    );
    expect(timeline.timeline[1].instructions).toBe(
      "<p>Custom instruction: Position 1 back (Trial 2/3)</p>"
    );
    expect(timeline.timeline[2].instructions).toBe(
      "<p>Custom instruction: Position 1 back (Trial 3/3)</p>"
    );
  });
});

describe("timeline structure validation", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should ensure first n trials are never targets", () => {
    const timeline = createTimeline(jsPsych, { n_back: 3, total_trials: 10 });

    expect(timeline.timeline[0].is_target).toBe(false);
    expect(timeline.timeline[1].is_target).toBe(false);
    expect(timeline.timeline[2].is_target).toBe(false);
  });

  it("should maintain consistent data structure across trials", () => {
    const timeline = createTimeline(jsPsych, { total_trials: 5 });

    // Exclude the last item (completion trial)
    timeline.timeline.slice(0, -1).forEach((trial) => {
      expect(trial.data).toHaveProperty("trial_number");
      expect(trial.data).toHaveProperty("n_back");
      expect(trial.data).toHaveProperty("total_trials");
      expect(trial.data).toHaveProperty("task");
    });
  });
});

describe("createGridHTML", () => {
  it("should create grid with default parameters", () => {
    const html = createGridHTML();
    expect(html).toContain('id="nback-grid"');
    expect(html).toContain('id="cell-0-0"');
    expect(html).toContain('id="cell-2-2"');
  });

  it("should create grid with custom dimensions", () => {
    const html = createGridHTML({ rows: 4, cols: 5 });
    expect(html).toContain('id="cell-0-0"');
    expect(html).toContain('id="cell-3-4"');
    expect(html).not.toContain('id="cell-4-0"');
  });

  it("should use custom cell size", () => {
    const html = createGridHTML({ cell_size: 100 });
    expect(html).toContain("width: 100px");
    expect(html).toContain("height: 100px");
  });

  it("should highlight specified position", () => {
    const html = createGridHTML({
      highlight_position: { row: 1, col: 1 },
      highlight_color: "#FF0000",
    });
    expect(html).toContain("background-color: #FF0000");
  });

  it("should not highlight any position when highlight_position is null", () => {
    const html = createGridHTML({ highlight_position: null });
    expect(html).not.toContain("background-color");
  });
});

describe("utils.scoring", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  it("should return empty scores for no data", () => {
    const scores = utils.scoring.calculateScores(jsPsych.data.get());

    expect(scores.totalTrials).toBe(0);
    expect(scores.accuracy).toBe(0);
    expect(scores.targetHits).toBe(0);
    expect(scores.meanRT).toBeNull();
  });

  it("should calculate accuracy correctly", () => {
    const dataCollection = jsPsych.data.get();
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: true,
      response_time: 400,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: false,
      response_time: 350,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: false,
      is_target: true,
      response_time: 500,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: false,
      response_time: 380,
    });

    const scores = utils.scoring.calculateScores(dataCollection);

    expect(scores.totalTrials).toBe(4);
    expect(scores.correctTrials).toBe(3);
    expect(scores.accuracy).toBeCloseTo(0.75, 2);
  });

  it("should calculate hit rate and false alarm rate", () => {
    const dataCollection = jsPsych.data.get();
    // 2 target trials: 1 hit, 1 miss
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: true,
      response_time: 400,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: false,
      is_target: true,
      response_time: null,
    });
    // 2 non-target trials: 1 correct rejection, 1 false alarm
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: false,
      response_time: 350,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: false,
      is_target: false,
      response_time: 420,
    });

    const scores = utils.scoring.calculateScores(dataCollection);

    expect(scores.targetTrials).toBe(2);
    expect(scores.targetHits).toBe(1);
    expect(scores.targetHitRate).toBeCloseTo(0.5, 2);
    expect(scores.nonTargetTrials).toBe(2);
    expect(scores.correctRejections).toBe(1);
    expect(scores.falseAlarms).toBe(1);
    expect(scores.falseAlarmRate).toBeCloseTo(0.5, 2);
  });

  it("should calculate mean RT for correct trials only", () => {
    const dataCollection = jsPsych.data.get();
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: true,
      response_time: 400,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: true,
      is_target: false,
      response_time: 500,
    });
    dataCollection.push({
      task: "spatial-nback",
      phase: "test",
      correct: false,
      is_target: true,
      response_time: 1000,
    });

    const scores = utils.scoring.calculateScores(dataCollection);

    expect(scores.meanRT).toBe(450); // (400 + 500) / 2, excluding incorrect
  });

  it("should calculate d-prime", () => {
    const dataCollection = jsPsych.data.get();
    // High hit rate, low false alarm rate = high d'
    for (let i = 0; i < 8; i++) {
      dataCollection.push({
        task: "spatial-nback",
        phase: "test",
        correct: true,
        is_target: true,
        response_time: 400,
      });
    }
    for (let i = 0; i < 2; i++) {
      dataCollection.push({
        task: "spatial-nback",
        phase: "test",
        correct: false,
        is_target: true,
        response_time: null,
      });
    }
    for (let i = 0; i < 9; i++) {
      dataCollection.push({
        task: "spatial-nback",
        phase: "test",
        correct: true,
        is_target: false,
        response_time: 350,
      });
    }
    for (let i = 0; i < 1; i++) {
      dataCollection.push({
        task: "spatial-nback",
        phase: "test",
        correct: false,
        is_target: false,
        response_time: 420,
      });
    }

    const scores = utils.scoring.calculateScores(dataCollection);

    expect(scores.dPrime).toBeGreaterThan(1); // Good performance = positive d'
  });

  it("should include task info in getSummary", () => {
    const summary = utils.scoring.getSummary(jsPsych.data.get());

    expect(summary).toHaveProperty("taskName", "spatial-nback");
    expect(summary).toHaveProperty("version");
  });
});

describe("utils.constants", () => {
  it("should export task constants", () => {
    expect(utils.constants.TASK_NAME).toBe("spatial-nback");
    expect(utils.constants.VERSION).toBeDefined();
  });
});

describe("utils.text", () => {
  it("should export default text configuration", () => {
    expect(utils.text).toBeDefined();
    expect(utils.text.prompt).toBeDefined();
    expect(utils.text.button).toBeDefined();
  });
});

/* Runs one real plugin trial rather than a fabricated row, so the field names
   the scoring code reads are checked against what the plugin actually emits. */
describe("plugin data contract", () => {
  it("should score a trial recorded by the real plugin", async () => {
    const jsPsych = initJsPsych();
    const timeline = createTimeline(jsPsych, {
      total_trials: 1,
      stimulus_duration: 50,
      isi_duration: 50,
      feedback_duration: 0,
    });

    const finished = jsPsych.run([timeline.timeline[0]]);

    // press "no match" while the stimulus is up; the only trial is a non-target,
    // so this is a correct response and carries a response time.
    await new Promise<void>((resolve, reject) => {
      const deadline = Date.now() + 2000;
      const poll = setInterval(() => {
        const button = document.querySelector("#nback-response-btn-1") as HTMLButtonElement | null;
        if (button && !button.disabled) {
          clearInterval(poll);
          button.click();
          resolve();
        } else if (Date.now() > deadline) {
          clearInterval(poll);
          reject(new Error("response button never became enabled"));
        }
      }, 1);
    });
    await finished;

    const row = jsPsych.data.get().values()[0];
    expect(row.correct).toBe(true);
    expect(typeof row.response_time).toBe("number");

    const scores = utils.scoring.calculateScores(jsPsych.data.get());
    expect(scores.meanRT).toBe(row.response_time);
    expect(scores.meanTargetRT).toBeNull(); // no target trials in this run
  });
});

/* jsdom has no cascade for the injected stylesheet and no layout engine, so these assert against the 
   stylesheet text that ships and against the class tokens the source emits, not computed styles. */
describe("styles", () => {
  const ROOT = "jspsych-spatial-nback-container";
  const PREFIX = "jspsych-spatial-nback";

  const css = readFileSync(join(__dirname, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  const selectors = [...css.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith("@"))
    .flatMap((selector) => selector.split(",").map((part) => part.trim()))
    .filter((selector) => selector.length > 0);

  const flatten = (node: any): any[] => (node.timeline ? node.timeline.flatMap(flatten) : [node]);

  it("should define at least one rule", () => {
    // guards the two tests below from passing on an empty parse
    expect(selectors.length).toBeGreaterThan(5);
  });

  it("should scope every rule under the timeline root", () => {
    const unscoped = selectors.filter((selector) => !selector.startsWith(`.${ROOT}`));
    expect(unscoped).toEqual([]);
  });

  it("should not reach outside the timeline's own DOM", () => {
    const escapes = selectors.filter((selector) =>
      /(^|\s)(body|html|\*)(\s|$)|^\.(jspsych-content|jspsych-display-element)/.test(selector)
    );
    expect(escapes).toEqual([]);
  });

  it("should prefix every class the source emits", () => {
    const sources = ["index.ts", "text.ts"].map((file) =>
      readFileSync(join(__dirname, file), "utf8")
    );
    const emitted = sources.flatMap((source) => [
      ...[...source.matchAll(/class=["']([^"']+)["']/g)].flatMap((m) => m[1].split(/\s+/)),
      ...[...source.matchAll(/classList\.add\(["']([^"']+)["']\)/g)].map((m) => m[1]),
    ]);

    expect(emitted.length).toBeGreaterThan(0);
    emitted.forEach((token) => {
      expect(token.startsWith(PREFIX)).toBe(true);
    });
  });

  it("should put the scoping root on every trial the timeline produces", () => {
    const jsPsych = initJsPsych();
    const timeline = createTimeline(jsPsych, {
      total_trials: 2,
      include_instructions: true,
    });

    const trials = flatten(timeline);
    expect(trials.length).toBe(4); // instructions, 2 trials, results screen
    trials.forEach((trial) => {
      expect(trial.css_classes).toContain(ROOT);
    });
  });
});
