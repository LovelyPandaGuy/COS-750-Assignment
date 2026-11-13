import { fireEvent, screen } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { checkSeed } from '../../src/assessment/session'
import type { Instance } from '../../src/assessment/types'
import { checkCopy } from '../../src/content/check'
import { diagnosticCopy } from '../../src/content/diagnostic'
import { DIAGNOSTIC } from '../../src/content/questions/diagnostic'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { navigationCopy } from '../../src/content/navigation'
import { playerCopy } from '../../src/content/modules/player'
import { screenCopy } from '../../src/content/screens'
import { setRouteEventSink, type RouteEvent } from '../../src/navigation/routeEvents'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-diagnostic-c1-and-routing / diagnostic-c1, diagnostic-routing, bst-refresher, route-choice.
// Requirement IDs: FR-DIA-01 to FR-DIA-05, FR-LRN-05, D6, D20, D28, NFR-02.

const PROFILE = 'profile-abc'
const fresh = () => progressState({ currentModule: 'C1', completedModules: [], attempts: [], subSkillStatus: {}, lectureQuestions: [] })
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(btn(diagnosticCopy.next))
const itemOf = (n: number) => DIAGNOSTIC[n]
const inst = (n: number, attempt = 0): Instance => instantiate(itemOf(n), checkSeed(PROFILE, itemOf(n).id), attempt)
const stored = (r: ReturnType<typeof renderRoutes>) => r.storage.load().state
const h2 = () => screen.getByRole('heading', { level: 2 })

function answer(i: Instance, right: boolean) {
  if (i.type === 'choice') fireEvent.click(screen.getByRole('radio', { name: i.options!.find((o) => o.correct === right)!.text }))
  else fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: String(right ? (i.answer as number) : (i.answer as number) + 100) } })
}
/** Answer all five questions; `rights[n]` says whether question n is answered correctly. */
function takeRound(rights: boolean[]) {
  for (let n = 0; n < 5; n++) {
    answer(inst(n), rights[n])
    next()
  }
}
function open(state = fresh()) {
  return renderRoutes(backendWith(state), '/module/C1/check')
}
const toFirstQuestion = () => {
  next()
  next()
}

let events: RouteEvent[] = []
let restore = () => {}
beforeEach(() => {
  events = []
  restore = setRouteEventSink((e) => events.push(e))
})
afterEach(() => restore())

describe('getting started screens', () => {
  it('how the app works, the conventions card from the module, then question 1', () => {
    open()
    expect(h2()).toHaveTextContent(diagnosticCopy.intro.heading)
    expect(screen.getByText(/private practice/i)).toBeInTheDocument()
    next()
    expect(h2()).toHaveTextContent(diagnosticCopy.conventions.heading)
    const w = conventionsWording()
    expect(screen.getByText(w.formula, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(w.heightRule, { exact: false })).toBeInTheDocument()
    next()
    expect(h2()).toHaveTextContent(diagnosticCopy.question(1, 5))
  })
  it('the skip control is on the first screen', () => {
    open()
    expect(btn(diagnosticCopy.skip)).toBeInTheDocument()
  })
})

describe('FR-DIA-01 questions one per screen, no feedback', () => {
  it('Next waits for an answer, shows no verdict, and the answers are stored with confidence', () => {
    const r = open()
    toFirstQuestion()
    expect(btn(diagnosticCopy.next)).toBeDisabled()
    fireEvent.click(btn(checkCopy.unsure))
    answer(inst(0), false)
    expect(btn(diagnosticCopy.next)).toBeEnabled()
    next()
    expect(h2()).toHaveTextContent(diagnosticCopy.question(2, 5))
    expect(screen.queryByRole('status', { name: checkCopy.feedbackLabel })).toBeNull()
    expect(screen.queryByText(checkCopy.verdict.notYet)).toBeNull()
    const a = stored(r).attempts
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ questionId: itemOf(0).id, correct: false, confidence: 'unsure', hintsUsed: 0 })
  })
  it('Back keeps the answers given', () => {
    open()
    toFirstQuestion()
    const first = inst(0)
    answer(first, true)
    next()
    answer(inst(1), true)
    next()
    fireEvent.click(btn(diagnosticCopy.back))
    fireEvent.click(btn(diagnosticCopy.back))
    expect(h2()).toHaveTextContent(diagnosticCopy.question(1, 5))
    if (first.type === 'choice') expect(screen.getByRole('radio', { name: first.options!.find((o) => o.correct)!.text })).toBeChecked()
    else expect(screen.getByRole('textbox', { name: checkCopy.numberLabel })).toHaveValue(String(first.answer))
  })
  it('a reload resumes at the next unanswered question', () => {
    const first = open()
    toFirstQuestion()
    answer(inst(0), true)
    next()
    first.unmount()
    renderRoutes(backendWith(stored(first)), '/module/C1/check')
    expect(h2()).toHaveTextContent(diagnosticCopy.question(2, 5))
  })
})

describe('FR-DIA-04 skipping', () => {
  it('skip mid-flow: path, current module, C1 not complete, answers kept, C2 shown', () => {
    const r = open()
    toFirstQuestion()
    answer(inst(0), true)
    next()
    fireEvent.click(btn(diagnosticCopy.skip))
    expect(stored(r)).toMatchObject({ path: 'diagnostic-skipped', currentModule: 'C2', completedModules: [] })
    expect(stored(r).attempts).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/^C2 /)
  })
})

