import { describe, it, expect } from 'vitest';
import {
  nextPhase, formatTime,
  formatMs, phaseDurationMs, progress, dashOffset, CIRCUMFERENCE, PREP_SECS,
  phaseLabel, phaseVisual, segmentFills, segmentColor, nextInfo,
} from './timer.logic.js';

const cfg = { work: 45, rest: 90, numWork: 3, numSets: 2, setPause: 180 };
const base = { phase: 'prep', timeLeft: 10, workIdx: 1, setIdx: 1, paused: false };

describe('nextPhase', () => {
  it('prep → work', () => {
    expect(nextPhase({ ...base, phase: 'prep' }, cfg)).toMatchObject({ phase: 'work', timeLeft: 45 });
  });
  it('work → rest, wenn weitere Work-Intervalle folgen', () => {
    expect(nextPhase({ ...base, phase: 'work', workIdx: 1 }, cfg)).toMatchObject({ phase: 'rest', timeLeft: 90 });
  });
  it('rest → work und erhöht workIdx', () => {
    expect(nextPhase({ ...base, phase: 'rest', workIdx: 1 }, cfg))
      .toMatchObject({ phase: 'work', timeLeft: 45, workIdx: 2 });
  });
  it('letztes Work im Set (nicht letztes Set) → set-pause', () => {
    expect(nextPhase({ ...base, phase: 'work', workIdx: 3, setIdx: 1 }, cfg))
      .toMatchObject({ phase: 'set-pause', timeLeft: 180 });
  });
  it('set-pause → work, erhöht setIdx und setzt workIdx zurück', () => {
    expect(nextPhase({ ...base, phase: 'set-pause', workIdx: 3, setIdx: 1 }, cfg))
      .toMatchObject({ phase: 'work', timeLeft: 45, setIdx: 2, workIdx: 1 });
  });
  it('letztes Work im letzten Set → done', () => {
    expect(nextPhase({ ...base, phase: 'work', workIdx: 3, setIdx: 2 }, cfg)).toMatchObject({ phase: 'done' });
  });
  it('erhält unbeteiligte Felder (paused)', () => {
    expect(nextPhase({ ...base, phase: 'prep', paused: true }, cfg).paused).toBe(true);
  });
});

describe('formatTime', () => {
  it('formatiert Sekunden als m:ss mit führender Null', () => {
    expect(formatTime(90)).toBe('1:30');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(0)).toBe('0:00');
    expect(formatTime(600)).toBe('10:00');
  });
});

// ── Mockup-Redesign: portierte Formeln (Anforderung 13) ──────────
// Werte wörtlich aus anforderungen/mockups/timer/Timer.dc.html (renderVals()).

describe('formatMs', () => {
  it('rundet ms per ceil auf ganze Sekunden (wie Mockup fmt)', () => {
    expect(formatMs(9500)).toBe('0:10');   // ceil(9.5) = 10
    expect(formatMs(90000)).toBe('1:30');
    expect(formatMs(4001)).toBe('0:05');   // ceil(4.001) = 5
    expect(formatMs(0)).toBe('0:00');
    expect(formatMs(-50)).toBe('0:00');    // max(0, …)
  });
});

describe('phaseDurationMs', () => {
  it('liefert die Phasendauer in ms aus cfg', () => {
    expect(phaseDurationMs('prep', cfg)).toBe(PREP_SECS * 1000);
    expect(phaseDurationMs('work', cfg)).toBe(45000);
    expect(phaseDurationMs('rest', cfg)).toBe(90000);
    expect(phaseDurationMs('set-pause', cfg)).toBe(180000);
    expect(phaseDurationMs('done', cfg)).toBe(0);
  });
});

describe('progress', () => {
  it('prog = 1 - remaining/dur, geklemmt auf [0,1]', () => {
    expect(progress(45000, 45000)).toBe(0);     // Phasenstart
    expect(progress(22500, 45000)).toBeCloseTo(0.5, 5);
    expect(progress(0, 45000)).toBe(1);         // Phasenende
    expect(progress(50000, 45000)).toBe(0);     // remaining > dur → 0
    expect(progress(100, 0)).toBe(1);           // dur 0 (done) → 1
  });
});

describe('dashOffset', () => {
  it('dashOffset = CIRCUMFERENCE * (1 - prog)', () => {
    expect(CIRCUMFERENCE).toBeCloseTo(867.08, 2);
    expect(dashOffset(0)).toBeCloseTo(867.08, 2);
    expect(dashOffset(1)).toBeCloseTo(0, 2);
    expect(dashOffset(0.5)).toBeCloseTo(433.54, 2);
  });
});

describe('phaseLabel', () => {
  it('Anzeige-Labels inkl. GET READY/PAUSE/DONE', () => {
    expect(phaseLabel('work')).toBe('WORK');
    expect(phaseLabel('rest')).toBe('REST');
    expect(phaseLabel('set-pause')).toBe('PAUSE');
    expect(phaseLabel('prep')).toBe('GET READY');
    expect(phaseLabel('done')).toBe('DONE');
  });
});

