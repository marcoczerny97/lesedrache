import { useEffect, useState } from 'react'
import { Start } from './screens/Start'
import { Spiel } from './screens/Spiel'
import { Eltern } from './screens/Eltern'
import { setStimme } from './audio/speak'
import { useProgress } from './store/progress'

type Screen = 'start' | 'spiel' | 'eltern'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')
  const stimme = useProgress((s) => s.stimme)

  useEffect(() => setStimme(stimme), [stimme])

  return (
    <div className="h-full">
      {screen === 'start' && (
        <Start
          onSpielen={() => setScreen('spiel')}
          onEltern={() => setScreen('eltern')}
        />
      )}
      {screen === 'spiel' && <Spiel onEnde={() => setScreen('start')} />}
      {screen === 'eltern' && <Eltern onZurueck={() => setScreen('start')} />}
    </div>
  )
}
