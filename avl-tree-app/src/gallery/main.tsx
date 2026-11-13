// Development-only gallery entry (add-ui-foundation, design decision 7), for the Playwright baselines at
// the three widths in src/ui/breakpoints.ts. `?theme=dark` picks the dark theme. Not in `vite build`.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../ui/tokens.css'
import '../ui/fonts/fonts.css'
import '../index.css'
import './gallery.css'
import { applyTheme, parseTheme } from '../ui/theme'
import { Gallery } from './Gallery'

applyTheme(parseTheme(new URLSearchParams(location.search).get('theme')))
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Gallery />
  </StrictMode>,
)
