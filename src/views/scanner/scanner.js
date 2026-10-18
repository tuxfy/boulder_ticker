// QR-Scanner-View — Kamera, QR-Erkennung (nativ oder jsQR), Route-Abruf.
import { FSBASE, unpackFields } from '../../core/api.js';
import { gymGetSel } from '../gym/gym.js';

const OVERLAY = `
    <video id="scanner-video" autoplay muted playsinline></video>
    <p class="scanner-overlay-hint">QR-Code in die Kamera halten …</p>
    <button class="btn btn--secondary btn--compact btn-scan-abort" data-action="abort">Abbrechen</button>`;

let scanStream = null;

// jsQR wird erst beim Scannen geladen (UMD-Bibliothek, setzt window.jsQR).
let jsqrPromise;
function loadJsqr() {
  if (window.jsQR) return Promise.resolve();
  if (!jsqrPromise) {
    jsqrPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = new URL('../../vendor/jsqr.js', import.meta.url).href;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  return jsqrPromise;
}

export async function scanStart() {
  if (scanStream) return;

  const hasNative = 'BarcodeDetector' in window;
  let nativeOk = false;
  if (hasNative) {
    try {
      const supported = await BarcodeDetector.getSupportedFormats();
      nativeOk = supported.includes('qr_code');
    } catch(_) {}
  }

  if (!nativeOk) {
    try { await loadJsqr(); } catch(_) {}
    if (typeof window.jsQR !== 'function') {
      scanShowMsg('QR-Scanner wird von diesem Browser nicht unterstützt.');
      return;
    }
  }

  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
  } catch(_) {
    scanShowMsg('Kamerazugriff nicht möglich.');
    return;
  }

  const video = document.getElementById('scanner-video');
  video.srcObject = scanStream;
  try {
    await video.play();
  } catch(_) {
    scanStop(); // stoppt den Kamera-Stream und versteckt das Overlay wieder
    scanShowMsg('Kamera konnte nicht gestartet werden.');
    return;
  }
  document.getElementById('scanner-overlay').hidden = false;
  scanShowMsg('');

  if (nativeOk) {
    scanLoopNative(video);
  } else {
    scanLoopJsqr(video);
  }
}

function scanLoopNative(video) {
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  let busy = false;
  function frame() {
    if (!scanStream) return;
    if (busy) { requestAnimationFrame(frame); return; }
    busy = true;
    detector.detect(video).then(codes => {
      if (codes.length > 0) {
        scanStop();
        handleScanResult(codes[0].rawValue);
      } else {
        busy = false;
        requestAnimationFrame(frame);
      }
    }).catch(() => { busy = false; requestAnimationFrame(frame); });
  }
  requestAnimationFrame(frame);
}

function scanLoopJsqr(video) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  function frame() {
    if (!scanStream) return;
    if (video.readyState >= video.HAVE_ENOUGH_DATA) {
      if (canvas.width  !== video.videoWidth)  canvas.width  = video.videoWidth;
      if (canvas.height !== video.videoHeight) canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
      if (code) { scanStop(); handleScanResult(code.data); return; }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

export function scanStop() {
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
  document.getElementById('scanner-overlay').hidden = true;
}

function scanShowMsg(msg) {
  const el = document.getElementById('scan-status');
  if (el) el.textContent = msg;
}

async function fetchRouteById(routeId) {
  const res = await fetch(`${FSBASE}/routes/${encodeURIComponent(routeId)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return unpackFields(json.fields || {});
}

async function fetchRouteByQrcode(qrNum, locationId) {
  const locRes = await fetch(`${FSBASE}/locations/${encodeURIComponent(locationId)}?mask.fieldPaths=qrcodes`);
  if (!locRes.ok) throw new Error(`HTTP ${locRes.status}`);
  const locDoc = await locRes.json();
  const f = unpackFields(locDoc.fields || {});
  const routeId = f.qrcodes && f.qrcodes[String(qrNum)];
  if (!routeId) return null;
  return fetchRouteById(routeId);
}

async function handleScanResult(raw) {
  const s             = raw.trim().replace(/\/+$/, '');
  const urlRouteMatch = s.match(/https?:\/\/beta7\.app\/route\/([^/?#\s]+)/);
  const urlQrMatch    = !urlRouteMatch && s.match(/https?:\/\/beta7\.app\/[^/?#\s]+\/(\d+)$/);
  const isRawId       = !urlRouteMatch && !urlQrMatch && /^[A-Za-z0-9_-]+~\d+$/.test(s);
  const isNum         = !urlRouteMatch && !urlQrMatch && !isRawId && /^\d+$/.test(s);

  if (urlRouteMatch || isRawId) {
    const routeId = urlRouteMatch ? urlRouteMatch[1] : s;
    scanShowMsg('Lade Route …');
    let route;
    try { route = await fetchRouteById(routeId); }
    catch(_) { scanShowMsg('Abruf fehlgeschlagen — bitte erneut versuchen.'); return; }
    if (!route) { scanShowMsg('Route nicht gefunden.'); return; }
    applyRouteToForm(route);

  } else if (urlQrMatch || isNum) {
    const qrNum = parseInt(urlQrMatch ? urlQrMatch[1] : s);
    const sel = gymGetSel();
    if (!sel) { scanShowMsg('Keine Halle gewählt — bitte zuerst eine Halle auswählen.'); return; }
    scanShowMsg('Lade Route …');
    let route;
    try { route = await fetchRouteByQrcode(qrNum, sel.locationId); }
    catch(_) { scanShowMsg('Abruf fehlgeschlagen — bitte erneut versuchen.'); return; }
    if (!route) { scanShowMsg('Keine aktive Route an dieser Position.'); return; }
    applyRouteToForm(route);

  } else {
    scanShowMsg(`Inhalt kann nicht verarbeitet werden: ${raw}`);
  }
}

function applyRouteToForm(route) {
  const grade  = route.grades && route.grades.label ? route.grades.label : '';
  const styles = Array.isArray(route.routeStyles) ? route.routeStyles.join(', ') : '';
  const gradeEl = document.getElementById('grade');
  const styleEl = document.getElementById('style');
  gradeEl.value = grade;
  if (styles) styleEl.value = styles;
  scanShowMsg('');
}

export function mountScanner() {
  const el = document.getElementById('scanner-overlay');
  el.innerHTML = OVERLAY;
  el.querySelector('[data-action="abort"]').addEventListener('click', scanStop);
}
