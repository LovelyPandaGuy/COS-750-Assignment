import { caseFor, leansLeft, leansRight, type RebalanceCase } from './conventions'
import { rotateLeft, rotateRight } from './rotations'
import type { TraceKind, TraceStep } from './trace'
import {
  balanceFactorOf,
  makeNode,
  refreshHeight,
  replaceAt,
  subtreeAt,
  type Key,
  type Tree,
  type TreeNode,
} from './tree'

/** A rebalance that happened: its case and the key of the unbalanced node z. */
export interface Rebalance {
  case: RebalanceCase
  node: Key
}

// Result shape is an assumption until add-operation-trace (proposal, open question 2).
export interface AvlInsertResult {
  tree: Tree
  inserted: boolean
  rebalance: Rebalance | null
}

/**
 * Restore balance at the root of `tree` if its balance factor is out of range.
 * Single rotation when the taller child leans the same way (LL, RR), double
 * when it leans the other way (LR, RL), as two single rotations in order.
 * A balanced taller child (possible only on delete) uses a single rotation.
 */
export function rebalance(tree: Tree): { tree: Tree; rebalance: Rebalance | null } {
  if (tree === null) return { tree, rebalance: null }
  const bf = balanceFactorOf(tree)
  if (Math.abs(bf) <= 1) return { tree, rebalance: null }

  const zLeansLeft = leansLeft(bf)
  const y = zLeansLeft ? tree.left : tree.right
  const yBf = balanceFactorOf(y)
  // A balanced taller child (possible only on delete) counts as leaning with z: one rotation.
  const yLeansLeft = zLeansLeft ? !leansRight(yBf) : leansLeft(yBf)
  const caseName = caseFor(zLeansLeft, yLeansLeft)

  let result: Tree
  if (zLeansLeft && yLeansLeft) {
    result = rotateRight(tree)
  } else if (!zLeansLeft && !yLeansLeft) {
    result = rotateLeft(tree)
  } else if (zLeansLeft) {
    result = rotateRight(makeNode(tree.key, rotateLeft(tree.left), tree.right))
  } else {
    result = rotateLeft(makeNode(tree.key, tree.left, rotateRight(tree.right)))
  }
  return { tree: result, rebalance: { case: caseName, node: tree.key } }
}

/**
 * AVL insert: BST insert, then rebalance on the way back up. The first
 * rebalance restores the subtree's old height, so ancestors never need one.
 */
export function avlInsert(tree: Tree, key: Key): AvlInsertResult {
  if (tree === null) {
    return { tree: makeNode(key, null, null), inserted: true, rebalance: null }
  }
  if (key === tree.key) return { tree, inserted: false, rebalance: null }

  const goLeft = key < tree.key
  const r = avlInsert(goLeft ? tree.left : tree.right, key)
  if (!r.inserted) return { tree, inserted: false, rebalance: null }

  const rebuilt = goLeft ? makeNode(tree.key, r.tree, tree.right) : makeNode(tree.key, tree.left, r.tree)
  const fixed = rebalance(rebuilt)
  return { tree: fixed.tree, inserted: true, rebalance: r.rebalance ?? fixed.rebalance }
}

// Insert pseudocode lines: the five steps of the ID's C6 outline (1 BST insert,
// 2 update heights going up, 3 find the lowest unbalanced node, 4 work out the
// case, 5 rotate). The ID has no line-level insert pseudocode, so this layout
// is an assumption to confirm (add-avl-insert-trace proposal, question 1).
// Line 4 has no step of its own: the case is carried by the imbalance step.
export const INSERT_LINES = {
  compare: 1,
  descend: 1,
  found: 1,
  insert: 1,
  'update-height': 2,
  imbalance: 3,
  rotation: 5,
} as const satisfies Partial<Record<TraceKind, number>>

type InsertStepKind = keyof typeof INSERT_LINES

export interface AvlInsertTraceResult extends AvlInsertResult {
  trace: TraceStep[]
}

/**
 * AVL insert with a trace (SE §6.4). Walk down (compare, then descend, per
 * node), insert the leaf or stop at a duplicate (found), then walk back up:
 * one update-height per ancestor until the lowest unbalanced node z or the
 * root, then imbalance [z, y] and one rotation [at, pivot] per single
 * rotation. Snapshots are whole trees; ancestors keep their old stored
 * heights until their own update-height step.
 */
