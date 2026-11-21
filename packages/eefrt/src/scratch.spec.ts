import { responses, run } from "./test-helpers";

it("default run terminates", async () => {
  const { rows } = await run({});
  const t = responses(rows);
  const p = responses(rows, "practice");
  console.log(
    "test trials",
    t.length,
    "practice",
    p.length,
    "last elapsed",
    t[t.length - 1].session_elapsed_ms
  );
  console.log(JSON.stringify(t.slice(0, 3), null, 1));
  console.log(rows.filter((r) => r.part === "completion"));
  console.log(new Set(rows.map((r) => r.part + "/" + r.phase)));
}, 60000);
