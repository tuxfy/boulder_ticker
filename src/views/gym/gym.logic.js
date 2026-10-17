// Reine Hallen-Such-/Ranking-Logik ohne DOM/State — unit-testbar.
import { normalizeStr, gymNormKey } from '../../core/text.js';

// cache: Array der Hallen, q: Suchbegriff, sel: gewählte Halle (oder null).
// Ohne Query: ganze Liste (gewählte Halle nach oben), sonst Token-Filter + Ranking.
export function rankGyms(cache, q, sel) {
  if (!cache) return [];
  if (!q.trim()) {
    const list = cache.slice();
    if (sel) {
      const idx = list.findIndex(g => g.locationId === sel.locationId);
      if (idx > 0) list.unshift(list.splice(idx, 1)[0]);
    }
    return list.slice(0, 20);
  }
  const tokens = normalizeStr(q).split(' ').filter(Boolean);
  const nq     = normalizeStr(q);
  const hits   = cache.filter(g => {
    const key = typeof g.normKey === 'string' ? g.normKey
              : gymNormKey(g.label, g.city);
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

// HTML-Escaping für Fremd-/Nutzertext, der per innerHTML eingesetzt wird.
export function escHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
