// C7 practice: find the lowest unbalanced node after a delete (add-module-c7-delete, LO8). Trees are
// seeded AVL trees; the delete is a plain BST delete, so the walk back up is left to the student.
// Every answer is the engine's lowest balance violation. Nothing here is stored.
import { analyseTree } from '../engine/analyse'
import { avlInsert } from '../engine/avl'
import { remove } from '../engine/bst'
import { generateTree, variantSeed } from '../engine/generate'
import { createRng } from '../engine/random'
import type { Key, Tree } from '../engine/tree'

const ATTEMPTS = 200
/** Hand-checked fallback: 20, 10, 30, 40 into an AVL tree, then 10 deleted leaves 20 out of balance. */
const FALLBACK = [20, 10, 30, 40]
const FALLBACK_KEY = 10

export interface DeletePracticeProblem {
  /** The AVL tree before the delete. */
  before: Tree
  key: Key
  /** After a plain BST delete of `key`: at least one node is out of balance. */
  after: Tree
}

const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])

/** A seeded AVL tree of 7 to 10 keys and a key whose plain delete unbalances it. */
export function drawDeletePractice(seed: number): DeletePracticeProblem {
  for (let i = 0; i < ATTEMPTS; i++) {
    const s = variantSeed(seed, i)
    const { tree: before } = generateTree(s, { count: 7 + (i % 4), balanced: true })
    const keys = keysOf(before)
    const rng = createRng(s ^ 0xde1e7e)
    // Try the keys in a seeded order, so the deleted key is not always the smallest.
    const order = keys.map((k) => ({ k, r: rng.next() })).sort((a, b) => a.r - b.r).map((x) => x.k)
    for (const key of order) {
      const after = remove(before, key).tree
      if (analyseTree(after).balanceViolations.length > 0) return { before, key, after }
    }
  }
  const before = FALLBACK.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
  return { before, key: FALLBACK_KEY, after: remove(before, FALLBACK_KEY).tree }
}

export interface AfterDeleteResult {
  /** right: the lowest node out of balance; higher: out of balance, but a lower one is too; in-balance: in range. */
  kind: 'right' | 'higher' | 'in-balance'
  picked: Key
  /** The lowest node out of balance (the engine's first violation). */
  answer: Key
  /** Which side of the root the answer is on, for the second hint; null when it is the root. */
  side: 'left' | 'right' | null
}

export function markAfterDelete(after: Tree, picked: Key): AfterDeleteResult {
  const violations = analyseTree(after).balanceViolations.map((v) => v.key)
  const answer = violations[0]
  const kind = picked === answer ? 'right' : violations.includes(picked) ? 'higher' : 'in-balance'
  const side = after === null || answer === after.key ? null : answer < after.key ? 'left' : 'right'
  return { kind, picked, answer, side }
}
