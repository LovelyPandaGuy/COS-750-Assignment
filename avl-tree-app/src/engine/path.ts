import { makeNode, type Key, type Tree, type TreeNode } from './tree'
import type { Recorder } from './trace'

// Internal helpers shared by the insert operations. Not exported from index.ts.

export interface PathEntry {
  readonly node: TreeNode
  readonly dir: 'left' | 'right'
}

/** Rebuild `node` with `child` on side `dir`, keeping the other side. */
export function attach(node: TreeNode, dir: 'left' | 'right', child: Tree): TreeNode {
  return dir === 'left' ? makeNode(node.key, child, node.right) : makeNode(node.key, node.left, child)
}

/**
 * Rebuild the whole tree from `subtree` up to the root along `path`
 * (root first). Untouched subtrees are shared; heights are rederived.
 */
export function rebuildPath(path: readonly PathEntry[], subtree: Tree): Tree {
  let tree = subtree
  for (let i = path.length - 1; i >= 0; i--) tree = attach(path[i].node, path[i].dir, tree)
  return tree
}

/**
 * Walk from the root towards `key`, recording one compare step per node
 * passed and a found step if the key is present. Returns the path taken.
 */
export function locate(tree: Tree, key: Key, rec: Recorder): { path: PathEntry[]; found: boolean } {
  const path: PathEntry[] = []
  let node = tree
  while (node !== null) {
    if (key === node.key) {
      rec.step('found', [key])
      return { path, found: true }
    }
    rec.step('compare', [node.key])
    const dir = key < node.key ? 'left' : 'right'
    path.push({ node, dir })
    node = node[dir]
  }
  return { path, found: false }
}
