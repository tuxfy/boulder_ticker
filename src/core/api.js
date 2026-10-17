// Firestore-Zugriffe (BETA7) — aus index.html ausgelagert.

export const FSBASE = 'https://firestore.googleapis.com/v1/projects/beta7-206508/databases/(default)/documents';

export function unpackValue(v) {
  if (!v) return null;
  if ('stringValue'  in v) return v.stringValue;
  if ('integerValue' in v) return parseInt(v.integerValue);
  if ('doubleValue'  in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('arrayValue'   in v) return (v.arrayValue.values || []).map(unpackValue);
  if ('mapValue'     in v) return unpackFields(v.mapValue.fields || {});
  return null;
}

export function unpackFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) out[k] = unpackValue(v);
  return out;
}

export function normalizeStr(s) {
  return (s || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Lädt alle öffentlichen Hallen und gibt sie zurück (ohne Seiteneffekte/Caching).
export async function fetchGyms() {
  const gyms = [];
  let pageToken = null;
  const MASK = 'mask.fieldPaths=displayName&mask.fieldPaths=locationName&mask.fieldPaths=address&mask.fieldPaths=status';
  do {
    const base = `${FSBASE}/locations?pageSize=300&${MASK}`;
    const urlStr = pageToken ? `${base}&pageToken=${encodeURIComponent(pageToken)}` : base;
    const res = await fetch(urlStr);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    for (const doc of (json.documents || [])) {
      const f = unpackFields(doc.fields || {});
      if (f.status && f.status !== 'public') continue;
      const locationId = doc.name.split('/').pop();
      const labelRaw = f.displayName || f.locationName;
      const label = typeof labelRaw === 'string' ? labelRaw
                  : (labelRaw && typeof labelRaw === 'object')
                    ? String(labelRaw.en || labelRaw.de || Object.values(labelRaw)[0] || locationId)
                    : locationId;
      let city = '';
      if (typeof f.address === 'string') city = f.address;
      else if (f.address && typeof f.address === 'object')
        city = String(f.address.city_name || f.address.city || f.address.locality || '');
      gyms.push({ locationId, label, city, normKey: normalizeStr(label + ' ' + city) });
    }
    pageToken = json.nextPageToken || null;
  } while (pageToken);
  gyms.sort((a, b) => a.label.localeCompare(b.label));
  return gyms;
}
