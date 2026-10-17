// localStorage-Helfer — aus index.html ausgelagert. Keys unverändert.

export const KEYS = {
  log:      'boulder_log',
  timerCfg: 'timer_cfg',
  gymCache: 'beta7_gyms',
  gymSel:   'beta7_gym_sel',
};

export function get(key)        { return localStorage.getItem(key); }
export function set(key, val)   { localStorage.setItem(key, val); }
export function remove(key)     { localStorage.removeItem(key); }

export function getJSON(key)    { try { return JSON.parse(localStorage.getItem(key)); } catch (_) { return null; } }
export function setJSON(key, v) { localStorage.setItem(key, JSON.stringify(v)); }
