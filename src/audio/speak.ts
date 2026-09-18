import { lautFile, lautHint, type Grapheme } from '../data/phonemes'

/**
 * Audio-Schicht.
 *
 * Zwei Quellen, in dieser Reihenfolge:
 *   1. Echte Aufnahmen aus public/audio/ (laut manifest.json)
 *   2. Browser-Sprachausgabe als Platzhalter
 *
 * Die Browser-Stimme kann keine einzelnen Laute - sie sagt "Te" statt "t".
 * Für den Prototyp reicht das; für die fertige App kommen Aufnahmen rein
 * und dieser Code ändert sich nicht.
 */

type Manifest = { laute: string[]; woerter: string[] }

let manifest: Manifest = { laute: [], woerter: [] }
let cachedVoice: SpeechSynthesisVoice | null = null
let currentAudio: HTMLAudioElement | null = null

export async function loadManifest(): Promise<void> {
  try {
    const res = await fetch('/audio/manifest.json')
    if (res.ok) manifest = await res.json()
  } catch {
    // Kein Manifest = noch keine Aufnahmen. Sprachausgabe übernimmt.
  }
}

/** Vom Benutzer im Eltern-Bereich gewählte Stimme. */
let wunschStimme: string | null = null

export function setStimme(name: string | null): void {
  wunschStimme = name
  cachedVoice = null
}

/** Alle deutschen Stimmen, beste zuerst. */
export function deutscheStimmen(): SpeechSynthesisVoice[] {
  const de = speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('de'))

  /*
   * Die alten kompakten macOS-Stimmen ("Anna") klingen blechern. Netz-
   * stimmen und die neueren Systemstimmen sind deutlich besser, darum
   * werden die nach oben sortiert.
   */
  const gut = ['Helena', 'Martin', 'Sandy', 'Shelley', 'Flo', 'Reed', 'Eddy']

  const punkte = (v: SpeechSynthesisVoice) => {
    let p = 0
    if (!v.localService) p += 100
    if (/premium|enhanced/i.test(v.name)) p += 60
    const i = gut.findIndex((n) => v.name.includes(n))
    if (i >= 0) p += 40 - i
    if (/^Anna/.test(v.name)) p -= 60
    return p
  }

  return [...de].sort((a, b) => punkte(b) - punkte(a))
}

function germanVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice
  const de = deutscheStimmen()
  if (!de.length) return null
  cachedVoice =
    (wunschStimme && de.find((v) => v.name === wunschStimme)) || de[0]
  return cachedVoice
}

export function stopAll(): void {
  speechSynthesis.cancel()
  if (currentAudio) {
    currentAudio.pause()
    currentAudio = null
  }
}

/** Sprachausgabe. Löst auf, wenn fertig gesprochen. */
function say(text: string, rate = 0.85, pitch = 1.1): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'de-DE'
    u.rate = rate
    u.pitch = pitch
    const v = germanVoice()
    if (v) u.voice = v
    u.onend = () => resolve()
    u.onerror = () => resolve()
    speechSynthesis.speak(u)
    // Safari verschluckt onend gelegentlich - harter Fallback.
    setTimeout(resolve, 200 + text.length * 120)
  })
}

function playFile(src: string): Promise<void> {
  return new Promise((resolve) => {
    const a = new Audio(src)
    currentAudio = a
    a.onended = () => resolve()
    a.onerror = () => resolve()
    void a.play().catch(() => resolve())
  })
}

/** Einen einzelnen Laut abspielen - "mmmm", nicht "Em". */
export async function playLaut(g: Grapheme): Promise<void> {
  stopAll()
  if (manifest.laute.includes(g)) return playFile(lautFile(g))
  return say(lautHint(g), 0.7)
}

/** Ein ganzes Wort abspielen. */
export async function playWort(word: string): Promise<void> {
  stopAll()
  if (manifest.woerter.includes(word)) {
    return playFile(`/audio/woerter/${word}.mp3`)
  }
  return say(word, 0.8)
}

/** Ansage für das Kind (kurz halten - er kann sie nicht nachlesen). */
export async function playAnsage(text: string): Promise<void> {
  stopAll()
  return say(text, 0.9)
}
