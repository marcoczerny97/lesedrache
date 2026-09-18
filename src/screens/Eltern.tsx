import { useEffect } from 'react'
import { ALL_LETTERS, wordsFor } from '../data/words'
import { useProgress } from '../store/progress'

/**
 * Eltern-Bereich.
 *
 * Der eigentliche Zweck: einstellen, welche Buchstaben in der Klasse
 * schon dran waren. Die App zieht dann nur noch Wörter, die er mit
 * genau diesen Buchstaben auch knacken kann - er läuft nie in ein
 * unbekanntes Zeichen und damit nie in ein Erfolgserlebnis-Loch.
 */
export function Eltern({ onZurueck }: { onZurueck: () => void }) {
  const { buchstaben, setBuchstaben, statistik, sterne, zuruecksetzen } =
    useProgress()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onZurueck()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onZurueck])

  const toggle = (l: string) =>
    setBuchstaben(
      buchstaben.includes(l)
        ? buchstaben.filter((x) => x !== l)
        : [...buchstaben, l],
    )

  const moeglich = wordsFor(buchstaben)

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 flex items-center justify-between">
          <h2 className="font-display text-3xl font-extrabold">Eltern</h2>
          <button
            onClick={onZurueck}
            className="rounded-xl bg-white/10 px-5 py-3 transition hover:bg-white/20"
          >
            Fertig
          </button>
        </header>

        <section className="mb-10">
          <h3 className="mb-2 text-xl font-bold">
            Welche Buchstaben hatte er schon?
          </h3>
          <p className="mb-4 text-white/60">
            Frag am besten kurz die Lehrerin nach der Reihenfolge in der Fibel.
            Abgewählte Buchstaben tauchen in keinem Wort mehr auf.
          </p>
          <div className="flex flex-wrap gap-3">
            {ALL_LETTERS.map((l) => {
              const an = buchstaben.includes(l)
              return (
                <button
                  key={l}
                  onClick={() => toggle(l)}
                  aria-pressed={an}
                  className={[
                    'font-display h-14 w-14 rounded-2xl text-2xl font-extrabold transition',
                    an
                      ? 'bg-glut text-nacht'
                      : 'bg-white/10 text-white/40 hover:bg-white/20',
                  ].join(' ')}
                >
                  {l}
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-white/60">
            {moeglich.length} von 20 Wörtern sind damit spielbar
            {moeglich.length > 0 && (
              <>: {moeglich.map((w) => w.text).join(', ')}</>
            )}
          </p>
        </section>

        <section className="mb-10">
          <h3 className="mb-4 text-xl font-bold">Wie läuft es?</h3>
          <p className="mb-4 text-white/60">{sterne} Sterne gesammelt</p>
          {Object.keys(statistik).length === 0 ? (
            <p className="text-white/40">Noch nichts gespielt.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {Object.entries(statistik)
                .sort((a, b) => b[1].falsch - a[1].falsch)
                .map(([wort, s]) => (
                  <div
                    key={wort}
                    className="flex items-center justify-between rounded-xl
                               bg-white/5 px-4 py-2"
                  >
                    <span className="font-display font-bold">{wort}</span>
                    <span className="text-sm">
                      <span className="text-gruen">{s.richtig}</span>
                      <span className="text-white/30"> / </span>
                      <span className="text-koralle">{s.falsch}</span>
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="border-t border-white/10 pt-6">
          <p className="mb-3 text-sm text-white/40">
            Alle Daten liegen nur in diesem Browser. Kein Konto, kein Server,
            nichts wird übertragen.
          </p>
          <button
            onClick={() => {
              if (confirm('Wirklich allen Fortschritt löschen?')) zuruecksetzen()
            }}
            className="rounded-xl bg-koralle/20 px-5 py-3 text-koralle
                       transition hover:bg-koralle/30"
          >
            Fortschritt zurücksetzen
          </button>
        </section>
      </div>
    </div>
  )
}
