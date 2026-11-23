/**
 * Sounds, made without audio files.
 *
 * The decision: every sound is computed as samples in plain functions (`Float32Array` out, no AudioContext needed),
 * then played as an `AudioBuffer` on jsPsych's audio context. The alternative, oscillator and noise nodes scheduled on the
 * audio clock, needs a running context to test anything and gives noise no exact level. Plain functions can be tested in jest
 * (RMS, SNR, ramps, antiphase), the noise is normalised to its exact RMS (so an SNR is exact), the whole trial is one buffer
 * (so the intervals are sample-accurate), and the same samples can be turned into a WAV file for an audio plugin.
 *
 * Randomness (the noise samples) comes in as a function (`jsPsych.randomization.sampleNormal`), so nothing here calls
 * `Math.random`. Everything runs from `on_load`, so data-only simulation draws no noise and needs no audio.
 *
 * Level convention: see `LEVEL_UNITS` in constants.ts. A tone at L dB FS has peak amplitude 10^(L/20); noise at L dB FS has RMS 10^(L/20)/sqrt(2).
 */
import type { JsPsych } from "jspsych";

import { AUDIO, HEADPHONE_SCREEN } from "./constants";

export type Gauss = () => number;

/** Peak amplitude of a sine at `db` dB FS (RMS convention: 0 dB FS is a full-scale sine). */
export const toneAmplitude = (db: number): number => Math.pow(10, db / 20);
/** Standard deviation (= RMS) of noise at `db` dB FS. */
export const noiseRms = (db: number): number => Math.pow(10, db / 20) / Math.SQRT2;

const samples = (ms: number, sampleRate: number) => Math.round((ms / 1000) * sampleRate);

/** Raised-cosine gain at sample i of an n-sample ramp (0 at the first sample, 1 at the last). */
const ramp = (i: number, n: number) =>
  n <= 1 ? 1 : Math.pow(Math.sin((Math.PI / 2) * (i / (n - 1))), 2);

export interface ToneSpec {
  sampleRate: number;
  frequency_hz: number;
  duration_ms: number;
  /** each of the rise and the fall, ms */
  ramp_ms: number;
  level_db: number;
}

/** A pure tone with raised-cosine (sin^2) ramps; the duration includes the ramps. */
export function renderTone(s: ToneSpec): Float32Array {
  const n = samples(s.duration_ms, s.sampleRate);
  const r = Math.min(samples(s.ramp_ms, s.sampleRate), Math.floor(n / 2));
  const amp = toneAmplitude(s.level_db);
  const out = new Float32Array(n);
  const w = (2 * Math.PI * s.frequency_hz) / s.sampleRate;
  for (let i = 0; i < n; i++) {
    let g = 1;
    if (i < r) g = ramp(i, r);
    else if (i >= n - r) g = ramp(n - 1 - i, r);
    out[i] = amp * g * Math.sin(w * i);
  }
  return out;
}

/**
 * Gaussian white noise with exactly the requested RMS (the samples are scaled after drawing, so the level of one burst does not
 * vary with the draw), with a raised-cosine fade at both ends.
 */
export function renderNoise(
  n: number,
  level_db: number,
  gauss: Gauss,
  fade_samples = 0
): Float32Array {
  const raw = new Float64Array(n);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    raw[i] = gauss();
    sum += raw[i] * raw[i];
  }
  const rms = n > 0 ? Math.sqrt(sum / n) : 1;
  const scale = rms > 0 ? noiseRms(level_db) / rms : 0;
  const out = new Float32Array(n);
  const f = Math.min(fade_samples, Math.floor(n / 2));
  for (let i = 0; i < n; i++) {
    let g = 1;
    if (i < f) g = ramp(i, f);
    else if (i >= n - f) g = ramp(n - 1 - i, f);
    out[i] = raw[i] * scale * g;
  }
  return out;
}

export const rms = (x: Float32Array, from = 0, to = x.length): number => {
  let s = 0;
  for (let i = from; i < to; i++) s += x[i] * x[i];
  return to > from ? Math.sqrt(s / (to - from)) : 0;
};

export const peakOf = (channels: Float32Array[]): number => {
  let p = 0;
  for (const c of channels) for (let i = 0; i < c.length; i++) p = Math.max(p, Math.abs(c[i]));
  return p;
};

/** Level of a signal in dB FS (RMS convention). */
export const levelDb = (x: Float32Array, from = 0, to = x.length): number =>
  20 * Math.log10(Math.max(rms(x, from, to) * Math.SQRT2, 1e-12));

