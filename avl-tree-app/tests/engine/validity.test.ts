import { describe, it, expect } from 'vitest'
import { checkAvl } from '../../src/engine/validity'
import type { TreeNode } from '../../src/engine/tree'
import { makeNode } from '../../src/engine/tree'
import { build, leaf } from './helpers'

describe('FR-ENG-05: AVL validity check', () => {
  it('empty tree and single node are valid', () => {
    expect(checkAvl(null)).toEqual({ valid: true })
    expect(checkAvl(leaf(1))).toEqual({ valid: true })
  })
  it('a hand-built balanced tree is valid', () => {
    expect(checkAvl(build([20, 10, 30, 5, 15]))).toEqual({ valid: true })
  })
  it('chain 1,2,3 is invalid at the root (key 1)', () => {
    expect(checkAvl(build([1, 2, 3]))).toEqual({ valid: false, node: 1 })
  })
  it('invalid only deep in the tree reports the deep node', () => {
    // root 50 -> left 30 -> left 20 -> left 10 -> left 5 ; right of 50 is a 3-chain-ish to keep root in range
    const deep = makeNode(20, makeNode(10, leaf(5), null), null) // bf +2 at 20
    const left = makeNode(30, deep, leaf(35))
    const right = makeNode(70, leaf(60), makeNode(80, leaf(75), leaf(90)))
    const root = makeNode(50, left, right)
    expect(Math.abs(root.height)).toBeGreaterThan(0)
    expect(checkAvl(root)).toEqual({ valid: false, node: 20 })
  })
  it('[OPEN, assumed: lowest offender] ancestor and descendant both break the rule', () => {
    // 1 -> 2 -> 3 -> 4 -> 5 chain: nodes 1, 2, 3 are all unbalanced; lowest is 3
    expect(checkAvl(build([1, 2, 3, 4, 5]))).toEqual({ valid: false, node: 3 })
  })
  it('does not trust stored heights', () => {
    const lying: TreeNode = {
      key: 2,
      height: 9,
      left: { key: 1, height: 7, left: null, right: null },
      right: { key: 3, height: 5, left: null, right: null },
    }
    expect(checkAvl(lying)).toEqual({ valid: true })
  })
})

describe('FR-ENG-05: lowest offender', () => {
  it('reports the descendant when an ancestor and descendant both break the rule', () => {
    expect(checkAvl(build([1, 2, 3, 4, 5]))).toEqual({ valid: false, node: 3 })
  })
})
