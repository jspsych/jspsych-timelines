import { assessScreens, findChrome, formatLayoutResults } from "./layout.cjs";
import type { ScreenSample } from "./layout.cjs";

const screen = (
  kind: string,
  cx: number | null,
  cy: number | null,
  extra: Partial<ScreenSample> = {}
): ScreenSample => ({
  kind,
  txt: "",
  btn: false,
  vw: 1280,
  vh: 800,
  cx,
  cy,
  stage: "200x100",
  btnsVisible: null,
  overlap: null,
  done: false,
  ...extra,
});

describe("assessScreens", () => {
  it("accepts screens whose stage centre agrees within the tolerance", () => {
    const r = assessScreens(
      [screen("fixation", 640, 400), screen("array", 640.6, 399.5), screen("text", null, null)],
      {
        expectKinds: ["fixation", "array"],
      }
    );
    expect(r).toEqual({ ok: true, failures: [], reference: { cx: 640, cy: 400 } });
  });

  it("reports a screen where the stage moves", () => {
    const r = assessScreens([screen("fixation", 640, 400), screen("feedback", 640, 372)]);
    expect(r.ok).toBe(false);
    expect(r.failures[0]).toContain('stage moved on "feedback"');
  });

  it("reports overlap, buttons out of the viewport, missing screen kinds and no stage at all", () => {
    const r = assessScreens([screen("array", 640, 400, { overlap: true, btnsVisible: false })], {
      expectKinds: ["feedback"],
    });
    expect(r.failures).toEqual([
      'text region overlaps the stage on "array"',
      'response buttons outside the viewport on "array"',
      'screen kind "feedback" never seen',
    ]);
    expect(assessScreens([screen("text", null, null)]).failures).toEqual([
      "no screen with a stage was seen",
    ]);
  });

  it("honours a wider tolerance", () => {
    const s = [screen("a", 100, 100), screen("b", 103, 100)];
    expect(assessScreens(s).ok).toBe(false);
    expect(assessScreens(s, { tolerancePx: 5 }).ok).toBe(true);
  });

  it("formats results for the CLI", () => {
    const samples = [screen("array", 640, 400)];
    const text = formatLayoutResults([
      { name: "v", samples, finished: true, ...assessScreens(samples) },
    ]);
    expect(text).toContain("ALL STAGE CENTRES IDENTICAL");
    expect(typeof findChrome).toBe("function");
  });
});
