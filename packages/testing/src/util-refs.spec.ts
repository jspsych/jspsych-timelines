import { resolveUtilRefs, toUtilRefs } from "./util-refs";

const words = { name: "words", items: ["a", "b"] };
const utils = {
  stimuli: { words, nonwords: { name: "nonwords", items: ["x"] } },
  constants: { D: { items: ["a", "b"] } },
};

describe("util references", () => {
  it("toUtilRefs swaps exported sets (same object or a copy) and leaves everything else", () => {
    const o = {
      stimulus_set: { items: words, pool: "nested" },
      practice: { s: JSON.parse(JSON.stringify(words)) },
      n: [1],
    };
    expect(toUtilRefs(o, utils)).toEqual({
      stimulus_set: { items: { $util: "stimuli.words" }, pool: "nested" },
      practice: { s: { $util: "stimuli.words" } },
      n: [1],
    });
    // outside the namespaces: not a reference
    expect(toUtilRefs({ d: { items: ["a", "b"] } }, { constants: utils.constants })).toEqual({
      d: { items: ["a", "b"] },
    });
  });

  it("resolveUtilRefs is the inverse and names a missing export", () => {
    const o = { a: { $util: "stimuli.words" }, b: [{ $util: "stimuli.nonwords" }] };
    expect(resolveUtilRefs(o, utils)).toEqual({ a: words, b: [utils.stimuli.nonwords] });
    expect(resolveUtilRefs(o, utils).a).toBe(words);
    expect(() => resolveUtilRefs({ a: { $util: "stimuli.nope" } }, utils)).toThrow(
      /utils\.stimuli\.nope/
    );
  });
});
