import { describe, it, expect } from 'vitest'
import { analyseTree } from '../../src/engine/analyse'
import { checkAvl } from '../../src/engine/validity'
import { leanOf } from '../../src/engine/conventions'
import { makeNode, type TreeNode } from '../../src/engine/tree'
import { build, leaf } from './helpers'

describe('FR-ENG-05: tree analysis report', () => {
  it('valid AVL trees have empty lists', () => {
    for (const t of [null, leaf(1), build([20, 10, 30, 5, 15])]) {
      expect(analyseTree(t)).toEqual({
        isBst: true,
        isAvl: true,
        orderViolations: [],
        balanceViolations: [],
        heightMismatches: [],
      })
    }
  })

  it('lists every offending balance node, lowest first', () => {
    const a = analyseTree(build([1, 2, 3, 4, 5]))
    expect(a.isBst).toBe(true)
    expect(a.isAvl).toBe(false)
    expect(a.balanceViolations.map((v) => v.key)).toEqual([3, 2, 1])
    expect(a.balanceViolations.map((v) => v.balanceFactor)).toEqual([2, 3, 4]) // ID 7.3: right-heavy chain is positive
  })

  it('first balance violation names the node checkAvl reports', () => {
    for (const keys of [[1, 2, 3], [1, 2, 3, 4, 5], [5, 4, 3, 2, 1], [3, 1, 2, 10, 20, 30]]) {
      const t = build(keys)
      const check = checkAvl(t)
      const a = analyseTree(t)
      expect(check.valid).toBe(false)
      if (!check.valid) expect(a.balanceViolations[0].key).toBe(check.node)
    }
  })

  it('violation kind comes from the conventions module', () => {
    const left = analyseTree(build([3, 2, 1])).balanceViolations[0]
    const right = analyseTree(build([1, 2, 3])).balanceViolations[0]
    expect(left.lean).toBe(leanOf(left.balanceFactor))
    expect(right.lean).toBe(leanOf(right.balanceFactor))
    expect(left.lean).not.toBe(right.lean)
  })

  it('BST-order violation: 12 is right of 5 but left of 10', () => {
    const t = makeNode(10, makeNode(5, null, leaf(12)), null)
    const a = analyseTree(t)
    expect(a.isBst).toBe(false)
    expect(a.orderViolations.map((v) => v.key)).toEqual([12])
  })

  it('a duplicate key is an order violation', () => {
    const t = makeNode(10, leaf(10), null)
    const a = analyseTree(t)
    expect(a.isBst).toBe(false)
    expect(a.orderViolations.map((v) => v.key)).toEqual([10])
  })

  it('stored height mismatch is reported without making the tree invalid', () => {
    const t: TreeNode = {
      key: 2,
      height: 1,
      left: { key: 1, height: 4, left: null, right: null },
      right: leaf(3),
    }
    const a = analyseTree(t)
    expect(a.heightMismatches).toEqual([{ key: 1, stored: 4, actual: 0 }])
    expect(a.isAvl).toBe(true)
  })

  it('does not modify the tree', () => {
    const t = build([1, 2, 3, 4, 5])
    const copy = structuredClone(t)
    analyseTree(t)
    expect(t).toEqual(copy)
  })
})
