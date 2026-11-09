/**
 * Seeded random source (mulberry32). Seeds are stored and replayed, so this
 * algorithm must not change: a test pins its first outputs.
 */
export interface Rng {
  /** Next value in [0, 1). */
  next(): number
  /** Integer in [min, max], both inclusive. */
  int(min: number, max: number): number
}

export function createRng(seed: number): Rng {
  let state = seed | 0
  const next = (): number => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  return {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
  }
}
