// Sandbox state (add-sandbox, design decision 1). Pure: no React, no storage. Every tree, rebalance
// and statistic comes from the engine; the UI only words and draws them.
import { analyseTree } from '../engine/analyse'
import { avlDelete, avlInsert, type Rebalance } from '../engine/avl'
import { insert, remove } from '../engine/bst'
import { EMPTY_HEIGHT } from '../engine/conventions'
import { searchTrace } from '../engine/search'
import { height, type Key, type Tree } from '../engine/tree'
import { SANDBOX_KEY_MAX, SANDBOX_KEY_MIN, SANDBOX_MAX_NODES, SORTED_DEMO } from './config'

export type Notice = { kind: 'range' } | { kind: 'duplicate'; key: Key } | { kind: 'missing'; key: Key } | { kind: 'full' }

export type LogEntry =
  | { kind: 'insert'; key: Key; parent: Key | null; side: 'left' | 'right' | null; rebalances: Rebalance[]; rebalancing: boolean }
  | { kind: 'delete'; key: Key; rebalances: Rebalance[]; rebalancing: boolean }
  | { kind: 'rebuild'; rebalancing: boolean; count: number }
  | { kind: 'clear' }

export interface SandboxState {
  /** Keys in the tree, in the order they were inserted: the source of a rebuild. */
  order: Key[]
  tree: Tree
  rebalancing: boolean
  /** Newest first. */
  log: LogEntry[]
  /** The last insert, when it was made with rebalancing on, so it can be replayed. */
  lastInsert: { before: Tree; key: Key } | null
  notice: Notice | null
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
  return { order: [], tree: null, rebalancing: true, log: [], lastInsert: null, notice: null }
}

const has = (tree: Tree, key: Key): boolean => searchTrace(tree, key).found
const count = (tree: Tree): number => (tree === null ? 0 : 1 + count(tree.left) + count(tree.right))
const inRange = (key: number) => Number.isInteger(key) && key >= SANDBOX_KEY_MIN && key <= SANDBOX_KEY_MAX

function build(keys: readonly Key[], rebalancing: boolean): Tree {
  return keys.reduce<Tree>((t, k) => (rebalancing ? avlInsert(t, k).tree : insert(t, k).tree), null)
}

/** Where a BST insert puts `key` in `tree`: the last node compared and the side, or the root. */
function placeOf(tree: Tree, key: Key): { parent: Key | null; side: 'left' | 'right' | null } {
  const compared = searchTrace(tree, key).trace.filter((s) => s.kind === 'compare')
  const parent = compared.length === 0 ? null : compared[compared.length - 1].nodes[0]
  return { parent, side: parent === null ? null : key < parent ? 'left' : 'right' }
}

function doInsert(state: SandboxState, key: number): SandboxState {
  if (!inRange(key)) return { ...state, notice: { kind: 'range' } }
  if (has(state.tree, key)) return { ...state, notice: { kind: 'duplicate', key } }
  if (count(state.tree) >= SANDBOX_MAX_NODES) return { ...state, notice: { kind: 'full' } }
  const { parent, side } = placeOf(state.tree, key)
  const result = state.rebalancing ? avlInsert(state.tree, key) : { tree: insert(state.tree, key).tree, rebalance: null }
  const rebalances = result.rebalance === null ? [] : [result.rebalance]
  return {
    ...state,
    order: [...state.order, key],
    tree: result.tree,
    log: [{ kind: 'insert', key, parent, side, rebalances, rebalancing: state.rebalancing }, ...state.log],
    lastInsert: state.rebalancing ? { before: state.tree, key } : null,
    notice: null,
  }
}

function doDelete(state: SandboxState, key: number): SandboxState {
  if (!inRange(key)) return { ...state, notice: { kind: 'range' } }
  if (!has(state.tree, key)) return { ...state, notice: { kind: 'missing', key } }
  const result = state.rebalancing ? avlDelete(state.tree, key) : { tree: remove(state.tree, key).tree, rebalances: [] }
  return {
    ...state,
    order: state.order.filter((k) => k !== key),
    tree: result.tree,
    log: [{ kind: 'delete', key, rebalances: result.rebalances, rebalancing: state.rebalancing }, ...state.log],
    lastInsert: null,
    notice: null,
  }
}

const cleared = (state: SandboxState): SandboxState => ({ ...state, order: [], tree: null, lastInsert: null, notice: null })

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
        lastInsert: null,
        notice: null,
      }
    }
    case 'clear':
      return { ...cleared(state), log: [{ kind: 'clear' }, ...state.log] }
    case 'sorted':
      return SORTED_DEMO.reduce(doInsert, { ...cleared(state), log: [{ kind: 'clear' }, ...state.log] })
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
