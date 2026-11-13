import fc from 'fast-check'
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { analyseTree } from '../../src/engine/analyse'
import { avlDelete, avlInsert } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { searchTrace } from '../../src/engine/search'
import { height, type Key, type Tree } from '../../src/engine/tree'
import { SANDBOX_KEY_MAX, SANDBOX_KEY_MIN, SANDBOX_MAX_NODES, SORTED_DEMO } from '../../src/sandbox/config'
import { initialSandbox, sandboxReducer, sandboxStats, type SandboxAction, type SandboxState } from '../../src/sandbox/sandbox'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { sandboxCopy } from '../../src/content/sandbox'

// Spec: add-sandbox / sandbox. Requirement IDs: FR-VIS-08, FR-MOT-04, LO1, D3, D11, D19, D27.

const run = (actions: SandboxAction[], from: SandboxState = initialSandbox()) => actions.reduce(sandboxReducer, from)
const ins = (...keys: number[]): SandboxAction[] => keys.map((key) => ({ type: 'insert', key }))
const off: SandboxAction = { type: 'toggle' }
const shape = (t: Tree): unknown => (t === null ? null : [t.key, shape(t.left), shape(t.right)])
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const bst = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])
const w = conventionsWording()
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

  it('delete with rebalancing on uses the engine AVL delete', () => {
    const s = run([...ins(10, 20, 30), { type: 'delete', key: 20 }])
    expect(shape(s.tree)).toEqual(shape(avlDelete(avl([10, 20, 30]), 20).tree))
    expect(keysOf(s.tree)).not.toContain(20)
    expect(s.order).toEqual([10, 30])
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
    const s = run([...ins(5, 3, 8, 1), { type: 'delete', key: 3 }, off])
    expect(s.order).toEqual([5, 8, 1])
    expect(shape(s.tree)).toEqual(shape(bst([5, 8, 1])))
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

describe('D19 event log from the engine', () => {
  it('rebalancing off: 7 went to the right of 6, no rebalancing', () => {
    const s = run([off, ...ins(6, 7)])
    expect(s.log[0]).toEqual({ kind: 'insert', key: 7, parent: 6, side: 'right', rebalances: [], rebalancing: false })
    expect(sandboxCopy.log(s.log[0], w)).toMatch(/7/)
    expect(sandboxCopy.log(s.log[0], w)).toMatch(/right of 6/)
  })

  it('the first key is the root', () => {
    expect(run(ins(40)).log[0]).toEqual({ kind: 'insert', key: 40, parent: null, side: null, rebalances: [], rebalancing: true })
  })

  it('rebalancing on: inserting 30 after 10, 20 names node 10 and the case from the conventions wording', () => {
    const s = run(ins(10, 20, 30))
    const r = avlInsert(avl([10, 20]), 30).rebalance!
    expect(s.log[0]).toMatchObject({ kind: 'insert', key: 30, parent: 20, side: 'right', rebalances: [r] })
    const text = sandboxCopy.log(s.log[0], w)
    expect(text).toContain('10')
    expect(text).toContain(w.caseName(r.case))
  })

  it('delete entries carry the engine rebalances', () => {
    const before = run(ins(20, 10, 30, 40))
    const s = sandboxReducer(before, { type: 'delete', key: 10 })
    expect(s.log[0]).toEqual({ kind: 'delete', key: 10, rebalances: avlDelete(before.tree, 10).rebalances, rebalancing: true })
  })

  it('no case names are typed in the sandbox wording', () => {
    expect(strip(readFileSync('src/content/sandbox.ts', 'utf8'))).not.toMatch(/\b(LL|RR|LR|RL|left-left|right-right|left-right|right-left)\b/)
  })
})

describe('FR-VIS-03 replay of the last insert', () => {
  it('set after an insert with rebalancing on, with the tree before', () => {
    const before = run(ins(10, 20))
    const s = sandboxReducer(before, { type: 'insert', key: 30 })
    expect(s.lastInsert).toEqual({ before: before.tree, key: 30 })
  })

  it('cleared by a delete, a toggle, a clear and an insert with rebalancing off', () => {
    const on = run(ins(10, 20))
    expect(sandboxReducer(on, { type: 'delete', key: 10 }).lastInsert).toBeNull()
    expect(sandboxReducer(on, off).lastInsert).toBeNull()
    expect(sandboxReducer(on, { type: 'clear' }).lastInsert).toBeNull()
    expect(run([off, ...ins(5)]).lastInsert).toBeNull()
  })
})
