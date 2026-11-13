import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { searchTrace } from '../../src/engine/search'
import type { Key, Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { stepsFor } from '../../src/modules/schema'
import { playerCopy } from '../../src/content/modules/player'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { replayCopy } from '../../src/content/replay'
import { LEARNER_KEY } from '../../src/state/storage'
import { BeTheAlgorithm } from '../../src/ui/module/practice/BeTheAlgorithm'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-module-c4-search / module-c4-search and the module-framework delta.
// Requirement IDs: LO4, LO5, FR-VIS-03, FR-VIS-04, FR-LRN-04, D3, D21, D22, D27, D33.

const copy = practiceModuleCopy.search
const c4 = MODULE_CONTENT.C4!
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(button(playerCopy.next))
const back = () => fireEvent.click(button(playerCopy.back))
const headingOf = (id: string) => c4.steps.find((s) => s.id === id)!.heading
function goTo(heading: string) {
  for (let i = 0; i < 20 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}
const panel = (name: string) => screen.getByRole('region', { name: replayCopy.panel.title(name) })
const counter = () => screen.getByText(/^Step \d+ \/ \d+$/).textContent

const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const T = avl([50, 30, 70, 20, 40, 60, 80])
const node = (key: Key) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${key}\\b`) })
const status = () => screen.getByRole('status')
const currentLine = () => document.querySelector('.pseudo-line[aria-current="step"] .pseudo-number')?.textContent ?? null
const compareLine = (tree: Tree, key: Key, at: Key) =>
  String(searchTrace(tree, key).trace.find((s) => s.kind === 'compare' && s.nodes[0] === at)!.pseudocodeLine)

function Practice({ tree = T, searchKey, hintsUsed = 0 }: { tree?: Tree; searchKey: Key; hintsUsed?: number }) {
  const [path, setPath] = useState<Key[]>([])
  const [solved, setSolved] = useState(false)
  return (
    <BeTheAlgorithm
      tree={tree}
      searchKey={searchKey}
      path={path}
      onPath={setPath}
      solved={solved}
      onSolved={() => setSolved(true)}
      hintsUsed={hintsUsed}
      onReview={() => {}}
      onNewTree={() => {}}
    />
  )
}

describe('D22 D33 FR-VIS-03 a step can play a search as a replay', () => {
  it('the algorithm step shows the replay, its tree once and the loop pseudocode', () => {
    renderRoutes(backendWith(), '/module/C4/explore')
    goTo(headingOf('c4-algorithm'))
    expect(screen.getByRole('group', { name: replayCopy.controls.label })).toBeInTheDocument()
    expect(panel(replayCopy.panel.searchLoop)).toBeInTheDocument()
    const step = c4.steps.find((s) => s.id === 'c4-algorithm')!
    const label = step.figures!.find((f) => f.id === step.replay!.figure)!.label
    expect(screen.getAllByRole('region', { name: label })).toHaveLength(1)
  })

  it('the replay starts again after Next then Back', () => {
    renderRoutes(backendWith(), '/module/C4/explore')
    goTo(headingOf('c4-algorithm'))
    fireEvent.click(button(replayCopy.controls.step))
    fireEvent.click(button(replayCopy.controls.step))
    expect(counter()).toMatch(/^Step 2 \//)
    next()
    back()
    expect(counter()).toMatch(/^Step 0 \//)
  })
})

describe('AL-Strategies 3 listings side by side', () => {
  it('loop then recursive, named, with no line lit', () => {
    renderRoutes(backendWith(), '/module/C4/explore')
    goTo(headingOf('c4-versions'))
    const loop = panel(replayCopy.panel.searchLoop)
    const rec = panel(replayCopy.panel.searchRecursive)
    expect(loop.compareDocumentPosition(rec) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(document.querySelectorAll('.pseudo-line[aria-current]')).toHaveLength(0)
    expect(loop.closest('.module-listings')).not.toBeNull()
  })
})

describe('LO4 be the algorithm', () => {
  it('a right pick moves the trace on, adds the key to the visited path and lights the line', () => {
    render(<Practice searchKey={40} />)
    expect(screen.getByText(copy.find(40))).toBeInTheDocument()
    fireEvent.click(node(50))
    expect(screen.getByText(copy.visited([50]))).toBeInTheDocument()
    expect(currentLine()).toBe(compareLine(T, 40, 50))
    fireEvent.click(node(30))
    expect(screen.getByText(copy.visited([50, 30]))).toBeInTheDocument()
    expect(currentLine()).toBe(compareLine(T, 40, 30))
  })

  it('found: every node on the path ends the practice with the engine step count', () => {
    render(<Practice searchKey={40} />)
    for (const k of [50, 30, 40]) fireEvent.click(node(k))
    expect(status().textContent).toMatch(/^That's right/)
    expect(status()).toHaveTextContent(copy.foundDone(40, searchTrace(T, 40).steps))
  })

  it('not found: the path, then "Not in the tree"', () => {
    render(<Practice searchKey={45} />)
    for (const k of [50, 30, 40]) fireEvent.click(node(k))
    fireEvent.click(button(copy.notInTree))
    expect(status()).toHaveTextContent(copy.missingDone(45, searchTrace(T, 45).steps))
  })

  it('keyboard only: Enter picks, arrows move, the button is reachable', () => {
    render(<Practice searchKey={45} />)
    const root = node(50)
    root.focus()
    fireEvent.keyDown(root, { key: 'Enter' })
    fireEvent.keyDown(document.activeElement!, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(node(30))
    fireEvent.keyDown(node(30), { key: 'Enter' })
    fireEvent.keyDown(node(30), { key: 'ArrowRight' })
    fireEvent.keyDown(node(40), { key: 'Enter' })
    expect(screen.getByText(copy.visited([50, 30, 40]))).toBeInTheDocument()
    const b = button(copy.notInTree)
    b.focus()
    expect(b).toHaveFocus()
    fireEvent.click(b)
    expect(status().textContent).toMatch(/^That's right/)
  })
})

describe('D21 D27 be the algorithm feedback and hints', () => {
  it('a wrong pick does not move the trace and says Not quite yet, naming smaller', () => {
    render(<Practice searchKey={40} />)
    fireEvent.click(node(50))
    fireEvent.click(node(70))
    expect(status().textContent).toMatch(/^Not quite yet/)
    expect(status().textContent).toMatch(/smaller/)
    expect(screen.getByText(copy.visited([50]))).toBeInTheDocument()
    expect(within(status()).getByRole('button', { name: practiceModuleCopy.review })).toBeInTheDocument()
  })

  it('"Not in the tree" too early is Not quite yet and changes nothing', () => {
    render(<Practice searchKey={45} />)
    fireEvent.click(node(50))
    fireEvent.click(button(copy.notInTree))
    expect(status().textContent).toMatch(/^Not quite yet/)
    expect(screen.getByText(copy.visited([50]))).toBeInTheDocument()
  })

  it('hints: nudge first, then the direction', () => {
    const { rerender } = render(<Practice searchKey={40} hintsUsed={1} />)
    const hints = () => within(screen.getByRole('list', { name: practiceModuleCopy.hintsLabel })).getAllByRole('listitem')
    expect(hints()).toHaveLength(1)
    rerender(<Practice searchKey={40} hintsUsed={2} />)
    expect(hints()).toHaveLength(2)
  })

  it('in the player: Hint counts down, then review is offered; nothing is stored', () => {
    const backend = backendWith()
    renderRoutes(backend, '/module/C4/example')
    const before = backend.getItem(LEARNER_KEY)
    goTo(headingOf('c4-practice-found'))
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(playerCopy.hint(1)))
    expect(screen.queryByRole('button', { name: /^Hint/ })).toBeNull()
    expect(button(playerCopy.reviewRule)).toBeInTheDocument()
    for (const item of screen.getAllByRole('treeitem')) fireEvent.click(item)
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })

  it('going back keeps the practice path (FR-LRN-04)', () => {
    renderRoutes(backendWith(), '/module/C4/example')
    goTo(headingOf('c4-practice-found'))
    const root = screen.getAllByRole('treeitem')[0]
    fireEvent.click(root)
    const visited = screen.getByText(/^Visited/).textContent
    back()
    next()
    expect(screen.getByText(/^Visited/).textContent).toBe(visited)
  })
})

describe('NFR-02 axe on every C4 step', () => {
  it('every Explore, Worked example and Check step is axe clean', async () => {
    for (const a of ['explore', 'example', 'check'] as const) {
      const { container, unmount } = renderRoutes(backendWith(), `/module/C4/${a}`)
      const n = stepsFor(c4, a).length
      for (let i = 0; i < n; i++) {
        expect(await axe(container), `${a} step ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) next()
      }
      unmount()
    }
  }, 60_000)
})
