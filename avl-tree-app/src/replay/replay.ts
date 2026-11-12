import { avlInsertTrace } from '../engine/avl'
import type { RebalanceCase } from '../engine/conventions'
import { searchTrace, type SearchForm } from '../engine/search'
import type { TraceStep } from '../engine/trace'
import { balanceFactorOf, subtreeAt, type Key, type Tree } from '../engine/tree'
import type { Roles } from '../ui/tree/describe'

// Replay of an engine trace (FR-VIS-03). Pure: no React. Every tree, role and
// number here is read from the trace; the UI only words and draws it.

export type Operation = { kind: 'insert'; tree: Tree; key: Key } | { kind: 'search'; tree: Tree; key: Key }

export interface OperationTrace {
  trace: TraceStep[]
  /** Nodes visited, for a search (FR-ENG-09). */
  steps?: number
}

/** The engine's trace for an operation; `form` only matters for a search. */
export function traceFor(op: Operation, form: SearchForm): OperationTrace {
  if (op.kind === 'insert') return { trace: avlInsertTrace(op.tree, op.key).trace }
  const r = searchTrace(op.tree, op.key, form)
  return { trace: r.trace, steps: r.steps }
}

export const SPEEDS = [0.5, 1, 2] as const
export type Speed = (typeof SPEEDS)[number]

export interface ReplayState {
  /** 0 is the start tree; p shows the tree after step p. */
  position: number
  length: number
  playing: boolean
  speed: Speed
  /** Waiting for a prediction: stays at 0 and will not advance. */
  held: boolean
}

export type ReplayAction =
  | { type: 'step' | 'back' | 'play' | 'pause' | 'toggle' | 'tick' | 'slower' | 'faster' }
  | { type: 'setSpeed'; speed: Speed }
  | { type: 'jumpTo'; stepIndex: number }
  | { type: 'hold'; held: boolean }
  | { type: 'reset'; length: number }

export function initReplay(length: number, held = false): ReplayState {
  return { position: 0, length, playing: false, speed: 1, held }
}

const clamp = (p: number, length: number) => Math.max(0, Math.min(length, p))
const shiftSpeed = (speed: Speed, by: 1 | -1): Speed => {
  const i = SPEEDS.indexOf(speed) + by
  return SPEEDS[Math.max(0, Math.min(SPEEDS.length - 1, i))]
}

export function replayReducer(state: ReplayState, action: ReplayAction): ReplayState {
  switch (action.type) {
    case 'step':
      if (state.held) return state
      return { ...state, position: clamp(state.position + 1, state.length), playing: false }
    case 'back':
      return { ...state, position: clamp(state.position - 1, state.length), playing: false }
    case 'play':
      if (state.held) return state
      return { ...state, playing: true, position: state.position >= state.length ? 0 : state.position }
    case 'pause':
      return { ...state, playing: false }
    case 'toggle':
      return replayReducer(state, { type: state.playing ? 'pause' : 'play' })
    case 'tick': {
      if (!state.playing || state.held) return state
      const position = clamp(state.position + 1, state.length)
      return { ...state, position, playing: position < state.length }
    }
    case 'slower':
      return { ...state, speed: shiftSpeed(state.speed, -1) }
    case 'faster':
      return { ...state, speed: shiftSpeed(state.speed, 1) }
    case 'setSpeed':
      return { ...state, speed: action.speed }
    case 'jumpTo':
      if (state.held) return state
      return { ...state, position: clamp(action.stepIndex + 1, state.length), playing: false }
    case 'hold':
      return action.held ? { ...state, held: true, position: 0, playing: false } : { ...state, held: false }
    case 'reset':
      return { ...initReplay(action.length, state.held), speed: state.speed }
  }
}

/** The tree shown at position p: the start tree, or step p's `after` snapshot. */
export function treeAt(start: Tree, trace: TraceStep[], p: number): Tree {
  return p <= 0 ? start : trace[Math.min(p, trace.length) - 1].after
}

/** The step shown at position p, or null at the start. */
export function stepAt(trace: TraceStep[], p: number): TraceStep | null {
  return p <= 0 || trace.length === 0 ? null : trace[Math.min(p, trace.length) - 1]
}

/** Roles at position p (FR-VIS-02): new from the insert step on; z and y on imbalance and rotation steps. */
export function rolesAt(trace: TraceStep[], p: number): Roles {
  const shown = trace.slice(0, Math.max(0, p))
  const roles: Record<Key, 'new' | 'z' | 'y'> = {}
  const inserted = shown.find((s) => s.kind === 'insert')
  if (inserted) roles[inserted.nodes[0]] = 'new'
  const last = shown[shown.length - 1]
  if (last && (last.kind === 'imbalance' || last.kind === 'rotation')) {
    const imbalance = [...shown].reverse().find((s) => s.kind === 'imbalance')
    if (imbalance) {
      const [z, y] = imbalance.nodes
      roles[z] = 'z'
      roles[y] = 'y'
    }
  }
  return roles
}

/** Nodes visited up to position p: one per compare step (FR-VIS-11). */
export function visitedAt(trace: TraceStep[], p: number): number {
  return trace.slice(0, Math.max(0, p)).filter((s) => s.kind === 'compare').length
}

export type ExplainTag =
  | 'start'
  | 'compare'
  | 'descend'
  | 'descend-none'
  | 'found'
  | 'duplicate'
  | 'not-found'
  | 'insert'
  | 'height'
  | 'imbalance'
  | 'rotation'

export interface Explanation {
  tag: ExplainTag
  /** The node the step is about. */
  key?: Key
  /** A second node: the child moved to, the taller child y, or the pivot. */
  other?: Key
  direction?: 'left' | 'right'
  /** Read from the step's `after` snapshot. */
  height?: number
  balanceFactor?: number
  rebalanceCase?: RebalanceCase
}

/** What the sentence at position p says, as data. Numbers come from the step's `after` snapshot (FR-VIS-07). */
export function explainAt(op: Operation, trace: TraceStep[], p: number): Explanation {
  const step = stepAt(trace, p)
  if (step === null) return { tag: 'start' }
  const [a, b] = step.nodes
  const side = (at: Key): 'left' | 'right' => (op.key < at ? 'left' : 'right')
  switch (step.kind) {
    case 'compare':
      return { tag: 'compare', key: a, direction: op.key === a ? undefined : side(a) }
    case 'descend':
      return b === undefined ? { tag: 'descend-none', key: a, direction: side(a) } : { tag: 'descend', key: a, other: b, direction: side(a) }
    case 'found':
      return { tag: op.kind === 'insert' ? 'duplicate' : 'found', key: a }
    case 'not-found':
      return { tag: 'not-found', key: a }
    case 'insert':
      return { tag: 'insert', key: a }
    case 'update-height': {
      const node = subtreeAt(step.after, a)
      return { tag: 'height', key: a, height: node?.height, balanceFactor: balanceFactorOf(node) }
    }
    case 'imbalance':
      return { tag: 'imbalance', key: a, other: b, balanceFactor: balanceFactorOf(subtreeAt(step.after, a)), rebalanceCase: step.rebalanceCase }
    case 'rotation':
      // Same rule as replay(): a pivot smaller than the node means a right rotation.
      return { tag: 'rotation', key: a, other: b, direction: b < a ? 'right' : 'left', rebalanceCase: step.rebalanceCase }
    case 'delete':
      throw new Error('explainAt: delete steps are not supported until delete has a trace')
  }
}
