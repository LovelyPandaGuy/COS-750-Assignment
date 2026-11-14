import { CONVENTIONS } from './conventions'
import type { Key, Tree, TreeNode } from './tree'
import type { TraceKind, TraceStep } from './trace'

export type SearchForm = 'loop' | 'recursive'

export interface SearchTraceResult {
  found: boolean
  /** Number of nodes visited (FR-ENG-09), not the trace length. */
  steps: number
  trace: TraceStep[]
}

type Purpose = 'compare' | 'found' | 'descendLeft' | 'descendRight' | 'notFound'

// Pseudocode lines from the ID's two listings (ID 7.4), as conventions.json numbers them
// (pseudocode.lineForStep). The compare step lights the equality test; found, the return under it.
const LINE_FOR = CONVENTIONS.pseudocode.lineForStep

export const LOOP_LINES: Record<Purpose, number> = {
  compare: LINE_FOR['search-loop'].compareEqual,
  found: LINE_FOR['search-loop'].found,
  descendLeft: LINE_FOR['search-loop'].goLeft,
  descendRight: LINE_FOR['search-loop'].goRight,
  notFound: LINE_FOR['search-loop'].notFound,
}

export const RECURSIVE_LINES: Record<Purpose, number> = {
  compare: LINE_FOR['search-recursive'].compareEqual,
  found: LINE_FOR['search-recursive'].found,
  descendLeft: LINE_FOR['search-recursive'].goLeft,
  descendRight: LINE_FOR['search-recursive'].goRight,
  notFound: LINE_FOR['search-recursive'].notFound,
}

const KIND: Record<Purpose, TraceKind> = {
  compare: 'compare',
  found: 'found',
  descendLeft: 'descend',
  descendRight: 'descend',
  notFound: 'not-found',
}

/**
 * Search with a trace. For each node visited: a compare step, then found or
 * descend. Descend lists the key moved from and the key moved to when that
 * child exists. A search that runs off the tree ends with not-found at the
 * last node visited (no keys for an empty tree).
 */
export function searchTrace(tree: Tree, key: Key, form: SearchForm = 'loop'): SearchTraceResult {
  const lines = form === 'loop' ? LOOP_LINES : RECURSIVE_LINES
  const trace: TraceStep[] = []
  let steps = 0

  const push = (purpose: Purpose, nodes: Key[]) => {
    trace.push({
      index: trace.length,
      kind: KIND[purpose],
      nodes,
      before: tree,
      after: tree,
      pseudocodeLine: lines[purpose],
    })
  }

  // Emits compare, then found or descend, for a visited node; returns where to go next.
  const visit = (node: TreeNode): { done: boolean; next: Tree } => {
    steps++
    push('compare', [node.key])
    if (key === node.key) {
      push('found', [node.key])
      return { done: true, next: null }
    }
    const goLeft = key < node.key
    const next = goLeft ? node.left : node.right
    push(goLeft ? 'descendLeft' : 'descendRight', next === null ? [node.key] : [node.key, next.key])
    return { done: false, next }
  }

  let found = false
  if (tree === null) {
    push('notFound', [])
  } else if (form === 'loop') {
    let node: Tree = tree
    let last: TreeNode = tree
    while (node !== null) {
      last = node
      const r = visit(node)
      if (r.done) {
        found = true
        break
      }
      node = r.next
    }
    if (!found) push('notFound', [last.key])
  } else {
    const recurse = (node: TreeNode): boolean => {
      const r = visit(node)
      if (r.done) return true
      if (r.next === null) {
        push('notFound', [node.key])
        return false
      }
      return recurse(r.next)
    }
    found = recurse(tree)
  }

  return { found, steps, trace }
}
