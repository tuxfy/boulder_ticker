-   **Title** Unit-Tests — View-Laufzeitverhalten
-   **Status** new

# Anforderung

Das **umgebungs- und zeitgebundene Laufzeitverhalten** der Views `timer` und `gym` soll mit **Unit-Tests** abgesichert werden — die komplexe Hälfte (B), die aus der Basis-Anforderung [[12 unit-tests]] bewusst ausgeklammert wurde. Im Gegensatz zur dort abgedeckten reinen Logik (Hälfte A: `nextPhase`, `formatTime`, `buildLine`, `rankGyms`) hängt dieses Verhalten an Fake-Timern, gemockten Browser-APIs und DOM.

Die ausgelieferte App bleibt buildfrei; Tests sind reine Dev-Abhängigkeit.

# Hintergrund

Nach [[12 unit-tests]] ist die rein extrahierbare View-Logik abgedeckt. Übrig bleibt das Verhalten, das sich nicht ohne Weiteres aus DOM/Zeit/APIs lösen lässt und daher dieselbe Komplexitätsklasse wie [[unit-tests-audio]] hat:

- **timer** – der Lauf: `setInterval`-Tick, Beeps an Schwellen (≤ 3 s, 0 s), WakeLock, Auto-Reset nach „done", `visibilitychange`-Reaktivierung.
- **gym** – die Orchestrierung: async `refreshGymCache` (`fetchGyms` + `Date.now`-TTL + `setJSON`), Cache-Ablauf, `onGymScreenOpen`-Fluss (Hit/Miss/Fehler → Statustext), `gymRefresh`-Buttonzustände, DOM-Rendering der Trefferliste.

Diese Pfade sind heute nur über E2E (`timer.spec.js`, `gym.spec.js`) abgedeckt — grob und langsam.

**Red-Green-Hinweis:** Wie bei [[12 unit-tests]] ändert sich kein Nutzerverhalten; die Tests pinnen Ist-Verhalten und sind von Beginn an grün. Das Kriterium „ohne die Änderung rot" entfällt.

# Werkzeug

- **Vitest** mit jsdom — Setup siehe [[12 unit-tests]].
- `vi.useFakeTimers()` für Tick-/Timeout-/Intervall-Verhalten und zur Kontrolle von `Date.now` (TTL).
- Mocks: Audio (`playBeep`/`playFinish`/`unlockAudio`), WakeLock (`requestWakeLock`/`releaseWakeLock`), `fetch` (für `fetchGyms`), DOM via jsdom.
- Voraussetzung: Die Views müssen ihre Laufzeitfunktionen für Tests zugänglich machen (gezielte Extraktion/Export, ohne Verhaltensänderung) — Umfang in der Ausschärfung festzulegen.

# Umfang

- **timer-Lauf:** Tick dekrementiert `timeLeft`; Beep bei ≤ 3 s; Beep + Phasenwechsel bei 0 s (verdrahtet mit `nextPhase` aus [[12 unit-tests]]); Start/Reset schalten Config-/Display-Ansicht und Interval/WakeLock; Pause-Toggle; Auto-Reset 2,5 s nach „done"; `visibilitychange` fordert WakeLock erneut an.
- **gym-Orchestrierung:** `refreshGymCache` schreibt Cache mit Zeitstempel; `gymCacheLoad` respektiert die TTL (frisch vs. abgelaufen); `onGymScreenOpen` (Cache-Hit, Miss→Fetch, Fetch-Fehler→Statustext); `gymRefresh` (Button „…"/disabled, Erfolg, Fehlerpfad); `gymRenderList`/`gymSelect` (Listen-Markup, „Keine Treffer", Auswahl markiert, Auswahl persistiert + Navigation).

# Abgrenzung

- Kleinere rein pure Reste, die hier mitlaufen können, aber kein eigenes Mocking brauchen: `escHtml` (gym), Parameter-Clamping (`adjustParam`/`clampParam`/`onParamInput`, timer), `changeTries` (boulderlog).
- Nicht Teil: `scanner.js`/`audio.js` (eigene Dokumente [[unit-tests-scanner]], [[unit-tests-audio]]) und `menu` (reine Navigations-Verdrahtung).

# Akzeptanzkriterien

-   [ ] Laufzeitfunktionen von `timer`/`gym` für Tests zugänglich gemacht (Extraktion/Export ohne Verhaltensänderung)
-   [ ] Unit-Tests timer-Lauf: Tick-Dekrement, Beep-Schwellen, Start/Reset-Umschaltung, Pause, Auto-Reset nach „done", `visibilitychange` (Fake-Timer + Audio-/WakeLock-Mocks)
-   [ ] Unit-Tests gym-Orchestrierung: `refreshGymCache`/TTL, `onGymScreenOpen` (Hit/Miss/Fehler), `gymRefresh` (Zustände/Fehler), `gymRenderList`/`gymSelect` (Markup, Auswahl, Navigation)
-   [ ] `npm test` läuft nach der Umsetzung grün durch (vom Nutzer ausgeführt und bestätigt)
-   [ ] timer/gym bei nutzerrelevanten Änderungen zusätzlich manuell per `npx serve` verifiziert
-   [ ] `README.md`/`AGENTS.md` bei Bedarf ergänzt
