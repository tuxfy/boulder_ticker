# Bouldering Berlin

Statische, **buildfreie** SPA mit PWA-Support (Manifest + Service Worker). Läuft ohne Build-Schritt direkt im Browser — als native ES-Module.

> **Hinweis:** Weil die App native ES-Module nutzt, muss sie über einen Server (HTTP) laufen — ein direktes Öffnen von `index.html` per Doppelklick (`file://`) funktioniert nicht. Lokal: `npx serve` (siehe unten) oder die installierte PWA.

## Projektstruktur

```
index.html          App-Hülle: CSS-Links, View-Container, Einstiegsskript
manifest.json       PWA-Manifest
sw.js               Service Worker (versionierter Offline-Cache — Version bei jeder Freigabe hochzählen!)
styles/base.css     globale Styles (Theme, Shell, geteiltes .stepper)
src/
  app.js            Einstieg: Views mounten + Router starten
  core/             router.js · store.js (localStorage) · api.js (Firestore) · audio.js
  views/<name>/     je View ein Ordner mit <name>.js (Logik + Markup-Template) und <name>.css
                    menu · timer · boulderlog · gym · scanner
  vendor/jsqr.js    QR-Bibliothek (lazy, erst beim Scannen geladen)
```

Ereignisse werden ausschließlich per `addEventListener` gebunden (keine Inline-`onclick`). Neue Dateien, die offline verfügbar sein sollen, müssen in die `SHELL`-Liste in `sw.js` aufgenommen werden.

## Lokales Testen auf dem iPhone (gleiches WLAN)

Um ungemergte Änderungen aus dem Working Tree direkt auf dem iPhone zu testen — ohne Commit/Deploy — einen lokalen Static-Server starten und vom iPhone aus über die WLAN-IP des Macs aufrufen.

**Server starten** (im Projektordner):

```
npx --yes serve -l 8000 .
```

`serve` bindet auf alle Interfaces und zeigt eine **„On Your Network"**-Adresse an, z. B. `http://192.168.1.42:8000`. Diese URL auf dem iPhone in **Safari** öffnen.

### Hinweise

- **Kein HTTPS → kein Service Worker / keine Standalone-Installation.** Über `http://<IP>` registriert iOS den Service Worker nicht und „Zum Homescreen hinzufügen" läuft nicht im Standalone-Modus. Für Tests, die nicht am Service Worker hängen (z. B. Audio-, Timer-, UI-Verhalten), genügt der normale Safari-Tab.
- **macOS-Firewall:** Beim ersten Start ggf. eingehende Verbindungen für den Server erlauben (Systemeinstellungen → Netzwerk → Firewall).
- **IP prüfen** (bei aktivem VPN liefert `ipconfig getifaddr en0` oft die falsche):
  ```
  ifconfig | grep "inet " | grep -v 127.0.0.1
  ```
- `python3 -m http.server` ist auf macOS unzuverlässig (`[Errno 9] Bad file descriptor` beim Ausliefern) — daher `npx serve` bevorzugen.

## Automatisierte Tests (E2E)

End-to-End-Tests mit [Playwright](https://playwright.dev). Sie spielen echte Nutzerflüsse (Navigation, Timer, Boulder-Log inkl. localStorage, Gym-Auswahl) im Browser durch. Die Tests sind eine reine Dev-Abhängigkeit — die ausgelieferte App bleibt buildfrei.

**Einmalig einrichten:**

```
npm install
npx playwright install chromium
```

**Tests ausführen:**

```
npm test
```

Playwright startet den lokalen Static-Server (`scripts/serve.js`, abhängigkeitsfrei) automatisch — ein separater Server muss **nicht** laufen.

**In WebKit (Safari-Engine) testen:**

Da die App iOS-/Safari-lastig ist, lassen sich die Tests zusätzlich gegen die WebKit-Engine fahren — am nächsten am echten Zielbrowser. WebKit ist bewusst **nicht** Teil des Standard-Laufs (`npm test` = Chromium), sondern wird gezielt gestartet:

```
npx playwright install webkit   # einmalig
npm run test:webkit
```

**Weitere Kommandos:**

```
npm run test:all      # alle Browser (Chromium + WebKit)
npm run test:ui       # interaktiver UI-Modus
npm run test:report   # letzten HTML-Report öffnen
```

Die Testdateien liegen in `tests/`.

## CI/CD-Pipeline

Die GitHub Action `.github/workflows/ci-cd.yml` vereint Test und Deploy:

- **`test`-Job:** führt die E2E-Tests aus (Chromium). Läuft bei Push auf `main` **und** bei Pull Requests.
- **`deploy`-Job:** `needs: test` — veröffentlicht die Seite über GitHub Pages (`upload-pages-artifact` + `deploy-pages`). Läuft **nur** bei Push auf `main` und **nur**, wenn die Tests grün sind. Rote Tests ⇒ kein Deploy.

Veröffentlicht wird das gesamte Repo-Root (ohne `.git`/`node_modules`), analog zum früheren Branch-Deploy.

> **Einmalige Repo-Einstellung:** Unter **Settings → Pages → Source** muss **„GitHub Actions"** ausgewählt sein (nicht „Deploy from a branch"), damit dieser Workflow deployen darf.
