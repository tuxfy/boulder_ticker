import { describe, it, expect } from 'vitest';
import { nextPhase, formatTime } from './timer.logic.js';

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
