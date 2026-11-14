import { describe, expect, it } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { shapeString } from '../../src/engine/shape'
import type { Tree } from '../../src/engine/tree'
import type { BuilderStep } from '../../src/live/mark'
import { editLogEntries } from '../../src/ui/editor/editLog'
import { builderReducer, initBuilder, targetsOf } from '../../src/ui/lesson/questions/builder'

// Spec: add-live-lesson-questions / lesson-questions "The tree builder" (design 4, D110).
const avl = (keys: number[]) => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

describe('tree builder reducer (ID 8.3, D110)', () => {
  it('the empty tree has one target, the root; then two around it', () => {
    expect(targetsOf(null)).toEqual([{ parent: null, side: null }])
    let s = initBuilder(null, [10, 20], null)
    s = builderReducer(builderReducer(s, { type: 'hold' }), { type: 'place', target: { parent: null, side: null } })
    expect(targetsOf(s.tree)).toEqual([
      { parent: 10, side: 'left' },
      { parent: 10, side: 'right' },
    ])
    expect(s.pending).toEqual([20])
  })

  it('every empty branch is a target, so a wrong placement is drawn', () => {
    let s = initBuilder(avl([20, 10, 30]), [25], null)
    s = builderReducer(builderReducer(s, { type: 'hold' }), { type: 'place', target: { parent: 10, side: 'left' } })
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

// Spec: revamp-tree-editor / tree-editor "Select the next key, then place it", "The in-order strip shows
// before and after", "The edit log" (D132, D134, LO4).
describe('tree editor reducer: held key (D132)', () => {
  it('place needs a held key, and placing lets go', () => {
    let s = initBuilder(null, [10, 20], null)
    expect(s.held).toBe(false)
    s = builderReducer(s, { type: 'place', target: { parent: null, side: null } })
    expect(s.tree).toBeNull()
    s = builderReducer(s, { type: 'hold' })
    expect(s.held).toBe(true)
    s = builderReducer(s, { type: 'place', target: { parent: null, side: null } })
    expect(shapeString(s.tree)).toBe('10')
    expect(s.held).toBe(false)
    expect(s.pending).toEqual([20])
  })

  it('let go, and selecting a node lets go', () => {
    let s = initBuilder(avl([20, 10, 30]), [25], null)
    s = builderReducer(s, { type: 'hold' })
    s = builderReducer(s, { type: 'letGo' })
    expect(s.held).toBe(false)
    s = builderReducer(s, { type: 'hold' })
    s = builderReducer(s, { type: 'select', key: 20 })
    expect(s.held).toBe(false)
    expect(s.selected).toBe(20)
  })

  it('nothing to hold when every key is placed', () => {
    let s = initBuilder(avl([20, 10, 30]), [], null)
    s = builderReducer(s, { type: 'hold' })
    expect(s.held).toBe(false)
  })

  it('undo and reset let go', () => {
    let s = initBuilder(null, [10, 20], null)
    s = builderReducer(s, { type: 'hold' })
    s = builderReducer(builderReducer(s, { type: 'hold' }), { type: 'place', target: { parent: null, side: null } })
    s = builderReducer(s, { type: 'hold' })
    s = builderReducer(s, { type: 'undo' })
    expect(s.held).toBe(false)
    s = builderReducer(s, { type: 'hold' })
    s = builderReducer(s, { type: 'reset' })
    expect(s.held).toBe(false)
  })
})

describe('tree editor reducer: the last rotation (ID 9.6, LO4)', () => {
  it('records the in-order before and after, which are equal', () => {
    let s = initBuilder(avl([20, 10, 30]), [], null)
    s = builderReducer(s, { type: 'select', key: 20 })
    s = builderReducer(s, { type: 'rotate', dir: 'right' })
    expect(s.lastRotation).toEqual({ before: [10, 20, 30], after: [10, 20, 30] })
  })

  it('a refused rotation records nothing', () => {
    let s = initBuilder(avl([20, 10, 30]), [], null)
    s = builderReducer(s, { type: 'select', key: 30 })
    s = builderReducer(s, { type: 'rotate', dir: 'left' })
    expect(s.lastRotation).toBeNull()
  })

  it('cleared by a placement, a delete, undo and reset', () => {
    const rotated = (keys: number[], pending: number[], deletable: number | null) => {
      let s = initBuilder(avl(keys), pending, deletable)
      s = builderReducer(s, { type: 'select', key: keys[0] })
      return builderReducer(s, { type: 'rotate', dir: 'right' })
    }
    let s = rotated([20, 10, 30], [40], null)
    s = builderReducer(s, { type: 'hold' })
    s = builderReducer(builderReducer(s, { type: 'hold' }), { type: 'place', target: { parent: 30, side: 'right' } })
    expect(s.lastRotation).toBeNull()
    s = rotated([20, 10, 30], [], 30)
    s = builderReducer(s, { type: 'delete' })
    expect(s.lastRotation).toBeNull()
    s = builderReducer(rotated([20, 10, 30], [], null), { type: 'undo' })
    expect(s.lastRotation).toBeNull()
    s = builderReducer(rotated([20, 10, 30], [], null), { type: 'reset' })
    expect(s.lastRotation).toBeNull()
  })
})

describe('tree editor: edit log sentences (D134, FR-VIS-07)', () => {
  it('one sentence per step, in order', () => {
    const log: BuilderStep[] = [
      { type: 'place', key: 10, parent: null, side: null },
      { type: 'place', key: 20, parent: 10, side: 'right' },
      { type: 'place', key: 35, parent: 40, side: 'left' },
      { type: 'rotate', about: 40, dir: 'right' },
      { type: 'delete', key: 10 },
    ]
    expect(editLogEntries(log, String)).toEqual([
      'Placed 10 at the root',
      'Placed 20 as the right child of 10',
      'Placed 35 as the left child of 40',
      'Rotated right at 40',
      'Deleted 10',
    ])
  })

  it('keys are written as the question writes them', () => {
    const letter = (k: number) => String.fromCharCode(64 + k)
    expect(editLogEntries([{ type: 'place', key: 2, parent: 1, side: 'right' }], letter)).toEqual(['Placed B as the right child of A'])
  })

  it('no steps, no sentences', () => {
    expect(editLogEntries([], String)).toEqual([])
  })
})
