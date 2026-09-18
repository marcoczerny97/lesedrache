import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Drache, type Laune } from '../components/Drache'
import { Tastatur } from '../components/Tastatur'
import { Welt } from '../components/Welt'
import { Ei } from '../components/Ei'
import { BUCHSTABEN } from '../data/buchstaben'
import {
  darfNeuenEinfuehren,
  naechsteAufgabe,
  naechsterNeuer,
  type Aufgabe,
} from '../engine/aufgaben'
import { useFortschritt } from '../store/fortschritt'
import { playAnsage, playLaut, playWort, stopAll } from '../audio/speak'
import { sfxNochmal, sfxSchluepfen, sfxTipp } from '../audio/sfx'

type Phase = 'stellen' | 'jagen' | 'schluepfen'

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Jagd({ onEnde }: { onEnde: () => void }) {
  const {
    stand, eingefuehrt, gefangen, runden,
    treffer, daneben, einfuehren, fangen, rundeGezaehlt,
  } = useFortschritt()

  const [aufgabe, setAufgabe] = useState<Aufgabe | null>(null)
  const [pos, setPos] = useState(0)
  const [fehler, setFehler] = useState(0)
  const [getippt, setGetippt] = useState<string[]>([])
  const [gedrueckt, setGedrueckt] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('stellen')
  const [vorstellung, setVorstellung] = useState(false)
  const [geschluepft, setGeschluepft] = useState<string | null>(null)

  const lauf = useRef(0)
  const blitz = useRef<number | null>(null)
  /** Wie oft die Aufgabe in dieser Runde schon wiederholt wurde. */
  const wiederholt = useRef(0)

  /** Die Aufgabe hörbar stellen. Lesen kann er sie nicht. */
  const ansagen = useCallback(async (a: Aufgabe, neu: boolean) => {
    const id = ++lauf.current
    setPhase('stellen')
    await pause(250)
    if (lauf.current !== id) return

    if (a.art === 'buchstabe') {
      await playLaut(a.ziel[0])
      if (lauf.current !== id) return
      if (neu) {
        // Vorstellung: der Laut und das Wesen, das dazugehört.
        await pause(200)
        if (lauf.current !== id) return
        await playAnsage('wie ' + BUCHSTABEN[a.ziel[0]].wort)
      }
    } else if (a.art === 'silbe') {
      await playAnsage(a.text)
    } else {
      await playWort(a.text)
    }

    if (lauf.current !== id) return
    setPhase('jagen')
  }, [])

  const neueRunde = useCallback(
    (letztes?: string) => {
      const lage = { stand, eingefuehrt, gefangen, runden }

      // Sitzt der zuletzt eingeführte Buchstabe, kommt der nächste dran.
      let neu: string | null = null
      if (darfNeuenEinfuehren(lage)) {
        neu = naechsterNeuer(eingefuehrt)
        if (neu) einfuehren(neu)
      }

      const a: Aufgabe = neu
        ? {
            art: 'buchstabe',
            ziel: [neu],
            text: neu,
            emoji: BUCHSTABEN[neu].emoji,
          }
        : naechsteAufgabe(lage, letztes)

      setAufgabe(a)
      setPos(0)
      setFehler(0)
      setGetippt([])
      setGeschluepft(null)
      setVorstellung(Boolean(neu))
      wiederholt.current = 0
      void ansagen(a, Boolean(neu))
    },
    // Absichtlich ohne stand/runden: sonst startet die Runde neu, sobald
    // ein Treffer gezählt wird.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eingefuehrt, gefangen, ansagen],
  )

  useEffect(() => {
    neueRunde()
    return () => {
      lauf.current++
      stopAll()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Aufgabe geschafft: es schlüpft. */
  const abschluss = useCallback(
    async (a: Aufgabe) => {
      const id = ++lauf.current
      setPhase('schluepfen')
      sfxSchluepfen()

      if (a.art === 'buchstabe') {
        const z = a.ziel[0]
        fangen(z)
        setGeschluepft(z)
        await pause(450)
        if (lauf.current !== id) return
        await playAnsage(BUCHSTABEN[z].wort)
      } else {
        setGeschluepft(null)
        await pause(350)
        if (lauf.current !== id) return
        await playWort(a.text)
      }

      rundeGezaehlt()
      if (lauf.current !== id) return
      await pause(1400)
      if (lauf.current !== id) return
      neueRunde(a.text)
    },
    [fangen, rundeGezaehlt, neueRunde],
  )

  /* --- Die Tastatur ist das Spiel. --- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return

      if (e.key === 'Escape') {
        lauf.current++
        stopAll()
        onEnde()
        return
      }

      if (e.key === ' ') {
        e.preventDefault()
        if (aufgabe) void ansagen(aufgabe, vorstellung)
        return
      }

      if (!/^[a-zA-ZäöüÄÖÜ]$/.test(e.key)) return
      const taste = e.key.toUpperCase()

      // Jede gedrückte Taste blitzt auf der Landkarte auf.
      setGedrueckt(taste)
      if (blitz.current) clearTimeout(blitz.current)
      blitz.current = window.setTimeout(() => setGedrueckt(null), 220)

      if (!aufgabe || phase === 'schluepfen') return

      /*
       * Tippt er, während der Drache noch spricht, gilt der Tastendruck
       * trotzdem. Sonst verpufft genau der Treffer, auf den er stolz war.
       */
      if (phase === 'stellen') {
        lauf.current++
        stopAll()
        setPhase('jagen')
      }

      const ziel = aufgabe.ziel[pos]

      if (taste === ziel) {
        treffer(ziel, fehler === 0)
        const neuGetippt = [...getippt, taste]
        setGetippt(neuGetippt)

        if (pos + 1 >= aufgabe.ziel.length) {
          void abschluss(aufgabe)
        } else {
          setPos(pos + 1)
          setFehler(0)
          wiederholt.current = 0
          void playLaut(ziel)
        }
        return
      }

      /*
       * Daneben ist kein Fehler, sondern eine Entdeckung: der gedrückte
       * Buchstabe sagt seinen eigenen Laut. So lernt er auch beim Suchen
       * etwas, und es gibt nichts, wovor man sich fürchten müsste.
       */
      daneben(ziel)
      setFehler((f) => f + 1)
      if (BUCHSTABEN[taste]) void playLaut(taste)
      else sfxTipp()
      if (fehler >= 2) sfxNochmal()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    aufgabe, phase, pos, fehler, getippt, vorstellung,
    treffer, daneben, abschluss, ansagen, onEnde,
  ])

  /*
   * Passiert nichts, wird die Aufgabe noch einmal gesagt. Er kann sie
   * nicht nachlesen - wer den Laut verpasst hat, sitzt sonst vor einem
   * stummen Bildschirm.
   */
  useEffect(() => {
    if (phase !== 'jagen' || !aufgabe) return
    // Höchstens dreimal. Danach ist Ruhe - Dauerbeschallung hilft keinem.
    if (wiederholt.current >= 3) return
    const t = setTimeout(() => {
      wiederholt.current += 1
      void ansagen(aufgabe, false)
    }, 8000)
    return () => clearTimeout(t)
  }, [phase, aufgabe, pos, fehler, ansagen])

  const zielZeichen = aufgabe?.ziel[pos] ?? null
  const zielStand = zielZeichen ? stand[zielZeichen] : undefined
  const nochNieGesehen = (zielStand?.versuche ?? 0) === 0

  /**
   * Die Hilfe verblasst, während er lernt.
   * Am Anfang zeigen wir den Buchstaben und die Taste; sobald er ihn
   * dreimal auf Anhieb hatte, muss er ihn aus dem Laut allein finden.
   */
  const verraten =
    vorstellung || fehler >= 1 || (aufgabe?.art === 'buchstabe' && nochNieGesehen)

  const zeigeZiel =
    vorstellung ||
    (aufgabe?.art === 'buchstabe'
      ? (zielStand?.serie ?? 0) < 2 || fehler >= 1
      : fehler >= 2)

  const laune: Laune =
    phase === 'stellen' ? 'lauten'
    : phase === 'schluepfen' ? 'freude'
    : fehler >= 2 ? 'nochmal'
    : 'warten'

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-6 pt-5">
        <button
          onClick={() => { lauf.current++; stopAll(); onEnde() }}
          aria-label="Zurück"
          className="rounded-full bg-white/10 px-5 py-3 text-2xl backdrop-blur
                     transition hover:bg-white/20"
        >
          ←
        </button>
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2
                        backdrop-blur">
          <span className="text-2xl" aria-hidden>🥚</span>
          <span className="font-display text-2xl font-extrabold text-glut-hell">
            {gefangen.length}
          </span>
          <span className="sr-only">Wesen gefangen</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center gap-8 px-6">
        <Drache laune={laune} />

        {/* Das Ei mit der Aufgabe */}
        <div className="flex flex-col items-center gap-4">
          {/* Bei Wörtern ist das Bild die Bedeutung - kein Ratespiel. */}
          {aufgabe?.art === 'wort' && phase !== 'schluepfen' && (
            <motion.div
              className="text-6xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              aria-hidden
            >
              {aufgabe.emoji}
            </motion.div>
          )}

          <div className="relative flex h-44 items-center justify-center">
            <Ei
              fehler={fehler}
              offen={phase === 'schluepfen'}
              emoji={aufgabe?.emoji ?? '✨'}
              durchscheinend={
                verraten && phase === 'jagen' && aufgabe?.art === 'buchstabe'
              }
            />

            {/* Ein neuer Buchstabe stellt sich vor. */}
            {vorstellung && phase === 'jagen' && (
              <>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute text-xl"
                    style={{
                      left: `${50 + 46 * Math.cos((i / 6) * Math.PI * 2)}%`,
                      top: `${50 + 42 * Math.sin((i / 6) * Math.PI * 2)}%`,
                    }}
                    animate={{ scale: [0.5, 1.1, 0.5], opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      delay: i * 0.3,
                      ease: 'easeInOut',
                    }}
                  >
                    ✨
                  </motion.span>
                ))}
              </>
            )}

            <AnimatePresence>
              {phase === 'schluepfen' && (
                <motion.div
                  key="wesen"
                  className="absolute text-8xl"
                  initial={{ scale: 0.2, y: 14, rotate: -20, opacity: 0 }}
                  animate={{ scale: 1, y: -6, rotate: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 250, damping: 13 }}
                >
                  {geschluepft ? BUCHSTABEN[geschluepft].emoji : aufgabe?.emoji}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Was er tippen muss - ein Kasten je Buchstabe */}
          <div className="flex items-center gap-3">
            {aufgabe?.ziel.map((z, i) => {
              const fertig = i < pos || phase === 'schluepfen'
              const dran = i === pos && phase === 'jagen'
              return (
                <motion.div
                  key={`${aufgabe.text}-${i}`}
                  animate={dran ? { scale: [1, 1.07, 1] } : { scale: 1 }}
                  transition={{
                    duration: 1, repeat: dran ? Infinity : 0, ease: 'easeInOut',
                  }}
                  className={[
                    'font-display flex h-20 w-16 items-center justify-center',
                    'rounded-2xl border-4 text-5xl font-extrabold md:h-24 md:w-20 md:text-6xl',
                    fertig
                      ? 'border-glut bg-glut/20 text-glut-hell glut'
                      : dran
                        ? 'border-glut/70 text-glut-hell glut'
                        : 'border-white/15 text-white/30',
                  ].join(' ')}
                >
                  {fertig ? getippt[i] ?? z : dran && zeigeZiel ? z : ''}
                </motion.div>
              )
            })}
          </div>
        </div>
      </main>

      <Welt gefangen={gefangen} />

      <div className="flex justify-center pb-5">
        <Tastatur
          gedrueckt={gedrueckt}
          ziel={zielZeichen}
          verraten={verraten && phase === 'jagen'}
          bekannt={gefangen}
        />
      </div>
    </div>
  )
}
