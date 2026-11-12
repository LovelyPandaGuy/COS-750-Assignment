import { fireEvent, render, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { STRUCTURE_IDS, answersOf, reasonOf, type Scenario, type StructureId } from '../../src/modules/compare'
import { NEEDS, SCENARIOS, STRUCTURES } from '../../src/content/modules/structures'
import { computeFacts } from '../../src/modules/facts'
import { stepsFor } from '../../src/modules/schema'
import { playerCopy } from '../../src/content/modules/player'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { screenCopy } from '../../src/content/screens'
import { ArrayView } from '../../src/ui/module/ArrayView'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-module-c8-choosing / structure-comparison and module-c8-choosing.
// Requirement IDs: FR-LRN-02, FR-LRN-04, FR-LRN-05, FR-ASM-03 (in part), NFR-02, D3, D17, D20, D21, D27. Outcomes: LO9, LO5.

const c8 = () => MODULE_CONTENT.C8!
const copy = practiceModuleCopy.scenario
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(button(playerCopy.next))
const back = () => fireEvent.click(button(playerCopy.back))
const headingOf = (id: string) => c8().steps.find((s) => s.id === id)!.heading
const status = () => screen.getByRole('status')
const group = () => screen.getByRole('group', { name: copy.legend })
const radios = () => within(group()).getAllByRole('radio') as HTMLInputElement[]
const radioFor = (s: StructureId) => within(group()).getByRole('radio', { name: STRUCTURES[s].name }) as HTMLInputElement

function goTo(heading: string) {
  for (let i = 0; i < 20 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}

function openPractice(id: 'c8-practice-1' | 'c8-practice-2' = 'c8-practice-1') {
  const r = renderRoutes(backendWith(), '/module/C8/example')
  goTo(headingOf(id))
  return r
}

/** The scenario on screen, found by its text. */
function shownScenario(): Scenario {
  const found = Object.values(SCENARIOS).filter((sc) => screen.queryByText(sc.text) !== null)
  expect(found).toHaveLength(1)
  return found[0]
}

const answerOf = (sc: Scenario) => answersOf(sc)[0]
const notAnswer = (sc: Scenario) => STRUCTURE_IDS.find((s) => s !== answerOf(sc))!

function choose(s: StructureId) {
  fireEvent.click(radioFor(s))
}
const check = () => fireEvent.click(button(practiceModuleCopy.check))

describe('LO9 C8 plays instead of the skeleton', () => {
  it('Explore shows the step player', () => {
    renderRoutes(backendWith(), '/module/C8/explore')
    expect(screen.getByText(`Step 1 of ${stepsFor(c8(), 'explore').length}`)).toBeInTheDocument()
    expect(screen.queryByText(screenCopy.coming)).toBeNull()
  })

  it('Check: the coming line, then the summary; nothing completed', () => {
    const { storage } = renderRoutes(backendWith(), '/module/C8/check')
    expect(screen.getByText(screenCopy.coming)).toBeInTheDocument()
    next()
    expect(h2()).toHaveTextContent(headingOf('c8-summary'))
    expect(storage.load().state.completedModules).toEqual([])
  })
})

describe('LO5 sorted array drawing', () => {
  it('probes 40, 60, 70 are numbered in text; other cells are not', () => {
    render(<ArrayView keys={[10, 20, 30, 40, 50, 60, 70]} probes={[40, 60, 70]} label="Sorted array 10 to 70" />)
    const region = screen.getByRole('region', { name: 'Sorted array 10 to 70' })
    const cells = within(region).getAllByRole('listitem')
    expect(cells).toHaveLength(7)
    const probeText = (k: number) => cells.find((c) => c.getAttribute('data-key') === String(k))!.textContent ?? ''
    expect(probeText(40)).toMatch(/probe 1/i)
    expect(probeText(60)).toMatch(/probe 2/i)
    expect(probeText(70)).toMatch(/probe 3/i)
    for (const k of [10, 20, 30, 50]) expect(probeText(k)).not.toMatch(/probe/i)
  })

  it('the C8 array step shows the facts and passes axe', async () => {
    renderRoutes(backendWith(), '/module/C8/explore')
    goTo(headingOf('c8-array'))
    const spec = c8().steps.find((s) => s.id === 'c8-array')!.arrays![0]
    const f = computeFacts(c8().steps.find((s) => s.id === 'c8-array')!).arrays[spec.id]
    const region = screen.getByRole('region', { name: spec.label })
    expect(within(region).getAllByText(/probe \d+/i)).toHaveLength(f.probeCount)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('LO9 comparison table', () => {
  it('four rows from the record with row and column headers; Show the rule reveals the summary', async () => {
    renderRoutes(backendWith(), '/module/C8/explore')
    goTo(headingOf('c8-compare'))
    const table = screen.getByRole('table')
    const rows = within(table).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(4)
    expect(within(table).getAllByRole('columnheader').length).toBeGreaterThanOrEqual(5)
    for (const id of STRUCTURE_IDS) {
      const s = STRUCTURES[id]
      const row = within(table).getByRole('rowheader', { name: s.name }).closest('tr')!
      const cells = within(row).getAllByRole('cell').map((c) => c.textContent)
      expect(cells, id).toEqual([s.search.typical, s.search.worst, s.insert.typical, s.insert.worst, s.inOrder ? 'yes' : 'no'])
    }
    const show = button(playerCopy.showRule)
    fireEvent.click(show)
    expect(show).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(show.getAttribute('aria-controls')!)!
    expect(panel).toBeVisible()
    for (const id of STRUCTURE_IDS) expect(panel.textContent).toContain(STRUCTURES[id].name)
    expect(await axe(document.body)).toHaveNoViolations()
  })
})

describe('LO9 scenario practice step', () => {
  it('shows one scenario and four structures as radios; no skip', () => {
    openPractice()
    shownScenario()
    expect(radios().map((r) => r.labels?.[0]?.textContent).sort()).toEqual(STRUCTURE_IDS.map((s) => STRUCTURES[s].name).sort())
    expect(screen.queryByRole('button', { name: playerCopy.skip })).toBeNull()
  })

  it('Check with nothing chosen asks calmly and gives no verdict', () => {
    openPractice()
    check()
    expect(status().textContent).toContain(copy.choose)
    expect(status().textContent).not.toMatch(/That's right|Not quite yet/)
  })

  it('keyboard only: one native radio group, Enter in the form checks, focus moves to the feedback', () => {
    openPractice()
    const names = new Set(radios().map((r) => r.name))
    expect(names.size).toBe(1) // one name: the browser moves the choice with the arrow keys
    const chosen = radios()[1]
    chosen.focus()
    fireEvent.click(chosen) // Space on a focused radio
    fireEvent.submit(chosen.form!) // Enter in the form
    expect(status().textContent).toMatch(/^(That's right|Not quite yet)/)
    expect(document.activeElement?.contains(status())).toBe(true)
    expect(chosen.checked).toBe(true)
  })

  it('focus stays on the option after Check twice with nothing chosen, then a choice', () => {
    openPractice()
    check()
    check()
    const r = radios()[2]
    r.focus()
    fireEvent.click(r)
    expect(document.activeElement).toBe(r)
  })

  it('Try again returns focus to the chosen option', () => {
    openPractice()
    const sc = shownScenario()
    choose(notAnswer(sc))
    check()
    fireEvent.click(within(status()).getByRole('button', { name: practiceModuleCopy.tryAgain }))
    expect(document.activeElement).toBe(radioFor(notAnswer(sc)))
  })

  it('Not quite yet names a need the choice does not meet, and offers Try again and Review', () => {
    openPractice()
    const sc = shownScenario()
    const pick = notAnswer(sc)
    choose(pick)
    check()
    const t = status().textContent ?? ''
    expect(t).toMatch(/^Not quite yet/)
    expect(t).toContain(NEEDS[reasonOf(sc, pick)!].unmet(STRUCTURES[pick].name))
    expect(within(status()).getByRole('button', { name: practiceModuleCopy.tryAgain })).toBeInTheDocument()
    expect(within(status()).getByRole('button', { name: practiceModuleCopy.review })).toBeInTheDocument()
    expect(t).not.toMatch(/wrong|incorrect|fail|✗/i)
  })

  it("That's right names every need of the scenario", () => {
    openPractice()
    const sc = shownScenario()
    choose(answerOf(sc))
    check()
    const t = status().textContent ?? ''
    expect(t).toMatch(/^That's right/)
    for (const n of sc.needs) expect(t).toContain(NEEDS[n].label)
  })

  it('a hash table choice for an in-order scenario says it does not keep keys in order', () => {
    openPractice()
    for (let i = 0; i < 20 && !shownScenario().needs.includes('in-order'); i++) fireEvent.click(button(copy.newScenario))
    const sc = shownScenario()
    expect(sc.needs).toContain('in-order')
    choose('hash-table')
    check()
    expect(status().textContent).toContain(NEEDS[reasonOf(sc, 'hash-table')!].unmet(STRUCTURES['hash-table'].name))
  })
})

describe('D21 scenario practice hints and new scenario', () => {
  it('hints count down, the nudge lists the needs, the fuller hint names each structure ruled out, then review', () => {
    openPractice()
    const sc = shownScenario()
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(playerCopy.hint(1)))
    expect(screen.queryByRole('button', { name: /^hint/i })).toBeNull()
    expect(button(playerCopy.reviewRule)).toBeInTheDocument()
    const hints = within(screen.getByRole('list', { name: practiceModuleCopy.hintsLabel })).getAllByRole('listitem')
    expect(hints).toHaveLength(2)
    for (const n of sc.needs) expect(hints[0].textContent).toContain(NEEDS[n].label)
    for (const s of STRUCTURE_IDS.filter((x) => x !== answerOf(sc))) expect(hints[1].textContent).toContain(STRUCTURES[s].name)
  })

  it('New scenario changes the scenario and resets the choice, feedback and hints', () => {
    openPractice()
    const before = shownScenario()
    choose(notAnswer(before))
    check()
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(copy.newScenario))
    expect(shownScenario().id).not.toBe(before.id)
    expect(radios().every((r) => !r.checked)).toBe(true)
    expect(status().textContent ?? '').not.toMatch(/That's right|Not quite yet/)
    expect(button(playerCopy.hint(2))).toBeInTheDocument()
  })

  it('nothing is stored', () => {
    const { storage } = openPractice()
    const stored = JSON.stringify(storage.load().state)
    const sc = shownScenario()
    choose(notAnswer(sc))
    check()
    choose(answerOf(sc))
    check()
    fireEvent.click(button(playerCopy.hint(2)))
    expect(JSON.stringify(storage.load().state)).toBe(stored)
  })
})

describe('FR-LRN-04 going back keeps a scenario answer', () => {
  it('Back then Next shows the same scenario, choice, feedback and hints left', () => {
    openPractice('c8-practice-2')
    const sc = shownScenario()
    const order = radios().map((r) => r.value)
    const pick = notAnswer(sc)
    choose(pick)
    check()
    fireEvent.click(button(playerCopy.hint(2)))
    const feedback = status().textContent
    back()
    next()
    expect(h2()).toHaveTextContent(headingOf('c8-practice-2'))
    expect(shownScenario().id).toBe(sc.id)
    expect(radios().map((r) => r.value)).toEqual(order)
    expect(radioFor(pick).checked).toBe(true)
    expect(status().textContent).toBe(feedback)
    expect(button(playerCopy.hint(1))).toBeInTheDocument()
  })
})

describe('NFR-02 C8 accessibility', () => {
  it('axe is clean on every C8 step', async () => {
    for (const activity of ['explore', 'example', 'check'] as const) {
      const { unmount } = renderRoutes(backendWith(), `/module/C8/${activity}`)
      const n = stepsFor(c8(), activity).length
      for (let i = 0; i < n; i++) {
        expect(await axe(document.body), `C8 ${activity} ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) next()
      }
      unmount()
    }
  }, 60_000)

  it('option labels are at least the 44 px target class', () => {
    openPractice()
    for (const r of radios()) expect(r.closest('label')?.className ?? '').toMatch(/scenario-option/)
  })
})
