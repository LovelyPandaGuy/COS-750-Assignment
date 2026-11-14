// What a student has entered so far for one question, and the response it becomes (lesson-questions).
import type { Key, Tree } from '../../../engine/tree'
import { encodeKey } from '../../../live/keys'
import { parseValue, type BuilderStep, type Response } from '../../../live/mark'
import type { OtherScreen, Question } from '../../../live/types'
import type { Attempt } from '../../../state/learnerState'
import { height } from '../../../engine/tree'
import { buildTree } from '../../../live/build'

export interface Draft {
  option: string | null
  values: string[]
  unbalanced: Key[]
  unbalancedNone: boolean
  isAvl: boolean | null
  nodes: Key[]
  none: boolean
  path: Key[]
  found: boolean | null
  tree: Tree
  log: BuilderStep[]
  treeComplete: boolean
}

export function emptyDraft(q: Question): Draft {
  return { option: null, values: (q.targets ?? []).map(() => ''), unbalanced: [], unbalancedNone: false, isAvl: null, nodes: [], none: false, path: [], found: null, tree: null, log: [], treeComplete: false }
}

/** True when every part the question asks for has an answer (Check answer is enabled). */
export function isComplete(q: Question, d: Draft): boolean {
  switch (q.type) {
    case 'mcq':
    case 'case-id':
      return d.option !== null
    case 'enter-values':
      return d.values.every((v) => v.trim() !== '') && (q.askUnbalanced !== true || d.unbalanced.length > 0 || d.unbalancedNone) && (q.askIsAvl !== true || d.isAvl !== null)
    case 'click-node':
      return d.nodes.length > 0 || d.none
    case 'trace':
      return d.path.length > 0 && d.found !== null
    case 'build-tree':
    case 'perform-rotation':
      return d.treeComplete && (d.log.length > 0 || q.type === 'build-tree')
  }
  return false
}

/** The response to mark, or 'unreadable' when a value is not a whole number (no attempt is stored). */
export function responseOf(q: Question, d: Draft): Response | 'unreadable' {
  switch (q.type) {
    case 'mcq':
    case 'case-id':
      return { kind: 'option', id: d.option ?? '' }
    case 'enter-values': {
      const values = d.values.map(parseValue)
      if (values.some((v) => v === null)) return 'unreadable'
      const r: Response = { kind: 'values', values }
      if (q.askUnbalanced === true) r.unbalanced = d.unbalancedNone ? [] : d.unbalanced
      if (q.askIsAvl === true) r.isAvl = d.isAvl ?? undefined
      return r
    }
    case 'click-node':
      return { kind: 'nodes', nodes: d.none ? [] : d.nodes }
    case 'trace':
      return { kind: 'trace', path: d.path, found: d.found }
    default:
      return { kind: 'tree', tree: d.tree, log: d.log }
  }
}

/** A stored form of a response: plain JSON, trees as their shape string. */
export function storedAnswer(r: Response, shape: (t: Tree) => string): unknown {
  return r.kind === 'tree' ? { tree: shape(r.tree), log: r.log } : r
}

export const searchKeyOf = (q: Question): Key => encodeKey(q.searchKey as number | string)

/** A check question is finished when an attempt is right or every allowed attempt is used (ID 9.1). */
export function isFinished(q: Question, attempts: readonly Attempt[], allowed: number): boolean {
  const mine = attempts.filter((a) => a.questionId === q.id)
  return mine.some((a) => a.correct) || mine.length >= allowed
}


/** The option that matches: the engine's for answerFrom engine (the most comparisons, height + 1), else the screen's. */
export function predictAnswer(s: OtherScreen): string | undefined {
  if (s.answerFrom === 'engine' && s.tree !== undefined) return String(height(buildTree(s.tree).tree) + 1)
  return s.answer
}

