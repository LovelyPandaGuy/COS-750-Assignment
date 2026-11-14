// The engine's answer to every question (ID 12.2: "The app's engine builds the tree and works out the
// answers"). Shared by the cross-checks on load and the marker, so what is checked is what is marked.
import { analyseTree } from '../engine/analyse'
import { avlInsert } from '../engine/avl'
import { insert, remove } from '../engine/bst'
import { isOutOfBalance } from '../engine/conventions'
import { leafDeleteTrace } from '../engine/lessonTrace'
import { searchTrace } from '../engine/search'
import type { FormatKey } from '../engine/shape'
import { balanceFactorOf, height, subtreeAt, type Key, type Tree } from '../engine/tree'
import { buildTree } from './build'
import { encodeKey } from './keys'
import type { Question } from './types'

export type EngineAnswer =
  | { kind: 'option'; id: string }
  | { kind: 'values'; values: (number | null)[]; unbalanced?: Key[]; isAvl?: boolean }
  | { kind: 'nodes'; nodes: Key[]; side?: 'left' | 'right' }
  | { kind: 'trace'; path: Key[]; found: boolean }
  | { kind: 'tree'; tree: Tree }

/** The keys an operation inserts, in order. */
export function keysToInsert(q: Question): Key[] {
  const op = q.operation
  if (op?.name === 'insert' && op.key !== undefined) return [encodeKey(op.key)]
  if (op?.name === 'insert-sequence') return (op.keys ?? []).map(encodeKey)
  return []
}

/** The question's starting tree, before its operation. */
export function startTree(q: Question): { tree: Tree; formatKey: FormatKey } {
  return buildTree(q.tree, q.operation)
}

const plainInserts = (tree: Tree, keys: readonly Key[]) => keys.reduce<Tree>((t, k) => insert(t, k).tree, tree)
const avlInserts = (tree: Tree, keys: readonly Key[]) => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, tree)

/**
 * The tree a question asks about, after the operation done the way the question says: a plain insert or
 * delete when `rebalance` is false (ID 12.4), the AVL operation otherwise.
 */
export function treeAfter(q: Question, rebalance = q.operation?.rebalance !== false): Tree {
  const { tree } = startTree(q)
  const op = q.operation
  if (op === undefined) return tree
  if (op.name === 'delete' && op.key !== undefined) {
    const key = encodeKey(op.key)
    return rebalance ? leafDeleteTrace(tree, key).tree : remove(tree, key).tree
  }
  const keys = keysToInsert(q)
  return rebalance ? avlInserts(tree, keys) : plainInserts(tree, keys)
}

/**
 * The tree a student works on: for perform-rotation, the tree right after the plain BST step
 * (`conventions.questionTypes`); otherwise the starting tree.
 */
export function workTree(q: Question): Tree {
  return q.type === 'perform-rotation' ? treeAfter(q, false) : startTree(q).tree
}

function pathTo(tree: Tree, key: Key): Key[] {
  const path: Key[] = []
  let n = tree
  while (n !== null) {
    path.push(n.key)
    if (n.key === key) break
    n = key < n.key ? n.left : n.right
  }
  return path
}

export function engineAnswer(q: Question): EngineAnswer {
  switch (q.type) {
    case 'mcq':
    case 'case-id':
      return { kind: 'option', id: q.correctOptionId ?? '' }
    case 'enter-values': {
      const tree = treeAfter(q)
      const values = (q.targets ?? []).map((t) => {
        const n = subtreeAt(tree, encodeKey(t.node))
        return n === null ? null : t.quantity === 'height' ? height(n) : balanceFactorOf(n)
      })
      const a: EngineAnswer = { kind: 'values', values }
      const out = analyseTree(tree).balanceViolations.map((v) => v.key)
      if (q.askUnbalanced === true) a.unbalanced = out
      if (q.askIsAvl === true) a.isAvl = out.length === 0
      return a
    }
    case 'click-node': {
      const tree = treeAfter(q, false)
      if (q.target === 'all-violations') return { kind: 'nodes', nodes: analyseTree(tree).balanceViolations.map((v) => v.key) }
      const inserted = keysToInsert(q).at(-1)
      if (q.target === 'first-unbalanced' && inserted !== undefined) {
        const lowest = pathTo(tree, inserted)
          .reverse()
          .find((k) => isOutOfBalance(balanceFactorOf(subtreeAt(tree, k))))
        return { kind: 'nodes', nodes: lowest === undefined ? [] : [lowest] }
      }
      if (q.target === 'parent-of-new-key' && inserted !== undefined) {
        const path = pathTo(tree, inserted)
        const parent = path[path.length - 2]
        return { kind: 'nodes', nodes: [parent], side: inserted < parent ? 'left' : 'right' }
      }
      return { kind: 'nodes', nodes: [] }
    }
    case 'trace': {
      const r = searchTrace(startTree(q).tree, encodeKey(q.searchKey as number | string))
      return { kind: 'trace', path: r.trace.filter((s) => s.kind === 'compare').map((s) => s.nodes[0]), found: r.found }
    }
    case 'build-tree':
      return { kind: 'tree', tree: treeAfter(q) }
    case 'perform-rotation':
      // The operation's `rebalance: false` names the plain step the student starts from (workTree);
      // the answer is the rebalanced tree.
      return { kind: 'tree', tree: treeAfter(q, true) }
  }
  return { kind: 'option', id: '' }
}
