/**
 * Buchstaben und ihre Anlaut-Kreaturen.
 *
 * Jeder Buchstabe gehört zu genau einem Wesen, das aus dem Ei schlüpft,
 * wenn er die Taste findet. Das Wesen zieht danach dauerhaft in seine
 * Welt - es ist der Beweis, dass er diesen Buchstaben erobert hat.
 *
 * Auswahlregel: Das Anlautwort muss mit dem LAUT des Buchstabens
 * beginnen, nicht mit seinem Namen. Darum kein "Vogel" für V (spricht
 * sich /f/) und kein "Chamäleon" für C.
 */

export type Buchstabe = {
  zeichen: string
  /** Anlautwort - beginnt mit dem Laut des Buchstabens. */
  wort: string
  emoji: string
  /** Vokale brauchen im Spiel eine Sonderrolle (Silbenbildung). */
  vokal: boolean
}

export const BUCHSTABEN: Record<string, Buchstabe> = {
  M: { zeichen: 'M', wort: 'Maus',    emoji: '🐭', vokal: false },
  A: { zeichen: 'A', wort: 'Affe',    emoji: '🐵', vokal: true },
  L: { zeichen: 'L', wort: 'Löwe',    emoji: '🦁', vokal: false },
  O: { zeichen: 'O', wort: 'Oktopus', emoji: '🐙', vokal: true },
  E: { zeichen: 'E', wort: 'Elefant', emoji: '🐘', vokal: true },
  I: { zeichen: 'I', wort: 'Igel',    emoji: '🦔', vokal: true },
  S: { zeichen: 'S', wort: 'Sonne',   emoji: '☀️', vokal: false },
  T: { zeichen: 'T', wort: 'Tiger',   emoji: '🐯', vokal: false },
  N: { zeichen: 'N', wort: 'Nashorn', emoji: '🦏', vokal: false },
  R: { zeichen: 'R', wort: 'Rakete',  emoji: '🚀', vokal: false },
  U: { zeichen: 'U', wort: 'Uhu',     emoji: '🦉', vokal: true },
  F: { zeichen: 'F', wort: 'Fisch',   emoji: '🐟', vokal: false },
  H: { zeichen: 'H', wort: 'Hund',    emoji: '🐶', vokal: false },
  D: { zeichen: 'D', wort: 'Delfin',  emoji: '🐬', vokal: false },
  W: { zeichen: 'W', wort: 'Wal',     emoji: '🐋', vokal: false },
  B: { zeichen: 'B', wort: 'Bär',     emoji: '🐻', vokal: false },
  K: { zeichen: 'K', wort: 'Katze',   emoji: '🐱', vokal: false },
  P: { zeichen: 'P', wort: 'Pinguin', emoji: '🐧', vokal: false },
  G: { zeichen: 'G', wort: 'Giraffe', emoji: '🦒', vokal: false },
  Z: { zeichen: 'Z', wort: 'Zebra',   emoji: '🦓', vokal: false },
}

/**
 * Einführungsreihenfolge, angelehnt an gängige deutsche Fibeln.
 * Früh dabei sind Buchstaben, aus denen sich schnell echte Wörter
 * bilden lassen - deshalb steht M vorn und nicht A.
 */
export const REIHENFOLGE = [
  'M', 'A', 'L', 'O', 'E', 'I', 'S', 'T', 'N', 'R',
  'U', 'F', 'H', 'D', 'W', 'B', 'K', 'P', 'G', 'Z',
]

export const VOKALE = REIHENFOLGE.filter((z) => BUCHSTABEN[z].vokal)

export function istBuchstabe(zeichen: string): boolean {
  return zeichen in BUCHSTABEN
}
