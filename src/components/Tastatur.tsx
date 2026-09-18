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
}

/**
 * Abbild seiner echten Tastatur.
 *
 * Das ist der Hebel, den eine Tablet-App nicht hat: Vor ihm liegt ein
 * Gegenstand mit allen Buchstaben darauf. Diese Anzeige sagt ihm, WO auf
 * dem Gerät der gesuchte Buchstabe liegt - sie ist eine Landkarte, keine
 * Schaltfläche. Anklicken kann man sie trotzdem, für den Notfall.
 */
export function Tastatur({ gedrueckt, ziel, verraten, bekannt }: Props) {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none">
      {TASTATUR_REIHEN.map((reihe, r) => (
        <div
          key={r}
          className="flex gap-1.5"
          style={{ marginLeft: `${REIHEN_VERSATZ[r] * 2.6}rem` }}
        >
          {reihe.map((z) => {
            const istZiel = verraten && ziel === z
            const istGedrueckt = gedrueckt === z
            const istBekannt = bekannt.includes(z)

            return (
              <motion.div
                key={z}
                aria-hidden
                animate={
                  istZiel
                    ? { scale: [1, 1.14, 1], y: [0, -3, 0] }
                    : istGedrueckt
                      ? { scale: [1, 0.88, 1] }
                      : { scale: 1, y: 0 }
                }
                transition={
                  istZiel
                    ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
                    : { duration: 0.18 }
                }
                className={[
                  'font-display flex h-9 w-9 items-center justify-center',
                  'rounded-lg border-b-2 text-base font-extrabold md:h-11 md:w-11 md:text-lg',
                  istZiel
                    ? 'border-glut-tief bg-glut text-nacht shadow-[0_0_28px_rgba(255,176,32,0.8)]'
                    : istGedrueckt
                      ? 'border-himmel/60 bg-himmel/30 text-white'
                      : istBekannt
                        ? 'border-white/15 bg-white/10 text-white/70'
                        : 'border-white/10 bg-white/5 text-white/25',
                ].join(' ')}
              >
                {z}
              </motion.div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
