---
"@jspsych-timelines/tone-detection": minor
---

New timeline for pure-tone detection (the first auditory package). The anchor is the online tone-in-noise protocol of Zhao et al. (2022): a three-interval forced choice with a 1 kHz, 250 ms tone in white noise, a 3-down/1-up staircase in dB SNR, a volume-setting screen, a headphone check (Woods et al. antiphase screen) and a walkthrough. Sounds are synthesised with the Web Audio API (no audio files). Also: detection in quiet, two-interval trials, several frequencies as conditions, fixed levels, practice criterion, and the threshold from the last n reversals, the mode or the final level.
