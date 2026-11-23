import { sharedChecks } from "./checks/shared";
import { defineContract } from "./contract";

/**
 * `contract.scope` routes an option's shared check to another part of a multi-part trial (a dual
 * task): here the memory items's duration and the processing task's deadline, device and keys.
 */
const contract = defineContract({
  task: "dual",
  scope: {
    stimulus_duration_ms: { part: "memory_item" },
    response_window_ms: {
      part: "processing",
      builtPart: () => "problem",
      value: (e: any) => e.window,
    },
    response_device: {
      part: "processing",
      filter: (r) => !r.timeout,
      value: (e: any) => e.device.processing,
    },
  },
});

const row = (part: string, extra: Record<string, unknown> = {}) => ({
  task: "dual",
  phase: "test",
  part,
  ...extra,
});

function fakeRun(eff: any, rows: any[], trials: any[] = []) {
  return { opts: {}, eff, effP: eff, built: { timeline: trials }, rows, jsPsych: null as any };
}
const ctx = {
  contract,
  harness: {
    run: async () => fakeRun({}, []),
    runSlow: async () => slow,
    runSeeds: async () => [],
  } as any,
};
const slow = fakeRun({ window: 500 }, [
  row("processing", { timeout: true, response_window: 500 }),
  row("processing", { timeout: true, response_window: 500 }),
]);

describe("contract.scope", () => {
  it("defaults to no scope", () => {
    expect(defineContract({ task: "x" }).scope).toEqual({});
  });

  it("stimulus_duration_ms reads the memory item rows and the built memory item trials", async () => {
    const trials = [
      { type: {}, data: { part: "memory_item", phase: "test" }, stimulus_duration: 800 },
    ];
    const good = fakeRun(
      { stimulus_duration_ms: 800 },
      [row("memory_item", { stimulus_duration: 800 })],
      trials
    );
    await expect(
      Promise.resolve(sharedChecks.stimulus_duration_ms.fn(good, ctx))
    ).resolves.toBeUndefined();
    const bad = fakeRun(
      { stimulus_duration_ms: 900 },
      [row("memory_item", { stimulus_duration: 800 })],
      trials
    );
    expect(() => sharedChecks.stimulus_duration_ms.fn(bad, ctx)).toThrow();
    // a jitter range: values on the grid pass
    const jitter = fakeRun(
      { stimulus_duration_ms: { min: 600, max: 1000, step: 200 } },
      [
        row("memory_item", { stimulus_duration: 600 }),
        row("memory_item", { stimulus_duration: 1000 }),
      ],
      [{ type: {}, data: { part: "memory_item", phase: "test" }, stimulus_duration: 800 }]
    );
    expect(() => sharedChecks.stimulus_duration_ms.fn(jitter, ctx)).not.toThrow();
  });

  it("response_window_ms accepts a computed value: every row records a number or null, and a slow participant times out", async () => {
    const eff = { window: () => 500 };
    const rows = [row("processing", { timeout: false, response_window: 500 })];
    const trials = [
      { type: {}, data: { part: "problem", phase: "test" }, trial_duration: () => 500 },
    ];
    const run = fakeRun(eff, rows, trials);
    const c = {
      ...ctx,
      harness: { ...ctx.harness, runSlow: async () => fakeRun(eff, slow.rows) } as any,
    };
    await expect(
      Promise.resolve(sharedChecks.response_window_ms.fn(run, c))
    ).resolves.toBeUndefined();
    const notNumber = fakeRun(
      eff,
      [row("processing", { timeout: false, response_window: "x" })],
      trials
    );
    await expect(
      Promise.resolve(sharedChecks.response_window_ms.fn(notNumber, c))
    ).rejects.toThrow();
  });

  it("response_device reads the scoped device and skips rows that are not responses", () => {
    const eff = { device: { processing: "keyboard", recall: "mouse" } };
    const run = fakeRun(
      eff,
      [
        row("processing", {
          trial_type: "html-keyboard-response",
          response: "f",
          response_device: "keyboard",
        }),
        // a missed deadline is a notice, not a response screen
        row("processing", {
          trial_type: "html-keyboard-response",
          timeout: true,
          response: null,
          response_device: "keyboard",
        }),
      ],
      [{ type: {}, data: { part: "processing", phase: "test" }, choices: ["f", "j"] }]
    );
    expect(() => sharedChecks.response_device.fn(run, ctx)).not.toThrow();
    const wrong = fakeRun(
      eff,
      [
        row("processing", {
          trial_type: "html-button-response",
          response: 0,
          response_device: "keyboard",
        }),
      ],
      [{ type: {}, data: { part: "processing", phase: "test" }, choices: ["f", "j"] }]
    );
    expect(() => sharedChecks.response_device.fn(wrong, ctx)).toThrow();
  });
});
