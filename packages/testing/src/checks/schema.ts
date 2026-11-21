import type { DataContract } from "../contract";
import type { Run } from "../harness";
import { rowsOf } from "../harness";

/**
 * PACKAGE-STANDARD 4: every row the package writes has `task` and `task_version`; the scorable
 * trial is `{phase: "practice" | "test", part: "response"}`. Run it on any run of the package.
 */
export function expectStandardTagging(r: Run, c: DataContract, expectedVersion?: string) {
  expect(r.rows.length).toBeGreaterThan(0);
  for (const row of r.rows) {
    expect(row.task).toBe(c.task);
    expect(typeof row.task_version).toBe("string");
    if (expectedVersion) expect(row.task_version).toBe(expectedVersion);
    expect(typeof row.phase).toBe("string");
    expect(typeof row.part).toBe("string");
  }
  const scorable = r.rows.filter((x) => x.part === c.parts.response);
  expect(scorable.length).toBeGreaterThan(0);
  scorable.forEach((x) => expect(["practice", "test"]).toContain(x.phase));
  expect(rowsOf(r, "test", c.parts.response).length).toBeGreaterThan(0);
}
