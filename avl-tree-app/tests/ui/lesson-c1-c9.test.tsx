import { readFileSync } from 'node:fs'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../src/App'
import { lessonCopy } from '../../src/content/lesson'
import { loadContent, lessonById } from '../../src/live/load'
import { setRouteEventSink, type RouteEvent } from '../../src/navigation/routeEvents'
import type { Attempt, LearnerState } from '../../src/state/learnerState'
import { createLearnerStorage, createSettingsStorage, LEARNER_KEY, memoryBackend, SETTINGS_KEY } from '../../src/state/storage'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: live-c1-and-c9 / lesson-c1, lesson-c9, display-settings, route-choice. ID 7.2, 9.1, 9.2, 9.3, 10.4.

const content = loadContent().content!
const c = lessonCopy.controls
let clock = 0
const att = (questionId: string, correct: boolean, extra: Partial<Attempt> = {}): Attempt => ({
  questionId,
  at: new Date(Date.UTC(2026, 10, 14, 9, 0, clock++)).toISOString(),
  answer: null,
  correct,
  hintsUsed: 0,
  attempt: 1,
  ...extra,
})
const DIA = ['dia-01', 'dia-02', 'dia-03', 'dia-04', 'dia-05']
const RDY = ['rdy-01', 'rdy-02', 'rdy-03', 'rdy-04', 'rdy-05', 'rdy-06', 'rdy-07', 'rdy-08', 'rdy-09']
const learner = (attempts: Attempt[], over: Partial<LearnerState> = {}) => progressState({ currentModule: 'C1', completedModules: [], attempts, ...over })

function openAt(path: string, lesson: string, screenId: string, state: LearnerState, sequence?: 'refresher') {
  const backend = backendWith(state)
  const r = renderRoutes(backend, path)
  const screens = sequence === 'refresher' ? lessonById(lesson)!.refresher!.screens : lessonById(lesson)!.screens
  const n = screens.findIndex((s) => s.id === screenId)
  for (let i = 0; i < n; i++) fireEvent.click(screen.getByRole('button', { name: c.next }))
  return { ...r, backend, stored: () => JSON.parse(backend.getItem(LEARNER_KEY)!) as LearnerState }
}
const h2 = () => screen.getByRole('heading', { level: 2 })
const headings = (lesson: string, state: LearnerState) => {
  const r = renderRoutes(backendWith(state), `/module/${lesson.toUpperCase()}`)
  const out: string[] = []
  const n = lessonById(lesson)!.screens.length
  for (let i = 0; i < n; i++) {
    out.push(h2().textContent!)
    if (i < n - 1) fireEvent.click(screen.getByRole('button', { name: c.next }))
  }
  r.unmount()
  return out
}

afterEach(() => setRouteEventSink(() => undefined))

describe('lesson-c1: C1 plays its lesson file (ID 7.2)', () => {
  it('screens in order', () => {
    expect(headings('c1', learner(DIA.map((id) => att(id, true))))).toEqual(['Welcome', 'Your route', 'How the app works', 'The conventions card', 'Settings', 'Quick readiness check', 'Your result'])
  })

  it('conventions card: heights and balance factors, five points', () => {
    const r = openAt('/module/C1', 'c1', 'c1-s04', learner([]))
    expect(r.container.querySelector('[data-key="20"] .tree-metrics')!.textContent).toBe('h2 · bf +1')
    expect(r.container.querySelectorAll('.lesson-support .lesson-points li')).toHaveLength(5)
  })
})

describe('lesson-c1: five readiness questions, one per screen', () => {
  it('no verdict during the set; the attempt is stored and the next question follows', () => {
    const r = openAt('/module/C1', 'c1', 'c1-s06', learner([]))
    expect(screen.getByText(lessonCopy.questions.questionOf(1, 5))).toBeInTheDocument()
    const q1 = content.diagnostic.questions.find((q) => q.id === 'dia-01')!
    const wrong = q1.options!.find((o) => o.id !== q1.correctOptionId)!
    fireEvent.click(screen.getByRole('radio', { name: wrong.text }))
    fireEvent.click(screen.getByRole('radio', { name: 'Sure' }))
    fireEvent.click(screen.getByRole('button', { name: lessonCopy.questions.checkAnswer }))
    expect(screen.queryByText(/That’s right\.|Not quite\./)).toBeNull()
    expect(r.stored().attempts.at(-1)).toMatchObject({ questionId: 'dia-01', correct: false, confidence: 'sure' })
    expect(screen.getByText(lessonCopy.questions.questionOf(2, 5))).toBeInTheDocument()
  })

  it('resume at the first unanswered question', () => {
    openAt('/module/C1', 'c1', 'c1-s06', learner(DIA.slice(0, 3).map((id) => att(id, true))))
    expect(screen.getByText(lessonCopy.questions.questionOf(4, 5))).toBeInTheDocument()
  })

  it('no skipping the readiness check', () => {
    openAt('/module/C1', 'c1', 'c1-s06', learner([]))
    expect(screen.queryByRole('button', { name: c.skip })).toBeNull()
    expect(screen.getByRole('button', { name: c.next })).toBeDisabled()
  })
})

