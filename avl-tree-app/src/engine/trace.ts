import type { RebalanceCase } from './conventions'
import type { Key, Tree } from './tree'

// The trace contract from SE 6.3. Only search produces steps so far; the
// insert, delete and rotation kinds are declared for add-operation-trace.
export type TraceKind =
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
  /** Position in the trace, from 0. */
  index: number
  kind: TraceKind
  /** Set on imbalance and rotation steps. */
  rebalanceCase?: RebalanceCase
  /** Keys involved in this step. */
  nodes: Key[]
  /** Immutable snapshots of the tree around this step. */
  before: Tree
  after: Tree
  /** Pseudocode line this step lights up (drives FR-VIS-04). */
  pseudocodeLine: number
}
