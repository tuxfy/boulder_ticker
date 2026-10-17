-   **Title** Refactor — Architektur von index.html
-   **Status** new

# Anforderung

Die Anwendung soll in eine klare, für Menschen verständliche Architektur überführt werden, ohne ihr Verhalten zu verändern. Die aktuelle Vermischung von HTML, CSS und JavaScript sowie der verschiedenen Menüs/Ansichten in einer einzigen, sehr langen Datei wird aufgelöst. Die App bleibt eine voll funktionsfähige SPA und weiterhin als PWA installier- und offline-lauffähig.

Für Nutzer sind **keine funktionalen oder sichtbaren Änderungen** erkennbar — der Refactor ist rein strukturell.

# Hintergrund

Die gesamte App liegt derzeit in einer einzigen Datei `index.html` mit **11.356 Zeilen**. Darin vermischt:

- **CSS** inline im `<style>`-Block (ca. Zeilen 10–511)
- **Vendor-Bibliothek jsQR** inline eingebettet (ca. Zeilen 727–10644, ~9.900 Zeilen) — der mit Abstand größte Anteil
- **App-Logik** in einem `<script>`-Block (ca. Zeilen 10646–11347, ~700 Zeilen), in dem Hauptmenü, Boulder-Log, Timer, Gym-Auswahl und QR-Scanner unstrukturiert nebeneinanderliegen
- **Service-Worker-Registrierung** in einem weiteren Script am Ende
- Das HTML-Markup aller Ansichten dazwischen

Dadurch ist die Datei schwer les- und wartbar: Zusammengehörige Teile einer Ansicht sind über HTML-, CSS- und JS-Abschnitte verstreut, und die eigentliche App-Logik (~1.400 Zeilen ohne Vendor-Lib) geht zwischen der eingebetteten Bibliothek unter.

# Verhalten

- Alle bestehenden Funktionen bleiben unverändert erhalten: Hauptmenü, Boulder-Log (inkl. Senden/Kopieren/Reset), Timer (inkl. Intervall/Sound/Wake-Lock), Gym-Auswahl, QR-Scanner.
- Die PWA-Eigenschaften bleiben erhalten: Installierbarkeit (Manifest) und Offline-Start (Service Worker).
- Keine Änderung an Aussehen oder Bedienung.

# Zielarchitektur

Gemeinsam festgelegt: **buildfreie SPA mit nativen ES-Modulen** und einer **Feature-Ordner-Struktur** (Co-Location — alles zu einer Ansicht liegt beieinander).

## Grundprinzipien

- **Kein Build-Schritt.** Native ES-Module (`<script type="module">`), direkt im Browser lauffähig und weiterhin per `npx serve` testbar. Kein Bundler, kein `node_modules`.
- **Co-Location pro View:** Jede Ansicht hat einen eigenen Ordner mit ihrer Logik (`.js`, inkl. Markup als Template im Modul) und ihren Styles (`.css`) direkt daneben.
- **Geteiltes** (Navigation, Speicher, API, Audio) liegt in `core/`, globale Styles in `styles/base.css`.
- **CSS-Einbindung (Weg 1):** Die view-spezifischen `.css`-Dateien liegen im jeweiligen Feature-Ordner, werden aber zentral in `index.html` per `<link>` eingebunden (buildfrei, kein nativer CSS-Import nötig, kein Flackern).
- **`index.html` wird zur Mini-Hülle:** nur noch Container, CSS-`<link>`s und das Einstiegsskript.

## Dateistruktur

```
index.html          Mini-Hülle: Container + CSS-<link>s + Einstiegsskript
manifest.json / sw.js / icon-192.png / icon-512.png
styles/
  base.css          global: Theme, Farben, Reset, Variablen
src/
  app.js            Einstieg: Router-Init + Service-Worker-Registrierung
  core/
    router.js       navigate() / Umschalten der Ansichten
    store.js        localStorage-Helfer
    api.js          BETA7-/Firestore-Zugriffe
    audio.js        Sound + Wake-Lock
  views/
    menu/           menu.js        menu.css
    boulderlog/     boulderlog.js  boulderlog.css
    timer/          timer.js       timer.css
    gym/            gym.js         gym.css
    scanner/        scanner.js     scanner.css
  vendor/
    jsqr.js         ausgelagerte Fremd-Bibliothek, nur beim Scannen geladen
```

