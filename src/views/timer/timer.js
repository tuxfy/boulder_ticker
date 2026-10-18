// Timer-View — Konfiguration, Lauf, Phasen.
import { navigate } from '../../core/router.js';
import { unlockAudio, playBeep, playFinish, requestWakeLock, releaseWakeLock } from '../../core/audio.js';
import * as store from '../../core/store.js';
import {
  nextPhase, PREP_SECS, CIRCUMFERENCE, RING_RADIUS,
  formatMs, phaseDurationMs, progress, dashOffset,
  phaseVisual, segmentFills, nextInfo,
} from './timer.logic.js';

const TEMPLATE = `
    <header class="tool-header">
      <h1>Timer</h1>
      <button class="btn-tools" data-nav="">⊞ Tools</button>
    </header>
    <div class="tool-content" id="timer-content">

      <!-- CONFIG (Redesign nach Mockup) -->
      <div id="timer-config">
        <div class="timer-cfg-group">
          <div class="timer-cfg-row" data-field="sets">
            <span class="timer-cfg-label">Sets</span>
            <div class="timer-cfg-stepper">
              <button type="button" data-adjust="numSets" data-delta="-1" aria-label="Weniger">−</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-numSets" value="2" data-param="numSets">
              <button type="button" data-adjust="numSets" data-delta="1" aria-label="Mehr">+</button>
            </div>
            <span class="timer-cfg-unit"></span>
          </div>
          <div class="timer-cfg-row" data-field="pause">
            <span class="timer-cfg-label">Pause</span>
            <div class="timer-cfg-stepper">
              <button type="button" data-adjust="setPause" data-delta="-1" aria-label="Weniger">−</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-setPause" value="180" data-param="setPause">
              <button type="button" data-adjust="setPause" data-delta="1" aria-label="Mehr">+</button>
            </div>
            <span class="timer-cfg-unit">s</span>
          </div>
        </div>
        <div class="timer-cfg-group">
          <div class="timer-cfg-row" data-field="work">
            <span class="timer-cfg-label">Work</span>
            <div class="timer-cfg-stepper">
              <button type="button" data-adjust="work" data-delta="-1" aria-label="Weniger">−</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-work" value="45" data-param="work">
              <button type="button" data-adjust="work" data-delta="1" aria-label="Mehr">+</button>
            </div>
            <span class="timer-cfg-unit">s</span>
          </div>
          <div class="timer-cfg-row" data-field="rounds">
            <span class="timer-cfg-label">Rounds</span>
            <div class="timer-cfg-stepper">
              <button type="button" data-adjust="numWork" data-delta="-1" aria-label="Weniger">−</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-numWork" value="5" data-param="numWork">
              <button type="button" data-adjust="numWork" data-delta="1" aria-label="Mehr">+</button>
            </div>
            <span class="timer-cfg-unit"></span>
          </div>
          <div class="timer-cfg-row" data-field="rest">
            <span class="timer-cfg-label">Rest</span>
            <div class="timer-cfg-stepper">
              <button type="button" data-adjust="rest" data-delta="-1" aria-label="Weniger">−</button>
              <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-rest" value="90" data-param="rest">
              <button type="button" data-adjust="rest" data-delta="1" aria-label="Mehr">+</button>
            </div>
            <span class="timer-cfg-unit">s</span>
          </div>
        </div>
        <button class="btn-timer-start" data-action="start">Start</button>
      </div>

      <!-- DISPLAY (Redesign nach Mockup) -->
      <div id="timer-display" hidden>
        <div class="timer-meta">
          <span>Work <b id="timer-work">1 / 5</b></span>
          <span>Set <b id="timer-set">1 / 2</b></span>
        </div>

        <div class="timer-ring">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <circle class="timer-ring-track" cx="150" cy="150" r="${RING_RADIUS}"></circle>
            <circle class="timer-ring-prog" id="timer-ring-prog" cx="150" cy="150" r="${RING_RADIUS}"
                    stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${CIRCUMFERENCE}"></circle>
          </svg>
          <div class="timer-ring-center">
            <div class="timer-phase-label" id="timer-phase">GET READY</div>
            <div class="timer-time" id="timer-time">0:10</div>
            <div class="timer-sub" id="timer-sub">Mach dich bereit</div>
          </div>
        </div>

        <div class="timer-segments" id="timer-segments"></div>

        <div class="timer-next">
          <span class="timer-next-dot" id="timer-next-dot"></span>
          <span id="timer-next-text"></span>
        </div>

        <div class="timer-controls">
          <button class="btn-timer-reset" data-action="reset" aria-label="Reset">
            <span class="timer-btn-icon">↺</span>Reset
          </button>
          <button class="btn-timer-toggle" id="btn-toggle" data-action="toggle">Pause</button>
          <button class="btn-timer-skip" data-action="skip" aria-label="Überspringen">
            <span class="timer-btn-icon">⇥</span>Skip
          </button>
        </div>
      </div>

    </div>
`;

