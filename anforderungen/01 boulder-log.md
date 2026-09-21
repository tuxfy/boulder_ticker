# Boulder Log — Anforderungen

## Ziel

Einfache Web-App zum schnellen Erfassen von Boulder-Sessions im Gym.
Keine Installation, keine Accounts, läuft im Browser. Mobilfähig.

---

## Datenhaltung

- **SessionStorage** im Browser (Daten bleiben bis zum Tab-Schließen erhalten, kein Server, kein Login)

---

## Eingabe

| Feld        | Typ                        | Wertebereich                  | Default |
|-------------|----------------------------|-------------------------------|---------|
| Grad        | Textfeld mit Autocomplete  | Freitext + Vorschläge Font-Skala (3 – 8c+) via `<datalist>` | leer |
| Versuche    | Zahl                       | ≥ 1                           | 1       |
| Geschafft   | Checkbox / Haken           | ja / nein                     | nein    |
| Stil        | Textfeld                   | Freitext (z. B. `crimp`, `sloper`, `dyn`) | leer |

- Eintrag hinzufügen per Button **+** oder **Enter**-Taste
- Gleicher Grad kann mehrfach eingetragen werden (mehrere Probleme)

---

## Ausgabe / Ergebnisfeld

- Zentrales **editierbares Textfeld** (Textarea) zeigt die gesammelte Liste
- **Add** hängt den neuen Eintrag an der richtigen Stelle nach Schwierigkeit ein (Font-Skala-Reihenfolge)
- Der Nutzer kann den Text im Feld jederzeit direkt bearbeiten (Tippfehler korrigieren, Zeilen umsortieren)
- Inhalt der Textarea wird auch in SessionStorage gespeichert
- Format pro Zeile:
  - ohne Stil, nicht geschafft: `- <grad>: <versuche> tries`
  - ohne Stil, geschafft:       `- <grad>: <versuche> tries (send)`
  - mit Stil, nicht geschafft:  `- <grad>: <versuche> tries - <stil>`
  - mit Stil, geschafft:        `- <grad>: <versuche> tries (send) - <stil>`
  - Singular bei 1 Versuch: `1 try` statt `1 tries`
- Beispiel:
  ```
  - 6b: 3 tries (send) - sloper
  - 7a: 1 try
  - 7a+: 5 tries (send) - crimp
  ```
- Button **Kopieren** überträgt den Inhalt der Textarea in die Zwischenablage

---

## Reset

- Button **Reset** löscht den Inhalt der Textarea und die SessionStorage
- Sicherheitsabfrage vor dem Löschen

---

## Deployment

- Statische Single-HTML-Datei (`index.html`), keine Build-Pipeline nötig
- Deploy via **GitHub Pages** (Branch `main`, Root-Verzeichnis)

---

## Offene Punkte

— keine
