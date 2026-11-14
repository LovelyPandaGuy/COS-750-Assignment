// Builds the trees and operations the content names, through the engine (ID 12.2: "Trees are stored
// as insertion sequences … The app's engine builds the tree and works out the answers"). Used by the
// cross-checks and by the lesson UI, so what is checked is exactly what is shown.
import { avlInsert, avlInsertTrace } from '../engine/avl'
import { insert } from '../engine/bst'
import { captionsFor, type CaptionOperation, type CaptionStep } from '../engine/captions'
import { insertSequenceTrace, leafDeleteTrace, plainInsertTrace, rotationSequenceTrace } from '../engine/lessonTrace'
import { searchTrace } from '../engine/search'
import type { FormatKey } from '../engine/shape'
import type { TraceStep } from '../engine/trace'
import { makeNode, type Key, type Tree } from '../engine/tree'
import { encodeKey, formatFor, keyKind, type RawKey } from './keys'
import type { Operation, RawStructure, RawTree } from './types'

export interface BuiltTree {
  tree: Tree
  formatKey: FormatKey
}

/** The keys a raw tree and operation mention, for choosing the key format. */
function keysOf(raw: RawTree | undefined, op?: Operation): RawKey[] {
  return [...(raw?.insert ?? []), ...(raw?.structure !== undefined ? flatten(raw.structure) : []), ...(op?.key !== undefined ? [op.key] : []), ...(op?.keys ?? []), ...(op?.steps?.map((s) => s.about) ?? [])]
}

function flatten(s: RawStructure | null | undefined): RawKey[] {
  return s === null || s === undefined ? [] : [s[0], ...flatten(s[1]), ...flatten(s[2])]
}

function fromStructure(s: RawStructure | null | undefined): Tree {
  return s === null || s === undefined ? null : makeNode(encodeKey(s[0]), fromStructure(s[1]), fromStructure(s[2]))
}

/** The engine tree for an insertion sequence (AVL inserts, or plain BST inserts when `rebalance` is false), or an explicit structure. */
export function buildTree(raw: RawTree | undefined, op?: Operation): BuiltTree {
  const kind = keyKind(keysOf(raw, op))
  const formatKey = formatFor(kind === 'letter' ? 'letter' : 'integer')
  if (raw?.structure !== undefined) return { tree: fromStructure(raw.structure), formatKey }
  const plain = raw?.rebalance === false
  const tree = (raw?.insert ?? []).map(encodeKey).reduce<Tree>((t, k) => (plain ? insert(t, k).tree : avlInsert(t, k).tree), null)
  return { tree, formatKey }
}

export interface PlayedOperation {
  start: Tree
  trace: TraceStep[]
  end: Tree
  captions: CaptionStep[]
  formatKey: FormatKey
  /** search only: nodes compared (D44). */
  compared?: number
  /** insert, insert-sequence: the inserted keys, for the "new" role. */
  inserted: Key[]
}

const CAPTION_OP: Record<Operation['name'], CaptionOperation> = {
  search: 'search',
  insert: 'insert',
  'insert-sequence': 'insert',
  rotations: 'rotations',
  delete: 'delete',
}

/** Runs a screen's operation on its tree through the engine, with the captions for each step. */
export function playOperation(raw: RawTree, op: Operation): PlayedOperation {
  const { tree: start, formatKey } = buildTree(raw, op)
  const key = op.key === undefined ? undefined : encodeKey(op.key)
  let trace: TraceStep[]
  let end: Tree = start
  let compared: number | undefined
  let inserted: Key[] = []
  switch (op.name) {
    case 'search': {
      const r = searchTrace(start, key!)
      trace = r.trace
      compared = r.steps
      break
    }
    case 'insert': {
      if (op.rebalance === false) {
        const r = plainInsertTrace(start, key!)
        trace = r.trace
        end = r.tree
      } else {
        const r = avlInsertTrace(start, key!)
        trace = r.trace
        end = r.tree
      }
      inserted = [key!]
      break
    }
    case 'insert-sequence': {
      const keys = (op.keys ?? []).map(encodeKey)
      const r = insertSequenceTrace(start, keys)
      trace = r.trace
      end = r.tree
      inserted = keys
      break
    }
    case 'rotations': {
      const r = rotationSequenceTrace(start, (op.steps ?? []).map((s) => ({ about: encodeKey(s.about), dir: s.dir })))
      trace = r.trace
      end = r.tree
      break
    }
    case 'delete': {
      const r = leafDeleteTrace(start, key!)
      trace = r.trace
      end = r.tree
      break
    }
  }
  return { start, trace, end, captions: captionsFor(CAPTION_OP[op.name], trace, key, formatKey), formatKey, compared, inserted }
}
