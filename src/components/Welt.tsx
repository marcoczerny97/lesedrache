import { motion } from 'framer-motion'
import { BUCHSTABEN } from '../data/buchstaben'

/**
 * Seine Drachenwelt.
 *
 * Jedes Wesen hier hat er selbst erobert, und es bleibt. Nach einer Woche
 * ist das ein Ort, der ihm gehört - das ist der Unterschied zu einem
 * Sternchen-Zähler, der nur eine Zahl hochzählt.
 */
export function Welt({ gefangen }: { gefangen: string[] }) {
  return (
    <div className="pointer-events-none relative h-40 w-full overflow-hidden">
      {/* Horizont */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            'radial-gradient(70% 90% at 50% 130%, rgba(255,176,32,0.16) 0%, transparent 60%)',
        }}
      />
      {/* Hügel hinten */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-6 h-24"
        style={{
          background:
            'radial-gradient(55% 100% at 18% 100%, rgba(54,32,107,0.95) 0%, transparent 72%),' +
            'radial-gradient(48% 100% at 55% 100%, rgba(45,26,90,0.9) 0%, transparent 72%),' +
            'radial-gradient(52% 100% at 88% 100%, rgba(54,32,107,0.85) 0%, transparent 72%)',
        }}
      />
      {/* Boden */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-10"
        style={{
          background:
            'linear-gradient(to bottom, rgba(36,21,72,0.95), rgba(18,11,38,1))',
          borderTop: '2px solid rgba(255,255,255,0.10)',
        }}
      />

      {gefangen.map((z, i) => {
        const b = BUCHSTABEN[z]
        if (!b) return null

        /*
         * Alles aus dem Index abgeleitet, damit die Wesen bei jedem
         * Neuzeichnen an derselben Stelle stehen und nicht herumspringen.
         * Die hinteren sind kleiner und stehen höher - das gibt Tiefe.
         */
        const spur = 3 + ((i * 37) % 90)
        const hinten = i % 3 === 1
        const groesse = hinten ? 'text-2xl' : 'text-4xl'
        const hoehe = hinten ? 44 + ((i * 7) % 14) : 6 + ((i * 5) % 12)
        const weite = (hinten ? 2 : 4) + ((i * 13) % 6)
        const tempo = 8 + ((i * 11) % 10)

        return (
          <motion.div
            key={z}
            className={`absolute ${groesse}`}
            style={{ left: `${spur}%`, bottom: `${hoehe}px`, opacity: hinten ? 0.7 : 1 }}
            animate={{ x: [0, weite * 7, 0], y: [0, -6, 0] }}
            transition={{
              duration: tempo,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: (i % 5) * 0.4,
            }}
            title={b.wort}
          >
            {b.emoji}
          </motion.div>
        )
      })}
    </div>
  )
}
