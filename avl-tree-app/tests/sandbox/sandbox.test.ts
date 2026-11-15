import fc from 'fast-check'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { analyseTree } from '../../src/engine/analyse'
import { avlInsert, avlInsertTrace } from '../../src/engine/avl'
import { captionsFor } from '../../src/engine/captions'
import { leafDeleteTrace, plainInsertTrace } from '../../src/engine/lessonTrace'
import { insert } from '../../src/engine/bst'
import { searchTrace } from '../../src/engine/search'
import { height, type Key, type Tree } from '../../src/engine/tree'
import { SANDBOX_KEY_MAX, SANDBOX_KEY_MIN, SANDBOX_MAX_NODES, SORTED_DEMO } from '../../src/sandbox/config'
import { initialSandbox, sandboxReducer, sandboxStats, type SandboxAction, type SandboxState } from '../../src/sandbox/sandbox'
import { sandboxCopy } from '../../src/content/sandbox'

// Spec: add-sandbox / sandbox; align-sandbox-explanations (D161 to D163). Requirement IDs: FR-VIS-08, FR-MOT-04, LO1, LO7, D3, D11, D19, D27.

const run = (actions: SandboxAction[], from: SandboxState = initialSandbox()) => actions.reduce(sandboxReducer, from)
const ins = (...keys: number[]): SandboxAction[] => keys.map((key) => ({ type: 'insert', key }))
const off: SandboxAction = { type: 'toggle' }
const shape = (t: Tree): unknown => (t === null ? null : [t.key, shape(t.left), shape(t.right)])
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const bst = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

describe('FR-VIS-08 config', () => {
  it('caps at 15 keys from 1 to 99; the sorted demo is 1 to 7', () => {
    expect([SANDBOX_MAX_NODES, SANDBOX_KEY_MIN, SANDBOX_KEY_MAX]).toEqual([15, 1, 99])
    expect(SORTED_DEMO).toEqual([1, 2, 3, 4, 5, 6, 7])
  })
})

describe('FR-VIS-08 insert and delete', () => {
  it('starts empty with rebalancing on', () => {
    const s = initialSandbox()
    expect(s.tree).toBeNull()
    expect(s.rebalancing).toBe(true)
    expect(s.log).toEqual([])
  })

  it('rebalancing on: 10, 20, 30 give the engine AVL tree, root 20', () => {
    const s = run(ins(10, 20, 30))
    expect(shape(s.tree)).toEqual(shape(avl([10, 20, 30])))
    expect(s.tree!.key).toBe(20)
  })

  it('rebalancing off: 1 to 7 in order build a chain of height 6', () => {
    const s = run([off, ...ins(1, 2, 3, 4, 5, 6, 7)])
    expect(shape(s.tree)).toEqual(shape(bst([1, 2, 3, 4, 5, 6, 7])))
    expect(height(s.tree)).toBe(6)
  })

  it('delete a leaf with rebalancing on: the engine leaf deletion (C7, D162)', () => {
    const s = run([...ins(20, 10, 40, 30, 50), { type: 'delete', key: 10 }])
    expect(shape(s.tree)).toEqual(shape(leafDeleteTrace(avl([20, 10, 40, 30, 50]), 10).tree))
    expect(keysOf(s.tree)).toEqual([20, 30, 40, 50])
    expect(s.order).toEqual([20, 40, 30, 50])
  })

  it('delete a leaf with rebalancing off: no rotation', () => {
    const s = run([off, ...ins(20, 10, 40, 30, 50), { type: 'delete', key: 10 }])
    expect(shape(s.tree)).toEqual(shape(leafDeleteTrace(bst([20, 10, 40, 30, 50]), 10, { rebalance: false }).tree))
  })

  it('a node with children is not deleted, with a calm notice (D162)', () => {
    const before = run(ins(10, 20, 30))
    const s = sandboxReducer(before, { type: 'delete', key: 20 })
    expect(s.tree).toBe(before.tree)
    expect(s.notice).toEqual({ kind: 'notLeaf', key: 20 })
    const text = sandboxCopy.notice({ kind: 'notLeaf', key: 20 })
    expect(text).toContain('20 is not a leaf')
    expect(text).toContain('C7')
    expect(text).not.toMatch(/wrong|fail|error/i)
  })
})

