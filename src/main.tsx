import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { loadManifest } from './audio/speak'
import './index.css'

// Stimmen vorwärmen - Chrome liefert sie erst asynchron nach.
if ('speechSynthesis' in window) {
  speechSynthesis.getVoices()
  speechSynthesis.addEventListener('voiceschanged', () => speechSynthesis.getVoices())
}

void loadManifest()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
