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
