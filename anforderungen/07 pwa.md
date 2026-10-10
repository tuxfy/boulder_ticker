-   **Title** PWA — Installierbar & Offline-fähig
-   **Status** done

# Anforderung

Die App soll als Progressive Web App installierbar sein (Homescreen-Icon auf iOS und Android) und offline starten können. Dazu werden ein Web App Manifest und ein Service Worker ergänzt.

# Hintergrund

Als statische HTML-Datei läuft die App bereits ohne Server. Für die PWA-Nutzung fehlen zwei Dinge: ein Manifest (damit der Browser „Zum Homescreen hinzufügen" anbietet) und ein Service Worker (damit die App auch ohne Netzverbindung startet). Der BETA7-Abruf bleibt netzabhängig — nur die App-Shell wird gecacht.

# Verhalten

## Manifest

- `manifest.json` liegt im Root neben `index.html`
- Felder: `name`, `short_name`, `start_url`, `display: standalone`, `background_color`, `theme_color`, Icons (mind. 192×192 und 512×512 PNG)
- `index.html` verweist per `<link rel="manifest">` darauf

## Service Worker

- `sw.js` liegt im Root
- Beim Install-Event wird `index.html` in einen Cache gelegt (`cache.put`)
- Fetch-Handler: bei Netzanfrage für `index.html` zuerst Cache, dann Netz (cache-first); alle anderen Requests (BETA7-API, Firestore) gehen direkt ans Netz ohne Cache
- Service Worker wird in `index.html` registriert (`navigator.serviceWorker.register`)
- Unterstützt der Browser keine Service Worker, läuft die App normal weiter (kein Fehler)

## Icons

- Zwei Icon-Dateien: `icon-192.png` und `icon-512.png`
- Motiv passend zur App (Bouldering-Thema, dunkler Hintergrund)

# Akzeptanzkriterien

-   [x] `manifest.json` vorhanden und korrekt verlinkt
-   [x] `sw.js` vorhanden und in `index.html` registriert
-   [x] App startet offline (nach einmaligem Online-Aufruf)
-   [x] BETA7-API-Aufrufe werden nicht gecacht (gehen direkt ans Netz)
-   [x] Icons in 192×192 und 512×512 vorhanden
-   [x] Browser ohne Service-Worker-Support läuft fehlerfrei weiter
-   [x] `README.md` wird um die Änderung ergänzt — entfällt, kein README vorhanden
