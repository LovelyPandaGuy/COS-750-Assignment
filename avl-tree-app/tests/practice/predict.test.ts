import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { avlInsert, avlInsertTrace } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { compare, predictionFor } from '../../src/practice/predict'

// Spec: add-predict-and-do-it-yourself / predict-first. Requirement IDs: FR-VIS-05, FR-ENG-06. Outcomes: LO6, LO7.

const leaf = (k: Key) => makeNode(k, null, null)
const T1 = makeNode(30, leaf(20), null) // insert 10: LL at 30
const T2 = makeNode(30, leaf(10), null) // insert 20: LR at 30
const T3 = makeNode(40, makeNode(20, leaf(10), null), leaf(60)) // insert 5: LL at 20, below the root
const BAL = makeNode(20, leaf(10), leaf(30)) // insert 5: no imbalance

describe('FR-VIS-05 prediction kinds and options', () => {
  it('offers the insertion path, in order, then None for node and root', () => {
    expect(predictionFor(T3, 5, 'node').options).toEqual([40, 20, 10, 'none'])
    expect(predictionFor(T3, 5, 'root').options).toEqual([40, 20, 10, 'none'])
  })

  it('offers the four cases, then None, for the case prediction', () => {
    expect(predictionFor(T1, 10, 'case').options).toEqual(['LL', 'RR', 'LR', 'RL', 'none'])
  })
})

describe('FR-VIS-05 / FR-ENG-06 the answer comes from the engine', () => {
  it('single rotation, LL', () => {
    expect(predictionFor(T1, 10, 'node').answer).toBe(30)
    expect(predictionFor(T1, 10, 'case').answer).toBe('LL')
    expect(predictionFor(T1, 10, 'root').answer).toBe(20)
  })

  it('double rotation, LR', () => {
    expect(predictionFor(T2, 20, 'node').answer).toBe(30)
    expect(predictionFor(T2, 20, 'case').answer).toBe('LR')
    expect(predictionFor(T2, 20, 'root').answer).toBe(20)
  })

  it('imbalance below the root', () => {
    expect(predictionFor(T3, 5, 'node').answer).toBe(20)
    expect(predictionFor(T3, 5, 'case').answer).toBe('LL')
    expect(predictionFor(T3, 5, 'root').answer).toBe(10)
  })

  it('no imbalance: every answer is none and there is no imbalance step', () => {
    for (const kind of ['node', 'case', 'root'] as const) {
      const q = predictionFor(BAL, 5, kind)
      expect(q.answer).toBe('none')
      expect(q.stepIndex).toBeNull()
    }
  })

  it('points at the imbalance step of the trace', () => {
    const trace = avlInsertTrace(T1, 10).trace
    expect(predictionFor(T1, 10, 'node').stepIndex).toBe(trace.findIndex((s) => s.kind === 'imbalance'))
  })

  it('agrees with avlInsert for any AVL tree and any new key', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { minLength: 1, maxLength: 15 }),
        fc.integer({ min: 1, max: 99 }),
        (keys, key) => {
          const tree = keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
          fc.pre(!keys.includes(key))
          const r = avlInsert(tree, key)
          expect(predictionFor(tree, key, 'node').answer).toBe(r.rebalance?.node ?? 'none')
          expect(predictionFor(tree, key, 'case').answer).toBe(r.rebalance?.case ?? 'none')
        },
      ),
    )
  })
})

describe('FR-VIS-05 comparing a prediction with the result', () => {
  it('match', () => {
    expect(compare(predictionFor(T1, 10, 'node'), 30)).toMatchObject({ tag: 'match' })
    expect(compare(predictionFor(BAL, 5, 'node'), 'none')).toMatchObject({ tag: 'match' })
    expect(compare(predictionFor(T2, 20, 'case'), 'LR')).toMatchObject({ tag: 'match' })
  })

  it('predicted node still in range', () => {
    expect(compare(predictionFor(T1, 10, 'node'), 20)).toMatchObject({
      tag: 'in-range',
      predicted: 20,
      predictedBf: 1,
      z: 30,
      zBf: 2,
    })
  })

  it('predicted node also out of balance but higher', () => {
    expect(compare(predictionFor(T3, 5, 'node'), 40)).toMatchObject({
      tag: 'also-unbalanced-higher',
      predicted: 40,
      predictedBf: 2,
      z: 20,
      zBf: 2,
    })
  })

  it('predicted none, but a node is unbalanced', () => {
    expect(compare(predictionFor(T1, 10, 'node'), 'none')).toMatchObject({ tag: 'none-but-unbalanced', z: 30, zBf: 2 })
    expect(compare(predictionFor(T2, 20, 'case'), 'none')).toMatchObject({ tag: 'none-but-unbalanced', z: 30, zBf: 2 })
  })

  it('predicted a node, but none is unbalanced', () => {
    expect(compare(predictionFor(BAL, 5, 'node'), 10)).toMatchObject({
      tag: 'unbalanced-none-expected',
      predicted: 10,
      predictedBf: 1,
    })
  })

  it('predicted a case, but none applies', () => {
    expect(compare(predictionFor(BAL, 5, 'case'), 'LL')).toMatchObject({
      tag: 'unbalanced-none-expected',
      predicted: 'LL',
      predictedBf: null,
    })
  })

  it('case mismatch says which way z and its taller child lean', () => {
    expect(compare(predictionFor(T2, 20, 'case'), 'LL')).toMatchObject({
      tag: 'case-mismatch',
      predicted: 'LL',
      actual: 'LR',
      z: 30,
      y: 10,
      zLeansLeft: true,
      yLeansLeft: false,
    })
  })

  it('new root mismatch names the node lifted to the top', () => {
    expect(compare(predictionFor(T2, 20, 'root'), 10)).toMatchObject({ tag: 'root-mismatch', predicted: 10, actual: 20 })
  })

  it('does not change the tree it was given', () => {
    const before = JSON.stringify(T3)
    predictionFor(T3, 5, 'node')
    expect(JSON.stringify(T3)).toBe(before)
    expect(insert(T3, 5).inserted).toBe(true)
  })
})
