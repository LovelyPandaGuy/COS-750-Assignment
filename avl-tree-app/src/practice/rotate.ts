import { analyseTree } from '../engine/analyse'
import { avlInsertTrace } from '../engine/avl'
import { insert } from '../engine/bst'
import { isOutOfBalance } from '../engine/conventions'
import { balanceFactorOf, makeNode, subtreeAt, type Key, type Tree } from '../engine/tree'

// Do it yourself (FR-VIS-06): the student rotates; the engine judges.

export type Direction = 'left' | 'right'

/** The tree after a plain BST insert, before any rebalancing. */
export function startTree(base: Tree, key: Key): Tree {
  return insert(base, key).tree
}

/** Rotations the engine's trace uses: 1 for LL and RR, 2 for LR and RL, 0 when the insert stays balanced. */
export function rotationsNeeded(base: Tree, key: Key): 0 | 1 | 2 {
  const found = avlInsertTrace(base, key).rebalance
  return found === null ? 0 : found.case[0] === found.case[1] ? 1 : 2
}

export type RotateResult =
  | { ok: true; tree: Tree }
  | {
      ok: false
      reason: 'no-node' | 'no-child'
      node: Key
      /** The child side that is missing: a left rotation needs a right child. */
      side: 'left' | 'right'
      /** The tree it was given, unchanged. */
      tree: Tree
    }

/**
 * Rotate at the node with `key`. The path to the root is rebuilt with
 * makeNode, so every ancestor's stored height is right afterwards.
 */
export function rotateAt(tree: Tree, key: Key, dir: Direction): RotateResult {
  const target = subtreeAt(tree, key)
  const side = dir === 'left' ? 'right' : 'left'
  if (target === null) return { ok: false, reason: 'no-node', node: key, side, tree }
  const pivot = dir === 'left' ? target.right : target.left
  if (pivot === null) return { ok: false, reason: 'no-child', node: key, side, tree }

  const lifted =
    dir === 'left'
      ? makeNode(pivot.key, makeNode(target.key, target.left, pivot.left), pivot.right)
      : makeNode(pivot.key, pivot.left, makeNode(target.key, pivot.right, target.right))

  const rebuild = (node: Tree): Tree => {
    if (node === null || node.key === key) return lifted
    return key < node.key
      ? makeNode(node.key, rebuild(node.left), node.right)
      : makeNode(node.key, node.left, rebuild(node.right))
  }
  return { ok: true, tree: rebuild(tree) }
}

export type Feedback =
  | { kind: 'balanced' }
  | { kind: 'flipped'; node: Key; balanceFactor: number }
  | { kind: 'unbalanced'; node: Key; balanceFactor: number }

/** Judge the tree after a rotation at `key`, computed from the new tree. */
export function rotationFeedback(before: Tree, key: Key, dir: Direction, after: Tree): Feedback {
  const analysis = analyseTree(after)
  if (analysis.isAvl) return { kind: 'balanced' }

  const old = subtreeAt(before, key)
  const pivot = old === null ? null : dir === 'left' ? old.right : old.left
  if (old !== null && pivot !== null) {
    const bfBefore = balanceFactorOf(old)
    const bfTop = balanceFactorOf(subtreeAt(after, pivot.key))
    if (isOutOfBalance(bfBefore) && isOutOfBalance(bfTop) && Math.sign(bfBefore) !== Math.sign(bfTop)) {
      return { kind: 'flipped', node: pivot.key, balanceFactor: bfTop }
    }
  }
  const lowest = analysis.balanceViolations[0]
  return { kind: 'unbalanced', node: lowest.key, balanceFactor: lowest.balanceFactor }
}

export function inOrder(tree: Tree): Key[] {
  return tree === null ? [] : [...inOrder(tree.left), tree.key, ...inOrder(tree.right)]
}

export type PracticeMessage =
  | Feedback
  | { kind: 'refused'; node: Key; side: 'left' | 'right'; reason: 'no-node' | 'no-child'; dir: Direction }

export interface PracticeState {
  start: Tree
  tree: Tree
  /** Trees before each successful rotation, oldest first. Immutable, so undo needs no logic. */
  history: Tree[]
  selected: Key | null
  feedback: PracticeMessage | null
  /** What the last undo or reset did, for the announcement. */
  last: 'undone' | 'reset' | null
}

export type PracticeAction =
  | { type: 'select'; key: Key }
  | { type: 'clear-selection' }
  | { type: 'rotate'; dir: Direction }
  | { type: 'undo' }
  | { type: 'reset' }

export function initPractice(start: Tree): PracticeState {
  return { start, tree: start, history: [], selected: null, feedback: null, last: null }
}

export function practiceReducer(state: PracticeState, action: PracticeAction): PracticeState {
  switch (action.type) {
    case 'select':
      return { ...state, selected: action.key }
    case 'clear-selection':
      return { ...state, selected: null }
    case 'rotate': {
      if (state.selected === null) return state
      const key = state.selected
      const r = rotateAt(state.tree, key, action.dir)
      if (r.ok === false) {
        return { ...state, feedback: { kind: 'refused', node: r.node, side: r.side, reason: r.reason, dir: action.dir }, last: null }
      }
      return {
        ...state,
        tree: r.tree,
        history: [...state.history, state.tree],
        selected: null,
        feedback: rotationFeedback(state.tree, key, action.dir, r.tree),
        last: null,
      }
    }
    case 'undo': {
      if (state.history.length === 0) return state
      const history = state.history.slice(0, -1)
      return { ...state, tree: state.history[state.history.length - 1], history, selected: null, feedback: null, last: 'undone' }
    }
    case 'reset':
      return { ...initPractice(state.start), last: 'reset' }
  }
}
