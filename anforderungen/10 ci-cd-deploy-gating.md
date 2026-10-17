-   **Title** CI/CD — Deploy nur bei grünen Tests
-   **Status** in progress

# Anforderung

Der Deploy nach GitHub Pages soll nur erfolgen, wenn die E2E-Tests erfolgreich durchgelaufen sind. Test und Deploy werden in einer gemeinsamen Pipeline zusammengeführt, in der der Deploy-Schritt vom Test-Schritt abhängt. Rote Tests verhindern die Veröffentlichung.

# Hintergrund

Aktuell wird die App über **GitHub Pages „Deploy from a branch"** (Branch `main`, Ordner root) veröffentlicht. Das ist eine von GitHub verwaltete Pipeline (`pages-build-deployment`), die bei **jedem** Push auf `main` läuft — **unabhängig** von der Test-Action aus [[09 e2e-tests]] (`.github/workflows/e2e.yml`). Dadurch blockieren fehlgeschlagene Tests den Deploy nicht.

GitHub erlaubt es nicht, den eingebauten Branch-Deploy an das Ergebnis eines separaten Workflows zu koppeln. Beides muss daher in **eine** GitHub-Actions-Pipeline überführt werden, und die Pages-Quelle wird von „Deploy from a branch" auf **„GitHub Actions"** umgestellt.

# Verhalten

- Eine Workflow-Datei mit zwei Jobs:
  - **test:** führt die E2E-Tests aus — **nur Chromium** (schnelles, stabiles Gate; WebKit bleibt lokaler opt-in).
  - **deploy:** `needs: test` — läuft nur, wenn der Test-Job grün ist; veröffentlicht die Seite über die GitHub-Actions-Pages-Aktionen (`actions/upload-pages-artifact` + `actions/deploy-pages`).
- **Trigger:** Tests laufen bei **Push auf `main`** und bei **Pull Requests**. Der **Deploy läuft nur bei Push auf `main`** (nicht bei Pull Requests).
- Bei rotem Test-Job findet **kein** Deploy statt.
- **Artefakt:** das **gesamte Repo-Root** wird veröffentlicht (Parität zum bisherigen „deploy from branch root"). Nicht eingecheckte Dev-Artefakte (`node_modules/`, Reports) sind ohnehin nicht im Checkout. Projekt-/Dev-Dateien (`tests/`, `anforderungen/`, `AGENTS.md` …) bleiben damit öffentlich wie bisher; der Artefakt-Umfang wird beim anstehenden Refactor neu bewertet.
- Die bisherige eigenständige Test-Action aus Issue 09 geht in dieser gemeinsamen Pipeline auf.

# Manueller Schritt (durch den Nutzer)

- In den Repo-Einstellungen **Settings → Pages → Source** von „Deploy from a branch" auf **„GitHub Actions"** umstellen. Dieser Schritt ist nicht per Code möglich und muss einmalig manuell erfolgen.

# Akzeptanzkriterien

-   [x] Eine Workflow-Datei enthält einen `test`- und einen `deploy`-Job; `deploy` hat `needs: test`
-   [x] Test-Gate läuft nur mit Chromium
-   [x] Tests laufen bei Push auf `main` und bei Pull Requests; Deploy nur bei Push auf `main`
-   [x] Deploy erfolgt nur bei grünem Test-Job (roter Test → kein Deploy) — strukturell über `needs: test`
-   [x] Deploy nutzt die GitHub-Actions-Pages-Aktionen (`upload-pages-artifact` + `deploy-pages`)
-   [x] Pages-Quelle ist auf „GitHub Actions" umgestellt (manueller Repo-Schritt dokumentiert)
-   [ ] Veröffentlichte Seite entspricht dem bisherigen Stand (gesamtes Repo-Root, wie bisher) — Bestätigung nach erstem Push
-   [ ] Push auf `main` mit grünen Tests veröffentlicht die Seite; mit roten Tests nicht — Bestätigung nach erstem Push
-   [x] `README.md` wird um die CI/CD-Pipeline ergänzt
