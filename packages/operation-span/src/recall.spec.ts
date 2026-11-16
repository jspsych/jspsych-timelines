import { clickTarget, flushPromises, pressKey, startTimeline } from "@jspsych/test-utils";
import { JsPsych, initJsPsych } from "jspsych";

import { OperationSpanOptions } from "./options";
import { timelineUnits } from ".";

/** The recall input, in a real (jsdom) run: matrix clicks, typed boxes, single key presses and omissions. */
describe("recall input", () => {
  let jsPsych: JsPsych;
  beforeEach(() => {
    jsPsych = initJsPsych();
    jsPsych.randomization.setSeed("recall");
  });
  // each test starts on an empty page: an unfinished trial of an earlier test would still be listening
  afterEach(() => {
    jsPsych.abortExperiment("done");
    document.body.innerHTML = "";
  });

  async function recallScreen(options: OperationSpanOptions, items = ["F", "H", "J"]) {
    const ctx = timelineUnits.createContext(jsPsych, { set_sizes: [3], ...options });
    const trial = timelineUnits.createRecall(ctx, ctx.test, {
      phase: "test",
      part: "response",
      presented: items,
      data: { block: 1 },
    });
    const started = await startTimeline([trial], jsPsych);
    const done = () =>
      Array.from(started.displayElement.querySelectorAll("button")).find(
        (b) => b.textContent === "Done"
      ) as HTMLButtonElement;
    const click = (label: string) =>
      clickTarget(
        Array.from(started.displayElement.querySelectorAll("button")).find(
          (b) => b.textContent === label
        )!
      );
    return { ...started, done, click, row: () => started.getData().values()[0] as any };
  }

  it("matrix: clicked letters fill the places in order, used letters are disabled, Clear starts again", async () => {
    const r = await recallScreen({});
    const slots = () =>
      Array.from(r.displayElement.querySelectorAll(".jspsych-timelines-operation-span-slot")).map(
        (s) => s.textContent
      );
    await r.click("H");
    await r.click("F");
    expect(slots().map((s) => s?.trim())).toEqual(["H", "F", ""]);
    expect(
      (
        Array.from(r.displayElement.querySelectorAll("button")).find(
          (b) => b.textContent === "H"
        ) as HTMLButtonElement
      ).disabled
    ).toBe(true);
    await r.click("Clear");
    expect(slots().map((s) => s?.trim())).toEqual(["", "", ""]);
    await r.click("F");
    await r.click("Blank");
    await r.click("J");
    await clickTarget(r.done());
    expect(r.row()).toMatchObject({
      recalled_items: ["F", null, "J"],
      recall_correct_positions: [true, false, true],
      n_correct_positions: 2,
      perfect: false,
      correct: false,
    });
  });

  it("matrix with free order scores an item wherever it is entered", async () => {
    const r = await recallScreen({ response_order: "free" });
    for (const l of ["J", "F", "H"]) await r.click(l);
    await clickTarget(r.done());
    expect(r.row()).toMatchObject({ recalled_items: ["J", "F", "H"], perfect: true });
  });

  it("omission none: Done stays disabled until every place is filled", async () => {
    const r = await recallScreen({ recall_omission_handling: "none" });
    expect(r.done().disabled).toBe(true);
    expect(r.displayElement.querySelector('[data-action="blank"]')).toBeNull();
    for (const l of ["F", "H"]) await r.click(l);
    expect(r.done().disabled).toBe(true);
    await r.click("J");
    expect(r.done().disabled).toBe(false);
  });

  it("typed recall: one box per memorandum, empty boxes are omissions, case does not matter", async () => {
    const r = await recallScreen({
      response_device: { recall: "keyboard" },
      response_format: "free_text",
    });
    const boxes = Array.from(
      r.displayElement.querySelectorAll<HTMLInputElement>(".jspsych-timelines-operation-span-box")
    );
    expect(boxes).toHaveLength(3);
    boxes[0].value = "f";
    boxes[2].value = " J ";
    boxes.forEach((b) => b.dispatchEvent(new Event("input")));
    await clickTarget(r.done());
    expect(r.row()).toMatchObject({
      recalled_items: ["f", null, "J"],
      recall_correct_positions: [true, false, true],
    });
  });

  it("key-press recall: one key per item, ? is a blank, Backspace removes, the last item ends the trial", async () => {
    const r = await recallScreen({
      response_device: { recall: "keyboard" },
      response_format: "single_response",
      recall_omission_handling: "question_mark_key",
    });
    await pressKey("f");
    await pressKey("x"); // not in the pool: ignored
    await pressKey("Backspace");
    await pressKey("f");
    await pressKey("?");
    await pressKey("j");
    await flushPromises();
    expect(r.row()).toMatchObject({ recalled_items: ["F", null, "J"], n_correct_positions: 2 });
  });

  it("digits and word pools give their own matrix", async () => {
    const ctx = timelineUnits.createContext(jsPsych, {
      set_sizes: [2],
      stimulus_set: { memorandum: "digits" },
    });
    const t = timelineUnits.createRecall(ctx, ctx.test, {
      phase: "test",
      part: "response",
      presented: ["3", "7"],
      data: {},
    });
    const { displayElement } = await startTimeline([t], jsPsych);
    expect(displayElement.querySelectorAll(".jspsych-timelines-operation-span-key")).toHaveLength(
      9
    );
  });
});

