import { initJsPsych } from "jspsych";

import {
  AUDIO_NONE,
  audioSampleRate,
  headphoneIntervals,
  levelDb,
  noiseRms,
  peakOf,
  play,
  renderCalibrationSound,
  renderHeadphoneSound,
  renderNoise,
  renderTone,
  renderTrialSound,
  rms,
  toWav,
  toneAmplitude,
  trialIntervals,
} from "./audio";
import { AUDIO, HEADPHONE_SCREEN } from "./constants";

const RATE = 48000;
const seededGauss = () => {
  const jsPsych = initJsPsych();
  jsPsych.randomization.setSeed("audio");
  return () => jsPsych.randomization.sampleNormal(0, 1);
};

describe("level convention: dB re full scale, RMS, 0 dB = a full-scale sine", () => {
  it("a tone at L dB has peak 10^(L/20) and RMS peak / sqrt(2)", () => {
    const x = renderTone({
      sampleRate: RATE,
      frequency_hz: 1000,
      duration_ms: 1000,
      ramp_ms: 0,
      level_db: -20,
    });
    expect(peakOf([x])).toBeCloseTo(toneAmplitude(-20), 3);
    expect(levelDb(x)).toBeCloseTo(-20, 2);
    expect(rms(x)).toBeCloseTo(toneAmplitude(-20) / Math.SQRT2, 4);
  });

  it("noise has exactly the requested RMS, whatever the draw", () => {
    const g = seededGauss();
    for (const level of [-10, -20, -35]) {
      const x = renderNoise(RATE, level, g);
      expect(levelDb(x)).toBeCloseTo(level, 3);
      expect(rms(x)).toBeCloseTo(noiseRms(level), 5);
    }
  });
});

describe("renderTone", () => {
  const spec = {
    sampleRate: RATE,
    frequency_hz: 1000,
    duration_ms: 250,
    ramp_ms: 10,
    level_db: -10,
  };

  it("lasts the duration, ramps included", () => {
    expect(renderTone(spec)).toHaveLength(Math.round(0.25 * RATE));
  });

  it("starts and ends silent and reaches full amplitude after the ramp (raised cosine)", () => {
    const x = renderTone(spec);
    const ramp = Math.round(0.01 * RATE);
    expect(Math.abs(x[0])).toBeLessThan(1e-6);
    expect(Math.abs(x[x.length - 1])).toBeLessThan(1e-3);
    const mid = x.slice(ramp + 10, x.length - ramp - 10);
    expect(peakOf([mid])).toBeCloseTo(toneAmplitude(-10), 2);
    // the envelope rises monotonically through the ramp
    let prev = 0;
    for (let k = 1; k < ramp; k += Math.round(RATE / 4000)) {
      const env = peakOf([x.slice(Math.max(0, k - 24), k + 24)]);
      expect(env).toBeGreaterThanOrEqual(prev - 1e-3);
      prev = env;
    }
  });

  it("has no ramp when ramp_ms is 0, and clamps a ramp longer than half the tone", () => {
    const sharp = renderTone({ ...spec, ramp_ms: 0 });
    expect(peakOf([sharp.slice(0, 40)])).toBeGreaterThan(0.1);
    const long = renderTone({ ...spec, ramp_ms: 1000 });
    expect(long).toHaveLength(Math.round(0.25 * RATE));
    expect(peakOf([long])).toBeLessThanOrEqual(toneAmplitude(-10) + 1e-6);
  });

  it("is the requested frequency (zero crossings)", () => {
    const x = renderTone({ ...spec, ramp_ms: 0, duration_ms: 1000, frequency_hz: 500 });
    let crossings = 0;
    for (let i = 1; i < x.length; i++) if (x[i - 1] < 0 && x[i] >= 0) crossings++;
    expect(Math.abs(crossings - 500)).toBeLessThanOrEqual(1);
  });
});

