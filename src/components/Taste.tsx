import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

/**
 * Eine gezeichnete Taste als Hinweis.
 *
 * Bewusst ohne Beschriftung in Worten - er kann sie nicht lesen.
 * Die Taste sieht aus wie die echte auf seiner Tastatur, darin
 * steht ein Symbol für das, was passiert.
 */
export function Taste({
  breit = false,
  pulsiert = false,
  children,
  label,
}: {
  breit?: boolean
  pulsiert?: boolean
  children: ReactNode
  label: string
}) {
  return (
    <motion.div
      aria-label={label}
      animate={pulsiert ? { y: [0, -6, 0] } : { y: 0 }}
      transition={{ duration: 1.1, repeat: pulsiert ? Infinity : 0, ease: 'easeInOut' }}
      className={[
        'flex items-center justify-center gap-2 rounded-xl border-b-4 text-2xl',
        'border-white/25 bg-white/15 backdrop-blur',
        pulsiert ? 'text-white' : 'text-white/70',
        breit ? 'h-14 w-44' : 'h-14 w-14',
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
