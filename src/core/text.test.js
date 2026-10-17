import { describe, it, expect } from 'vitest';
import { normalizeStr, gymNormKey } from './text.js';

describe('normalizeStr', () => {
  it('entfernt Diakritika/Sonderzeichen, lowercased und kollabiert Whitespace', () => {
    expect(normalizeStr('Café  Berlin!')).toBe('cafe berlin');
  });
  it('liefert leeren String für null/leer', () => {
    expect(normalizeStr(null)).toBe('');
    expect(normalizeStr('')).toBe('');
  });
});

describe('gymNormKey', () => {
  it('kombiniert Label und Stadt normalisiert', () => {
    expect(gymNormKey('Boulderwelt', 'München')).toBe('boulderwelt munchen');
  });
  it('verträgt fehlendes Label / fehlende Stadt', () => {
    expect(gymNormKey('Ostbloc', '')).toBe('ostbloc');
    expect(gymNormKey(null, null)).toBe('');
  });
});
