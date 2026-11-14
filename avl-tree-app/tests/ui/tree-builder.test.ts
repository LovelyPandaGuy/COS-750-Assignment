import { describe, expect, it } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { shapeString } from '../../src/engine/shape'
import type { Tree } from '../../src/engine/tree'
import { builderReducer, initBuilder, targetsOf } from '../../src/ui/lesson/questions/builder'

// Spec: add-live-lesson-questions / lesson-questions "The tree builder" (design 4, D110).
const avl = (keys: number[]) => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

describe('tree builder reducer (ID 8.3, D110)', () => {
  it('the empty tree has one target, the root; then two around it', () => {
    expect(targetsOf(null)).toEqual([{ parent: null, side: null }])
    let s = initBuilder(null, [10, 20], null)
    s = builderReducer(s, { type: 'place', target: { parent: null, side: null } })
    expect(targetsOf(s.tree)).toEqual([
      { parent: 10, side: 'left' },
      { parent: 10, side: 'right' },
    ])
    expect(s.pending).toEqual([20])
  })

  it('every empty branch is a target, so a wrong placement is drawn', () => {
    let s = initBuilder(avl([20, 10, 30]), [25], null)
    s = builderReducer(s, { type: 'place', target: { parent: 10, side: 'left' } })
    expect(shapeString(s.tree)).toBe('20(10(25, ·), 30)')
    expect(s.log).toEqual([{ type: 'place', key: 25, parent: 10, side: 'left' }])
  })

  it('rotate, refuse an impossible rotation, undo and reset', () => {
    let s = initBuilder(avl([20, 10, 30]), [], null)
    s = builderReducer(s, { type: 'select', key: 20 })
    s = builderReducer(s, { type: 'rotate', dir: 'right' })
    expect(shapeString(s.tree)).toBe('10(·, 20(·, 30))')
    s = builderReducer(s, { type: 'select', key: 30 })
    s = builderReducer(s, { type: 'rotate', dir: 'left' })
    expect(s.refused).toEqual({ key: 30, side: 'right' })
    s = builderReducer(s, { type: 'undo' })
    expect(shapeString(s.tree)).toBe('20(10, 30)')
    s = builderReducer(s, { type: 'select', key: 20 })
    s = builderReducer(s, { type: 'rotate', dir: 'left' })
    s = builderReducer(s, { type: 'reset' })
    expect(shapeString(s.tree)).toBe('20(10, 30)')
    expect(s.log).toEqual([])
  })

  it('delete removes the leaf once', () => {
    let s = initBuilder(avl([20, 10, 30]), [], 10)
    s = builderReducer(s, { type: 'delete' })
    expect(shapeString(s.tree)).toBe('20(·, 30)')
    expect(s.deletable).toBeNull()
  })
})
