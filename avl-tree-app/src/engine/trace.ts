import type { RebalanceCase } from './conventions'
import { rotateLeft, rotateRight } from './rotations'
import { makeNode, refreshHeight, replaceAt, type Key, type Tree } from './tree'

// The trace contract from SE 6.3. Search and insert produce steps; the delete
// kind is declared for the delete trace.
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

/**
 * Replay a trace on its starting tree (FR-ENG-06) by re-applying each step
 * from its kind and keys. Snapshots are never read, so a test can compare the
 * result with them. A rotation [at, pivot] is a right rotation when the pivot
 * is smaller than the node, else a left one. Delete steps are not supported
 * until delete has a trace.
 */
export function replay(start: Tree, trace: TraceStep[]): Tree {
  let tree = start
  for (const step of trace) {
    switch (step.kind) {
      case 'compare':
      case 'descend':
      case 'found':
      case 'not-found':
      case 'imbalance':
        break
      case 'insert': {
        const [key] = step.nodes
        tree = replaceAt(tree, key, () => makeNode(key, null, null))
        break
      }
      case 'update-height':
        tree = replaceAt(tree, step.nodes[0], refreshHeight)
        break
      case 'rotation': {
        const [at, pivot] = step.nodes
        tree = replaceAt(tree, at, pivot < at ? rotateRight : rotateLeft)
        break
      }
      case 'delete':
        throw new Error('replay: delete steps are not supported until delete has a trace')
    }
  }
  return tree
}
