import { lettersOf, type Grapheme } from './phonemes'

export type Word = {
  /** Das Wort, wie es geschrieben wird. */
  text: string
  /** Die Lautfolge. MAUS = M-AU-S, nicht M-A-U-S. */
  graphemes: Grapheme[]
  /** Platzhalter, bis die Higgsfield-Bilder da sind. */
  emoji: string
  /** Bilddatei, sobald generiert. */
  bild?: string
}

/**
 * Wortliste v1.
 *
 * Bewusst nur Wörter aus den Buchstaben, die in deutschen Fibeln
 * zuerst drankommen: A E I O U L M N R S T.
 * Kein ST/SP am Wortanfang - das spricht man "scht"/"schp" und
 * ist für den Anfang eine fiese Ausnahme.
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

/** Alle Buchstaben, die in der Wortliste vorkommen. */
export const ALL_LETTERS = [...new Set(
  WORDS.flatMap((w) => w.graphemes.flatMap(lettersOf)),
)].sort()

/**
 * Voreinstellung: alle Buchstaben der Wortliste sind frei.
 * Im Eltern-Bereich hakt man ab, was in der Klasse noch NICHT dran war -
 * dann tauchen nur noch Wörter auf, die er wirklich knacken kann.
 */
export const DEFAULT_LETTERS = ALL_LETTERS

/** Nur Wörter, die das Kind mit seinen Buchstaben auch knacken kann. */
export function wordsFor(known: string[]): Word[] {
  const set = new Set(known)
  return WORDS.filter((w) =>
    w.graphemes.flatMap(lettersOf).every((l) => set.has(l)),
  )
}

/** Wortlänge in Lauten - damit wir leicht nach schwer sortieren. */
export function difficulty(w: Word): number {
  return w.graphemes.length
}