describe("practice parts and criterion", () => {
  const sim = { default: { data: { rt: 400 } } };
  async function run(options: OperationSpanOptions) {
    const { simulateTimeline } = await import("@jspsych/test-utils");
    const j = initJsPsych();
    j.randomization.setSeed("criterion");
    const { createTimeline } = await import(".");
    const { timeline } = createTimeline(j, {
      set_sizes: [2],
      trials_per_condition: 1,
      instruction_demonstration: "none",
      ...options,
    });
    const { getData, expectFinished } = await simulateTimeline(timeline, "data-only", sim, j);
    await expectFinished();
    return getData().values() as any[];
  }
  const proc = (rows: any[]) =>
    rows.filter(
      (r) =>
        r.phase === "practice" && r.part === "processing" && r.practice_part === "processing_only"
    );

  it("storage_processing runs letters then problems and no combined part; none runs no practice", async () => {
    const rows = await run({
      practice_structure: "storage_processing",
      practice_storage_trials: 2,
      practice_trials: 3,
    });
    expect(
      rows
        .filter((r) => r.phase === "practice" && r.part === "response")
        .map((r) => r.practice_part)
    ).toEqual(["storage", "storage"]);
    expect(proc(rows)).toHaveLength(3);
    expect(
      (await run({ practice_structure: "none" })).filter((r) => r.phase === "practice")
    ).toHaveLength(0);
  });

  it("letters-only practice has no processing and its feedback shows only the recall", async () => {
    const rows = await run({
      practice_structure: "storage_processing_combined",
      practice_trials: 0,
      practice_storage_trials: 2,
      feedback_duration_ms: 100,
    });
    const storage = rows.filter((r) => r.practice_part === "storage" && r.part === "response");
    storage.forEach((r) => expect(r.processing_errors).toBeNull());
    expect(
      rows.filter((r) => r.practice_part === "storage" && r.part === "processing")
    ).toHaveLength(0);
    // practice_trials 0 skips the processing-only part (and so the calibration: the fixed 6 s applies)
    expect(proc(rows)).toHaveLength(0);
    rows
      .filter((r) => r.phase === "test" && r.part === "processing")
      .forEach((r) => expect(r.response_window).toBe(6000));
  });

  it("criterion on_fail repeat: the processing-only part runs again (max_repeats 1 by default), then the task continues", async () => {
    const rows = await run({ practice_trials: 4, practice_criterion: { accuracy: 1 } });
    const p = proc(rows);
    expect(p.map((r) => r.practice_attempt)).toEqual([1, 1, 1, 1, 2, 2, 2, 2]);
    expect(rows.filter((r) => r.phase === "test" && r.part === "response")).toHaveLength(1);
    expect(
      rows.filter(
        (r) =>
          r.part === "instruction" &&
          String(r.stimulus).includes("practice the math problems again")
      )
    ).toHaveLength(1);
  });

  it("max_repeats caps the repeats, a window is accepted, continue never repeats", async () => {
    const twice = await run({
      practice_trials: 8,
      practice_criterion: { accuracy: 1, window: 8, max_repeats: 2 },
    });
    expect(new Set(proc(twice).map((r) => r.practice_attempt))).toEqual(new Set([1, 2, 3]));
    expect(proc(twice)).toHaveLength(24);
    const cont = await run({
      practice_trials: 8,
      practice_criterion: { accuracy: 1, on_fail: "continue" },
    });
    expect(proc(cont)).toHaveLength(8);
  });

  it("criterion on_fail end stops the experiment before the test", async () => {
    const rows = await run({
      practice_trials: 4,
      practice_criterion: { accuracy: 1, on_fail: "end" },
    });
    expect(rows.filter((r) => r.phase === "test")).toHaveLength(0);
  });

  it("a passed criterion does not repeat", async () => {
    // accuracy 0 is not allowed; use a tiny threshold that any run meets
    const rows = await run({ practice_trials: 6, practice_criterion: { accuracy: 0.0001 } });
    expect(proc(rows)).toHaveLength(6);
  });
});
