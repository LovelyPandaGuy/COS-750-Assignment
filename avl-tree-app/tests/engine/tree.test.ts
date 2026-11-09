import { describe, it, expect } from 'vitest'
import { EMPTY_HEIGHT, LEAF_HEIGHT } from '../../src/engine/conventions'
import { balanceFactorOf, height, makeNode } from '../../src/engine/tree'
import { build, leaf } from './helpers'

describe('FR-ENG-03: height', () => {
  it('empty tree uses the empty-tree height from the conventions module', () => {
    expect(height(null)).toBe(EMPTY_HEIGHT)
    expect(height(null)).toBe(-1)
  })
  it('single node uses the leaf height', () => {
    expect(height(leaf(5))).toBe(LEAF_HEIGHT)
    expect(height(leaf(5))).toBe(0)
  })
  it('stored height is one more than the taller child', () => {
    const t = makeNode(2, makeNode(1, leaf(0), null), null)
    expect(t.height).toBe(2)
    expect(makeNode(10, leaf(5), makeNode(20, null, leaf(25))).height).toBe(2)
  })
})

describe('FR-ENG-03: balance factor', () => {
  it('empty tree is 0', () => expect(balanceFactorOf(null)).toBe(0))
  it('single node is 0', () => expect(balanceFactorOf(leaf(1))).toBe(0))
  it('left-heavy chain 3,2,1 is +2', () => expect(balanceFactorOf(build([3, 2, 1]))).toBe(2))
  it('right-heavy chain 1,2,3 is -2', () => expect(balanceFactorOf(build([1, 2, 3]))).toBe(-2))
  it('one left child is +1', () => expect(balanceFactorOf(build([2, 1]))).toBe(1))
})
