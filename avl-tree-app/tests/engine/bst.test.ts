import { describe, it, expect } from 'vitest'
import { insert, remove, search } from '../../src/engine/bst'
import { height, type Tree } from '../../src/engine/tree'
import { build, inOrder } from './helpers'

describe('FR-ENG-01: insert', () => {
  it('into the empty tree gives a single node', () => {
    const r = insert(null, 10)
    expect(r.inserted).toBe(true)
    expect(r.tree).toMatchObject({ key: 10, left: null, right: null })
  })
  it('typical inserts keep in-order sorted', () => {
    expect(inOrder(build([20, 10, 30, 5]))).toEqual([5, 10, 20, 30])
  })
  it('duplicate key leaves the tree unchanged', () => {
    const t = build([10, 5, 15])
    const r = insert(t, 10)
    expect(r.inserted).toBe(false)
    expect(r.tree).toEqual(t)
  })
  it('FR-ENG-07 groundwork: ascending 1..15 is a 15-level chain', () => {
    const t = build(Array.from({ length: 15 }, (_, i) => i + 1))
    expect(height(t)).toBe(14)
  })
})

describe('FR-ENG-01: search', () => {
  const t = build([10, 5, 20])
  it('finds a present key', () => expect(search(t, 5).found).toBe(true))
  it('does not find a missing key', () => expect(search(t, 99).found).toBe(false))
  it('does not find anything in the empty tree', () => expect(search(null, 1).found).toBe(false))
})

describe('FR-ENG-01: delete', () => {
  it('a leaf', () => {
    const r = remove(build([20, 10, 30]), 10)
    expect(r.deleted).toBe(true)
    expect(inOrder(r.tree)).toEqual([20, 30])
  })
  it('a node with one child', () => {
    const r = remove(build([20, 10, 30, 25]), 30)
    expect(r.deleted).toBe(true)
    expect(inOrder(r.tree)).toEqual([10, 20, 25])
    expect(r.tree?.right?.key).toBe(25)
  })
  it('a node with two children takes the in-order successor', () => {
    const r = remove(build([20, 10, 30, 25]), 20)
    expect(r.deleted).toBe(true)
    expect(r.tree?.key).toBe(25)
    expect(inOrder(r.tree)).toEqual([10, 25, 30])
  })
  it('a missing key leaves the tree unchanged', () => {
    const t = build([20, 10, 30])
    const r = remove(t, 99)
    expect(r.deleted).toBe(false)
    expect(r.tree).toEqual(t)
  })
  it('the empty tree', () => {
    const r = remove(null, 1)
    expect(r.deleted).toBe(false)
    expect(r.tree).toBeNull()
  })
  it('stored heights stay correct after delete', () => {
    const r = remove(build([20, 10, 30, 5, 15, 25, 35, 1]), 20)
    const check = (t: Tree): number =>
      t === null ? height(null) : Math.max(check(t.left), check(t.right)) + 1
    const verify = (t: Tree): void => {
      if (t === null) return
      expect(t.height).toBe(check(t))
      verify(t.left)
      verify(t.right)
    }
    verify(r.tree)
  })
})

describe('FR-ENG-01: immutability', () => {
  it('insert and delete do not modify the input tree', () => {
    const t = build([20, 10, 30, 25])
    const copy = structuredClone(t)
    insert(t, 5)
    remove(t, 20)
    remove(t, 10)
    expect(t).toEqual(copy)
  })
})
