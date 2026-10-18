-   **Title** Unit-Tests
-   **Status** done

# Anforderung

Das Projekt soll eine **Unit-Test-Ebene** erhalten, die die ausgelagerten Logik-Module unter `src/core/` **sowie die rein extrahierbare Logik aus den Views** isoliert und schnell absichert — ergänzend zur bestehenden E2E-Suite, nicht als Ersatz. Die Unit-Tests pinnen das **aktuelle, korrekte Verhalten** fest (Sicherheitsnetz / Characterization-Tests), damit künftige Umbauten Regressionen in der reinen Logik sofort sichtbar machen — ohne den langsamen Browser-Durchlauf.

Die ausgelieferte App bleibt **buildfrei**; die Unit-Infrastruktur ist reine Dev-Abhängigkeit (wie Playwright).

# Hintergrund

Zum Zeitpunkt der E2E-Anforderung ([[09 e2e-tests]]) wurden Unit-Tests bewusst ausgeklammert, „bis der Code modularisiert ist". Mit dem abgeschlossenen Refactor ([[11 refactor-index-architektur]]) ist diese Vorbedingung erfüllt: Die ehemals in `index.html` vermischte Logik liegt nun als eigenständige ES-Module in `src/core/` vor und ist ohne DOM-Drumherum testbar.

