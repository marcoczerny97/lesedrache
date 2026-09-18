import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Drache, type Laune } from '../components/Drache'
import { LautKachel } from '../components/LautKachel'
import { BildKarte } from '../components/BildKarte'
import { Sterne } from '../components/Sterne'
import { Taste } from '../components/Taste'
import { playAnsage, playLaut, playWort, stopAll } from '../audio/speak'
import { difficulty, wordsFor, type Word } from '../data/words'
import { useProgress } from '../store/progress'

type Phase = 'lauten' | 'bereit' | 'blenden' | 'waehlen' | 'richtig' | 'nochmal'

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Zufällig mischen. */
function mischen<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Nächstes Wort wählen.
 * Leichte Wörter zuerst, und was schon oft saß, kommt seltener.
 * Nie zweimal dasselbe hintereinander - das merkt ein Kind sofort.
 */
function naechstesWort(
  pool: Word[],
  statistik: Record<string, { richtig: number; falsch: number }>,
  letztes?: string,
): Word {
  const kandidaten = pool.filter((w) => w.text !== letztes)
  const liste = kandidaten.length ? kandidaten : pool
  const sortiert = [...liste].sort((a, b) => {
    const ra = statistik[a.text]?.richtig ?? 0
    const rb = statistik[b.text]?.richtig ?? 0
    if (ra !== rb) return ra - rb
    return difficulty(a) - difficulty(b)
  })
  const vorne = sortiert.slice(0, Math.min(4, sortiert.length))
  return vorne[Math.floor(Math.random() * vorne.length)]
}

