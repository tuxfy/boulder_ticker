-   **Title** Boulder Log — Persistenz auf localStorage umstellen
-   **Status** done

# Anforderung

Der Boulder Log soll den aktuellen Session-Log nicht mehr in `sessionStorage` sondern in `localStorage` speichern, damit die Daten nach einem Tab-Schließen oder App-Neustart erhalten bleiben.

# Hintergrund

Aktuell wird der Log-Inhalt der Textarea in `sessionStorage` gespeichert. Dieser wird vom Browser automatisch gelöscht sobald der Tab geschlossen wird. Bei einer PWA-Nutzung vom Homescreen entspricht jeder Start einem neuen Tab — der Log wäre damit nach jedem Schließen der App weg. Mit `localStorage` bleibt der aktuelle Log bis zum expliziten Reset erhalten.

# Verhalten

- Beim Laden der App wird der Log-Inhalt aus `localStorage` wiederhergestellt (statt aus `sessionStorage`)
- Jede Änderung an der Textarea wird wie bisher automatisch gespeichert — jetzt in `localStorage`
- Der Reset-Button löscht den Eintrag aus `localStorage` (Verhalten für den Nutzer unverändert)
- Ist kein gespeicherter Inhalt vorhanden, startet die Textarea leer (wie bisher)

# Akzeptanzkriterien

-   [x] Log-Inhalt wird in `localStorage` gespeichert (Schlüssel unverändert)
-   [x] Nach Tab-Schließen und erneutem Öffnen ist der Log-Inhalt wiederhergestellt
-   [x] Reset löscht den Eintrag korrekt aus `localStorage`
-   [x] Kein Rückgriff mehr auf `sessionStorage` für den Log-Inhalt
-   [x] `README.md` wird um die Änderung ergänzt — entfällt, kein README vorhanden und keine nutzerrelevante Konfiguration
