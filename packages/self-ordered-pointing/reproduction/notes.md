## Notes

**Position-repetition rule.** The spec records the three studies' rule (S010 instructed, S055 enforced, S024 detect and remind) as untyped, because `sequence_constraints` orders generated trials and the rule constrains the participant's picks. The package implements it as the task-specific `position_repeat_rule` and `position_repeat_max`, and the adapter maps the spec's untranslated strings onto them (so the study presets S010 and S024 carry the rule), but the fixture's level 1 and level 2 runners do not exercise it: its values are untyped, so the cases are not attempted, and S010 and S024 are not `fully_typed`. The rule is covered by tests in `src/index.spec.ts` (real clicks: enforced switches the slot off, detect-and-remind shows a reminder, instructed adds an instruction page, and the only item left is never stuck in a switched-off slot).

**Languages.** `instruction_language` (Chinese, Portuguese, French) is not an option: the language of the instructions is the `text` option and no translation is bundled. S008, S009 and S019 therefore show a gap for that key.

**Representational drawings.** S024, S055 and S056 used drawings; no licensed set is bundled, so `stimulus_set.items: "representational_drawings"` throws and the value is a gap. Your own images go in `{ images: [...] }`.

**Not attempted.** `terminate_on_repeat` (S056, untyped, no count given) is deferred. IRT-CAT and ascending-until-fail (S040, S056) and the preschool protocol are gaps, not partial implementations.

**Shared checks not used.** The shared `response_keys` check assumes a key per response row, and this task has none (the response is a position on screen); the package has no key option, so the check is simply not in its fixture. The shared `response_device` check reads the response field for a number, so the contract points it at `chosen_position` (the slot), because `response` holds the item id. The shared `practice_trials` check counts rows, so the contract scopes it to the first page of each practice series (`practice_trials` counts series, not pages).
