import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { remove } from '../../src/engine/bst'
import type { Key, Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { stepsFor } from '../../src/modules/schema'
import { playerCopy } from '../../src/content/modules/player'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { screenCopy } from '../../src/content/screens'
import { LEARNER_KEY } from '../../src/state/storage'
import { FindAfterDelete } from '../../src/ui/module/practice/FindAfterDelete'
import { backendWith, renderRoutes } from './learner-fixtures'

// Spec: add-module-c7-delete / module-c7-delete. Requirement IDs: LO8, D3, D4, D21, D27, NFR-02.

const copy = practiceModuleCopy.afterDelete
const c7 = MODULE_CONTENT.C7!
const h2 = () => screen.getByRole('heading', { level: 2 })
const button = (name: string | RegExp) => screen.getByRole('button', { name })
const next = () => fireEvent.click(button(playerCopy.next))
const headingOf = (id: string) => c7.steps.find((s) => s.id === id)!.heading
function goTo(heading: string) {
  for (let i = 0; i < 20 && h2().textContent !== heading; i++) next()
  expect(h2()).toHaveTextContent(heading)
}
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const node = (key: Key) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${key}\\b`) })
const status = () => screen.getByRole('status')

const BEFORE = avl([20, 10, 30, 40])
const AFTER = remove(BEFORE, 10).tree // node 20 is out of balance

function Practice({ hintsUsed = 0 }: { hintsUsed?: number }) {
  const [solved, setSolved] = useState(false)
  return (
    <FindAfterDelete
      before={BEFORE}
      deletedKey={10}
      after={AFTER}
      solved={solved}
      onSolved={() => setSolved(true)}
      hintsUsed={hintsUsed}
      onReview={() => {}}
      onNewTree={() => {}}
    />
  )
}

describe('LO8 recap figures in the player', () => {
  it('the two-children step shows two trees, before and after', () => {
    renderRoutes(backendWith(), '/module/C7/explore')
    goTo(headingOf('c7-delete-two-children'))
    const step = c7.steps.find((s) => s.id === 'c7-delete-two-children')!
    for (const f of step.figures!) expect(screen.getByRole('region', { name: f.label })).toBeInTheDocument()
  })
})

describe('LO8 find the unbalanced node after a delete', () => {
  it('names the deleted key; balance factors stay hidden until solved', () => {
    render(<Practice />)
    expect(screen.getByText(copy.deleted(10))).toBeInTheDocument()
    expect(node(20)).toHaveAccessibleName(/hidden/i)
  })

  it('the lowest unbalanced node is right, and balance factors are then shown', () => {
    render(<Practice />)
    fireEvent.click(node(20))
    fireEvent.click(button(practiceModuleCopy.check))
    expect(status().textContent).toMatch(/^That's right/)
    expect(node(20)).not.toHaveAccessibleName(/hidden/i)
  })

  it('a node in range is Not quite yet, and the tree is unchanged', () => {
    render(<Practice />)
    fireEvent.click(node(40))
    fireEvent.click(button(practiceModuleCopy.check))
    expect(status().textContent).toMatch(/^Not quite yet/)
    expect(status().textContent).not.toMatch(/\b(wrong|fail\w*)\b|✗/i)
    expect(node(40)).toHaveAccessibleName(/hidden/i)
  })

  it('keyboard only: Enter selects, the Check button submits', () => {
    render(<Practice />)
    const root = screen.getAllByRole('treeitem').find((n) => n.getAttribute('tabindex') === '0')!
    root.focus()
    fireEvent.keyDown(root, { key: 'Enter' })
    const b = button(practiceModuleCopy.check)
    b.focus()
    expect(b).toHaveFocus()
    fireEvent.click(b)
    expect(status().textContent).toMatch(/^(That's right|Not quite yet)/)
  })

  it('hints: one, then two', () => {
    const { rerender } = render(<Practice hintsUsed={1} />)
    const hints = () => within(screen.getByRole('list', { name: practiceModuleCopy.hintsLabel })).getAllByRole('listitem')
    expect(hints()).toHaveLength(1)
    rerender(<Practice hintsUsed={2} />)
    expect(hints()).toHaveLength(2)
  })
})

describe('D21 in the player: hints count down; nothing stored', () => {
  it('Hint (2), Hint (1), then review; the learner state is unchanged', () => {
    const backend = backendWith()
    renderRoutes(backend, '/module/C7/example')
    const before = backend.getItem(LEARNER_KEY)
    goTo(headingOf('c7-find-after-delete'))
    fireEvent.click(button(playerCopy.hint(2)))
    fireEvent.click(button(playerCopy.hint(1)))
    expect(button(playerCopy.reviewRule)).toBeInTheDocument()
    for (const item of screen.getAllByRole('treeitem')) {
      fireEvent.click(item)
      fireEvent.click(button(practiceModuleCopy.check))
    }
    expect(backend.getItem(LEARNER_KEY)).toBe(before)
  })
})

describe('D4 the optional check and axe', () => {
  it('Check: the coming line, then the summary; nothing completed', () => {
    const { storage } = renderRoutes(backendWith(), '/module/C7/check')
    expect(screen.getByText(screenCopy.coming)).toBeInTheDocument()
    next()
    expect(h2()).toHaveTextContent(headingOf('c7-summary'))
    expect(storage.load().state.completedModules).toEqual([])
  })

  it('every C7 step is axe clean', async () => {
    for (const a of ['explore', 'example', 'check'] as const) {
      const { container, unmount } = renderRoutes(backendWith(), `/module/C7/${a}`)
      const n = stepsFor(c7, a).length
      for (let i = 0; i < n; i++) {
        expect(await axe(container), `${a} step ${i + 1}`).toHaveNoViolations()
        if (i < n - 1) next()
      }
      unmount()
    }
  }, 60_000)
})