// ── TIMER ─────────────────────────────────────────────────────
const TIMER_KEY = store.KEYS.timerCfg;

const PARAM_META = {
  work:     { min: 1,  max: 600 },
  rest:     { min: 1,  max: 600 },
  numWork:  { min: 1,  max: 30  },
  numSets:  { min: 1,  max: 20  },
  setPause: { min: 1,  max: 600 },
};

let cfg = { work: 45, rest: 90, numWork: 5, numSets: 2, setPause: 180 };

function loadTimerCfg() {
  try {
    const saved = store.getJSON(TIMER_KEY);
    if (saved) {
      Object.keys(cfg).forEach(k => { if (saved[k] != null) cfg[k] = saved[k]; });
      Object.keys(cfg).forEach(k => {
        document.getElementById(`val-${k}`).value = cfg[k];
      });
    }
  } catch (_) {}
}

function saveTimerCfg() {
  store.setJSON(TIMER_KEY, cfg);
}

function adjustParam(key, delta) {
  const { min, max } = PARAM_META[key];
  const input = document.getElementById(`val-${key}`);
  const current = parseInt(input.value);
  cfg[key] = Math.min(max, Math.max(min, (isNaN(current) ? cfg[key] : current) + delta));
  input.value = cfg[key];
  saveTimerCfg();
}

function onParamInput(key) {
  const { min, max } = PARAM_META[key];
  const val = parseInt(document.getElementById(`val-${key}`).value);
  if (!isNaN(val)) { cfg[key] = Math.min(max, Math.max(min, val)); saveTimerCfg(); }
}

function clampParam(key) {
  const { min, max } = PARAM_META[key];
  const input = document.getElementById(`val-${key}`);
  const val = parseInt(input.value);
  cfg[key] = Math.min(max, Math.max(min, isNaN(val) ? cfg[key] : val));
  input.value = cfg[key];
  saveTimerCfg();
}

// timer state
let tState = null;       // { phase, remainingMs, workIdx, setIdx, paused }
let tInterval = null;
let tLast = null;        // Zeitstempel des letzten Ticks (ms), für kontinuierliches Herunterzählen
let tPrevSec = null;     // zuletzt angezeigte Ganzsekunde — für Beep-Flanken

function timerStart() {
  saveTimerCfg();
  unlockAudio(); // iOS: stiller Buffer entsperrt den Audio-Stack im User-Gesture
  tState = { phase: 'prep', remainingMs: PREP_SECS * 1000, workIdx: 1, setIdx: 1, paused: false };
  tLast = Date.now(); // Startzeit, damit der erste Tick eine echte Zeitdifferenz hat
  tPrevSec = Math.ceil(tState.remainingMs / 1000);
  document.getElementById('timer-config').hidden = true;
  document.getElementById('timer-display').hidden = false;
  renderTimer();
  requestWakeLock();
  if (!tInterval) tInterval = setInterval(timerTick, 100);
}

function timerTick() {
  if (!tState || tState.paused) { tLast = null; return; }
  const now = Date.now();
  const dt = tLast != null ? now - tLast : 0;
  tLast = now;
  tState.remainingMs -= dt;

  // Beep an den Sekundengrenzen 3/2/1
  const sec = Math.max(0, Math.ceil(tState.remainingMs / 1000));
  if (sec < tPrevSec) {
    if (sec >= 1 && sec <= 3) { playBeep(880, 0.08); pulseTime(); }
    tPrevSec = sec;
  }

  if (tState.remainingMs <= 0) {
    playBeep(440, 0.35);
    advancePhase();
    return;
  }
  renderTimer();
}

