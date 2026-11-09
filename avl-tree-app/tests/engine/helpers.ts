import { insert } from '../../src/engine/bst'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'

/** Build a plain BST by inserting keys in order. */
export function build(keys: Key[]): Tree {
  return keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
}

export function inOrder(tree: Tree): Key[] {
  return tree === null ? [] : [...inOrder(tree.left), tree.key, ...inOrder(tree.right)]
}

export const leaf = (key: Key) => makeNode(key, null, null)

/** Shorthand node builder for expected shapes: n(2, n(1), n(3)). */
export const n = (key: Key, left: Tree = null, right: Tree = null) => makeNode(key, left, right)

/** Deep-freeze a tree so any mutation throws in strict mode. */
export function deepFreeze<T extends Tree>(tree: T): T {
  if (tree !== null) {
    deepFreeze(tree.left)
    deepFreeze(tree.right)
    Object.freeze(tree)
  }
  return tree
}