export interface TrialSoundSpec {
  sampleRate: number;
  n_intervals: number;
  /** 1-based; the interval that holds the tone */
  target_interval: number;
  frequency_hz: number;
  tone_ms: number;
  ramp_ms: number;
  isi_ms: number;
  /** level of the tone, dB FS */
  tone_db: number;
  /** level of the masker, dB FS; null for quiet */
  masker_db: number | null;
}

/** Start and end of each interval of a trial sound, ms from the start of the sound (a lead-in, then tones and gaps). */
export function trialIntervals(
  n_intervals: number,
  tone_ms: number,
  isi_ms: number
): Array<{ start_ms: number; end_ms: number }> {
  const out: Array<{ start_ms: number; end_ms: number }> = [];
  let t = AUDIO.masker_lead_ms;
  for (let i = 0; i < n_intervals; i++) {
    out.push({ start_ms: t, end_ms: t + tone_ms });
    t += tone_ms + isi_ms;
  }
  return out;
}

/** The same for the headphone screen: no lead-in. */
export function headphoneIntervals(
  n_intervals: number
): Array<{ start_ms: number; end_ms: number }> {
  const out: Array<{ start_ms: number; end_ms: number }> = [];
  let t = 0;
  for (let i = 0; i < n_intervals; i++) {
    out.push({ start_ms: t, end_ms: t + HEADPHONE_SCREEN.tone_ms });
    t += HEADPHONE_SCREEN.tone_ms + HEADPHONE_SCREEN.gap_ms;
  }
  return out;
}

export interface TrialSound {
  channels: Float32Array[];
  /** start and end of each interval within the sound, ms */
  intervals: Array<{ start_ms: number; end_ms: number }>;
  /** length of the sound, ms: the last interval ends here */
  total_ms: number;
  /** largest absolute sample before limiting */
  peak: number;
  /** the whole sound was scaled down because it would have clipped (the SNR is unchanged) */
  limited: boolean;
}

/**
 * One trial: a lead-in, then `n_intervals` intervals `tone_ms` long separated by `isi_ms`, the tone in the target interval. The masker (if any)
 * plays through the whole sound, ramped at both ends. The sound ends with the last interval.
 */
export function renderTrialSound(s: TrialSoundSpec, gauss: Gauss): TrialSound {
  const intervals = trialIntervals(s.n_intervals, s.tone_ms, s.isi_ms);
  const total_ms = intervals[intervals.length - 1].end_ms;
  const n = samples(total_ms, s.sampleRate);
  const out =
    s.masker_db === null
      ? new Float32Array(n)
      : renderNoise(n, s.masker_db, gauss, samples(AUDIO.masker_fade_ms, s.sampleRate));
  const tone = renderTone({
    sampleRate: s.sampleRate,
    frequency_hz: s.frequency_hz,
    duration_ms: s.tone_ms,
    ramp_ms: s.ramp_ms,
    level_db: s.tone_db,
  });
  const at = samples(intervals[s.target_interval - 1].start_ms, s.sampleRate);
  for (let i = 0; i < tone.length && at + i < n; i++) out[at + i] += tone[i];
  const peak = peakOf([out]);
  const limited = peak > 1;
  if (limited) for (let i = 0; i < n; i++) out[i] /= peak;
  return { channels: [out], intervals, total_ms, peak, limited };
}

export type HeadphoneToneKind = "target" | "foil" | "antiphase";

export interface HeadphoneSoundSpec {
  sampleRate: number;
  /** what each of the three intervals holds, in order */
  kinds: HeadphoneToneKind[];
}

/**
 * The antiphase screen (Woods et al., 2017): three tones, one in-phase 6 dB quieter than the others (the target, the quietest over
 * headphones), one in-phase at full level, one in antiphase between the ears at full level (over loudspeakers its sound cancels
 * and it is the quietest). Stereo: the antiphase tone has the right channel inverted.
 */
export function renderHeadphoneSound(s: HeadphoneSoundSpec): TrialSound {
  const H = HEADPHONE_SCREEN;
  const intervals = headphoneIntervals(s.kinds.length);
  const total_ms = intervals[intervals.length - 1].end_ms;
  const n = samples(total_ms, s.sampleRate);
  const left = new Float32Array(n);
  const right = new Float32Array(n);
  s.kinds.forEach((kind, k) => {
    const tone = renderTone({
      sampleRate: s.sampleRate,
      frequency_hz: H.frequency_hz,
      duration_ms: H.tone_ms,
      ramp_ms: H.ramp_ms,
      level_db: H.level_db - (kind === "target" ? H.target_attenuation_db : 0),
    });
    const at = samples(intervals[k].start_ms, s.sampleRate);
    for (let i = 0; i < tone.length && at + i < n; i++) {
      left[at + i] = tone[i];
      right[at + i] = kind === "antiphase" ? -tone[i] : tone[i];
    }
  });
  return {
    channels: [left, right],
    intervals,
    total_ms,
    peak: peakOf([left, right]),
    limited: false,
  };
}

