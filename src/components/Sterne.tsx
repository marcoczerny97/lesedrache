import { motion, AnimatePresence } from 'framer-motion'

export function Sterne({ anzahl }: { anzahl: number }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
      <span className="text-2xl" aria-hidden>
        ⭐
      </span>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={anzahl}
          initial={{ scale: 1.8, y: -8, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="font-display text-3xl font-extrabold text-glut-hell"
        >
          {anzahl}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">Sterne gesammelt</span>
    </div>
  )
}
