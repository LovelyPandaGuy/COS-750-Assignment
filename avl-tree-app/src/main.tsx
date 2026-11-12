import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/tokens.css'
import './index.css'
import App from './App.tsx'
import { bootLearner } from './state/boot'
import { applyTheme } from './ui/theme'

// Load stored learner data once, before the first render (design decision 1).
const { storage, initial, settings, initialTheme } = bootLearner()
// The stored theme goes on <html> before React renders, so a reload never flashes light (design decision 5).
applyTheme(initialTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App storage={storage} initial={initial} settings={settings} initialTheme={initialTheme} />
  </StrictMode>,
)
