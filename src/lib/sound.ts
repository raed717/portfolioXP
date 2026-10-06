/**
 * System sounds (THEME_CONTEXT.md §7.1), synthesized with the Web Audio API: original by
 * construction, zero bytes to download. The AudioContext is created lazily on the first sound,
 * which only ever happens after a user gesture. Respects the mute preference everywhere.
 */
import { usePreferences } from "@/store/preferences";

export type SoundName = "startup" | "shutdown" | "click" | "open" | "close" | "error" | "notify";

type Note = { freq: number; at: number; dur: number; type?: OscillatorType; gain?: number };

const SOUNDS: Record<SoundName, Note[]> = {
  // A warm rising arpeggio (C major add9).
  startup: [
    { freq: 261.63, at: 0, dur: 0.9, type: "triangle", gain: 0.18 },
    { freq: 329.63, at: 0.12, dur: 0.8, type: "triangle", gain: 0.16 },
    { freq: 392.0, at: 0.24, dur: 0.7, type: "triangle", gain: 0.15 },
    { freq: 587.33, at: 0.36, dur: 0.9, type: "sine", gain: 0.12 },
  ],
  shutdown: [
    { freq: 587.33, at: 0, dur: 0.6, type: "sine", gain: 0.12 },
    { freq: 392.0, at: 0.14, dur: 0.6, type: "triangle", gain: 0.14 },
    { freq: 261.63, at: 0.28, dur: 0.9, type: "triangle", gain: 0.16 },
  ],
  click: [{ freq: 1800, at: 0, dur: 0.03, type: "square", gain: 0.04 }],
  open: [
    { freq: 660, at: 0, dur: 0.08, type: "sine", gain: 0.08 },
    { freq: 990, at: 0.05, dur: 0.1, type: "sine", gain: 0.06 },
  ],
  close: [
    { freq: 880, at: 0, dur: 0.08, type: "sine", gain: 0.07 },
    { freq: 587.33, at: 0.05, dur: 0.1, type: "sine", gain: 0.06 },
  ],
  error: [
    { freq: 523.25, at: 0, dur: 0.18, type: "triangle", gain: 0.16 },
    { freq: 392.0, at: 0.16, dur: 0.3, type: "triangle", gain: 0.16 },
  ],
  notify: [
    { freq: 783.99, at: 0, dur: 0.15, type: "sine", gain: 0.1 },
    { freq: 1046.5, at: 0.12, dur: 0.25, type: "sine", gain: 0.09 },
  ],
};

let context: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (context) return context;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    context = Ctor ? new Ctor() : null;
  } catch {
    context = null;
  }
  return context;
}

/** Plays a system sound if sounds are enabled. Never throws. */
export function playSound(name: SoundName, { force = false } = {}): void {
  if (!force && !usePreferences.getState().soundEnabled) return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") void ctx.resume();
    const start = ctx.currentTime + 0.01;
    for (const note of SOUNDS[name]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = note.type ?? "sine";
      osc.frequency.value = note.freq;
      const t0 = start + note.at;
      const peak = note.gain ?? 0.1;
      // Short attack and exponential release so notes don't click.
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + note.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + note.dur + 0.05);
    }
  } catch {
    // Audio is decoration; failures are silent.
  }
}
