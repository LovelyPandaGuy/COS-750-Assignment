// Kinds for C7, optional (add-question-model-and-bank, design decision 5). A bounded seeded search
// with a hand-checked fallback each; a test pins the fallbacks.
import { avlDelete } from '../../engine/avl'
import { remove } from '../../engine/bst'
import { generateInsertSequence, variantSeed } from '../../engine/generate'
import { createRng } from '../../engine/random'
import type { Key, Tree } from '../../engine/tree'
import type { Built, Kind } from '../types'
import { avl, unique } from './shared'

const TRIES = 200

export interface DeleteProblem {
  keys: readonly Key[]
  key: Key
}

/** Hand-checked: deleting 23 from the AVL tree of these keys rebalances twice on the way up. */
export const DELETE_FALLBACK: DeleteProblem = { keys: [41, 12, 23, 13, 44, 36, 98, 82, 88, 75, 52, 51], key: 23 }
/** Hand-checked: deleting 70 rebalances once, at 50. */
export const DELETE_ONE_FALLBACK: DeleteProblem = { keys: [50, 30, 70, 20], key: 70 }
/** Hand-checked: deleting 80 rebalances at the root, so the AVL root differs from the plain delete's. */
export const DELETE_ROOT_FALLBACK: DeleteProblem = { keys: [30, 80, 64, 51, 82, 44, 62, 23], key: 80 }

/** The first seeded tree and key whose delete satisfies `want`, else the fallback. */
function find(seed: number, want: (tree: Tree, key: Key) => boolean, fallback: DeleteProblem): { keys: Key[]; key: Key; tree: Tree } {
  for (let i = 0; i < TRIES; i++) {
    const v = variantSeed(seed, i)
    const rng = createRng(v)
    const keys = generateInsertSequence(v, { count: rng.int(8, 12) })
    const tree = avl(keys)
    const order = [...keys]
    for (let j = order.length - 1; j > 0; j--) {
      const k = rng.int(0, j)
      ;[order[j], order[k]] = [order[k], order[j]]
    }
    const key = order.find((k) => want(tree, k))
    if (key !== undefined) return { keys, key, tree }
  }
  return { keys: [...fallback.keys], key: fallback.key, tree: avl(fallback.keys) }
}

function facts(p: { keys: Key[]; key: Key; tree: Tree }, values: Record<string, number>): Pick<Built, 'facts' | 'numbers' | 'signature'> {
  return {
    facts: { tree: p.tree, keys: p.keys, target: p.key, values },
    numbers: unique([...p.keys, ...Object.values(values)]),
    signature: `${p.keys.join(',')}|${p.key}`,
  }
}

export const deleteRebalances: Kind = {
  type: 'choice',
  misconceptions: ['M-FORGETS-REBALANCE', 'M-DELETE-ONE-ROTATION'],
  build(seed) {
    // Even seeds look for a delete that rebalances twice, odd ones for once.
    const want = (seed & 1) === 0 ? DELETE_FALLBACK : DELETE_ONE_FALLBACK
    const count = want === DELETE_FALLBACK ? avlDelete(avl(want.keys), want.key).rebalances.length : 1
    const p = find(seed, (t, k) => avlDelete(t, k).rebalances.length === count, want)
    const n = avlDelete(p.tree, p.key).rebalances.length
    const wrong: Built['wrong'] = [{ value: 0, misconception: 'M-FORGETS-REBALANCE' }]
    if (n > 1) wrong.push({ value: n - 1, misconception: 'M-DELETE-ONE-ROTATION' })
    return { ...facts(p, { rebalances: n, fewer: n - 1 }), answer: n, wrong }
  },
}

export const deleteRoot: Kind = {
  type: 'choice',
  misconceptions: ['M-FORGETS-REBALANCE'],
  build(seed) {
    const rootAfter = (t: Tree, k: Key) => [avlDelete(t, k).tree?.key, remove(t, k).tree?.key] as const
    const p = find(
      seed,
      (t, k) => {
        const [a, b] = rootAfter(t, k)
        return a !== undefined && b !== undefined && a !== b
      },
      DELETE_ROOT_FALLBACK,
    )
    const [a, b] = rootAfter(p.tree, p.key) as [Key, Key]
    return { ...facts(p, { avlRoot: a, plainRoot: b }), answer: a, wrong: [{ value: b, misconception: 'M-FORGETS-REBALANCE' }] }
  },
}
