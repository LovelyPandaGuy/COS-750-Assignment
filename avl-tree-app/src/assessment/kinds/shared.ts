// Helpers the kinds share. Every value comes from the engine.
import { avlInsert } from '../../engine/avl'
import { insert } from '../../engine/bst'
import type { Key, Tree, TreeNode } from '../../engine/tree'

export const plain = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
export const avl = (keys: readonly Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

/** Every node, in order. */
export function nodes(tree: Tree): TreeNode[] {
  return tree === null ? [] : [...nodes(tree.left), tree, ...nodes(tree.right)]
}

/** Edges from the root down to `key`, or -1 when absent. */
export function depthOf(tree: Tree, key: Key): number {
  let node = tree
  for (let d = 0; node !== null; d++) {
    if (node.key === key) return d
    node = key < node.key ? node.left : node.right
  }
  return -1
}

/** Keys from the root down to the parent of where `key` sits (or would sit). */
export function pathTo(tree: Tree, key: Key): Key[] {
  const out: Key[] = []
  let node = tree
  while (node !== null && node.key !== key) {
    out.push(node.key)
    node = key < node.key ? node.left : node.right
  }
  return out
}

export const unique = (ns: number[]): number[] => [...new Set(ns)]
