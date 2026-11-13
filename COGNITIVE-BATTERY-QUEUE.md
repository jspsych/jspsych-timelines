# Cognitive Battery Task Queue

**Last updated:** 2026-01-14

## Status Key

| Symbol | Meaning |
|--------|---------|
| ⬜ | Not started |
| 🟡 | In progress |
| 🟢 | Complete |
| 🔴 | Blocked |
| ➖ | N/A |

## How to Use This Queue

1. Find the first task with ⬜ in the Spec column
2. Generate specification using AGENT.md
3. Implement the timeline
4. Verify using VERIFY.md
5. Update status and move to next task

---

## Phase 1: Foundation

Priority tasks establishing core workflow. Start here.

| Task | PEBL Folder | Domain | Spec | Impl | Verify | PR |
|------|-------------|--------|------|------|--------|-----|
| Flanker | `flanker` | Executive Function | 🟢 | 🟢 | ⬜ | ⬜ |
| Digit Span | `dspan` | Working Memory | 🟢 | 🟢 | ⬜ | ⬜ |
| Corsi Blocks | `corsi` | Working Memory | ➖ | 🟢 | ⬜ | ⬜ |
| Go/No-Go | `gonogo` | Executive Function | ➖ | 🟢 | ⬜ | ⬜ |
| BART | `BART` | Decision Making | ➖ | 🟢 | ⬜ | ⬜ |

## Phase 2: Extended Core

Additional domain coverage, moderate complexity.

| Task | PEBL Folder | Domain | Spec | Impl | Verify | PR |
|------|-------------|--------|------|------|--------|-----|
| N-Back (Spatial) | `nback` | Working Memory | ➖ | 🟢 | ⬜ | ⬜ |
| BCST (Card Sort) | `berg-card-sorting-test` | Executive Function | 🟢 | 🟢 | ⬜ | ⬜ |
| ANT | `ANT` | Attention | ➖ | ➖ | ➖ | ➖ |
| Iowa Gambling | `iowa` | Decision Making | 🟢 | 🟢 | ⬜ | ⬜ |
| Operation Span | `ospan` | Working Memory | 🟢 | 🟢 | ⬜ | ⬜ |

## Phase 3: Specialized

Requires custom plugins or complex implementation.

| Task | PEBL Folder | Domain | Spec | Impl | Verify | PR | Notes |
|------|-------------|--------|------|------|--------|-----|-------|
| Trail Making | `ptrails` | Attention/EF | 🟢 | 🟢 | ⬜ | ⬜ | Plugin + Timeline complete |
| Mental Rotation | `matrixrotation` | Visuospatial | 🟢 | 🟢 | ⬜ | ⬜ | Matrix rotation (no plugin needed) |
| Pursuit Rotor | `pursuitrotor` | Motor | 🟢 | 🟢 | ⬜ | ⬜ | Plugin + Timeline complete |
| Tower of London | `tol` | Executive Function | 🟢 | 🟢 | ⬜ | ⬜ | Plugin + Timeline complete |
| PCPT | `pcpt` | Attention | ➖ | ➖ | ➖ | ➖ | Skipped (long duration) |
| Lexical Decision | `lexicaldecision` | Language | 🟢 | 🟢 | ⬜ | ⬜ | Built-in word lists |

## Phase 4: Additional Coverage

Lower priority, for completeness.

| Task | PEBL Folder | Domain | Spec | Impl | Verify | PR |
|------|-------------|--------|------|------|--------|-----|
| Plus-Minus | `plusminus` | Executive Function | 🟢 | 🟢 | ⬜ | ⬜ |
| Global-Local | `globallocal` | Executive Function | 🟢 | 🟢 | ⬜ | ⬜ |
| Oddball | `oddball` | Attention | 🟢 | 🟢 | ⬜ | ⬜ |
| Free Recall | `freerecall` | Memory | 🟢 | 🟢 | ⬜ | ⬜ |
| Paired Associates | `pairedassociates` | Memory | 🟢 | 🟢 | ⬜ | ⬜ |
| Simple/Choice RT | `crt` | Processing Speed | 🟢 | 🟢 | ⬜ | ⬜ |
| Fitts | `fitts` | Motor | 🟢 | 🟢 | ⬜ | ⬜ |

---

## Custom Plugins Queue

These must be built before their dependent timelines.

| Plugin | For Task(s) | Spec | Impl | PR | npm |
|--------|-------------|------|------|-----|-----|
| `plugin-trail-making` | Trail Making | 🟢 | 🟢 | ⬜ | ⬜ |
| `plugin-pursuit-rotor` | Pursuit Rotor | 🟢 | 🟢 | ⬜ | ⬜ |
| `plugin-tower-of-london` | Tower of London | 🟢 | 🟢 | ⬜ | ⬜ |

**Already available:**
- ✅ `@jspsych-contrib/plugin-corsi-blocks` - Use for Corsi Blocks
- ✅ `@jspsych-contrib/plugin-trail-making` - Use for Trail Making (created 2026-01-14)
- ✅ `@jspsych-contrib/plugin-tower-of-london` - Use for Tower of London (created 2026-01-14)
- ✅ `@jspsych-contrib/plugin-pursuit-rotor` - Use for Pursuit Rotor (created 2026-01-14)

