// The tree editor's state (tree-editor; revamp-tree-editor design 1, D132). Pure: the UI only dispatches.
// A key is held, then placed on an empty branch. Every empty branch is a target, so a wrong placement is
// drawn and then marked.
import type { BuilderStep } from '../../../live/mark'
import { rotateAt } from '../../../engine/rotations'
import { inOrderKeys } from '../../../engine/shape'
import { makeNode, replaceAt, subtreeAt, type Key, type Tree } from '../../../engine/tree'

export interface Target {
  parent: Key | null
  side: 'left' | 'right' | null
}

interface Snapshot {
  tree: Tree
  pending: Key[]
  deletable: Key | null
  log: BuilderStep[]
}

export interface BuilderState extends Snapshot {
  start: Snapshot
  history: Snapshot[]
  selected: Key | null
  /** The next key is held: its slots are drawn and a slot places it (D132). */
  held: boolean
  /** The in-order sequence before and after the last edit, when that edit was a rotation (ID 9.6). */
  lastRotation: { before: Key[]; after: Key[] } | null
  /** The last refusal, for the message line (a rotation with no child to lift). */
  refused: { key: Key; side: 'left' | 'right' } | null
}

export type BuilderAction =
  | { type: 'place'; target: Target }
  | { type: 'hold' }
  | { type: 'letGo' }
  | { type: 'select'; key: Key | null }
  | { type: 'rotate'; dir: 'left' | 'right' }
  | { type: 'delete' }
  | { type: 'undo' }
  | { type: 'reset' }

export function initBuilder(tree: Tree, pending: readonly Key[], deletable: Key | null): BuilderState {
  const start: Snapshot = { tree, pending: [...pending], deletable, log: [] }
  return { ...start, start, history: [], selected: null, held: false, lastRotation: null, refused: null }
}

/** Every empty branch of the tree, in-order; the empty tree has one target, the root. */
export function targetsOf(tree: Tree): Target[] {
  if (tree === null) return [{ parent: null, side: null }]
  const out: Target[] = []
  const walk = (n: Tree) => {
    if (n === null) return
    if (n.left === null) out.push({ parent: n.key, side: 'left' })
    else walk(n.left)
    if (n.right === null) out.push({ parent: n.key, side: 'right' })
    else walk(n.right)
  }
  walk(tree)
  return out
}

function placeAt(tree: Tree, key: Key, target: Target): Tree {
  if (target.parent === null) return makeNode(key, null, null)
  // Rebuild the path to the parent with fresh heights, then hang the key on the chosen side.
  const rebuild = (n: Tree): Tree => {
    if (n === null) return n
    if (n.key === target.parent) return target.side === 'left' ? makeNode(n.key, makeNode(key, null, null), n.right) : makeNode(n.key, n.left, makeNode(key, null, null))
    const inLeft = containsKey(n.left, target.parent!)
    return inLeft ? makeNode(n.key, rebuild(n.left), n.right) : makeNode(n.key, n.left, rebuild(n.right))
  }
  return rebuild(tree)
}

/** Search by walking every node: after a wrong placement the tree may not be in BST order. */
function containsKey(tree: Tree, key: Key): boolean {
  return tree !== null && (tree.key === key || containsKey(tree.left, key) || containsKey(tree.right, key))
}

const snapshot = (s: BuilderState): Snapshot => ({ tree: s.tree, pending: s.pending, deletable: s.deletable, log: s.log })

export function builderReducer(s: BuilderState, a: BuilderAction): BuilderState {
  switch (a.type) {
    case 'place': {
      const key = s.pending[0]
      if (key === undefined || !s.held) return s
      return {
        ...s,
        history: [...s.history, snapshot(s)],
        tree: placeAt(s.tree, key, a.target),
        pending: s.pending.slice(1),
        log: [...s.log, { type: 'place', key, parent: a.target.parent, side: a.target.side }],
        selected: null,
        held: false,
        lastRotation: null,
        refused: null,
      }
    }
    case 'hold':
      return s.pending.length === 0 ? s : { ...s, held: true, selected: null, refused: null }
    case 'letGo':
      return { ...s, held: false }
    case 'select':
      return { ...s, selected: a.key, held: a.key === null ? s.held : false, refused: null }
    case 'rotate': {
      if (s.selected === null) return s
      const r = rotateAt(s.tree, s.selected, a.dir)
      if (!r.ok) return { ...s, refused: { key: s.selected, side: a.dir === 'left' ? 'right' : 'left' } }
      return {
        ...s,
        history: [...s.history, snapshot(s)],
        tree: r.tree,
        log: [...s.log, { type: 'rotate', about: s.selected, dir: a.dir }],
        selected: null,
        lastRotation: { before: inOrderKeys(s.tree), after: inOrderKeys(r.tree) },
        refused: null,
      }
    }
    case 'delete': {
      const key = s.deletable
      if (key === null) return s
      const node = subtreeAt(s.tree, key)
      if (node === null || node.left !== null || node.right !== null) return s
      return { ...s, history: [...s.history, snapshot(s)], tree: replaceAt(s.tree, key, () => null), deletable: null, log: [...s.log, { type: 'delete', key }], selected: null, held: false, lastRotation: null }
    }
    case 'undo': {
      const prev = s.history.at(-1)
      if (prev === undefined) return s
      return { ...s, ...prev, history: s.history.slice(0, -1), selected: null, held: false, lastRotation: null, refused: null }
    }
    case 'reset':
      return { ...s, ...s.start, history: [], selected: null, held: false, lastRotation: null, refused: null }
  }
}
