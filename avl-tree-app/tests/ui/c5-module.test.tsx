import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { stepsFor } from '../../src/modules/schema'
import { playerCopy } from '../../src/content/modules/player'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { screenCopy } from '../../src/content/screens'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-modules-c5-c6 / module-practice-steps and module-c5-rotations.
// Requirement IDs: FR-LRN-04, FR-VIS-06, FR-VIS-10, NFR-02, D21, D27. Outcome: LO6.

const c5 = () => MODULE_CONTENT.C5!
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(button(playerCopy.next))
const back = () => fireEvent.click(button(playerCopy.back))
const headingOf = (id: string) => c5().steps.find((s) => s.id === id)!.heading
const items = () => screen.getAllByRole('treeitem')
const name = (el: Element) => el.getAttribute('aria-label') ?? ''
const feedback = () => screen.getByRole('status', { name: /feedback/i })
const undoButton = () => button(/undo/i)
/** Do it yourself feedback opens with an icon, then the word (practice copy, feedback). */
const BALANCED = /^\W*Balanced\b/

function goTo(heading: string) {
  for (let i = 0; i < 20 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}

function openPractice(id: 'c5-practice-single' | 'c5-practice-double') {
  const r = renderRoutes(backendWith(), '/module/C5/example')
  goTo(headingOf(id))
  return r
}

/** The lowest node whose balance factor is out of range, read from the accessible names. */
function lowestUnbalanced(): HTMLElement {
  const out = items().filter((el) => /unbalanced/i.test(name(el)))
  expect(out.length).toBeGreaterThan(0)
  return out.reduce((a, b) => (Number(b.getAttribute('aria-level')) > Number(a.getAttribute('aria-level')) ? b : a))
}

/** Select a node by keyboard and press a rotation key; returns the feedback text. */
function rotateByKey(el: HTMLElement, key: 'r' | 'l'): string {
  el.focus()
  fireEvent.keyDown(el, { key: 'Enter' })
  fireEvent.keyDown(document.activeElement ?? el, { key })
  return feedback().textContent ?? ''
}

/** Make one rotation that changes the tree (tries R, then L). */
function rotateOnce() {
  const z = lowestUnbalanced()
  if (/has no/i.test(rotateByKey(z, 'r'))) rotateByKey(lowestUnbalanced(), 'l')
}

const shape = () => items().map((el) => `${el.getAttribute('data-key')}@${el.getAttribute('aria-level')}`).join(',')

describe('LO6 C5 plays instead of the skeleton', () => {
  it('Explore shows the step player', () => {
    renderRoutes(backendWith(), '/module/C5/explore')
    expect(screen.getByText(`Step 1 of ${stepsFor(c5(), 'explore').length}`)).toBeInTheDocument()
    expect(screen.queryByText(screenCopy.coming)).toBeNull()
  })
})

describe('FR-VIS-06 rotation practice step', () => {
  it('opens on the unbalanced tree with the inserted node marked new', () => {
    openPractice('c5-practice-single')
    expect(items().some((el) => /unbalanced/i.test(name(el)))).toBe(true)
    expect(items().filter((el) => /\bnew\b/i.test(name(el)))).toHaveLength(1)
  })

  it('keyboard only: rotate at the unbalanced node to balanced, in-order unchanged', () => {
    openPractice('c5-practice-single')
    const order = () => Array.from(screen.getAllByRole('list', { name: /in-order/i })[0].querySelectorAll('li')).map((li) => li.textContent)
    const before = order()
    let text = rotateByKey(lowestUnbalanced(), 'r')
    if (!BALANCED.test(text)) {
      fireEvent.keyDown(document.activeElement ?? document.body, { key: 'z', ctrlKey: true })
      text = rotateByKey(lowestUnbalanced(), 'l')
    }
    expect(text).toMatch(BALANCED)
    expect(order()).toEqual(before)
  })

  it('New tree gives a different problem with no rotations and resets hints', () => {
    openPractice('c5-practice-double')
    fireEvent.click(button(playerCopy.hint(2)))
    rotateOnce()
    expect(undoButton()).toBeEnabled()
    const before = shape()
    fireEvent.click(button(practiceModuleCopy.newTree))
    expect(shape()).not.toBe(before)
    expect(undoButton()).toBeDisabled()
    expect(button(playerCopy.hint(2))).toBeInTheDocument()
  })

  it('nothing is stored', () => {
    const { storage } = openPractice('c5-practice-single')
    const stored = JSON.stringify(storage.load().state)
    rotateOnce()
    fireEvent.click(undoButton())
    fireEvent.click(button(playerCopy.hint(2)))
    expect(JSON.stringify(storage.load().state)).toBe(stored)
  })
})

describe('D21 rotation practice hints', () => {
  it('hints count down, then review the rule', () => {
    openPractice('c5-practice-double')
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(playerCopy.hint(1)))
    expect(screen.queryByRole('button', { name: /^hint/i })).toBeNull()
    expect(button(playerCopy.reviewRule)).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: practiceModuleCopy.hintsLabel })).getAllByRole('listitem')).toHaveLength(2)
  })
})

describe('FR-LRN-04 going back keeps rotation practice', () => {
  it('Back then Next shows the rotated tree with Undo available', () => {
    openPractice('c5-practice-single')
    rotateOnce()
    const after = shape()
    back()
    next()
    expect(h2()).toHaveTextContent(headingOf('c5-practice-single'))
    expect(shape()).toBe(after)
    expect(undoButton()).toBeEnabled()
  })
})

describe('NFR-02 C5 accessibility', () => {
  it('axe is clean on every C5 step', async () => {
    for (const activity of ['explore', 'example', 'check'] as const) {
      const { unmount } = renderRoutes(backendWith(), `/module/C5/${activity}`)
      const n = stepsFor(c5(), activity).length
      for (let i = 0; i < n; i++) {
        expect(await axe(document.body), `C5 ${activity} ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) next()
      }
      unmount()
    }
  }, 60_000)
})
