import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { rotateLeft, rotateRight } from '../../src/engine/rotations'
import { makeNode, type Tree, type TreeNode } from '../../src/engine/tree'
import { build, inOrder, leaf } from './helpers'

describe('FR-ENG-02: rotations', () => {
  it('right rotation at 30 with left chain 20, 10', () => {
    const t = makeNode(30, makeNode(20, leaf(10), null), null)
    const r = rotateRight(t)
    expect(r).toMatchObject({ key: 20, left: { key: 10 }, right: { key: 30 } })
    expect(r?.height).toBe(1)
    expect(inOrder(r)).toEqual([10, 20, 30])
  })
  it('left rotation at 10 with right chain 20, 30', () => {
    const t = makeNode(10, null, makeNode(20, null, leaf(30)))
    const r = rotateLeft(t)
    expect(r).toMatchObject({ key: 20, left: { key: 10 }, right: { key: 30 } })
    expect(r?.height).toBe(1)
    expect(inOrder(r)).toEqual([10, 20, 30])
  })
  it('left rotation with no right child returns the tree unchanged', () => {
    const t = build([2, 1])
    expect(rotateLeft(t)).toEqual(t)
  })
  it('right rotation with no left child returns the tree unchanged', () => {
    const t = build([1, 2])
    expect(rotateRight(t)).toEqual(t)
  })
  it('rotating the empty tree returns the empty tree', () => {
    expect(rotateLeft(null)).toBeNull()
    expect(rotateRight(null)).toBeNull()
  })

  it('property: in-order preserved and heights correct after any rotation at the root or a subtree', () => {
    const verify = (t: Tree): number => {
      if (t === null) return -1
      const h = Math.max(verify(t.left), verify(t.right)) + 1
      expect(t.height).toBe(h)
      return h
    }
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 200 }), { maxLength: 30 }),
        fc.boolean(),
        fc.boolean(),
        (keys, goLeft, rotLeft) => {
          const tree = build(keys)
          const rotate = rotLeft ? rotateLeft : rotateRight
          const before = inOrder(tree)
          // rotate at the root
          expect(inOrder(rotate(tree))).toEqual(before)
          verify(rotate(tree))
          // rotate at a child of the root, reattach it
          if (tree) {
            const child = goLeft ? tree.left : tree.right
            const rotated = rotate(child)
            const rebuilt: TreeNode = goLeft
              ? makeNode(tree.key, rotated, tree.right)
              : makeNode(tree.key, tree.left, rotated)
            expect(inOrder(rebuilt)).toEqual(before)
            verify(rebuilt)
          }
        },
      ),
    )
  })
})
