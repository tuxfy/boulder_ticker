-   **Title** Workout Intervall Timer
-   **Status** done

# Anforderung

Ein Intervall-Timer als neues Tool in der Bouldering-Berlin-App. Der Nutzer konfiguriert Work/Rest/Set-Parameter und startet den Timer. Der Timer läuft durch alle Phasen und zeigt visuell die aktuelle Phase und verbleibende Zeit.

# Hintergrund

Beim Bouldern im Gym sind strukturierte Intervalle wichtig — z. B. 45 s Work, 3 min Rest, 5 Runden pro Set, 2 Sets. Bisher kein Tool dafür in der App.

# Verhalten

## Konfiguration

| Parameter         | Beschreibung                              | Einheit  |
|-------------------|-------------------------------------------|----------|
| Work              | Dauer einer Arbeitsphase                  | Sekunden |
| Rest              | Pause zwischen zwei Work-Phasen           | Sekunden |
| Anzahl Work       | Anzahl Work-Phasen pro Set                | Anzahl   |
| Anzahl Sets       | Anzahl Sets gesamt                        | Anzahl   |
| Set-Pause         | Pause zwischen zwei Sets                  | Sekunden |

Eingabe der Sekundenfelder (Work, Rest, Set-Pause) ist sekundengenau (Schrittweite 1). Neben den +/−-Buttons ist direkte Texteingabe möglich; beim Verlassen des Felds wird der Wert auf den gültigen Bereich geklemmt.

## Timer-Ablauf

```
Vorbereitung (10 s, fix)
└─ Set 1
   ├─ Work 1 → Rest → Work 2 → Rest → … → Work N
   └─ Set-Pause  (entfällt nach dem letzten Set)
└─ Set 2
   ├─ Work 1 → Rest → Work 2 → Rest → … → Work N
   └─ Set-Pause
…
└─ Set M  →  Fertig
```

Nach dem letzten Work des letzten Sets endet der Timer (kein Rest, keine Set-Pause danach).

## Anzeige während des Timers

- Aktuelle Phase groß und eindeutig (z. B. „Work", „Rest", „Set-Pause", „Vorbereitung")
- Verbleibende Sekunden als große Zahl
- Fortschritt im Set sichtbar (z. B. „Work 3 / 5")
- Aktueller Set sichtbar (z. B. „Set 1 / 3")

## Display Wake Lock

- Sobald der Timer gestartet wird, wird ein Wake Lock angefordert (`navigator.wakeLock.request('screen')`) — der Bildschirm bleibt aktiv
- Wake Lock wird aufgehoben wenn der Timer endet, pausiert oder zurückgesetzt wird
- Wird die App in den Hintergrund geschoben und wieder aktiv, wird der Wake Lock automatisch neu angefordert (sofern der Timer noch läuft)
- Wird die API nicht unterstützt, läuft der Timer normal weiter (kein Fehler)

## Steuerung

- **Start** → Form schließt sich, Timer-Ansicht erscheint
- **Pause / Weiter** während des Timers
- **Reset** → Timer stoppt, Form öffnet sich wieder mit den letzten Werten
- Nach **Ablauf** des Timers öffnet sich die Form automatisch wieder

## Persistenz

- Alle 5 Konfigurationsfelder werden in **localStorage** gespeichert und beim nächsten Öffnen des Tools wiederhergestellt

## Akustik

Per Web Audio API (kein Server, funktioniert offline):

- In den letzten 3 Sekunden jeder Phase: ein kurzer Beep pro Sekunde (bei 3, 2, 1)
- Beim Phasenwechsel (0): ein Beep mit anderem Ton (tiefer oder länger)

## Visuelle Phase

Akzentfarbe wechselt je nach aktiver Phase:

| Phase        | Farbe |
|--------------|-------|
| Work         | Rot   |
| Rest         | Grün  |
| Set-Pause    | Grün  |
| Vorbereitung | Neutral (Standard-Dunkel) |

# Akzeptanzkriterien

-   [x] Alle 5 Parameter sind konfigurierbar
-   [x] Timer läuft korrekt durch: Vorbereitung → Sets → Works → Rests → Set-Pausen
-   [x] Nach letztem Work des letzten Sets stoppt der Timer
-   [x] Aktuelle Phase, verbleibende Zeit, Work-Index und Set-Index sind sichtbar
-   [x] Work-Phasen rot, Rest- und Set-Pausen-Phasen grün hervorgehoben
-   [x] Beep bei 3, 2, 1 Sekunden vor Phasenende; anderem Ton bei Phasenwechsel (0)
-   [x] Wake Lock wird beim Start angefordert, bei Ende/Pause/Reset freigegeben, bei Rückkehr in den Vordergrund erneuert
-   [x] Start schließt die Form, Timer-Ansicht erscheint
-   [x] Reset und Timer-Ende öffnen die Form wieder mit letzten Werten
-   [x] Pause / Weiter funktionieren
-   [x] Konfigurationswerte werden in localStorage gespeichert und wiederhergestellt
-   [x] Tool erscheint als Kachel auf der Startseite
