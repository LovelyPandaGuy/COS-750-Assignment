import type { Key, Tree } from './tree'

/** How a key is written; letter trees pass their own (src/live/keys.ts). */
export type FormatKey = (key: Key) => string

/**
 * The ID's shape notation (ID 12.2 `result`): `key(left, right)`, an empty child as `·`, and a node
 * with no children as its key alone. Equal strings mean the same keys in the same shape.
 */
export function shapeString(tree: Tree, formatKey: FormatKey = String): string {
  if (tree === null) return '·'
  if (tree.left === null && tree.right === null) return formatKey(tree.key)
  return `${formatKey(tree.key)}(${shapeString(tree.left, formatKey)}, ${shapeString(tree.right, formatKey)})`
}

/** Keys in in-order (left, node, right): sorted in a BST (ID 7.2 C5 "an in-order check"). */
export function inOrderKeys(tree: Tree): Key[] {
  return tree === null ? [] : [...inOrderKeys(tree.left), tree.key, ...inOrderKeys(tree.right)]
}
