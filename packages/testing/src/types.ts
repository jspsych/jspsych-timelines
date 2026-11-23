/** Types shared by the harness, the fixture loader, the checks and the runners. */

/** A jsPsych data row. */
export type Row = Record<string, any>;

export type Phase = "practice" | "test";

/** vocabulary type `duration` (PACKAGE-STANDARD 2a): milliseconds, or a jitter range sampled per trial. */
export type DurationSpec = number | { min: number; max: number; step?: number };

/** Why a typed literature value could not be checked. */
export type GapClass =
  | "package fix needed"
  | "option missing"
  | "plugin needed"
  | "dossier value wrong"
  | "genuinely contradictory";

export const GAP_CLASSES: GapClass[] = [
  "package fix needed",
  "option missing",
  "plugin needed",
  "dossier value wrong",
  "genuinely contradictory",
];

/**
 * What the check of an option can see:
 * - `behaviour`: the effect shows in the simulated rows (counts, presence, timeouts, keys)
 * - `recorded-parameter`: a duration or spacing equals the value in the row and in the plugin
 *   parameter. Data-only simulation ignores time, so this proves the value arrived, not that the
 *   browser times it.
 * - `structure`: the built timeline or rendered HTML contains it
 */
export type CheckKind = "behaviour" | "recorded-parameter" | "structure";
