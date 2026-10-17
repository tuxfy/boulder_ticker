-   **Title** Unit-Tests — Scanner
-   **Status** new

# Anforderung

Die testbare Logik des QR-Scanners (`src/views/scanner/scanner.js`) soll mit **Unit-Tests** abgesichert werden — die zweite Stufe zur Unit-Test-Basis aus [[12 unit-tests]], dort bewusst als optional ausgeklammert. Im Fokus steht die **Interpretation gescannter Inhalte** und der daraus folgende Route-Abruf, nicht die Kamera-Pipeline.

Die ausgelieferte App bleibt buildfrei; Tests sind reine Dev-Abhängigkeit.

# Hintergrund

`scanner.js` ist heute **gar nicht automatisiert abgedeckt** — E2E scheitert an der Kamera (`getUserMedia`/`BarcodeDetector`), weshalb der Scanner schon in [[09 e2e-tests]] und [[11 refactor-index-architektur]] nur manuell verifiziert wurde. Dabei enthält das Modul verzweigungsreiche **reine Logik**, die ohne Kamera prüfbar ist: die Klassifikation des gescannten Strings (vier Eingabeformen) und die Firestore-Abrufe per `fetch`.

Diese Logik ist aktuell in nicht-exportierte Funktionen (`handleScanResult`, `fetchRouteById`, `fetchRouteByQrcode`, `applyRouteToForm`) eingebettet, die `fetch` und DOM vermischen. Für saubere Unit-Tests ist eine **kleine Testbarkeits-Extraktion** nötig (siehe Umfang) — ein struktureller Eingriff ohne Verhaltensänderung, abgesichert durch die bestehende manuelle Scanner-Prüfung.

**Red-Green-Hinweis:** Wie bei [[12 unit-tests]] ändert sich kein Nutzerverhalten; die Tests pinnen Ist-Verhalten und sind von Beginn an grün. Das Kriterium „ohne die Änderung rot" entfällt. (Die begleitende Extraktion ist ein reiner Refactor und wird durch die neuen Tests + manuelle Prüfung abgesichert.)

# Werkzeug

- **Vitest** mit jsdom — Setup und Begründung siehe [[12 unit-tests]].
- Modul-spezifische Mocks: `fetch` (Firestore-Antworten für Route/Location), DOM-Felder `#grade`/`#style`/`#scan-status` über jsdom. Kamera-APIs (`getUserMedia`, `BarcodeDetector`, `jsQR`) werden **nicht** gemockt — die betroffenen Pfade bleiben manuell.

# Umfang

- **Scan-Inhalt klassifizieren** (Kern): die vier Eingabeformen aus `handleScanResult` —
    - `https://beta7.app/route/<id>` → Route-ID
    - `https://beta7.app/<...>/<zahl>` → QR-Nummer
    - roher Bezeichner `<id>~<zahl>` → Route-ID
    - reine Zahl → QR-Nummer
    - nicht erkennbarer Inhalt → Fehlertext
    - inkl. Trimmen und Entfernen abschließender `/`.
    - **Dazu wird die reine Klassifikation in eine exportierte Hilfsfunktion extrahiert** (Eingabe-String → `{ kind, routeId | qrNum }`), ohne `fetch`/DOM. Der Orchestrierungs-Rest (`handleScanResult`) ruft sie nur noch auf.
- **Route-Abruf mit gemocktem `fetch`:** `fetchRouteById` (gefunden, `404` → `null`, HTTP-Fehler → `throw`), `fetchRouteByQrcode` (QR-Nummer → `qrcodes`-Mapping → Route; keine Position → `null`). Dafür werden diese Helfer exportiert (oder in ein testbares Modul gezogen).
- **`applyRouteToForm`** (jsdom): `grades.label` → `#grade`, `routeStyles`-Array → `#style` (join), fehlende Felder.

# Abgrenzung

**Nicht Teil dieser Anforderung — bleibt manuell verifiziert:** Kamera-Start (`scanStart`, `getUserMedia`), native vs. jsQR-Erkennung, die Scan-Schleifen (`scanLoopNative`/`scanLoopJsqr`), Lazy-Load von `jsqr.js` und `scanStop`/Stream-Teardown.

# Akzeptanzkriterien

-   [ ] Reine Scan-Klassifikation in exportierte, fetch-/DOM-freie Hilfsfunktion extrahiert (Verhalten unverändert)
-   [ ] Unit-Tests: alle vier Eingabeformen + nicht erkennbarer Inhalt + Trimmen/Trailing-Slash
-   [ ] Unit-Tests `fetchRouteById`: gefunden, `404` → `null`, HTTP-Fehler → `throw` (gemocktes `fetch`)
-   [ ] Unit-Tests `fetchRouteByQrcode`: Mapping vorhanden → Route, keine Position → `null` (gemocktes `fetch`)
-   [ ] Unit-Tests `applyRouteToForm`: `grades.label`, `routeStyles`-Join, fehlende Felder (jsdom)
-   [ ] Kamera-/Schleifen-Pfade bleiben ausgeklammert und sind als manuell-verifiziert dokumentiert
-   [ ] `npm test` läuft nach der Umsetzung grün durch (vom Nutzer ausgeführt und bestätigt)
-   [ ] Scanner manuell per `npx serve` verifiziert (nicht automatisiert abgedeckte Pfade)
-   [ ] `README.md`/`AGENTS.md` bei Bedarf ergänzt (falls sich Scanner-Verifikation/Test-Workflow ändert)
