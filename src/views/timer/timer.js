// Timer-View — Konfiguration, Lauf, Phasen.
import { navigate } from '../../core/router.js';
import { unlockAudio, playBeep, playFinish, requestWakeLock, releaseWakeLock } from '../../core/audio.js';
import * as store from '../../core/store.js';

const TEMPLATE = `
    <header class="tool-header">
      <h1>Timer</h1>
      <button class="btn-tools" data-nav="">⊞ Tools</button>
    </header>
    <div class="tool-content" id="timer-content">

      <!-- CONFIG -->
      <div id="timer-config">
        <div class="timer-params">
          <div class="timer-param">
            <span class="timer-param-label">Work</span>
            <div class="timer-param-right">
              <div class="stepper timer-stepper">
                <button type="button" data-adjust="work" data-delta="-1">−</button>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-work" value="45"
                       data-param="work">
                <button type="button" data-adjust="work" data-delta="1">+</button>
              </div>
              <span class="timer-param-unit">s</span>
            </div>
          </div>
          <div class="timer-param">
            <span class="timer-param-label">Rest</span>
            <div class="timer-param-right">
              <div class="stepper timer-stepper">
                <button type="button" data-adjust="rest" data-delta="-1">−</button>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-rest" value="90"
                       data-param="rest">
                <button type="button" data-adjust="rest" data-delta="1">+</button>
              </div>
              <span class="timer-param-unit">s</span>
            </div>
          </div>
          <div class="timer-param">
            <span class="timer-param-label">Anzahl Work</span>
            <div class="timer-param-right">
              <div class="stepper timer-stepper">
                <button type="button" data-adjust="numWork" data-delta="-1">−</button>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-numWork" value="5"
                       data-param="numWork">
                <button type="button" data-adjust="numWork" data-delta="1">+</button>
              </div>
              <span class="timer-param-unit"></span>
            </div>
          </div>
          <div class="timer-param">
            <span class="timer-param-label">Anzahl Sets</span>
            <div class="timer-param-right">
              <div class="stepper timer-stepper">
                <button type="button" data-adjust="numSets" data-delta="-1">−</button>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-numSets" value="2"
                       data-param="numSets">
                <button type="button" data-adjust="numSets" data-delta="1">+</button>
              </div>
              <span class="timer-param-unit"></span>
            </div>
          </div>
          <div class="timer-param">
            <span class="timer-param-label">Set-Pause</span>
            <div class="timer-param-right">
              <div class="stepper timer-stepper">
                <button type="button" data-adjust="setPause" data-delta="-1">−</button>
                <input type="text" inputmode="numeric" pattern="[0-9]*" id="val-setPause" value="180"
                       data-param="setPause">
                <button type="button" data-adjust="setPause" data-delta="1">+</button>
              </div>
              <span class="timer-param-unit">s</span>
            </div>
          </div>
        </div>
        <button class="btn-timer-start" data-action="start">Start</button>
      </div>

      <!-- DISPLAY -->
      <div id="timer-display" hidden>
        <div class="timer-phase-label" id="timer-phase">VORBEREITUNG</div>
        <div class="timer-time" id="timer-time">0:10</div>
        <div class="timer-progress" id="timer-progress"></div>
        <div class="timer-controls">
          <button class="btn-timer-pause" id="btn-pause" data-action="pause">Pause</button>
          <button class="btn-timer-abort" data-action="reset">Reset</button>
        </div>
      </div>

    </div>
`;

// ── TIMER ─────────────────────────────────────────────────────
const TIMER_KEY = store.KEYS.timerCfg;
const PREP_SECS = 10;

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
let tState = null;
let tInterval = null;

function timerStart() {
  if (tInterval) return;
  saveTimerCfg();
  unlockAudio(); // iOS: stiller Buffer entsperrt den Audio-Stack im User-Gesture
  tState = { phase: 'prep', timeLeft: PREP_SECS, workIdx: 1, setIdx: 1, paused: false };
  document.getElementById('timer-config').hidden = true;
  document.getElementById('timer-display').hidden = false;
  updateTimerDisplay();
  requestWakeLock();
  tInterval = setInterval(timerTick, 1000);
}