---

## Progress Summary

| Phase | Total | Spec | Impl | Verify | PR |
|-------|-------|------|------|--------|-----|
| Phase 1 | 5 | 2 | 5 | 0 | 0 |
| Phase 2 | 5 | 3 | 4 | 0 | 0 |
| Phase 3 | 6 | 5 | 5 | 0 | 0 |
| Phase 4 | 8 | 8 | 8 | 0 | 0 |
| **Total** | **24** | **18** | **22** | **0** | **0** |

---

## Notes Log

| Date | Note |
|------|------|
| 2025-01-13 | Queue initialized. Phase 1 prioritizes domain coverage with simple implementations. |
| | Corsi plugin exists in jspsych-contrib. |
| | BART has JS implementations available for reference (m-Py/BART on GitHub). |
| 2026-01-13 | Flanker task: Spec and implementation complete. New `flanker` package created (separate from existing `arrow-flanker`). Includes instructions, practice with feedback, scoring utils, full documentation. |
| 2026-01-13 | Updated CONVENTIONS.md with: (1) Text parameterization pattern for translation support, (2) Mobile compatibility requirements - all tasks must use button responses, not keyboard. |
| 2026-01-13 | Flanker updated to mobile-compatible with touch-friendly buttons, parameterized text for translation. |
| 2026-01-13 | Digit Span task: Spec and implementation complete. Features: staircase adaptive algorithm, forward/backward modes, custom number pad for mobile input, full text parameterization. |
| 2026-01-13 | Corsi Blocks: Existing implementation reviewed and updated for consistency. Added: scoring utilities (utils.scoring.getSummary), timelineUnits export, task_version in data, renamed text_object to text. Uses @jspsych-contrib/plugin-corsi-blocks. |
| 2026-01-13 | Go/No-Go: Existing implementation reviewed and updated for consistency. Added: scoring utilities (utils.scoring.getSummary with go/nogo accuracy, commission/omission errors), task_version in data, renamed text_object to text parameter, updated TASK_NAME constant usage, TextConfig type export. |
| 2026-01-13 | Replaced Pattern Comparison with Letter-Digit in Phase 1. Pattern Comparison is not in PEBL (it's an NIH Toolbox task with proprietary stimuli). Letter-Digit moved from Phase 2 to Phase 1. |
| 2026-01-13 | Removed processing speed tasks from Phase 1 (Pattern Comparison and Letter-Digit not found in PEBL). Phase 1 now has 5 tasks. Processing speed tasks can be added in later phases if needed. |
| 2026-01-13 | BART: Existing implementation updated for consistency. Added: scoring utilities (utils.scoring.getSummary with totalPoints, popRate, adjustedAvgPumps), task_version in data, renamed text_object to text parameter, TASK_NAME constant usage, TextConfig type export. Uses @jspsych-contrib/plugin-bart. |
| 2026-01-14 | Spatial N-Back: Existing implementation updated for consistency. Added: utils.scoring (with d-prime, hit rate, false alarm rate, RT metrics), utils.constants (TASK_NAME, VERSION), utils.text export, task_version in data output. Uses @jspsych-contrib/plugin-spatial-nback. Note: This is spatial-only n-back; PEBL version includes dual n-back with audio/visual letters which could be a future extension. |
| 2026-01-14 | BCST (Berg Card Sorting Test): New implementation complete. Features: CSS-rendered cards (no image files needed), configurable rule change threshold (runLength), perseverative response detection, comprehensive scoring (categories completed, perseverative errors, conceptual level responses, failure to maintain set), full text parameterization. Created new `berg-card-sorting-test` package with 25 passing tests. |
| 2026-01-14 | ANT skipped (similar to existing Flanker implementation). |
| 2026-01-14 | Iowa Gambling Task: New implementation complete. Features: Classic Bechara et al. (1994) payoff schedules, 4 decks with 40-card penalty cycles, comprehensive scoring (deck preferences, advantageous/disadvantageous selections, block-by-block learning curve), customizable currency symbol. Created new `iowa-gambling` package with 24 passing tests. |
| 2026-01-14 | Operation Span Task: New implementation complete. Features: Dual-task paradigm with math verification and letter memory, interactive recall grid, configurable set sizes, OSPAN score (partial credit) and absolute span score, math accuracy tracking. Created new `operation-span` package with 21 passing tests. |
| 2026-01-14 | Trail Making Plugin: Created `@jspsych-contrib/plugin-trail-making` in jspsych-contrib. Features: Part A (numbers) and Part B (alternating numbers/letters), canvas-based rendering, customizable target positions, error tracking, completion time and path distance metrics, seeded random layouts for reproducibility. 12 passing tests. |
| 2026-01-14 | Trail Making Timeline: Created `@jspsych-timelines/trail-making` package. Features: Complete TMT implementation with instructions, practice trials for both parts, Part A (numbers) and Part B (numbers+letters), comprehensive scoring (completion time, errors, path distance, difference score B-A, ratio score B/A), full text parameterization. Uses the new plugin-trail-making from jspsych-contrib. 22 passing tests. |
| 2026-01-14 | Tower of London Plugin: Created `@jspsych-contrib/plugin-tower-of-london` in jspsych-contrib. Features: 3 pegs with configurable capacities, 3 colored balls, click/touch interaction, goal state display, move counter, optimality tracking. 16 passing tests. |
| 2026-01-14 | Tower of London Timeline: Created `@jspsych-timelines/tower-of-london` package. Features: 10 default puzzles (2-6 moves difficulty), practice trial, comprehensive scoring (puzzles solved, optimal solutions, average moves, by-difficulty breakdown), full text parameterization. 20 passing tests. |
| 2026-01-14 | Pursuit Rotor Plugin: Created `@jspsych-contrib/plugin-pursuit-rotor` in jspsych-contrib. Features: Canvas-based circular target tracking, configurable rotation speed/direction/path radius, mouse and touch support, time on target and mean deviation metrics, continuous sampling. 14 passing tests. |
| 2026-01-14 | Pursuit Rotor Timeline: Created `@jspsych-timelines/pursuit-rotor` package. Features: 4 default trials (15 sec each), practice trial, comprehensive scoring (average percent on target, improvement from first to last trial, learning slope), full text parameterization. 22 passing tests. |
| 2026-01-14 | Mental Rotation Task: Created `@jspsych-timelines/mental-rotation` package. Based on PEBL matrix rotation implementation. Features: 6x6 grid patterns with one filled cell per row/column, study-test paradigm with 90° rotation judgments (same/different), configurable grid size and cell size, practice trials with feedback, comprehensive scoring (accuracy by condition, average RT), full text parameterization. Uses html-button-response (no custom plugin needed). 29 passing tests. |
| 2026-01-14 | Lexical Decision Task: Created `@jspsych-timelines/lexical-decision` package. Features: 40 built-in words and 40 nonwords (modifiable), customizable word lists, fixation + stimulus presentation, configurable response timeout, d-prime calculation, practice trials with feedback, comprehensive scoring (accuracy by condition, RT by condition, d-prime sensitivity), full text parameterization. 28 passing tests. |
| 2026-01-14 | PCPT skipped (long duration sustained attention task, not practical for typical battery use). |
| 2026-01-14 | Plus-Minus Task: Created `@jspsych-timelines/plus-minus` package. Classic cognitive flexibility task (Jersild, 1927). Features: 3 blocks (addition, subtraction, alternating), mobile-friendly number pad input, configurable operand and number range, block timing with switch cost calculation, per-block and overall accuracy. 23 passing tests. |
| 2026-01-14 | Global-Local Task: Created `@jspsych-timelines/global-local` package. Navon figure selective attention task. Features: CSS-rendered composite letters (large letters made of small letters), global and local attention blocks, congruent/incongruent trial types, interference effect calculation, configurable figure size and font. 28 passing tests. |
| 2026-01-14 | Paired Associates Task: Created `@jspsych-timelines/paired-associates` package. Classic associative memory task. Features: 8 default word pairs (unrelated concrete nouns), study-test paradigm with multiple learning rounds, multiple choice test format with distractors, learn-to-criterion option, comprehensive scoring (rounds to learn, per-round performance, RT metrics), full text parameterization. 27 passing tests. |
| 2026-01-14 | Oddball Task: Created `@jspsych-timelines/oddball` package. Visual oddball paradigm for sustained attention. Features: Colored circle stimuli (standard vs target), configurable target proportion (default 20%), d-prime calculation with log-linear correction, hit/miss/false alarm/correct rejection scoring, practice with feedback, full text parameterization. 33 passing tests. |
| 2026-01-14 | Free Recall Task: Created `@jspsych-timelines/free-recall` package. Verbal memory task measuring encoding and retrieval. Features: 15 default words (customizable), sequential word presentation, text input recall (survey-text plugin), intrusion and repetition detection, serial position tracking, recall rate calculation, full text parameterization. 27 passing tests. |
| 2026-01-14 | Simple/Choice RT Task: Created `@jspsych-timelines/choice-rt` package. Processing speed measurement combining simple and choice reaction time. Features: Variable foreperiod to prevent anticipation, simple RT (single response) and choice RT (left/right response) blocks, anticipated response detection, RT standard deviation calculation, choice cost (RT difference), full text parameterization. 39 passing tests. |
| 2026-01-14 | Fitts Task: Created `@jspsych-timelines/fitts` package. Fitts' Law reciprocal tapping task for motor control measurement. Features: 6 default conditions varying target width and distance, Index of Difficulty calculation, throughput (bits/s) calculation, per-condition performance tracking, touch and click support, full text parameterization. 32 passing tests. |

---

## Next Action

**Current task:** PHASE 4 COMPLETE! All 8 Phase 4 tasks implemented.
**Battery status:** 22 of 24 tasks implemented (92%). 2 tasks skipped (ANT - similar to Flanker, PCPT - long duration).
**Next step:** Verification and PR process for all implemented tasks.
