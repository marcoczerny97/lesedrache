/**
 * Kurze Klänge statt gesprochener Rückmeldung.
 *
 * Ein Kind hört pro Sitzung hundertmal "richtig" - gesprochen nervt das
 * nach zwei Minuten. Ein Klang ist sofort verstanden, kostet keine halbe
 * Sekunde und geht nie auf die Nerven.
 *
 * Alles per Web Audio erzeugt, keine Dateien nötig.
 */

let ctx: AudioContext | null = null

function ac(): AudioContext {
  ctx ??= new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function ton(
  freq: number,
  start: number,
  dauer: number,
  vol = 0.16,
  typ: OscillatorType = 'sine',
) {
  const a = ac()
  const t = a.currentTime + start
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = typ
  osc.frequency.setValueAtTime(freq, t)
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(vol, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dauer)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + dauer + 0.05)
}

/** Treffer: kleine aufsteigende Fanfare. */
export function sfxRichtig(): void {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    ton(f, i * 0.085, 0.35, 0.14, 'triangle'),
  )
}

/** Daneben: zwei weiche tiefe Töne. Kein Buzzer, kein Fehler-Sound. */
export function sfxNochmal(): void {
  ton(392, 0, 0.22, 0.12)
  ton(329.63, 0.13, 0.3, 0.1)
}

/** Der Drache pustet die Laute zusammen. */
export function sfxPuff(): void {
  const a = ac()
  const t = a.currentTime
  const osc = a.createOscillator()
  const gain = a.createGain()
  osc.type = 'sawtooth'
  osc.frequency.setValueAtTime(110, t)
  osc.frequency.exponentialRampToValueAtTime(440, t + 0.35)
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.linearRampToValueAtTime(0.08, t + 0.06)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4)
  osc.connect(gain).connect(a.destination)
  osc.start(t)
  osc.stop(t + 0.45)
}

/** Einmal beim ersten Tastendruck aufrufen - Browser brauchen die Geste. */
export function sfxAufwecken(): void {
  ac()
}
