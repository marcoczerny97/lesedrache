import { motion } from 'framer-motion'
import { REIHEN_VERSATZ, TASTATUR_REIHEN } from '../data/tastatur'

type Props = {
  /** Zuletzt gedrückte Taste - blitzt kurz auf. */
  gedrueckt: string | null
  /** Gesuchte Taste. */
  ziel: string | null
  /** Soll die gesuchte Taste verraten werden? */
  verraten: boolean
  /** Buchstaben, deren Wesen er schon gefangen hat. */
  bekannt: string[]
  /** Anklicken zählt wie Tippen. */
  onTaste: (zeichen: string) => void
}

/**
 * Abbild seiner echten Tastatur.
 *
 * Das ist der Hebel, den eine Tablet-App nicht hat: Vor ihm liegt ein
 * Gegenstand mit allen Buchstaben darauf. Diese Anzeige sagt ihm, WO auf
 * dem Gerät der gesuchte Buchstabe liegt.
 *
 * Sie ist AUSSERDEM bedienbar. Wenn der Ton stumm bleibt oder eine
 * Tastatureingabe nicht ankommt, darf es keinen Zustand geben, in dem
 * man nichts tun kann.
 */
export function Tastatur({
  gedrueckt,
  ziel,
  verraten,
  bekannt,
  onTaste,
}: Props) {
  const groesse = 'clamp(2.3rem, 4.4vw, 3.9rem)'
  const schrift = 'clamp(0.95rem, 1.9vw, 1.6rem)'

  return (
    <div className="flex flex-col items-center gap-[0.4vw] select-none">
      {TASTATUR_REIHEN.map((reihe, r) => (
        <div
          key={r}
          className="flex gap-[0.4vw]"
          style={{ marginLeft: `calc(${REIHEN_VERSATZ[r]} * ${groesse})` }}
        >
          {reihe.map((z) => {
            const istZiel = verraten && ziel === z
            const istGedrueckt = gedrueckt === z
            const istBekannt = bekannt.includes(z)

            return (
              <div key={z} className="relative">
                {/* Zeigt auf die gesuchte Taste. Braucht keine Sprache. */}
                {istZiel && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 z-10
                               -translate-x-1/2"
                    style={{ bottom: `calc(${groesse} + 0.3rem)`, fontSize: groesse }}
                    animate={{ y: [0, 9, 0] }}
                    transition={{ duration: 0.85, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    👇
                  </motion.span>
                )}

                <motion.button
                  type="button"
                  onClick={() => onTaste(z)}
                  tabIndex={-1}
                  aria-label={`Taste ${z}`}
                  animate={
                    istZiel
                      ? { scale: [1, 1.16, 1] }
                      : istGedrueckt
                        ? { scale: [1, 0.86, 1] }
                        : { scale: 1 }
                  }
                  transition={
                    istZiel
                      ? { duration: 0.85, repeat: Infinity, ease: 'easeInOut' }
                      : { duration: 0.18 }
                  }
                  className={[
                    'font-display flex items-center justify-center',
                    'rounded-xl border-b-4 font-extrabold transition-colors',
                    istZiel
                      ? 'border-glut-tief bg-glut text-nacht shadow-[0_0_40px_rgba(255,176,32,0.9)]'
                      : istGedrueckt
                        ? 'border-himmel/60 bg-himmel/30 text-white'
                        : istBekannt
                          ? 'border-white/15 bg-white/10 text-white/70 hover:bg-white/20'
                          : 'border-white/10 bg-white/5 text-white/25 hover:bg-white/15',
                  ].join(' ')}
                  style={{ height: groesse, width: groesse, fontSize: schrift }}
                >
                  {z}
                </motion.button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
