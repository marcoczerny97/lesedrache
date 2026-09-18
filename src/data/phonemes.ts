/**
 * Graphem -> Laut.
 *
 * Wichtig: Wir arbeiten mit GRAPHEMEN, nicht mit Buchstaben.
 * "MAUS" sind vier Buchstaben, aber nur drei Laute: M-AU-S.
 * Genau daran scheitern die meisten Lern-Apps, und genau das
 * verwirrt Kinder beim Lautieren.
 */

export type Grapheme = string

/**
 * Doppelkonsonanten sind derselbe Laut wie der einfache.
 * TASSE = T-A-SS-E, gesprochen wie ein S.
 */
const DOUBLES: Record<string, string> = {
  SS: 'S', NN: 'N', MM: 'M', LL: 'L', TT: 'T', RR: 'R',
}

/**
 * Aussprache-Hinweis für die Sprachausgabe.
 *
 * ACHTUNG - das ist bewusst der LAUT, nicht der Buchstabenname:
 * "mmmm", nicht "Em". Wer Kindern Buchstabennamen beibringt,
 * sabotiert das Lautieren: aus M-A-L-A wird sonst "Em-Ah-El-Ah".
 *
 * Das hier ist nur der Platzhalter über die Browser-Sprachausgabe.
 * Sobald echte Aufnahmen in public/audio/laute/ liegen, werden die
 * bevorzugt (siehe audio/speak.ts).
 */
export const LAUT_HINT: Record<string, string> = {
  A: 'ahh', E: 'ähh', I: 'ihh', O: 'ohh', U: 'uhh',
  AU: 'auuu', EI: 'eiii', EU: 'oiii',
  // Dauerlaute lassen sich ziehen und klingen darum am saubersten.
  F: 'fff', L: 'llll', M: 'mmmm', N: 'nnnn', R: 'rrrr', S: 'ssss',
  W: 'wwww', H: 'hhh', Z: 'tss',
  // Verschlusslaute gehen nur kurz. Hier ist die Sprachausgabe am
  // schwächsten - sie hängt gern ein "e" an. Das lösen erst Aufnahmen.
  B: 'b', D: 'd', G: 'g', K: 'k', P: 'p', T: 't',
}

export function lautHint(grapheme: Grapheme): string {
  const base = DOUBLES[grapheme] ?? grapheme
  return LAUT_HINT[base] ?? base
}

/** Dateiname für eine echte Laut-Aufnahme. */
export function lautFile(grapheme: Grapheme): string {
  const base = DOUBLES[grapheme] ?? grapheme
  return `/audio/laute/${base}.mp3`
}
