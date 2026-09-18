import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_LETTERS } from '../data/words'

/**
 * Fortschritt liegt ausschließlich im Browser des Kindes.
 * Kein Account, kein Server, keine Daten über ein Kind irgendwo draußen.
 */

type WordStat = { richtig: number; falsch: number }

type State = {
  sterne: number
  /** Buchstaben, die in der Klasse schon dran waren. */
  buchstaben: string[]
  statistik: Record<string, WordStat>
  stern: () => void
  setBuchstaben: (b: string[]) => void
  merken: (wort: string, richtig: boolean) => void
  zuruecksetzen: () => void
}

export const useProgress = create<State>()(
  persist(
    (set) => ({
      sterne: 0,
      buchstaben: DEFAULT_LETTERS,
      statistik: {},

      stern: () => set((s) => ({ sterne: s.sterne + 1 })),

      setBuchstaben: (buchstaben) => set({ buchstaben }),

      merken: (wort, richtig) =>
        set((s) => {
          const alt = s.statistik[wort] ?? { richtig: 0, falsch: 0 }
          return {
            statistik: {
              ...s.statistik,
              [wort]: {
                richtig: alt.richtig + (richtig ? 1 : 0),
                falsch: alt.falsch + (richtig ? 0 : 1),
              },
            },
          }
        }),

      zuruecksetzen: () =>
        set({ sterne: 0, statistik: {}, buchstaben: DEFAULT_LETTERS }),
    }),
    { name: 'lesedrache' },
  ),
)
