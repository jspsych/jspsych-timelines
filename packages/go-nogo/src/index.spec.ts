import { readFileSync } from "node:fs";
import { join } from "node:path";

import { JsPsych, initJsPsych } from "jspsych";

import { createInstructions, createTimeline, timelineUnits, utils } from ".";

describe("Go-NoGo Timeline", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should create timeline with default config", () => {
      const timeline = createTimeline(jsPsych);

      expect(timeline).toHaveProperty("timeline");
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should create correct number of blocks with breaks between them", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 3,
        num_trials: 10,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      // Timeline structure: [blocksArray] where blocksArray = [block1, break, block2, break, block3]
      const blocksArray = timeline.timeline[0] as any[];
      // 3 blocks + 2 breaks = 5 items
      expect(blocksArray.length).toBe(5);

      // Verify block breaks are in correct positions
      const break1 = blocksArray[1];
      const break2 = blocksArray[3];
      expect(break1.timeline[0].data.part).toBe("block-break");
      expect(break2.timeline[0].data.part).toBe("block-break");
    });

    it("should create correct number of trials per block via timeline_variables", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 1,
        num_trials: 20,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];

      expect(blockProcedure.timeline_variables.length).toBe(20);
    });

    it("should apply trial_timeout to stimulus trials", () => {
      const timeline = createTimeline(jsPsych, {
        trial_timeout: 750,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      // Trial sequence: [fixation, stimulus, isi_blank]
      const stimulusTrial = blockProcedure.timeline[1];

      expect(stimulusTrial.trial_duration).toBe(750);
    });

    it("should respect probability for go/nogo trial ratio", () => {
      const timeline = createTimeline(jsPsych, {
        probability: 0.8, // 80% go trials
        num_blocks: 1,
        num_trials: 100,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const trialVars = blockProcedure.timeline_variables;

      const goTrials = trialVars.filter((v: any) => v.is_go_trial === true);
      const nogoTrials = trialVars.filter((v: any) => v.is_go_trial === false);

      // With 0.8 probability and 100 trials, expect ~80 go and ~20 nogo
      expect(goTrials.length).toBe(80);
      expect(nogoTrials.length).toBe(20);
    });

    it("should include debrief when show_debrief is true", () => {
      const timeline = createTimeline(jsPsych, {
        show_debrief: true,
        show_instructions: false,
        show_practice: false,
        num_blocks: 1,
      });

      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.phase).toBe("completion");
      expect(typeof lastItem.stimulus).toBe("function");
    });

    it("should exclude debrief when show_debrief is false", () => {
      const timeline = createTimeline(jsPsych, {
        show_debrief: false,
        show_instructions: false,
        show_practice: false,
        num_blocks: 1,
      });

      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      // Last item should be the blocks array, not a debrief
      expect(Array.isArray(lastItem)).toBe(true);
    });

    it("should include instructions when show_instructions is true", () => {
      const withInstructions = createTimeline(jsPsych, {
        show_instructions: true,
        show_practice: false,
        show_debrief: false,
        num_blocks: 1,
      });
      const withoutInstructions = createTimeline(jsPsych, {
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
        num_blocks: 1,
      });

      // Instructions add practice trials at the start
      expect(withInstructions.timeline.length).toBeGreaterThan(withoutInstructions.timeline.length);
    });

    it("should include practice block when show_practice is true", () => {
      const timeline = createTimeline(jsPsych, {
        show_practice: true,
        num_practice_trials: 10,
        show_instructions: false,
        show_debrief: false,
        num_blocks: 1,
      });

      // First item should be practice procedure, followed by end-of-practice screen
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem.data.phase).toBe("practice");
    });

    it("should use custom go_stimulus and nogo_stimulus in timeline_variables", () => {
      const timeline = createTimeline(jsPsych, {
        go_stimulus: "<span>GO!</span>",
        nogo_stimulus: "<span>STOP!</span>",
        num_blocks: 1,
        num_trials: 10,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const trialVars = blockProcedure.timeline_variables;

      const goTrial = trialVars.find((v: any) => v.is_go_trial === true);
      const nogoTrial = trialVars.find((v: any) => v.is_go_trial === false);

      expect(goTrial.stimulus).toContain("GO!");
      expect(nogoTrial.stimulus).toContain("STOP!");
    });
  });

  describe("config validation", () => {
    it.each([
      ["num_blocks", 0],
      ["num_blocks", -1],
      ["num_blocks", 2.5],
      ["num_trials", 0],
      ["num_trials", -5],
      ["num_trials", 10.5],
      ["probability", 1.5],
      ["probability", -0.5],
      ["probability", NaN],
      ["trial_timeout", -1],
      ["fixation_duration", -1],
      ["isi_duration", -1],
      ["stimulus_duration", -1],
      ["block_break_duration", -1],
    ])("should reject %s = %p", (param, value) => {
      expect(() => createTimeline(jsPsych, { [param]: value } as any)).toThrow(/^\[go-nogo\]/);
    });

    it.each([
      ["num_practice_trials", 0],
      ["num_practice_trials", 1.5],
      ["practice_probability", NaN],
    ])("should reject %s = %p when show_practice is true", (param, value) => {
      expect(() => createTimeline(jsPsych, { show_practice: true, [param]: value } as any)).toThrow(
        /^\[go-nogo\]/
      );
    });

    it("should allow a pure go block", () => {
      const vars = utils.createTimelineVariables(jsPsych, 1, 10, 1, ["G"], ["N"]);

      expect(vars).toHaveLength(10);
      expect(vars.every((v: any) => v.is_go_trial)).toBe(true);
    });

    it("should allow a pure nogo block", () => {
      const vars = utils.createTimelineVariables(jsPsych, 1, 10, 0, ["G"], ["N"]);

      expect(vars).toHaveLength(10);
      expect(vars.every((v: any) => !v.is_go_trial)).toBe(true);
    });

    it("should reject counts Array() cannot represent", () => {
      expect(() => utils.createTimelineVariables(jsPsych, 1, 10, 1.5, ["G"], ["N"])).toThrow(
        /whole numbers >= 0/
      );
      expect(() => utils.createTimelineVariables(jsPsych, 1, 10.5, 0.75, ["G"], ["N"])).toThrow(
        /whole numbers >= 0/
      );
      expect(() => utils.createTimelineVariables(jsPsych, 1, 10, NaN, ["G"], ["N"])).toThrow(
        /whole numbers >= 0/
      );
    });

    it("should allow probability 0 and 1 through createTimeline", () => {
      expect(() => createTimeline(jsPsych, { num_trials: 10, probability: 1 })).not.toThrow();
      expect(() => createTimeline(jsPsych, { num_trials: 10, probability: 0 })).not.toThrow();
      expect(() =>
        createTimeline(jsPsych, { show_practice: true, practice_probability: 1 })
      ).not.toThrow();
    });

    it("should allow null for the optional duration parameters", () => {
      expect(() =>
        createTimeline(jsPsych, { stimulus_duration: null, block_break_duration: null })
      ).not.toThrow();
    });

    it("should accept a valid config", () => {
      expect(() =>
        createTimeline(jsPsych, {
          num_blocks: 2,
          num_trials: 20,
          probability: 0.75,
          show_practice: true,
          num_practice_trials: 8,
          practice_probability: 0.5,
          trial_timeout: 0,
          fixation_duration: 0,
          isi_duration: 0,
          stimulus_duration: 200,
          block_break_duration: 5000,
        })
      ).not.toThrow();
    });

    it("should not validate practice parameters when show_practice is false", () => {
      expect(() =>
        createTimeline(jsPsych, { show_practice: false, num_practice_trials: 0 })
      ).not.toThrow();
    });
  });

  describe("CSS scoping", () => {
    const ROOT = "jspsych-go-nogo";

    // Walk a timeline description and collect every trial (a node with `type`).
    const allTrials = (node: any, out: any[] = []) => {
      if (Array.isArray(node)) node.forEach((n) => allTrials(n, out));
      else if (node && typeof node === "object") {
        if (node.type) out.push(node);
        if (node.timeline) allTrials(node.timeline, out);
      }
      return out;
    };

    it("should put the scoping root on every trial it generates", () => {
      const { timeline } = createTimeline(jsPsych, {
        show_instructions: true,
        show_practice: true,
        show_debrief: true,
        num_blocks: 2,
        num_trials: 6,
      });

      const trials = allTrials(timeline);
      expect(trials.length).toBeGreaterThan(5);
      // css_classes cascades, but these are also exported as standalone units,
      // so the root is set per trial rather than relying on a parent node.
      expect(trials.filter((t) => t.css_classes !== ROOT)).toEqual([]);
    });

    it.each([
      ["createFixation", () => timelineUnits.createFixation(jsPsych, 500, "Click", true)],
      ["createISIBlank", () => timelineUnits.createISIBlank(jsPsych, 500, "Click", true)],
      ["createGoNoGo", () => timelineUnits.createGoNoGo(jsPsych, "Click", 500)],
      ["createBlockBreak", () => timelineUnits.createBlockBreak(1, 3)],
      ["createDebrief", () => timelineUnits.createDebrief(jsPsych)],
      ["createEndOfPractice", () => timelineUnits.createEndOfPractice()],
      ["createInstructions", () => createInstructions(["a"])],
    ])("should scope %s when used standalone", (_name, make) => {
      expect((make() as any).css_classes).toBe(ROOT);
    });

    it("should prefix every class it writes into the DOM", () => {
      const { timeline } = createTimeline(jsPsych, {
        show_instructions: true,
        show_practice: true,
        show_debrief: true,
        num_blocks: 1,
        num_trials: 4,
      });

      const html = allTrials(timeline)
        .map((t) => {
          const s = typeof t.stimulus === "function" ? t.stimulus() : t.stimulus;
          return [s, ...(t.pages ?? [])].join(" ");
        })
        .join(" ");

      const classes = [...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/));
      expect(classes.length).toBeGreaterThan(0);
      expect(classes.filter((c) => c && !c.startsWith("jspsych-go-nogo"))).toEqual([]);
    });

    it("should prefix every id it writes into the DOM", () => {
      const stimulus = utils.createStimulusHTML("X", false, "25vh");
      const timerBreak: any = timelineUnits.createBlockBreak(1, 2, 5000);

      const ids = [...`${stimulus} ${timerBreak.stimulus}`.matchAll(/id="([^"]*)"/g)].map(
        (m) => m[1]
      );

      expect(ids.length).toBeGreaterThan(0);
      expect(ids.filter((id) => !id.startsWith("jspsych-go-nogo"))).toEqual([]);
    });
  });

  describe("stimulus and fixation alignment", () => {
    // jsdom has no layout engine and does not apply the injected stylesheet to
    // getComputedStyle, so assert against the stylesheet that actually ships.
    const css = readFileSync(join(__dirname, "styles.css"), "utf8");

    const declarationsFor = (selector: string) =>
      [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)]
        .filter(([, sels]) => sels.split(",").some((s) => s.trim().endsWith(selector)))
        .map(([, , body]) => body.replace(/\s+/g, " ").trim())
        .join(" ");

    // Every box that receives stimulus_container_height must center its
    // contents, or the screens line up while their contents do not.
    it.each([
      [".jspsych-go-nogo-fixation"],
      [".jspsych-go-nogo-stimulus"],
      [".jspsych-go-nogo-isi-blank"],
    ])("should center the contents of %s", (selector) => {
      const decls = declarationsFor(selector);

      expect(decls).toMatch(/display:\s*grid/);
      expect(decls).toMatch(/place-items:\s*center/);
    });

    it("should center fixation and stimulus identically", () => {
      // The two screens alternate, so any difference shows up as the stimulus
      // jumping relative to the fixation cross.
      expect(declarationsFor(".jspsych-go-nogo-fixation")).toBe(
        declarationsFor(".jspsych-go-nogo-stimulus")
      );
    });

    it("should give fixation and stimulus the same box height", () => {
      const height = "30vh";
      const timeline = createTimeline(jsPsych, {
        stimulus_container_height: height,
        num_blocks: 1,
        num_trials: 4,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blockProcedure = (timeline.timeline[0] as any[])[0];
      const [fixation, , isi] = blockProcedure.timeline;
      const stimulus = blockProcedure.timeline_variables[0].stimulus;

      expect(fixation.stimulus).toContain(`min-height: ${height}`);
      expect(isi.stimulus).toContain(`min-height: ${height}`);
      expect(stimulus).toContain(`min-height: ${height}`);
    });
  });

  describe("createInstructions", () => {
    it("should create instructions trial", () => {
      const instructions = createInstructions(["hi", "<b>test<b>"], {
        backButton: "back",
        nextButton: "next",
      });

      expect(instructions).toHaveProperty("type");
      expect(instructions).toHaveProperty("pages");
      // example of testing via functionality-- does it generate the correct number of pages with the right content?
      expect(instructions.pages).toEqual([
        '<div class="jspsych-go-nogo-instructions" ><p>hi</p></div>',
        '<div class="jspsych-go-nogo-instructions" ><p><b>test<b></p></div>',
      ]);
    });
  });

  describe("package metadata", () => {
    it("should report the version from package.json", () => {
      // A hardcoded VERSION drifts from the manifest and is written into every
      // row as task_version.
      const pkg = JSON.parse(readFileSync(join(__dirname, "..", "package.json"), "utf8"));

      expect(utils.constants.VERSION).toBe(pkg.version);
      expect(utils.constants.TASK_NAME).toBe("go-nogo");
    });

    it("should stamp task and task_version on every trial", () => {
      const { timeline } = createTimeline(jsPsych, {
        show_instructions: true,
        show_practice: true,
        show_debrief: true,
        num_blocks: 2,
        num_trials: 6,
      });

      const trials: any[] = [];
      const walk = (node: any) => {
        if (Array.isArray(node)) node.forEach(walk);
        else if (node && typeof node === "object") {
          if (node.type) trials.push(node);
          if (node.timeline) walk(node.timeline);
        }
      };
      walk(timeline);

      expect(trials.length).toBeGreaterThan(5);
      expect(trials.filter((t) => t.data?.task !== "go-nogo")).toEqual([]);
      expect(trials.filter((t) => t.data?.task_version !== utils.constants.VERSION)).toEqual([]);
    });
  });

  describe("text configuration", () => {
    it("should render the debrief from task_complete and result_summary", () => {
      const debrief: any = timelineUnits.createDebrief(jsPsych, {
        ...utils.trial_text,
        task_complete: "ALL DONE",
        result_summary: () => "<p>SUMMARY</p>",
      });

      const html = debrief.stimulus();
      expect(html).toContain("ALL DONE");
      expect(html).toContain("SUMMARY");
    });

    it("should let a text override reach the screen", () => {
      const timeline = createTimeline(jsPsych, {
        text: { finishButton: "Fertig" },
        show_debrief: true,
        show_instructions: false,
        show_practice: false,
        num_blocks: 1,
        num_trials: 4,
      });

      const debrief = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(debrief.choices).toEqual(["Fertig"]);
    });
  });

  describe("public API surface", () => {
    it("should build instruction pages with no arguments", () => {
      // Both the README and docs call this with no arguments; it used to throw
      // because `instructions` had no default.
      const instructions = createInstructions() as any;

      expect(instructions.pages).toHaveLength(utils.trial_text.instructions_pages.length);
      expect(instructions.pages[0]).toContain(utils.trial_text.instructions_pages[0]);
    });

    it("should default the button labels from the text config", () => {
      const instructions = createInstructions(["a"]) as any;

      expect(instructions.button_label_previous).toBe(utils.trial_text.backButton);
      expect(instructions.button_label_next).toBe(utils.trial_text.nextButton);
    });

    it("should still accept explicit pages and texts", () => {
      const instructions = createInstructions(["only"], { nextButton: "Next" }) as any;

      expect(instructions.pages).toHaveLength(1);
      expect(instructions.button_label_next).toBe("Next");
    });

    it("should expose the stimulus shapes named in the changelog", () => {
      // CHANGELOG 0.2.0 tells users migrating the default change to set
      // `go_stimulus: square`, which was impossible while these were unreachable.
      for (const shape of ["circle", "octagon", "square"] as const) {
        expect(typeof utils.shapes[shape]).toBe("string");
        expect(utils.shapes[shape]).toContain("aria-label");
      }
    });

    it("should accept a shape from utils.shapes as a stimulus", () => {
      const timeline = createTimeline(jsPsych, {
        go_stimulus: utils.shapes.square,
        num_blocks: 1,
        num_trials: 4,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const vars = (timeline.timeline[0] as any[])[0].timeline_variables;
      expect(vars.find((v: any) => v.is_go_trial).stimulus).toContain('aria-label="square"');
    });

    it("should not also expose the shapes at the top level", async () => {
      const mod: any = await import(".");

      // One name per thing, as with utils.trial_text.
      for (const shape of ["circle", "octagon", "square"]) {
        expect(mod[shape]).toBeUndefined();
      }
    });
  });

  describe("timelineUnits", () => {
    it("should create functional practice trials", () => {
      const practice = timelineUnits.createPractice();

      expect(Array.isArray(practice)).toBe(true);
      expect(practice.length).toBe(3); // go, nogo, completion

      // Test that each practice trial has timeline with stimulus
      practice.forEach((trial) => {
        expect(trial).toHaveProperty("timeline");
        expect(Array.isArray(trial.timeline)).toBe(true);
        trial.timeline.forEach((subTrial) => {
          expect(subTrial).toHaveProperty("stimulus");
          expect(typeof subTrial.stimulus).toBe("string");
        });
      });
    });

    it("should create functional debrief trial", () => {
      const debrief = timelineUnits.createDebrief(jsPsych);

      expect(debrief).toHaveProperty("type");
      expect(debrief).toHaveProperty("stimulus");
      expect(debrief).toHaveProperty("choices");
      expect(typeof debrief.stimulus).toBe("function");
    });

    it("should create functional go-nogo trial", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, "Click", 1000);

      expect(trial).toHaveProperty("type");
      expect(trial).toHaveProperty("choices");
      expect(trial.choices).toContain("Click");
      expect(trial.trial_duration).toBe(1000);
    });

    it("should create block break trial", () => {
      const blockBreak = timelineUnits.createBlockBreak(1, 3);

      expect(blockBreak).toHaveProperty("type");
      expect(blockBreak).toHaveProperty("stimulus");
      expect(blockBreak).toHaveProperty("choices");
    });
  });

  describe("fixation and ISI response blocking", () => {
    // Render a trial's stimulus into the display element the way the plugin
    // does, then run its on_load, and report whether the button ends up
    // disabled. This is what a participant can actually click.
    const buttonStateAfterLoad = (trial: any) => {
      const display = document.createElement("div");
      document.body.appendChild(display);
      jsPsych.getDisplayElement = () => display;
      display.innerHTML =
        `<div id="jspsych-html-button-response-btngroup">` +
        trial.choices.map(() => `<button class="jspsych-btn">Click</button>`).join("") +
        `</div>`;
      trial.on_load?.();
      return Array.from(display.querySelectorAll("button")).map((b: any) => b.disabled);
    };

    it("should disable the fixation button as soon as it renders", () => {
      const fixation = timelineUnits.createFixation(jsPsych, 500, "Click", true, "25vh", "3em");

      expect(buttonStateAfterLoad(fixation)).toEqual([true]);
    });

    it("should disable the ISI button as soon as it renders", () => {
      const isiBlank = timelineUnits.createISIBlank(jsPsych, 300, "Click", true, "25vh");

      expect(buttonStateAfterLoad(isiBlank)).toEqual([true]);
    });

    it("should disable the button even when the duration is 0", () => {
      // isi_duration defaults to 0; a duration-derived guard would be a no-op here.
      const isiBlank = timelineUnits.createISIBlank(jsPsych, 0, "Click", true, "25vh");

      expect(buttonStateAfterLoad(isiBlank)).toEqual([true]);
    });

    it("should leave the scored stimulus trial responsive", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, "Click", 500);

      expect(trial).not.toHaveProperty("on_load");
    });

    it("should disable fixation and ISI buttons within a built timeline", () => {
      const timeline = createTimeline(jsPsych, {
        fixation_duration: 750,
        isi_duration: 250,
        num_blocks: 1,
        num_trials: 8,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blockProcedure = (timeline.timeline[0] as any[])[0];
      // Trial sequence: [fixation, stimulus, isi_blank]
      expect(buttonStateAfterLoad(blockProcedure.timeline[0])).toEqual([true]);
      expect(buttonStateAfterLoad(blockProcedure.timeline[2])).toEqual([true]);
      expect(blockProcedure.timeline[1].on_load).toBeUndefined();
    });

    it("should not render a button at all when show_button_during_fixation is false", () => {
      const timeline = createTimeline(jsPsych, {
        show_button_during_fixation: false,
        num_blocks: 1,
        num_trials: 8,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blockProcedure = (timeline.timeline[0] as any[])[0];
      expect(blockProcedure.timeline[0].choices).toEqual([]);
      expect(blockProcedure.timeline[2].choices).toEqual([]);
    });
  });

  describe("trial order", () => {
    it("should interleave go and nogo trials rather than blocking them", () => {
      const vars = utils.createTimelineVariables(jsPsych, 1, 40, 0.5, ["G"], ["N"]);
      const order = vars.map((v: any) => (v.is_go_trial ? "G" : "N")).join("");

      expect(vars.length).toBe(40);
      // A discarded shuffle produced "GGGG...NNNN". Any real shuffle of 20/20
      // alternates far more than the 1 run-boundary a sorted sequence has.
      const runBoundaries = order.split("").filter((c, i) => i > 0 && c !== order[i - 1]).length;
      expect(runBoundaries).toBeGreaterThan(1);
      expect(order).not.toBe("G".repeat(20) + "N".repeat(20));
    });

    it("should produce a different order on repeated calls", () => {
      const order = () =>
        utils
          .createTimelineVariables(jsPsych, 1, 40, 0.5, ["G"], ["N"])
          .map((v: any) => (v.is_go_trial ? "G" : "N"))
          .join("");

      // 40C20 makes a collision across 5 draws effectively impossible.
      const orders = new Set([order(), order(), order(), order(), order()]);
      expect(orders.size).toBeGreaterThan(1);
    });

    it("should preserve the exact go/nogo counts through the shuffle", () => {
      const vars = utils.createTimelineVariables(jsPsych, 1, 40, 0.75, ["G"], ["N"]);

      expect(vars.filter((v: any) => v.is_go_trial).length).toBe(30);
      expect(vars.filter((v: any) => !v.is_go_trial).length).toBe(10);
    });

    it("should not re-randomize order at the procedure level", () => {
      const timeline = createTimeline(jsPsych, {
        num_blocks: 1,
        num_trials: 10,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      // Ordering has a single source, so recorded timeline_variables order
      // matches presentation order.
      expect((timeline.timeline[0] as any[])[0].randomize_order).toBe(false);
    });
  });

  describe("debrief calculation", () => {
    it("should calculate accuracy and RT correctly", () => {
      // Manually add data to the internal data store
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        correct: true,
        is_go_trial: true,
        response: 0,
        rt: 400,
      });
      dataCollection.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        correct: false,
        is_go_trial: true,
        response: null,
        rt: null,
      });
      dataCollection.push({
        task: "go-nogo",
        phase: "test",
        part: "nogo",
        correct: true,
        is_go_trial: false,
        response: null,
        rt: null,
      });

      const timeline = createTimeline(jsPsych, { show_debrief: true });
      const debriefTrial = timeline.timeline[timeline.timeline.length - 1] as any;
      const stimulus = debriefTrial.stimulus();

      expect(stimulus).toContain("50.0%"); // 1 correct go out of 2 go trials
      expect(stimulus).toContain("100.0%"); // 1 correct nogo out of 1 nogo trial
      expect(stimulus).toContain("Commission Errors"); // Commission errors shown
    });
  });

  describe("calculateScores", () => {
    // 4 go trials (3 correct, rt 300/320/340; 1 omission), 2 nogo trials
    // (1 correct withhold, 1 commission). 6 scorable trials, 4 correct.
    const addScorableTrials = (data: any) => {
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 300,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 320,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 340,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: false,
        rt: null,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "nogo",
        is_go_trial: false,
        correct: true,
        rt: null,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "nogo",
        is_go_trial: false,
        correct: false,
        rt: 200,
      });
    };

    // The non-response rows a real run interleaves with the scorable ones.
    const addNonResponseTrials = (data: any) => {
      for (let i = 0; i < 6; i++) {
        data.push({ task: "go-nogo", phase: "test", part: "fixation" });
        data.push({ task: "go-nogo", phase: "test", part: "isi-blank" });
      }
      data.push({ task: "go-nogo", phase: "test", part: "block-break" });
    };

    it("should score a hand-worked dataset", () => {
      const data = jsPsych.data.get();
      addScorableTrials(data);

      expect(utils.scoring.calculateScores(data)).toEqual({
        totalTrials: 6,
        goTrials: 4,
        nogoTrials: 2,
        correctGoTrials: 3,
        correctNogoTrials: 1,
        goAccuracy: 0.75,
        nogoAccuracy: 0.5,
        overallAccuracy: 4 / 6,
        commissionErrors: 1,
        omissionErrors: 1,
        meanGoRT: 320,
      });
    });

    it("should not count fixation, isi-blank or block-break rows as trials", () => {
      const data = jsPsych.data.get();
      addScorableTrials(data);
      addNonResponseTrials(data);

      const scores = utils.scoring.calculateScores(data);

      // Regression: DataCollection.filter ignores a predicate and keeps every
      // row, which inflated totalTrials to 19 and deflated overallAccuracy to
      // 4/19. Only the 6 go/nogo rows are scorable.
      expect(scores.totalTrials).toBe(6);
      expect(scores.overallAccuracy).toBe(4 / 6);
    });

    it("should exclude practice-phase trials from scoring", () => {
      const data = jsPsych.data.get();
      addScorableTrials(data);
      data.push({
        task: "go-nogo",
        phase: "practice",
        part: "go",
        is_go_trial: true,
        correct: false,
        rt: null,
      });
      data.push({
        task: "go-nogo",
        phase: "practice",
        part: "nogo",
        is_go_trial: false,
        correct: false,
        rt: 100,
      });

      const scores = utils.scoring.calculateScores(data);

      expect(scores.totalTrials).toBe(6);
      expect(scores.omissionErrors).toBe(1);
      expect(scores.commissionErrors).toBe(1);
    });

    it("should exclude trials belonging to another task", () => {
      const data = jsPsych.data.get();
      addScorableTrials(data);
      data.push({
        task: "flanker",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: false,
        rt: null,
      });

      expect(utils.scoring.calculateScores(data).totalTrials).toBe(6);
    });

    it("should include an rt of 0 in meanGoRT", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 0,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 400,
      });

      // A `rt > 0` guard dropped the 0 and reported 400, biasing the mean upward.
      expect(utils.scoring.calculateScores(data).meanGoRT).toBe(200);
    });

    it("should exclude go trials with no response from meanGoRT", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 300,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: false,
        rt: null,
      });

      expect(utils.scoring.calculateScores(data).meanGoRT).toBe(300);
    });

    it("should report meanGoRT of 0 when no go trial was answered correctly", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: false,
        rt: null,
      });
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "nogo",
        is_go_trial: false,
        correct: true,
        rt: null,
      });

      // Documented caveat: 0 means "no valid RT", not a measured mean.
      // correctGoTrials is what distinguishes the two.
      const scores = utils.scoring.calculateScores(data);
      expect(scores.meanGoRT).toBe(0);
      expect(scores.correctGoTrials).toBe(0);
    });

    it("should report accuracy of 0 for a trial type that was never presented", () => {
      const data = jsPsych.data.get();
      data.push({
        task: "go-nogo",
        phase: "test",
        part: "go",
        is_go_trial: true,
        correct: true,
        rt: 300,
      });

      // Pure-go block: nogoAccuracy is 0 because nothing was presented, not
      // because the participant failed. nogoTrials is what tells them apart.
      const scores = utils.scoring.calculateScores(data);
      expect(scores.nogoAccuracy).toBe(0);
      expect(scores.nogoTrials).toBe(0);
      expect(scores.goAccuracy).toBe(1);
    });

    it("should report zeros when there are no scorable trials", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(0);
      expect(scores.overallAccuracy).toBe(0);
      expect(scores.meanGoRT).toBe(0);
    });

    it("should carry scores through getSummary with task name and version", () => {
      const data = jsPsych.data.get();
      addScorableTrials(data);
      addNonResponseTrials(data);

      const summary = utils.scoring.getSummary(data);

      expect(summary.totalTrials).toBe(6);
      expect(summary.overallAccuracy).toBe(4 / 6);
      expect(summary.taskName).toBe(utils.constants.TASK_NAME);
      expect(summary.version).toBe(utils.constants.VERSION);
    });
  });

  describe("utils", () => {
    it("should provide createStimulusHTML function", () => {
      expect(typeof utils.createStimulusHTML).toBe("function");
      const html = utils.createStimulusHTML("TEST", true);
      expect(html).toContain(`<div id="jspsych-go-nogo-go-stimulus-container"`);
      expect(html).toContain(`class="jspsych-go-nogo-stimulus"`);
      expect(html).toContain(`TEST</div>`);
    });
  });

  describe("timing and display parameters", () => {
    it("should show button during fixation when show_button_during_fixation is true", () => {
      const fixationWithButton = timelineUnits.createFixation(
        jsPsych,
        500,
        "Click",
        true,
        "25vh",
        "3em"
      );
      const fixationWithoutButton = timelineUnits.createFixation(
        jsPsych,
        500,
        "Click",
        false,
        "25vh",
        "3em"
      );

      expect(fixationWithButton.choices).toEqual(["Click"]);
      expect(fixationWithoutButton.choices).toEqual([]);
    });

    it("should apply stimulus_container_height to timeline_variables stimulus HTML", () => {
      const containerHeight = "35vh";
      const timeline = createTimeline(jsPsych, {
        stimulus_container_height: containerHeight,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const trialVar = blockProcedure.timeline_variables[0];

      expect(trialVar.stimulus).toContain(`min-height: ${containerHeight}`);
    });

    it("should apply fixation_size to fixation stimulus HTML", () => {
      const fixation = timelineUnits.createFixation(jsPsych, 500, "Click", true, "25vh", "5em");

      expect(fixation.stimulus).toContain("font-size: 5em");
    });

    it("should apply stimulus_duration to stimulus trial", () => {
      const timeline = createTimeline(jsPsych, {
        stimulus_duration: 200,
        trial_timeout: 1000,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const stimulusTrial = blockProcedure.timeline[1];

      expect(stimulusTrial.stimulus_duration).toBe(200);
      expect(stimulusTrial.trial_duration).toBe(1000);
    });

    it("should set stimulus_duration to null when not specified", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, "Click", 500);

      expect(trial.stimulus_duration).toBeNull();
    });

    it("should apply stimulus_container_height to createStimulusHTML", () => {
      const containerHeight = "25vh";
      const html = utils.createStimulusHTML("TEST", true, containerHeight);

      expect(html).toContain(`min-height: ${containerHeight}`);
    });

    it("should create fixation with correct duration and button text", () => {
      const fixation = timelineUnits.createFixation(jsPsych, 1000, "Press", true, "25vh", "4em");

      expect(fixation.trial_duration).toBe(1000);
      expect(fixation.choices).toEqual(["Press"]);
      expect(fixation.data.part).toBe("fixation");
      expect(fixation.response_ends_trial).toBe(false);
    });

    it("should create ISI blank with correct duration", () => {
      const isiBlank = timelineUnits.createISIBlank(jsPsych, 500, "Click", true, "25vh");

      expect(isiBlank.trial_duration).toBe(500);
      expect(isiBlank.data.part).toBe("isi-blank");
      expect(isiBlank.response_ends_trial).toBe(false);
    });

    it("should apply fixation_duration to fixation trial in timeline", () => {
      const timeline = createTimeline(jsPsych, {
        fixation_duration: 750,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const fixationTrial = blockProcedure.timeline[0];

      expect(fixationTrial.trial_duration).toBe(750);
    });

    it("should apply isi_duration to ISI blank trial in timeline", () => {
      const timeline = createTimeline(jsPsych, {
        isi_duration: 300,
        num_blocks: 1,
        num_trials: 5,
        show_instructions: false,
        show_practice: false,
        show_debrief: false,
      });

      const blocksArray = timeline.timeline[0] as any[];
      const blockProcedure = blocksArray[0];
      const isiBlankTrial = blockProcedure.timeline[2];

      expect(isiBlankTrial.trial_duration).toBe(300);
    });

    it("should set stimulus_duration on trial when provided", () => {
      const trial = timelineUnits.createGoNoGo(jsPsych, "Click", 1000, 200);

      expect(trial.stimulus_duration).toBe(200);
    });
  });
});
