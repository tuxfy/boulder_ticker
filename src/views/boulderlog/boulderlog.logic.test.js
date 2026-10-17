import { describe, it, expect } from 'vitest';
import { buildLine } from './boulderlog.logic.js';

describe('buildLine', () => {
  it('Singular bei einem Versuch', () => {
    expect(buildLine('6a', 1, false, '')).toBe('- 6a: 1 try');
  });
  it('Plural bei mehreren Versuchen', () => {
    expect(buildLine('6a', 3, false, '')).toBe('- 6a: 3 tries');
  });
  it('markiert send', () => {
    expect(buildLine('7b', 2, true, '')).toBe('- 7b: 2 tries (send)');
  });
  it('hängt den Stil an', () => {
    expect(buildLine('6c', 1, false, 'crimp')).toBe('- 6c: 1 try - crimp');
  });
  it('send und Stil zusammen', () => {
    expect(buildLine('8a', 4, true, 'dyno')).toBe('- 8a: 4 tries (send) - dyno');
  });
});
