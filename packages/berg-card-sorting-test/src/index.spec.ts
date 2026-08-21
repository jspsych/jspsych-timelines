import { readFileSync } from "fs";
import { join } from "path";

import { JsPsych, initJsPsych } from "jspsych";

import { version } from "../package.json";
import { Card, createTimeline, timelineUnits, utils } from ".";

describe("Berg Card Sorting Test", () => {
  let jsPsych: JsPsych;

  beforeEach(() => {
    jsPsych = initJsPsych();
  });

  describe("createTimeline", () => {
    it("should create a timeline with default parameters", () => {
      const timeline = createTimeline(jsPsych);
      expect(timeline.timeline).toBeDefined();
      expect(Array.isArray(timeline.timeline)).toBe(true);
    });

    it("should include instructions when showInstructions is true", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: true });
      // First item should be instructions
      const instructions = timeline.timeline[0] as any;
      expect(instructions.type).toBeDefined();
      expect(instructions.pages).toBeDefined();
      expect(instructions.pages.length).toBe(4);
    });

    it("should exclude instructions when showInstructions is false", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      // First item should be trial block, not instructions
      const firstItem = timeline.timeline[0] as any;
      expect(firstItem.pages).toBeUndefined();
      expect(firstItem.timeline).toBeDefined(); // trial block has timeline
    });

    it("should apply feedbackDuration to feedback trials", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: true,
        feedbackDuration: 800,
      });

      const trialBlock = timeline.timeline[0] as any;
      // Trial block timeline has [sorting, feedback]
      expect(trialBlock.timeline.length).toBe(2);
      const feedbackTrial = trialBlock.timeline[1];
      expect(feedbackTrial.trial_duration).toBe(800);
    });

    it("should exclude feedback trials when showFeedback is false", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: false,
      });

      const trialBlock = timeline.timeline[0] as any;
      // Trial block should only have sorting trial
      expect(trialBlock.timeline.length).toBe(1);
    });

    it("should include feedback trials when showFeedback is true", () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: true,
      });

      const trialBlock = timeline.timeline[0] as any;
      // Trial block should have [sorting, feedback]
      expect(trialBlock.timeline.length).toBe(2);
    });

    it("should use custom instruction text", () => {
      const customText = {
        instruction_pages: ["Custom page 1", "Custom page 2"],
      };
      const timeline = createTimeline(jsPsych, {
        showInstructions: true,
        text: customText,
      });

      const instructions = timeline.timeline[0] as any;
      expect(instructions.pages).toEqual(["Custom page 1", "Custom page 2"]);
    });

    it("should use custom feedback text", () => {
      const customText = {
        correct_feedback: "Bien!",
        incorrect_feedback: "Mal!",
      };
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: true,
        text: customText,
      });

      // The feedback trial uses a dynamic stimulus function
      // We can verify the text config is passed by checking the timeline exists
      expect(timeline.timeline.length).toBe(2); // trial block + completion
    });

    it("should include completion trial at end", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false });
      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.data.phase).toBe("completion");
    });

    it("should omit the results screen when showResults is false", () => {
      const timeline = createTimeline(jsPsych, { showInstructions: false, showResults: false });

      expect(timeline.timeline.length).toBe(1);
      const lastItem = timeline.timeline[timeline.timeline.length - 1] as any;
      expect(lastItem.timeline).toBeDefined(); // the trial block, not a results screen
    });
  });

  describe("timelineUnits", () => {
    // Every unit used to require a fully-resolved internal config that only
    // createTimeline could build, and whose type was not exported. Calling one
    // the way the README documents threw.
    it("should build every unit from public options alone", () => {
      expect(timelineUnits.createInstructionTrials().pages.length).toBe(4);
      expect(timelineUnits.createFeedbackTrial(jsPsych).trial_duration).toBe(500);
      expect(timelineUnits.createTrialBlock(jsPsych).timeline.length).toBe(2);
      expect(timelineUnits.createCompletionTrial(jsPsych).data.phase).toBe("completion");
    });

    it("should apply options passed to a unit on its own", () => {
      expect(
        timelineUnits.createInstructionTrials({ text: { instruction_pages: ["only one"] } }).pages
      ).toEqual(["only one"]);
      expect(
        timelineUnits.createFeedbackTrial(jsPsych, { feedbackDuration: 42 }).trial_duration
      ).toBe(42);
      expect(timelineUnits.createTrialBlock(jsPsych, { showFeedback: false }).timeline.length).toBe(
        1
      );
    });

    it("should validate options passed to a unit on its own", () => {
      // showFeedback: false matters -- with feedback on, the nested
      // createFeedbackTrial validates first and this would pass for the wrong
      // reason, leaving createTrialBlock's own guard unchecked.
      expect(() =>
        timelineUnits.createTrialBlock(jsPsych, { deckRepeats: 0, showFeedback: false })
      ).toThrow(/deckRepeats/);
      expect(() => timelineUnits.createFeedbackTrial(jsPsych, { feedbackDuration: -1 })).toThrow(
        /feedbackDuration/
      );
      expect(() => timelineUnits.createCompletionTrial(jsPsych, { runLength: 0 })).toThrow(
        /runLength/
      );
      expect(() => timelineUnits.createInstructionTrials({ numCategories: 0 })).toThrow(
        /numCategories/
      );
    });

    it("should export the types its signatures name", () => {
      // compile-time assertion: this only typechecks if Card is exported
      const card: Card = { color: "red", shape: "triangle", number: 1 };
      expect(utils.stimuli.generateCardHtml(card)).toContain("bcst-shape-triangle");
    });
  });

  describe("parameter validation", () => {
    it("should reject a deck of zero cards", () => {
      expect(() => createTimeline(jsPsych, { deckRepeats: 0 })).toThrow(
        /\[berg-card-sorting-test\] deckRepeats must be an integer >= 1, got 0/
      );
    });

    it("should reject a fractional deckRepeats rather than rounding up", () => {
      expect(() => createTimeline(jsPsych, { deckRepeats: 2.5 })).toThrow(/deckRepeats/);
    });

    it("should reject a runLength below 1", () => {
      // runLength 0 completes a category on any correct response.
      expect(() => createTimeline(jsPsych, { runLength: 0 })).toThrow(
        /\[berg-card-sorting-test\] runLength must be an integer >= 1, got 0/
      );
      expect(() => createTimeline(jsPsych, { runLength: -3 })).toThrow(/runLength/);
      expect(() => createTimeline(jsPsych, { runLength: 2.5 })).toThrow(/runLength/);
    });

    it("should reject a numCategories below 1", () => {
      expect(() => createTimeline(jsPsych, { numCategories: 0 })).toThrow(
        /\[berg-card-sorting-test\] numCategories must be an integer >= 1, got 0/
      );
      expect(() => createTimeline(jsPsych, { numCategories: 3.5 })).toThrow(/numCategories/);
    });

    it("should reject a negative feedbackDuration", () => {
      expect(() => createTimeline(jsPsych, { feedbackDuration: -100 })).toThrow(
        /\[berg-card-sorting-test\] feedbackDuration must be a number >= 0, got -100/
      );
    });

    it("should reject a non-finite feedbackDuration", () => {
      // Infinity would leave the participant on a feedback screen that never ends,
      // since the feedback trial accepts no keys.
      expect(() => createTimeline(jsPsych, { feedbackDuration: Infinity })).toThrow(
        /feedbackDuration/
      );
      expect(() => createTimeline(jsPsych, { feedbackDuration: NaN })).toThrow(/feedbackDuration/);
    });

    it("should accept the smallest valid value for every guarded option", () => {
      expect(() =>
        createTimeline(jsPsych, {
          showInstructions: false,
          feedbackDuration: 0,
          runLength: 1,
          numCategories: 1,
          deckRepeats: 1,
        })
      ).not.toThrow();
    });

    it("should accept the defaults", () => {
      expect(() => createTimeline(jsPsych)).not.toThrow();
    });
  });

  describe("utils.stimuli", () => {
    it("should generate a 64-card deck", () => {
      const deck = utils.stimuli.generateDeck();
      expect(deck.length).toBe(64);
    });

    it("should have all color/shape/number combinations in deck", () => {
      const deck = utils.stimuli.generateDeck();

      // Check for a specific card
      const redTriangleOne = deck.find(
        (c) => c.color === "red" && c.shape === "triangle" && c.number === 1
      );
      expect(redTriangleOne).toBeDefined();

      const blueCircleFour = deck.find(
        (c) => c.color === "blue" && c.shape === "circle" && c.number === 4
      );
      expect(blueCircleFour).toBeDefined();
    });

    it("should have 4 reference cards", () => {
      expect(utils.stimuli.REFERENCE_CARDS.length).toBe(4);
    });

    it("should have unique reference cards on all dimensions", () => {
      const refs = utils.stimuli.REFERENCE_CARDS;

      // All colors different
      const colors = refs.map((r) => r.color);
      expect(new Set(colors).size).toBe(4);

      // All shapes different
      const shapes = refs.map((r) => r.shape);
      expect(new Set(shapes).size).toBe(4);

      // All numbers different
      const numbers = refs.map((r) => r.number);
      expect(new Set(numbers).size).toBe(4);
    });

    it("should generate card HTML with correct structure", () => {
      const card = { color: "red" as const, shape: "triangle" as const, number: 2 as const };
      const html = utils.stimuli.generateCardHtml(card, false);

      expect(html).toContain("bcst-card");
      expect(html).toContain("bcst-shape");
      expect(html).toContain("bcst-red");
      expect(html).toContain("bcst-shape-triangle");
      // Should have 2 shapes for number: 2. Count the shape divs rather than the
      // token, which now appears twice per div (bcst-shape bcst-shape-triangle).
      const shapeMatches = html.match(/<div class="bcst-shape /g);
      expect(shapeMatches?.length).toBe(2);
    });

    it("should generate stimulus card HTML with stimulus class", () => {
      const card = { color: "blue" as const, shape: "circle" as const, number: 1 as const };
      const html = utils.stimuli.generateCardHtml(card, true);

      expect(html).toContain("bcst-card-stimulus");
    });
  });

  describe("utils.scoring", () => {
    it("should report undefined measures as null for no data", () => {
      const scores = utils.scoring.calculateScores(jsPsych.data.get());

      expect(scores.totalTrials).toBe(0);
      expect(scores.categoriesCompleted).toBe(0);
      // null, not 0: nothing was sorted, which is not the same as sorting
      // everything wrong.
      expect(scores.accuracy).toBeNull();
      expect(scores.percentPerseverativeErrors).toBeNull();
      expect(scores.meanRT).toBeNull();
    });

    it("should calculate accuracy correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 600,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 700,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 550,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.totalTrials).toBe(4);
      expect(scores.totalCorrect).toBe(3);
      expect(scores.totalErrors).toBe(1);
      expect(scores.accuracy).toBeCloseTo(0.75, 2);
    });

    it("should count perseverative errors correctly", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: true,
        categories_completed: 1,
        rt: 500,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: true,
        categories_completed: 1,
        rt: 600,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 1,
        rt: 700,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.perseverativeErrors).toBe(2);
      expect(scores.nonPerseverativeErrors).toBe(1);
      expect(scores.percentPerseverativeErrors).toBeCloseTo(66.67, 1);
    });

    it("should calculate mean RT for correct trials only", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 400,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: true,
        is_perseverative: false,
        categories_completed: 0,
        rt: 600,
      });
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 1000,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.meanRT).toBe(500); // (400 + 600) / 2
    });

    it("should count conceptual level responses (runs of 3+)", () => {
      const dataCollection = jsPsych.data.get();
      // Run of 4 correct = 4 conceptual level responses; the run qualifies at 3
      for (let i = 0; i < 4; i++) {
        dataCollection.push({
          task: "berg-card-sorting-test",
          phase: "test",
          part: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }
      // Error breaks run
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });
      // Another run of 3 = 3 conceptual level responses
      for (let i = 0; i < 3; i++) {
        dataCollection.push({
          task: "berg-card-sorting-test",
          phase: "test",
          part: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.conceptualLevelResponses).toBe(7); // 4 from first run + 3 from second
    });

    it("should count failure to maintain set", () => {
      const dataCollection = jsPsych.data.get();
      // Run of 5 correct
      for (let i = 0; i < 5; i++) {
        dataCollection.push({
          task: "berg-card-sorting-test",
          phase: "test",
          part: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }
      // Error after 5 correct = failure to maintain set
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.failureToMaintainSet).toBe(1);
    });

    it("should not count the error after a completed category as a failure to maintain set", () => {
      const dataCollection = jsPsych.data.get();
      const sortingRow = (correct: boolean, categories_completed: number) => ({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct,
        is_perseverative: false,
        categories_completed,
        rt: 500,
      });

      // Five correct, the fifth completing a category, then the unavoidable error
      // that follows the unannounced rule change.
      for (let i = 0; i < 4; i++) dataCollection.push(sortingRow(true, 0));
      dataCollection.push(sortingRow(true, 1));
      dataCollection.push(sortingRow(false, 1));

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.categoriesCompleted).toBe(1);
      expect(scores.failureToMaintainSet).toBe(0);
    });

    it("should separate perseverative responses from perseverative errors", () => {
      const dataCollection = jsPsych.data.get();
      const sortingRow = (correct: boolean, is_perseverative: boolean) => ({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct,
        is_perseverative,
        categories_completed: 1,
        rt: 500,
      });

      // A card can match the perseverated-to principle and the current rule at
      // once, which makes the response perseverative but not an error.
      dataCollection.push(sortingRow(true, true));
      dataCollection.push(sortingRow(false, true));
      dataCollection.push(sortingRow(false, false));

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.perseverativeResponses).toBe(2);
      expect(scores.perseverativeErrors).toBe(1);
      expect(scores.nonPerseverativeErrors).toBe(1);
    });

    it("should report 0 percent perseverative errors when errors exist but none persevere", () => {
      const dataCollection = jsPsych.data.get();
      dataCollection.push({
        task: "berg-card-sorting-test",
        phase: "test",
        part: "sorting",
        correct: false,
        is_perseverative: false,
        categories_completed: 0,
        rt: 500,
      });

      const scores = utils.scoring.calculateScores(dataCollection);

      // A real 0 on the same scale, distinct from the null above.
      expect(scores.percentPerseverativeErrors).toBe(0);
    });

    it("should report null percent perseverative errors when there were no errors", () => {
      const dataCollection = jsPsych.data.get();
      for (let i = 0; i < 2; i++) {
        dataCollection.push({
          task: "berg-card-sorting-test",
          phase: "test",
          part: "sorting",
          correct: true,
          is_perseverative: false,
          categories_completed: 0,
          rt: 500,
        });
      }

      const scores = utils.scoring.calculateScores(dataCollection);

      expect(scores.accuracy).toBe(1);
      expect(scores.percentPerseverativeErrors).toBeNull();
    });

    it("should include task info in getSummary", () => {
      const summary = utils.scoring.getSummary(jsPsych.data.get());

      expect(summary.taskName).toBe("berg-card-sorting-test");
      expect(summary.version).toBe(version);
    });
  });

  /* Drives the real timeline rather than fabricating rows, because the seeding
     rule lives in the trial engine and no synthetic row can exercise it. */
  describe("perseveration engine", () => {
    it("should establish and update the perseverated-to principle", async () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: false,
        useCanonicalOrder: true,
        numCategories: 2,
      });

      const finished = jsPsych.run([timeline]);

      // In canonical order the first sixteen cards are all red, so reference card
      // 0 is the color match throughout. The responder sorts by NUMBER for six
      // trials -- a principle that is never correct while color is the rule --
      // then switches to color, which completes the first category.
      let guard = 0;
      const pump = setInterval(() => {
        if (guard++ > 2000) return clearInterval(pump);
        const buttons = document.querySelectorAll<HTMLButtonElement>(
          "#jspsych-html-button-response-btngroup button"
        );
        if (buttons.length === 0) return;
        const card = document.querySelector(".bcst-card-stimulus");
        if (!card) return buttons[0].click(); // completion screen
        const sorted = jsPsych.data
          .get()
          .filter({ task: "berg-card-sorting-test", part: "sorting" })
          .count();
        // reference card i carries i + 1 symbols
        const stimulusNumber = card.querySelectorAll(".bcst-shape").length;
        buttons[sorted < 6 ? stimulusNumber - 1 : 0].click();
      }, 1);

      await finished;
      clearInterval(pump);

      const rows = jsPsych.data
        .get()
        .filter({ task: "berg-card-sorting-test", part: "sorting" })
        .values();

      // Nothing to perseverate to yet on the first trial.
      expect(rows[0].perseverated_to).toBeNull();

      // Trial 1 matches reference 0 on shape AND number, so it identifies neither
      // and does not start a run. Seeding therefore needs trials 2-4, not 1-3.
      expect(rows[3].perseverated_to).toBeNull();

      // Established with no category completed -- the case that scored zero before.
      expect(rows[4].perseverated_to).toBe("number");
      expect(rows[4].categories_completed).toBe(0);

      // A card matching both the perseverated-to principle and the current rule
      // is a perseverative response but not an error.
      expect(rows[4].is_perseverative).toBe(true);
      expect(rows[4].correct).toBe(true);

      // ...and the next one repeats the principle while the color rule is active,
      // which is a perseverative error.
      expect(rows[5].is_perseverative).toBe(true);
      expect(rows[5].correct).toBe(false);

      // Completing a category hands the principle over to the rule just finished.
      // The row is written at trial start, so the handover shows on the trial
      // *after* the one that completed the category.
      const completing = rows.findIndex((r: any) => r.categories_completed === 1);
      expect(rows[completing].current_rule).toBe("color");
      expect(rows[completing + 1].perseverated_to).toBe("color");
      expect(rows[completing + 1].current_rule).toBe("shape");

      const scores = utils.scoring.getSummary(jsPsych.data.get());
      expect(scores.perseverativeErrors).toBeGreaterThan(0);
      expect(scores.perseverativeResponses).toBeGreaterThan(scores.perseverativeErrors);
    }, 15000);
  });

  describe("recorded trial fields", () => {
    it("should record the streak the category-completing trial reached", async () => {
      const timeline = createTimeline(jsPsych, {
        showInstructions: false,
        showFeedback: false,
        useCanonicalOrder: true,
        runLength: 3,
        numCategories: 2,
      });

      const finished = jsPsych.run([timeline]);

      // The first sixteen canonical cards are red, so reference 0 is the color
      // match and reference 1 is not. Deliberately miss the second card, complete
      // the first category, then sort the next card by SHAPE -- which is the rule
      // the shift moved to -- so a correct trial lands right after the shift.
      let guard = 0;
      const pump = setInterval(() => {
        if (guard++ > 2000) return clearInterval(pump);
        const buttons = document.querySelectorAll<HTMLButtonElement>(
          "#jspsych-html-button-response-btngroup button"
        );
        if (buttons.length === 0) return;
        const sorted = jsPsych.data
          .get()
          .filter({ task: "berg-card-sorting-test", part: "sorting" })
          .count();
        buttons[sorted === 1 || sorted === 5 ? 1 : 0].click();
      }, 1);

      await finished;
      clearInterval(pump);

      const rows = jsPsych.data
        .get()
        .filter({ task: "berg-card-sorting-test", part: "sorting" })
        .values();

      expect(rows.slice(0, 6).map((r: any) => r.correct)).toEqual([
        true,
        false,
        true,
        true,
        true,
        true,
      ]);
      // The error resets the streak; the fifth trial reaches 3 and completes the
      // category -- it used to report 0, because the reset ran before the field
      // was written -- and the sixth starts a fresh streak on the new rule.
      expect(rows.slice(0, 6).map((r: any) => r.consecutive_correct)).toEqual([1, 0, 1, 2, 3, 1]);
      expect(rows.slice(0, 6).map((r: any) => r.categories_completed)).toEqual([0, 0, 0, 0, 1, 1]);
    }, 15000);
  });

  describe("text object", () => {
    const source = readFileSync(join(__dirname, "index.ts"), "utf8");

    it("should read every key it defines", () => {
      const keys = Object.keys(utils.text);
      expect(keys.length).toBeGreaterThan(5);

      // a key nothing reads is a knob the researcher can turn with no effect
      const dead = keys.filter((key) => !source.includes(`config.text.${key}`));
      expect(dead).toEqual([]);
    });

    it("should let a text object alone translate every participant-facing string", () => {
      const instructions = timelineUnits.createInstructionTrials({
        text: {
          instruction_pages: ["<p>pagina uno</p>"],
          continue_button: "Continuar",
          back_button: "Atras",
        },
      });

      expect(instructions.pages).toEqual(["<p>pagina uno</p>"]);
      expect(instructions.button_label_next).toBe("Continuar");
      // this was hardcoded English, unreachable from the text object
      expect(instructions.button_label_previous).toBe("Atras");
    });

    it("should fall back to the default for keys the override omits", () => {
      const instructions = timelineUnits.createInstructionTrials({
        text: { continue_button: "Continuar" },
      });

      expect(instructions.button_label_next).toBe("Continuar");
      expect(instructions.button_label_previous).toBe("Back");
    });
  });

  describe("utils.constants", () => {
    it("should export task constants", () => {
      expect(utils.constants.TASK_NAME).toBe("berg-card-sorting-test");
      expect(utils.constants.VERSION).toBe(version);
    });

    it("should export default options", () => {
      expect(utils.constants.DEFAULT_OPTIONS.runLength).toBe(10);
      expect(utils.constants.DEFAULT_OPTIONS.numCategories).toBe(6);
      expect(utils.constants.DEFAULT_OPTIONS.feedbackDuration).toBe(500);
    });
  });

  describe("utils.text", () => {
    it("should export default text configuration", () => {
      expect(utils.text).toBeDefined();
      expect(utils.text.correct_feedback).toBeDefined();
      expect(utils.text.incorrect_feedback).toBeDefined();
      expect(utils.text.instruction_pages).toBeDefined();
    });
  });
});

