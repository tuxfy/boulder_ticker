// Boulder-Log-View — Einträge, Versuche, Senden, Kopieren, Reset.
import { navigate } from '../../core/router.js';
import * as store from '../../core/store.js';
import { scanStart } from '../scanner/scanner.js';

const TEMPLATE = `
    <header class="tool-header">
      <h1>Boulder Log</h1>
      <button class="btn-tools" data-nav="">⊞ Tools</button>
    </header>
    <div class="gym-bar">
      <button class="gym-bar-link" data-nav="gym" id="gym-bar-btn">
        <span id="gym-bar-text" class="gym-none">Keine Halle gewählt</span>
      </button>
    </div>
    <div class="tool-content">

      <div class="scanner-trigger">
        <button class="btn-scan-qr" data-action="scan" aria-label="QR-Code scannen">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="14" height="14" rx="2" stroke="#444" stroke-width="2" fill="none"/>
            <rect x="7" y="7" width="6" height="6" fill="#444"/>
            <rect x="27" y="3" width="14" height="14" rx="2" stroke="#444" stroke-width="2" fill="none"/>
            <rect x="31" y="7" width="6" height="6" fill="#444"/>
            <rect x="3" y="27" width="14" height="14" rx="2" stroke="#444" stroke-width="2" fill="none"/>
            <rect x="7" y="31" width="6" height="6" fill="#444"/>
            <rect x="27" y="27" width="4" height="4" fill="#444"/>
            <rect x="33" y="27" width="4" height="4" fill="#444"/>
            <rect x="27" y="33" width="4" height="4" fill="#444"/>
            <rect x="33" y="33" width="4" height="4" fill="#444"/>
            <rect x="30" y="30" width="4" height="4" fill="#444"/>
          </svg>
          <span>Scan QR</span>
        </button>
      </div>
      <p id="scan-status" class="scan-status-msg"></p>

      <div class="input-grid">
        <input type="text" id="grade" list="grade-list" placeholder="Grad" autocomplete="off">
        <div class="stepper">
          <button type="button" data-tries="-1">−</button>
          <span id="tries-val">1</span>
          <button type="button" data-tries="1">+</button>
        </div>
        <button type="button" id="send-btn" class="btn-send" data-action="send">send</button>
        <button class="btn-add" data-action="add">+</button>
      </div>

      <datalist id="grade-list">
        <option value="3"><option value="4"><option value="5"><option value="5+">
        <option value="6a"><option value="6a+"><option value="6b"><option value="6b+">
        <option value="6c"><option value="6c+"><option value="7a"><option value="7a+">
        <option value="7b"><option value="7b+"><option value="7c"><option value="7c+">
        <option value="8a"><option value="8a+"><option value="8b"><option value="8b+">
        <option value="8c"><option value="8c+">
      </datalist>

      <div class="style-row">
        <input type="text" id="style" placeholder="Stil (crimp, sloper, dyn …)" autocomplete="off">
      </div>

      <textarea id="log" placeholder="Noch keine Einträge …" spellcheck="false"></textarea>

      <div class="actions">
        <button class="btn-copy" id="copyBtn" data-action="copy">Kopieren</button>
        <button class="btn-reset" data-action="reset">Reset</button>
      </div>

    </div>`;

const KEY = store.KEYS.log;
let logEl, gradeEl, triesVal, sendBtn, styleEl;
let tries = 1;

function changeTries(delta) {
  tries = Math.max(1, tries + delta);
  triesVal.textContent = tries;
}

function toggleSend() { sendBtn.classList.toggle('active'); }

function buildLine(grade, t, send, style) {
  return `- ${grade}: ${t} ${t === 1 ? 'try' : 'tries'}${send ? ' (send)' : ''}${style ? ` - ${style}` : ''}`;
}

function addEntry() {
  const grade = gradeEl.value.trim();
  if (!grade) { gradeEl.focus(); return; }
  const line = buildLine(grade, tries, sendBtn.classList.contains('active'), styleEl.value.trim());
  logEl.value = logEl.value ? logEl.value + '\n' + line : line;
  store.set(KEY, logEl.value);
  tries = 1; triesVal.textContent = 1;
  sendBtn.classList.remove('active');
  styleEl.value = '';
  gradeEl.focus();
}

function copyLog() {
  const text = logEl.value.trim();
  if (!text) return;
  const markCopied = () => {
    const btn = document.getElementById('copyBtn');
    btn.textContent = 'Kopiert ✓';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Kopieren'; btn.classList.remove('copied'); }, 2000);
  };
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(markCopied).catch(() => copyFallback(text, markCopied));
  } else {
    copyFallback(text, markCopied);
  }
}

function copyFallback(text, onSuccess) {
  logEl.select();
  logEl.setSelectionRange(0, 99999);
  try { if (document.execCommand('copy')) onSuccess(); } catch(_) {}
}

function resetLog() {
  if (!logEl.value.trim()) return;
  if (confirm('Alle Einträge löschen?')) {
    logEl.value = '';
    store.remove(KEY);
  }
}

export function mountBoulderlog() {
  const el = document.getElementById('screen-boulderlog');
  el.innerHTML = TEMPLATE;

  logEl    = document.getElementById('log');
  gradeEl  = document.getElementById('grade');
  triesVal = document.getElementById('tries-val');
  sendBtn  = document.getElementById('send-btn');
  styleEl  = document.getElementById('style');

  logEl.value = store.get(KEY) || '';
  logEl.addEventListener('input', () => store.set(KEY, logEl.value));
  [gradeEl, styleEl].forEach(x => x.addEventListener('focus', () => x.select()));
  gradeEl.addEventListener('keydown', e => { if (e.key === 'Enter') addEntry(); });
  styleEl.addEventListener('keydown', e => { if (e.key === 'Enter') addEntry(); });

  el.querySelectorAll('[data-nav]').forEach(x => x.addEventListener('click', () => navigate(x.dataset.nav)));
  el.querySelector('[data-action="scan"]').addEventListener('click', scanStart);
  el.querySelector('[data-tries="-1"]').addEventListener('click', () => changeTries(-1));
  el.querySelector('[data-tries="1"]').addEventListener('click', () => changeTries(1));
  el.querySelector('[data-action="send"]').addEventListener('click', toggleSend);
  el.querySelector('[data-action="add"]').addEventListener('click', addEntry);
  el.querySelector('[data-action="copy"]').addEventListener('click', copyLog);
  el.querySelector('[data-action="reset"]').addEventListener('click', resetLog);
}
