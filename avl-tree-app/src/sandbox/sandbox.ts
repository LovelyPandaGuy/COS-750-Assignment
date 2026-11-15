// Sandbox state (add-sandbox, design decision 1). Pure: no React, no storage. Every tree, rebalance
// and statistic comes from the engine; the UI only words and draws them. Inserts and deletes run the
// engine's traces, and their log entries carry the lessons' captions for those traces
// (align-sandbox-explanations, D161 to D163).
import { analyseTree } from '../engine/analyse'
import { avlInsert, avlInsertTrace } from '../engine/avl'
import { insert } from '../engine/bst'
import { captionsFor } from '../engine/captions'
import { leafDeleteTrace, plainInsertTrace } from '../engine/lessonTrace'
import { EMPTY_HEIGHT } from '../engine/conventions'
import { searchTrace } from '../engine/search'
import { height, subtreeAt, type Key, type Tree } from '../engine/tree'
import { SANDBOX_KEY_MAX, SANDBOX_KEY_MIN, SANDBOX_MAX_NODES, SORTED_DEMO } from './config'

export type Notice = { kind: 'range' } | { kind: 'duplicate'; key: Key } | { kind: 'missing'; key: Key } | { kind: 'notLeaf'; key: Key } | { kind: 'full' }

export type LogEntry =
  /** `steps`: the engine's lesson captions for the operation's trace, in order (D161). */
  | { kind: 'insert'; key: Key; rebalancing: boolean; steps: string[] }
  | { kind: 'delete'; key: Key; rebalancing: boolean; steps: string[] }
  | { kind: 'rebuild'; rebalancing: boolean; count: number }
  | { kind: 'clear' }

export interface SandboxState {
  /** Keys in the tree, in the order they were inserted: the source of a rebuild. */
  order: Key[]
  tree: Tree
  rebalancing: boolean
  /** Newest first. */
  log: LogEntry[]
  /** The last single insert or leaf delete, on or off, so it can be replayed (D163). */
  lastChange: LastChange | null
  notice: Notice | null
}

export interface LastChange {
  kind: 'insert' | 'delete'
  before: Tree
  key: Key
  rebalance: boolean
}

export type SandboxAction =
  | { type: 'insert'; key: number }
  | { type: 'delete'; key: number }
  | { type: 'toggle' }
  | { type: 'clear' }
  | { type: 'sorted' }
  /** `value` in [0, 1) from the page's seeded random stream. */
  | { type: 'random'; value: number }

export function initialSandbox(): SandboxState {
  return { order: [], tree: null, rebalancing: true, log: [], lastChange: null, notice: null }
}

const has = (tree: Tree, key: Key): boolean => searchTrace(tree, key).found
const count = (tree: Tree): number => (tree === null ? 0 : 1 + count(tree.left) + count(tree.right))
const inRange = (key: number) => Number.isInteger(key) && key >= SANDBOX_KEY_MIN && key <= SANDBOX_KEY_MAX

function build(keys: readonly Key[], rebalancing: boolean): Tree {
  return keys.reduce<Tree>((t, k) => (rebalancing ? avlInsert(t, k).tree : insert(t, k).tree), null)
}

const stepsOf = (op: 'insert' | 'delete', trace: Parameters<typeof captionsFor>[1], key: Key): string[] =>
  captionsFor(op, trace, key).map((c) => c.text)

function doInsert(state: SandboxState, key: number): SandboxState {
  if (!inRange(key)) return { ...state, notice: { kind: 'range' } }
  if (has(state.tree, key)) return { ...state, notice: { kind: 'duplicate', key } }
  if (count(state.tree) >= SANDBOX_MAX_NODES) return { ...state, notice: { kind: 'full' } }
  const rebalance = state.rebalancing
  const result = rebalance ? avlInsertTrace(state.tree, key) : plainInsertTrace(state.tree, key)
  return {
    ...state,
    order: [...state.order, key],
    tree: result.tree,
    log: [{ kind: 'insert', key, rebalancing: rebalance, steps: stepsOf('insert', result.trace, key) }, ...state.log],
    lastChange: { kind: 'insert', before: state.tree, key, rebalance },
    notice: null,
  }
}

