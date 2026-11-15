// Traces for the operations the ID's lessons animate beyond a single search or insert (ID 7.2):
// a sequence of AVL inserts (C6), a given list of rotations (C5) and a leaf deletion with its
// rebalancing (C7). They use the same TraceStep contract as search and insert, so `replay` and
// the caption builder treat them alike.
import { avlInsertTrace } from './avl'
import { CONVENTIONS, isOutOfBalance, leansLeft } from './conventions'
import { rotateLeft, rotateRight } from './rotations'
import type { TraceKind, TraceStep } from './trace'
import { balanceFactorOf, makeNode, refreshHeight, replaceAt, subtreeAt, type Key, type Tree, type TreeNode } from './tree'

export interface LessonTrace {
  start: Tree
  trace: TraceStep[]
  tree: Tree
}

/** A rotation the content names: about which key, and which way (ID 7.3). */
export interface RotationSpec {
  about: Key
  dir: 'left' | 'right'
}

/** Raised for a rotation that cannot be done, or a delete outside the ID's leaf-only scope. */
export class TraceError extends Error {}

/**
 * Plain BST insert with a trace (the C1 refresher; `rebalance: false`): walk down, place the key,
 * then update each ancestor's height up to the root. No rebalancing.
 */
export function plainInsertTrace(start: Tree, key: Key): LessonTrace {
  const trace: TraceStep[] = []
  let tree = start
  const push = (kind: TraceKind, nodes: Key[], after: Tree = tree) => {
    trace.push({ index: trace.length, kind, nodes, before: tree, after, pseudocodeLine: 0 })
    tree = after
  }
  const path: Key[] = []
  let node: Tree = start
  while (node !== null) {
    path.push(node.key)
    push('compare', [node.key])
    if (key === node.key) {
      push('found', [node.key])
      return { start, trace, tree }
    }
    const next: Tree = key < node.key ? node.left : node.right
    push('descend', next === null ? [node.key] : [node.key, next.key])
    node = next
  }
  push('insert', [key], replaceAt(tree, key, () => makeNode(key, null, null)))
  for (let i = path.length - 1; i >= 0; i--) push('update-height', [path[i]], replaceAt(tree, path[i], refreshHeight))
  return { start, trace, tree }
}

/** AVL inserts of each key in turn, each starting from the tree the previous one left. */
export function insertSequenceTrace(start: Tree, keys: readonly Key[]): LessonTrace {
  const trace: TraceStep[] = []
  let tree = start
  for (const key of keys) {
    const r = avlInsertTrace(tree, key)
    for (const step of r.trace) trace.push({ ...step, index: trace.length })
    tree = r.tree
  }
  return { start, trace, tree }
}

/** The given rotations in order, one rotation step each, with nodes [about, the child that moves up]. */
export function rotationSequenceTrace(start: Tree, rotations: readonly RotationSpec[]): LessonTrace {
  const trace: TraceStep[] = []
  let tree = start
  for (const r of rotations) {
    const at = subtreeAt(tree, r.about)
    const child = at === null ? null : r.dir === 'right' ? at.left : at.right
    if (at === null || child === null) {
      throw new TraceError(`a ${r.dir} rotation about ${r.about} is not possible: it has no ${r.dir === 'right' ? 'left' : 'right'} child`)
    }
    const after = replaceAt(tree, r.about, r.dir === 'right' ? rotateRight : rotateLeft)
    trace.push({ index: trace.length, kind: 'rotation', nodes: [r.about, child.key], before: tree, after, pseudocodeLine: 0 })
    tree = after
  }
  return { start, trace, tree }
}

function pathTo(tree: Tree, key: Key): Key[] {
  const path: Key[] = []
  let node = tree
  while (node !== null && node.key !== key) {
    path.push(node.key)
    node = key < node.key ? node.left : node.right
  }
  return node === null ? [] : path
}

/**
 * Leaf deletion (ID 7.2, ID 7.3 "Only leaf deletions are covered"): remove the leaf, update
 * balance factors from its parent up to the root, and at a node at +2 or −2 rebalance as
 * `conventions.deletionRotation` says; the walk then carries on to the root. With `rebalance: false`
 * (the sandbox with rebalancing off, D161) the walk only updates, with no imbalance or rotation step.
 */
export function leafDeleteTrace(start: Tree, key: Key, { rebalance = true }: { rebalance?: boolean } = {}): LessonTrace {
  const leaf = subtreeAt(start, key)
  if (leaf === null) throw new TraceError(`${key} is not in the tree`)
  if (leaf.left !== null || leaf.right !== null) throw new TraceError(`only leaf deletion is covered, and ${key} is not a leaf`)

  const trace: TraceStep[] = []
  let tree: Tree = start
  const push = (kind: TraceKind, nodes: Key[], after: Tree) => {
    trace.push({ index: trace.length, kind, nodes, before: tree, after, pseudocodeLine: 0 })
    tree = after
  }

  const path = pathTo(start, key)
  push('delete', [key], replaceAt(tree, key, () => null))
  for (let i = path.length - 1; i >= 0; i--) {
    const at = path[i]
    push('update-height', [at], replaceAt(tree, at, refreshHeight))
    const n = subtreeAt(tree, at) as TreeNode
    const bf = balanceFactorOf(n)
    if (!rebalance || !isOutOfBalance(bf)) continue
    const nLeft = leansLeft(bf)
    const child = (nLeft ? n.left : n.right) as TreeNode
    push('imbalance', [n.key, child.key], tree)
    const childBf = balanceFactorOf(child)
    // conventions.deletionRotation: the child leaning away from n needs a double rotation.
    const away = nLeft ? childBf > 0 : childBf < 0
    const rules = CONVENTIONS.deletionRotation
    const double = nLeft ? rules.bfMinus2.childBfPositive : rules.bfPlus2.childBfNegative
    if (away && double.length === 2) {
      const grand = (nLeft ? child.right : child.left) as TreeNode
      push('rotation', [child.key, grand.key], replaceAt(tree, child.key, nLeft ? rotateLeft : rotateRight))
      push('rotation', [n.key, grand.key], replaceAt(tree, n.key, nLeft ? rotateRight : rotateLeft))
    } else {
      push('rotation', [n.key, child.key], replaceAt(tree, n.key, nLeft ? rotateRight : rotateLeft))
    }
  }
  return { start, trace, tree }
}
