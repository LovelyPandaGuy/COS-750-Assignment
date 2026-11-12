// Seeded practice trees for C3 (design decision 5). Correct by construction: the engine checks
// each candidate, and a property test covers seeds 0 to 199.
import { analyseTree } from '../engine/analyse'
import { insert } from '../engine/bst'
import { isOutOfBalance } from '../engine/conventions'
import { generateInsertSequence, generateTree } from '../engine/generate'
import { createRng } from '../engine/random'
import { balanceFactorOf, type Key, type Tree } from '../engine/tree'

const ATTEMPTS = 200
/** Hand-checked: root 50 is in range, node 30 is the only node out of range. */
export const ROOT_LOOKS_FINE_FALLBACK: readonly Key[] = [50, 30, 70, 20, 80, 10]

const plain = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)

/** A plain BST of 5 to 7 keys, so some balance factors may be out of range. */
export function generateFillInTree(seed: number): { keys: Key[]; tree: Tree } {
  const count = createRng(seed).int(5, 7)
  return generateTree(seed, { count, balanced: false })
}

function rootLooksFine(tree: Tree): boolean {
  if (tree === null || isOutOfBalance(balanceFactorOf(tree))) return false
  const v = analyseTree(tree).balanceViolations
  return v.length === 1 && v[0].key !== tree.key
}

/** A plain BST of 6 to 9 keys whose root is in range and exactly one other node is not. */
export function generateRootLooksFine(seed: number): { keys: Key[]; tree: Tree } {
  const rng = createRng(seed)
  for (let i = 0; i < ATTEMPTS; i++) {
    const keys = generateInsertSequence(rng.int(0, 0x7fffffff), { count: rng.int(6, 9) })
    const tree = plain(keys)
    if (rootLooksFine(tree)) return { keys, tree }
  }
  return { keys: [...ROOT_LOOKS_FINE_FALLBACK], tree: plain(ROOT_LOOKS_FINE_FALLBACK) }
}
