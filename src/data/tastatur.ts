/**
 * QWERTZ-Layout, wie es auf seiner Tastatur steht.
 *
 * Die Bildschirmtastatur ist kein Bedienelement, sondern eine Landkarte:
 * Sie zeigt ihm, wo der gesuchte Buchstabe auf dem echten Gerät liegt.
 * Deshalb muss die Anordnung exakt der physischen entsprechen.
 */
export const TASTATUR_REIHEN: string[][] = [
  ['Q', 'W', 'E', 'R', 'T', 'Z', 'U', 'I', 'O', 'P', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ö', 'Ä'],
  ['Y', 'X', 'C', 'V', 'B', 'N', 'M'],
]

/** Einrückung der Reihen, damit es aussieht wie eine echte Tastatur. */
export const REIHEN_VERSATZ = [0, 0.4, 1.0]
