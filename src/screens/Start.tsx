import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Drache } from '../components/Drache'
import { Welt } from '../components/Welt'
import { useFortschritt } from '../store/fortschritt'
import { sfxAufwecken } from '../audio/sfx'

export function Start({
  onSpielen,
  onEltern,
}: {
  onSpielen: () => void
  onEltern: () => void
}) {
  const gefangen = useFortschritt((s) => s.gefangen)
  const [halten, setHalten] = useState(0)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        sfxAufwecken()
        onSpielen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSpielen])

  /** Eltern-Bereich: 1,5 Sekunden halten. Verhindert Neugier-Klicks. */
  const startHalten = () => {
    const start = Date.now()
    timer.current = window.setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / 1500)
      setHalten(p)
      if (p >= 1) {
        stopHalten()
        onEltern()
      }
    }, 40)
  }
  const stopHalten = () => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
    setHalten(0)
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between px-6 pt-5">
        <h1 className="font-display text-3xl font-extrabold text-glut glut">
          Lesedrache
        </h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2
                          backdrop-blur">
            <span className="text-2xl" aria-hidden>🥚</span>
            <span className="font-display text-2xl font-extrabold text-glut-hell">
              {gefangen.length}
            </span>
          </div>
          <button
            onMouseDown={startHalten}
            onMouseUp={stopHalten}
            onMouseLeave={stopHalten}
            onTouchStart={startHalten}
            onTouchEnd={stopHalten}
            aria-label="Eltern-Bereich (gedrückt halten)"
            className="relative overflow-hidden rounded-full bg-white/10 px-4 py-3
                       text-xl backdrop-blur transition hover:bg-white/20"
          >
            <span
              className="absolute inset-0 origin-left bg-glut/40"
              style={{ transform: `scaleX(${halten})` }}
              aria-hidden
            />
            <span className="relative">⚙️</span>
          </button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8">
        <Drache laune="ruhe" />

        <motion.button
          onClick={() => { sfxAufwecken(); onSpielen() }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-5 rounded-full bg-glut px-14 py-7
                     text-nacht shadow-[0_0_60px_rgba(255,176,32,0.45)]"
        >
          <span className="text-5xl" aria-hidden>▶</span>
          <span className="font-display text-4xl font-extrabold">Los!</span>
        </motion.button>
      </main>

      {/* Seine Welt ist schon auf dem Startbildschirm zu sehen. */}
      <Welt gefangen={gefangen} />
    </div>
  )
}