describe('lesson-c1: per-skill result and route (ID 7.2, 9.3)', () => {
  it('four right: C2 suggested, C1 complete, one recommendation event', () => {
    const events: RouteEvent[] = []
    setRouteEventSink((e) => events.push(e))
    const r = openAt('/module/C1', 'c1', 'c1-s07', learner(DIA.map((id) => att(id, id !== 'dia-03'))))
    const items = within(r.container.querySelector('.lesson-skills')!).getAllByRole('listitem')
    expect(items.map((li) => li.textContent!.includes('Secure'))).toEqual([true, true, false, true, true])
    expect(screen.getByText('Your BST basics are secure. On to C2.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Suggested/ })).toHaveTextContent('C2')
    expect(r.stored().completedModules).toContain('C1')
    expect(events.filter((e) => e.type === 'route_recommended')).toHaveLength(1)
  })

  it('three right: the refresher suggested, C2 still offered, C1 not complete', () => {
    const r = openAt('/module/C1', 'c1', 'c1-s07', learner(DIA.map((id, i) => att(id, i < 3))))
    expect(screen.getByRole('link', { name: /Suggested/ })).toHaveTextContent(/refresher/i)
    expect(screen.getByRole('link', { name: /Go to C2/ })).toBeInTheDocument()
    expect(screen.getByText(/A short BST refresher first/)).toBeInTheDocument()
    expect(r.stored().completedModules).not.toContain('C1')
  })
})

describe('lesson-c1: the re-check after the refresher', () => {
  const missed = DIA.map((id) => att(id, id !== 'dia-02' && id !== 'dia-05'))
  it('asks only the missed skills', () => {
    openAt('/module/C1/refresher', 'c1', 'c1-r06', learner(missed), 'refresher')
    expect(screen.getByText(lessonCopy.questions.questionOf(1, 2))).toBeInTheDocument()
    expect(screen.getByText(content.diagnostic.questions.find((q) => q.id === 'dia-02-r')!.stem)).toBeInTheDocument()
  })
  it('then C1 completes and C2 is offered', () => {
    const r = openAt('/module/C1/refresher', 'c1', 'c1-r06', learner([...missed, att('dia-02-r', true), att('dia-05-r', false)]), 'refresher')
    expect(screen.getByText(lessonCopy.c1.recheckDone)).toBeInTheDocument()
    expect(r.stored().completedModules).toContain('C1')
    expect(screen.getByRole('link', { name: /Go to C2/ })).toBeInTheDocument()
  })
})

describe('lesson-c9 (ID 7.2 C9)', () => {
  const allRight = () => RDY.map((id) => att(id, true))
  const c9 = (attempts: Attempt[], over: Partial<LearnerState> = {}) => learner(attempts, { currentModule: 'C9', completedModules: ['C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C8'], ...over })

  it('screens in order', () => {
    expect(headings('c9', c9(allRight()))).toEqual(['Am I ready for the lecture?', 'Readiness questions', 'Your readiness report', 'Your question for the lecture', 'Certificate of completion'])
  })

  it('a miss returns once', () => {
    const first = RDY.map((id) => att(id, id !== 'rdy-03'))
    const a = openAt('/module/C9', 'c9', 'c9-s02', c9(first))
    expect(screen.getByText(content.readiness.questions.find((q) => q.id === 'rdy-03-r')!.stem)).toBeInTheDocument()
    a.unmount()
    openAt('/module/C9', 'c9', 'c9-s02', c9([...first, att('rdy-03-r', false)]))
    expect(screen.getByText(lessonCopy.c9.setDone)).toBeInTheDocument()
  })

  it('combined: the search question shows the tree the build question built', () => {
    const r = openAt('/module/C9', 'c9', 'c9-s02', c9(RDY.slice(0, 8).map((id) => att(id, true))))
    expect(r.container.querySelector('.tree-description')!.textContent).toMatch(/^Root 13 /)
  })

  it('report: title, Ready per objective, a flag and a lecture question', () => {
    const attempts = [...RDY.map((id) => att(id, id !== 'rdy-02', id === 'rdy-02' ? { confidence: 'sure', misconceptionId: 'misc-bf-sign' } : {})), att('rdy-02-r', false)]
    const r = openAt('/module/C9', 'c9', 'c9-s03', c9(attempts))
    const rows = within(r.container.querySelector('.lesson-report-rows')!).getAllByRole('listitem')
    expect(rows).toHaveLength(7)
    expect(rows[1]).toHaveTextContent('LO2: Revise')
    expect(rows[1]).toHaveTextContent(lessonCopy.c9.flag)
    expect(rows[0]).toHaveTextContent('LO1: Ready')
    expect(rows[6]).toHaveTextContent('(optional)')
    expect(r.container.querySelector('.lesson-report')).toHaveTextContent('Which sign convention does the lecture use for balance factors')
  })

  it('every question right: Structural Savant', () => {
    openAt('/module/C9', 'c9', 'c9-s03', c9(allRight()))
    expect(screen.getByText('Structural Savant')).toBeInTheDocument()
  })

  it('own question: stored and listed', () => {
    const r = openAt('/module/C9', 'c9', 'c9-s04', c9(allRight()))
    fireEvent.change(screen.getByRole('textbox', { name: lessonCopy.c9.ownLabel }), { target: { value: 'Why is one rotation enough?' } })
    fireEvent.click(screen.getByRole('button', { name: lessonCopy.c9.ownSave }))
    expect(r.stored().lectureQuestions.map((q) => q.text)).toContain('Why is one rotation enough?')
    expect(screen.getByText('Why is one rotation enough?')).toBeInTheDocument()
  })

  it('certificate: generated from rewards.json, the name never stored', () => {
    const r = openAt('/module/C9', 'c9', 'c9-s05', c9(allRight()))
    fireEvent.change(screen.getByRole('textbox', { name: lessonCopy.c9.nameLabel }), { target: { value: 'Ada' } })
    fireEvent.click(screen.getByRole('button', { name: lessonCopy.c9.generate }))
    const cert = screen.getByRole('region', { name: lessonCopy.c9.certificateLabel })
    expect(cert).toHaveTextContent(/Ada completed (8|9) of 9 lessons of the COS212 AVL tree app and earned the title Structural Savant\./)
    expect(cert).toHaveTextContent('Proposal: completed lessons could earn a bonus')
    expect(r.backend.getItem(LEARNER_KEY)!).not.toContain('Ada')
    expect(screen.getByRole('button', { name: lessonCopy.c9.print })).toBeInTheDocument()
  })

  it('/readiness shows the same report', () => {
    renderRoutes(backendWith(c9(allRight())), '/readiness')
    expect(screen.getByText('Structural Savant')).toBeInTheDocument()
    expect(screen.getAllByText(/LO\d: Ready/)).toHaveLength(7)
  })
})

describe('NFR-02 axe on every C1 and C9 screen', () => {
  for (const [lesson, state] of [
    ['c1', learner(DIA.map((id) => att(id, true)))],
    ['c9', learner(RDY.map((id) => att(id, true)), { currentModule: 'C9' })],
  ] as const) {
    it(lesson, async () => {
      const r = renderRoutes(backendWith(state), `/module/${lesson.toUpperCase()}`)
      const n = lessonById(lesson)!.screens.length
      for (let i = 0; i < n; i++) {
        expect(await axe(r.container), `${lesson} screen ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) fireEvent.click(screen.getByRole('button', { name: c.next }))
      }
    }, 120_000)
  }
})

describe('display-settings (ID 10.4, 11.2)', () => {
  function renderApp(backend = memoryBackend(), path = '#/module/C1') {
    window.location.hash = path
    const storage = createLearnerStorage(backend)
    const settings = createSettingsStorage(backend)
    const r = render(<App storage={storage} initial={storage.load()} settings={settings} initialTheme={settings.load().theme} />)
    for (let i = 0; i < 4; i++) fireEvent.click(screen.getByRole('button', { name: c.next }))
    return { ...r, backend }
  }
  const sw = (name: string) => within(screen.getByRole('group', { name: lessonCopy.settings.label })).getByRole('switch', { name: new RegExp(name) })

  it('defaults from the lesson file', () => {
    renderApp()
    expect(h2()).toHaveTextContent('Settings')
    expect(sw('Confetti')).toHaveAttribute('aria-checked', 'true')
    expect(sw('Read text aloud')).toHaveAttribute('aria-checked', 'false')
    expect(sw('Larger text')).toHaveAttribute('aria-checked', 'false')
  })

  it('kept across a reload', () => {
    const a = renderApp()
    fireEvent.click(sw('Confetti'))
    expect(JSON.parse(a.backend.getItem(SETTINGS_KEY)!)).toMatchObject({ confetti: false })
    a.unmount()
    renderApp(a.backend)
    expect(sw('Confetti')).toHaveAttribute('aria-checked', 'false')
  })

  it('larger text grows every rem-based type token', () => {
    const a = renderApp()
    fireEvent.click(sw('Larger text'))
    expect(document.documentElement.dataset.textSize).toBe('large')
    const tokens = readFileSync('src/ui/tokens.css', 'utf8')
    expect(tokens).toMatch(/:root\[data-text-size='large'\]\s*\{\s*font-size:\s*125%/)
    expect(tokens).not.toMatch(/--type-[a-z-]+:[^;]*\d+px/)
    fireEvent.click(sw('Larger text'))
    expect(document.documentElement.dataset.textSize).toBeUndefined()
    a.unmount()
  })

  it('narration comes later', () => {
    renderApp()
    expect(sw('Read text aloud')).toBeDisabled()
    expect(screen.getByText(lessonCopy.settings.later)).toBeInTheDocument()
  })
})

