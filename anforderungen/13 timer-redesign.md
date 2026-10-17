-   **Title** Timer Redesign (Mockup)
-   **Status** done

# Anforderung

Die **Laufansicht** des Workout-Intervall-Timers (Anforderung 03) wird optisch auf das Mockup umgestellt: großer Kreis-Fortschritt, Phasen-Akzentfarbe im Hintergrund, Segment-Balken pro Runde, „Als Nächstes"-Hinweis und drei Steuer-Buttons (Reset / Start-Pause / Skip). Die bestehende Funktion (Phasenablauf, Audio, Wake Lock, Persistenz, Konfig-Form) bleibt unverändert — es geht um das Aussehen und das visuelle Verhalten der Laufansicht. Einzige bewusste Verhaltensänderung: der automatische Rücksprung zur Form nach Timer-Ende entfällt zugunsten eines DONE-Screens (siehe offene Entscheidung 4).

# Hintergrund

Die Funktion des Timers steht (03, `done`). Das Mockup aus Claude Design (`anforderungen/mockups/timer/Timer.dc.html` + `support.js`) zeigt eine deutlich hochwertigere Laufansicht. Das ist der erste Mockup-Fall nach dem überarbeiteten Ablauf in `AGENTS.md` → zugleich Probelauf für den Prozess „portieren + Unit-Test statt Harness".

# Mockup-Spezifikation

Quelle: `anforderungen/mockups/timer/Timer.dc.html` (Vorschau: gebündeltes Artifact). Werte wörtlich aus der Quelle.

## Was man sieht

