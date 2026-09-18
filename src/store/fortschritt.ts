import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { REIHENFOLGE } from '../data/buchstaben'

/**
 * Was das Kind kann - gemessen, nicht eingestellt.
 *
 * Jeder Buchstabe durchläuft drei Schritte. Das ist der Kern: Ohne den
 * ersten lernt er nichts, er folgt nur der leuchtenden Taste.
 *
 *   1. VORSTELLEN  Der Drache zeigt Buchstabe, Laut und Wesen.
 *                  Nichts kann schiefgehen, nichts wird gezählt.
 *   2. GEFÜHRT     Er sucht die Taste, die Hilfe ist an.
 *                  Zählt als Übung, NICHT als Können.
 *   3. FREI        Er sucht ohne Hilfe. Erst das zählt.
 *
 * Nur Treffer im dritten Schritt gelten als Beweis, dass ein Buchstabe
 * sitzt. Alles andere wäre Selbstbetrug.
 */

export type Stand = {
  /** Wurde der Buchstabe schon vorgestellt? */
  vorgestellt: boolean
  /** Treffer mit Hilfe. Übung, kein Können. */
  gefuehrt: number
  /** Treffer ohne Hilfe, auf Anhieb, in Folge. */
  serie: number
  /** Fehlversuche seit dem letzten sauberen Treffer. */
  patzer: number
}

const LEER: Stand = { vorgestellt: false, gefuehrt: 0, serie: 0, patzer: 0 }

/** So viele geführte Treffer, bevor die Hilfe ausgeht. */
export const GEFUEHRT_BIS = 3
/** So viele freie Treffer in Folge, bis ein Buchstabe sitzt. */
export const SICHER_AB = 3
/** So viele Patzer, bis der Drache den Buchstaben neu vorstellt. */
export const NEU_ZEIGEN_AB = 3

type State = {
  stand: Record<string, Stand>
  eingefuehrt: string[]
  gefangen: string[]
  runden: number
  stimme: string | null

  vorgestellt: (zeichen: string) => void
  treffer: (zeichen: string, mitHilfe: boolean, ersterVersuch: boolean) => void
  daneben: (zeichen: string) => void
  einfuehren: (zeichen: string) => void
  fangen: (zeichen: string) => void
  rundeGezaehlt: () => void
  setStimme: (name: string | null) => void
  zuruecksetzen: () => void
}

const START = REIHENFOLGE.slice(0, 2)

const hole = (s: Record<string, Stand>, z: string): Stand => s[z] ?? LEER

export const useFortschritt = create<State>()(
  persist(
    (set) => ({
      stand: {},
      eingefuehrt: START,
      gefangen: [],
      runden: 0,
      stimme: null,

      vorgestellt: (z) =>
        set((s) => ({
          stand: {
            ...s.stand,
            [z]: { ...hole(s.stand, z), vorgestellt: true, patzer: 0 },
          },
        })),

      treffer: (z, mitHilfe, ersterVersuch) =>
        set((s) => {
          const alt = hole(s.stand, z)
          return {
            stand: {
              ...s.stand,
              [z]: {
                ...alt,
                patzer: 0,
                gefuehrt: mitHilfe ? alt.gefuehrt + 1 : alt.gefuehrt,
                // Nur der Treffer ohne Hilfe und im ersten Anlauf beweist
                // etwas. Mit leuchtender Taste beweist er gar nichts.
                serie:
                  !mitHilfe && ersterVersuch ? alt.serie + 1 : alt.serie,
              },
            },
          }
        }),

      daneben: (z) =>
        set((s) => {
          const alt = hole(s.stand, z)
          return {
            stand: {
              ...s.stand,
              [z]: { ...alt, serie: 0, patzer: alt.patzer + 1 },
            },
          }
        }),

      einfuehren: (z) =>
        set((s) =>
          s.eingefuehrt.includes(z)
            ? s
            : { eingefuehrt: [...s.eingefuehrt, z] },
        ),

      fangen: (z) =>
        set((s) =>
          s.gefangen.includes(z) ? s : { gefangen: [...s.gefangen, z] },
        ),

      rundeGezaehlt: () => set((s) => ({ runden: s.runden + 1 })),

      setStimme: (stimme) => set({ stimme }),

      zuruecksetzen: () =>
        set({ stand: {}, eingefuehrt: START, gefangen: [], runden: 0 }),
    }),
    {
      name: 'lesedrache-fortschritt',
      version: 2,
      // Der alte Stand hat eine andere Form und behauptete Können, das
      // nie belegt war. Er wird verworfen statt umgerechnet.
      migrate: () => ({
        stand: {},
        eingefuehrt: START,
        gefangen: [],
        runden: 0,
        stimme: null,
      }),
    },
  ),
)

/** Braucht dieser Buchstabe (noch) Hilfe? */
export const brauchtHilfe = (s: Stand | undefined) =>
  (s?.gefuehrt ?? 0) < GEFUEHRT_BIS

/** Sitzt der Buchstabe - ohne Hilfe, mehrfach, auf Anhieb? */
export const istSicher = (s: Stand | undefined) => (s?.serie ?? 0) >= SICHER_AB

/** Muss der Drache ihn noch einmal erklären? */
export const brauchtVorstellung = (s: Stand | undefined) =>
  !s?.vorgestellt || (s?.patzer ?? 0) >= NEU_ZEIGEN_AB
