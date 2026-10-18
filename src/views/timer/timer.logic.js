// Reine Timer-Logik ohne DOM/Seiteneffekte — unit-testbar.
// Keine Präsentationswerte (Farben etc.) hier — die leben in timer.css.

export const PREP_SECS = 10;

// Eine Quelle für die Ring-Geometrie: Umfang aus dem Radius abgeleitet,
// damit SVG-Radius, dasharray und dashOffset nie auseinanderlaufen.
export const RING_RADIUS = 138;
export const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Phasen-Inhalt (Label + Sub-Label). Farben gehören in timer.css (data-phase).
const CONTENT = {
  work:        { label: 'WORK',      sub: 'Gib alles' },
  rest:        { label: 'REST',      sub: 'Durchatmen' },
  'set-pause': { label: 'PAUSE',     sub: 'Satz geschafft – kurz durchatmen' },
  prep:        { label: 'GET READY', sub: 'Mach dich bereit' },
  done:        { label: 'DONE',      sub: 'Alle Sätze geschafft' },
};

// Phasen-Zustandsmaschine: aktueller Zustand + Konfiguration → Folgezustand.
// prep → work → (rest → work | set-pause → work) … → done.
// Liefert ein neues Zustandsobjekt; unbeteiligte Felder (z. B. paused) bleiben erhalten.
export function nextPhase(state, cfg) {
  const { phase, workIdx, setIdx } = state;

  if (phase === 'prep') {
    return { ...state, phase: 'work' };
  }
  if (phase === 'work') {
    const lastWork = workIdx >= cfg.numWork;
    const lastSet  = setIdx  >= cfg.numSets;
    if (lastWork && lastSet) return { ...state, phase: 'done' };
    if (lastWork)            return { ...state, phase: 'set-pause' };
    return { ...state, phase: 'rest' };
  }
  if (phase === 'rest') {
    return { ...state, phase: 'work', workIdx: workIdx + 1 };
  }
  if (phase === 'set-pause') {
    return { ...state, phase: 'work', setIdx: setIdx + 1, workIdx: 1 };
  }
  return state;
}

// Millisekunden → "m:ss", auf ganze Sekunden aufgerundet (wie Mockup fmt()).
export function formatMs(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Dauer einer Phase in Millisekunden.
export function phaseDurationMs(phase, cfg) {
  switch (phase) {
    case 'prep':      return PREP_SECS * 1000;
    case 'work':      return cfg.work * 1000;
    case 'rest':      return cfg.rest * 1000;
    case 'set-pause': return cfg.setPause * 1000;
    default:          return 0; // done
  }
}

// Fortschritt 0…1: prog = 1 - remaining/dur, geklemmt. dur ≤ 0 (done) → 1.
export function progress(remainingMs, durationMs) {
  if (durationMs <= 0) return 1;
  return Math.min(1, Math.max(0, 1 - remainingMs / durationMs));
}

// stroke-dashoffset des Fortschrittskreises.
export function dashOffset(prog) {
  return CIRCUMFERENCE * (1 - prog);
}

export function phaseVisual(phase) {
  return CONTENT[phase] ?? CONTENT.prep;
}

export function phaseLabel(phase) {
  return phaseVisual(phase).label;
}

// Füllgrad (0…1) je Segment-Balken (ein Balken pro Work-Runde des aktuellen Sets).
export function segmentFills(phase, workIdx, numWork, prog) {
  const out = [];
  for (let r = 1; r <= numWork; r++) {
    let fill;
    if (phase === 'prep') fill = 0;
    else if (phase === 'done' || phase === 'set-pause') fill = 1; // beendeter Set bleibt voll
    else if (r < workIdx) fill = 1;
    else if (r === workIdx) fill = phase === 'rest' ? 1 : prog;
    else fill = 0;
    out.push(fill);
  }
  return out;
}

const NEXT_SHORT = { work: 'Work', rest: 'Rest', 'set-pause': 'Pause' };
const NEXT_TONE  = { work: 'work', rest: 'rest', 'set-pause': 'pause' };

// „Als Nächstes"-Hinweis: Text + semantisches Tone-Token (Farbe kommt aus CSS).
export function nextInfo(state, cfg) {
  if (state.phase === 'done') return { text: 'Workout beendet', tone: 'dim' };
  const ns = nextPhase(state, cfg);
  if (ns.phase === 'done') return { text: 'Letzte Runde', tone: 'dim' };
  return {
    text: `Als Nächstes: ${NEXT_SHORT[ns.phase]} · ${formatMs(phaseDurationMs(ns.phase, cfg))}`,
    tone: NEXT_TONE[ns.phase],
  };
}
