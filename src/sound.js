// =============================================================
// SOUND — play(name) plays a theme sound, or makes a small beep
// if no sound is loaded. iOS Safari needs a first user tap to
// unlock audio; we handle that with unlockAudio().
// =============================================================

import { soundClip } from "./assets.js";

let audioCtx = null;
let unlocked = false;

export function unlockAudio() {
  if (unlocked) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // Play a silent buffer so iOS marks audio as user-initiated.
    const buf = audioCtx.createBuffer(1, 1, 22050);
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(audioCtx.destination);
    src.start(0);
    unlocked = true;
  } catch {
    /* no-op */
  }
}

export function play(name) {
  const clip = soundClip(name);
  if (clip) {
    try {
      const copy = clip.cloneNode();
      copy.volume = 0.7;
      copy.play().catch(() => {});
      return;
    } catch {
      /* fall through to beep */
    }
  }
  beep(name);
}

// Tiny built-in fallback so the game has SOME audio even with no files.
function beep(name) {
  if (!audioCtx) return;
  const freq = name === "eat" ? 660 : name === "crash" ? 110 : 440;
  const dur = name === "crash" ? 0.35 : 0.08;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = name === "crash" ? "sawtooth" : "square";
  osc.frequency.value = freq;
  gain.gain.value = 0.15;
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + dur);
}
