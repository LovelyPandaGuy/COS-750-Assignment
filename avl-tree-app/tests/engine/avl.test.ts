import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { avlInsert } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { checkAvl } from '../../src/engine/validity'
import { height, type Key, type Tree } from '../../src/engine/tree'
import { inOrder } from './helpers'

/** Insert keys one by one with AVL insert; return the final tree and last result. */
function buildAvl(keys: Key[]) {
  let tree: Tree = null
  let last = avlInsert(null, keys[0])
  for (const k of keys) {
    last = avlInsert(tree, k)
    tree = last.tree
  }
  return { tree, last }
}

function heightsCorrect(t: Tree): boolean {
  if (t === null) return true
  const l = t.left === null ? -1 : t.left.height
  const r = t.right === null ? -1 : t.right.height
  return t.height === Math.max(l, r) + 1 && heightsCorrect(t.left) && heightsCorrect(t.right)
}

describe('FR-ENG-04: imbalance detection', () => {
  it('no imbalance means no rebalance', () => {
    const r = avlInsert(buildAvl([20, 10, 30]).tree, 25)
    expect(r.rebalance).toBeNull()
    expect(r.inserted).toBe(true)
  })

  it('rebalances at the lowest unbalanced node', () => {
    // 50(30(20), 70): before fixing, inserting 10 leaves both 30 and its parent 50
    // with balance factor +2. The lowest one, 30, is the one reported and rotated.
    const r = avlInsert(buildAvl([50, 30, 70, 20]).tree, 10)
    expect(r.rebalance).toEqual({ case: 'LL', node: 30 })
  })
})

describe('FR-ENG-04: case classification at the root', () => {
  const table: [Key[], string, Key][] = [
    [[3, 2, 1], 'LL', 3],
    [[1, 2, 3], 'RR', 1],
    [[3, 1, 2], 'LR', 3],
    [[1, 3, 2], 'RL', 1],
  ]
  for (const [keys, c, node] of table) {
    it(`${keys.join(', ')} is ${c}`, () => {
      const { tree, last } = buildAvl(keys)
      expect(last.rebalance).toEqual({ case: c, node })
      expect(tree).toMatchObject({ key: 2, left: { key: 1 }, right: { key: 3 } })
    })
  }
})

describe('FR-ENG-04: case classification deeper in the tree', () => {
  // Parent 50 with the unbalanced node 30 as its left child, or 70 as its right child.
  const table: [string, Key[], string, Key][] = [
    ['left child LL', [50, 70, 30, 20, 10], 'LL', 30],
    ['left child RR', [50, 70, 30, 40, 45], 'RR', 30],
    ['left child LR', [50, 70, 30, 20, 25], 'LR', 30],
    ['left child RL', [50, 70, 30, 40, 35], 'RL', 30],
    ['right child LL', [50, 30, 70, 60, 55], 'LL', 70],
    ['right child RR', [50, 30, 70, 80, 90], 'RR', 70],
    ['right child LR', [50, 30, 70, 60, 65], 'LR', 70],
    ['right child RL', [50, 30, 70, 80, 75], 'RL', 70],
  ]
  for (const [name, keys, c, node] of table) {
    it(name, () => {
      const { tree, last } = buildAvl(keys)
      expect(last.rebalance).toEqual({ case: c, node })
      expect(tree?.key).toBe(50)
      expect(checkAvl(tree)).toEqual({ valid: true })
      expect(inOrder(tree)).toEqual([...keys].sort((a, b) => a - b))
      // the rotated subtree sits on the same side of the parent
      const side = node === 30 ? tree?.left : tree?.right
      expect(side).not.toBeNull()
      expect(height(side ?? null)).toBe(1)
    })
  }
})

describe('FR-ENG-04: single and double rotations', () => {
  it('each case gives the middle key at the root with the other two as children', () => {
    for (const keys of [[3, 2, 1], [1, 2, 3], [3, 1, 2], [1, 3, 2]]) {
      const { tree } = buildAvl(keys)
      expect(tree).toMatchObject({ key: 2, height: 1, left: { key: 1 }, right: { key: 3 } })
    }
  })
})

describe('FR-ENG-04: AVL insert', () => {
  it('hand-worked example: 10, 20, 30, 40, 50, 25', () => {
    const { tree, last } = buildAvl([10, 20, 30, 40, 50, 25])
    expect(last.rebalance).toEqual({ case: 'RL', node: 20 })
    expect(inOrder(tree)).toEqual([10, 20, 25, 30, 40, 50])
    expect(tree?.key).toBe(30)
    expect(checkAvl(tree)).toEqual({ valid: true })
  })

  it('duplicate key leaves the tree unchanged', () => {
    const t = buildAvl([20, 10, 30]).tree
    const r = avlInsert(t, 20)
    expect(r.inserted).toBe(false)
    expect(r.rebalance).toBeNull()
    expect(r.tree).toEqual(t)
  })

  it('empty tree and single node give valid trees with no rebalance', () => {
    const a = avlInsert(null, 5)
    expect(a).toMatchObject({ inserted: true, rebalance: null })
    expect(checkAvl(a.tree)).toEqual({ valid: true })
    const b = avlInsert(a.tree, 7)
    expect(b).toMatchObject({ inserted: true, rebalance: null })
    expect(checkAvl(b.tree)).toEqual({ valid: true })
  })

  it('does not modify the input tree', () => {
    const t = buildAvl([20, 10, 30, 5]).tree
    const copy = structuredClone(t)
    avlInsert(t, 1)
    avlInsert(t, 25)
    expect(t).toEqual(copy)
  })

  it('property: invariants hold after every insert in any sequence', () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 0, max: 500 }), { maxLength: 60 }), (keys) => {
        let tree: Tree = null
        const inserted: Key[] = []
        for (const k of keys) {
          const r = avlInsert(tree, k)
          tree = r.tree
          inserted.push(k)
          expect(r.inserted).toBe(true)
          expect(checkAvl(tree)).toEqual({ valid: true })
          expect(inOrder(tree)).toEqual([...inserted].sort((a, b) => a - b))
          expect(heightsCorrect(tree)).toBe(true)
          // rebalance is reported at most once per insert, as a single value or null
          expect(r.rebalance === null || typeof r.rebalance.case === 'string').toBe(true)
        }
      }),
    )
  })
})

describe('FR-ENG-07: AVL versus plain insert', () => {
  const keys = Array.from({ length: 15 }, (_, i) => i + 1)
  it('AVL insert of 1..15 is a perfect 4-level tree', () => {
    const { tree } = buildAvl(keys)
    expect(height(tree)).toBe(3)
    const perfect = (t: Tree): boolean =>
      t === null || (t.left === null) === (t.right === null) && perfect(t.left) && perfect(t.right)
    expect(perfect(tree)).toBe(true)
    expect(inOrder(tree)).toEqual(keys)
  })
  it('plain insert of 1..15 is a 15-level chain', () => {
    const plain = keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
    expect(height(plain)).toBe(14)
  })
})