describe("renderTrialSound", () => {
  const base = {
    sampleRate: RATE,
    n_intervals: 3,
    target_interval: 2,
    frequency_hz: 1000,
    tone_ms: 250,
    ramp_ms: 10,
    isi_ms: 250,
    tone_db: -30,
    masker_db: -20,
  };

  it("places three intervals after the lead-in, separated by the gap, and ends with the last", () => {
    const s = renderTrialSound(base, seededGauss());
    expect(s.intervals).toEqual(trialIntervals(3, 250, 250));
    expect(s.intervals[0].start_ms).toBe(AUDIO.masker_lead_ms);
    expect(s.intervals[1].start_ms - s.intervals[0].end_ms).toBe(250);
    expect(s.total_ms).toBe(s.intervals[2].end_ms);
    expect(s.channels[0]).toHaveLength(Math.round((s.total_ms / 1000) * RATE));
  });

  it("the masker is continuous through the whole sound; its level is exact outside the tone", () => {
    const s = renderTrialSound({ ...base, target_interval: 3 }, seededGauss());
    const x = s.channels[0];
    const iv = s.intervals;
    const at = (ms: number) => Math.round((ms / 1000) * RATE);
    // interval 1 and the gap before it hold only the masker, at its exact level (the fades are only at the ends)
    expect(levelDb(x, at(iv[0].start_ms), at(iv[1].end_ms))).toBeCloseTo(-20, 0);
    // and the gap between interval 2 and 3 is not silent
    expect(rms(x, at(iv[1].end_ms) + 100, at(iv[2].start_ms) - 100)).toBeGreaterThan(
      noiseRms(-20) * 0.9
    );
  });

  it("the tone is in the target interval only, at the requested SNR", () => {
    const withTone = renderTrialSound({ ...base, target_interval: 2 }, seededGauss());
    const without = renderTrialSound({ ...base, tone_db: -200, target_interval: 2 }, seededGauss());
    const at = (ms: number) => Math.round((ms / 1000) * RATE);
    const [i1, i2, i3] = withTone.intervals;
    // same noise draw (same seed), so the difference is the tone
    const tone = new Float32Array(withTone.channels[0].length);
    for (let i = 0; i < tone.length; i++)
      tone[i] = withTone.channels[0][i] - without.channels[0][i];
    expect(rms(tone, at(i1.start_ms), at(i1.end_ms))).toBeLessThan(1e-6);
    expect(rms(tone, at(i3.start_ms), at(i3.end_ms))).toBeLessThan(1e-6);
    // inside the interval the tone's level (skipping the ramps) is -30 dB FS and the SNR is -30 - -20 = -10 dB
    const inner = [at(i2.start_ms) + at(15), at(i2.end_ms) - at(15)] as const;
    expect(levelDb(tone, inner[0], inner[1])).toBeCloseTo(-30, 1);
    // SNR: the tone's level re the masker's level measured in a tone-free interval of the same sound
    const snr =
      levelDb(tone, inner[0], inner[1]) -
      levelDb(withTone.channels[0], at(i1.start_ms), at(i1.end_ms));
    expect(snr).toBeCloseTo(-10, 0);
  });

  it("in quiet the other intervals are silent", () => {
    const s = renderTrialSound({ ...base, masker_db: null, tone_db: -40 }, seededGauss());
    const at = (ms: number) => Math.round((ms / 1000) * RATE);
    expect(rms(s.channels[0], 0, at(s.intervals[1].start_ms) - 10)).toBe(0);
    expect(
      rms(s.channels[0], at(s.intervals[1].start_ms) + at(20), at(s.intervals[1].end_ms) - at(20))
    ).toBeGreaterThan(0);
    expect(s.limited).toBe(false);
  });

  it("scales the whole sound down when it would clip, and says so", () => {
    const s = renderTrialSound({ ...base, masker_db: -3, tone_db: 0 }, seededGauss());
    expect(s.limited).toBe(true);
    expect(s.peak).toBeGreaterThan(1);
    expect(peakOf(s.channels)).toBeLessThanOrEqual(1 + 1e-6);
  });

  it("does not call Math.random: the noise comes from the function it is given", () => {
    const spy = jest.spyOn(Math, "random");
    let calls = 0;
    renderTrialSound(base, () => {
      calls++;
      return 0.5 - (calls % 2);
    });
    expect(spy).not.toHaveBeenCalled();
    expect(calls).toBeGreaterThan(1000);
    spy.mockRestore();
  });
});

