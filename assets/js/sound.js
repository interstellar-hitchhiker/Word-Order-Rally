(function () {
  'use strict';

  let audioCtx = null;

  function getContext() {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    audioCtx = audioCtx || new AudioContext();
    return audioCtx;
  }

  function scheduleTone(ctx, type) {
    const now = ctx.currentTime + 0.006;
    const patterns = {
      tap: [[560, 0.045, 'sine', 0.075]],
      start: [[660, 0.07, 'triangle', 0.095], [880, 0.08, 'triangle', 0.080, 0.07]],
      resume: [[620, 0.08, 'triangle', 0.080]],
      warning: [[520, 0.13, 'square', 0.075]],
      tick: [[1180, 0.075, 'sine', 0.085]],
      end: [[220, 0.26, 'sawtooth', 0.090]],
      reveal: [[460, 0.13, 'triangle', 0.085], [620, 0.11, 'triangle', 0.070, 0.08]],
      wrong: [[150, 0.18, 'sawtooth', 0.085]],
      win: [[720, 0.09, 'triangle', 0.095], [960, 0.10, 'triangle', 0.085, 0.08], [1200, 0.13, 'triangle', 0.075, 0.17]]
    }[type] || [[440, 0.06, 'sine', 0.06]];

    for (const tone of patterns) {
      const [freq, dur, wave, volume, delay = 0] = tone;
      const start = now + delay;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = wave;
      osc.frequency.setValueAtTime(freq, start);
      if (type === 'end' || type === 'wrong') {
        osc.frequency.exponentialRampToValueAtTime(Math.max(70, freq * 0.55), start + dur);
      }
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur + 0.03);
    }
  }

  function beep(type, enabled) {
    if (!enabled) return;
    try {
      const ctx = getContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => scheduleTone(ctx, type)).catch(() => {});
      } else {
        scheduleTone(ctx, type);
      }
    } catch (err) {
      console.warn('Audio unavailable:', err);
    }
  }

  window.SSSSound = { beep };
}());
