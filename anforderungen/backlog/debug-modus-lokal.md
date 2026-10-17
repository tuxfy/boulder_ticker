-   **Title** Debug-Modus für lokale Tests
-   **Status** new

# Anforderung

Für lokale Tests soll ein Debug-Bereich dauerhaft im Code verbleiben, der eine Ereignis-Timeline (Klicks, Audio-Zustände, Lifecycle-Events) anzeigt. Er ist **ausschließlich in der lokalen Entwicklungsumgebung** aktiv und in Produktion vollständig inaktiv — es gibt keinen manuellen Schalter, der ihn in Produktion einschalten könnte.

# Hintergrund

Beim Debugging des PWA-Sound-Problems ([[08 pwa-sound-nach-geraetesperre]]) hat sich eine On-Screen-Diagnose als wertvoll erwiesen, weil die installierte PWA auf dem iPhone kaum per Dev-Tools inspizierbar ist. Statt diesen Code nach jeder Analyse zu entfernen und beim nächsten Bug neu zu bauen, soll er fest, aber risikolos im Code bleiben.

Ein URL-Schalter (`?debug`) wird bewusst **abgelehnt**, weil er in Produktion aktivierbar wäre und damit ein Risiko darstellt. Die Aktivierung erfolgt allein anhand der Umgebung (localhost oder lokale Netzwerk-IP, wie sie beim Test per `npx serve` im WLAN verwendet wird).

# Verhalten

- Der Debug-Bereich erscheint nur, wenn die App lokal läuft (z. B. `localhost` oder eine lokale Netzwerk-IP). In Produktion wird nichts gerendert und keine Debug-Logik ausgeführt (No-Op).
- Darstellung als **normales Element am Ende des Seiteninhalts, unter allen UI-Elementen** — kein schwebendes Overlay über dem UI.
- Der Bereich ist **scrollbar**, sodass eine längere Timeline vollständig einsehbar ist (neueste Einträge zuerst).
- Protokolliert mit Zeitstempel: Button-Klicks (Start/Pause/Reset), Audio-Zustandswechsel des `AudioContext` inkl. Ergebnis von `resume()`, jeden abgespielten Ton sowie Lifecycle-Events (Sichtbarkeit, Sperren/Entsperren, App-/Tab-Wechsel).

# Akzeptanzkriterien

-   [ ] Debug-Bereich ist nur in der lokalen Umgebung (localhost / lokale Netzwerk-IP) aktiv
-   [ ] In Produktion wird kein Debug-Bereich gerendert und keine Debug-Logik ausgeführt
-   [ ] Es existiert kein manueller Schalter (kein `?debug` o. Ä.), der den Modus in Produktion aktiviert
-   [ ] Bereich wird am Seitenende unter allen UI-Elementen dargestellt (kein schwebendes Overlay)
-   [ ] Bereich ist scrollbar
-   [ ] Protokolliert Klicks, Audio-Zustandswechsel inkl. `resume()`-Ergebnis, abgespielte Töne und Lifecycle-Events mit Zeitstempel
-   [ ] Lokaler Test durch den Nutzer per `npx serve` erfolgreich
-   [ ] `README.md` wird um den Debug-Modus ergänzt
