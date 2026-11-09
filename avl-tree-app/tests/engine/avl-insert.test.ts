import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { insertAvl } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { checkAvl } from '../../src/engine/validity'
import { REBALANCE_CASES } from '../../src/engine/conventions'
import { height, type Key, type Tree } from '../../src/engine/tree'
import type { TraceStep } from '../../src/engine/trace'
import { inOrder, leaf, n } from './helpers'

const [LL, RR, LR, RL] = REBALANCE_CASES

/** AVL-insert keys in order; return the final tree and the last insert's trace. */
function buildAvl(keys: Key[]): { tree: Tree; last: TraceStep[] } {
  let tree: Tree = null
  let last: TraceStep[] = []
  for (const k of keys) {
    const r = insertAvl(tree, k)
    tree = r.tree
    last = r.trace
  }
  return { tree, last }
}

const kinds = (trace: TraceStep[]) => trace.map((s) => s.kind)
const imbalance = (trace: TraceStep[]) => trace.filter((s) => s.kind === 'imbalance')
const distinctKeys = fc.uniqueArray(fc.integer({ min: -1000, max: 1000 }), { maxLength: 40 })

describe('FR-ENG-04: AVL insert', () => {
  it.each([
    [[3, 2, 1], LL],
    [[1, 2, 3], RR],
    [[3, 1, 2], LR],
    [[1, 3, 2], RL],
  ])('each case: %j gives a balanced three-node tree labelled %s', (keys, label) => {
    const { tree, last } = buildAvl(keys)
    expect(tree).toEqual(n(2, n(1), n(3)))
    expect(imbalance(last)).toHaveLength(1)
    expect(imbalance(last)[0].rebalanceCase).toBe(label)
  })

  it.each([
    [[50, 30, 70, 20, 10], LL, n(50, n(20, n(10), n(30)), n(70))],
    [[50, 30, 70, 35, 40], RR, n(50, n(35, n(30), n(40)), n(70))],
    [[50, 30, 70, 10, 20], LR, n(50, n(20, n(10), n(30)), n(70))],
    [[50, 30, 70, 40, 35], RL, n(50, n(35, n(30), n(40)), n(70))],
  ])('z deeper on the left of its parent: %j (%s)', (keys, label, expected) => {
    const { tree, last } = buildAvl(keys)
    const [step] = imbalance(last)
    expect(step.nodes[0]).toBe(30)
    expect(step.rebalanceCase).toBe(label)
    expect(tree).toEqual(expected)
  })

  it.each([
    [[30, 20, 60, 50, 40], LL, 60],
    [[30, 20, 40, 50, 60], RR, 40],
    [[30, 20, 60, 40, 50], LR, 60],
    [[30, 20, 40, 60, 50], RL, 40],
  ])('z deeper on the right of its parent: %j (%s)', (keys, label, z) => {
    const { tree, last } = buildAvl(keys)
    const [step] = imbalance(last)
    expect(step.nodes[0]).toBe(z)
    expect(step.rebalanceCase).toBe(label)
    expect(tree).toEqual(n(30, n(20), n(50, n(40), n(60))))
  })

  it('insert into the empty tree', () => {
    const r = insertAvl(null, 5)
    expect(r.tree).toEqual(leaf(5))
    expect(r.inserted).toBe(true)
    expect(kinds(r.trace)).not.toContain('rotation')
  })

  it('insert into a single-node tree', () => {
    const r = insertAvl(leaf(5), 3)
    expect(r.tree).toEqual(n(5, n(3)))
    expect(r.inserted).toBe(true)
    expect(kinds(r.trace)).not.toContain('imbalance')
    expect(kinds(r.trace)).not.toContain('rotation')
  })

  it('duplicate insert returns the same tree with no insert, imbalance or rotation step', () => {
    const { tree } = buildAvl([2, 1, 3])
    const r = insertAvl(tree, 1)
    expect(r.tree).toBe(tree)
    expect(r.inserted).toBe(false)
    for (const k of ['insert', 'imbalance', 'rotation'] as const) expect(kinds(r.trace)).not.toContain(k)
  })

  it('property: valid AVL, sorted keys, at most one rebalancing step per insert', () => {
    fc.assert(
      fc.property(distinctKeys, (keys) => {
        let tree: Tree = null
        for (const k of keys) {
          const r = insertAvl(tree, k)
          expect(imbalance(r.trace).length).toBeLessThanOrEqual(1)
          tree = r.tree
          expect(checkAvl(tree)).toEqual({ valid: true })
        }
        expect(inOrder(tree)).toEqual([...keys].sort((a, b) => a - b))
      }),
    )
  })

  it('no engine file other than the conventions module spells out a case name', () => {
    const dir = join('src', 'engine')
    const offenders = readdirSync(dir)
      .filter((f) => f.endsWith('.ts') && f !== 'conventions.ts')
      .filter((f) => /['"`](LL|RR|LR|RL)['"`]/.test(readFileSync(join(dir, f), 'utf8')))
    expect(offenders).toEqual([])
  })
})

describe('FR-ENG-07: plain BST insert for comparison', () => {
  it('ascending keys 1 to 15: plain gives a 15-level chain, AVL a perfect 4-level tree', () => {
    const keys = Array.from({ length: 15 }, (_, i) => i + 1)
    const plain = keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
    const avl = buildAvl(keys).tree
    expect(height(plain) + 1).toBe(15)
    expect(height(avl) + 1).toBe(4)
    // perfect: 2^levels - 1 nodes
    expect(inOrder(avl)).toHaveLength(2 ** (height(avl) + 1) - 1)
  })

  it('plain insert trace has only compare steps then one insert or found step', () => {
    fc.assert(
      fc.property(distinctKeys, fc.integer({ min: -1000, max: 1000 }), (keys, key) => {
        const start = keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
        const r = insert(start, key)
        const pattern = kinds(r.trace).join(' ')
        expect(pattern).toMatch(r.inserted ? /^(compare )*insert$/ : /^(compare )*found$/)
      }),
    )
  })
})