export function avlInsertTrace(tree: Tree, key: Key): AvlInsertTraceResult {
  const trace: TraceStep[] = []
  let current = tree

  const push = (kind: InsertStepKind, nodes: Key[], after: Tree = current, rebalanceCase?: RebalanceCase) => {
    const step: TraceStep = {
      index: trace.length,
      kind,
      nodes,
      before: current,
      after,
      pseudocodeLine: INSERT_LINES[kind],
    }
    if (rebalanceCase !== undefined) step.rebalanceCase = rebalanceCase
    trace.push(step)
    current = after
  }

  // Walk down, recording the path.
  const path: Key[] = []
  let node: Tree = tree
  while (node !== null) {
    path.push(node.key)
    push('compare', [node.key])
    if (key === node.key) {
      push('found', [node.key])
      return { tree, inserted: false, rebalance: null, trace }
    }
    const next: Tree = key < node.key ? node.left : node.right
    push('descend', next === null ? [node.key] : [node.key, next.key])
    node = next
  }
  push('insert', [key], replaceAt(current, key, () => makeNode(key, null, null)))

  // Walk back up: update heights, stop at the first (lowest) imbalance.
  for (let i = path.length - 1; i >= 0; i--) {
    const at = path[i]
    push('update-height', [at], replaceAt(current, at, refreshHeight))
    const z = subtreeAt(current, at) as TreeNode
    const fixed = rebalance(z)
    if (fixed.rebalance === null) continue

    const found = fixed.rebalance
    const zLeansLeft = leansLeft(balanceFactorOf(z))
    const y = (zLeansLeft ? z.left : z.right) as TreeNode
    push('imbalance', [z.key, y.key], current, found.case)

    const towardZ = zLeansLeft ? rotateRight : rotateLeft
    const awayFromZ = zLeansLeft ? rotateLeft : rotateRight
    const yLeansAway = zLeansLeft ? leansRight(balanceFactorOf(y)) : leansLeft(balanceFactorOf(y))
    if (yLeansAway) {
      const x = (zLeansLeft ? y.right : y.left) as TreeNode
      push('rotation', [y.key, x.key], replaceAt(current, y.key, awayFromZ), found.case)
      push('rotation', [z.key, x.key], replaceAt(current, z.key, towardZ), found.case)
    } else {
      push('rotation', [z.key, y.key], replaceAt(current, z.key, towardZ), found.case)
    }
    return { tree: current, inserted: true, rebalance: found, trace }
  }
  return { tree: current, inserted: true, rebalance: null, trace }
}

// Result shape is an assumption until add-operation-trace (add-avl-delete
// proposal, open question 4).
export interface AvlDeleteResult {
  tree: Tree
  deleted: boolean
  /** Every rebalance performed, lowest node first. */
  rebalances: Rebalance[]
}

function minKey(tree: TreeNode): Key {
  let node = tree
  while (node.left !== null) node = node.left
  return node.key
}

/**
 * AVL delete: BST delete (two children take the in-order successor, SE 6.4),
 * then rebalance at every node on the way back up. Unlike insert, a rotation
 * can shorten its subtree, so the walk never stops early and one delete can
 * report several rebalances.
 */
export function avlDelete(tree: Tree, key: Key): AvlDeleteResult {
  if (tree === null) return { tree: null, deleted: false, rebalances: [] }

  let rebuilt: TreeNode
  let below: Rebalance[]
  if (key < tree.key || key > tree.key) {
    const goLeft = key < tree.key
    const r = avlDelete(goLeft ? tree.left : tree.right, key)
    if (!r.deleted) return { tree, deleted: false, rebalances: [] }
    below = r.rebalances
    rebuilt = goLeft ? makeNode(tree.key, r.tree, tree.right) : makeNode(tree.key, tree.left, r.tree)
  } else if (tree.left === null || tree.right === null) {
    return { tree: tree.left ?? tree.right, deleted: true, rebalances: [] }
  } else {
    const successor = minKey(tree.right)
    const r = avlDelete(tree.right, successor)
    below = r.rebalances
    rebuilt = makeNode(successor, tree.left, r.tree)
  }

  const fixed = rebalance(rebuilt)
  return {
    tree: fixed.tree,
    deleted: true,
    rebalances: fixed.rebalance === null ? below : [...below, fixed.rebalance],
  }
}