describe("renderHeadphoneSound (the antiphase screen)", () => {
  const sound = renderHeadphoneSound({ sampleRate: RATE, kinds: ["foil", "target", "antiphase"] });
  const [L, R] = sound.channels;
  const at = (ms: number) => Math.round((ms / 1000) * RATE);

  it("is stereo with three tones of the screen's duration and gap", () => {
    expect(sound.channels).toHaveLength(2);
    expect(sound.intervals).toEqual(headphoneIntervals(3));
    expect(sound.intervals[1].start_ms - sound.intervals[0].end_ms).toBe(HEADPHONE_SCREEN.gap_ms);
  });

  it("the target is in phase and 6 dB quieter than the in-phase foil", () => {
    const [i1, i2] = sound.intervals;
    const mid = (iv: { start_ms: number; end_ms: number }) =>
      [at(iv.start_ms + 100), at(iv.end_ms - 100)] as const;
    const foil = levelDb(L, ...mid(i1));
    const target = levelDb(L, ...mid(i2));
    expect(foil - target).toBeCloseTo(HEADPHONE_SCREEN.target_attenuation_db, 1);
    // in phase: the channels are identical
    for (let i = at(i2.start_ms); i < at(i2.end_ms); i += 97) expect(R[i]).toBe(L[i]);
  });

  it("the antiphase tone has the right channel inverted, at the foil's level", () => {
    const i3 = sound.intervals[2];
    for (let i = at(i3.start_ms); i < at(i3.end_ms); i += 97) expect(R[i]).toBeCloseTo(-L[i], 7);
    expect(levelDb(L, at(i3.start_ms + 100), at(i3.end_ms - 100))).toBeCloseTo(
      HEADPHONE_SCREEN.level_db,
      1
    );
    // summed to mono (loudspeakers in a room, roughly) the antiphase tone cancels: it is then the quietest
    const mono = L.map((v, i) => v + R[i]);
    const mid = (iv: { start_ms: number; end_ms: number }) =>
      rms(mono, at(iv.start_ms + 100), at(iv.end_ms - 100));
    expect(mid(sound.intervals[2])).toBeLessThan(mid(sound.intervals[1]) * 1e-3);
  });
});

describe("calibration sound and WAV", () => {
  it("noise loops at its level; a tone holds a whole number of cycles", () => {
    const n = renderCalibrationSound(RATE, "noise", -60, 1000, seededGauss());
    expect(n).toHaveLength(AUDIO.calibration_loop_s * RATE);
    expect(levelDb(n)).toBeCloseTo(-60, 2);
    const t = renderCalibrationSound(RATE, "tone", -50, 1000, seededGauss());
    expect(levelDb(t)).toBeCloseTo(-50, 1);
    // the last sample and the first are neighbours on the sine
    expect(Math.abs(t[t.length - 1])).toBeLessThan(toneAmplitude(-50) * 0.2);
  });

  it("toWav writes a 16-bit PCM header and clips at full scale", () => {
    const wav = toWav([Float32Array.from([0, 0.5, -0.5, 2])], 8000);
    const v = new DataView(wav.buffer);
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe("RIFF");
    expect(String.fromCharCode(...wav.slice(8, 12))).toBe("WAVE");
    expect(v.getUint16(22, true)).toBe(1);
    expect(v.getUint32(24, true)).toBe(8000);
    expect(v.getUint16(34, true)).toBe(16);
    expect(v.getInt16(44 + 6, true)).toBe(32767);
    const stereo = toWav([new Float32Array(3), new Float32Array(3)], 8000);
    expect(new DataView(stereo.buffer).getUint16(22, true)).toBe(2);
    expect(stereo).toHaveLength(44 + 3 * 2 * 2);
  });
});

describe("the player without Web Audio (jsdom)", () => {
  it("does nothing and says so", () => {
    const jsPsych = initJsPsych();
    expect(audioSampleRate(jsPsych)).toBeNull();
    const p = play(jsPsych, [new Float32Array(10)]);
    expect(p.state).toBe(AUDIO_NONE);
    expect(p.scheduled_at).toBeNull();
    expect(() => p.stop()).not.toThrow();
  });

  it("schedules a buffer on the context at the context's sample rate when there is one", () => {
    const jsPsych = initJsPsych();
    const started: any[] = [];
    const ctx: any = {
      state: "running",
      sampleRate: 44100,
      currentTime: 2,
      destination: {},
      resume: jest.fn(),
      createBuffer: (ch: number, len: number, rate: number) => ({
        ch,
        len,
        rate,
        copyToChannel: jest.fn(),
      }),
      createBufferSource: () => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        start: (t: number) => started.push(t),
        stop: jest.fn(),
        loop: false,
        buffer: null,
      }),
    };
    (jsPsych.pluginAPI as any).audioContext = () => ctx;
    expect(audioSampleRate(jsPsych)).toBe(44100);
    const p = play(jsPsych, [new Float32Array(100), new Float32Array(100)]);
    expect(p.state).toBe("running");
    expect(started[0]).toBeCloseTo(2 + AUDIO.start_delay_ms / 1000, 6);
    p.stop();
  });
});
