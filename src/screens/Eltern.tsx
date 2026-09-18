import { useEffect, useState } from 'react'
import { BUCHSTABEN, REIHENFOLGE } from '../data/buchstaben'
import { istSicher, SICHER_AB, useFortschritt } from '../store/fortschritt'
import { deutscheStimmen, playAnsage, setStimme } from '../audio/speak'

/**
 * Eltern-Bereich.
 *
 * Hier wird bewusst NICHTS eingestellt, was den Lernweg betrifft. Welche
 * Buchstaben dran sind, entscheidet die App aus dem, was sie beobachtet
 * hat - Eltern müssen nicht wissen, wo ihr Kind gerade steht. Diese Seite
 * zeigt nur, was passiert ist.
 */
export function Eltern({ onZurueck }: { onZurueck: () => void }) {
  const {
    stand, eingefuehrt, gefangen, runden,
    stimme, setStimme: merkeStimme, zuruecksetzen,
  } = useFortschritt()

  const [stimmen, setStimmen] = useState(() => deutscheStimmen())

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onZurueck()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onZurueck])

  // Chrome liefert die Stimmen erst asynchron nach.
  useEffect(() => {
    const auffrischen = () => setStimmen(deutscheStimmen())
    speechSynthesis.addEventListener('voiceschanged', auffrischen)
    return () =>
      speechSynthesis.removeEventListener('voiceschanged', auffrischen)
  }, [])

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
          <h3 className="mb-2 text-xl font-bold">Wo steht er?</h3>
          <p className="mb-5 text-white/60">
            {gefangen.length} von {REIHENFOLGE.length} Wesen gefangen,{' '}
            {runden} Runden gespielt. Ein Buchstabe gilt als sicher, wenn er
            ihn {SICHER_AB}-mal hintereinander auf Anhieb gefunden hat. Erst
            dann führt die App den nächsten ein.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {REIHENFOLGE.map((z) => {
              const s = stand[z]
              const dran = eingefuehrt.includes(z)
              const fertig = istSicher(s)
              return (
                <div
                  key={z}
                  className={[
                    'flex items-center gap-3 rounded-xl px-3 py-2',
                    fertig ? 'bg-gruen/15'
                    : dran ? 'bg-white/10'
                    : 'bg-white/[0.03]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'font-display text-2xl font-extrabold',
                      fertig ? 'text-gruen'
                      : dran ? 'text-glut'
                      : 'text-white/20',
                    ].join(' ')}
                  >
                    {z}
                  </span>
                  <span className={dran ? 'text-xl' : 'text-xl opacity-20'}>
                    {BUCHSTABEN[z].emoji}
                  </span>
                  <span className="ml-auto text-sm text-white/45">
                    {!dran ? 'später'
                      : fertig ? 'sitzt'
                      : `${s?.serie ?? 0}/${SICHER_AB}`}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mb-10">
          <h3 className="mb-2 text-xl font-bold">Stimme</h3>
          <p className="mb-4 text-white/60">
            Die Browser-Stimmen klingen unterschiedlich gut. Probier durch,
            welche auf diesem Rechner am wenigsten blechern ist.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={stimme ?? ''}
              onChange={(e) => {
                const n = e.target.value || null
                merkeStimme(n)
                setStimme(n)
              }}
              className="rounded-xl bg-white/10 px-4 py-3 text-white
                         [&>option]:bg-nacht-2"
            >
              <option value="">Automatisch (beste verfügbare)</option>
              {stimmen.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                  {v.localService ? '' : ' · Netz'}
                </option>
              ))}
            </select>
            <button
              onClick={() => void playAnsage('Mmmm. Aaaa. Maus.')}
              className="rounded-xl bg-white/10 px-5 py-3 transition hover:bg-white/20"
            >
              Probe hören
            </button>
          </div>
          <p className="mt-3 text-sm text-white/40">
            Einzelne Laute kann keine Browser-Stimme sauber - besonders bei
            B, D, G, K, P und T hängt sie ein „e“ an. Das löst erst eine
            echte Aufnahme.
          </p>
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
