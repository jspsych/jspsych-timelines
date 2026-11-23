/**
 * The stop-signal-delay staircase, built on `jsPsych.adaptive` (jsPsych core 8.4.0).
 *
 * The level is the delay in ms. A successful stop (the "correct" response) makes the next stop harder, so
 * the delay goes up (`correct_moves: "up"`); a failed stop shortens it. `tracks: "per_condition"` keeps one
 * independent staircase per go direction; `reset` creates fresh staircases (a new procedure, not a rewind).
 */
import type { JsPsych } from "jspsych";

import type { ResolvedAdaptive } from "./options";

type Staircase = ReturnType<JsPsych["adaptive"]["createStaircase"]>;

export type TrackKey = "all" | "left" | "right";

export class StaircaseSet {
  private tracks = new Map<TrackKey, Staircase>();

  constructor(private jsPsych: JsPsych, readonly cfg: ResolvedAdaptive) {}

  keyFor(direction: "left" | "right"): TrackKey {
    return this.cfg.tracks === "per_condition" ? direction : "all";
  }

  track(key: TrackKey): Staircase {
    let t = this.tracks.get(key);
    if (!t) {
      const c = this.cfg;
      t = this.jsPsych.adaptive.createStaircase({
        label: key,
        start_level: c.start_level,
        correct_moves: "up",
        // successes in a row needed to lengthen the delay; one failure shortens it
        up:
          c.procedure === "staircase_1up_1down" ? 1 : c.procedure === "staircase_1up_2down" ? 2 : 3,
        down: 1,
        step_size: c.step_size,
        bounds: c.bounds,
        ...(c.discontinue_rule ? { stop: c.discontinue_rule } : {}),
      });
      this.tracks.set(key, t);
    }
    return t;
  }

  /** The delay of the next stop trial on this track, ms. */
  level(key: TrackKey): number {
    return this.track(key).level;
  }

  /** Record the outcome of a stop trial (true = successful stop). A finished staircase keeps its level. */
  update(key: TrackKey, success: boolean): void {
    const t = this.track(key);
    if (!t.done) t.update(success);
  }

  /** The staircase state after the last update, without its history (small enough for every trial row). */
  compact(key: TrackKey): Record<string, unknown> {
    const { history: _h, config: _c, ...rest } = this.track(key).toJSON() as any;
    return rest;
  }

  /** Full `toJSON()` of every track that exists, history included. */
  snapshot(): Array<Record<string, unknown>> {
    return [...this.tracks.values()].map((t) => JSON.parse(JSON.stringify(t.toJSON())));
  }
}

/**
 * Holds the staircases of a timeline and decides when a block starts fresh ones (`reset`). A block
 * with a different staircase configuration (a practice override) always starts fresh.
 */
export class StaircaseManager {
  private set: StaircaseSet | null = null;
  private phase: string | null = null;
  private cfgKey: string | null = null;

  constructor(private jsPsych: JsPsych) {}

  /** Called when a block starts. Returns the set in force (null for fixed delays). */
  startBlock(phase: string, cfg: ResolvedAdaptive | null): StaircaseSet | null {
    if (cfg === null) {
      this.set = null;
      this.cfgKey = null;
      this.phase = phase;
      return null;
    }
    const key = JSON.stringify(cfg);
    const fresh =
      this.set === null ||
      this.cfgKey !== key ||
      cfg.reset === "block" ||
      (cfg.reset === "phase" && this.phase !== phase);
    if (fresh) this.set = new StaircaseSet(this.jsPsych, cfg);
    this.cfgKey = key;
    this.phase = phase;
    return this.set;
  }

  /** The set in force, creating one from `cfg` if no block has started (units used by hand). */
  current(phase: string, cfg: ResolvedAdaptive): StaircaseSet {
    return this.set ?? this.startBlock(phase, cfg)!;
  }
}
