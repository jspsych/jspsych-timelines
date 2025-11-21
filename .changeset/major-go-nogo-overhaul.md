---
"@jspsych-timelines/go-nogo": major
---

Major overhaul of instructions and practice system:
- Instructions are now interactive examples with feedback (old practice trials)
- Practice is now a full block matching main task format with configurable num_practice_trials and practice_probability
- Added end of practice screen with parameterized text
- Simplified phase data variable to use only "instructions", "practice", "main", and "debrief"
- Phase is now set at timeline level instead of individual trials
