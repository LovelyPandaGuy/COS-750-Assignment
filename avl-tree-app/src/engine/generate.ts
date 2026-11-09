import { avlInsert } from './avl'
import { insert } from './bst'
import type { RebalanceCase } from './conventions'
import { createRng } from './random'
import type { Key, Tree } from './tree'

export interface SequenceOptions {
  /** How many keys. Default 7. */
  count?: number
  /** Smallest key, inclusive. Default 1. */
  min?: number
  /** Largest key, inclusive. Default 99. */
  max?: number
}

export interface TreeOptions extends SequenceOptions {
  /** AVL insert when true (default), plain BST insert when false. */
  balanced?: boolean
}

const DEFAULTS = { count: 7, min: 1, max: 99 }
const CASE_ATTEMPTS = 100

/** Seed for a retry attempt, derived from the base seed (D9). */
export function variantSeed(base: number, attempt: number): number {
  let h = (base >>> 0) ^ Math.imul(attempt + 1, 0x9e3779b1)
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  h ^= h >>> 16
  return h >>> 0
}

/** Distinct integer keys in a seeded random order. */
export function generateInsertSequence(seed: number, options: SequenceOptions = {}): Key[] {
  const { count, min, max } = { ...DEFAULTS, ...options }
  const size = max - min + 1
  if (!Number.isInteger(count) || count < 0 || size < 1 || count > size) {
    throw new RangeError(`cannot draw ${count} distinct keys from ${min} to ${max}`)
  }
  // Partial Fisher-Yates over a virtual array, so cost depends on count only.
  const rng = createRng(seed)
  const swapped = new Map<number, number>()
  const keys: Key[] = []
  for (let i = 0; i < count; i++) {
    const j = rng.int(i, size - 1)
    const atI = swapped.get(i) ?? i
    const atJ = swapped.get(j) ?? j
    swapped.set(j, atI)
    swapped.set(i, atJ)
    keys.push(min + atJ)
  }
  return keys
}

/** A tree built from a seeded insert sequence. */
export function generateTree(seed: number, options: TreeOptions = {}): { keys: Key[]; tree: Tree } {
  const { balanced = true, ...sequence } = options
  const keys = generateInsertSequence(seed, sequence)
  const tree = keys.reduce<Tree>(
    (t, k) => (balanced ? avlInsert(t, k).tree : insert(t, k).tree),
    null,
  )
  return { keys, tree }
}

/**
 * An insert sequence whose last AVL insert triggers the given case. The
 * engine decides the case, so the result is correct by construction.
 */
export function generateCaseSequence(
  seed: number,
  rebalanceCase: RebalanceCase,
  options: SequenceOptions = {},
): Key[] {
  const { count, min, max } = { ...DEFAULTS, ...options }
  if (count < 3) throw new RangeError('a rebalance needs at least 3 keys')

  for (let attempt = 0; attempt < CASE_ATTEMPTS; attempt++) {
    const sub = variantSeed(seed, attempt)
    const base = generateInsertSequence(sub, { count: count - 1, min, max })
    const tree = base.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
    const used = new Set(base)
    const candidates: Key[] = []
    for (let k = min; k <= max; k++) {
      if (!used.has(k) && avlInsert(tree, k).rebalance?.case === rebalanceCase) candidates.push(k)
    }
    if (candidates.length > 0) {
      const pick = createRng(variantSeed(seed, attempt + CASE_ATTEMPTS)).int(0, candidates.length - 1)
      return [...base, candidates[pick]]
    }
  }
  throw new RangeError(`no ${rebalanceCase} sequence found for these options`)
}
