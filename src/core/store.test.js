// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { KEYS, get, set, remove, getJSON, setJSON } from './store.js';

beforeEach(() => { localStorage.clear(); });

describe('KEYS', () => {
  it('enthält die unveränderten localStorage-Schlüssel', () => {
    expect(KEYS).toEqual({
      log: 'boulder_log',
      timerCfg: 'timer_cfg',
      gymCache: 'beta7_gyms',
      gymSel: 'beta7_gym_sel',
    });
  });
});

describe('get/set/remove', () => {
  it('set + get liefert den Wert', () => {
    set('k', 'v');
    expect(get('k')).toBe('v');
  });
  it('get liefert null für einen fehlenden Schlüssel', () => {
    expect(get('fehlt')).toBeNull();
  });
  it('remove löscht den Wert', () => {
    set('k', 'v');
    remove('k');
    expect(get('k')).toBeNull();
  });
});

describe('getJSON/setJSON', () => {
  it('Round-Trip von Objekten', () => {
    setJSON('k', { a: 1, b: [2, 3] });
    expect(getJSON('k')).toEqual({ a: 1, b: [2, 3] });
  });
  it('getJSON liefert null bei kaputtem JSON', () => {
    set('k', '{kein json');
    expect(getJSON('k')).toBeNull();
  });
  it('getJSON liefert null für einen fehlenden Schlüssel', () => {
    expect(getJSON('fehlt')).toBeNull();
  });
});
