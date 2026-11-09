import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { insertAvl } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { REBALANCE_CASES } from '../../src/engine/conventions'
import { INSERT_PSEUDOCODE, INSERT_PSEUDOCODE_LINE, replay, type TraceStep } from '../../src/engine/trace'
import type { Key, Tree } from '../../src/engine/tree'
import { deepFreeze, n } from './helpers'

const [LL, , LR] = REBALANCE_CASES

const buildAvl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insertAvl(t, k).tree, null)
const buildPlain = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
const summary = (trace: TraceStep[]) => trace.map((s) => [s.kind, s.nodes])

const keysAndKey = fc.tuple(
  fc.uniqueArray(fc.integer({ min: -500, max: 500 }), { maxLength: 30 }),
  fc.integer({ min: -500, max: 500 }),
)
const operations = [
  ['AVL insert', buildAvl, insertAvl],
  ['plain insert', buildPlain, insert],
] as const

describe('FR-ENG-06: trace for every operation', () => {
  describe.each(operations)('%s', (_name, build, op) => {
    it('replay on the starting tree reproduces the final tree', () => {
      fc.assert(
        fc.property(keysAndKey, ([keys, key]) => {
          const start = build(keys)
          const r = op(start, key)
          expect(replay(start, r.trace)).toEqual(r.tree)
        }),
      )
    })

    it('snapshot chain: first before is the start, each before is the previous after, last after is the result', () => {
      fc.assert(
        fc.property(keysAndKey, ([keys, key]) => {
          const start = build(keys)
          const { tree, trace } = op(start, key)
          expect(trace.length).toBeGreaterThan(0)
          expect(trace[0].before).toEqual(start)
          trace.forEach((s, i) => {
            expect(s.index).toBe(i)
            if (i > 0) expect(s.before).toEqual(trace[i - 1].after)
          })
          expect(trace[trace.length - 1].after).toEqual(tree)
        }),
      )
    })

    it('snapshots are immutable: the start is unchanged and later operations do not alter snapshots', () => {
      fc.assert(
        fc.property(keysAndKey, ([keys, key]) => {
          const start = deepFreeze(build(keys))
          const startCopy = structuredClone(start)
          const r = op(start, key)
          const snapshots = structuredClone(r.trace.map((s) => [s.before, s.after]))
          let t = r.tree
          for (const k of [key + 1, key - 1, key + 2]) t = op(t, k).tree
          expect(start).toEqual(startCopy)
          expect(r.trace.map((s) => [s.before, s.after])).toEqual(snapshots)
        }),
      )
    })

    it('every step carries the pseudocode line for its kind', () => {
      fc.assert(
        fc.property(keysAndKey, ([keys, key]) => {
          for (const s of op(build(keys), key).trace) {
            expect(s.pseudocodeLine).toBe(INSERT_PSEUDOCODE_LINE[s.kind])
            expect(s.pseudocodeLine).toBeGreaterThanOrEqual(1)
            expect(s.pseudocodeLine).toBeLessThanOrEqual(INSERT_PSEUDOCODE.length)
          }
        }),
      )
    })
  })

  it('insert trace contents, single rotation: 1 into the tree built from 3, 2', () => {
    const { trace } = insertAvl(buildAvl([3, 2]), 1)
    expect(summary(trace)).toEqual([
      ['compare', [3]],
      ['compare', [2]],
      ['insert', [1]],
      ['update-height', [2]],
      ['update-height', [3]],
      ['imbalance', [3, 2]],
      ['rotation', [3, 2]],
    ])
    for (const s of trace) {
      if (s.kind === 'imbalance' || s.kind === 'rotation') expect(s.rebalanceCase).toBe(LL)
      else expect(s.rebalanceCase).toBeUndefined()
    }
  })

  it('insert trace contents, double rotation: 2 into the tree built from 3, 1', () => {
    const { trace } = insertAvl(buildAvl([3, 1]), 2)
    const imbalance = trace.filter((s) => s.kind === 'imbalance')
    const rotations = trace.filter((s) => s.kind === 'rotation')
    expect(imbalance).toHaveLength(1)
    expect(imbalance[0].nodes[0]).toBe(3)
    expect(imbalance[0].rebalanceCase).toBe(LR)
    expect(rotations).toHaveLength(2)
    expect(rotations.map((s) => s.rebalanceCase)).toEqual([LR, LR])
    expect(rotations.map((s) => s.nodes[0])).toEqual([1, 3])
    expect(trace.indexOf(rotations[0])).toBe(trace.indexOf(imbalance[0]) + 1)
    expect(rotations[0].after).toEqual(n(3, n(2, n(1))))
    expect(rotations[1].after).toEqual(n(2, n(1), n(3)))
  })

  it('walk stops after the fix: no update-height step for an ancestor of z', () => {
    // z = 30, its parent 50 is the root.
    const { trace } = insertAvl(buildAvl([50, 30, 70, 20]), 10)
    const heights = trace.filter((s) => s.kind === 'update-height').map((s) => s.nodes[0])
    expect(heights).not.toContain(50)
    expect(trace[trace.length - 1].kind).toBe('rotation')
  })

  it('property: nothing follows the last rotation step', () => {
    fc.assert(
      fc.property(keysAndKey, ([keys, key]) => {
        const { trace } = insertAvl(buildAvl(keys), key)
        const lastRotation = trace.map((s) => s.kind).lastIndexOf('rotation')
        if (lastRotation >= 0) expect(lastRotation).toBe(trace.length - 1)
      }),
    )
  })

  it('replay of an empty trace returns the starting tree', () => {
    const start = buildAvl([2, 1, 3])
    expect(replay(start, [])).toBe(start)
  })

  it('replay rejects a trace that does not start from the given tree', () => {
    const { trace } = insertAvl(buildAvl([2, 1]), 3)
    expect(() => replay(buildAvl([5]), trace)).toThrow()
  })
})
