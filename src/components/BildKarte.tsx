import { motion } from 'framer-motion'
import type { Word } from '../data/words'

type Props = {
  wort: Word
  ziffer: number
  zustand: 'offen' | 'richtig' | 'falsch'
  onClick: () => void
}

/**
 * Bildkarte zum Auswählen.
 * Die Ziffer ist groß und steht auf der Karte selbst, damit klar ist,
 * welche Taste dazugehört - Ziffern kennt er, Wörter noch nicht.
 *
 * PLATZHALTER: Emoji, bis die generierten Illustrationen da sind.
 */
export function BildKarte({ wort, ziffer, zustand, onClick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-label={`Bild ${ziffer}`}
      initial={{ opacity: 0, y: 40, scale: 0.85 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: zustand === 'richtig' ? 1.08 : 1,
        x: zustand === 'falsch' ? [0, -10, 10, -6, 0] : 0,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={[
        'relative flex flex-col items-center justify-center rounded-3xl',
        'border-4 p-4 backdrop-blur transition-colors duration-200',
        'h-40 w-40 md:h-48 md:w-48',
        zustand === 'richtig'
          ? 'border-gruen bg-gruen/20'
          : zustand === 'falsch'
            ? 'border-koralle/70 bg-koralle/10'
            : 'border-white/20 bg-white/10 hover:border-glut/60',
      ].join(' ')}
    >
      <span
        className="font-display absolute -top-4 -left-4 flex h-11 w-11 items-center
                   justify-center rounded-full bg-glut text-2xl font-extrabold text-nacht"
        aria-hidden
      >
        {ziffer}
      </span>

      {wort.bild ? (
        <img
          src={wort.bild}
          alt=""
          className="h-full w-full object-contain"
          draggable={false}
        />
      ) : (
        <span className="text-7xl" aria-hidden>
          {wort.emoji}
        </span>
      )}
    </motion.button>
  )
}
