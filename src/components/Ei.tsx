import { motion } from 'framer-motion'

type Props = {
  /** Fehlversuche in dieser Runde - das Ei bekommt Risse. */
  fehler: number
  /** Schlüpft gerade etwas? */
  offen: boolean
  /** Das Wesen im Ei. */
  emoji: string
  /** Darf man schon ahnen, was drin ist? */
  durchscheinend: boolean
}

/**
 * Das Ei mit dem Wesen darin.
 *
 * Die Risse wachsen mit jedem Fehlversuch. Das dreht die Bedeutung um:
 * Suchen bringt ihn dem Schlüpfen näher, statt ihn zu bestrafen. Wer oft
 * danebentippt, sieht trotzdem Fortschritt.
 */
export function Ei({ fehler, offen, emoji, durchscheinend }: Props) {
  const risse = Math.min(3, fehler)
  const breite = 'clamp(6rem, 13vw, 11rem)'
  const hoehe = 'clamp(7.6rem, 16.5vw, 14rem)'

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: breite, height: hoehe }}
    >
      <motion.div
        animate={
          offen
            ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
            : // opacity MUSS hier stehen: nach dem Schluepfen behaelt
              // Framer Motion sonst die 0 aus der Zeile darueber - das Ei
              // waere ab der zweiten Runde unsichtbar.
              { rotate: [0, -3.5, 3.5, 0], scale: 1 + risse * 0.02, opacity: 1 }
        }
        transition={
          offen
            ? { duration: 0.45 }
            : { rotate: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } }
        }
        className="relative h-full w-full"
      >
        {/* Die Schale */}
        <div
          className="absolute inset-0 shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
          style={{
            borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
            background:
              'radial-gradient(60% 55% at 38% 28%, #fffdf6 0%, #f2e6cf 45%, #d8c3a0 100%)',
          }}
        />

        {/*
          Ahnung dessen, was drin steckt. Bewusst in Farbe und nur leicht
          weichgezeichnet - als schwarze Silhouette wird daraus ein
          grauer Klecks, den kein Kind erkennt.
        */}
        {durchscheinend && !offen && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              fontSize: `calc(${breite} * 0.52)`,
              filter: 'blur(1.5px) saturate(0.75)',
            }}
            animate={{ opacity: [0.4, 0.62, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden
          >
            {emoji}
          </motion.div>
        )}

        {/* Risse, einer je Fehlversuch */}
        <svg
          viewBox="0 0 100 130"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          {[
            'M50 18 L44 34 L56 44 L48 60',
            'M22 55 L36 62 L28 76 L40 86',
            'M78 48 L66 60 L76 72 L64 84',
          ].map((d, i) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="rgba(90,60,25,0.6)"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: i < risse ? 1 : 0,
                opacity: i < risse ? 1 : 0,
              }}
              transition={{ duration: 0.4 }}
            />
          ))}
        </svg>
      </motion.div>

      {/* Beim Schlüpfen: Lichtblitz */}
      {offen && (
        <motion.div
          className="absolute rounded-full bg-glut-hell blur-2xl"
          initial={{ scale: 0.2, opacity: 0.9 }}
          animate={{ scale: 2.4, opacity: 0 }}
          transition={{ duration: 0.7 }}
          style={{ width: breite, height: breite }}
          aria-hidden
        />
      )}
    </div>
  )
}