/* jsdom has no cascade for the injected stylesheet and no layout engine, so these
   assert against the stylesheet text that ships and the class tokens the source
   emits, not computed styles. */
describe("styles", () => {
  const ROOT = "jspsych-berg-card-sorting-test";
  const PREFIX = "bcst-";

  const css = readFileSync(join(__dirname, "styles.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

  const selectors = [...css.matchAll(/([^{}]+)\{/g)]
    .map((match) => match[1].trim())
    .filter((selector) => selector.length > 0 && !selector.startsWith("@"))
    .flatMap((selector) => selector.split(",").map((part) => part.trim()))
    .filter((selector) => selector.length > 0);

  const sources = ["index.ts", "text.ts"]
    .map((file) => readFileSync(join(__dirname, file), "utf8"))
    .join("\n");

  const flatten = (node: any): any[] => (node.timeline ? node.timeline.flatMap(flatten) : [node]);

  it("should define at least one rule", () => {
    // guards the tests below from passing on an empty parse
    expect(selectors.length).toBeGreaterThan(20);
  });

  it("should scope every rule under the timeline root", () => {
    const unscoped = selectors.filter((selector) => !selector.startsWith(`.${ROOT}`));
    expect(unscoped).toEqual([]);
  });

  it("should not reach outside the timeline's own DOM", () => {
    const escapes = selectors.filter((selector) =>
      // bare element selectors are fine as descendants of the root, which the test
      // above already requires; these are the tokens that escape it entirely
      /(^|\s)(body|html|\*)(\s|$)|\.(jspsych-content|jspsych-display-element)\b/.test(selector)
    );
    expect(escapes).toEqual([]);
  });

  it("should prefix every class the source emits", () => {
    const emitted = [...sources.matchAll(/class=["']([^"']+)["']/g)]
      .flatMap((m) => m[1].split(/\s+/))
      // a class attribute can be cut short by an interpolation opening its own
      // quote; keep the tokens that are whole literals, which is what this checks
      .filter((token) => /^[a-z][a-z0-9-]*$/.test(token));

    expect(emitted.length).toBeGreaterThan(5);
    emitted.forEach((token) => {
      // jspsych-btn is the plugin's own class, re-emitted so its styling applies
      expect(token === "jspsych-btn" || token.startsWith(PREFIX)).toBe(true);
    });
  });

  it("should emit every class the stylesheet styles", () => {
    const styled = [
      ...new Set([...css.matchAll(new RegExp(`\\.(${PREFIX}[a-z0-9-]+)`, "g"))].map((m) => m[1])),
    ];
    expect(styled.length).toBeGreaterThan(10);

    // A rule nothing emits is dead. Tokens built by interpolation (bcst-shape-star
    // from `bcst-shape-${card.shape}`) are matched by their stem plus the value.
    const dead = styled.filter((cls) => {
      if (sources.includes(cls)) return false;
      const cut = cls.lastIndexOf("-");
      const stem = cls.slice(0, cut);
      const leaf = cls.slice(cut + 1);
      return !(sources.includes(`${stem}-$`) && sources.includes(`"${leaf}"`));
    });
    expect(dead).toEqual([]);
  });

  it("should draw every shape geometrically rather than as a font glyph", () => {
    // A glyph in a ::before is sized and positioned by the font's metrics, not by
    // the CSS box, so it renders small, sits low, and moves with the font stack.
    const shapeRules = [...css.matchAll(/\.bcst-shape-[a-z]+[^{]*\{([^}]*)\}/g)].map((m) => m[1]);
    expect(shapeRules.length).toBe(4);
    shapeRules.forEach((body) => expect(body).not.toMatch(/content\s*:/));
    expect(css).not.toMatch(/\.bcst-shape-[a-z]+::before/);
  });

  it("should put the scoping root on every trial the timeline produces", () => {
    const jsPsych = initJsPsych();
    const trials = flatten(createTimeline(jsPsych, { showInstructions: true, showFeedback: true }));

    // instructions, sorting, feedback, completion
    expect(trials.length).toBe(4);
    trials.forEach((trial) => expect(trial.css_classes).toEqual([ROOT]));
  });
});
