-   **Title** Unit-Tests — Audio
-   **Status** new

# Anforderung

Das Audio-/Wake-Lock-Modul (`src/core/audio.js`) soll mit **Unit-Tests** abgesichert werden — die zweite Stufe zur Unit-Test-Basis aus [[12 unit-tests]], dort bewusst als optional ausgeklammert. Geprüft wird die **Verdrahtung der Web-Audio-/Wake-Lock-Aufrufe** gegen gemockte Browser-APIs, insbesondere die iOS-Reaktivierungslogik.

Die ausgelieferte App bleibt buildfrei; Tests sind reine Dev-Abhängigkeit.

# Hintergrund

`audio.js` ist heute **gar nicht automatisiert abgedeckt** — E2E kann `AudioContext` und `navigator.wakeLock` nicht sinnvoll prüfen, weshalb das Modul bisher nur manuell verifiziert wurde ([[09 e2e-tests]], [[11 refactor-index-architektur]]).

Besonders wertvoll als Regressionsnetz ist die Reaktivierungslogik in `getAudioCtx`: Der Kontext wird bei `state === 'suspended'` **oder** `'interrupted'` per `resume()` wiederbelebt. Der `'interrupted'`-Zweig ist genau der Fix aus [[08 pwa-sound-nach-geraetesperre]] (iOS setzt den Kontext beim Gerätesperren auf `interrupted`, nicht `suspended`). Ein Unit-Test pinnt diese leicht wieder brechende Fallunterscheidung fest.

**Red-Green-Hinweis:** Wie bei [[12 unit-tests]] ändert sich kein Nutzerverhalten; die Tests pinnen Ist-Verhalten und sind von Beginn an grün. Das Kriterium „ohne die Änderung rot" entfällt.

# Werkzeug

- **Vitest** mit jsdom — Setup und Begründung siehe [[12 unit-tests]].
- Modul-spezifische Mocks: ein Fake-`AudioContext` (`window.AudioContext`/`webkitAudioContext`) mit steuerbarem `state`, Spies auf `resume`, `createBuffer`/`createBufferSource`/`createOscillator`/`createGain`, `connect`, `start`/`stop`, `gain.setValueAtTime`/`exponentialRampToValueAtTime`; `navigator.wakeLock` als Mock (vorhanden/fehlend, `request`/`release`); `vi.useFakeTimers()` für `playFinish`.

# Umfang

- **`getAudioCtx`-Reaktivierung** (Kern): `state === 'suspended'` → `resume()` aufgerufen; `state === 'interrupted'` → `resume()` aufgerufen (Fix aus [[08 pwa-sound-nach-geraetesperre]]); `state === 'running'` → kein `resume()`. Geprüft indirekt über `unlockAudio`/`playBeep`.
- **`unlockAudio`:** erzeugt stillen 1-Sample-Buffer, verbindet Quelle mit `destination`, `start(0)`; wirft nie (Fehler werden geschluckt).
- **`playBeep`:** Oszillator+Gain verbunden, `frequency.value`/`type = 'sine'` gesetzt, Gain-Rampe `setValueAtTime` → `exponentialRampToValueAtTime`, `start`/`stop` mit korrektem Zeitversatz (`dur`); schluckt Fehler.
- **`playFinish`:** plant mit Fake-Timern **drei** Beeps (660 Hz) zu den Versätzen 0 / 0,18 / 0,36 s.
- **`requestWakeLock`/`releaseWakeLock`:** `wakeLock` nicht in `navigator` → No-Op; vorhanden → `request('screen')`; `release()` setzt internen Zustand zurück; Fehler werden geschluckt.

# Abgrenzung

Kein echtes Audio-Playback und keine echten Geräte werden geprüft — nur die korrekte Verdrahtung gegen gemockte APIs. Hörbare Verifikation (tatsächlicher Ton, Verhalten nach echtem Gerätesperren) bleibt **manuell** per `npx serve` auf dem Gerät.

# Akzeptanzkriterien

-   [ ] Fake-`AudioContext` und `navigator.wakeLock`-Mock für die Tests eingerichtet
-   [ ] Unit-Test: `getAudioCtx` ruft `resume()` bei `suspended` **und** `interrupted`, nicht bei `running`
-   [ ] Unit-Test: `unlockAudio` erzeugt/verbindet/startet stille Quelle und wirft nie
-   [ ] Unit-Test: `playBeep` verdrahtet Oszillator/Gain, setzt Frequenz/Typ/Rampe und `start`/`stop` mit `dur`-Versatz
-   [ ] Unit-Test: `playFinish` plant drei Beeps zu 0 / 0,18 / 0,36 s (Fake-Timer)
-   [ ] Unit-Test: `requestWakeLock`/`releaseWakeLock` — fehlendes API (No-Op), vorhandenes API, Fehler geschluckt
-   [ ] `npm test` läuft nach der Umsetzung grün durch (vom Nutzer ausgeführt und bestätigt)
-   [ ] Audio manuell per `npx serve` am Gerät verifiziert (hörbar, inkl. Verhalten nach Gerätesperren)
-   [ ] `README.md`/`AGENTS.md` bei Bedarf ergänzt (falls sich Audio-Verifikation/Test-Workflow ändert)