describe('phaseVisual', () => {
  it('Work: rote Akzentfarbe, dunkelwarmer Hintergrund', () => {
    expect(phaseVisual('work')).toMatchObject({
      accent: 'oklch(0.78 0.16 55)', bg: 'oklch(0.21 0.045 50)', label: 'WORK', sub: 'Gib alles',
    });
  });
  it('Rest: grüne Akzentfarbe', () => {
    expect(phaseVisual('rest')).toMatchObject({
      accent: 'oklch(0.78 0.16 150)', bg: 'oklch(0.21 0.045 155)', label: 'REST', sub: 'Durchatmen',
    });
  });
  it('Set-Pause: grün wie Rest, eigenes Label/Sub-Label', () => {
    expect(phaseVisual('set-pause')).toMatchObject({
      accent: 'oklch(0.78 0.16 150)', bg: 'oklch(0.21 0.045 155)', label: 'PAUSE',
      sub: 'Satz geschafft – kurz durchatmen',
    });
  });
  it('Prep: neutraler Akzent, Label GET READY', () => {
    expect(phaseVisual('prep')).toMatchObject({
      accent: 'oklch(0.85 0.02 150)', bg: 'oklch(0.18 0.01 150)', label: 'GET READY', sub: 'Mach dich bereit',
    });
  });
  it('Done: neutraler Akzent, Label DONE', () => {
    expect(phaseVisual('done')).toMatchObject({
      accent: 'oklch(0.85 0.02 150)', bg: 'oklch(0.18 0.01 150)', label: 'DONE', sub: 'Alle Sätze geschafft',
    });
  });
});

describe('segmentFills', () => {
  it('prep: alle Balken leer', () => {
    expect(segmentFills('prep', 1, 3, 0)).toEqual([0, 0, 0]);
  });
  it('work: fertige Runden voll, aktuelle = prog, spätere leer', () => {
    expect(segmentFills('work', 2, 3, 0.5)).toEqual([1, 0.5, 0]);
  });
  it('rest: aktuelle Runde voll (Runde abgeschlossen)', () => {
    expect(segmentFills('rest', 2, 3, 0.3)).toEqual([1, 1, 0]);
  });
  it('set-pause: beendeter Set bleibt komplett voll', () => {
    expect(segmentFills('set-pause', 3, 3, 0.2)).toEqual([1, 1, 1]);
  });
  it('done: alle voll', () => {
    expect(segmentFills('done', 3, 3, 1)).toEqual([1, 1, 1]);
  });
});

describe('segmentColor', () => {
  it('Work/Rest: Work-Akzent (orange, wie Mockup)', () => {
    expect(segmentColor('work')).toBe('oklch(0.78 0.16 55)');
    expect(segmentColor('rest')).toBe('oklch(0.78 0.16 55)');
  });
  it('Set-Pause: grün (Entscheidung 2)', () => {
    expect(segmentColor('set-pause')).toBe('oklch(0.78 0.16 150)');
  });
  it('Done: neutraler Done-Akzent', () => {
    expect(segmentColor('done')).toBe('oklch(0.85 0.02 150)');
  });
});

describe('nextInfo', () => {
  it('prep → Als Nächstes: Work mit Dauer, Work-Akzent', () => {
    expect(nextInfo({ ...base, phase: 'prep' }, cfg)).toEqual({
      text: 'Als Nächstes: Work · 0:45', color: 'oklch(0.78 0.16 55)',
    });
  });
  it('work (weitere folgen) → Als Nächstes: Rest, grün', () => {
    expect(nextInfo({ ...base, phase: 'work', workIdx: 1 }, cfg)).toEqual({
      text: 'Als Nächstes: Rest · 1:30', color: 'oklch(0.78 0.16 150)',
    });
  });
  it('letztes Work im Set → Als Nächstes: Pause', () => {
    expect(nextInfo({ ...base, phase: 'work', workIdx: 3, setIdx: 1 }, cfg)).toEqual({
      text: 'Als Nächstes: Pause · 3:00', color: 'oklch(0.78 0.16 150)',
    });
  });
  it('set-pause → Als Nächstes: Work (nächster Satz)', () => {
    expect(nextInfo({ ...base, phase: 'set-pause', workIdx: 3, setIdx: 1 }, cfg)).toEqual({
      text: 'Als Nächstes: Work · 0:45', color: 'oklch(0.78 0.16 55)',
    });
  });
  it('letztes Work im letzten Set → Letzte Runde, gedämpft', () => {
    expect(nextInfo({ ...base, phase: 'work', workIdx: 3, setIdx: 2 }, cfg)).toEqual({
      text: 'Letzte Runde', color: 'rgba(255,255,255,0.4)',
    });
  });
  it('done → Workout beendet, gedämpft', () => {
    expect(nextInfo({ ...base, phase: 'done' }, cfg)).toEqual({
      text: 'Workout beendet', color: 'rgba(255,255,255,0.4)',
    });
  });
});
