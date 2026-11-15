// Step captions from the conventions file (ID 8.2 "a one-line caption", ID 12.1). A caption step
// groups the trace steps it describes (a comparison and the move it causes are one caption), so a
// lesson replay can show one caption per position. Every number is read from the step's snapshot.
import { CONVENTIONS, caseLabel, caseNumber, type RebalanceCase } from './conventions'
import { analyseTree } from './analyse'
import type { FormatKey } from './shape'
import type { TraceStep } from './trace'
import { balanceFactorOf, height, subtreeAt, type Key, type Tree, type TreeNode } from './tree'

export type CaptionOperation = 'search' | 'insert' | 'rotations' | 'delete'

export interface CaptionStep {
  text: string
  /** Index of the last trace step this caption covers; −1 for a caption before any step. */
  last: number
  /** The trace steps this caption covers (empty for the closing caption). */
  steps: number[]
}

const T = CONVENTIONS.captions

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole))
}

/** A number with a true minus sign (captions.format). */
export function minus(n: number): string {
  return n < 0 ? `−${-n}` : String(n)
}

/** A balance factor as the captions show it: +1, 0, −2. */
export function signed(n: number): string {
  return n > 0 ? `+${n}` : minus(n)
}

/** A negative height inside a subtraction is bracketed: 3 − (−1) (captions.format). */
function subtrahend(n: number): string {
  return n < 0 ? `(${minus(n)})` : String(n)
}

function node(tree: Tree, key: Key): TreeNode {
  return subtreeAt(tree, key) as TreeNode
}

const bfOf = (n: TreeNode): number => balanceFactorOf(n)

function updateCaption(n: TreeNode, k: FormatKey): string {
  const h = { left: height(n.left), right: height(n.right) }
  return fill(T.update, { node: k(n.key), hr: minus(h.right), hl: subtrahend(h.left), bf: signed(bfOf(n)) })
}

/**
 * Captions for a trace, in order. `key` is the operation's key (search, insert, delete); for an
 * insert sequence pass `insert` and the key is read from each insert's own steps.
 */
export function captionsFor(op: CaptionOperation, trace: readonly TraceStep[], key?: Key, k: FormatKey = String): CaptionStep[] {
  const out: CaptionStep[] = []
  let opKey = key
  let lastSide: 'left' | 'right' = 'left'
  let lastNode: Key | null = null
  let rebalanced = false

  const add = (text: string, steps: number[]) => out.push({ text, steps, last: steps.length > 0 ? steps[steps.length - 1] : (out[out.length - 1]?.last ?? -1) })
  const closeInsert = () => {
    if (op === 'insert' && rebalanced) add(T.done, [])
    rebalanced = false
  }

  for (let i = 0; i < trace.length; i++) {
    const s = trace[i]
    switch (s.kind) {
      case 'compare': {
        // A new insert in a sequence starts at the root's compare; close the previous one.
        if (op === 'insert' && i > 0 && trace[i - 1].kind !== 'descend') closeInsert()
        if (op === 'insert' && (i === 0 || trace[i - 1].kind !== 'descend')) opKey = insertKeyAfter(trace, i) ?? opKey
        const at = s.nodes[0]
        const next = trace[i + 1]
        if (next?.kind === 'found') {
          add(fill(T['search.found'], { key: k(opKey!), node: k(at) }), [i, i + 1])
          i++
        } else if (next?.kind === 'descend') {
          lastSide = opKey! < at ? 'left' : 'right'
          lastNode = at
          add(fill(lastSide === 'left' ? T['search.compareLess'] : T['search.compareGreater'], { key: k(opKey!), node: k(at) }), [i, i + 1])
          i++
        }
        break
      }
      case 'not-found':
        {
        const at = s.nodes[0] ?? lastNode
        add(fill(T['search.notFound'], { side: lastSide, node: at === null ? '' : k(at), key: k(opKey!) }), [i])
      }
        break
      case 'insert': {
        const inserted = s.nodes[0]
        if (op === 'insert' && i > 0 && trace[i - 1].kind !== 'descend') closeInsert()
        opKey = inserted
        add(
          s.before === null
            ? fill(T['insert.root'], { key: k(inserted) })
            : fill(T['insert.place'], { key: k(inserted), side: lastSide, parent: k(lastNode!) }),
          [i],
        )
        break
      }
      case 'delete':
        add(fill(T['delete.remove'], { key: k(s.nodes[0]) }), [i])
        break
      case 'update-height':
        add(updateCaption(node(s.after, s.nodes[0]), k), [i])
        break
      case 'imbalance': {
        const n = node(s.after, s.nodes[0])
        const bf = signed(bfOf(n))
        const c = s.rebalanceCase as RebalanceCase | undefined
        add(
          op === 'delete' || c === undefined
            ? fill(T['imbalance.delete'], { node: k(n.key), bf })
            : fill(T['imbalance.insert'], { node: k(n.key), bf, case: caseNumber(c), code: c }),
          [i],
        )
        break
      }
      case 'rotation': {
        const [about, child] = s.nodes
        const dir = child < about ? 'right' : 'left'
        add(fill(T.rotate, { child: k(child), about: k(about), dir }), [i])
        rebalanced = true
        break
      }
      case 'descend':
      case 'found':
        // Always consumed with their compare step.
        break
    }
  }
  closeInsert()
  // An insert or a delete closes with "done" once more when its last step left every node in range and
  // no rebalance just said so (the ID's lesson captions). A plain delete that leaves a node out of range
  // gets no closing line (align-sandbox-explanations, D161).
  const end = trace.length > 0 ? trace[trace.length - 1].after : null
  if (op === 'insert' && trace.length > 0 && out[out.length - 1]?.text !== T.done && analyseTree(end).isAvl) add(T.done, [])
  if (op === 'delete' && out[out.length - 1]?.text !== T.done && analyseTree(end).isAvl) add(T.done, [])
  return out
}

/** The key of the insert that the steps from index i belong to. */
function insertKeyAfter(trace: readonly TraceStep[], i: number): Key | undefined {
  for (let j = i; j < trace.length; j++) {
    if (trace[j].kind === 'insert' || trace[j].kind === 'found') return trace[j].nodes[0]
  }
  return undefined
}

/** The case label for a rebalance (re-exported for display beside a caption). */
export { caseLabel }
