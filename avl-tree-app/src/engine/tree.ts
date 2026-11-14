import { EMPTY_HEIGHT, balanceFactor, nodeHeight } from './conventions'

/** Keys are numbers. Capital-letter keys from the content are encoded as their char codes at the content boundary (src/live/keys.ts), which keeps alphabetical order (D99). */
export type Key = number

export interface TreeNode {
  readonly key: Key
  readonly height: number
  readonly left: TreeNode | null
  readonly right: TreeNode | null
}

export type Tree = TreeNode | null

/** Height of a tree in edges; the empty tree uses the convention constant. */
export function height(tree: Tree): number {
  return tree === null ? EMPTY_HEIGHT : tree.height
}

/** Build a node whose stored height is derived from its children. */
export function makeNode(key: Key, left: Tree, right: Tree): TreeNode {
  return { key, height: nodeHeight(height(left), height(right)), left, right }
}

/** Balance factor of the tree's root; 0 for the empty tree. */
export function balanceFactorOf(tree: Tree): number {
  return tree === null ? 0 : balanceFactor(height(tree.left), height(tree.right))
}

/** The subtree whose root has `key`, or null if the key is not in the tree. */
export function subtreeAt(tree: Tree, key: Key): Tree {
  let node = tree
  while (node !== null && node.key !== key) node = key < node.key ? node.left : node.right
  return node
}

/**
 * Replace the subtree at `key`'s place in BST order (the empty child where it
 * would go if absent) with `replace(subtree)`. Ancestors on the path are copied
 * with their stored heights kept, not recomputed, so a trace can show heights
 * updating one node at a time.
 */
export function replaceAt(tree: Tree, key: Key, replace: (subtree: Tree) => Tree): Tree {
  if (tree === null || tree.key === key) return replace(tree)
  return key < tree.key
    ? { key: tree.key, height: tree.height, left: replaceAt(tree.left, key, replace), right: tree.right }
    : { key: tree.key, height: tree.height, left: tree.left, right: replaceAt(tree.right, key, replace) }
}

/** The same node with its stored height recomputed from its children's stored heights. */
export function refreshHeight(tree: Tree): Tree {
  return tree === null ? tree : makeNode(tree.key, tree.left, tree.right)
}