/** A leaf only, as C7 teaches (conventions "leaf nodes only", D162). */
function doDelete(state: SandboxState, key: number): SandboxState {
  if (!inRange(key)) return { ...state, notice: { kind: 'range' } }
  if (!has(state.tree, key)) return { ...state, notice: { kind: 'missing', key } }
  const node = subtreeAt(state.tree, key)
  if (node !== null && (node.left !== null || node.right !== null)) return { ...state, notice: { kind: 'notLeaf', key } }
  const rebalance = state.rebalancing
  const result = leafDeleteTrace(state.tree, key, { rebalance })
  return {
    ...state,
    order: state.order.filter((k) => k !== key),
    tree: result.tree,
    log: [{ kind: 'delete', key, rebalancing: rebalance, steps: stepsOf('delete', result.trace, key) }, ...state.log],
    lastChange: { kind: 'delete', before: state.tree, key, rebalance },
    notice: null,
  }
}

const cleared = (state: SandboxState): SandboxState => ({ ...state, order: [], tree: null, lastChange: null, notice: null })

export function sandboxReducer(state: SandboxState, action: SandboxAction): SandboxState {
  switch (action.type) {
    case 'insert':
      return doInsert(state, action.key)
    case 'delete':
      return doDelete(state, action.key)
    case 'toggle': {
      const rebalancing = !state.rebalancing
      return {
        ...state,
        rebalancing,
        tree: build(state.order, rebalancing),
        log: [{ kind: 'rebuild', rebalancing, count: state.order.length }, ...state.log],
        lastChange: null,
        notice: null,
      }
    }
    case 'clear':
      return { ...cleared(state), log: [{ kind: 'clear' }, ...state.log] }
    case 'sorted':
      // A sequence, not a single change: nothing to replay (D163).
      return { ...SORTED_DEMO.reduce(doInsert, { ...cleared(state), log: [{ kind: 'clear' }, ...state.log] }), lastChange: null }
    case 'random': {
      if (count(state.tree) >= SANDBOX_MAX_NODES) return { ...state, notice: { kind: 'full' } }
      const free: Key[] = []
      for (let k = SANDBOX_KEY_MIN; k <= SANDBOX_KEY_MAX; k++) if (!has(state.tree, k)) free.push(k)
      const i = Math.min(free.length - 1, Math.max(0, Math.floor(action.value * free.length)))
      return doInsert(state, free[i])
    }
  }
}

export interface SandboxStats {
  nodes: number
  max: number
  height: number
  /** Height of the shortest tree with this many keys: floor(log2 n), the empty-tree height when empty. */
  shortest: number
  /** Nodes whose balance factor is outside the allowed range. */
  unbalanced: number
  /** The deepest key (leftmost first) and how many nodes a search for it visits. */
  deepest: { key: Key; visits: number } | null
}

function deepestKey(tree: Tree): Key | null {
  if (tree === null) return null
  const lh = height(tree.left)
  const rh = height(tree.right)
  if (tree.left === null && tree.right === null) return tree.key
  return lh >= rh ? deepestKey(tree.left) : deepestKey(tree.right)
}

export function sandboxStats(tree: Tree): SandboxStats {
  const nodes = count(tree)
  const deep = deepestKey(tree)
  return {
    nodes,
    max: SANDBOX_MAX_NODES,
    height: height(tree),
    shortest: nodes === 0 ? EMPTY_HEIGHT : Math.floor(Math.log2(nodes)),
    unbalanced: analyseTree(tree).balanceViolations.length,
    deepest: deep === null ? null : { key: deep, visits: searchTrace(tree, deep).steps },
  }
}
