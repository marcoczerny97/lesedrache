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
import {
  brauchtHilfe,
  brauchtVorstellung,
  useFortschritt,
} from '../store/fortschritt'
import { playAnsage, playLaut, playWort, stopAll } from '../audio/speak'
import { sfxNochmal, sfxSchluepfen, sfxTipp } from '../audio/sfx'

/**
 * Vier Phasen, und die erste ist die wichtigste.
 *
 * Ohne "vorstellung" prüft die App nur ab, was sie nie beigebracht hat -
 * das Kind drückt dann die leuchtende Taste, ohne den Buchstaben zu
 * lernen. Erst zeigen, dann führen, dann prüfen.
 */
type Phase = 'vorstellung' | 'stellen' | 'jagen' | 'schluepfen'

/** So oft muss er die Taste beim Vorstellen selbst drücken. */
const ECHOS = 2

const pause = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function Jagd({ onEnde }: { onEnde: () => void }) {
  const {
    stand, eingefuehrt, gefangen, runden,
    treffer, daneben, einfuehren, fangen, rundeGezaehlt, vorgestellt,
  } = useFortschritt()

  const [aufgabe, setAufgabe] = useState<Aufgabe | null>(null)
  const [pos, setPos] = useState(0)
  const [fehler, setFehler] = useState(0)
  const [getippt, setGetippt] = useState<string[]>([])
  const [gedrueckt, setGedrueckt] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('stellen')
  const [echo, setEcho] = useState(0)
  const [geschluepft, setGeschluepft] = useState<string | null>(null)

  const lauf = useRef(0)
  const blitz = useRef<number | null>(null)
  const wiederholt = useRef(0)

  /* ---------- Schritt 1: Vorstellen ---------- */

  /**
   * Der Drache zeigt den Buchstaben, seinen Laut und sein Wesen.
   *
   * Bewusst wird nie der BUCHSTABENNAME gesagt - nicht "Em", sondern
   * "mmmm, wie Maus, mmmm". Buchstabennamen sabotieren das Lautieren.
   */
  const vorstellen = useCallback(async (z: string) => {
    const id = ++lauf.current
    setPhase('vorstellung')
    setEcho(0)
    await pause(400)
    if (lauf.current !== id) return

    await playLaut(z)
    if (lauf.current !== id) return
    await pause(220)
    if (lauf.current !== id) return

    await playAnsage('wie ' + BUCHSTABEN[z].wort)
    if (lauf.current !== id) return
    await pause(220)
    if (lauf.current !== id) return

    await playLaut(z)
  }, [])

  /* ---------- Schritt 2 und 3: Jagen ---------- */

  /** Die Aufgabe hörbar stellen. Lesen kann er sie nicht. */
  const ansagen = useCallback(async (a: Aufgabe) => {
    const id = ++lauf.current
    setPhase('stellen')
    await pause(250)
    if (lauf.current !== id) return

    if (a.art === 'buchstabe') await playLaut(a.ziel[0])
    else if (a.art === 'silbe') await playAnsage(a.text)
    else await playWort(a.text)

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
        ? { art: 'buchstabe', ziel: [neu], text: neu, emoji: BUCHSTABEN[neu].emoji }
        : naechsteAufgabe(lage, letztes)

      setAufgabe(a)
      setPos(0)
      setFehler(0)
      setGetippt([])
      setGeschluepft(null)
      wiederholt.current = 0

      // Neu oder zuletzt oft danebengegriffen? Dann erst erklären.
      const z = a.art === 'buchstabe' ? a.ziel[0] : null
      if (z && brauchtVorstellung(stand[z])) void vorstellen(z)
      else void ansagen(a)
    },
    // Absichtlich ohne stand/runden: sonst startet die Runde neu, sobald
    // ein Treffer gezählt wird.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eingefuehrt, gefangen, ansagen, vorstellen],
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

  const zielZeichen = aufgabe?.ziel[pos] ?? null
  const zielStand = zielZeichen ? stand[zielZeichen] : undefined

  /**
   * Läuft diese Runde mit Hilfe?
   *
   * Solange ja, zählt ein Treffer als Übung und NICHT als Können. Wer
   * einer leuchtenden Taste folgt, hat den Buchstaben nicht gelernt.
   */
  const mitHilfe = brauchtHilfe(zielStand) || fehler >= 1

  /* ---------- Eingabe ---------- */

  /**
   * Eine Taste wurde betätigt - egal ob auf der echten Tastatur oder
   * durch Klick auf die Landkarte. Beides läuft hier durch, damit es
   * keinen Weg gibt, auf dem das Spiel nicht reagiert.
   */
  const tasteGedrueckt = useCallback(
    (taste: string) => {
      setGedrueckt(taste)
      if (blitz.current) clearTimeout(blitz.current)
      blitz.current = window.setTimeout(() => setGedrueckt(null), 220)

      if (!aufgabe || phase === 'schluepfen') return
      const ziel = aufgabe.ziel[pos]

      // Beim Vorstellen gibt es nichts zu gewinnen und nichts zu verlieren.
      if (phase === 'vorstellung') {
        if (taste !== ziel) {
          if (BUCHSTABEN[taste]) void playLaut(taste)
          else sfxTipp()
          return
        }
        void playLaut(ziel)
        const n = echo + 1
        setEcho(n)
        if (n >= ECHOS) {
          vorgestellt(ziel)
          void ansagen(aufgabe)
        }
        return
      }

      /*
       * Tippt er, während der Drache noch spricht, gilt der Tastendruck
       * trotzdem. Sonst verpufft genau der Treffer, auf den er stolz war.
       */
      if (phase === 'stellen') {
        lauf.current++
        stopAll()
        setPhase('jagen')
      }

      if (taste === ziel) {
        treffer(ziel, mitHilfe, fehler === 0)
        setGetippt((g) => [...g, taste])

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
    },
    [
      aufgabe, phase, pos, fehler, echo, mitHilfe,
      treffer, daneben, abschluss, ansagen, vorgestellt,
    ],
  )

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
        if (!aufgabe) return
        if (phase === 'vorstellung' && zielZeichen) void vorstellen(zielZeichen)
        else void ansagen(aufgabe)
        return
      }

      if (!/^[a-zA-ZäöüÄÖÜ]$/.test(e.key)) return
      tasteGedrueckt(e.key.toUpperCase())
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aufgabe, phase, zielZeichen, ansagen, vorstellen, onEnde, tasteGedrueckt])

  /*
   * Passiert nichts, wird die Aufgabe noch einmal gesagt. Er kann sie
   * nicht nachlesen - wer den Laut verpasst hat, sitzt sonst vor einem
   * stummen Bildschirm. Höchstens dreimal, danach ist Ruhe.
   */
  useEffect(() => {
    if (phase !== 'jagen' || !aufgabe) return
    if (wiederholt.current >= 3) return
    const t = setTimeout(() => {
      wiederholt.current += 1
      void ansagen(aufgabe)
    }, 8000)
    return () => clearTimeout(t)
  }, [phase, aufgabe, pos, fehler, ansagen])

  /* ---------- Anzeige ---------- */

  const verraten = phase === 'vorstellung' || mitHilfe
  const zeigeZiel = phase === 'vorstellung' || mitHilfe

  const laune: Laune =
    phase === 'vorstellung' ? 'lauten'
    : phase === 'stellen' ? 'lauten'
    : phase === 'schluepfen' ? 'freude'
    : fehler >= 2 ? 'nochmal'
    : 'warten'

  const wesen = zielZeichen ? BUCHSTABEN[zielZeichen] : null

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

      <main className="flex flex-1 items-center justify-center gap-[3vw] px-6">
        <Drache laune={laune} />

        {phase === 'vorstellung' && wesen ? (
          /* Schritt 1: Der Drache erklärt den Buchstaben. */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-[3vw]">
              <motion.span
                className="font-display font-extrabold text-glut glut-stark"
                style={{ fontSize: 'clamp(6rem, 16vw, 14rem)', lineHeight: 1 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {wesen.zeichen}
              </motion.span>

              <motion.span
                style={{ fontSize: 'clamp(4rem, 11vw, 9rem)' }}
                animate={{ y: [0, -14, 0], rotate: [0, -5, 5, 0] }}
                transition={{
                  duration: echo > 0 ? 0.6 : 2.4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                aria-hidden
              >
                {wesen.emoji}
              </motion.span>
            </div>

            {/* Der Name ist für Erwachsene, er hört ihn ohnehin. */}
            <p className="font-display text-2xl font-bold text-white/60">
              {wesen.wort}
            </p>

            {/* Wie oft er die Taste noch drücken soll. */}
            <div className="flex gap-2">
              {Array.from({ length: ECHOS }).map((_, i) => (
                <span
                  key={i}
                  className={[
                    'h-3 w-10 rounded-full transition-colors',
                    i < echo ? 'bg-glut' : 'bg-white/15',
                  ].join(' ')}
                  aria-hidden
                />
              ))}
            </div>
          </motion.div>
        ) : (
          /* Schritt 2 und 3: Das Ei mit der Aufgabe. */
          <div className="flex flex-col items-center gap-4">
            {/* Bei Wörtern ist das Bild die Bedeutung - kein Ratespiel. */}
            {aufgabe?.art === 'wort' && phase !== 'schluepfen' && (
              <motion.div
                style={{ fontSize: 'clamp(3rem, 7vw, 6rem)' }}
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden
              >
                {aufgabe.emoji}
              </motion.div>
            )}

            <div className="relative flex items-center justify-center">
              <Ei
                fehler={fehler}
                offen={phase === 'schluepfen'}
                emoji={aufgabe?.emoji ?? '✨'}
                durchscheinend={
                  mitHilfe && phase === 'jagen' && aufgabe?.art === 'buchstabe'
                }
              />

              <AnimatePresence>
                {phase === 'schluepfen' && (
                  <motion.div
                    key="wesen"
                    className="absolute"
                    style={{ fontSize: 'clamp(4rem, 11vw, 9rem)' }}
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
            <div className="flex items-center gap-[1vw]">
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
                      'font-display flex items-center justify-center',
                      'rounded-2xl border-4 font-extrabold',
                      fertig
                        ? 'border-glut bg-glut/20 text-glut-hell glut'
                        : dran
                          ? 'border-glut/70 text-glut-hell glut'
                          : 'border-white/15 text-white/30',
                    ].join(' ')}
                    style={{
                      height: 'clamp(4.5rem, 10vw, 8rem)',
                      width: 'clamp(3.6rem, 8vw, 6.5rem)',
                      fontSize: 'clamp(2.6rem, 6vw, 5rem)',
                    }}
                  >
                    {fertig ? getippt[i] ?? z : dran && zeigeZiel ? z : ''}
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <Welt gefangen={gefangen} />

      <div className="flex flex-col items-center gap-3 pb-5">
        {/*
          Für Erwachsene, nicht für ihn. Wer danebensteht, soll sofort
          sehen, was erwartet wird - und dass es auch ohne Ton geht.
        */}
        <p className="text-sm text-white/35">
          {phase === 'vorstellung'
            ? `Neuer Buchstabe. Noch ${ECHOS - echo}× die leuchtende Taste drücken.`
            : mitHilfe
              ? 'Üben: die leuchtende Taste drücken — auf der Tastatur oder hier klicken. Leertaste wiederholt.'
              : 'Ohne Hilfe: nur nach dem Laut suchen. Leertaste wiederholt den Laut.'}
        </p>
        <Tastatur
          gedrueckt={gedrueckt}
          ziel={zielZeichen}
          verraten={verraten && phase !== 'schluepfen' && phase !== 'stellen'}
          bekannt={gefangen}
          onTaste={tasteGedrueckt}
        />
      </div>
    </div>
  )
}
