// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { navigate, initRouter } from './router.js';

describe('navigate', () => {
  it('setzt den Hash auf /<tool>', () => {
    navigate('timer');
    expect(location.hash).toBe('#/timer');
  });
  it('setzt den Hash auf / ohne Tool', () => {
    navigate();
    expect(location.hash).toBe('#/');
  });
});

describe('initRouter', () => {
  let cleanups;
  beforeEach(() => {
    document.body.innerHTML =
      '<div id="s-timer"></div><div id="s-gym"></div><div id="s-menu"></div>';
    location.hash = '';
    cleanups = [];
  });
  afterEach(() => { cleanups.forEach(fn => fn()); });

  const screens = { timer: 's-timer', gym: 's-gym' };
  const start = (opts) => { cleanups.push(initRouter(opts)); };

  it('zeigt die zur Route passende Ansicht und versteckt die anderen', () => {
    const shown = [];
    start({ screens, fallback: 's-menu', onShow: (id) => shown.push(id) });

    location.hash = '/timer';
    window.dispatchEvent(new Event('hashchange'));

    expect(document.getElementById('s-timer').hidden).toBe(false);
    expect(document.getElementById('s-gym').hidden).toBe(true);
    expect(shown.at(-1)).toBe('s-timer');
  });

  it('nutzt den Fallback bei unbekannter Route', () => {
    const shown = [];
    start({ screens, fallback: 's-menu', onShow: (id) => shown.push(id) });

    location.hash = '/gibtsnicht';
    window.dispatchEvent(new Event('hashchange'));

    expect(document.getElementById('s-timer').hidden).toBe(true);
    expect(document.getElementById('s-gym').hidden).toBe(true);
    expect(shown.at(-1)).toBe('s-menu');
  });

  it('rendert initial beim load-Event', () => {
    start({ screens, fallback: 's-menu' });

    location.hash = '/gym';
    window.dispatchEvent(new Event('load'));

    expect(document.getElementById('s-gym').hidden).toBe(false);
    expect(document.getElementById('s-timer').hidden).toBe(true);
  });
});