/** A loopable calibration sound: noise (no audible seam when white noise repeats) or a whole number of tone cycles. */
export function renderCalibrationSound(
  sampleRate: number,
  sound: "noise" | "tone",
  level_db: number,
  frequency_hz: number,
  gauss: Gauss
): Float32Array {
  const seconds = AUDIO.calibration_loop_s;
  if (sound === "noise") return renderNoise(Math.round(seconds * sampleRate), level_db, gauss);
  const cycles = Math.max(1, Math.round(frequency_hz * seconds));
  const n = Math.round((cycles / frequency_hz) * sampleRate);
  const out = new Float32Array(n);
  const amp = toneAmplitude(level_db);
  const w = (2 * Math.PI * cycles) / n;
  for (let i = 0; i < n; i++) out[i] = amp * Math.sin(w * i);
  return out;
}

/** The samples as a 16-bit mono or stereo WAV file (for jsPsych's audio plugins or a download). */
export function toWav(channels: Float32Array[], sampleRate: number): Uint8Array {
  const n = channels[0].length;
  const nCh = channels.length;
  const bytes = new Uint8Array(44 + n * nCh * 2);
  const v = new DataView(bytes.buffer);
  const str = (o: number, t: string) =>
    [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  str(0, "RIFF");
  v.setUint32(4, 36 + n * nCh * 2, true);
  str(8, "WAVE");
  str(12, "fmt ");
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, nCh, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * nCh * 2, true);
  v.setUint16(32, nCh * 2, true);
  v.setUint16(34, 16, true);
  str(36, "data");
  v.setUint32(40, n * nCh * 2, true);
  let o = 44;
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < nCh; c++) {
      const x = Math.max(-1, Math.min(1, channels[c][i]));
      v.setInt16(o, Math.round(x * 32767), true);
      o += 2;
    }
  }
  return bytes;
}

// -- player -------------------------------------------------------------------------------------

/** What the audio context was doing when a sound was started: `running`, `suspended`, `closed`, `interrupted`, or `none` (no Web Audio). */
export const AUDIO_NONE = "none";
/** There is an audio context but no sound was started (a simulated or interrupted trial). */
export const AUDIO_UNPLAYED = "unplayed";

export interface Playback {
  /** state of the audio context when the sound started; the data never claim a tone that was not heard */
  state: string;
  /** audio clock time the sound was scheduled at, s (null without audio) */
  scheduled_at: number | null;
  stop: () => void;
}

const silent: Playback = { state: AUDIO_NONE, scheduled_at: null, stop: () => {} };

/** jsPsych's audio context, or null when the page has none (jsdom, `use_webaudio: false`). */
export function audioContextOf(jsPsych: JsPsych): AudioContext | null {
  try {
    const ctx = (jsPsych.pluginAPI as any).audioContext?.() as AudioContext | null | undefined;
    return ctx ?? null;
  } catch {
    return null;
  }
}

/** Sample rate sounds should be made at: the context's own, or null without audio. */
export function audioSampleRate(jsPsych: JsPsych): number | null {
  const ctx = audioContextOf(jsPsych);
  return ctx && typeof ctx.sampleRate === "number" ? ctx.sampleRate : null;
}

/**
 * Play samples on jsPsych's audio context, starting `AUDIO.start_delay_ms` from now (or looping until `stop()`). Call it from `on_load`
 * (after a click on an earlier page, the browser lets the context run; it is resumed here). With no audio it does nothing and says so.
 */
export function play(
  jsPsych: JsPsych,
  channels: Float32Array[],
  opts: { loop?: boolean } = {}
): Playback {
  try {
    const ctx = audioContextOf(jsPsych);
    if (!ctx) return silent;
    if (ctx.state === "suspended") void ctx.resume();
    const buffer = ctx.createBuffer(channels.length, channels[0].length, ctx.sampleRate);
    channels.forEach((c, i) => buffer.copyToChannel(c as Float32Array<ArrayBuffer>, i));
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = opts.loop === true;
    source.connect(ctx.destination);
    const at = ctx.currentTime + AUDIO.start_delay_ms / 1000;
    source.start(at);
    return {
      state: ctx.state,
      scheduled_at: at,
      stop: () => {
        try {
          source.stop();
          source.disconnect();
        } catch {
          // already stopped
        }
      },
    };
  } catch {
    return silent;
  }
}
