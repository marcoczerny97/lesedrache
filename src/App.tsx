import { useState } from 'react'
import { Start } from './screens/Start'
import { Spiel } from './screens/Spiel'
import { Eltern } from './screens/Eltern'

type Screen = 'start' | 'spiel' | 'eltern'

export default function App() {
  const [screen, setScreen] = useState<Screen>('start')

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
