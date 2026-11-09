import { describe, it, expect } from 'vitest'
import { createRng } from '../../src/engine/random'

const draw = (seed: number, n: number) => {
  const r = createRng(seed)
  return Array.from({ length: n }, () => r.next())
}

describe('FR-ASM-07: deterministic random source', () => {
  it('same seed, same values', () => expect(draw(42, 10)).toEqual(draw(42, 10)))
  it('different seeds differ', () => expect(draw(1, 5)).not.toEqual(draw(2, 5)))
  it('values stay in [0, 1)', () => {
    for (const v of draw(7, 1000)) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
  it('pinned outputs for seed 12345 (seeds are stored and replayed)', () => {
    expect(draw(12345, 3)).toEqual([0.9797282677609473, 0.3067522644996643, 0.484205421525985])
  })
  it('int stays within the inclusive range', () => {
    const r = createRng(3)
    for (let i = 0; i < 500; i++) {
      const v = r.int(5, 9)
      expect(v).toBeGreaterThanOrEqual(5)
      expect(v).toBeLessThanOrEqual(9)
    }
  })
})
