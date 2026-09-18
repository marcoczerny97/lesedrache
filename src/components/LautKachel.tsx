import { motion } from 'framer-motion'

type Props = {
  graphem: string
  /** Schon aufgedeckt? */
  sichtbar: boolean
  /** Klingt gerade? */
  aktiv: boolean
  /** Rücken die Kacheln gerade zum Wort zusammen? */
  verschmolzen: boolean
  onClick?: () => void
}

/**
 * Eine Kachel = ein LAUT, nicht ein Buchstabe.
 * "AU" steht darum auf einer einzigen Kachel.
 */
export function LautKachel({
  graphem,
  sichtbar,
  aktiv,
  verschmolzen,
  onClick,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      tabIndex={-1}
      aria-label={`Laut ${graphem}`}
      initial={{ opacity: 0, y: 30, scale: 0.6 }}
      animate={{
        opacity: sichtbar ? 1 : 0.12,
        y: 0,
        scale: aktiv ? 1.18 : 1,
      }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      className={[
        'font-display rounded-3xl px-2 tabular-nums transition-colors duration-200',
        verschmolzen ? 'mx-0' : 'mx-1',
        aktiv ? 'text-glut-hell glut-stark' : 'text-glut glut',
      ].join(' ')}
      style={{
        fontSize: 'clamp(3.5rem, 11vw, 8rem)',
        fontWeight: 800,
        lineHeight: 1,
      }}
    >
      {graphem}
    </motion.button>
  )
}
