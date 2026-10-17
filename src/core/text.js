// Reine Text-Helfer ohne DOM/Netz — unit-testbar und von mehreren Modulen geteilt.

// Normalisiert einen String für Vergleich/Suche: NFKD, Diakritika + Sonderzeichen
// entfernt, lowercase, Whitespace kollabiert.
export function normalizeStr(s) {
  return (s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Kanonischer Suchschlüssel einer Halle (Label + Stadt) — eine Quelle der Wahrheit
// für fetchGyms (Cache-Aufbau) und rankGyms (Fallback bei altem Cache ohne normKey).
export function gymNormKey(label, city) {
  return normalizeStr((label || '') + ' ' + (city || ''));
}
