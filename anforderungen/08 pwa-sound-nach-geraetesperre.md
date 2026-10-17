-   **Title** PWA — Sound nach Gerätesperre wiederherstellen
-   **Status** in progress

# Anforderung

Der Timer-Sound (Beep bei Rundenwechsel, Countdown der letzten Sekunden, Finish-Signal) muss auch dann funktionieren, wenn die als PWA installierte App im Hintergrund war bzw. das Gerät zwischenzeitlich gesperrt war. Nach dem Entsperren und erneutem Starten des Timers soll der Sound ohne Neustart der App hörbar sein.

# Hintergrund

Der Sound wird über die Web Audio API erzeugt (`AudioContext`, ein einmalig angelegter Kontext wird wiederverwendet). Beim Start des Timers wird der Audio-Stack per stillem Buffer innerhalb der User-Geste entsperrt (`unlockAudio`), damit mobile Browser (insb. iOS) überhaupt Töne zulassen.

Beobachtetes Verhalten:

- Direkt nach dem Starten der installierten App funktioniert der Sound sofort.
- Bleibt die App geöffnet, wird das Gerät gesperrt und anschließend wieder entsperrt, und wird dann der Timer gestartet, bleibt der Sound stumm.
- Erst wenn die App vollständig beendet und neu gestartet wird, funktioniert der Sound wieder.

Bestätigte Ursache (am iPhone verifiziert, iOS Safari): Beim Sperren des Geräts geht der `AudioContext` in den iOS-spezifischen Zustand `interrupted` über. Die bestehende Wiederherstellung ruft `resume()` aber nur auf, wenn der Zustand `suspended` ist — der Zustand `interrupted` wird nicht abgefangen. Dadurch bleibt der Kontext nach dem Entsperren inaktiv und spielt keine Töne, bis ein App-Neustart einen frischen Kontext erzeugt.

Verifiziert über eine temporäre On-Screen-Diagnose: im stummen Fall meldet sowohl `visibilitychange` als auch jeder `playBeep` den Zustand `interrupted`.

# Verhalten

- Nach Entsperren des Geräts und Start des Timers werden alle Töne wie unmittelbar nach App-Start abgespielt.
- Das gilt wiederholt (mehrfaches Sperren/Entsperren innerhalb derselben App-Session).
- Browser ohne Web-Audio-Unterstützung laufen weiterhin fehlerfrei (kein Fehler, nur kein Ton).

# Akzeptanzkriterien

-   [ ] Nach Gerätesperre → Entsperren → Timer-Start ist der Sound ohne App-Neustart hörbar
-   [ ] Verhalten ist nach mehrfachem Sperren/Entsperren reproduzierbar korrekt
-   [ ] Sound funktioniert weiterhin unmittelbar nach App-Start (keine Regression)
-   [ ] Getestet als installierte PWA auf iOS und Android
-   [ ] Lokaler Test durch den Nutzer per `npx serve` erfolgreich (Sperren → Entsperren → Timer-Start, Ton geht)
-   [ ] Browser ohne Web-Audio-Support laufen fehlerfrei weiter
-   [ ] `README.md` wird um die Änderung ergänzt — entfällt, kein README vorhanden
