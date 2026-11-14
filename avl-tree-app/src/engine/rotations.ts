import { makeNode, subtreeAt, type Key, type Tree } from './tree'

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

/** A rotation's direction: a right rotation lifts the left child, a left rotation the right child. */
export type Direction = 'left' | 'right'

export type RotateResult =
  | { ok: true; tree: Tree }
  | {
      ok: false
      reason: 'no-node' | 'no-child'
      node: Key
      /** The child side that is missing: a left rotation needs a right child. */
      side: 'left' | 'right'
      /** The tree it was given, unchanged. */
      tree: Tree
    }

/**
 * Rotate at the node with `key`. The path to the root is rebuilt with
 * makeNode, so every ancestor's stored height is right afterwards.
 */
export function rotateAt(tree: Tree, key: Key, dir: Direction): RotateResult {
  const target = subtreeAt(tree, key)
  const side = dir === 'left' ? 'right' : 'left'
  if (target === null) return { ok: false, reason: 'no-node', node: key, side, tree }
  const pivot = dir === 'left' ? target.right : target.left
  if (pivot === null) return { ok: false, reason: 'no-child', node: key, side, tree }

  const lifted =
    dir === 'left'
      ? makeNode(pivot.key, makeNode(target.key, target.left, pivot.left), pivot.right)
      : makeNode(pivot.key, pivot.left, makeNode(target.key, pivot.right, target.right))

  const rebuild = (node: Tree): Tree => {
    if (node === null || node.key === key) return lifted
    return key < node.key
      ? makeNode(node.key, rebuild(node.left), node.right)
      : makeNode(node.key, node.left, rebuild(node.right))
  }
  return { ok: true, tree: rebuild(tree) }
}