describe('FR-DIA-02 FR-DIA-03 the result and the routes', () => {
  it('four right: C1 complete, C2 suggested, per-skill words, no total, refresher still linked', () => {
    const r = open()
    toFirstQuestion()
    takeRound([true, true, false, true, true])
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(screenCopy.headings.warmUpResult)
    expect(stored(r).completedModules).toEqual(['C1'])
    expect(stored(r).currentModule).toBe('C2')
    const main = screen.getByRole('main').textContent!
    expect(main).toContain(diagnosticCopy.status.secure)
    expect(main).toContain(diagnosticCopy.status.needsReview)
    expect(main).not.toMatch(/\d\s*\/\s*\d|%|\bof 5\b/)
    expect(screen.getByRole('link', { name: new RegExp(screenCopy.links.toRefresher) })).toHaveAttribute('href', '/module/C1/refresher')
    const suggested = screen.getAllByRole('link').find((l) => l.textContent!.includes(navigationCopy.suggestedWord))!
    expect(suggested.textContent).toMatch(/C2/)
  })
  it('three right: the refresher is suggested, C1 is not complete, C2 is still linked, events are emitted', () => {
    const r = open()
    toFirstQuestion()
    takeRound([true, false, false, true, true])
    expect(stored(r).completedModules).toEqual([])
    const suggested = screen.getAllByRole('link').find((l) => l.textContent!.includes(navigationCopy.suggestedWord))!
    expect(suggested.textContent).toMatch(/refresher/i)
    expect(screen.getAllByRole('link').some((l) => /C2/.test(l.textContent!))).toBe(true)
    expect(events.filter((e) => e.type === 'route_recommended')).toEqual([expect.objectContaining({ from: 'C1', recommended: 'C1' })])
    fireEvent.click(screen.getAllByRole('link').find((l) => /C2/.test(l.textContent!))!)
    expect(events.filter((e) => e.type === 'route_chosen')).toEqual([expect.objectContaining({ chosen: 'C2', recommended: 'C1' })])
  })
})

describe('the short re-check', () => {
  it('asks only the weak skills as new variants, then C1 completes and C2 is offered', () => {
    // search (index 3) and height (index 4) wrong; terms and insert right: route is the refresher.
    const first = open()
    toFirstQuestion()
    takeRound([true, true, true, false, false])
    first.unmount()
    const r = renderRoutes(backendWith(stored(first)), '/module/C1/check')
    expect(h2()).toHaveTextContent(diagnosticCopy.question(1, 2))
    expect(screen.getByText(inst(3, 1).stem)).toBeInTheDocument()
    answer(inst(3, 1), true)
    next()
    expect(screen.getByText(inst(4, 1).stem)).toBeInTheDocument()
    answer(inst(4, 1), false)
    next()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(screenCopy.headings.warmUpResult)
    expect(stored(r).completedModules).toEqual(['C1'])
    expect(screen.getAllByRole('link').some((l) => /C2/.test(l.textContent!))).toBe(true)
  })
  it('no re-check after a secure result: the check page goes to the result', () => {
    const first = open()
    toFirstQuestion()
    takeRound([true, true, true, true, true])
    first.unmount()
    renderRoutes(backendWith(stored(first)), '/module/C1/check')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(screenCopy.headings.warmUpResult)
  })
})

describe('the refresher screen', () => {
  it('has its own heading, offers skip on content steps and ends with C2 for a secure learner', () => {
    renderRoutes(backendWith(fresh()), '/module/C1/refresher')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('BST refresher')
    let sawSkip = false
    for (let i = 0; i < 10 && screen.queryByText(/^Step \d+ of \d+$/)?.textContent !== undefined; i++) {
      if (screen.queryByRole('button', { name: playerCopy.skip })) sawSkip = true
      const m = /Step (\d+) of (\d+)/.exec(screen.getByText(/^Step \d+ of \d+$/).textContent!)!
      if (m[1] === m[2]) break
      fireEvent.click(btn(playerCopy.next))
    }
    expect(sawSkip).toBe(true)
    expect(screen.getByRole('link', { name: new RegExp(`${diagnosticCopy.refresher.toC2}`) })).toBeInTheDocument()
  })
  it('ends with the re-check for a learner routed to the refresher', () => {
    const first = open()
    toFirstQuestion()
    takeRound([false, false, false, true, true])
    first.unmount()
    renderRoutes(backendWith(stored(first)), '/module/C1/refresher')
    for (let i = 0; i < 10; i++) {
      const m = /Step (\d+) of (\d+)/.exec(screen.getByText(/^Step \d+ of \d+$/).textContent!)!
      if (m[1] === m[2]) break
      fireEvent.click(btn(playerCopy.next))
    }
    expect(screen.getByRole('link', { name: diagnosticCopy.refresher.toRecheck })).toHaveAttribute('href', '/module/C1/check')
  })
})

describe('NFR-02 axe', () => {
  it('intro, conventions, a question and the result are axe clean', async () => {
    const r = open()
    expect(await axe(r.container)).toHaveNoViolations()
    next()
    expect(await axe(r.container)).toHaveNoViolations()
    next()
    expect(await axe(r.container)).toHaveNoViolations()
    takeRound([true, true, true, true, true])
    expect(await axe(r.container)).toHaveNoViolations()
  }, 60_000)
  it('the refresher is axe clean', async () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C1/refresher')
    expect(await axe(r.container)).toHaveNoViolations()
  }, 60_000)
})
