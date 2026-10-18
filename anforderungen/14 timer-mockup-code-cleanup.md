-   **Title** Timer: Mockup-Code-Schulden bereinigen
-   **Status** done

# Anforderung

Die beim Timer-Redesign (Anforderung 13) aus dem Mockup **1:1 mit-portierten Struktur-Schulden** werden bereinigt, ohne das Verhalten zu ändern. Es geht rein um Code-Qualität/Schichtentrennung, nicht um sichtbares Verhalten.

# Hintergrund

„Portieren statt paraphrasieren" (AGENTS.md, Mockup-Ablauf) bewahrt Werte und Formeln verlässlich — hat aber auch die Abkürzungen der Mockup-Quelle übernommen. Drei konkrete Punkte aus der Code-Nachschau zu Anforderung 13:

1. **Magische Geometrie-Konstante.** `CIRCUMFERENCE = 867.08` (`src/views/timer/timer.logic.js`) ist der gerundete Wert von 2·π·138. Der Radius `138` steht getrennt davon im SVG-Template (`timer.js`) und im CSS. Ändert jemand `r`, bricht der Ring lautlos — die Werte kennen sich nicht.
2. **Präsentationsdaten im Logik-Modul.** `phaseVisual` liefert oklch-**Farben** (`accent`/`bg`) aus `timer.logic.js` — Farben sind View-Belang. Zusätzlich Teil-Duplikation: die Prep/Done-Hintergrundfarbe steht sowohl in `VISUALS` (JS) als auch als Default im CSS (`#timer-display`).
3. **Vestigiales Feld.** `nextPhase` liefert weiterhin `timeLeft` (Sekunden), das die ms-basierte View nicht mehr nutzt; `formatTime` existiert nur noch für seinen eigenen Test.

# Verhalten

Keine Änderung am sichtbaren Verhalten. Laufansicht, Farben, Animation, Audio, Phasenablauf bleiben identisch.

# Umsetzung (ausgeschärft)

-   **Zu 1 (entschieden):** `RING_RADIUS = 138` als einzige Quelle, `CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS` daraus ableiten; SVG-`r` und `dasharray` aus denselben Konstanten speisen. Der **abgeleitete Wert** (`867.0796…`) wird direkt genutzt — **keine** Rückrundung auf `867.08` (sonst käme der Magic-Value durch die Hintertür zurück); Differenz zum Mockup ist visuell irrelevant.
-   **Zu 2 (entschieden):** Logik-Modul gibt **keine Farbstrings** mehr aus — nur Semantik: `phaseVisual` → `{ label, sub }`, `segmentFills` (Zahlen), `nextInfo` → `{ text, tone }` mit `tone` als Token (`'work' | 'rest' | 'pause' | 'dim'`); `segmentColor` entfällt. Farben leben **ausschließlich in `timer.css`**, gescopet auf `#timer-display[data-phase=…]` via Custom Properties (`--accent`/`--bg`/`--seg`); die View setzt nur noch `dataset.phase`/`tone`.
    -   *Globale Styles:* `base.css` hat **kein** `:root`-Token-System (Shell-Farben hartkodiert, jede View besitzt ihre Farben). Die Phasenfarben bleiben daher **lokal** in `timer.css` — **nicht** nach `:root`/`base.css` heben, **nicht** mit der globalen Hex-Palette vereinheitlichen (bewusster Flächen-Bruch, Entscheidung 7 aus Anforderung 13). Eine app-weite Design-Token-Ebene ist ein separates Vorhaben, hier out of scope. Die Config-View bleibt unberührt (globale Shell-Styles).
-   **Zu 3 (entschieden):** `timeLeft` aus `nextPhase` entfernen (liefert dann nur noch `{ phase, workIdx, setIdx, … }`), `nextPhase`-Tests entsprechend anpassen. `formatTime` **samt Test löschen** (toter Code, seit die View auf `formatMs` läuft — YAGNI, bei Bedarf aus dem Git-Verlauf). *Vor dem Löschen per Suche verifizieren, dass `timeLeft`/`formatTime` nirgends sonst gelesen werden; taucht doch eine Nutzung auf, bleibt das Betroffene und wird begründet.*

# Akzeptanzkriterien

-   [x] Ring-Umfang wird aus einer einzigen Radius-Quelle abgeleitet; SVG-Radius und `dasharray` nutzen dieselbe Quelle
-   [x] Farben haben genau eine Quelle — ausschließlich in `timer.css`, gescopet auf `#timer-display[data-phase=…]`; keine Farbstrings im Logik-Modul, keine JS/CSS-Doppelung, nichts in `:root`/`base.css`
-   [x] `nextPhase` liefert kein `timeLeft` mehr; `formatTime` samt Test gelöscht (vorher Suche: keine andere Nutzung von `timeLeft`/`formatTime`)
-   [x] Verhalten unverändert — bestehende Unit- und E2E-Tests bleiben grün (ggf. an die Signatur-Änderungen angepasst)
-   [x] Ein Test sichert die abgeleitete Umfang-Formel ab (`CIRCUMFERENCE` ≈ 2·π·r) — ohne die Änderung rot
-   [x] **`AGENTS.md` (Mockup-Ablauf, Schritt „Portieren") wird um eine Regel ergänzt, die diese Schulden künftig verhindert:** 1:1 portiert werden nur **Werte und Formeln**; beim Übernehmen gilt dennoch — (a) abgeleitete Größen **berechnen statt hardcoden** (z. B. Umfang aus dem Radius), (b) **Präsentation von Logik trennen** (keine Farben/Style-Werte ins Logik-Modul), (c) **keine vestigialen Felder** aus der Mockup-Struktur mitschleppen. Mit kurzer Begründung, dass „portieren" Fidelity der Werte meint, nicht Übernahme der Mockup-Architektur.
-   [x] Nach der Implementierung läuft `npm test` grün durch
-   [x] Service-Worker-Cache-Version in `sw.js` hochgezählt (App-Shell-Dateien geändert)

*README-AK entfällt: rein interne Code-Änderung ohne Konfiguration, Setup oder nutzerrelevantes Verhalten.*
