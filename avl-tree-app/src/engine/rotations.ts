import { makeNode, type Tree } from './tree'

// Single rotations only. Choosing LL/RR/LR/RL belongs to add-avl-rebalancing
// (proposal, open question 1: assumed to live there).

/** Rotate left at the root of `tree`. Returned unchanged if there is no right child. */
export function rotateLeft(tree: Tree): Tree {
  if (tree === null || tree.right === null) return tree
  const pivot = tree.right
  return makeNode(pivot.key, makeNode(tree.key, tree.left, pivot.left), pivot.right)
}

/** Rotate right at the root of `tree`. Returned unchanged if there is no left child. */
export function rotateRight(tree: Tree): Tree {
  if (tree === null || tree.left === null) return tree
  const pivot = tree.left
  return makeNode(pivot.key, pivot.left, makeNode(tree.key, pivot.right, tree.right))
}
