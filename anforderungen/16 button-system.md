-   **Title** Button-System: Primär / Sekundär / Destruktiv (Aktions-CTAs)
-   **Status** in progress

# Anforderung

Ein konsistentes System für **Aktions-Buttons (CTAs)** einführen, das den Wildwuchs ablöst. **Drei Rollen, zwei Größen.** Geteilt über alle Buttons sind **Radius, Font und Interaktions-Stil**; die **Rolle** bestimmt die **Farbe**, die **Größe** bestimmt **Höhe/Breite/Padding**. Zustandsbehaftete Controls, Icons, Links und Kacheln sind **eigene Kategorien** außerhalb des Systems.

# Hintergrund

Aktuell keine Systematik — quer durch die Module **vier Radien** (`10/12/20/24`) und **fünf Höhen** (`40/44/54/64/72`), jede View mit eigenen Klassen. Entstanden u. a. durch die 1:1-Portierung aus dem Timer-Mockup. Nur der Timer-`Start` ist weiß; die übrigen Aktions-Buttons sind faktisch schon ein dunkler „Sekundär"-Stil.

# Entscheidungen

## Metrik-Prinzip

| Dimension | bestimmt durch | Beispiele |
|---|---|---|
| **geteilt** (alle Buttons) | — | Radius, Font-Familie/-Gewicht, Interaktions-Stil |
| **Farbe** | Rolle | Primär / Sekundär / Destruktiv |
| **Höhe / Breite / Padding** | Größe | Block / Kompakt |

## Rollen

| Rolle | Farbe | Zweck |
|---|---|---|
| **Primär** | weiß (`#fff` / Text `#111`) | die eine Haupt-Aktion eines Screens |
| **Sekundär** | dunkel (`#1e1e1e` / Rand `#2a2a2a`) | Neben-Aktionen, Navigation |
| **Destruktiv** | rötlich (konkreter Wert beim Design) | löschen / zurücksetzen |

## Größen

| Größe | Verhalten |
|---|---|
| **Block** | volle Breite, großer Touch-Target (Haupt-CTA am Screen-Ende) |
| **Kompakt** | inline in Zeile/Leiste |

-   **Primär-Kompakt gestrichen** — Primär gibt es nur als **Block**. (Aktuell einziger Primär: Timer `Start`.)
-   **Kopieren/Reset-Zeile:** kein 50/50 — **Kopieren (Sekundär) dominant**, **Reset (Destruktiv) schmal** (nur inhaltsbreit).

## Zustände

Verbindlich für alle System-Buttons:

| Zustand | Verhalten |
|---|---|
| `:active` | Press-Feedback (abdunkeln bzw. `transform:scale(0.97)`) |
| `:disabled` | `opacity:0.4`, kein Pointer |
| `:focus-visible` | sichtbarer Fokusring (A11y) |

## Ablage

Die System-Klassen liegen global in `styles/base.css` (app-weit, alle Views). View-CSS enthält nur noch Ausnahmen/Spezialfälle.

## Klassifizierung — im System

| Button (Klasse) | View | Rolle | Größe |
|---|---|---|---|
| `Start` (`btn-timer-start`) | Timer (Formular) | Primär | Block |
| `Kopieren` (`btn-copy`) | Boulder-Log | Sekundär | Zeile, dominant |
| `Reset` (`btn-reset`) | Boulder-Log | Destruktiv | Zeile, schmal |
| `Aktualisieren` (`btn-gym-refresh`) | Gym | Sekundär | Kompakt |
| `Abbrechen` (`btn-scan-abort`) | Scanner | Sekundär | Kompakt (nicht volle Breite) |
| `Tools` (`btn-tools`) | Header (alle) | Sekundär | Kompakt |

## Klassifizierung — außerhalb des Systems (eigene Kategorien)

| Element (Klasse) | View | Kategorie |
|---|---|---|
| Play/Pause (`btn-timer-toggle`) | Timer (Lauf) | Toggle |
| `send` (`btn-send`) | Boulder-Log | Toggle |
| `+` (`btn-add`) | Boulder-Log | Icon-Button |
| `Scan QR` (`btn-scan-qr`) | Boulder-Log | Icon-Button |
| `Reset` / `Skip` (`btn-timer-reset` / `btn-timer-skip`) | Timer (Lauf) | Icon-Button |
| „Keine Halle gewählt" (`gym-bar-link`) | Boulder-Log | Link |
| Kacheln (`tile`) | Menü | Kachel |

# Konkrete Werte (festgelegt)

-   **Geteilt:** Radius `12px`, Font-Gewicht `700`, System-Grotesk (global).
-   **Block:** Höhe `54px`, Font `17px`, volle Breite.
-   **Kompakt:** Höhe `44px`, Font `15px`, inline (Breite nach Inhalt/Padding).
-   **Destruktiv-Farbe:** dunkle Basis wie Sekundär (`#1e1e1e`), rötlicher Text + Rand `#ff8a7a`.
-   **Klassen-Benennung (BEM):** Basis `.btn` + `.btn--primary` / `.btn--secondary` / `.btn--destructive` + `.btn--block` / `.btn--compact`.

# Akzeptanzkriterien

**System (in `styles/base.css`)**
-   [x] Drei Rollen definiert: Primär (weiß `#fff`/`#111`), Sekundär (dunkel `#1e1e1e`/Rand `#2a2a2a`), Destruktiv (rötlich)
-   [x] Zwei Größen definiert: Block (voll breit) und Kompakt (inline)
-   [x] Geteilt über alle: Radius, Font, Interaktions-Stil; Farbe nur nach Rolle, Höhe/Breite/Padding nur nach Größe
-   [x] Zustände `:active`, `:disabled`, `:focus-visible` für alle System-Buttons

**Migration (gemäß Klassifizierungstabelle)**
-   [x] Alle „im System"-Buttons nutzen die System-Klassen (Start, Kopieren, Reset, Aktualisieren, Abbrechen, Tools)
-   [x] `Abbrechen` bleibt kompakt (nicht volle Breite); `Kopieren`/`Reset`-Zeile: Kopieren dominant, Reset schmal
-   [x] „Eigene Kategorien" (Toggle, Icon-Button, Link, Kachel) bleiben **unberührt**
-   [x] Verhalten aller Buttons unverändert (gleiche Aktionen/IDs/Handler)

**Abschluss**
-   [x] Bestehende Unit- und E2E-Tests bleiben grün — E2E-Selektoren bei Klassenumbenennung angepasst
-   [x] Kein neuer Unit-Test (reines CSS-/Markup-System, nicht sinnvoll unit-testbar)
-   [x] Nach der Implementierung läuft `npm test` grün durch
-   [ ] Lokaler Test durch den Nutzer per `npx serve` erfolgreich (alle Buttons über die Module geprüft)
-   [x] Service-Worker-Cache-Version in `sw.js` hochgezählt (App-Shell-Dateien geändert)

*README-AK entfällt (interne Stil-Vereinheitlichung, kein neues nutzerrelevantes Verhalten).*
