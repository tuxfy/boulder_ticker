import { describe, it, expect } from 'vitest';
import {
  nextPhase,
  formatMs, phaseDurationMs, progress, dashOffset, CIRCUMFERENCE, RING_RADIUS, PREP_SECS,
  phaseLabel, phaseVisual, segmentFills, nextInfo,
} from './timer.logic.js';

const cfg = { work: 45, rest: 90, numWork: 3, numSets: 2, setPause: 180 };
const base = { phase: 'prep', workIdx: 1, setIdx: 1, paused: false };

describe('nextPhase', () => {
  it('prep → work', () => {
    expect(nextPhase({ ...base, phase: 'prep' }, cfg)).toMatchObject({ phase: 'work' });
  });
  it('work → rest, wenn weitere Work-Intervalle folgen', () => {
    expect(nextPhase({ ...base, phase: 'work', workIdx: 1 }, cfg)).toMatchObject({ phase: 'rest' });
  });
  it('rest → work und erhöht workIdx', () => {
    expect(nextPhase({ ...base, phase: 'rest', workIdx: 1 }, cfg))
      .toMatchObject({ phase: 'work', workIdx: 2 });
  });
  it('letztes Work im Set (nicht letztes Set) → set-pause', () => {
    expect(nextPhase({ ...base, phase: 'work', workIdx: 3, setIdx: 1 }, cfg))
      .toMatchObject({ phase: 'set-pause' });
  });
  it('set-pause → work, erhöht setIdx und setzt workIdx zurück', () => {
    expect(nextPhase({ ...base, phase: 'set-pause', workIdx: 3, setIdx: 1 }, cfg))
      .toMatchObject({ phase: 'work', setIdx: 2, workIdx: 1 });
  });
  it('letztes Work im letzten Set → done', () => {
    expect(nextPhase({ ...base, phase: 'work', workIdx: 3, setIdx: 2 }, cfg)).toMatchObject({ phase: 'done' });
  });
  it('erhält unbeteiligte Felder (paused)', () => {
    expect(nextPhase({ ...base, phase: 'prep', paused: true }, cfg).paused).toBe(true);
  });
  it('liefert kein (vestigiales) timeLeft mehr', () => {
    expect('timeLeft' in nextPhase({ ...base, phase: 'prep' }, cfg)).toBe(false);
    expect('timeLeft' in nextPhase({ ...base, phase: 'rest', workIdx: 1 }, cfg)).toBe(false);
  });
});

// ── Mockup-Redesign: portierte Formeln (Anforderung 13/14) ───────
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

describe('Ring-Geometrie', () => {
  it('Umfang wird aus einer einzigen Radius-Quelle abgeleitet (nicht hartkodiert)', () => {
    expect(RING_RADIUS).toBe(138);
    expect(CIRCUMFERENCE).toBe(2 * Math.PI * RING_RADIUS);
  });
  it('dashOffset = CIRCUMFERENCE * (1 - prog)', () => {
    expect(dashOffset(0)).toBeCloseTo(CIRCUMFERENCE, 5);
    expect(dashOffset(1)).toBeCloseTo(0, 5);
    expect(dashOffset(0.5)).toBeCloseTo(CIRCUMFERENCE / 2, 5);
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
  // Nur noch Inhalt/Semantik — keine Farbwerte mehr (die leben in timer.css).
  it('Work', () => {
    expect(phaseVisual('work')).toEqual({ label: 'WORK', sub: 'Gib alles' });
  });
  it('Rest', () => {
    expect(phaseVisual('rest')).toEqual({ label: 'REST', sub: 'Durchatmen' });
  });
  it('Set-Pause', () => {
    expect(phaseVisual('set-pause')).toEqual({ label: 'PAUSE', sub: 'Satz geschafft – kurz durchatmen' });
  });
  it('Prep', () => {
    expect(phaseVisual('prep')).toEqual({ label: 'GET READY', sub: 'Mach dich bereit' });
  });
  it('Done', () => {
    expect(phaseVisual('done')).toEqual({ label: 'DONE', sub: 'Alle Sätze geschafft' });
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

describe('nextInfo', () => {
  // Liefert Text + semantisches Tone-Token (Farbe kommt aus CSS), keine Farbstrings.
  it('prep → Als Nächstes: Work', () => {
    expect(nextInfo({ ...base, phase: 'prep' }, cfg)).toEqual({
      text: 'Als Nächstes: Work · 0:45', tone: 'work',
    });
  });
  it('work (weitere folgen) → Als Nächstes: Rest', () => {
    expect(nextInfo({ ...base, phase: 'work', workIdx: 1 }, cfg)).toEqual({
      text: 'Als Nächstes: Rest · 1:30', tone: 'rest',
    });
  });
  it('letztes Work im Set → Als Nächstes: Pause', () => {
    expect(nextInfo({ ...base, phase: 'work', workIdx: 3, setIdx: 1 }, cfg)).toEqual({
      text: 'Als Nächstes: Pause · 3:00', tone: 'pause',
    });
  });
  it('set-pause → Als Nächstes: Work (nächster Satz)', () => {
    expect(nextInfo({ ...base, phase: 'set-pause', workIdx: 3, setIdx: 1 }, cfg)).toEqual({
      text: 'Als Nächstes: Work · 0:45', tone: 'work',
    });
  });
  it('letztes Work im letzten Set → Letzte Runde, gedämpft', () => {
    expect(nextInfo({ ...base, phase: 'work', workIdx: 3, setIdx: 2 }, cfg)).toEqual({
      text: 'Letzte Runde', tone: 'dim',
    });
  });
  it('done → Workout beendet, gedämpft', () => {
    expect(nextInfo({ ...base, phase: 'done' }, cfg)).toEqual({
      text: 'Workout beendet', tone: 'dim',
    });
  });
});
