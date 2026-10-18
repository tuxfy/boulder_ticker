-   **Title** Timer: Konfig-Formular Redesign
-   **Status** done

# Anforderung

Die **Konfigurations-Ansicht** des Timers (die Parameter-Eingabe vor dem Start) wird optisch überarbeitet. Beim Redesign der Laufansicht (Anforderung 13) blieb das Formular bewusst im alten Stil — der visuelle Bruch zwischen moderner Laufansicht (dunkel/oklch/System-Grotesk) und der alten Form wurde als Entscheidung 7 akzeptiert. Diese Anforderung schließt den Bruch.

# Hintergrund

Aktueller Stand: `#timer-config` nutzt die globalen Shell-Styles (`.tool-content`, `.stepper`, `.btn-tools`) und `.timer-param*`/`.btn-timer-start` aus `timer.css`. Fünf Parameter (Work, Rest, Anzahl Work, Anzahl Sets, Set-Pause) als Stepper mit Texteingabe; Werte in localStorage. Die Laufansicht ist seit Anforderung 13 im Mockup-Stil.

# Vorgehen: Mockup-Port

**Mockup-Port** nach `AGENTS.md`. Quelle: `anforderungen/mockups/timer/Timer.dc.html` (um die `menuOpen`-Ansicht erweitert) + `support.js`. Preview = gebündeltes Artifact.

# Mockup-Spezifikation

## Was man sieht

-   [ ] Menü-Ansicht füllt den Bereich unter dem Header: `flex:1`, Spalten-Flex, padding `12vh 24px 32px`; Hintergrund **`#111`** (App-Dunkel, **nicht** die oklch-Phasenfläche)
-   [ ] Header („Timer" + „Tools") ist mit der Laufansicht geteilt und bleibt sichtbar
-   [ ] Felder in **zwei Gruppen**, je `border-top`/`border-bottom` `1px solid #1e1e1e`, Gruppen-Abstand `gap:28px`
-   [ ] Feldzeile: `display:flex; align-items:center; gap:12px; min-height:68px`
    -   [ ] Label links: `flex:1`, `padding-left:12px`, **farbige linke Kante** `border-left:3px solid {{edge}}`, `margin:14px 0`, `16px/500`, `#ccc`
    -   [ ] Stepper rechts: `width:124px; height:44px`, `radius:10px`, Rand `rgba(255,255,255,0.08)`, bg `#1e1e1e`; „−"/„+" (`40×44`, `20px`, `rgba(255,255,255,0.6)`, aria `Weniger`/`Mehr`), Wert mittig (`17px/600`, `#fff`, tabular-nums)
    -   [ ] Einheit ganz rechts: `width:12px`, `14px`, `#555` (`s` oder leer)
-   [ ] Start-Button unten: `margin-top:24px; height:54px`, `radius:12px`, bg `#fff`, `#111`, `17px/700`
-   [ ] **Farbkanten je Feld:** Sets neutral `#2a2a2a`, Set-Pause grün `oklch(0.78 0.16 150)`, Work orange `oklch(0.78 0.16 55)`, Rounds orange, Pause grün `oklch(0.78 0.16 150)`

## Was es tut

-   [ ] **Fünf Felder** (Mockup-Name → App-Parameter): Sets→`numSets`, Set-Pause→`setPause`, Work→`work`, Rounds→`numWork`, Pause→`rest`
-   [ ] **Reihenfolge/Gruppen:** Gruppe A [Sets, Set-Pause], Gruppe B [Work, Rounds, Pause]
-   [ ] **Schrittweiten (±):** Sets 1, Set-Pause 10, Work 5, Rounds 1, Pause 5
-   [ ] **Bereiche:** Sets 1–10, Set-Pause 0–900, Work 5–600, Rounds 1–30, Pause 0–600
-   [ ] **Eingabe:** nur Stepper (+/−), geklemmt auf Bereich — **kein** Textfeld
-   [ ] **Draft/Commit:** Änderungen laufen in einen `draft`; „Start" übernimmt den Draft und startet (`startFromMenu`). „Reset" aus der Laufansicht öffnet das Menü mit `draft = {...aktuelle Werte}`
-   [ ] **`dur == 0` → Phase entfällt:** Pause 0 bzw. Set-Pause 0 wird aus der Schrittfolge herausgefiltert (`steps().filter(dur>0)`)
-   [ ] Vorbereitung ist fix 10 s (wie bisher)

