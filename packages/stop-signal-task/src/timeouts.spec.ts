import { initJsPsych } from "jspsych";

import { createTimeline } from "./index";

// PACKAGE-STANDARD §2a (an absent value the task cannot run without throws) and §9 (timeouts record null)
describe("timeouts and the response window", () => {
  it("response_window_ms: null throws: a no-response trial needs a window to end", () => {
    expect(() => createTimeline(initJsPsych(), { response_window_ms: null } as any)).toThrow();
  });

  it.each(["keyboard", "touch"])(
    "a timed-out %s trial records response and rt as null",
    async (device) => {
      const jsPsych = initJsPsych();
      const timeline = createTimeline(jsPsych, {
        response_device: device,
        practice_trials: 0,
        n_test_trials: 8,
        n_blocks: 1,
        instruction_demonstration: "none",
      } as any);
      // a forced RT far beyond any window: every trial times out (a button trial would otherwise keep index 0)
      await jsPsych.simulate(timeline, "data-only", { default: { data: { rt: 60000 } } });
      const rows = jsPsych.data.get().filter({ phase: "test", part: "response" }).values();
      expect(rows).toHaveLength(8);
      for (const r of rows) {
        expect(r.response).toBeNull();
        expect(r.rt).toBeNull();
      }
    }
  );
});
