// Audio (Beep/Countdown/Finish) + Wake-Lock — aus index.html ausgelagert.

let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  // iOS setzt den Kontext beim Gerätesperren auf 'interrupted' (nicht 'suspended') — beide reaktivieren
  if (audioCtx.state === 'suspended' || audioCtx.state === 'interrupted') audioCtx.resume();
  return audioCtx;
}

export function unlockAudio() {
  try {
    const ctx = getAudioCtx();
    const buf = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start(0);
  } catch (_) {}
}

export function playBeep(freq, dur) {
  try {
    const ctx  = getAudioCtx();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = freq;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur);
  } catch (_) {}
}

export function playFinish() {
  [0, 0.18, 0.36].forEach(t => {
    setTimeout(() => playBeep(660, 0.2), t * 1000);
  });
}

// ── Wake Lock ──
let wakeLock = null;

export async function requestWakeLock() {
  if (!('wakeLock' in navigator)) return;
  try { wakeLock = await navigator.wakeLock.request('screen'); } catch (_) {}
}

export function releaseWakeLock() {
  if (wakeLock) { wakeLock.release(); wakeLock = null; }
}
