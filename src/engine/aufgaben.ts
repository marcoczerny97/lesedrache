import { BUCHSTABEN, REIHENFOLGE } from '../data/buchstaben'
import { einsZuEins, WORDS } from '../data/words'
import { istSicher, type Stand } from '../store/fortschritt'

/**
 * Was der Drache als Nächstes von ihm will.
 *
 * Eine einzige Mechanik auf drei Größen: ein Laut, eine Silbe, ein Wort.
 * Er drückt immer dasselbe - Tasten der Reihe nach. Nur die Länge wächst.
 */
export type Aufgabe =
  | { art: 'buchstabe'; ziel: string[]; text: string; emoji: string }
  | { art: 'silbe'; ziel: string[]; text: string; emoji: string }
  | { art: 'wort'; ziel: string[]; text: string; emoji: string }

type Lage = {
  stand: Record<string, Stand>
  eingefuehrt: string[]
  gefangen: string[]
  runden: number
}

/** Der zuletzt eingeführte Buchstabe sitzt - Zeit für einen neuen. */
export function darfNeuenEinfuehren(l: Lage): boolean {
  if (l.eingefuehrt.length >= REIHENFOLGE.length) return false
  const neuester = l.eingefuehrt[l.eingefuehrt.length - 1]
  return istSicher(l.stand[neuester])
}

export function naechsterNeuer(eingefuehrt: string[]): string | null {
  return REIHENFOLGE.find((z) => !eingefuehrt.includes(z)) ?? null
}

/**
 * Welcher Buchstabe kommt dran?
 * Meistens der wackeligste, ab und zu einer zur Auffrischung.
 */
function waehleBuchstabe(l: Lage, letztes?: string): string {
  const frei = l.eingefuehrt.filter((z) => z !== letztes)
  const liste = frei.length ? frei : l.eingefuehrt

  const sicher = liste.filter((z) => istSicher(l.stand[z]))
  const wackelig = liste.filter((z) => !istSicher(l.stand[z]))

  // Ein Viertel der Runden frischt Gekonntes auf, damit es nicht verblasst.
  if (sicher.length && (!wackelig.length || Math.random() < 0.25)) {
    return sicher[Math.floor(Math.random() * sicher.length)]
  }

  const sortiert = [...wackelig].sort(
    (a, b) => (l.stand[a]?.serie ?? 0) - (l.stand[b]?.serie ?? 0),
  )
  const vorne = sortiert.slice(0, Math.min(2, sortiert.length))
  return vorne[Math.floor(Math.random() * vorne.length)] ?? liste[0]
}

/** Offene Silben aus dem, was er schon gefangen hat: MA, LO, SE ... */
export function moeglicheSilben(gefangen: string[]): string[] {
  const vokale = gefangen.filter((z) => BUCHSTABEN[z]?.vokal)
  const konsonanten = gefangen.filter((z) => BUCHSTABEN[z] && !BUCHSTABEN[z].vokal)
  const silben: string[] = []
  for (const k of konsonanten) for (const v of vokale) silben.push(k + v)
  return silben
}

/**
 * Wörter, die er tippen kann: jeder Buchstabe gefangen, und jeder Laut
 * sitzt auf genau einer Taste.
 */
export function moeglicheWoerter(gefangen: string[]) {
  const set = new Set(gefangen)
  return WORDS.filter(
    (w) => einsZuEins(w) && w.text.split('').every((c) => set.has(c)),
  )
}

export function naechsteAufgabe(l: Lage, letztes?: string): Aufgabe {
  const silben = moeglicheSilben(l.gefangen)
  const woerter = moeglicheWoerter(l.gefangen)

  /*
   * Rhythmus: überwiegend einzelne Laute, dazwischen etwas Längeres.
   * Das Längere kommt nur, wenn er die Bausteine wirklich gefangen hat -
   * er läuft nie in einen Buchstaben, den er noch nie gesehen hat.
   */
  const n = l.runden + 1

  if (n % 7 === 0 && woerter.length) {
    const w = woerter[Math.floor(Math.random() * woerter.length)]
    return { art: 'wort', ziel: w.text.split(''), text: w.text, emoji: w.emoji }
  }

  if (n % 4 === 0 && silben.length) {
    const s = silben[Math.floor(Math.random() * silben.length)]
    return { art: 'silbe', ziel: s.split(''), text: s, emoji: '✨' }
  }

  const z = waehleBuchstabe(l, letztes)
  return {
    art: 'buchstabe',
    ziel: [z],
    text: z,
    emoji: BUCHSTABEN[z]?.emoji ?? '✨',
  }
}