export function Spiel({ onEnde }: { onEnde: () => void }) {
  const { sterne, buchstaben, statistik, stern, merken } = useProgress()

  const pool = wordsFor(buchstaben)

  const [wort, setWort] = useState<Word | null>(null)
  const [auswahl, setAuswahl] = useState<Word[]>([])
  const [phase, setPhase] = useState<Phase>('lauten')
  const [aktiv, setAktiv] = useState(-1)
  const [sichtbarBis, setSichtbarBis] = useState(-1)
  const [falschKarte, setFalschKarte] = useState<string | null>(null)

  /** Bricht laufende Ton-Sequenzen ab, wenn das Kind dazwischenfunkt. */
  const lauf = useRef(0)

  const laune: Laune =
    phase === 'lauten' ? 'lauten'
    : phase === 'blenden' ? 'pusten'
    : phase === 'richtig' ? 'freude'
    : phase === 'nochmal' ? 'nochmal'
    : 'ruhe'

  /** Die Laute einzeln vorsprechen, einer nach dem anderen. */
  const lautenSequenz = useCallback(async (w: Word) => {
    const id = ++lauf.current
    setPhase('lauten')
    setSichtbarBis(-1)
    setAktiv(-1)
    await pause(350)
    for (let i = 0; i < w.graphemes.length; i++) {
      if (lauf.current !== id) return
      setSichtbarBis(i)
      setAktiv(i)
      await playLaut(w.graphemes[i])
      if (lauf.current !== id) return
      await pause(260)
    }
    if (lauf.current !== id) return
    setAktiv(-1)
    setPhase('bereit')
  }, [])

  /** Neue Runde: Wort ziehen, zwei Ablenker dazu, Laute vorsprechen. */
  const neueRunde = useCallback(
    (letztes?: string) => {
      if (!pool.length) return
      const w = naechstesWort(pool, statistik, letztes)
      const ablenker = mischen(pool.filter((p) => p.text !== w.text)).slice(0, 2)
      setWort(w)
      setAuswahl(mischen([w, ...ablenker]))
      setFalschKarte(null)
      void lautenSequenz(w)
    },
    // statistik bewusst nicht als Abhängigkeit: sonst startet die Runde neu,
    // sobald ein Stern gezählt wird.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pool.length, buchstaben, lautenSequenz],
  )

  useEffect(() => {
    neueRunde()
    return () => {
      lauf.current++
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Zusammenschleifen: die Laute rücken zusammen, der Drache pustet. */
  const zusammenschleifen = useCallback(async () => {
    if (!wort) return
    const id = ++lauf.current
    setPhase('blenden')
    setAktiv(-1)
    await pause(450)
    if (lauf.current !== id) return
    await playWort(wort.text)
    if (lauf.current !== id) return
    await pause(300)
    if (lauf.current !== id) return
    setPhase('waehlen')
  }, [wort])

  const antwort = useCallback(
    async (gewaehlt: Word) => {
      if (!wort || phase !== 'waehlen') return
      const id = ++lauf.current

      if (gewaehlt.text === wort.text) {
        merken(wort.text, true)
        stern()
        setPhase('richtig')
        await playAnsage('Ja! ' + wort.text)
        if (lauf.current !== id) return
        await pause(900)
        if (lauf.current !== id) return
        neueRunde(wort.text)
        return
      }

      // Falsch ist kein Fehler, sondern "nochmal".
      merken(wort.text, false)
      setFalschKarte(gewaehlt.text)
      setPhase('nochmal')
      await playAnsage('Fast. Hör nochmal.')
      if (lauf.current !== id) return
      await playWort(wort.text)
      if (lauf.current !== id) return
      setFalschKarte(null)
      setPhase('waehlen')
    },
    [wort, phase, merken, stern, neueRunde],
  )

  /* --- Tastatur. Das ist die eigentliche Bedienung. --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const k = e.key

      if (k === 'Escape') {
        lauf.current++
        stopAll()
        onEnde()
        return
      }

      if (k === ' ') {
        e.preventDefault()
        if (!wort) return
        if (phase === 'bereit' || phase === 'lauten') void lautenSequenz(wort)
        else if (phase === 'waehlen' || phase === 'nochmal') void playWort(wort.text)
        return
      }

      if (k === 'Enter') {
        e.preventDefault()
        if (phase === 'bereit') void zusammenschleifen()
        return
      }

      if (phase === 'waehlen' && ['1', '2', '3'].includes(k)) {
        const karte = auswahl[Number(k) - 1]
        if (karte) void antwort(karte)
        return
      }

      // Buchstabentaste: den passenden Laut noch einmal hören.
      if (wort && /^[a-zA-ZäöüÄÖÜ]$/.test(k)) {
        const gross = k.toUpperCase()
        const treffer = wort.graphemes.findIndex((g) => g.includes(gross))
        if (treffer >= 0 && treffer <= sichtbarBis) {
          setAktiv(treffer)
          void playLaut(wort.graphemes[treffer]).then(() => setAktiv(-1))
        }
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    phase, wort, auswahl, sichtbarBis,
    antwort, zusammenschleifen, lautenSequenz, onEnde,
  ])

  if (!pool.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 p-8 text-center">
        <span className="text-7xl">🐉</span>
        <p className="max-w-md text-xl text-white/80">
          Mit diesen Buchstaben gibt es noch kein Wort. Schalte im
          Eltern-Bereich ein paar mehr frei.
        </p>
        <button
          onClick={onEnde}
          className="rounded-2xl bg-glut px-8 py-4 text-xl font-extrabold text-nacht"
        >
          Zurück
        </button>
      </div>
    )
  }

  const verschmolzen = phase === 'blenden' || phase === 'waehlen' ||
    phase === 'richtig' || phase === 'nochmal'

  return (
    <div className="flex h-full flex-col p-6">
      <header className="flex items-center justify-between">
        <button
          onClick={() => { lauf.current++; stopAll(); onEnde() }}
          aria-label="Zurück"
          className="rounded-full bg-white/10 px-5 py-3 text-2xl backdrop-blur
                     transition hover:bg-white/20"
        >
          ←
        </button>
        <Sterne anzahl={sterne} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="flex items-center justify-center gap-6">
          <Drache laune={laune} />

          <div
            className={[
              'flex items-center transition-all duration-500 ease-out',
              verschmolzen ? 'gap-0' : 'gap-3 md:gap-5',
            ].join(' ')}
          >
            {wort?.graphemes.map((g, i) => (
              <LautKachel
                key={`${wort.text}-${i}`}
                graphem={g}
                sichtbar={i <= sichtbarBis}
                aktiv={aktiv === i}
                verschmolzen={verschmolzen}
                onClick={() => {
                  if (i <= sichtbarBis) {
                    setAktiv(i)
                    void playLaut(g).then(() => setAktiv(-1))
                  }
                }}
              />
            ))}
          </div>
        </div>

        {/* Auswahl der Bilder */}
        <AnimatePresence>
          {(phase === 'waehlen' || phase === 'richtig' || phase === 'nochmal') && (
            <motion.div
              className="flex gap-5 md:gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {auswahl.map((k, i) => (
                <BildKarte
                  key={k.text}
                  wort={k}
                  ziffer={i + 1}
                  zustand={
                    phase === 'richtig' && k.text === wort?.text ? 'richtig'
                    : falschKarte === k.text ? 'falsch'
                    : 'offen'
                  }
                  onClick={() => void antwort(k)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Tastenhinweise - Symbole statt Text, er kann nicht lesen. */}
      <footer className="flex items-center justify-center gap-5">
        <Taste breit pulsiert={phase === 'bereit'} label="Leertaste: nochmal hören">
          <span aria-hidden>🔊</span>
          <span className="text-sm font-bold tracking-widest opacity-70">
            ▭▭▭▭
          </span>
        </Taste>

        {phase === 'bereit' && (
          <Taste breit pulsiert label="Enter: Laute zusammenziehen">
            <span aria-hidden className="text-glut-hell">
              ⏎
            </span>
            <span aria-hidden>🔥</span>
          </Taste>
        )}

        {(phase === 'waehlen' || phase === 'nochmal') && (
          <div className="flex gap-2">
            {[1, 2, 3].map((n) => (
              <Taste key={n} pulsiert label={`Taste ${n}`}>
                <span className="font-display font-extrabold">{n}</span>
              </Taste>
            ))}
          </div>
        )}
      </footer>
    </div>
  )
}
