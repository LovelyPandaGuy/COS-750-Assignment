import { makeNode, type Key, type Tree } from './tree'

// Result shapes are deliberately small: add-operation-trace will widen them
// with a `trace` field (proposal, open question 2).
export interface InsertResult {
  tree: Tree
  inserted: boolean
}
export interface DeleteResult {
  tree: Tree
  deleted: boolean
}
export interface SearchResult {
  found: boolean
}

/** Plain BST insert, no rebalancing. A duplicate key leaves the tree unchanged. */
export function insert(tree: Tree, key: Key): InsertResult {
  if (tree === null) return { tree: makeNode(key, null, null), inserted: true }
  if (key === tree.key) return { tree, inserted: false }
  if (key < tree.key) {
    const r = insert(tree.left, key)
    return r.inserted
      ? { tree: makeNode(tree.key, r.tree, tree.right), inserted: true }
      : { tree, inserted: false }
  }
  const r = insert(tree.right, key)
  return r.inserted
    ? { tree: makeNode(tree.key, tree.left, r.tree), inserted: true }
    : { tree, inserted: false }
}

/** BST search. Traces and step counts arrive with FR-ENG-09. */
export function search(tree: Tree, key: Key): SearchResult {
  let node = tree
  while (node !== null) {
    if (key === node.key) return { found: true }
    node = key < node.key ? node.left : node.right
  }
  return { found: false }
}

function minKey(tree: NonNullable<Tree>): Key {
  let node = tree
  while (node.left !== null) node = node.left
  return node.key
}

/**
 * Plain BST delete, no rebalancing. A node with two children takes the key
 * of its in-order successor, and the successor is removed (SE 6.4).
 */
export function remove(tree: Tree, key: Key): DeleteResult {
  if (tree === null) return { tree: null, deleted: false }
  if (key < tree.key) {
    const r = remove(tree.left, key)
    return r.deleted
      ? { tree: makeNode(tree.key, r.tree, tree.right), deleted: true }
      : { tree, deleted: false }
  }
  if (key > tree.key) {
    const r = remove(tree.right, key)
    return r.deleted
      ? { tree: makeNode(tree.key, tree.left, r.tree), deleted: true }
      : { tree, deleted: false }
  }
  if (tree.left === null) return { tree: tree.right, deleted: true }
  if (tree.right === null) return { tree: tree.left, deleted: true }
  const successor = minKey(tree.right)
  const r = remove(tree.right, successor)
  return { tree: makeNode(successor, tree.left, r.tree), deleted: true }
}
