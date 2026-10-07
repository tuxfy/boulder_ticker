-   **Title** QR-Scanner — iOS-Unterstützung via jsQR-Fallback
-   **Status** done

# Anforderung

Der QR-Scanner soll auf iOS (Safari, Brave) und Firefox funktionieren. Da `BarcodeDetector` auf iOS systembedingt nicht verfügbar ist, wird `jsQR` als JS-basierter Fallback eingebunden. Die Erkennung verhält sich aus Nutzersicht identisch.

# Hintergrund

`BarcodeDetector` ist eine Chromium-API. Auf iOS erzwingt Apple WKWebView für alle Browser-Apps — auch Brave und Chrome nutzen dort kein Chromium. `BarcodeDetector` ist damit auf iOS in keinem Browser verfügbar.

Bekannte Browser-Unterstützung (Stand Oktober 2026):

| Browser     | Platform | BarcodeDetector |
|-------------|----------|-----------------|
| Chrome      | Android  | ✅              |
| Brave       | Android  | ✅ (Chromium)   |
| Chrome      | Desktop  | ✅              |
| Safari      | iOS      | ❌              |
| Brave       | iOS      | ❌ (WKWebView)  |
| Chrome      | iOS      | ❌ (WKWebView)  |
| Firefox     | alle     | ❌              |

**Gewählte Lösung:** `jsQR` als Fallback-Bibliothek.

- Pure JS, kein WebAssembly — kein COOP/COEP-Header nötig (relevant für GitHub Pages)
- ~24 KB minifiziert
- MIT-Lizenz
- Einbindung: minifizierter Quellcode wird direkt in `index.html` inline eingebettet — keine externe Abhängigkeit, funktioniert offline, keine CDN-Angriffsfläche

# Verhalten

## Erkennung

- `BarcodeDetector` wird weiterhin bevorzugt, wenn verfügbar (Android Chrome/Brave — nativ, kein JS-Overhead)
- Ist `BarcodeDetector` nicht verfügbar, läuft die Erkennung über `jsQR`:
  - Gleicher `getUserMedia`-Start mit `facingMode: 'environment'`
  - Gleicher rAF-Loop: pro Frame wird das Videobild auf ein Off-screen-`<canvas>` gezeichnet, `getImageData` ausgelesen und an `jsQR(data, width, height)` übergeben
  - Ergebnis (`code.data`) wird identisch an `handleScanResult(raw)` weitergegeben
- Aus Nutzersicht ist kein Unterschied sichtbar — gleiche Overlay-UI, gleiche Abbrechen-Logik

## Fehlermeldung

- Ist weder `BarcodeDetector` noch `jsQR` verfügbar (jsQR nicht geladen), erscheint weiterhin ein Hinweis — aber ohne Browser-Empfehlung, da kein einzelner Browser auf allen Plattformen funktioniert

## Einbindung jsQR

- Minifizierter jsQR-Quellcode wird als `<script>`-Block direkt in `index.html` eingebettet
- Keine externe URL, kein CDN, kein Build-Schritt

# Akzeptanzkriterien

-   [x] QR-Scanner funktioniert auf iOS Safari und iOS Brave (jsQR-Pfad)
-   [x] QR-Scanner funktioniert weiterhin auf Android Chrome/Brave (BarcodeDetector-Pfad)
-   [x] Kein sichtbarer Verhaltensunterschied zwischen den beiden Erkennungspfaden
-   [x] jsQR ist inline in `index.html` eingebettet — keine externe Abhängigkeit
-   [x] Fehlermeldung bei nicht-unterstütztem Browser enthält keine irreführende Browser-Empfehlung
-   [x] Bestehende Deployment-Anforderung (statische HTML-Datei, kein Build) bleibt erfüllt