describe('D27 calm notices leave the tree unchanged', () => {
  it.each([0, 100, 2.5, Number.NaN])('out of range: %s', (key) => {
    const before = run(ins(20))
    const s = sandboxReducer(before, { type: 'insert', key })
    expect(s.tree).toBe(before.tree)
    expect(s.notice).toEqual({ kind: 'range' })
  })

  it('duplicate', () => {
    const before = run(ins(20))
    const s = sandboxReducer(before, { type: 'insert', key: 20 })
    expect(s.tree).toBe(before.tree)
    expect(s.notice).toEqual({ kind: 'duplicate', key: 20 })
  })

  it('deleting a key that is not there', () => {
    const before = run(ins(20))
    const s = sandboxReducer(before, { type: 'delete', key: 5 })
    expect(s.tree).toBe(before.tree)
    expect(s.notice).toEqual({ kind: 'missing', key: 5 })
  })

  it('a successful operation clears the notice', () => {
    const s = run([...ins(20, 20), ...ins(30)])
    expect(s.notice).toBeNull()
  })

  it('notices are worded calmly and name the range', () => {
    const texts = [
      sandboxCopy.notice({ kind: 'range' }),
      sandboxCopy.notice({ kind: 'duplicate', key: 20 }),
      sandboxCopy.notice({ kind: 'missing', key: 5 }),
      sandboxCopy.notice({ kind: 'full' }),
    ]
    expect(texts[0]).toMatch(/1.*99/)
    expect(texts[1]).toContain('20')
    for (const t of texts) expect(t).not.toMatch(/\b(wrong|fail\w*|error|invalid)\b/i)
  })
})

describe('FR-VIS-08 fifteen-node cap', () => {
  it('a 16th insert is refused with the full notice; delete still works', () => {
    const keys = Array.from({ length: 15 }, (_, i) => (i + 1) * 5)
    const full = run(ins(...keys))
    expect(sandboxStats(full.tree).nodes).toBe(15)
    const s = sandboxReducer(full, { type: 'insert', key: 99 })
    expect(s.tree).toBe(full.tree)
    expect(s.notice).toEqual({ kind: 'full' })
    expect(sandboxStats(sandboxReducer(full, { type: 'delete', key: 5 }).tree).nodes).toBe(14)
  })
})

describe('D11 rebalancing switch rebuilds from the keys in insert order', () => {
  it('a chain of 1 to 7 becomes the AVL tree of 1 to 7, height 2', () => {
    const s = run([off, ...ins(1, 2, 3, 4, 5, 6, 7), { type: 'toggle' }])
    expect(s.rebalancing).toBe(true)
    expect(shape(s.tree)).toEqual(shape(avl([1, 2, 3, 4, 5, 6, 7])))
    expect(height(s.tree)).toBe(2)
    expect(s.log[0]).toEqual({ kind: 'rebuild', rebalancing: true, count: 7 })
  })

  it('a deleted key stays out of the rebuild', () => {
    const s = run([...ins(5, 3, 8, 1), { type: 'delete', key: 1 }, off])
    expect(s.order).toEqual([5, 3, 8])
    expect(shape(s.tree)).toEqual(shape(bst([5, 3, 8])))
  })
})

