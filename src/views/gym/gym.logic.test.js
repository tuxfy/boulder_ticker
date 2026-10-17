import { describe, it, expect } from 'vitest';
import { rankGyms, escHtml } from './gym.logic.js';

const cache = [
  { locationId: 'a', label: 'Berta Boulder', city: 'Berlin', normKey: 'berta boulder berlin' },
  { locationId: 'b', label: 'Boulderwelt', city: 'München', normKey: 'boulderwelt munchen' },
  { locationId: 'c', label: 'Ostbloc', city: 'Berlin', normKey: 'ostbloc berlin' },
];

describe('rankGyms', () => {
  it('liefert [] ohne Cache', () => {
    expect(rankGyms(null, '', null)).toEqual([]);
  });
  it('ohne Query: ganze Liste', () => {
    expect(rankGyms(cache, '', null).map(g => g.locationId)).toEqual(['a', 'b', 'c']);
  });
  it('ohne Query: gewählte Halle nach oben', () => {
    expect(rankGyms(cache, '', { locationId: 'c' }).map(g => g.locationId)).toEqual(['c', 'a', 'b']);
  });
  it('filtert nach allen Tokens (Substring auf normKey)', () => {
    expect(rankGyms(cache, 'berlin', null).map(g => g.locationId)).toEqual(['a', 'c']);
  });
  it('rankt exakten Label-Treffer nach oben', () => {
    expect(rankGyms(cache, 'boulderwelt', null)[0].locationId).toBe('b');
  });
  it('rankt Präfix-Treffer (Boulderwelt) vor reinem Substring (Berta Boulder)', () => {
    expect(rankGyms(cache, 'boulder', null).map(g => g.locationId)).toEqual(['b', 'a']);
  });
  it('nutzt den Fallback, wenn normKey fehlt (alter Cache)', () => {
    const legacy = [{ locationId: 'x', label: 'Südblock', city: 'Berlin' }]; // kein normKey
    expect(rankGyms(legacy, 'sudblock', null).map(g => g.locationId)).toEqual(['x']);
  });
});

describe('escHtml', () => {
  it('maskiert &, < und >', () => {
    expect(escHtml('<b>A & B</b>')).toBe('&lt;b&gt;A &amp; B&lt;/b&gt;');
  });
});
