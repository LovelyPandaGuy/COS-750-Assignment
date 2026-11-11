import type { ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './ui/AppShell'
import { shellCopy } from './content/shell'
import { startCopy } from './content/start'
import { LearnerProvider, useLearner } from './state/LearnerContext'
import { bootLearner, type Booted } from './state/boot'
import { Start } from './pages/Start'
import { ModulePlaceholder } from './pages/ModulePlaceholder'

/** Every route sits in the shell; the pill says whether progress is being saved (NFR-06). */
function Screen({ children }: { children: ReactNode }) {
  const { persistent } = useLearner()
  return (
    <AppShell title={shellCopy.appTitle} status={persistent ? startCopy.savedPill : startCopy.notSavedPill}>
      {children}
    </AppShell>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Screen><Start /></Screen>} />
      <Route path="/module/:moduleId" element={<Screen><ModulePlaceholder /></Screen>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/** Loaded once per page when App is rendered without an injected start (tests of the shell). */
let fallbackBoot: Booted | null = null

export function App({ storage, initial }: Partial<Booted>) {
  const booted = storage && initial ? { storage, initial } : (fallbackBoot ??= bootLearner())
  return (
    <HashRouter>
      <LearnerProvider storage={booted.storage} initial={booted.initial}>
        <AppRoutes />
      </LearnerProvider>
    </HashRouter>
  )
}

export default App
