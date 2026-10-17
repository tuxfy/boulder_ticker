import { describe, it, expect, vi, afterEach } from 'vitest';
import { unpackValue, unpackFields, fetchGyms } from './api.js';

describe('unpackValue', () => {
  it('entpackt stringValue', () => {
    expect(unpackValue({ stringValue: 'hi' })).toBe('hi');
  });
  it('entpackt integerValue als Zahl', () => {
    expect(unpackValue({ integerValue: '42' })).toBe(42);
  });
  it('entpackt doubleValue', () => {
    expect(unpackValue({ doubleValue: 1.5 })).toBe(1.5);
  });
  it('entpackt booleanValue', () => {
    expect(unpackValue({ booleanValue: true })).toBe(true);
  });
  it('entpackt arrayValue rekursiv', () => {
    expect(unpackValue({ arrayValue: { values: [{ stringValue: 'a' }, { integerValue: '2' }] } }))
      .toEqual(['a', 2]);
  });
  it('entpackt arrayValue ohne values zu []', () => {
    expect(unpackValue({ arrayValue: {} })).toEqual([]);
  });
  it('entpackt mapValue zu Objekt', () => {
    expect(unpackValue({ mapValue: { fields: { x: { stringValue: 'y' } } } })).toEqual({ x: 'y' });
  });
  it('liefert null für null/undefined', () => {
    expect(unpackValue(null)).toBeNull();
    expect(unpackValue(undefined)).toBeNull();
  });
  it('liefert null für unbekannten Typ', () => {
    expect(unpackValue({ geoPointValue: {} })).toBeNull();
  });
});

describe('unpackFields', () => {
  it('entpackt eine Feld-Map', () => {
    expect(unpackFields({ a: { stringValue: 'x' }, b: { integerValue: '3' } }))
      .toEqual({ a: 'x', b: 3 });
  });
  it('liefert {} für leere Felder', () => {
    expect(unpackFields({})).toEqual({});
  });
});

describe('fetchGyms', () => {
  afterEach(() => { vi.unstubAllGlobals(); });

  it('filtert nicht-public, baut Label/City-Fallbacks, paginiert und sortiert', async () => {
    const page1 = {
      documents: [
        {
          name: 'projects/x/databases/(default)/documents/locations/b-gym',
          fields: {
            displayName: { stringValue: 'Boulder B' },
            status: { stringValue: 'public' },
            address: { stringValue: 'Berlin' },
          },
        },
        {
          name: 'projects/x/databases/(default)/documents/locations/closed',
          fields: { displayName: { stringValue: 'Zu' }, status: { stringValue: 'closed' } },
        },
      ],
      nextPageToken: 'tok',
    };
    const page2 = {
      documents: [
        {
          name: 'projects/x/databases/(default)/documents/locations/a-gym',
          fields: {
            locationName: { stringValue: 'A Gym' },
            address: { mapValue: { fields: { city_name: { stringValue: 'Potsdam' } } } },
          },
        },
      ],
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => page1 })
      .mockResolvedValueOnce({ ok: true, json: async () => page2 });
    vi.stubGlobal('fetch', fetchMock);

    const gyms = await fetchGyms();

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('pageToken=tok');
    // 'closed' gefiltert, nach label sortiert: 'A Gym' vor 'Boulder B'
    expect(gyms.map(g => g.label)).toEqual(['A Gym', 'Boulder B']);
    expect(gyms[0]).toMatchObject({ locationId: 'a-gym', label: 'A Gym', city: 'Potsdam' });
    expect(gyms[1]).toMatchObject({ locationId: 'b-gym', label: 'Boulder B', city: 'Berlin' });
    expect(gyms[0].normKey).toBe('a gym potsdam');
  });

  it('wirft bei HTTP-Fehler', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    await expect(fetchGyms()).rejects.toThrow('HTTP 500');
  });

  it('nutzt beim displayName-Objekt den en-Wert vor de', async () => {
    const page = {
      documents: [
        {
          name: 'projects/x/databases/(default)/documents/locations/g',
          fields: {
            displayName: { mapValue: { fields: { en: { stringValue: 'Gym EN' }, de: { stringValue: 'Halle DE' } } } },
          },
        },
      ],
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => page }));
    const gyms = await fetchGyms();
    expect(gyms[0].label).toBe('Gym EN');
  });
});
