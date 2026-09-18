import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { REIHENFOLGE } from '../data/buchstaben'

/**
 * Was das Kind kann - gemessen, nicht eingestellt.
 *
 * Bewusst gibt es hier KEINE Elterneinstellung "diese Buchstaben kennt er".
 * Die App beobachtet, was sitzt, und führt neue Buchstaben selbst ein.
 * Sie startet bei null bekannten Buchstaben; das ist der Normalfall.
 *
 * Alles liegt nur im Browser. Kein Konto, kein Server.
 */

export type Stand = {
  versuche: number
  treffer: number
  /** Treffer in Folge beim ersten Versuch. Das ist das Maß für "sitzt". */
  serie: number
}

const LEER: Stand = { versuche: 0, treffer: 0, serie: 0 }

/** Ab hier gilt ein Buchstabe als sicher. */
export const SICHER_AB = 3

type State = {
  stand: Record<string, Stand>
  /** Buchstaben, die schon vorkamen. */
  eingefuehrt: string[]
  /** Buchstaben, deren Wesen in der Welt leben. */
  gefangen: string[]
  runden: number
  stimme: string | null

  treffer: (zeichen: string, ersterVersuch: boolean) => void
  daneben: (zeichen: string) => void
  einfuehren: (zeichen: string) => void
  fangen: (zeichen: string) => void
  rundeGezaehlt: () => void
  setStimme: (name: string | null) => void
  zuruecksetzen: () => void
}

const START = REIHENFOLGE.slice(0, 2)

export const useFortschritt = create<State>()(
  persist(
    (set) => ({
      stand: {},
      eingefuehrt: START,
      gefangen: [],
      runden: 0,
      stimme: null,

      treffer: (zeichen, ersterVersuch) =>
        set((s) => {
          const alt = s.stand[zeichen] ?? LEER
          return {
            stand: {
              ...s.stand,
              [zeichen]: {
                versuche: alt.versuche + 1,
                treffer: alt.treffer + 1,
                // Nur der Treffer im ersten Anlauf zählt für die Serie.
                serie: ersterVersuch ? alt.serie + 1 : alt.serie,
              },
            },
          }
        }),

      daneben: (zeichen) =>
        set((s) => {
          const alt = s.stand[zeichen] ?? LEER
          return {
            stand: {
              ...s.stand,
              [zeichen]: { ...alt, versuche: alt.versuche + 1, serie: 0 },
            },
          }
        }),

      einfuehren: (zeichen) =>
        set((s) =>
          s.eingefuehrt.includes(zeichen)
            ? s
            : { eingefuehrt: [...s.eingefuehrt, zeichen] },
        ),

      fangen: (zeichen) =>
        set((s) =>
          s.gefangen.includes(zeichen)
            ? s
            : { gefangen: [...s.gefangen, zeichen] },
        ),

      rundeGezaehlt: () => set((s) => ({ runden: s.runden + 1 })),

      setStimme: (stimme) => set({ stimme }),

      zuruecksetzen: () =>
        set({ stand: {}, eingefuehrt: START, gefangen: [], runden: 0 }),
    }),
    { name: 'lesedrache-fortschritt' },
  ),
)

export const istSicher = (s: Stand | undefined) => (s?.serie ?? 0) >= SICHER_AB
