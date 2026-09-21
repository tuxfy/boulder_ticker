# Agent Guidelines

## Anforderungen

Anforderungen liegen als Markdown-Dateien in `anforderungen/` und folgen diesem Aufbau:

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
-   Erst wenn alle Kriterien erfüllt sind, wird der Status auf `done` gesetzt.

## Sicherheit

Secrets (API-Tokens, Passwörter, Schlüssel) werden niemals ausgegeben oder geloggt — weder direkt noch indirekt.

-   Keine Secret-Werte in `print()`, Logging oder Fehlermeldungen
-   Bei Exception-Handling in Netzwerkaufrufen nur generische Meldungen ausgeben (`str(e)` weglassen — requests-Exceptions können Header mit Tokens enthalten)
-   Secrets niemals in Request-Bodys, URLs, Query-Parametern oder sonstigen Payloads — ausschließlich in dafür vorgesehenen Auth-Headern
-   Secrets ausschließlich über Umgebungsvariablen einlesen, nie hardcoden

## Workflow

1. Anforderung liegt als `new` vor
2. Anforderung ausschärfen: Hintergrund, Verhalten, Akzeptanzkriterien ergänzen → Status `refined`
3. Status auf `in progress` setzen beim Beginn der Umsetzung
4. Implementieren
5. Jeden AK-Punkt prüfen und abhaken
6. Status auf `done` setzen
