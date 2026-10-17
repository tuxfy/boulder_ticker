// Home-/Menü-View — Markup + Verdrahtung.
import { navigate } from '../../core/router.js';

const TEMPLATE = `
    <h1 class="home-title">Bouldering Berlin</h1>
    <p class="home-section">Tools</p>
    <div class="tool-grid">

      <button class="tile" data-nav="boulderlog">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <rect x="5" y="3" width="30" height="38" rx="5" fill="white" fill-opacity="0.12"/>
          <line x1="11" y1="13" x2="29" y2="13" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.7"/>
          <line x1="11" y1="20" x2="29" y2="20" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.7"/>
          <line x1="11" y1="27" x2="20" y2="27" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-opacity="0.7"/>
          <circle cx="37" cy="39" r="12" fill="white"/>
          <path d="M31 39 l5 5 l9-9" stroke="#1e1e1e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="tile-label">Boulder Log</span>
      </button>

      <button class="tile" data-nav="timer">
        <svg width="52" height="52" viewBox="0 0 52 52" fill="none" aria-hidden="true">
          <circle cx="26" cy="30" r="17" fill="white" fill-opacity="0.12" stroke="white" stroke-opacity="0.75" stroke-width="2.5"/>
          <rect x="21" y="9" width="10" height="5" rx="2.5" fill="white" fill-opacity="0.65"/>
          <line x1="17" y1="14" x2="14" y2="11" stroke="white" stroke-opacity="0.45" stroke-width="2" stroke-linecap="round"/>
          <line x1="26" y1="30" x2="26" y2="19" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="26" y1="30" x2="35" y2="30" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="26" cy="30" r="2.5" fill="white"/>
        </svg>
        <span class="tile-label">Timer</span>
      </button>

    </div>`;

export function mountMenu() {
  const el = document.getElementById('screen-home');
  el.innerHTML = TEMPLATE;
  el.querySelectorAll('.tile[data-nav]').forEach(btn =>
    btn.addEventListener('click', () => navigate(btn.dataset.nav))
  );
}