function advancePhase() {
  const carry = tState.remainingMs; // negativer Überhang für genaues Weiterzählen
  tState = nextPhase(tState, cfg);

  if (tState.phase === 'done') {
    clearInterval(tInterval);
    tInterval = null;
    tState.remainingMs = 0;
    releaseWakeLock();
    playFinish();
    renderTimer(); // DONE-Screen, kein Auto-Rücksprung (Entscheidung 4)
    return;
  }

  tState.remainingMs = phaseDurationMs(tState.phase, cfg) + carry;
  tPrevSec = Math.ceil(tState.remainingMs / 1000);
  renderTimer();
}

function renderTimer() {
  const { phase, remainingMs, workIdx, setIdx } = tState;
  const dur  = phaseDurationMs(phase, cfg);
  const prog = progress(remainingMs, dur);
  const vis  = phaseVisual(phase);

  // Farben liefert timer.css über data-phase — hier nur die Phase als Datenattribut.
  document.getElementById('timer-display').dataset.phase = phase;

  document.getElementById('timer-phase').textContent = vis.label;
  document.getElementById('timer-time').textContent  = formatMs(Math.max(0, remainingMs));
  document.getElementById('timer-sub').textContent    = vis.sub;

  document.getElementById('timer-ring-prog')
    .setAttribute('stroke-dashoffset', dashOffset(prog).toFixed(2));

  renderSegments(segmentFills(phase, workIdx, cfg.numWork, prog));

  document.getElementById('timer-work').textContent = `${Math.min(workIdx, cfg.numWork)} / ${cfg.numWork}`;
  document.getElementById('timer-set').textContent  = `${Math.min(setIdx, cfg.numSets)} / ${cfg.numSets}`;

  const nx = nextInfo(tState, cfg);
  document.getElementById('timer-next-text').textContent = nx.text;
  document.getElementById('timer-next-dot').dataset.tone = nx.tone;

  const toggle = document.getElementById('btn-toggle');
  toggle.textContent = phase === 'done' ? 'Neu starten' : (tState.paused ? 'Weiter' : 'Pause');
}

function renderSegments(fills) {
  const wrap = document.getElementById('timer-segments');
  if (wrap.children.length !== fills.length) {
    wrap.innerHTML = fills.map(() => '<div class="timer-seg"><div class="timer-seg-fill"></div></div>').join('');
  }
  // Füllfarbe kommt per CSS-Variable (--seg) aus timer.css; hier nur die Breite.
  fills.forEach((f, i) => { wrap.children[i].firstElementChild.style.width = `${f * 100}%`; });
}

function timerToggle() {
  if (!tState) return;
  if (tState.phase === 'done') { timerStart(); return; } // „Neu starten"
  tState.paused = !tState.paused;
  if (tState.paused) { releaseWakeLock(); }
  else { tLast = null; requestWakeLock(); }
  renderTimer();
}

function timerSkip() {
  if (!tState || tState.phase === 'done') return;
  tState.remainingMs = 0;
  advancePhase();
}

function timerReset() {
  clearInterval(tInterval);
  tInterval = null;
  tState = null;
  releaseWakeLock();
  document.getElementById('timer-display').hidden = true;
  document.getElementById('timer-config').hidden = false;
}

function pulseTime() {
  const el = document.getElementById('timer-time');
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && tState && !tState.paused) {
    tLast = null; // verhindert Zeitsprung durch Hintergrund-Pause
    requestWakeLock();
  }
});

export function mountTimer() {
  const el = document.getElementById('screen-timer');
  el.innerHTML = TEMPLATE;
  el.querySelectorAll('[data-nav]').forEach(x => x.addEventListener('click', () => navigate(x.dataset.nav)));
  el.querySelectorAll('[data-adjust]').forEach(x => x.addEventListener('click', () => adjustParam(x.dataset.adjust, parseInt(x.dataset.delta))));
  el.querySelectorAll('[data-param]').forEach(inp => {
    inp.addEventListener('input', () => onParamInput(inp.dataset.param));
    inp.addEventListener('blur', () => clampParam(inp.dataset.param));
  });
  el.querySelector('[data-action="start"]').addEventListener('click', timerStart);
  el.querySelector('[data-action="toggle"]').addEventListener('click', timerToggle);
  el.querySelector('[data-action="skip"]').addEventListener('click', timerSkip);
  el.querySelector('[data-action="reset"]').addEventListener('click', timerReset);
  loadTimerCfg();
}
