import { describe, it, expect } from 'vitest'
import {
  generateCaseSequence,
  generateInsertSequence,
  generateTree,
  variantSeed,
} from '../../src/engine/generate'
import { avlInsert } from '../../src/engine/avl'
import { analyseTree } from '../../src/engine/analyse'
import { REBALANCE_CASES } from '../../src/engine/conventions'
import type { Tree } from '../../src/engine/tree'
import { inOrder } from './helpers'

const seeds = Array.from({ length: 50 }, (_, i) => i + 1)

describe('FR-ASM-07: seeded insert sequences', () => {
  it('has the right length, range and distinctness', () => {
    for (const s of seeds) {
      const seq = generateInsertSequence(s, { count: 7, min: 1, max: 99 })
      expect(seq).toHaveLength(7)
      expect(new Set(seq).size).toBe(7)
      for (const k of seq) {
        expect(Number.isInteger(k)).toBe(true)
        expect(k).toBeGreaterThanOrEqual(1)
        expect(k).toBeLessThanOrEqual(99)
      }
    }
  })
  it('is repeatable', () => {
    expect(generateInsertSequence(9, { count: 8 })).toEqual(generateInsertSequence(9, { count: 8 }))
  })
  it('different seeds give different sequences', () => {
    expect(generateInsertSequence(1)).not.toEqual(generateInsertSequence(2))
  })
  it('rejects a range that is too small', () => {
    expect(() => generateInsertSequence(1, { count: 10, min: 1, max: 5 })).toThrow(RangeError)
  })
})

describe('FR-ASM-07: seeded trees', () => {
  it('AVL trees are valid BSTs whose in-order is the sorted keys', () => {
    for (const s of seeds) {
      const { keys, tree } = generateTree(s, { balanced: true })
      const a = analyseTree(tree)
      expect(a.isAvl).toBe(true)
      expect(a.isBst).toBe(true)
      expect(inOrder(tree)).toEqual([...keys].sort((x, y) => x - y))
    }
  })
  it('plain trees are BSTs whose in-order is the sorted keys', () => {
    for (const s of seeds) {
      const { keys, tree } = generateTree(s, { balanced: false })
      expect(analyseTree(tree).isBst).toBe(true)
      expect(inOrder(tree)).toEqual([...keys].sort((x, y) => x - y))
    }
  })
  it('is repeatable', () => {
    expect(generateTree(5, { balanced: true })).toEqual(generateTree(5, { balanced: true }))
  })
})

describe('FR-ASM-07: case-targeted sequences', () => {
  for (const c of REBALANCE_CASES) {
    it(`last insert triggers ${c} for seeds 1 to 50`, () => {
      for (const s of seeds) {
        const seq = generateCaseSequence(s, c)
        expect(new Set(seq).size).toBe(seq.length)
        let tree: Tree = null
        let last = null
        for (const k of seq) {
          const r = avlInsert(tree, k)
          tree = r.tree
          last = r.rebalance
        }
        expect(last?.case).toBe(c)
      }
    })
  }
  it('is repeatable', () => {
    expect(generateCaseSequence(4, 'LR')).toEqual(generateCaseSequence(4, 'LR'))
  })
  it('rejects a sequence too short to rebalance', () => {
    expect(() => generateCaseSequence(1, 'LL', { count: 2 })).toThrow(RangeError)
  })
})

describe('D9, FR-ASM-07: retry variants', () => {
  it('attempts 0 to 3 give distinct seeds and distinct sequences', () => {
    for (let base = 1; base <= 20; base++) {
      const attemptSeeds = [0, 1, 2, 3].map((a) => variantSeed(base, a))
      expect(new Set(attemptSeeds).size).toBe(4)
      const seqs = attemptSeeds.map((s) => generateInsertSequence(s).join(','))
      expect(new Set(seqs).size).toBe(4)
    }
  })
  it('is repeatable', () => {
    expect(variantSeed(7, 2)).toBe(variantSeed(7, 2))
  })
})

