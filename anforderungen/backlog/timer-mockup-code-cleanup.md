-   **Title** Timer: Mockup-Code-Schulden bereinigen
-   **Status** new

# Anforderung

Die beim Timer-Redesign (Anforderung 13) aus dem Mockup **1:1 mit-portierten Struktur-Schulden** werden bereinigt, ohne das Verhalten zu ändern. Es geht rein um Code-Qualität/Schichtentrennung, nicht um sichtbares Verhalten.

# Hintergrund

„Portieren statt paraphrasieren" (AGENTS.md, Mockup-Ablauf) bewahrt Werte und Formeln verlässlich — hat aber auch die Abkürzungen der Mockup-Quelle übernommen. Drei konkrete Punkte aus der Code-Nachschau zu Anforderung 13:

1. **Magische Geometrie-Konstante.** `CIRCUMFERENCE = 867.08` (`src/views/timer/timer.logic.js`) ist der gerundete Wert von 2·π·138. Der Radius `138` steht getrennt davon im SVG-Template (`timer.js`) und im CSS. Ändert jemand `r`, bricht der Ring lautlos — die Werte kennen sich nicht.
2. **Präsentationsdaten im Logik-Modul.** `phaseVisual` liefert oklch-**Farben** (`accent`/`bg`) aus `timer.logic.js` — Farben sind View-Belang. Zusätzlich Teil-Duplikation: die Prep/Done-Hintergrundfarbe steht sowohl in `VISUALS` (JS) als auch als Default im CSS (`#timer-display`).
3. **Vestigiales Feld.** `nextPhase` liefert weiterhin `timeLeft` (Sekunden), das die ms-basierte View nicht mehr nutzt; `formatTime` existiert nur noch für seinen eigenen Test.

# Verhalten

Keine Änderung am sichtbaren Verhalten. Laufansicht, Farben, Animation, Audio, Phasenablauf bleiben identisch.

# Umsetzungsideen (beim Ausschärfen zu bestätigen)

-   Zu 1: einen einzigen Radius als Quelle (z. B. `RING_RADIUS = 138`) und `CIRCUMFERENCE` daraus ableiten (`2 * Math.PI * RING_RADIUS`); SVG-`r`/`dasharray` aus derselben Quelle speisen. *Offen: Mockup nutzt exakt `867.08` (gerundet) — abgeleitet ergibt `867.0796…`; prüfen, ob das für den Ring sichtbar/irrelevant ist, sonst bewusst runden.*
-   Zu 2: Farben als eine Quelle führen und Präsentation von Inhalt trennen (Labels/Sub-Label bleiben, Farben zentralisieren — JS oder CSS-Custom-Properties als *eine* Wahrheit, keine Doppelung).
-   Zu 3: `timeLeft` aus `nextPhase` entfernen (und Tests anpassen); prüfen, ob `formatTime` noch gebraucht wird oder entfällt.

# Akzeptanzkriterien

-   [ ] Ring-Umfang wird aus einer einzigen Radius-Quelle abgeleitet; SVG-Radius und `dasharray` nutzen dieselbe Quelle
-   [ ] Farben haben genau eine Quelle (keine JS/CSS-Doppelung der Phasenfarben); Präsentation und Inhalt sind getrennt
-   [ ] `nextPhase` liefert kein ungenutztes `timeLeft` mehr; toter/nur-für-Test-Code (`formatTime`) bereinigt oder begründet behalten
-   [ ] Verhalten unverändert — bestehende Unit- und E2E-Tests bleiben grün (ggf. an die Signatur-Änderungen angepasst)
-   [ ] Ein Test sichert die abgeleitete Umfang-Formel ab (`CIRCUMFERENCE` ≈ 2·π·r) — ohne die Änderung rot
-   [ ] **`AGENTS.md` (Mockup-Ablauf, Schritt „Portieren") wird um eine Regel ergänzt, die diese Schulden künftig verhindert:** 1:1 portiert werden nur **Werte und Formeln**; beim Übernehmen gilt dennoch — (a) abgeleitete Größen **berechnen statt hardcoden** (z. B. Umfang aus dem Radius), (b) **Präsentation von Logik trennen** (keine Farben/Style-Werte ins Logik-Modul), (c) **keine vestigialen Felder** aus der Mockup-Struktur mitschleppen. Mit kurzer Begründung, dass „portieren" Fidelity der Werte meint, nicht Übernahme der Mockup-Architektur.
-   [ ] Nach der Implementierung läuft `npm test` grün durch
-   [ ] Service-Worker-Cache-Version in `sw.js` hochgezählt (App-Shell-Dateien geändert)

*README-AK entfällt: rein interne Code-Änderung ohne Konfiguration, Setup oder nutzerrelevantes Verhalten.*
