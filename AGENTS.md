# Agent Guidelines

## Anforderungen

„Anforderung" meint hier **jede** umzusetzende Änderung — sowohl neue Features als auch **Bug-Issues**. Beide werden identisch behandelt: als Markdown-Datei in `anforderungen/`, im selben Format, mit demselben Workflow und denselben Akzeptanzkriterien. Für ein Bug-Issue beschreibt der Abschnitt „Anforderung" das erwartete korrekte Verhalten und „Hintergrund" das fehlerhafte Ist-Verhalten samt Ursache.

## Ablage & Lebenszyklus

-   Neue Anforderungen/Issues werden **standardmäßig im Unterordner `anforderungen/backlog/`** angelegt — **unsortiert, ohne Nummernpräfix**, Status `new`.
-   Setzt **der Nutzer** den Status auf `refined`, wandert das Dokument aus `backlog/` heraus nach `anforderungen/` und erhält die **nächste freie laufende Nummer** (es sortiert sich damit unten an). Erst dann ist es für die Umsetzung vorgesehen.
-   Erst nach explizitem **„Go"** des Nutzers beginnt die Umsetzung.

Anforderungen folgen diesem Aufbau:

```
-   **Title** Kurzer Titel
-   **Status** new | refined | in progress | done

# Anforderung

Beschreibung was umgesetzt werden soll. Fachlich, präzise, ohne Implementierungsdetails.

# Hintergrund

Optional. Kontext, der erklärt warum die Anforderung existiert oder wie das betroffene System aktuell funktioniert.

# Umgebungsvariable / Konfiguration

Optional. Nur wenn neue Konfiguration eingeführt wird — Name, Format, Standardwert, Verhalten bei leerem Wert.

# Verhalten

Optional. Beschreibt das erwartete Verhalten aus Nutzersicht, z. B. für UI-Änderungen.

# Akzeptanzkriterien

-   [ ] ...
-   [ ] ...
-   [ ] `README.md` wird um die Änderung ergänzt
```

## Akzeptanzkriterien

-   Jede Anforderung hat messbare, abgrenzbare Akzeptanzkriterien.
-   Das Kriterium **`README.md` wird um die Änderung ergänzt** ist standardmäßig enthalten. Es kann weggelassen werden, wenn die Änderung rein intern ist und keine Konfiguration, kein Setup und kein nutzerrelevantes Verhalten betrifft.
-   Wird eine neue Umgebungsvariable eingeführt, wird **`.env.example` entsprechend ergänzt** (als auskommentierter Eintrag mit kurzem Kommentar).
-   Nach der Implementierung werden alle Kriterien geprüft und abgehakt `[x]`.
-   Das Kriterium **Lokaler Test durch den Nutzer per `npx serve` erfolgreich** ist standardmäßig enthalten, wenn die Änderung nutzerrelevantes Verhalten betrifft.
-   Erst wenn alle Kriterien erfüllt sind, wird der Status auf `done` gesetzt.

## Sicherheit

Secrets (API-Tokens, Passwörter, Schlüssel) werden niemals ausgegeben oder geloggt — weder direkt noch indirekt.

-   Keine Secret-Werte in `print()`, Logging oder Fehlermeldungen
-   Bei Exception-Handling in Netzwerkaufrufen nur generische Meldungen ausgeben (`str(e)` weglassen — requests-Exceptions können Header mit Tokens enthalten)
-   Secrets niemals in Request-Bodys, URLs, Query-Parametern oder sonstigen Payloads — ausschließlich in dafür vorgesehenen Auth-Headern
-   Secrets ausschließlich über Umgebungsvariablen einlesen, nie hardcoden

## Workflow

**Pflicht: Kein Code ohne zugehöriges Anforderungsdokument und explizites Go.** Reihenfolge ist verbindlich:

1. Anforderungsdokument in `anforderungen/backlog/` anlegen (unsortiert, ohne Nummernpräfix), Status `new`
2. Anforderung ausschärfen — Hintergrund, Verhalten, Akzeptanzkriterien ergänzen — mit dem Nutzer abstimmen; **der Nutzer setzt den Status auf `refined`**. Damit wandert das Dokument aus `backlog/` nach `anforderungen/` und erhält die nächste laufende Nummer.
3. Bei Bug-Issues: Vermutungen zur Ursache werden **vor** der Implementierung des Fixes **lokal bestätigt** — über eine temporäre Diagnose und einen Test, den der **Nutzer per `npx serve`** (z. B. iPhone im selben WLAN) durchführt. Erst mit bestätigter Ursache wird der Fix geplant.
4. Warten auf explizites **„Go"** des Nutzers — kein Code, kein Planen von Implementierungsdetails vorher
5. Status auf `in progress` setzen, dann implementieren
6. Jeden AK-Punkt prüfen und abhaken
7. Status auf `done` setzen

Wird im Gespräch eine neue Idee oder Erweiterung besprochen, wird **zuerst** ein Anforderungsdokument angelegt (oder ein bestehendes ergänzt), bevor irgendein Code geschrieben oder geplant wird.

## Commits

-   **Der Agent committet nie.** Commits macht ausschließlich der Nutzer. Der Agent lässt Änderungen im Working Tree liegen und weist darauf hin.
