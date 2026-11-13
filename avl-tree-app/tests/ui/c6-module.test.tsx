import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { REBALANCE_CASES } from '../../src/engine/conventions'
import type { Key, Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { caseProblem } from '../../src/modules/casePractice'
import { stepsFor } from '../../src/modules/schema'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { playerCopy } from '../../src/content/modules/player'
import { navigationCopy } from '../../src/content/navigation'
import { practiceCopy } from '../../src/content/practice'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { replayCopy } from '../../src/content/replay'
import { screenCopy } from '../../src/content/screens'
import { LEARNER_KEY } from '../../src/state/storage'
import { NameTheCase } from '../../src/ui/module/practice/NameTheCase'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-module-c6-insertion-and-rebalancing / module-c6-insertion. Requirement IDs: LO7, D3, D19, D21, D27, FR-LRN-04, FR-VIS-05, FR-VIS-06, NFR-02.

const copy = practiceModuleCopy.nameCase
const w = conventionsWording()
const c6 = MODULE_CONTENT.C6!
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
// The replay has its own Back button, so the player's Next and Back are found in the step strip.
const strip = () => within(screen.getByRole('group', { name: playerCopy.stripLabel }))
const next = () => fireEvent.click(strip().getByRole('button', { name: playerCopy.next }))
const back = () => fireEvent.click(strip().getByRole('button', { name: playerCopy.back }))
const headingOf = (id: string) => c6.steps.find((s) => s.id === id)!.heading
function goTo(heading: string) {
  for (let i = 0; i < 20 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}
// Once the case is right the rotation tool shows its own status region, so look inside the naming widget.
const status = () => within(document.querySelector('.name-case') as HTMLElement).getByRole('status')
const radio = (c: string) => screen.getByRole('radio', { name: c }) as HTMLInputElement
const check = () => button(practiceModuleCopy.check)
const toolHeading = () => screen.queryByRole('heading', { level: 3, name: practiceCopy.practice.heading })
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

/** Choose each case in turn and Check until the feedback says it is right (retries are free, D21). */
function solveByTrying() {
  for (const c of REBALANCE_CASES) {
    fireEvent.click(radio(w.caseName(c)))
    fireEvent.click(check())
    if (status().textContent?.startsWith("That's right")) return
  }
  throw new Error('no case was right')
}
const openPractice = (backend = backendWith()) => {
  const r = renderRoutes(backend, '/module/C6/example')
  goTo(headingOf('c6-practice'))
  return r
}

const PROBLEM = caseProblem(avl([30, 20]), 10)
function Practice({ hintsUsed = 0, onNewTree = () => {} }: { hintsUsed?: number; onNewTree?: () => void }) {
  const [solved, setSolved] = useState(false)
  return <NameTheCase problem={PROBLEM} solved={solved} onSolved={() => setSolved(true)} hintsUsed={hintsUsed} onReview={() => {}} onNewTree={onNewTree} />
}

describe('ID C6 the insert outline', () => {
  it('shows the five insert lines in the pseudocode panel with none lit', () => {
    renderRoutes(backendWith(), '/module/C6/explore')
    goTo(headingOf('c6-outline'))
    const panel = screen.getByRole('region', { name: replayCopy.panel.title(replayCopy.panel.insert) })
    expect(within(panel).getAllByRole('listitem')).toHaveLength(5)
    expect(document.querySelectorAll('.pseudo-line[aria-current]')).toHaveLength(0)
  })
})

describe('FR-VIS-05 FR-VIS-06 the worked examples fade', () => {
  it('done for you: a replay with no prompt and no switch', () => {
    renderRoutes(backendWith(), '/module/C6/example')
    expect(screen.getByRole('group', { name: replayCopy.controls.label })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 3, name: practiceCopy.predict.heading })).toBeNull()
    expect(screen.queryByRole('radio', { name: practiceCopy.mode.watch })).toBeNull()
  })

  it('guided by node: the prompt shows and the replay is held', () => {
    renderRoutes(backendWith(), '/module/C6/example')
    goTo(headingOf('c6-example-node'))
    expect(screen.getByRole('heading', { level: 3, name: practiceCopy.predict.heading })).toBeInTheDocument()
    expect(button(replayCopy.controls.step)).toBeDisabled()
  })

  it('guided by case: the prompt and the Watch or Do it yourself switch', () => {
    renderRoutes(backendWith(), '/module/C6/example')
    goTo(headingOf('c6-example-case'))
    expect(screen.getByRole('heading', { level: 3, name: practiceCopy.predict.heading })).toBeInTheDocument()
    expect((screen.getByRole('radio', { name: practiceCopy.mode.watch }) as HTMLInputElement).checked).toBe(true)
  })
})

