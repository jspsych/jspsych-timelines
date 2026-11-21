/**
 * @jspsych-timelines/testing: dev-only test harness for timeline packages.
 *
 *   harness      build + simulate + rows       createHarness, rowsOf, trialsOf, filterRows
 *   contract     what a package tells the checks about its data         defineContract
 *   checks       shared checks for vocabulary options                   sharedChecks, durationCheck
 *   fixture      the committed reproduction fixture and its cases       Fixture, collectCases
 *   adapter      retyping fixture values into a package's options       createAdapterKit, ok, gap
 *   runners      level 1 and 2, tallies, reproduction.md                defineReproduction
 *
 * The browser layout check is separate (`@jspsych-timelines/testing/layout`), because it needs Chrome.
 */
export * from "./types";
export * from "./rows";
export * from "./harness";
export * from "./contract";
export * from "./checks/types";
export * from "./checks/shared";
export * from "./checks/schema";
export * from "./fixture";
export * from "./adapter";
export * from "./reproduction";
export { renderReproductionMd, writeReproductionMd } from "./report";
