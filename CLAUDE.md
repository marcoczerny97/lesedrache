# Lesedrache

Lese-Lern-App für ein Kind in der 1. Klasse, das noch nicht lesen kann.

## Die zwei Regeln, die alles bestimmen

1. **Kein Text ist zur Bedienung nötig.** Er kann nicht lesen. Alles läuft
   über Bild, Ton und Symbole. Text auf dem Bildschirm ist immer nur für
   Erwachsene oder dekorativ.
2. **Tastatur zuerst, Maus optional.** Gespielt wird am Laptop ohne Maus.
   Jede Aktion muss über eine Taste erreichbar sein: `⎵` hören, `⏎`
   zusammenziehen, `1` `2` `3` wählen, `Esc` zurück.

## Didaktik

- Es wird mit **Graphemen** gearbeitet, nicht mit Buchstaben. `MAUS` sind
  drei Laute (M-AU-S), nicht vier. Siehe `src/data/phonemes.ts`.
- Die Sprachausgabe sagt **Laute, keine Buchstabennamen**: "mmmm", nie "Em".
  Buchstabennamen sabotieren das Lautieren.
- Wortliste nutzt nur die Buchstaben, die in deutschen Fibeln zuerst
  drankommen (A E I O U L M N R S T). Kein ST/SP am Wortanfang.
- Im Eltern-Bereich stellt man ein, welche Buchstaben in der Klasse schon
  dran waren. Es erscheinen nur Wörter, die damit lösbar sind.
- Falsch heißt nie "Fehler", sondern "nochmal". Kein rotes Kreuz.

## Stand

Spielmodus **Lautsynthese** ist fertig. Platzhalter, die noch raus müssen:

- Drache und Wortbilder sind Emojis → generierte Illustrationen
- Ton läuft über die Browser-Sprachausgabe → echte Aufnahmen nach
  `public/audio/laute/` und `public/audio/woerter/`, dann in
  `public/audio/manifest.json` eintragen. `src/audio/speak.ts` nimmt
  Aufnahmen automatisch bevorzugt, der Code ändert sich nicht.

## Entwicklung

Dev-Server über die Konfiguration `lesedrache` in `.claude/launch.json`
starten, nicht über die Shell.

## Daten

Fortschritt liegt ausschließlich in `localStorage`. Kein Konto, kein
Backend, keine Übertragung. Das bleibt so.
