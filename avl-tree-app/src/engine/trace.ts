import type { RebalanceCase } from './conventions'
import type { Key, Tree } from './tree'

// The trace contract (SE 6.3, FR-ENG-06). Every operation returns its result
// tree plus an ordered list of steps; each step holds whole-tree snapshots, so
// replay, step back and answer marking need no undo logic (SE 6.4).

export type StepKind =
  | 'descend'
  | 'compare'
  | 'found'
  | 'not-found'
  | 'insert'
  | 'delete'
  | 'update-height'
  | 'imbalance'
  | 'rotation'

export interface TraceStep {
  readonly index: number
  readonly kind: StepKind
  /** Set on imbalance and rotation steps only. */
  readonly rebalanceCase?: RebalanceCase
  /** Keys involved in this step. */
  readonly nodes: readonly Key[]
  readonly before: Tree
  readonly after: Tree
  /** Line of the operation's pseudocode table this step matches (FR-VIS-04). */
  readonly pseudocodeLine: number
}

export interface OperationResult {
  tree: Tree
  trace: TraceStep[]
  inserted?: boolean
}

/**
 * Insert pseudocode, one line per step of C6 in the ID. Placeholder until
 * the lecturer's pseudocode is settled (D12, proposal open question 2);
 * not shown to students until content is authored.
 */
export const INSERT_PSEUDOCODE: readonly string[] = [
  'insert the key as in a BST',
  'update heights going up',
  'find the lowest unbalanced node',
  'work out the case',
  'rotate',
]

/** Which line of INSERT_PSEUDOCODE each step kind highlights. */
export const INSERT_PSEUDOCODE_LINE: Readonly<Partial<Record<StepKind, number>>> = {
  compare: 1,
  found: 1,
  insert: 1,
  'update-height': 2,
  imbalance: 3,
  rotation: 5,
}

function sameTree(a: Tree, b: Tree): boolean {
  if (a === b) return true
  if (a === null || b === null) return false
  return a.key === b.key && a.height === b.height && sameTree(a.left, b.left) && sameTree(a.right, b.right)
}

/**
 * Replay a trace from its starting tree and return the final tree. Throws if
 * a step does not start where the previous one ended.
 */
export function replay(start: Tree, trace: readonly TraceStep[]): Tree {
  let current = start
  for (const step of trace) {
    if (!sameTree(step.before, current)) {
      throw new Error(`Trace step ${step.index} (${step.kind}) does not start from the current tree`)
    }
    current = step.after
  }
  return current
}

/**
 * Records steps for one operation. Each step's `before` is the previous
 * step's `after` (or the starting tree), so the snapshot chain holds by
 * construction.
 */
export function recorder(start: Tree, lines: Readonly<Partial<Record<StepKind, number>>>) {
  const steps: TraceStep[] = []
  let current = start
  return {
    steps,
    step(kind: StepKind, nodes: Key[], after: Tree = current, rebalanceCase?: RebalanceCase) {
      steps.push({
        index: steps.length,
        kind,
        ...(rebalanceCase === undefined ? {} : { rebalanceCase }),
        nodes,
        before: current,
        after,
        pseudocodeLine: lines[kind] ?? 0,
      })
      current = after
    },
  }
}

export type Recorder = ReturnType<typeof recorder>