Heute deckt ausschließlich Playwright ab. Reine Logik — Firestore-Antworten entpacken, Strings normalisieren, localStorage-JSON robust lesen, Hash-Routen auflösen — wird dadurch nur **indirekt und langsam** über komplette Nutzerflüsse geprüft. Mit der Umstellung auf TDD ([[c2e1b8f]] „changes workflow to tdd") wird ein **schneller innerer Red-Green-Takt** wertvoll, den E2E nicht liefert.

**Besonderheit zum Red-Green-Ablauf:** Diese Anforderung ändert kein Nutzerverhalten — der Liefergegenstand *sind* die Tests gegen bereits funktionierenden Code. Die übliche Reihenfolge „Test zuerst rot" greift hier nicht sinnvoll; die Tests sind von Beginn an grün und dokumentieren den Ist-Zustand. Das Kriterium „ohne die Änderung rot" entfällt daher für diese Anforderung bewusst (gedeckt durch die Ausnahme in `AGENTS.md`).

# Werkzeug

- **Vitest** als Unit-Test-Framework (Dev-Abhängigkeit): natives ESM ohne Build-Schritt, schnell, DOM-Umgebung zuschaltbar für Module, die Browser-APIs brauchen.
- DOM-Umgebung: **jsdom** (reifer, näher am echten Browser, bessere API-Abdeckung — auch für den später geplanten Scanner-Test).
- Umgebung pro Testdatei:
    - **node** für reine Logik ohne Browser-APIs (`api.js`-Entpacken/Normalisieren).
    - **jsdom** für Module mit Browser-APIs: `store.js` (`localStorage`), `router.js` (`window`, `location.hash`, `document`).
- `fetch` wird in Tests zu `fetchGyms` gemockt (kein echter Netzwerkzugriff).

# Umfang

Erste abgedeckte Module (bestes Preis-Leistungs-Verhältnis, reine/verzweigungsreiche Logik):

- **`src/core/api.js`**
    - `unpackValue` — alle Firestore-Typzweige (string, integer, double, boolean, array, map, leer/`null`)
    - `unpackFields` — Feld-Map rekursiv entpacken
    - `normalizeStr` — NFKD, Diakritika-Entfernung, Sonderzeichen, Whitespace-Kollaps, leere Eingabe
    - `fetchGyms` — mit gemocktem `fetch`: Label-/City-Fallbacks (String vs. Objekt), `status !== 'public'`-Filter, Paginierung über `nextPageToken`, Sortierung, HTTP-Fehler → `throw`
- **`src/core/store.js`**
    - `getJSON` — gültiges JSON, **kaputtes JSON → `null`** (try/catch-Pfad), fehlender Key
    - `setJSON`/`get`/`set`/`remove` — Grundverhalten gegen die definierten `KEYS`
- **`src/core/router.js`**
    - Hash → aktive Ansicht (`#/timer` etc.), unbekannte Route → `fallback`, leerer Hash
    - `navigate` setzt `location.hash` korrekt

Zusätzlich — **rein extrahierbare View-Logik (Hälfte A)**: Logik, die nur eine kleine Extraktion aus DOM/Template braucht und danach ohne exotisches API-Mocking testbar ist. Die Views importieren die extrahierten Funktionen; ihr Verhalten bleibt unverändert.

- **`src/views/timer/timer.logic.js`** — `nextPhase(state, cfg)` (Phasen-Zustandsmaschine, aus `advancePhase` herausgelöst) und `formatTime`.
- **`src/views/boulderlog/boulderlog.logic.js`** — `buildLine` (Zeilen-Formatierung, Singular/Plural, send, Stil).
- **`src/views/gym/gym.logic.js`** — `rankGyms(cache, q, sel)` (Such-/Ranking-Logik, aus `gymSearch` herausgelöst).

**Abgrenzung:** Abgedeckt sind die bereits isolierten `src/core/`-Module **und** die rein extrahierbare View-Logik (Hälfte A, siehe Umfang) — alles, was ohne exotisches API-Mocking testbar ist (höchstens eine kleine Extraktion).

Nicht Teil dieser Anforderung, jeweils als **eigene Folgeanforderung**, weil umgebungs-/API-gebunden (Fake-Timer, `AudioContext`, Kamera, async/Cache):

- `scanner.js` / `audio.js` (Kamera / `AudioContext`): [[unit-tests-scanner]], [[unit-tests-audio]].
- **View-Laufzeitverhalten (Hälfte B)** — Timer-Lauf (Tick-Schleife, Beeps, WakeLock, `visibilitychange`) und gym-Refresh/Cache (async `fetchGyms`, TTL, DOM-Status): [[unit-tests-view-runtime]].
- `menu`: reine Navigations-Verdrahtung — kein Unit-Test-Bedarf.

# Ausführung

- Neues Script **`npm run test:unit`** (Vitest).
- Integration (festgelegt): bestehendes `test` wird zu `test:e2e` umbenannt; **`npm test` führt beide Ebenen aus** (`test:unit` zuerst, dann E2E). So deckt das in `AGENTS.md` verankerte Kriterium „`npm test` läuft grün durch" transparent weiterhin alles ab. Bestehende Scripts (`test:webkit`, `test:all`, `test:ui`, `test:report`) bleiben erhalten.
- **CI** ([[10 ci-cd-deploy-gating]]): Unit-Tests als eigener Schritt **vor** dem Playwright-Browser-Install und den E2E-Tests (Fail-fast — Logikfehler stoppen die Pipeline, bevor die teure Browser-Installation läuft). Deploy-Gate bleibt unverändert.
- Hinweis: Die Installation der Dev-Abhängigkeit (`npm i -D vitest …`) führt der **Nutzer** aus (keine Toolchain-Installation in der Sandbox).

# Ablage

- Festgelegt: Unit-Tests **co-lokalisiert** neben den Modulen als `src/core/*.test.js` — konsistent zum Co-Location-Prinzip des Refactors ([[11 refactor-index-architektur]]). E2E-Tests bleiben unter `tests/`.
- Die Testpfade werden sauber getrennt konfiguriert: Vitest `include` nur `src/**/*.test.js`, Playwright weiterhin nur `tests/` — damit kein Runner die Dateien des anderen aufsammelt.

# Akzeptanzkriterien

-   [x] Vitest als Unit-Test-Framework eingerichtet (Dev-Abhängigkeit, App bleibt buildfrei)
-   [x] DOM-Umgebung (jsdom) für Module mit Browser-APIs konfiguriert
-   [x] Script `npm run test:unit` vorhanden; Unit- und E2E-Pfade sauber getrennt (kein Runner sammelt fremde Dateien)
-   [x] `npm test` führt Unit- und E2E-Tests aus (`test` → `test:e2e` umbenannt; `test:unit` zuerst, dann E2E)
-   [x] Unit-Tests `api.js`: `unpackValue` (alle Typzweige), `unpackFields`, `fetchGyms` (gemocktes `fetch`: Fallbacks, Public-Filter, Paginierung, Sortierung, HTTP-Fehler)
-   [x] Unit-Tests `store.js`: `getJSON` inkl. kaputtes JSON → `null`, plus `setJSON`/`get`/`set`/`remove`
-   [x] Unit-Tests `router.js`: Hash → aktive Ansicht, unbekannte Route → `fallback`, leerer Hash, `navigate`
-   [x] Reine View-Logik extrahiert (ohne Verhaltensänderung): `timer.logic.js` (`nextPhase`, `formatTime`), `boulderlog.logic.js` (`buildLine`), `gym.logic.js` (`rankGyms`, `escHtml`); Views importieren die Funktionen
-   [x] Geteilte Text-Helfer in `src/core/text.js` (`normalizeStr`, `gymNormKey`) — von `api.js` und `gym.logic.js` genutzt (reine Logik ohne Netz-Import), mit Tests
-   [x] `sw.js` aktualisiert: `src/core/text.js` und die drei `.logic.js`-Module in der `SHELL`-Liste, `CACHE`-Version hochgezählt (Offline-Start bleibt intakt)
-   [x] Unit-Tests `timer.logic.js`: `nextPhase` (prep→work, work→rest, rest→work mit workIdx++, work→set-pause, set-pause→work mit setIdx++/workIdx-Reset, letztes Work im letzten Set→done), `formatTime`
-   [x] Unit-Tests `boulderlog.logic.js`: `buildLine` (Singular/Plural, send, Stil, kombiniert)
-   [x] Unit-Tests `gym.logic.js`: `rankGyms` (ohne Cache, ohne Query inkl. gewählte Halle oben, Token-Filter, Ranking exakt/Präfix/Substring, Fallback ohne `normKey`) und `escHtml`
-   [x] CI führt die Unit-Tests als eigenen Schritt vor den E2E-Tests aus (Fail-fast); Deploy-Gate unverändert
-   [x] `npm test` läuft nach der Umsetzung grün durch
-   [x] `README.md` wird um das Ausführen der Unit-Tests ergänzt
-   [x] `AGENTS.md` wird geprüft/ergänzt, falls sich die Formulierung zum Test-Workflow ändert (bislang nur „Playwright-Test ergänzen")
