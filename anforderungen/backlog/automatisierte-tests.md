tim-   **Title** Automatisierte Tests
-   **Status** new

# Anforderung

Das Projekt soll **End-to-End-Tests (E2E)** erhalten, die echte Nutzerflüsse im echten Browser durchspielen und Regressionen früh erkennbar machen. Der Umfang beschränkt sich zunächst **ausschließlich auf E2E** — Unit-Tests sind hier ausdrücklich nicht Teil der Anforderung (können später separat folgen, sobald der Code modularisiert ist).

# Hintergrund

Die App besitzt derzeit **keine automatisierten Tests**; Korrektheit wird ausschließlich manuell verifiziert (zuletzt per `npx serve` auf dem iPhone). Sie ist eine buildfreie Single-File-Anwendung (`index.html`) ohne Test-Infrastruktur. Mit wachsendem Funktionsumfang und anstehenden Umbauten steigt das Regressionsrisiko.

# Offene Punkte (gemeinsam im Refinement zu klären)

- **Werkzeug/Tooling:** Test-Framework (Vorschlag: Playwright). Dev-Abhängigkeit — betrifft nicht die ausgelieferte App, die buildfrei bleibt.
- **Umfang/Priorität:** Welche Nutzerflüsse zuerst? (Timer, Boulder-Log, Gym, Scanner, Navigation)
- **Ausführung:** Wie werden Tests gestartet (lokal, Kommando)? Automatisierung/CI gewünscht?
- **Ablage:** Wo liegen die Testdateien?

# Akzeptanzkriterien

-   [ ] (wird nach dem Refinement festgelegt)
