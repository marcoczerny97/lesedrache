import { motion } from 'framer-motion'

export type Laune = 'ruhe' | 'lauten' | 'pusten' | 'freude' | 'nochmal'

/**
 * Der Lesedrache.
 *
 * PLATZHALTER: aktuell ein Emoji. Kommt durch die generierte
 * Drachen-Illustration aus bilder/drache-*.webp raus, sobald
 * das Character-Sheet steht. Die Launen bleiben dieselben.
 */
export function Drache({ laune }: { laune: Laune }) {
  const animation = {
    ruhe: { scale: [1, 1.04, 1], rotate: [0, -2, 0], y: [0, -6, 0] },
    lauten: { scale: [1, 1.06, 1], rotate: [0, 3, 0], y: [0, -4, 0] },
    pusten: { scale: [1, 1.25, 1.05], rotate: [0, -8, 0], x: [0, 14, 0] },
    freude: { scale: [1, 1.2, 1], rotate: [0, -12, 12, 0], y: [0, -28, 0] },
    nochmal: { scale: 1, rotate: [0, -4, 4, 0], y: 0 },
  }[laune]

  const dauer = { ruhe: 3.2, lauten: 1.1, pusten: 0.7, freude: 0.8, nochmal: 0.5 }[
    laune
  ]

  return (
    <div className="relative flex shrink-0 items-center justify-center">
      {/* Glut-Aura, wird beim Pusten heller */}
      <motion.div
        aria-hidden
        className="absolute rounded-full bg-glut blur-3xl"
        animate={{
          opacity: laune === 'pusten' ? 0.55 : laune === 'freude' ? 0.45 : 0.22,
          scale: laune === 'pusten' ? 1.35 : 1,
        }}
        transition={{ duration: 0.4 }}
        style={{ width: '13rem', height: '13rem' }}
      />
      <motion.div
        className="relative select-none text-[9rem] leading-none"
        animate={animation}
        transition={{
          duration: dauer,
          repeat: laune === 'ruhe' || laune === 'lauten' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        🐉
      </motion.div>
    </div>
  )
}
