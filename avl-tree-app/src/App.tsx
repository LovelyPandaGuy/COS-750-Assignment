import { useCallback, useState, type ReactNode } from 'react'
import { HashRouter, Navigate, Route, Routes, useHref, useNavigate, useParams } from 'react-router-dom'
import { AppShell } from './ui/AppShell'
import type { TopBarAction } from './ui/TopBar'
import { shellCopy } from './content/shell'
import { moduleLabel } from './content/modules'
import { activityLabel, breadcrumb, screenCopy } from './content/screens'
import { startCopy } from './content/start'
import { LearnerProvider, useLearner } from './state/LearnerContext'
import { bootLearner, type Booted } from './state/boot'
import { createSettingsStorage } from './state/storage'
import { ThemeProvider, useTheme } from './ui/ThemeContext'
import { DEFAULT_THEME } from './ui/theme'
import { ACTIVITIES_BY_MODULE, parseActivity, parseModuleId, paths, patterns } from './routes'
import { useScreen } from './useScreen'
import { Activity } from './pages/Activity'
import { Hub } from './pages/Hub'
import { Module } from './pages/Module'
import { Readiness } from './pages/Readiness'
import { Sandbox } from './pages/Sandbox'
import { Start } from './pages/Start'
import { WarmUpCheck } from './pages/WarmUpCheck'
import { WarmUpResult } from './pages/WarmUpResult'

type ActionKey = 'sandbox' | 'lectureQuestions'
const BOTH: ActionKey[] = ['sandbox', 'lectureQuestions']

/**
 * Every route sits in the shell; the pill says whether progress is being saved (NFR-06).
 * Which actions a screen shows follows the wireframes (proposal, question 6).
 */
function Screen({ breadcrumb: crumb, actions = [], children }: { breadcrumb?: string; actions?: ActionKey[]; children: ReactNode }) {
  const { persistent } = useLearner()
  const navigate = useNavigate()
  const sandboxHref = useHref(paths.sandbox())
  const readinessHref = useHref(paths.readiness())
  useScreen()

  const known: Record<ActionKey, TopBarAction> = {
    sandbox: { label: screenCopy.actions.sandbox, href: sandboxHref, onNavigate: () => navigate(paths.sandbox()) },
    lectureQuestions: { label: screenCopy.actions.lectureQuestions, href: readinessHref, onNavigate: () => navigate(paths.readiness()) },
  }
  return (
    <AppShell
      title={shellCopy.appTitle}
      breadcrumb={crumb}
      status={persistent ? startCopy.savedPill : startCopy.notSavedPill}
      actions={actions.map((a) => known[a])}
    >
      {children}
    </AppShell>
  )
}

function ModuleRoute() {
  const id = parseModuleId(useParams().moduleId)
  if (id === null) return <Navigate to={paths.start()} replace />
  return (
    <Screen breadcrumb={breadcrumb(moduleLabel(id))} actions={BOTH}>
      <Module id={id} />
    </Screen>
  )
}

function ActivityRoute() {
  const params = useParams()
  const id = parseModuleId(params.moduleId)
  if (id === null) return <Navigate to={paths.start()} replace />
  const activity = parseActivity(params.activity)
  const list = ACTIVITIES_BY_MODULE[id]
  if (activity === null || !list.includes(activity)) return <Navigate to={paths.module(id)} replace />

  const label = activityLabel(id, activity)
  // C1's screens are the diagnostic flow, not "n of m" steps, and show no actions (wireframes 1c, 1d).
  const where = id === 'C1' ? label : screenCopy.activity.crumbPlace(label, list.indexOf(activity) + 1, list.length)
  const actions: ActionKey[] = id === 'C1' ? [] : activity === 'check' ? ['lectureQuestions'] : BOTH
  return (
    <Screen breadcrumb={breadcrumb(moduleLabel(id), where)} actions={actions}>
      {id === 'C1' && activity === 'check' ? <WarmUpCheck /> : <Activity module={id} activity={activity} />}
    </Screen>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path={patterns.start} element={<Screen><Start /></Screen>} />
      <Route path={patterns.hub} element={<Screen breadcrumb={breadcrumb(screenCopy.crumbs.hub)} actions={BOTH}><Hub /></Screen>} />
      <Route path={patterns.module} element={<ModuleRoute />} />
      <Route
        path={patterns.warmUpResult}
        element={<Screen breadcrumb={breadcrumb(moduleLabel('C1'), screenCopy.crumbs.warmUpResult)}><WarmUpResult /></Screen>}
      />
      <Route path={patterns.activity} element={<ActivityRoute />} />
      <Route path={patterns.sandbox} element={<Screen breadcrumb={breadcrumb(screenCopy.crumbs.sandbox)} actions={['lectureQuestions']}><Sandbox /></Screen>} />
      <Route path={patterns.readiness} element={<Screen breadcrumb={breadcrumb(screenCopy.crumbs.readiness)} actions={['sandbox']}><Readiness /></Screen>} />
      <Route path="*" element={<Navigate to={paths.start()} replace />} />
    </Routes>
  )
}

/** Loaded once per page when App is rendered without an injected start (tests of the shell). */
let fallbackBoot: Booted | null = null

export function App({ storage, initial, settings, initialTheme }: Partial<Booted>) {
  const booted = storage && initial ? { storage, initial } : (fallbackBoot ??= bootLearner())
  // Settings come with the boot; a test that injects only learner storage gets session-only settings.
  const [themeSettings] = useState(() => settings ?? (storage && initial ? createSettingsStorage(null) : fallbackBoot!.settings))
  const [startTheme] = useState(() => initialTheme ?? themeSettings.load().theme)
  return (
    <HashRouter>
      <ThemeProvider settings={themeSettings} initial={startTheme}>
        <ThemedLearner storage={booted.storage} initial={booted.initial} />
      </ThemeProvider>
    </HashRouter>
  )
}

/** Reset clears the settings key with the rest, so the theme goes back to the default at once (decision 7). */
function ThemedLearner({ storage, initial }: Pick<Booted, 'storage' | 'initial'>) {
  const theme = useTheme()
  const onReset = useCallback(() => theme?.setTheme(DEFAULT_THEME, { save: false }), [theme])
  return (
    <LearnerProvider storage={storage} initial={initial} onReset={onReset}>
      <AppRoutes />
    </LearnerProvider>
  )
}

export default App
