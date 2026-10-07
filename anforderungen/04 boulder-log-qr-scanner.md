-   **Title** Boulder Log — QR-Code-Scanner für Routendetails
-   **Status** done

# Anforderung

Im Boulder Log soll es möglich sein, über den Kamera-Scanner eines Geräts einen QR-Code einer BETA7-Route einzulesen. Die App ruft daraufhin die Routendetails aus der BETA7-Datenbank ab und befüllt das Grad-Feld automatisch mit dem offiziellen Schwierigkeitsgrad der Route. `routeStyles` werden ins Stil-Feld übertragen.

Damit Routen per Wandnummer (Variante B) eindeutig einer Halle zugeordnet werden können, muss der Nutzer einmalig seine aktive Halle auswählen. Die Hallenauswahl erfolgt über eine Suche in einer gecachten Hallenliste und wird persistent gespeichert.

---

# Hintergrund

BETA7 ist eine Kletterrouten-Plattform, die in teilnehmenden Hallen QR-Codes an den Wänden anbringt. Jeder Code kodiert entweder die vollständige Routen-URL (`https://beta7.app/route/{routeId}/`) oder nur die Wandpositions-Nummer (`qrcode`-Wert). Routendetails sind öffentlich über die Firestore REST API abrufbar, ohne Login oder API-Key.

**Routing-IDs:** `{routesetterUid}~{timestampMs}`

**Zwei QR-Code-Varianten:**

| Variante | Inhalt | Abfrage |
|----------|--------|---------|
| A | Volle URL oder Route-ID | `GET /documents/routes/{routeId}` |
| B | Nur Wandnummer (`qrcode`-Wert) | `POST /documents:runQuery` mit `structuredQuery` |

Bei Variante B ist die Wandnummer nicht eindeutig (mehrere Routen pro Position möglich — beim Umschrauben); clientseitig wird auf `status == "active"` gefiltert und die neueste Route (`time` größter Wert) gewählt. Sind mehrere `locationId`-Werte vertreten, wird die aktive Halle des Nutzers als Filter verwendet.

**Firestore-Endpunkt:** `https://firestore.googleapis.com/v1/projects/beta7-206508/databases/(default)/documents`

**Hallenliste:**
- `GET …/documents/locations?pageSize=300` mit Feldmaske auf `displayName`, `locationName`, `address`, `status`; bei `nextPageToken` nachladen.
- Pro Eintrag: `locationId` (letztes Segment von `name`), Anzeigename (`displayName` → `locationName` → `locationId`), Ort aus `address`, `status`.
- Ergebnis in `localStorage` mit Zeitstempel cachen (wöchentlich oder manuell aktualisierbar).

**Relevante Felder im Locations-Dokument:**

| Feld | Inhalt |
|------|--------|
| `displayName` / `locationName` | Anzeigename der Halle |
| `address` | Adresse / Ort |
| `status` | `active` / inaktiv |

**Relevante Felder im Routendokument:**

| Feld | Inhalt |
|------|--------|
| `grades.label` | Schwierigkeitsgrad, z. B. `6C+` |
| `routeStyles` | Stil-Tags, z. B. `["technic","strength"]` |
| `status` | `active` / inaktiv |
| `locationId` | Hallen-ID |
| `qrcode` | Wandpositionsnummer |
| `time` | Zeitstempel in ms (Routenerstellung) |

---

# Verhalten

## Layout Boulder Log

Die Seite ist von oben nach unten gegliedert:
1. App-Header
2. Hallenanzeige (Name + Ort, anklickbar)
3. QR-Scanner-Symbol (zentriert) — Tap öffnet die Kameraansicht
4. Eingabeformular (Grad, Versuche, Geschafft, Stil)

## Scanner starten

- Das zentrierte QR-Scanner-Symbol unterhalb der Hallenanzeige öffnet die Kameraansicht (Rückkamera bevorzugt).
- Die App prüft vorab, ob `BarcodeDetector` im Browser verfügbar ist und das Format `qr_code` unterstützt wird. Ist das nicht der Fall (z. B. Firefox), wird ein deutlicher Hinweis angezeigt und kein Fallback auf externe Bibliotheken gestartet.
- Der Scanner läuft als kleines Overlay über der Seite. Ein Abbrechen-Button ist unten mittig platziert und schließt das Overlay.
- Der Scanner läuft kontinuierlich, bis ein QR-Code erkannt oder der Vorgang abgebrochen wird.

## Erkennung und Abruf

- Nach erfolgreicher QR-Erkennung wird die Kamera gestoppt.
- Die App erkennt automatisch, ob der Inhalt eine BETA7-URL/Route-ID (Variante A) oder eine reine Zahl (Variante B) ist, und führt den passenden Firestore-Abruf durch. Passt der Inhalt auf keines der beiden Muster, wird ein Hinweis „Inhalt kann nicht verarbeitet werden" angezeigt sowie der rohe QR-Inhalt (zur Fehlerdiagnose).
- Während des Abrufs wird ein Ladezustand angezeigt.

## Hallenauswahl

