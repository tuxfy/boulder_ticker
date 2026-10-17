// Gym-/Hallen-Auswahl-View.
import { navigate } from '../../core/router.js';
import * as store from '../../core/store.js';
import { fetchGyms, normalizeStr } from '../../core/api.js';

const TEMPLATE = `
    <header class="tool-header">
      <h1>Halle wählen</h1>
      <button class="btn-tools" data-nav="boulderlog">← Zurück</button>
    </header>
    <div class="tool-content">
      <div class="gym-search-row">
        <input type="text" id="gym-search" placeholder="Halle suchen …" autocomplete="off">
        <button class="btn-gym-refresh" id="btn-gym-refresh">Aktualisieren</button>
      </div>
      <p class="gym-status-line" id="gym-status"></p>
      <ul class="gym-list" id="gym-list"></ul>
    </div>`;

const LS_GYM_CACHE  = store.KEYS.gymCache;
const LS_GYM_SEL    = store.KEYS.gymSel;
const GYM_CACHE_TTL = 7 * 24 * 3600 * 1000;

let gymCache   = null;
let gymResults = [];

export function gymGetSel() {
  return store.getJSON(LS_GYM_SEL);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export function gymUpdateBar() {
  const sel = gymGetSel();
  const el  = document.getElementById('gym-bar-text');
  if (!el) return;
  if (sel) {
    el.className = '';
    el.innerHTML = `<span class="gym-name">${escHtml(sel.label)}</span>`
      + (sel.city ? ` <span class="gym-location">· ${escHtml(sel.city)}</span>` : '');
  } else {
    el.className = 'gym-none';
    el.textContent = 'Keine Halle gewählt';
  }
}

function gymCacheLoad() {
  try {
    const raw = store.getJSON(LS_GYM_CACHE);
    if (raw && Date.now() - raw.ts < GYM_CACHE_TTL) { gymCache = raw.data; return true; }
  } catch(_) {}
  return false;
}

// Hallenliste frisch laden und im Cache persistieren.
async function refreshGymCache() {
  gymCache = await fetchGyms();
  store.setJSON(LS_GYM_CACHE, { ts: Date.now(), data: gymCache });
}

function gymSearch(q) {
  if (!gymCache) return [];
  const sel = gymGetSel();
  if (!q.trim()) {
    const list = gymCache.slice();
    if (sel) {
      const idx = list.findIndex(g => g.locationId === sel.locationId);
      if (idx > 0) list.unshift(list.splice(idx, 1)[0]);
    }
    return list.slice(0, 20);
  }
  const tokens = normalizeStr(q).split(' ').filter(Boolean);
  const nq     = normalizeStr(q);
  const hits   = gymCache.filter(g => {
    const key = typeof g.normKey === 'string' ? g.normKey
              : normalizeStr((g.label || '') + ' ' + (g.city || ''));
    return tokens.every(t => key.includes(t));
  });
  hits.sort((a, b) => {
    const rank = g => {
      const n = normalizeStr(g.label);
      if (n === nq) return 0;
      if (n.startsWith(nq)) return 1;
      if (tokens.some(t => n.startsWith(t))) return 2;
      return 3;
    };
    return rank(a) - rank(b) || a.label.localeCompare(b.label);
  });
  return hits.slice(0, 20);
}

function gymRenderList() {
  const q        = document.getElementById('gym-search').value;
  const statusEl = document.getElementById('gym-status');
  const listEl   = document.getElementById('gym-list');
  const sel      = gymGetSel();

  if (!gymCache) {
    statusEl.textContent = 'Hallenliste nicht verfügbar — bitte einmal online öffnen.';
    listEl.innerHTML = '';
    return;
  }
  statusEl.textContent = '';
  gymResults = gymSearch(q);
  if (!gymResults.length) {
    listEl.innerHTML = '<li class="gym-no-results">Keine Treffer.</li>';
    return;
  }
  listEl.innerHTML = gymResults.map((g, i) =>
    `<li class="gym-item" data-idx="${i}">` +
    `<div class="gym-item-name${sel && sel.locationId === g.locationId ? ' is-selected' : ''}">${escHtml(g.label)}</div>` +
    (g.city ? `<div class="gym-item-addr">${escHtml(g.city)}</div>` : '') +
    `</li>`
  ).join('');
}

function gymSelect(i) {
  const g = gymResults[i];
  store.setJSON(LS_GYM_SEL, g);
  gymUpdateBar();
  navigate('boulderlog');
}

async function gymRefresh() {
  const btn      = document.getElementById('btn-gym-refresh');
  const statusEl = document.getElementById('gym-status');
  btn.textContent = '…';
  btn.disabled    = true;
  statusEl.textContent = 'Lädt …';
  try {
    await refreshGymCache();
    statusEl.textContent = '';
    gymRenderList();
  } catch(e) {
    statusEl.textContent = 'Hallenliste konnte nicht geladen werden — bitte erneut versuchen.';
    console.error('[fetchGyms]', e);
  } finally {
    btn.textContent = 'Aktualisieren';
    btn.disabled    = false;
  }
}

export async function onGymScreenOpen() {
  document.getElementById('gym-search').value = '';
  if (!gymCache && !gymCacheLoad()) {
    const statusEl = document.getElementById('gym-status');
    statusEl.textContent = 'Lädt …';
    try {
      await refreshGymCache();
      statusEl.textContent = '';
    } catch(_) {
      statusEl.textContent = 'Hallenliste nicht verfügbar — bitte einmal online öffnen.';
      return;
    }
  }
  gymRenderList();
}

export function mountGym() {
  const el = document.getElementById('screen-gym');
  el.innerHTML = TEMPLATE;
  el.querySelectorAll('[data-nav]').forEach(x => x.addEventListener('click', () => navigate(x.dataset.nav)));
  document.getElementById('gym-search').addEventListener('input', gymRenderList);
  document.getElementById('btn-gym-refresh').addEventListener('click', gymRefresh);
  document.getElementById('gym-list').addEventListener('click', (e) => {
    const li = e.target.closest('.gym-item');
    if (li && li.dataset.idx != null) gymSelect(parseInt(li.dataset.idx));
  });
}
