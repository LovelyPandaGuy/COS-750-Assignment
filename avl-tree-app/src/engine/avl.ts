import { caseFor, type RebalanceCase } from './conventions'
import { rotateLeft, rotateRight } from './rotations'
import { balanceFactorOf, makeNode, type Key, type Tree } from './tree'

/** A rebalance that happened: its case and the key of the unbalanced node z. */
export interface Rebalance {
  case: RebalanceCase
  node: Key
}

// Result shape is an assumption until add-operation-trace (proposal, open question 2).
export interface AvlInsertResult {
  tree: Tree
  inserted: boolean
  rebalance: Rebalance | null
}

/**
 * Restore balance at the root of `tree` if its balance factor is out of range.
 * Single rotation when the taller child leans the same way (LL, RR), double
 * when it leans the other way (LR, RL), as two single rotations in order.
 * A balanced taller child (possible only on delete) uses a single rotation.
 */
export function rebalance(tree: Tree): { tree: Tree; rebalance: Rebalance | null } {
  if (tree === null) return { tree, rebalance: null }
  const bf = balanceFactorOf(tree)
  if (Math.abs(bf) <= 1) return { tree, rebalance: null }

  const zLeansLeft = bf > 0
  const y = zLeansLeft ? tree.left : tree.right
  const yBf = balanceFactorOf(y)
  const yLeansLeft = zLeansLeft ? yBf >= 0 : yBf > 0
  const caseName = caseFor(zLeansLeft, yLeansLeft)

  let result: Tree
  if (zLeansLeft && yLeansLeft) {
    result = rotateRight(tree)
  } else if (!zLeansLeft && !yLeansLeft) {
    result = rotateLeft(tree)
  } else if (zLeansLeft) {
    result = rotateRight(makeNode(tree.key, rotateLeft(tree.left), tree.right))
  } else {
    result = rotateLeft(makeNode(tree.key, tree.left, rotateRight(tree.right)))
  }
  return { tree: result, rebalance: { case: caseName, node: tree.key } }
}

/**
 * AVL insert: BST insert, then rebalance on the way back up. The first
 * rebalance restores the subtree's old height, so ancestors never need one.
 */
export function avlInsert(tree: Tree, key: Key): AvlInsertResult {
  if (tree === null) {
    return { tree: makeNode(key, null, null), inserted: true, rebalance: null }
  }
  if (key === tree.key) return { tree, inserted: false, rebalance: null }

  const goLeft = key < tree.key
  const r = avlInsert(goLeft ? tree.left : tree.right, key)
  if (!r.inserted) return { tree, inserted: false, rebalance: null }

  const rebuilt = goLeft ? makeNode(tree.key, r.tree, tree.right) : makeNode(tree.key, tree.left, r.tree)
  const fixed = rebalance(rebuilt)
  return { tree: fixed.tree, inserted: true, rebalance: r.rebalance ?? fixed.rebalance }
}
