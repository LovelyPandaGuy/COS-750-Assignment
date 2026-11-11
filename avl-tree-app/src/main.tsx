import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './ui/tokens.css'
import './index.css'
import App from './App.tsx'
import { bootLearner } from './state/boot'

// Load stored learner data once, before the first render (design decision 1).
const { storage, initial } = bootLearner()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App storage={storage} initial={initial} />
  </StrictMode>,
)