-   [ ] Container: max-width `430px`, Höhe `100vh` (min `640px`), zentriert, Spalten-Flex, `color:#f3f4f2`, `overflow:hidden`
-   [ ] Hintergrund wechselt je Phase mit `transition:background 600ms ease`: Work `oklch(0.21 0.045 50)`, Rest `oklch(0.21 0.045 155)`, Fertig `oklch(0.18 0.01 150)`
-   [ ] Schrift: systemeigener Grotesk-Stack (`-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`) statt Archivo/CDN — Gewichte 400–800 wie im Mockup genutzt
-   [ ] Header: `display:flex`, `align-items:center`, `justify-content:space-between`, padding `18px 20px 8px`. Titel „Timer" links (`17px/700`, `letter-spacing:-0.01em`). Button „Tools" rechts (`height:40px`, padding `0 14px`, `radius:12px`, Rand `rgba(255,255,255,0.10)`, bg `rgba(255,255,255,0.06)`, Farbe `#e6e8e5`, `14px/600`, `gap:8px`, 2×2-Punkt-Icon) — *entfällt, siehe Modell abgleichen*
-   [ ] Zeile mit zwei Chips „Work X / Y" / „Set X / Y" (App-Wording, nicht „Runde/Satz"): `display:flex`, `justify-content:center`, `gap:28px`, padding `32px 20px 0`; `16px/600`, `text-transform:uppercase`, `letter-spacing:0.04em`, `rgba(255,255,255,0.6)`; Werte `#fff`, `font-variant-numeric:tabular-nums`
-   [ ] Hauptbereich (`main`): `flex:1`, Spalten-Flex, `align-items:center`, `justify-content:center`, `gap:28px`, padding `0 20px` — zentriert Kreis, Segment-Balken und Pille vertikal
-   [ ] Kreis-Fortschritt `300×300` (max `78vw`/`78vh`), `position:relative`, SVG `viewBox 0 0 300 300`, `width/height:100%`, um `-90deg` gedreht
    -   [ ] Track-Kreis: `r=138`, `stroke rgba(255,255,255,0.08)`, `stroke-width:10`
    -   [ ] Fortschritt-Kreis: `r=138`, `stroke=accent`, `stroke-width:10`, `linecap:round`, `dasharray:867.08`, `dashoffset=dashOffset`, `transition:stroke-dashoffset 120ms linear, stroke 600ms ease`
    -   [ ] Mitte (`position:absolute`, `inset:0`, Spalten-Flex, `align-items:center`, `justify-content:center`, `gap:6px`):
        -   [ ] Phasen-Label: `15px/800`, `letter-spacing:0.28em`, **`padding-left:0.28em`** (kompensiert die Laufweite fürs optische Zentrieren), Farbe=accent, `transition:color 600ms ease`
        -   [ ] Zeit: `88px/800`, `letter-spacing:-0.04em`, `line-height:1`, `font-variant-numeric:tabular-nums`
        -   [ ] Sub-Label: `14px/500`, `rgba(255,255,255,0.55)`
-   [ ] Akzentfarbe je Phase (`transition:color 600ms ease`): Work `oklch(0.78 0.16 55)`, Rest `oklch(0.78 0.16 150)`, Fertig `oklch(0.85 0.02 150)`
-   [ ] Segment-Balken: Reihe, `gap:6px`, `width:100%` max `300px`; je Balken `height:6px`, `radius:3px`, bg `rgba(255,255,255,0.1)`, `overflow:hidden`; Füllung `height:100%`, `width=seg.fill`, Farbe `seg.color`, `radius:3px`, `transition:width 120ms linear`
-   [ ] „Als Nächstes"-Pille: `min-height:44px`, `display:flex`, `align-items:center`, `gap:10px`, padding `0 16px`, `radius:12px`, bg `rgba(0,0,0,0.22)`, `14px/500`, `rgba(255,255,255,0.7)`; davor farbiger Punkt (`8px`, rund, `nextColor`)
-   [ ] Footer: Grid `64px 1fr 64px`, `align-items:center`, `gap:16px`, padding `16px 20px 32px`. Buttons jeweils zentrierter Inhalt (`display:flex`, `align-items:center`, `justify-content:center`)
    -   [ ] Reset-Button: `height:64px`, `radius:20px`, Spalten-Flex, `gap:4px`, Farbe `#ff8a7a`, `12px/700`; Icon „↺" (`22px`, `line-height:1`) über Label „Reset"
    -   [ ] Toggle-Button: `height:72px`, `radius:24px`, bg=accent, Farbe `#0d120e`, `19px/800`, `gap:12px` (Icon neben Label); Play-/Pause-Icon + Label; `active:scale(0.97)`, `transition:background 600ms ease, transform 120ms ease`
    -   [ ] Skip-Button: `height:64px`, `radius:20px`, Spalten-Flex, `gap:4px`, `12px/700`; Icon „⇥" (`22px`, `line-height:1`) über Label „Skip"

## Was es tut (Formeln — wörtlich aus `renderVals()`)

-   [ ] `fmt(ms)`: `s = max(0, ceil(ms/1000))` → `floor(s/60) + ':' + pad2(s%60)`
-   [ ] `prog = done ? 1 : 1 - remaining/step.dur`
-   [ ] `dashOffset = (867.08 * (1 - prog)).toFixed(2)`
-   [ ] Segmente je Runde `r`: `fill=1` wenn `done || r < step.round`; bei `r === step.round`: `fill = (step.phase==='rest' ? 1 : prog)`; sonst `0`. Farbe = Work-Akzent (bei `done` die Done-Akzentfarbe)
-   [ ] Phasen-Label: `WORK` / `REST` / `DONE`
-   [ ] Sub-Label: Fertig → „Alle Sätze geschafft", Work → „Gib alles", Rest → „Durchatmen"
-   [ ] `roundLabel = step.round + ' / ' + rounds`, `setLabel = step.set + ' / ' + sets`
-   [ ] „Als Nächstes": Fertig → „Workout beendet"; sonst mit Folge-Schritt → „Als Nächstes: " + Work/Rest + " · " + `fmt(next.dur)`; sonst „Letzte Runde"
-   [ ] `nextColor`: Fertig / kein Folge-Schritt → `rgba(255,255,255,0.4)`, sonst Akzentfarbe der Folge-Phase
-   [ ] Toggle-Label: Fertig → „Neu starten", läuft → „Pause", schon gestartet → „Weiter", sonst „Start"

## Was weggelassen wird / nicht aus dem Mockup kommt

-   Das Mockup kennt **nur Work/Rest** mit `rounds`×`sets` — **keine Vorbereitung** und **keine Set-Pause**. Die App hat beides (03). → Modell-Abweichung, siehe unten.
-   Mockup zeigt **nur die Laufansicht** — keine Konfig-Form, kein Audio, kein Wake Lock, kein localStorage. Diese App-Teile bleiben wie in 03 und werden hier **nicht** vom Mockup-Abgleich erfasst.
-   Der „Tools"-Button im Header ist Mockup-Deko und wird **nicht** übernommen.

# Modell abgleichen (entschieden)

Das Mockup ist eine **Teilmenge** des App-Modells. Grundsatz: **Die bestehende Logik aus 03 bleibt unverändert**, das Mockup-Design wird nur darüber gelegt.

1.  **Vorbereitung & Set-Pause:** bleiben als Phasen wie in 03. Das Mockup-Farbschema wird auf das bestehende Modell gemappt — Work → Work-Akzent (`oklch(0.78 0.16 55)`), Rest **und** Set-Pause → Rest-Akzent (`oklch(0.78 0.16 150)`, grün wie bisher), Vorbereitung → neutraler Akzent (`oklch(0.85 0.02 150)`). Phasen-Labels „WORK" / „REST" / „PAUSE" / „GET READY" / „DONE".
2.  **Segment-Balken:** folgen der Mockup-Formel über das bestehende Schrittmodell (Balken = Runden des aktuellen Sets).
3.  **„Tools"-Button:** reine Mockup-Deko, wird **weggelassen** (keine Funktion, nicht übernommen).
4.  **Scope:** nur die Laufansicht. **Konfig-Form bleibt unberührt.**

# Entscheidungen (Modell-Abgleich im Detail)

Diese Punkte entstehen, wo das Mockup-Modell (nur work/rest, kontinuierliche ms) auf das bestehende App-Modell (prep/set-pause, Ganzsekunden) trifft. Alle geklärt.

1.  **Zeitauflösung (Ring-/Balken-Animation):** App tickt in **Ganzsekunden** (`setInterval(…, 1000)`, `timer.js:162`), das Mockup kontinuierlich in **ms** (`prog = 1 - remaining/dur`, Tick 100 ms) — das treibt den flüssigen Ring. Bei Ganzsekunden springt der Ring in 1-s-Schritten.
    - **Entschieden (A):** Fortschritt auf ms heben — Rendering per `requestAnimationFrame` (oder 100-ms-Tick) aus einer ms-`remaining`-Zeit, ohne die Phasen-Zustandsmaschine (`nextPhase`) zu ändern. Beep-/Phasenwechsel-Logik bleibt sekundenbasiert. Ring und Segment-Balken gleiten wie im Mockup.
2.  **App-eigene Phasen (GET READY, PAUSE) in den Mockup-Formeln:** Mockup definiert Segmente/Sub-Label/„Als Nächstes" nur für work/rest/done.
    - **Entschieden:** GET READY → Balken alle leer, Sub-Label „Mach dich bereit", „Als Nächstes: Work · {Dauer der ersten Work-Phase}". PAUSE (Set-Pause) → Balken des gerade beendeten Sets bleiben **voll stehen** (grün) bis der erste Work des neuen Sets startet, Sub-Label „Satz geschafft – kurz durchatmen", „Als Nächstes: Work · {Dauer}" (erster Work des nächsten Sets).
3.  **Offline-Font:** „Archivo" kommt im Mockup per Google-Fonts-CDN; die App ist Offline-PWA mit Service Worker.
    - **Entschieden:** **kein Webfont/CDN.** Archivo wird durch einen systemeigenen Grotesk-Stack ersetzt, der dem Mockup nahekommt — z. B. `-apple-system, system-ui, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`. Vollständig offline, nichts zu bündeln. Optik kommt dem Mockup nahe, ist aber geräteabhängig (iOS: San Francisco) — bewusst akzeptiert.
4.  **„Done"-Verhalten:** App springt nach Ende per `setTimeout(…, 2500)` zurück zur Konfig-Form und zeigt „—" (`timer.js:187`); Mockup hat einen DONE-Screen mit „0:00" und Button „Neu starten".
    - **Entschieden:** DONE-Screen des Mockups zeigen (Zeit „0:00", Phase „DONE", neutraler Akzent, Sub-Label „Alle Sätze geschafft", Toggle-Label „Neu starten"), **kein** Auto-Rücksprung. „Neu starten" startet denselben Workout erneut, „Reset" führt wie bisher zur Form zurück. Der `setTimeout`-Auto-Rücksprung aus 03 (`timer.js:187`) **entfällt bewusst**.

### Kleinere Punkte
5.  **Label „Runde/Satz" vs. „Work/Set":** **Entschieden:** Wording **„Work" / „Set" beibehalten** (nicht „Runde"/„Satz"). Das Zwei-Chip-Layout des Mockups wird übernommen, aber mit den App-Begriffen „Work X / Y" und „Set X / Y".
6.  **A11y:** **Entschieden:** `aria-label="Reset"` / `aria-label="Überspringen"` der Icon-Buttons aus dem Mockup übernehmen.
7.  **Konfig-Form-Optik:** **Entschieden:** bleibt im alten Stil; visueller Bruch zur neuen Laufansicht bewusst akzeptiert, Form in dieser Anforderung nicht anfassen.

# Akzeptanzkriterien

**Optik / Layout**
-   [x] Laufansicht entspricht der Mockup-Spezifikation „Was man sieht" (Maße, Farben inkl. oklch-Akzente, Layout, Textpositionen)
-   [x] Schrift über den systemeigenen Grotesk-Stack (kein Webfont/CDN, Entscheidung 3)
-   [x] Zwei-Chip-Zeile mit Wording „Work X / Y" und „Set X / Y" (Entscheidung 5)
-   [x] „Tools"-Button wird nicht übernommen
-   [x] Optik einmalig gegen die Vorschau abgeglichen (Farben/Abstände/Schrift)

**Animiertes Verhalten**
-   [x] Kreis-Ring und Segment-Balken laufen flüssig (ms-basierter Fortschritt, Entscheidung 1) — nicht in 1-s-Sprüngen
-   [x] Phasen-Akzentfarbe und Hintergrund wechseln je Phase gemäß Mapping (Work rot, Rest + PAUSE grün, GET READY/DONE neutral)
-   [x] Phasen-Labels „WORK" / „REST" / „PAUSE" / „GET READY" / „DONE"
-   [x] GET READY und PAUSE zeigen Segmente/Sub-Label/„Als Nächstes" gemäß Entscheidung 2 (beendeter Set bleibt in PAUSE voll)
-   [x] „Als Nächstes"-Hinweis und Sub-Label gemäß den portierten Formeln

**Logik / Tests**
-   [x] Die reinen Formeln (`fmt`, `prog`, `dashOffset`, Segment-Füllung, Label-/Als-Nächstes-Ableitung) liegen als pure Funktionen in `src/views/timer/timer.logic.js` (bestehendes Modul) und sind per Vitest gegen die Mockup-Werte abgesichert — ohne die Änderung rot
-   [x] Die Phasen-Zustandsmaschine `nextPhase` sowie Audio-, Wake-Lock- und Persistenz-Logik bleiben unverändert
-   [x] Icon-Buttons tragen `aria-label` (Reset / Überspringen, Entscheidung 6)

**Verhalten / Funktion**
-   [x] Bestehende Funktion (Phasenablauf, Audio, Wake Lock, Persistenz, Pause/Weiter/Reset/Skip) unverändert funktionsfähig
-   [x] Nach Timer-Ende erscheint der DONE-Screen (kein Auto-Rücksprung); „Neu starten" startet erneut, „Reset" führt zur Form (Entscheidung 4)
-   [x] Skip (neu, aus dem Mockup) überspringt die aktuelle Phase — E2E-abgesichert
-   [x] Konfig-Form bleibt unverändert (Entscheidung 7)

**Abschluss**
-   [x] Nach der Implementierung läuft `npm test` grün durch
-   [x] Lokaler Test durch den Nutzer per `npx serve` erfolgreich
-   [x] Service-Worker-Cache-Version in `sw.js` hochgezählt (App-Shell-Dateien geändert)
-   [x] ~~`README.md` wird um die Änderung ergänzt~~ — **n/a (vorläufig, Entscheidung B):** README ist reine Dev-/Architektur-Doku ohne Feature-/UI-Abschnitt; nutzerseitiges Verhalten steht in `anforderungen/`.
