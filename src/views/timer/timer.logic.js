// Reine Timer-Logik ohne DOM/Seiteneffekte — unit-testbar.

// Phasen-Zustandsmaschine: aktueller Zustand + Konfiguration → Folgezustand.
// prep → work → (rest → work | set-pause → work) … → done.
// Liefert ein neues Zustandsobjekt; unbeteiligte Felder (z. B. paused) bleiben erhalten.
export function nextPhase(state, cfg) {
  const { phase, workIdx, setIdx } = state;

  if (phase === 'prep') {
    return { ...state, phase: 'work', timeLeft: cfg.work };
  }
  if (phase === 'work') {
    const lastWork = workIdx >= cfg.numWork;
    const lastSet  = setIdx  >= cfg.numSets;
    if (lastWork && lastSet) return { ...state, phase: 'done' };
    if (lastWork)            return { ...state, phase: 'set-pause', timeLeft: cfg.setPause };
    return { ...state, phase: 'rest', timeLeft: cfg.rest };
  }
  if (phase === 'rest') {
    return { ...state, phase: 'work', timeLeft: cfg.work, workIdx: workIdx + 1 };
  }
  if (phase === 'set-pause') {
    return { ...state, phase: 'work', timeLeft: cfg.work, setIdx: setIdx + 1, workIdx: 1 };
  }
  return state;
}

// Sekunden → "m:ss".
export function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
