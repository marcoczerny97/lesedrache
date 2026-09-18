# Lesedrache

Lese-Lern-App für ein Kind in der 1. Klasse, das noch nicht lesen kann
und **noch nicht alle Buchstaben kennt**.

## Die drei Regeln, die alles bestimmen

1. **Kein Text ist zur Bedienung nötig.** Er kann nicht lesen. Alles läuft
   über Bild, Ton und Symbole. Text auf dem Bildschirm ist immer nur für
   Erwachsene oder dekorativ.
2. **Die Tastatur ist das Spiel.** Gespielt wird am Laptop ohne Maus. Vor
   ihm liegt ein Gegenstand mit allen Buchstaben darauf - das ist der
   Hebel, den eine Tablet-App nicht hat. Er jagt Buchstaben auf einer
   echten Tastatur, statt sie auf einem Bildschirm anzutippen.
3. **Es gibt kein Falsch.** Eine danebengetippte Taste sagt ihren eigenen
   Laut und lässt das Ei weiter aufspringen. Jeder Tastendruck lehrt
   etwas. Kein rotes Kreuz, kein Buzzer, keine Sackgasse.

## Aufbau

Eine einzige Mechanik auf drei Größen - er drückt immer Tasten der Reihe
nach, nur die Länge wächst:

| Stufe | Der Drache macht | Er drückt |
|---|---|---|
| Laut | „mmmm" | `M` |
| Silbe | „ma" | `M` `A` |
| Wort | „Mama" + Bild | `M` `A` `M` `A` |

Längeres kommt nur aus Buchstaben, die er nachweislich gefangen hat. Er
läuft nie in ein Zeichen, das er noch nie gesehen hat.

## Adaptivität

**Es gibt bewusst keine Elterneinstellung, welche Buchstaben er kennt.**
Die App misst es: Ein Buchstabe gilt als sicher, wenn er ihn `SICHER_AB`
mal hintereinander auf Anhieb gefunden hat (`store/fortschritt.ts`). Erst
dann wird der nächste eingeführt. Startpunkt sind null bekannte
Buchstaben - das ist der Normalfall, kein Sonderfall.

Die Hilfe verblasst mit dem Können (`screens/Jagd.tsx`):

- neuer Buchstabe → Zeichen sichtbar, Taste leuchtet, Schattenriss im Ei
- nach einem Fehlversuch → dasselbe wieder
- sitzt er → nur noch der Laut

## Didaktik

- Die Sprachausgabe sagt **Laute, keine Buchstabennamen**: „mmmm", nie
  „Em". Buchstabennamen sabotieren das Lautieren.
- Anlautwörter müssen mit dem **Laut** beginnen, nicht mit dem Namen des
  Buchstabens. Darum kein „Vogel" für V.
- Auf der Wortstufe nur Wörter, bei denen jeder Laut auf genau einer
  Taste sitzt (`einsZuEins` in `data/words.ts`). `MAUS` hat mit `AU`
  einen Laut auf zwei Tasten und bleibt vorerst draußen.
- Die Bildschirmtastatur bildet exakt das QWERTZ-Layout ab. Sie ist eine
  Landkarte für das echte Gerät, keine Schaltfläche.

## Stand

Spielbar und vollständig. Platzhalter, die noch raus müssen:

- Drache und Wesen sind Emojis → generierte Illustrationen
- Ton läuft über die Browser-Sprachausgabe → echte Aufnahmen nach
  `public/audio/laute/` und `public/audio/woerter/`, dann in
  `public/audio/manifest.json` eintragen. `audio/speak.ts` nimmt
  Aufnahmen automatisch bevorzugt, der Code ändert sich nicht.
  Besonders B, D, G, K, P, T klingen als Sprachausgabe falsch - die
  hängt ein „e" an.

## Entwicklung

Dev-Server über die Konfiguration `lesedrache` in `.claude/launch.json`
starten, nicht über die Shell.

## Daten

Fortschritt liegt ausschließlich in `localStorage`. Kein Konto, kein
Backend, keine Übertragung. Das bleibt so.
