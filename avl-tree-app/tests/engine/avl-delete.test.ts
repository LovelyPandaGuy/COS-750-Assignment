import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { avlDelete, avlInsert } from '../../src/engine/avl'
import { analyseTree } from '../../src/engine/analyse'
import { checkAvl } from '../../src/engine/validity'
import { generateInsertSequence } from '../../src/engine/generate'
import { makeNode as n, type Key, type Tree } from '../../src/engine/tree'
import { inOrder } from './helpers'

type Shape = [Key, Shape | null, Shape | null] | null
const shape = (t: Tree): Shape => (t === null ? null : [t.key, shape(t.left), shape(t.right)])
const leaf = (k: Key) => n(k, null, null)

describe('FR-ENG-08: AVL delete rebalancing cases', () => {
  it('no rebalance needed', () => {
    const r = avlDelete(n(20, leaf(10), leaf(30)), 10)
    expect(r.deleted).toBe(true)
    expect(shape(r.tree)).toEqual([20, null, [30, null, null]])
    expect(r.rebalances).toEqual([])
  })

  it('single rotation in the same direction (RR at 15)', () => {
    const t = n(15, leaf(10), n(20, null, leaf(30)))
    const r = avlDelete(t, 10)
    expect(shape(r.tree)).toEqual([20, [15, null, null], [30, null, null]])
    expect(r.rebalances).toEqual([{ case: 'RR', node: 15 }])
  })

  it('double rotation (RL at 20)', () => {
    const t = n(20, leaf(10), n(30, leaf(25), null))
    const r = avlDelete(t, 10)
    expect(shape(r.tree)).toEqual([25, [20, null, null], [30, null, null]])
    expect(r.rebalances).toEqual([{ case: 'RL', node: 20 }])
  })

  it('double rotation, mirror (LR at 20)', () => {
    const t = n(20, n(10, null, leaf(15)), leaf(30))
    const r = avlDelete(t, 30)
    expect(shape(r.tree)).toEqual([15, [10, null, null], [20, null, null]])
    expect(r.rebalances).toEqual([{ case: 'LR', node: 20 }])
  })

  it('tie case, right-heavy: balanced taller child gives a single left rotation (RR)', () => {
    const t = n(20, leaf(10), n(30, leaf(25), leaf(35)))
    const r = avlDelete(t, 10)
    expect(shape(r.tree)).toEqual([30, [20, null, [25, null, null]], [35, null, null]])
    expect(r.rebalances).toEqual([{ case: 'RR', node: 20 }])
  })

  it('tie case, left-heavy: single right rotation (LL)', () => {
    const t = n(20, n(10, leaf(5), leaf(15)), leaf(30))
    const r = avlDelete(t, 30)
    expect(shape(r.tree)).toEqual([10, [5, null, null], [20, [15, null, null], null]])
    expect(r.rebalances).toEqual([{ case: 'LL', node: 20 }])
  })
})

describe('FR-ENG-08: delete may rebalance more than once', () => {
  const big = n(
    8,
    n(5, n(2, leaf(1), n(3, null, leaf(4))), n(6, null, leaf(7))),
    n(10, leaf(9), n(11, null, leaf(12))),
  )

  it('the starting tree is a valid AVL tree', () => {
    expect(checkAvl(big)).toEqual({ valid: true })
  })

  it('deleting 9 needs RR at 10, then LL at 8', () => {
    const r = avlDelete(big, 9)
    expect(r.deleted).toBe(true)
    expect(r.rebalances).toEqual([
      { case: 'RR', node: 10 },
      { case: 'LL', node: 8 },
    ])
    expect(shape(r.tree)).toEqual([
      5,
      [2, [1, null, null], [3, null, [4, null, null]]],
      [8, [6, null, [7, null, null]], [11, [10, null, null], [12, null, null]]],
    ])
    expect(checkAvl(r.tree)).toEqual({ valid: true })
    expect(inOrder(r.tree)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12])
  })
})

describe('FR-ENG-08: two-children delete with rebalancing', () => {
  it('deleting the root takes the in-order successor', () => {
    const t = n(20, leaf(10), n(30, leaf(25), leaf(35)))
    const r = avlDelete(t, 20)
    expect(r.tree?.key).toBe(25)
    expect(inOrder(r.tree)).toEqual([10, 25, 30, 35])
    expect(r.rebalances).toEqual([])
    expect(checkAvl(r.tree)).toEqual({ valid: true })
  })
})

/** Nodes on the deletion path: root to the key, plus the successor path for two children. */
function pathLength(tree: Tree, key: Key): number {
  let count = 0
  for (let node = tree; node !== null; node = key < node.key ? node.left : node.right) {
    count++
    if (node.key === key) {
      if (node.left !== null && node.right !== null) {
        for (let s: Tree = node.right; s !== null; s = s.left) count++
      }
      return count
    }
  }
  return 0
}

function heightsCorrect(t: Tree): boolean {
  if (t === null) return true
  const l = t.left === null ? -1 : t.left.height
  const r = t.right === null ? -1 : t.right.height
  return t.height === Math.max(l, r) + 1 && heightsCorrect(t.left) && heightsCorrect(t.right)
}

describe('FR-ENG-08: AVL delete invariants', () => {
  it('property: invariants hold for present and missing keys', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 100 }), { maxLength: 40 }),
        fc.integer({ min: -2, max: 102 }),
        (keys, target) => {
          const tree = keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
          const copy = structuredClone(tree)
          const present = keys.includes(target)
          const r = avlDelete(tree, target)
          expect(r.deleted).toBe(present)
          expect(tree).toEqual(copy)
          expect(checkAvl(r.tree)).toEqual({ valid: true })
          expect(analyseTree(r.tree).isBst).toBe(true)
          expect(heightsCorrect(r.tree)).toBe(true)
          expect(inOrder(r.tree)).toEqual(keys.filter((k) => k !== target).sort((a, b) => a - b))
          expect(r.rebalances.length).toBeLessThanOrEqual(pathLength(tree, target))
          if (!present) expect(r.rebalances).toEqual([])
        },
      ),
    )
  })

  it('delete until empty: valid after every delete (seeded order)', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      let tree: Tree = null
      for (let k = 1; k <= 15; k++) tree = avlInsert(tree, k).tree
      const order = generateInsertSequence(seed, { count: 15, min: 1, max: 15 })
      const remaining = new Set(order)
      for (const k of order) {
        const r = avlDelete(tree, k)
        expect(r.deleted).toBe(true)
        remaining.delete(k)
        tree = r.tree
        expect(checkAvl(tree)).toEqual({ valid: true })
        expect(inOrder(tree)).toEqual([...remaining].sort((a, b) => a - b))
      }
      expect(tree).toBeNull()
    }
  })

  it('missing key and empty tree: unchanged, nothing reported', () => {
    const t = n(20, leaf(10), leaf(30))
    const a = avlDelete(t, 99)
    expect(a).toEqual({ tree: t, deleted: false, rebalances: [] })
    const b = avlDelete(null, 1)
    expect(b).toEqual({ tree: null, deleted: false, rebalances: [] })
  })
})