## Was weggelassen wird / nicht aus dem Mockup kommt

-   Das Mockup **persistiert nicht** (reiner Draft im State) — die App speichert in localStorage; muss im Abgleich geklärt werden.
-   Kein „Abbrechen"/Schließen im Menü außer über „Start".

# Scope: nur UI + Texte, keine Logik

**Grundsatz (entschieden):** reiner Reskin der Konfig-Ansicht + Label-Texte. **Keine** Änderung an `nextPhase`, Schrittweiten, Wertebereichen, Eingabe-Logik oder Persistenz.

## Modell abgleichen (entschieden)

1.  **Eingabe-Methode:** Textfeld **bleibt** (editierbarer Wert + Klemmen); die Stepper-Box wird nur optisch ans Mockup angeglichen. *(Entfernen = Verhaltensänderung → nein)*
2.  **Schrittweiten:** bleiben **±1**. *(Änderung = Verhalten → nein)*
3.  **Bereiche + 0-Skip:** **nicht** übernommen. Bereiche bleiben wie in der App (work/rest/setPause 1–600, numWork 1–30, numSets 1–20); kein „0 = Phase überspringen" (bräuchte `nextPhase`-Logik). *(Verhalten → nein)*
4.  **Benennung (Texte) — entschieden:** `rest` → **„Rest"**, `setPause` → **„Pause"**. Finale Formular-Labels: **Sets · Pause · Work · Rounds · Rest** (Gruppe A [Sets, Pause], Gruppe B [Work, Rounds, Rest]). Konsistent zur Laufansicht, die `rest`→„REST" und `set-pause`→„PAUSE" bereits so nutzt — dort **keine** Änderung nötig.
5.  **Gruppierung/Reihenfolge + Farbkanten:** **übernommen** (reine UI; Handler hängen an `data-param`, ordnungsunabhängig). Farbkanten: Sets neutral `#2a2a2a`, Pause (`setPause`) grün, Work orange, Rounds orange, Rest (`rest`) grün.
6.  **Persistenz:** **sofortige** localStorage-Persistenz bleibt (kein Draft-Muster). *(Verhalten → nein)*

# Akzeptanzkriterien

**Optik / Layout / Texte**
-   [x] Menü-Ansicht im Mockup-Layout: zwei Feldgruppen mit Trennlinien (`#1e1e1e`), farbige Label-Kanten (3px), Stepper-Box (`124×44`, `radius:10`, bg `#1e1e1e`, Rand `rgba(255,255,255,0.08)`), Start-Button (`#fff`, `height:54px`, `radius:12px`), Hintergrund `#111`
-   [x] Labels **Sets · Pause · Work · Rounds · Rest** in der Reihenfolge Gruppe A [Sets, Pause], Gruppe B [Work, Rounds, Rest]
-   [x] Farbkanten je Feld gemäß Mapping (Sets neutral, Pause/Rest grün, Work/Rounds orange)
-   [x] Stepper-Buttons tragen `aria-label` („Weniger"/„Mehr")
-   [x] Optik einmalig gegen die Vorschau abgeglichen

**Verhalten unverändert (keine Logik)**
-   [x] Stepper-Wert bleibt editierbares Textfeld (nur optisch angeglichen); Klemmen beim Verlassen wie bisher
-   [x] Keine Änderung an `nextPhase`, Schrittweiten (±1), Wertebereichen, Eingabe-Logik oder Persistenz (sofortiges localStorage)
-   [x] Laufansicht unverändert (nutzt „REST"/„PAUSE" bereits konsistent)

**Abschluss**
-   [x] Kein neuer Unit-Test (reiner UI-/Text-Reskin, nicht sinnvoll unit-testbar); bestehende Unit- und E2E-Tests bleiben grün — E2E ggf. an das neue Markup/die Labels angepasst
-   [x] Nach der Implementierung läuft `npm test` grün durch
-   [x] Lokaler Test durch den Nutzer per `npx serve` erfolgreich
-   [x] Service-Worker-Cache-Version in `sw.js` hochgezählt (App-Shell-Dateien geändert)

*README-AK entfällt (vorläufig, Entscheidung B aus Anforderung 13): README ist Dev-/Architektur-Doku ohne Feature-/UI-Abschnitt.*
