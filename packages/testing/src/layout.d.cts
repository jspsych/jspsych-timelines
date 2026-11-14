export interface LayoutVariant {
  name: string;
  options: Record<string, unknown>;
  viewport: { width: number; height: number; hasTouch?: boolean };
  /** key to press on a screen kind, e.g. `{ array: "z" }` */
  keys?: Record<string, string>;
}

export interface LayoutConfig {
  bundle: string;
  global: string;
  stageSelector: string;
  belowSelector?: string;
  /** serialised and run in the page: self-contained */
  screenKind: (stage: Element | null, doc: Document) => string;
  variants: LayoutVariant[];
  expectKinds?: string[];
  tolerancePx?: number;
  maxMs?: number;
  jspsychJs?: string;
  jspsychCss?: string;
  executablePath?: string;
}

export interface ScreenSample {
  kind: string;
  txt: string;
  btn: boolean;
  vw: number;
  vh: number;
  cx: number | null;
  cy: number | null;
  stage: string;
  btnsVisible: boolean | null;
  overlap: boolean | null;
  done: boolean;
}

export interface LayoutAssessment {
  ok: boolean;
  failures: string[];
  reference: { cx: number; cy: number } | null;
}

export interface LayoutResult extends LayoutAssessment {
  name: string;
  samples: ScreenSample[];
  finished: boolean;
}

export function runLayoutCheck(config: LayoutConfig): Promise<LayoutResult[]>;
export function assessScreens(
  samples: ScreenSample[],
  options?: { tolerancePx?: number; expectKinds?: string[] }
): LayoutAssessment;
export function formatLayoutResults(results: LayoutResult[]): string;
export function findChrome(explicit?: string): string | undefined;
