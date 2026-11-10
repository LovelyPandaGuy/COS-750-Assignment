import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { avlInsert, avlInsertTrace } from '../../src/engine/avl'
import { searchTrace } from '../../src/engine/search'
import { replay, type TraceStep } from '../../src/engine/trace'
import { rotateLeft, rotateRight } from '../../src/engine/rotations'
import type { Key, Tree } from '../../src/engine/tree'

const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

const keysArb = fc.uniqueArray(fc.integer({ min: 0, max: 100 }), { maxLength: 15 })
const keyArb = fc.integer({ min: -2, max: 102 })

// Snapshots replaced by an obviously wrong tree, so replay cannot read them.
const blind = (trace: TraceStep[]): TraceStep[] =>
  trace.map((s) => ({ ...s, before: { key: -999, height: 0, left: null, right: null }, after: null }))

describe('FR-ENG-06: trace replay', () => {
  it('property: insert traces replay to the result, prefix by prefix', () => {
    fc.assert(
      fc.property(keysArb, keyArb, (keys, key) => {
        const T = avl(keys)
        const r = avlInsertTrace(T, key)
        expect(replay(T, r.trace)).toEqual(r.tree)
        for (let i = 1; i <= r.trace.length; i++) {
          expect(replay(T, r.trace.slice(0, i))).toEqual(r.trace[i - 1].after)
        }
      }),
    )
  })

  it('replay does not read the snapshots', () => {
    const T = avl([10, 20, 30, 40, 50])
    const r = avlInsertTrace(T, 25)
    expect(replay(T, blind(r.trace))).toEqual(r.tree)
  })

  it('property: search traces replay to the same tree', () => {
    fc.assert(
      fc.property(keysArb, keyArb, fc.constantFrom('loop' as const, 'recursive' as const), (keys, key, form) => {
        const T = avl(keys)
        expect(replay(T, searchTrace(T, key, form).trace)).toEqual(T)
      }),
    )
  })

  it('rotation direction from keys', () => {
    const T = avl([30, 10])
    const r = avlInsertTrace(T, 20)
    const [first, second] = r.trace.filter((s) => s.kind === 'rotation')
    expect(first.nodes).toEqual([10, 20])
    expect(second.nodes).toEqual([30, 20])
    const upToFirst = r.trace.slice(0, first.index + 1)
    const beforeFirst = replay(T, r.trace.slice(0, first.index))
    // Left rotation at 10 inside the left subtree of 30.
    expect(replay(T, upToFirst)?.left).toEqual(rotateLeft(beforeFirst!.left))
    // Right rotation at 30 at the root.
    expect(replay(T, r.trace)).toEqual(rotateRight(replay(T, upToFirst)))
  })

  it('empty trace', () => {
    const T = avl([20, 10, 30])
    expect(replay(T, [])).toEqual(T)
    expect(replay(null, [])).toBeNull()
  })

  it('delete steps refused', () => {
    const T = avl([20, 10, 30])
    const step: TraceStep = { index: 0, kind: 'delete', nodes: [10], before: T, after: T, pseudocodeLine: 1 }
    expect(() => replay(T, [step])).toThrow(/delete/)
  })
})