## PWA / Service-Worker

- `sw.js` cacht künftig alle für den Offline-Start nötigen Dateien (`index.html`, `styles/*`, `src/**`) statt nur `index.html`.
- `jsqr.js` wird erst beim Öffnen des Scanners geladen; ob es in den Offline-Cache gehört, wird bei der Umsetzung festgelegt.

# Risiken & Hinweise

1. **Inline-`onclick` vs. Modul-Scope (größter Aufwandstreiber):** Die App bindet Events durchgängig über Inline-Handler im HTML (`onclick="navigate('timer')"`, `onclick="timerStart()"`, `onclick="adjustParam(...)"` …), die **globale** Funktionen aufrufen. ES-Module kapseln alles lokal — dadurch würden diese Funktionen nicht mehr global sein und sämtliche Inline-Handler brechen. **Entscheidung:** Event-Anbindung wird im Zuge des Refactors auf `addEventListener` in den View-Modulen umgestellt (keine Inline-Handler mehr). Das ist der substanzielle Teil der Arbeit und die größte Regressionsquelle.
2. **Keine automatischen Tests → Regressionsrisiko:** Verhaltensgleichheit wird manuell verifiziert. **Gegenmittel:** inkrementell migrieren (erst CSS + jsQR auslagern, dann View für View) und nach jedem Schritt per `npx serve` testen — nicht alles auf einmal.
3. **Service-Worker als Fußangel:** Statt nur `index.html` müssen künftig alle Dateien gecacht werden; ein vergessener Eintrag bricht den Offline-Start. Zusätzlich gab es bereits Probleme mit veraltetem Cache (alte Version trotz Änderung). **Entscheidung:** SW mit sauberem **Cache-Versioning** (versionierter Cache-Name, alte Caches beim Aktivieren löschen) aufsetzen.
4. **Kein `file://` mehr:** ES-Module benötigen HTTP (CORS). Die App lässt sich dann nicht mehr per Doppelklick aus dem Dateisystem öffnen, nur noch über Server (`npx serve`) oder als installierte PWA. Ändert die Aussage aus [[07 pwa]] „läuft als statische Datei ohne Server".
5. **jsQR ist eine Global-/UMD-Bibliothek:** Für sauberes Lazy-Laden per `import()` ist ggf. ein kleiner Wrapper/Shim nötig.
6. **Markup wandert in JS-Template-Strings:** Pro View liegt das HTML als Template im Modul (kostet etwas HTML-Komfort; hängt mit Punkt 1 zusammen, da Handler per Code statt inline gebunden werden).

# Akzeptanzkriterien

-   [ ] Struktur entspricht der dokumentierten Zielarchitektur (Feature-Ordner, buildfrei, ES-Module)
-   [ ] HTML, CSS und JavaScript sind klar getrennt (keine Vermischung in einer Datei)
-   [ ] Jede Ansicht liegt in einem eigenen Feature-Ordner (Logik + Styles beieinander)
-   [ ] jsQR ist aus `index.html` ausgelagert
-   [ ] `index.html` ist auf eine schlanke App-Hülle reduziert
-   [ ] Keine Inline-Event-Handler mehr — Events werden per `addEventListener` gebunden
-   [ ] Service-Worker nutzt versioniertes Caching (alte Caches werden beim Aktivieren entfernt)
-   [ ] Alle bestehenden Funktionen verhalten sich unverändert (keine Regression)
-   [ ] App bleibt installierbare PWA und startet weiterhin offline
-   [ ] Lokaler Test durch den Nutzer per `npx serve` erfolgreich
-   [ ] `README.md` wird um die neue Projektstruktur ergänzt
