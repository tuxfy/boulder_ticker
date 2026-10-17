-   **Title** E2E-Tests
-   **Status** refined

# Anforderung

Das Projekt soll **End-to-End-Tests (E2E)** erhalten, die echte Nutzerflüsse im echten Browser durchspielen und Regressionen früh erkennbar machen. Der Umfang beschränkt sich zunächst **ausschließlich auf E2E** — Unit-Tests sind hier ausdrücklich nicht Teil der Anforderung (können später separat folgen, sobald der Code modularisiert ist).

# Hintergrund

Die App besitzt derzeit **keine automatisierten Tests**; Korrektheit wird ausschließlich manuell verifiziert (zuletzt per `npx serve` auf dem iPhone). Sie ist eine buildfreie Single-File-Anwendung (`index.html`) ohne Test-Infrastruktur. Mit wachsendem Funktionsumfang und anstehenden Umbauten steigt das Regressionsrisiko.

# Werkzeug

- **Playwright** als E2E-Framework (Dev-Abhängigkeit; die ausgelieferte App bleibt buildfrei). Playwright startet den lokalen Server für die Tests selbst.

# Umfang

Abgedeckte Nutzerflüsse:

- **Navigation** zwischen den Views
- **Timer:** Konfiguration, Start, Phasenwechsel — mit kontrollierter Uhr (Fake-Clock) statt echtem Warten
- **Boulder-Log:** Eintrag anlegen, Versuche +/−, Kopieren, Reset, Send-Toggle
- **localStorage-Persistenz** des Boulder-Logs
- **Gym-Auswahl**

Nicht Teil dieser Anforderung: Scanner (benötigt Kamera) und Audio (`AudioContext`) — per E2E nicht bzw. nur sehr eingeschränkt sinnvoll prüfbar.

# Ausführung

- Tests lokal per Kommando ausführbar (z. B. `npx playwright test`).
- Eine **How-to-Anleitung** zum Ausführen der Tests wird in der `README.md` festgehalten.
- Eine **GitHub Action** führt die Tests automatisiert aus (CI).

# Ablage

- Testdateien liegen in einem eigenen Ordner (`tests/`) im Projektwurzelverzeichnis.

# Akzeptanzkriterien

-   [ ] Playwright als E2E-Framework eingerichtet (Dev-Abhängigkeit, App bleibt buildfrei)
-   [ ] Testdateien liegen im eigenen Ordner `tests/`
-   [ ] E2E-Test: Navigation zwischen den Views
-   [ ] E2E-Test: Timer — Konfiguration, Start, Phasenwechsel (mit kontrollierter Uhr)
-   [ ] E2E-Test: Boulder-Log — Eintrag anlegen, Versuche +/−, Kopieren, Reset, Send-Toggle
-   [ ] E2E-Test: localStorage-Persistenz des Boulder-Logs
-   [ ] E2E-Test: Gym-Auswahl
-   [ ] Tests lokal per Kommando ausführbar (Playwright startet den Server selbst)
-   [ ] GitHub Action führt die Tests automatisiert aus (CI)
-   [ ] `README.md` enthält eine How-to-Anleitung zum Ausführen der Tests