describe('LO7 D19 name the case', () => {
  it('shows the tree with balance factors and the four cases named by the wording', () => {
    render(<Practice />)
    expect(document.querySelector('.tree-flag')).not.toBeNull()
    const group = screen.getByRole('group', { name: copy.groupLabel })
    for (const c of REBALANCE_CASES) expect(within(group).getByRole('radio', { name: w.caseName(c) })).toBeInTheDocument()
    expect(screen.getByText(copy.question)).toBeInTheDocument()
  })

  it('Check waits for a choice', () => {
    render(<Practice />)
    expect(check()).toBeDisabled()
    fireEvent.click(radio(w.caseName(REBALANCE_CASES[0])))
    expect(check()).not.toBeDisabled()
  })

  it('the engine\'s case is right: That\'s right, naming the case through the wording', () => {
    render(<Practice />)
    fireEvent.click(radio(w.caseName(PROBLEM.answer)))
    fireEvent.click(check())
    expect(status().textContent).toMatch(/^That's right/)
    expect(status().textContent).toContain(w.caseName(PROBLEM.answer))
  })

  it('another case is Not quite yet, with the nodes and balance factors but not the case', () => {
    render(<Practice />)
    fireEvent.click(radio(w.caseName(REBALANCE_CASES.find((c) => c !== PROBLEM.answer)!)))
    fireEvent.click(check())
    const text = status().textContent ?? ''
    expect(text).toMatch(/^Not quite yet/)
    expect(text).toContain(String(PROBLEM.z))
    expect(text).toContain(String(PROBLEM.y))
    expect(text).not.toContain(w.caseName(PROBLEM.answer))
    expect(text).not.toMatch(/\b(wrong|fail\w*)\b|✗/i)
  })

  it('keyboard only: a radio and the Check button take focus and work', () => {
    render(<Practice />)
    const r = radio(w.caseName(PROBLEM.answer))
    r.focus()
    expect(r).toHaveFocus()
    fireEvent.click(r)
    const b = check()
    b.focus()
    expect(b).toHaveFocus()
    fireEvent.click(b)
    expect(status().textContent).toMatch(/^That's right/)
  })

  it('hints: one, then two', () => {
    const { rerender } = render(<Practice hintsUsed={1} />)
    const hints = () => within(screen.getByRole('list', { name: practiceModuleCopy.hintsLabel })).getAllByRole('listitem')
    expect(hints()).toHaveLength(1)
    rerender(<Practice hintsUsed={2} />)
    expect(hints()).toHaveLength(2)
  })

  it('New tree before solving asks the parent for a new problem', () => {
    let calls = 0
    render(<Practice onNewTree={() => calls++} />)
    fireEvent.click(button(practiceModuleCopy.newTree))
    expect(calls).toBe(1)
  })
})

describe('LO7 name the case, then rotate, in the player', () => {
  it('the rotation tool is absent until the case is right, then shows for the same problem', () => {
    openPractice()
    expect(toolHeading()).toBeNull()
    solveByTrying()
    expect(toolHeading()).toBeInTheDocument()
  })

  it('a wrong case leaves the tool hidden', () => {
    openPractice()
    // Choose cases until one is not yet; at most three of the four are wrong, so this always ends.
    for (const c of REBALANCE_CASES) {
      fireEvent.click(radio(w.caseName(c)))
      fireEvent.click(check())
      if (status().textContent?.startsWith('Not quite yet')) break
    }
    expect(status().textContent).toMatch(/^Not quite yet/)
    expect(toolHeading()).toBeNull()
  })

  it('New tree after solving returns to naming, with nothing chosen and the tool hidden', () => {
    openPractice()
    solveByTrying()
    fireEvent.click(button(practiceModuleCopy.newTree))
    expect(toolHeading()).toBeNull()
    for (const c of REBALANCE_CASES) expect(radio(w.caseName(c)).checked).toBe(false)
  })

  it('Back then Next keeps the practice: the tool is still there for the same tree', () => {
    openPractice()
    solveByTrying()
    const keys = () => screen.getAllByRole('treeitem').map((el) => el.getAttribute('data-key'))
    const before = keys()
    back()
    next()
    expect(toolHeading()).toBeInTheDocument()
    expect(keys()).toEqual(before)
  })

  it('hints count down, then review; nothing is stored', () => {
    const backend = backendWith()
    openPractice(backend)
    const stored = backend.getItem(LEARNER_KEY)
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(playerCopy.hint(1)))
    expect(screen.queryByRole('button', { name: /^Hint/ })).toBeNull()
    expect(button(playerCopy.reviewRule)).toBeInTheDocument()
    solveByTrying()
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })
})

describe('D42 the check on the last step', () => {
  it('Check: the questions, then the summary with Where next; nothing completed unanswered', () => {
    const { storage } = renderRoutes(backendWith(), '/module/C6/check')
    expect(screen.queryByText(screenCopy.coming)).toBeNull()
    next()
    next()
    next()
    next()
    expect(h2()).toHaveTextContent(headingOf('c6-summary'))
    expect(screen.getByRole('heading', { level: 3, name: navigationCopy.whereNext })).toBeInTheDocument()
    expect(storage.load().state.completedModules).toEqual([])
  })
})

describe('NFR-02 axe on every C6 step', () => {
  it('every Explore, Worked example and Check step is axe clean', async () => {
    for (const a of ['explore', 'example', 'check'] as const) {
      const { container, unmount } = renderRoutes(backendWith(), `/module/C6/${a}`)
      const n = stepsFor(c6, a).length
      for (let i = 0; i < n; i++) {
        expect(await axe(container), `${a} step ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) next()
      }
      unmount()
    }
  }, 120_000)

  it('the practice is axe clean unsolved and solved', async () => {
    const { container } = openPractice()
    expect(await axe(container), 'unsolved').toHaveNoViolations()
    solveByTrying()
    expect(await axe(container), 'solved').toHaveNoViolations()
  }, 60_000)
})
