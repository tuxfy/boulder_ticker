-   **Title** Multi-Tool-Shell "Bouldering Berlin"
-   **Status** done

# Anforderung

Die bestehende Einzelseiten-App (Boulder Log) wird zur erweiterbaren Tool-Sammlung ausgebaut. Eine neue Startseite ermöglicht die Auswahl einzelner Tools über Kacheln. Die Navigation zurück zur Startseite erfolgt über einen prominenten Button im Tool-Header.

# Hintergrund

Bisher ist `index.html` direkt der Boulder Log. Weitere Tools (z. B. Timer, Fingerboard-Log) sollen ergänzt werden können, ohne die Dateistruktur zu ändern. Die App bleibt eine einzelne statische HTML-Datei auf GitHub Pages.

# Verhalten

## Startseite

- App-Titel: **Bouldering Berlin**
- Unterhalb des Titels: Abschnittsbezeichnung **Tools**
- Kachel-Grid im iOS-Stil: 2 Spalten, quadratische Kacheln, großes Icon oben, Name darunter
- Tippen auf eine Kachel öffnet das Tool (kein Seitenneuladen, Hash-Navigation)
- Nur vorhandene Tools werden angezeigt — keine Platzhalter-Kacheln

## Tool-Ansicht

- Sticky Header: links ein prominenter **„← Tools"**-Button, daneben der Tool-Name
- Tippen auf „← Tools" kehrt zur Startseite zurück
- Tool-Content unterhalb des Headers, wie bisher

## Routing

- Startseite: `#/` oder kein Hash
- Tool: `#/<tool-id>` (z. B. `#/boulderlog`)
- Direktlinks auf ein Tool (`#/boulderlog`) öffnen das Tool direkt ohne Umweg über die Startseite

## Erster Stand

- Nur **Boulder Log** als Tool enthalten
- Struktur ist so gebaut, dass weitere Tools durch Ergänzung von HTML-Block + Kachel-Eintrag im Script hinzugefügt werden können

# Akzeptanzkriterien

-   [x] Startseite zeigt Titel „Bouldering Berlin", Abschnitt „Tools" und mindestens die Boulder-Log-Kachel
-   [x] Kacheln sind quadratisch, 2-spaltig, Icon + Name, Dark Theme
-   [x] Tippen auf Kachel navigiert per Hash zum Tool, kein Seitenreload
-   [x] Tool-Header hat „← Tools"-Button, der zur Startseite zurückführt
-   [x] Direktlink `#/boulderlog` öffnet das Tool ohne Startseite dazwischen
-   [x] Boulder Log funktioniert identisch wie bisher (SessionStorage, alle Felder, Enter, Reset, Kopieren)
-   [x] Gesamte App bleibt eine einzelne `index.html`, keine externe Abhängigkeit