function timerTick() {
  if (tState.paused) return;
  tState.timeLeft--;

  if (tState.timeLeft <= 0) {
    playBeep(440, 0.35);
    advancePhase();
  } else {
    if (tState.timeLeft <= 3) playBeep(880, 0.08);
    if (tState.timeLeft <= 3) pulseTime();
    updateTimerDisplay();
  }
}

function advancePhase() {
  const { phase, workIdx, setIdx } = tState;

  if (phase === 'prep') {
    tState.phase = 'work';
    tState.timeLeft = cfg.work;

  } else if (phase === 'work') {
    const lastWork = workIdx >= cfg.numWork;
    const lastSet  = setIdx  >= cfg.numSets;

    if (lastWork && lastSet) {
      tState.phase = 'done';
      clearInterval(tInterval);
      releaseWakeLock();
      playFinish();
      updateTimerDisplay();
      setTimeout(() => { if (tState?.phase === 'done') timerReset(); }, 2500);
      return;
    } else if (lastWork) {
      tState.phase = 'set-pause';
      tState.timeLeft = cfg.setPause;
    } else {
      tState.phase = 'rest';
      tState.timeLeft = cfg.rest;
    }

  } else if (phase === 'rest') {
    tState.workIdx++;
    tState.phase = 'work';
    tState.timeLeft = cfg.work;

  } else if (phase === 'set-pause') {
    tState.setIdx++;
    tState.workIdx = 1;
    tState.phase = 'work';
    tState.timeLeft = cfg.work;
  }

  updateTimerDisplay();
}

function updateTimerDisplay() {
  const { phase, timeLeft, workIdx, setIdx } = tState;
  const phaseEl    = document.getElementById('timer-phase');
  const timeEl     = document.getElementById('timer-time');
  const progressEl = document.getElementById('timer-progress');
  const content    = document.getElementById('timer-content');

  const labels = {
    prep:       'Vorbereitung',
    work:       'Work',
    rest:       'Rest',
    'set-pause':'Set-Pause',
    done:       'Fertig',
  };
  phaseEl.textContent = labels[phase] ?? phase;
  phaseEl.className = 'timer-phase-label';
  if (phase === 'work') phaseEl.classList.add('work');
  if (phase === 'rest' || phase === 'set-pause') phaseEl.classList.add('rest');

  timeEl.textContent = phase === 'done' ? '—' : formatTime(timeLeft);

  content.className = 'tool-content';
  if (phase === 'work')      content.classList.add('phase-work');
  if (phase === 'rest')      content.classList.add('phase-rest');
  if (phase === 'set-pause') content.classList.add('phase-set-pause');

  if (phase === 'work' || phase === 'rest') {
    progressEl.textContent = `Work ${workIdx} / ${cfg.numWork} · Set ${setIdx} / ${cfg.numSets}`;
  } else if (phase === 'set-pause') {
    progressEl.textContent = `Set ${setIdx} / ${cfg.numSets} abgeschlossen`;
  } else {
    progressEl.textContent = '';
  }

  const pauseBtn = document.getElementById('btn-pause');
  if (phase === 'done') {
    pauseBtn.hidden = true;
  } else {
    pauseBtn.hidden = false;
    pauseBtn.textContent = tState.paused ? 'Weiter' : 'Pause';
  }
}

function timerTogglePause() {
  tState.paused = !tState.paused;
  document.getElementById('btn-pause').textContent = tState.paused ? 'Weiter' : 'Pause';
  if (tState.paused) releaseWakeLock();
  else requestWakeLock();
}

function timerReset() {
  clearInterval(tInterval);
  tInterval = null;
  tState = null;
  releaseWakeLock();
  document.getElementById('timer-display').hidden = true;
  document.getElementById('timer-config').hidden = false;
  document.getElementById('timer-content').className = 'tool-content';
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function pulseTime() {
  const el = document.getElementById('timer-time');
  el.classList.remove('pulse');
  void el.offsetWidth;
  el.classList.add('pulse');
}


document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && tState && !tState.paused) {
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
  el.querySelector('[data-action="pause"]').addEventListener('click', timerTogglePause);
  el.querySelector('[data-action="reset"]').addEventListener('click', timerReset);
  loadTimerCfg();
}
