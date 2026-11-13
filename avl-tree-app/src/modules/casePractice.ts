// C6 practice: name the case (add-module-c6-insertion-and-rebalancing, LO7). Problems come from the
// seeded rotation generator; every answer is the engine's AVL insert. Nothing here is stored, and no
// case name is typed: the cases are the engine's, named only through the conventions wording (D19).
import { avlInsert } from '../engine/avl'
import { insert } from '../engine/bst'
import type { RebalanceCase } from '../engine/conventions'
import { balanceFactorOf, height, subtreeAt, type Key, type Tree } from '../engine/tree'

export interface CaseProblem {
  /** The tree after a plain BST insert of `key`: the one the learner sees. */
  tree: Tree
  key: Key
  /** The case the engine's AVL insert applies. */
  answer: RebalanceCase
  /** The unbalanced node the engine rebalances at. */
  z: Key
  /** Its taller child. */
  y: Key
  zBalance: number
  yBalance: number
}

/** The problem behind inserting `key` into the AVL tree `base`; `key` must unbalance it. */
export function caseProblem(base: Tree, key: Key): CaseProblem {
  const rebalance = avlInsert(base, key).rebalance
  if (rebalance === null) throw new RangeError(`inserting ${key} does not unbalance the tree`)
  const tree = insert(base, key).tree
  const z = subtreeAt(tree, rebalance.node)!
  const y = (height(z.left) >= height(z.right) ? z.left : z.right)!
  return {
    tree,
    key,
    answer: rebalance.case,
    z: z.key,
    y: y.key,
    zBalance: balanceFactorOf(z),
    yBalance: balanceFactorOf(y),
  }
}

export interface CaseResult {
  kind: 'right' | 'not-yet'
  picked: RebalanceCase
  answer: RebalanceCase
  z: Key
  y: Key
  zBalance: number
  yBalance: number
}

/** Mark one choice against the engine's case (D21: unlimited retries; nothing is stored). */
export function markCase(problem: CaseProblem, picked: RebalanceCase): CaseResult {
  const { answer, z, y, zBalance, yBalance } = problem
  return { kind: picked === answer ? 'right' : 'not-yet', picked, answer, z, y, zBalance, yBalance }
}
