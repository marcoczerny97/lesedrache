import { useEffect, useState } from 'react'
import { Start } from './screens/Start'
import { Jagd } from './screens/Jagd'
import { Eltern } from './screens/Eltern'
import { setStimme } from './audio/speak'
import { useFortschritt } from './store/fortschritt'

type Screen = 'start' | 'jagd' | 'eltern'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const stimme = useFortschritt((s) => s.stimme)

  useEffect(() => setStimme(stimme), [stimme])

  return (
    <div className="h-full">
      {screen === 'start' && (
        <Start
          onSpielen={() => setScreen('jagd')}
          onEltern={() => setScreen('eltern')}
        />
      )}
      {screen === 'jagd' && <Jagd onEnde={() => setScreen('start')} />}
      {screen === 'eltern' && <Eltern onZurueck={() => setScreen('start')} />}
    </div>
  )
}
