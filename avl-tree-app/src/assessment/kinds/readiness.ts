// Kinds for the C9 readiness check (add-readiness-c9, design decision 1). Every value from the engine.
import { generateInsertSequence, variantSeed } from '../../engine/generate'
import { createRng } from '../../engine/random'
import { searchTrace } from '../../engine/search'
import { maxAvlHeight } from '../../modules/facts'
import type { Kind } from '../types'
import { avl, plain, unique } from './shared'

const TRIES = 200
const PICK = 0x85ebca6b

/** LO5: the worst-case search in an AVL tree of n keys, from the height bound (D13). */
export const searchBound: Kind = {
  type: 'choice',
  misconceptions: ['M-AVL-WORST-LINEAR', 'M-PERFECT-ONLY'],
  build(seed) {
    for (let k = 0; k < TRIES; k++) {
      const n = createRng(variantSeed(seed, 8000 + k)).int(10, 200)
      const height = maxAvlHeight(n)
      const worst = height + 1
      const best = Math.floor(Math.log2(n)) + 1
      if (new Set([worst, best, n]).size < 3) continue
      return {
        facts: { tree: null, keys: [], values: { n, worst, height, best } },
        numbers: unique([n, worst, height, best]),
        signature: String(n),
        answer: worst,
        wrong: [
          { value: n, misconception: 'M-AVL-WORST-LINEAR' },
          { value: best, misconception: 'M-PERFECT-ONLY' },
        ],
      }
    }
    throw new RangeError('search-bound: no size found')
  },
}

/** Combined item: the root after AVL inserts of listed keys. */
export const avlBuildRoot: Kind = {
  type: 'choice',
  misconceptions: ['M-FORGETS-REBALANCE', 'M-PERFECT-ONLY'],
  build(seed) {
    for (let k = 0; k < TRIES; k++) {
      const s = variantSeed(seed, 9000 + k)
      const keys = generateInsertSequence(s, { count: createRng(s ^ PICK).int(5, 6) })
      const avlRoot = avl(keys)!.key
      const plainRoot = plain(keys)!.key
      if (avlRoot === plainRoot) continue
      const sorted = [...keys].sort((a, b) => a - b)
      const middle = sorted[Math.floor(sorted.length / 2)]
      return {
        facts: { tree: null, keys, values: { avlRoot, plainRoot, middle } },
        numbers: unique([...keys]),
        signature: keys.join(','),
        answer: avlRoot,
        wrong: [
          { value: plainRoot, misconception: 'M-FORGETS-REBALANCE' },
          ...(middle !== avlRoot && middle !== plainRoot ? [{ value: middle, misconception: 'M-PERFECT-ONLY' as const }] : []),
        ],
      }
    }
    throw new RangeError('avl-build-root: no sequence found')
  },
}

/** Combined item: build the AVL tree of listed keys, then count the nodes a search visits. */
export const buildAndSearch: Kind = {
  type: 'number',
  misconceptions: ['M-FORGETS-REBALANCE', 'M-COUNTS-EDGES'],
  build(seed) {
    for (let k = 0; k < TRIES; k++) {
      const s = variantSeed(seed, 9500 + k)
      const keys = generateInsertSequence(s, { count: createRng(s ^ PICK).int(6, 7) })
      const tree = avl(keys)
      const pool = keys.filter((x) => x !== tree!.key)
      const target = pool[createRng(s ^ (PICK >>> 1)).int(0, pool.length - 1)]
      const steps = searchTrace(tree, target).steps
      const plainSteps = searchTrace(plain(keys), target).steps
      if (new Set([steps, plainSteps, steps - 1]).size < 3) continue
      return {
        facts: { tree: null, keys, target, values: { steps, plainSteps, edges: steps - 1 } },
        numbers: unique([...keys, steps, plainSteps, steps - 1]),
        signature: `${keys.join(',')}|${target}`,
        answer: steps,
        wrong: [
          { value: plainSteps, misconception: 'M-FORGETS-REBALANCE' },
          { value: steps - 1, misconception: 'M-COUNTS-EDGES' },
        ],
      }
    }
    throw new RangeError('build-and-search: no key found')
  },
}
