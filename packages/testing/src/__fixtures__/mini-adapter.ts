/** The adapter of the mini task: the small amount of wiring a new package writes (see README). */
import { createAdapterKit, gap, isGap, ok } from "../adapter";
import type { Adapted, ConfigEntry, ReproductionAdapter } from "../adapter";
import type { MiniOptions } from "./mini-task";

const kit = createAdapterKit<MiniOptions>({ mapOptions: ["practice"] });

function adapt(option: string, _sub: string, value: any): Adapted<MiniOptions> {
  if (option === "trial_feedback" && !["none", "accuracy"].includes(value)) {
    return gap("option missing", `mini-task has no "${value}" feedback`);
  }
  // a feedback duration is only observable with feedback switched on
  if (option === "feedback_duration_ms")
    return ok({ [option]: value } as MiniOptions, { trial_feedback: "accuracy" });
  return ok({ [option]: value } as MiniOptions);
}

function adaptConfig(options: Record<string, any>): ConfigEntry<MiniOptions>[] {
  return Object.entries(options).map(([key, value]) => ({
    key,
    adapted: key.startsWith("practice.")
      ? ok({ practice: { [key.slice("practice.".length)]: value } } as MiniOptions)
      : adapt(key.split(".")[0], "main", value),
  }));
}

export const miniAdapter: ReproductionAdapter<MiniOptions> = {
  adapt,
  adaptConfig,
  combine: kit.combine,
  assumedSettings: kit.assumedSettings,
};

export { isGap };
