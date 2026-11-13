import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { afterEach, beforeEach, describe, it, expect } from 'vitest'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { playerSteps } from '../../src/modules/checkSteps'
import { stepsFor } from '../../src/modules/schema'
import { moduleLabel } from '../../src/content/modules'
import { navigationCopy } from '../../src/content/navigation'
import { playerCopy } from '../../src/content/modules/player'
import { screenCopy } from '../../src/content/screens'
import { setRouteEventSink, type RouteEvent } from '../../src/navigation/routeEvents'
import { LEARNER_KEY } from '../../src/state/storage'
import type { ModuleId } from '../../src/state/learnerState'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-module-framework / route-choice. Requirement IDs: D20, D23, D28, FR-LRN-04.

const h1 = () => screen.getByRole('heading', { level: 1 })
const main = () => screen.getByRole('main')
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(button(playerCopy.next))
const panel = () => screen.getByRole('heading', { level: 3, name: navigationCopy.whereNext }).closest('section')!
const noPanel = () => expect(screen.queryByRole('heading', { level: 3, name: navigationCopy.whereNext })).toBeNull()
const suggested = () => within(panel()).getByRole('button', { name: new RegExp(navigationCopy.suggestedWord) })
const lookAgain = (m: ModuleId) => within(panel()).getByRole('button', { name: navigationCopy.lookAgain(moduleLabel(m)) })

/** Open a module's Check activity and press Next until its last step. */
function lastCheckStep(m: ModuleId, path = `/module/${m}/check`, backend = backendWith()) {
  const r = renderRoutes(backend, path)
  const n = playerSteps(MODULE_CONTENT[m]!, 'check').length
  for (let i = 1; i < n; i++) next()
  expect(screen.getByText(playerCopy.stepOf(n, n))).toBeInTheDocument()
  return r
}

let events: RouteEvent[] = []
let restore: () => void = () => {}
beforeEach(() => {
  events = []
  restore = setRouteEventSink((e) => events.push(e))
})
afterEach(() => restore())

describe('D20 D23 where next panel', () => {
  it('shows on the last C2 Check step with the suggestion and look-over, and the strip keeps Back and Next', () => {
    lastCheckStep('C2')
    expect(suggested()).toHaveTextContent(moduleLabel('C3'))
    expect(suggested()).toHaveTextContent(navigationCopy.suggestedWord)
    expect(lookAgain('C2')).toBeInTheDocument()
    const strip = screen.getByRole('group', { name: playerCopy.stripLabel })
    expect(within(strip).getByRole('button', { name: playerCopy.back })).toBeInTheDocument()
    expect(within(strip).getByRole('button', { name: playerCopy.next })).toBeInTheDocument()
  })

  it('sits below the step text and above the control strip', () => {
    lastCheckStep('C2')
    const strip = screen.getByRole('group', { name: playerCopy.stripLabel })
    const h2 = screen.getByRole('heading', { level: 2 })
    expect(h2.compareDocumentPosition(panel()) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(panel().compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('is not on Explore, Worked example or the first Check step', () => {
    for (const a of ['explore', 'example'] as const) {
      const { unmount } = renderRoutes(backendWith(), `/module/C2/${a}`)
      const n = stepsFor(MODULE_CONTENT.C2!, a).length
      for (let i = 0; i < n; i++) {
        noPanel()
        if (i < n - 1) next()
      }
      unmount()
    }
    renderRoutes(backendWith(), '/module/C2/check')
    noPanel()
  })

  it('Next stays the only primary button', () => {
    lastCheckStep('C2')
    const primaries = main().querySelectorAll('.module-button-primary, .button-primary')
    expect(primaries).toHaveLength(1)
    expect(primaries[0]).toHaveTextContent(playerCopy.next)
    for (const b of within(panel()).getAllByRole('button')) expect(b).toHaveClass('module-button', 'module-button-secondary')
  })

  it('is axe clean on the last C2 and C3 Check steps, with 44 px buttons', async () => {
    for (const m of ['C2', 'C3'] as const) {
      const { container, unmount } = lastCheckStep(m)
      for (const b of within(panel()).getAllByRole('button')) expect(b).toHaveClass('module-button')
      expect(await axe(container), m).toHaveNoViolations()
      unmount()
    }
  })
})

describe('D20 FR-LRN-04 the student chooses the way on', () => {
  it('following the suggestion by keyboard opens C3 and changes no state', () => {
    const backend = backendWith()
    lastCheckStep('C2', undefined, backend)
    const before = backend.getItem(LEARNER_KEY)
    const b = suggested()
    b.focus()
    expect(b).toHaveFocus()
    fireEvent.click(b)
    expect(h1()).toHaveTextContent(moduleLabel('C3'))
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })

  it('looking over again opens C2 and changes no state', () => {
    const backend = backendWith()
    lastCheckStep('C2', undefined, backend)
    const before = backend.getItem(LEARNER_KEY)
    fireEvent.click(lookAgain('C2'))
    expect(h1()).toHaveTextContent(moduleLabel('C2'))
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })

  it('Next still goes to the path', () => {
    lastCheckStep('C2')
    next()
    expect(h1()).toHaveTextContent(screenCopy.hub.heading)
  })
})

describe('D28 route events are emitted', () => {
  const recs = () => events.filter((e) => e.type === 'route_recommended')
  const chosen = () => events.filter((e) => e.type === 'route_chosen')

  it('showing the panel logs one recommendation from C2 to C3', () => {
    lastCheckStep('C2')
    expect(recs()).toHaveLength(1)
    expect(recs()[0]).toMatchObject({ from: 'C2', recommended: 'C3' })
    expect(Number.isNaN(Date.parse(recs()[0].at))).toBe(false)
    expect(chosen()).toHaveLength(0)
  })

  it.each([
    ['the suggestion', () => fireEvent.click(suggested()), 'C3'],
    ['look over again', () => fireEvent.click(lookAgain('C2')), 'C2'],
    ['Next to the path', () => next(), 'path'],
  ] as const)('choosing %s logs one route_chosen', (_name, choose, target) => {
    lastCheckStep('C2')
    choose()
    expect(chosen()).toHaveLength(1)
    expect(chosen()[0]).toMatchObject({ from: 'C2', recommended: 'C3', chosen: target })
    expect(Number.isNaN(Date.parse(chosen()[0].at))).toBe(false)
  })

  it('stepping through C2 Explore and Worked example logs nothing', () => {
    for (const a of ['explore', 'example'] as const) {
      const { unmount } = renderRoutes(backendWith(), `/module/C2/${a}`)
      const n = stepsFor(MODULE_CONTENT.C2!, a).length
      for (let i = 0; i < n - 1; i++) next()
      unmount()
    }
    expect(events).toEqual([])
  })
})
