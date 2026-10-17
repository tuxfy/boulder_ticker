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
-   [ ] Test für das abzusichernde Verhalten geschrieben — ohne die Änderung rot
-   [ ] Nach der Implementierung läuft `npm test` grün durch
-   [ ] `README.md` wird um die Änderung ergänzt
```

## Akzeptanzkriterien

-   Jede Anforderung hat messbare, abgrenzbare Akzeptanzkriterien.
-   Das Kriterium **`README.md` wird um die Änderung ergänzt** ist standardmäßig enthalten. Es kann weggelassen werden, wenn die Änderung rein intern ist und keine Konfiguration, kein Setup und kein nutzerrelevantes Verhalten betrifft.
-   Wird eine neue Umgebungsvariable eingeführt, wird **`.env.example` entsprechend ergänzt** (als auskommentierter Eintrag mit kurzem Kommentar).
-   Nach der Implementierung werden alle Kriterien geprüft und abgehakt `[x]`.
-   Die Kriterien **Test für das abzusichernde Verhalten geschrieben** und **`npm test` läuft grün durch** sind standardmäßig enthalten. Ersteres kann weggelassen werden, wenn sich die Änderung sinnvoll nicht per Test absichern lässt.
-   Reihenfolge nach Red-Green: Der Test wird **vor** der Änderung geschrieben und ist ohne sie **rot**; erst nach der Implementierung wird er **grün**. Entsprechend wird „Test geschrieben" erst abgehakt, wenn der rote Test existiert, „`npm test` läuft grün durch" erst nach der Implementierung.
-   **Bevor** Kriterien abgehakt werden, müssen die Tests (`npm test`) grün durchlaufen — **ausgeführt vom Nutzer**; der Agent wartet auf dessen Bestätigung.
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
5. Status auf `in progress` setzen
6. **Vor der Änderung Test schreiben (Red)** — wo sinnvoll zuerst einen Test ergänzen, der das erwartete Verhalten bzw. bei Bug-Issues die Regression absichert: **Unit-Test (Vitest, co-lokalisiert als `src/**/*.test.js`)** für Logik in `src/core/`, **E2E-Test (Playwright, `tests/`)** für Nutzerflüsse im Browser. **Der Nutzer** lässt `npm test` laufen und bestätigt, dass der Test ohne die Änderung **rot** ist (`npm test` führt Unit- und E2E-Tests aus)
7. **Implementieren (Green)**
8. **Nach der Änderung lässt der Nutzer die Tests laufen** (`npm test`) und bestätigt das Ergebnis — **bevor** irgendein AK-Punkt abgehakt wird. Alle Tests müssen grün sein
9. Jeden AK-Punkt prüfen und abhaken
10. Status auf `done` setzen

Wird im Gespräch eine neue Idee oder Erweiterung besprochen, wird **zuerst** ein Anforderungsdokument angelegt (oder ein bestehendes ergänzt), bevor irgendein Code geschrieben oder geplant wird.

## Commits

-   **Der Agent committet nie.** Commits macht ausschließlich der Nutzer. Der Agent lässt Änderungen im Working Tree liegen und weist darauf hin.

## Tests

-   **Der Agent lässt die Tests nicht selbst laufen.** `npm test` führt ausschließlich der Nutzer aus. Der Agent schreibt die Tests, weist auf den nötigen Lauf hin und **wartet auf die grüne Bestätigung des Nutzers**, bevor er Akzeptanzkriterien abhakt oder den Status auf `done` setzt. Hintergrund: In der Sandbox ist keine zuverlässige, plattformrichtige Toolchain-Ausführung gegeben (kein Installieren/Reparieren der Toolchain in der Sandbox).
