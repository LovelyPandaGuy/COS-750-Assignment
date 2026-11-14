import { fireEvent, render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { replayCopy } from '../../src/content/replay'
import { SPEEDS } from '../../src/replay/replay'
import { traceFor, treeAt, type Operation } from '../../src/replay/replay'
import { TREE_TRANSITION_MS } from '../../src/ui/tree/motion'

// Spec: revamp-tree-controls / ui-tree-controls "Stable steps in the replay" and "Caption under the tree"
// (scenario "One live region"). A1 follow-up; D103 (replaces D32), D29, NFR-03 ([OPEN] confirm the ID).
// TreeView is wrapped so the test can read the props the replay passes; it still renders the real tree view.

const calls = vi.hoisted(() => [] as Record<string, unknown>[])
vi.mock('../../src/ui/tree/TreeView', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/ui/tree/TreeView')>()
  return {
    ...actual,
    TreeView: (props: Parameters<typeof actual.TreeView>[0]) => {
      calls.push(props as unknown as Record<string, unknown>)
      return actual.TreeView(props)
    },
  }
})

import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

beforeEach(() => {
  calls.length = 0
})

const leaf = (k: Key) => makeNode(k, null, null)
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const inOrder = (t: Tree): Key[] => (t === null ? [] : [...inOrder(t.left), t.key, ...inOrder(t.right)])
const last = () => calls[calls.length - 1]
const btn = (name: string) => screen.getByRole('button', { name })

const CHAIN = makeNode(30, leaf(20), null)
const BAL = makeNode(20, leaf(10), leaf(30))

describe('D103 the replay passes slots: the final tree keys', () => {
  it('insert: slots are the in-order keys of the trace final tree, at every position', () => {
    const op: Operation = { kind: 'insert', tree: avl([40, 20, 60, 10, 30, 50, 70]), key: 5 }
    const { trace } = traceFor(op, 'loop')
    const want = inOrder(treeAt(op.tree, trace, trace.length))
    render(<ReplayPlayer operation={op} label="Tree" />)
    expect(last().slots).toEqual(want)
    for (let p = 1; p <= trace.length; p++) {
      fireEvent.click(btn('Step'))
      expect(last().slots, `position ${p}`).toEqual(want)
    }
  })

  it('insert of 10 into the chain 30, 20: slots 10, 20, 30', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    expect(last().slots).toEqual([10, 20, 30])
  })

  it('search: slots are the keys of the tree being searched', () => {
    render(<ReplayPlayer operation={{ kind: 'search', tree: BAL, key: 25 }} label="Tree" />)
    expect(last().slots).toEqual([10, 20, 30])
  })
})

describe('NFR-03 D103 transitionMs is capped by the step duration', () => {
  it.each(SPEEDS.map((s) => [s]))('at %s× the tree view gets min(TREE_TRANSITION_MS, step / 2)', (s) => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    fireEvent.click(btn(replayCopy.controls.speedLabel(s)))
    const want = Math.min(TREE_TRANSITION_MS, replayCopy.baseMs / s / 2)
    expect(want).toBe(300)
    expect(last().transitionMs).toBe(want)
  })
})

describe('D23 D103 no announce and no overlay from the replay', () => {
  it('announce and overlay are not passed', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    fireEvent.click(btn('Step'))
    for (const c of calls) {
      expect(c.announce).toBeUndefined()
      expect(c.overlay).toBeUndefined()
    }
  })
})