describe('wireframe 1n shortcut controls', () => {
  it('"Insert 1 to 7 in order" clears and inserts 1 to 7', () => {
    const s = run([...ins(50, 60), { type: 'sorted' }])
    expect(s.order).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(keysOf(s.tree)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('Random key twenty times: 15 distinct keys from 1 to 99, then no more', () => {
    let s = initialSandbox()
    for (let i = 0; i < 20; i++) s = sandboxReducer(s, { type: 'random', value: (i * 0.37) % 1 })
    const keys = keysOf(s.tree)
    expect(new Set(keys).size).toBe(15)
    expect(keys.every((k) => k >= 1 && k <= 99)).toBe(true)
  })

  it('Clear empties the tree and logs it', () => {
    const s = run([...ins(5, 6), { type: 'clear' }])
    expect(s.tree).toBeNull()
    expect(s.order).toEqual([])
    expect(s.log[0]).toEqual({ kind: 'clear' })
  })
})

describe('LO1 FR-MOT-04 statistics from the engine', () => {
  it('chain of 1 to 7: 7 / 15, height 6, shortest 2, 5 unbalanced, search for 7 visits 7', () => {
    const s = run([off, ...ins(1, 2, 3, 4, 5, 6, 7)])
    expect(sandboxStats(s.tree)).toEqual({ nodes: 7, max: 15, height: 6, shortest: 2, unbalanced: 5, deepest: { key: 7, visits: 7 } })
  })

  it('empty tree', () => {
    expect(sandboxStats(null)).toEqual({ nodes: 0, max: 15, height: -1, shortest: -1, unbalanced: 0, deepest: null })
  })

  const actionArb: fc.Arbitrary<SandboxAction> = fc.oneof(
    fc.integer({ min: 1, max: 99 }).map((key) => ({ type: 'insert', key }) as const),
    fc.integer({ min: 1, max: 99 }).map((key) => ({ type: 'delete', key }) as const),
    fc.constant({ type: 'toggle' } as const),
  )

  it('every statistic equals the engine value after random operations (property)', () => {
    fc.assert(
      fc.property(fc.array(actionArb, { maxLength: 40 }), (actions) => {
        const { tree } = run(actions)
        const st = sandboxStats(tree)
        const n = keysOf(tree).length
        expect(st.nodes).toBe(n)
        expect(n).toBeLessThanOrEqual(15)
        expect(st.height).toBe(height(tree))
        expect(st.shortest).toBe(n === 0 ? -1 : Math.floor(Math.log2(n)))
        expect(st.unbalanced).toBe(analyseTree(tree).balanceViolations.length)
        if (st.deepest !== null) {
          expect(st.deepest.visits).toBe(searchTrace(tree, st.deepest.key).steps)
          expect(st.deepest.visits).toBe(height(tree) + 1)
        }
      }),
    )
  })
})

const steps = (e: SandboxState['log'][number]) => ('steps' in e ? e.steps : [])

describe('D19 D161 event log: every step in the lessons\' captions', () => {
  it('rebalancing off: 7 after 6, the plain insert captions', () => {
    const s = run([off, ...ins(6, 7)])
    expect(s.log[0]).toMatchObject({ kind: 'insert', key: 7, rebalancing: false })
    expect(steps(s.log[0])).toEqual(['7 is larger than 6, so the search goes right.', '7 goes into the empty right branch of 6.', 'Node 6 now has a balance factor of 0 − (−1) = +1.', 'Every node now has a balance factor of −1, 0 or +1.'])
    expect(sandboxCopy.heading(s.log[0])).toBe('Inserted 7')
    expect(sandboxCopy.noRotation).toBe('Rebalancing is off, so no rotation is made.')
  })

  it('the first key is the root', () => {
    expect(steps(run(ins(40)).log[0])[0]).toBe('The tree is empty, so 40 becomes the root.')
  })

  it('rebalancing on: inserting 30 after 10, 20 gives exactly the C6 captions', () => {
    expect(steps(run(ins(10, 20, 30)).log[0])).toEqual([
      '30 is larger than 10, so the search goes right.',
      '30 is larger than 20, so the search goes right.',
      '30 goes into the empty right branch of 20.',
      'Node 20 now has a balance factor of 0 − (−1) = +1.',
      'Node 10 now has a balance factor of 1 − (−1) = +2.',
      'Node 10 has a balance factor of +2, so it is the first unbalanced node, n. This is Case 4 (RR).',
      'Rotate 20 around 10. This is a left rotation about 10.',
      'Every node now has a balance factor of −1, 0 or +1.',
    ])
  })

  it('delete entry: the C7 captions', () => {
    const s = run([...ins(20, 10, 40, 30, 50), { type: 'delete', key: 10 }])
    expect(sandboxCopy.heading(s.log[0])).toBe('Deleted 10')
    expect(steps(s.log[0])).toEqual([
      '10 is a leaf, so it is removed.',
      'Node 20 now has a balance factor of 1 − (−1) = +2.',
      'Node 20 has a balance factor of +2, so it is unbalanced.',
      'Rotate 40 around 20. This is a left rotation about 20.',
      'Every node now has a balance factor of −1, 0 or +1.',
    ])
  })

  it('an empty rebuild says the tree is empty', () => {
    const text = sandboxCopy.heading(run([off]).log[0])
    expect(text).toMatch(/the tree is empty/i)
    expect(text).not.toMatch(/\b0 keys\b/)
  })

  it('every step is the engine caption for the same trace (property)', () => {
    fc.assert(
      fc.property(fc.boolean(), fc.array(fc.tuple(fc.boolean(), fc.integer({ min: 1, max: 40 })), { maxLength: 25 }), (rebalance, ops) => {
        let s = run(rebalance ? [] : [off])
        for (const [del, k] of ops) {
          const before = s.tree
          s = sandboxReducer(s, { type: del ? 'delete' : 'insert', key: k })
          if (s.tree === before) continue
          const t = del
            ? leafDeleteTrace(before, k, { rebalance })
            : rebalance
              ? { trace: avlInsertTrace(before, k).trace }
              : plainInsertTrace(before, k)
          expect(steps(s.log[0])).toEqual(captionsFor(del ? 'delete' : 'insert', t.trace, k).map((c) => c.text))
        }
      }),
      { numRuns: 60 },
    )
  })

  it('no case names are typed in the sandbox wording', () => {
    expect(strip(readFileSync('src/content/sandbox.ts', 'utf8'))).not.toMatch(/\b(LL|RR|LR|RL|left-left|right-right|left-right|right-left)\b/)
  })
})

describe('D163 the last change, for the replay', () => {
  it('an insert, on or off, with the tree before', () => {
    const before = run(ins(10, 20))
    expect(sandboxReducer(before, { type: 'insert', key: 30 }).lastChange).toEqual({ kind: 'insert', before: before.tree, key: 30, rebalance: true })
    const offBefore = run([off, ...ins(6)])
    expect(sandboxReducer(offBefore, { type: 'insert', key: 7 }).lastChange).toEqual({ kind: 'insert', before: offBefore.tree, key: 7, rebalance: false })
  })

  it('a leaf delete', () => {
    const before = run(ins(20, 10, 40, 30, 50))
    expect(sandboxReducer(before, { type: 'delete', key: 10 }).lastChange).toEqual({ kind: 'delete', before: before.tree, key: 10, rebalance: true })
  })

  it('a random key counts as an insert', () => {
    expect(run([{ type: 'random', value: 0.5 }]).lastChange?.kind).toBe('insert')
  })

  it('cleared by the sorted shortcut, a toggle and a clear; kept by a refused action', () => {
    const on = run(ins(10, 20))
    expect(sandboxReducer(on, { type: 'sorted' }).lastChange).toBeNull()
    expect(sandboxReducer(on, off).lastChange).toBeNull()
    expect(sandboxReducer(on, { type: 'clear' }).lastChange).toBeNull()
    expect(sandboxReducer(on, { type: 'insert', key: 10 }).lastChange).toEqual(on.lastChange)
  })
})
