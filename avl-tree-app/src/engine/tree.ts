import { EMPTY_HEIGHT, balanceFactor, nodeHeight } from './conventions'

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