- Unterhalb des App-Headers zeigt ein eigener Bereich die aktuell gewählte Halle (Name + Ort). Ein Klick darauf öffnet die Hallensuche als eigene Seite.
- Ist noch keine Halle gewählt, erscheint stattdessen „Keine Halle gewählt" als anklickbarer Link zur Hallensuche.
- Die Hallensuche ist eine eigene Seite mit Suchfeld, Trefferliste und einem „Aktualisieren"-Button zum manuellen Neu-Laden der Hallenliste aus der API.
- Die Suche läuft clientseitig in-memory über die gecachte Hallenliste — kein Debounce nötig.
- Suche ist case-, umlaut- und emoji-unabhängig (Normalisierung: Kleinbuchstaben, Diakritika entfernen, Emojis/Satzzeichen strippen). Token-UND-Suche: alle eingegebenen Wörter müssen im Hallennamen vorkommen, Reihenfolge egal.
- Ranking: exakter Treffer → Name beginnt mit Eingabe → ein Token beginnt mit Eingabe → enthält. Maximal 20 Treffer. Bei Gleichstand alphabetisch.
- Jede Zeile zeigt Hallenname **und** Ort/Adresse (Kettenfilialen wären sonst nicht unterscheidbar).
- Inaktive Hallen werden ausgeblendet.
- Leere Eingabe zeigt die gesamte Liste alphabetisch; zuletzt gewählte Halle steht oben.
- Gewählte `locationId` + Anzeigename werden in `localStorage` gespeichert und als aktiver Kontext für Variante-B-Abfragen verwendet.
- Ist beim ersten Start kein Cache vorhanden und kein Netz verfügbar, erscheint ein Hinweis; die Suche ist erst nach einmaligem Online-Laden möglich.

## Grad übernehmen

- Wird eine aktive Route gefunden, wird `grades.label` ins Grad-Feld des Boulder-Log-Formulars übertragen.
- `routeStyles` werden unverändert (englische Bezeichnungen) als kommaseparierter Text ins Stil-Feld übertragen.
- Der Nutzer kann die vorausgefüllten Werte vor dem Speichern noch anpassen.

## Fehlerbehandlung

| Situation | Anzeige |
|-----------|---------|
| `BarcodeDetector` nicht verfügbar | Hinweis: „QR-Scanner wird von diesem Browser nicht unterstützt (Chrome empfohlen)" |
| Kein Kamerazugriff | Hinweis: „Kamerazugriff nicht möglich" |
| Unbekannte Route-ID (NOT_FOUND) | Hinweis: „Route nicht gefunden" |
| Keine aktive Route an Wandposition | Hinweis: „Keine aktive Route an dieser Position" |
| Netzwerkfehler | Hinweis: „Abruf fehlgeschlagen — bitte erneut versuchen" |
| Unbekannter QR-Inhalt | Hinweis: „Inhalt kann nicht verarbeitet werden" + roher QR-Inhalt |
| Kein Hallencache + kein Netz | Hinweis: „Hallenliste nicht verfügbar — bitte einmal online öffnen" |
| Variante B ohne gewählte Halle | Hinweis mit Aufforderung, zuerst eine Halle auszuwählen |

---

# Akzeptanzkriterien

-   [x] Seitenlayout: App-Header → Hallenanzeige → QR-Scanner-Symbol (zentriert) → Formular
-   [x] Tap auf das QR-Scanner-Symbol startet die Kameraansicht
-   [x] Browserprüfung auf `BarcodeDetector` + `qr_code`-Unterstützung erfolgt vor Kamerastart; ohne Support wird ein Hinweis angezeigt
-   [x] QR-Code im BETA7-URL-Format (`https://beta7.app/route/{routeId}/`) wird korrekt erkannt und die Route per ID abgerufen
-   [x] QR-Code mit reiner Wandnummer (Integer) ruft die neueste aktive Route an dieser Position ab
-   [x] Unterhalb des App-Headers wird die gewählte Halle (Name + Ort) angezeigt; ein Klick öffnet die Hallensuche als eigene Seite
-   [x] Ohne gewählte Halle erscheint „Keine Halle gewählt" als anklickbarer Link zur Hallensuche
-   [x] Hallensuche-Seite enthält Suchfeld, Trefferliste und „Aktualisieren"-Button
-   [x] Hallenauswahl speichert `locationId` + Anzeigename in `localStorage`
-   [x] Hallenliste wird per `GET /documents/locations` geladen, clientseitig durchsuchbar (case-/umlaut-/emoji-unabhängig, Token-UND, max. 20 Treffer) und in `localStorage` gecacht
-   [x] Jede Zeile in der Hallenliste zeigt Name und Ort; inaktive Hallen werden ausgeblendet
-   [x] Cache ist manuell über „Aktualisieren"-Button neu ladbar; bei fehlendem Cache ohne Netz erscheint ein Hinweis
-   [x] Variante B ohne gewählte Halle zeigt einen Hinweis mit Aufforderung zur Hallenauswahl
-   [x] Scanner öffnet sich als kleines Overlay mit Abbrechen-Button unten mittig
-   [x] QR-Code mit unbekanntem Inhalt zeigt Hinweis „Inhalt kann nicht verarbeitet werden" und den rohen QR-Inhalt
-   [x] Bei mehreren aktiven Routen an einer Wandposition wird die aktive Halle als Filter verwendet
-   [x] `grades.label` wird nach erfolgreichem Abruf ins Grad-Feld übertragen
-   [x] `routeStyles` werden als kommaseparierter Text ins Stil-Feld übertragen
-   [x] Alle definierten Fehlerfälle zeigen einen verständlichen Hinweis
-   [x] Die Kamera wird nach Erkennung oder Abbruch zuverlässig gestoppt
-   [x] Funktioniert als statische HTML-Datei ohne Build-Pipeline (bestehende Deployment-Anforderung bleibt erfüllt)
