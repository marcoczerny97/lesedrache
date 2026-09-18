import type { Grapheme } from './phonemes'

export type Word = {
  /** Das Wort, wie es geschrieben wird. */
  text: string
  /** Die Lautfolge. MAUS = M-AU-S, nicht M-A-U-S. */
  graphemes: Grapheme[]
  /** Platzhalter, bis die generierten Bilder da sind. */
  emoji: string
  bild?: string
}

/**
 * Wortliste für die Wortstufe.
 *
 * Nur Wörter aus den Buchstaben, die in deutschen Fibeln zuerst
 * drankommen. Kein ST/SP am Wortanfang - das spricht man "scht"/"schp"
 * und ist für den Anfang eine fiese Ausnahme.
 */
export const WORDS: Word[] = [
  { text: 'EIS',    graphemes: ['EI', 'S'],                emoji: '🍦' },
  { text: 'OMA',    graphemes: ['O', 'M', 'A'],            emoji: '👵' },
  { text: 'TOR',    graphemes: ['T', 'O', 'R'],            emoji: '🥅' },
  { text: 'AUTO',   graphemes: ['AU', 'T', 'O'],           emoji: '🚗' },
  { text: 'MAUS',   graphemes: ['M', 'AU', 'S'],           emoji: '🐭' },
  { text: 'NASE',   graphemes: ['N', 'A', 'S', 'E'],       emoji: '👃' },
  { text: 'ROSE',   graphemes: ['R', 'O', 'S', 'E'],       emoji: '🌹' },
  { text: 'LAMA',   graphemes: ['L', 'A', 'M', 'A'],       emoji: '🦙' },
  { text: 'MAMA',   graphemes: ['M', 'A', 'M', 'A'],       emoji: '👩' },
  { text: 'NUSS',   graphemes: ['N', 'U', 'SS'],           emoji: '🌰' },
  { text: 'LIMO',   graphemes: ['L', 'I', 'M', 'O'],       emoji: '🥤' },
  { text: 'TURM',   graphemes: ['T', 'U', 'R', 'M'],       emoji: '🏰' },
  { text: 'TASSE',  graphemes: ['T', 'A', 'SS', 'E'],      emoji: '☕' },
  { text: 'SONNE',  graphemes: ['S', 'O', 'NN', 'E'],      emoji: '☀️' },
  { text: 'SALAT',  graphemes: ['S', 'A', 'L', 'A', 'T'],  emoji: '🥗' },
  { text: 'INSEL',  graphemes: ['I', 'N', 'S', 'E', 'L'],  emoji: '🏝️' },
  { text: 'MOTOR',  graphemes: ['M', 'O', 'T', 'O', 'R'],  emoji: '🏍️' },
  { text: 'LEITER', graphemes: ['L', 'EI', 'T', 'E', 'R'], emoji: '🪜' },
  { text: 'TOMATE', graphemes: ['T', 'O', 'M', 'A', 'T', 'E'], emoji: '🍅' },
  { text: 'ROSINE', graphemes: ['R', 'O', 'S', 'I', 'N', 'E'], emoji: '🍇' },
]

/**
 * Bildet jeder Laut genau eine Taste ab?
 *
 * MAUS hat mit AU einen Laut auf zwei Tasten. Solange er Laute in Tasten
 * übersetzt, ist das eine Stolperfalle - solche Wörter bleiben draußen,
 * bis er weiter ist.
 */
export function einsZuEins(w: Word): boolean {
  return w.graphemes.every((g) => g.length === 1)
}
