// Kinds for the C9 readiness check (add-readiness-c9, design decision 2). Every value comes from the
// engine; the bank item adds only wording.
import { avlInsertTrace } from '../../engine/avl'
import { generateInsertSequence, variantSeed } from '../../engine/generate'
import { createRng } from '../../engine/random'
import type { TraceStep } from '../../engine/trace'
import type { Key, Tree } from '../../engine/tree'
import { READINESS_BUILD_KEYS } from '../../modules/config'
import { searchBounds } from '../../modules/facts'
import { shapeKey } from '../shape'
import type { Kind } from '../types'
import { avl, plain, unique } from './shared'
import { searchProblem } from './trees'

const TRIES = 50
/** Salt so the search target pick does not reuse the sequence's own draws. */
const PICK = 0x27d4eb2f
/** Key counts for the worst-case search item (mechanics, not policy). */
const WORST_SEARCH_MIN = 16
const WORST_SEARCH_MAX = 4096

/** A sequence whose AVL build rotates at least once, pinned for the rare seed whose search finds none. */
export const BUILD_FALLBACK: readonly Key[] = [30, 20, 10, 40, 50, 25]

/** The engine's insert trace for building from empty, one key after another, renumbered from 0. */
function buildTrace(keys: readonly Key[]): { tree: Tree; trace: TraceStep[]; rotations: number } {
  let tree: Tree = null
  const trace: TraceStep[] = []
  for (const k of keys) {
    const r = avlInsertTrace(tree, k)
    for (const step of r.trace) trace.push({ ...step, index: trace.length })
    tree = r.tree
  }
  return { tree, trace, rotations: trace.filter((s) => s.kind === 'rotation').length }
}

/** The C9 combined items' keys: the first variant whose AVL build rotates and differs from the plain BST. */
export function buildSequence(seed: number): Key[] {
  for (let k = 0; k < TRIES; k++) {
    const keys = generateInsertSequence(variantSeed(seed, k), { count: READINESS_BUILD_KEYS })
    if (buildTrace(keys).rotations > 0 && shapeKey(avl(keys)) !== shapeKey(plain(keys))) return keys
  }
  return [...BUILD_FALLBACK]
}

export const worstSearch: Kind = {
  type: 'choice',
  misconceptions: ['M-ASSUMES-BALANCED', 'M-SEARCH-VISITS-ALL'],
  build(seed) {
    const n = createRng(seed).int(WORST_SEARCH_MIN, WORST_SEARCH_MAX)
    const b = searchBounds(n)
    return {
      facts: { tree: null, keys: [], values: { n, plainWorst: b.worst, avlWorst: b.avlWorst } },
      numbers: unique([n, b.worst, b.avlWorst]),
      signature: String(n),
      answer: 'plain-n-avl-log',
      wrong: [
        { value: 'both-log', misconception: 'M-ASSUMES-BALANCED' },
        { value: 'both-n', misconception: 'M-SEARCH-VISITS-ALL' },
      ],
    }
  },
}

export const buildAvl: Kind = {
  type: 'tree',
  misconceptions: ['M-FORGETS-REBALANCE'],
  build(seed) {
    const keys = buildSequence(seed)
    const { tree, trace } = buildTrace(keys)
    return {
      facts: { tree: null, keys, values: { count: keys.length } },
      numbers: unique([...keys, keys.length]),
      signature: keys.join(','),
      answer: tree,
      wrong: [{ value: plain(keys), misconception: 'M-FORGETS-REBALANCE' }],
      trace,
    }
  },
}

export const searchBuilt: Kind = {
  type: 'number',
  misconceptions: ['M-COUNTS-EDGES', 'M-SEARCH-VISITS-ALL'],
  build(seed) {
    const keys = buildSequence(seed)
    const tree = avl(keys)
    const candidates = keys.filter((k) => k !== tree!.key)
    const target = candidates[createRng(seed ^ PICK).int(0, candidates.length - 1)]
    return searchProblem(keys, tree, target)
  },
}
