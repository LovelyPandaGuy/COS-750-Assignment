// Engine cross-checks (live-content "Typed answers agree with the engine", D95): every answer typed
// into the content is worked out by the engine and compared. A difference is a content error naming
// both values; the app always shows the engine's value. The JSON is never changed.
import { shapeString } from '../engine/shape'
import { height, makeNode, type Key, type Tree } from '../engine/tree'
import { buildTree, playOperation } from './build'
import { engineAnswer, startTree } from './engineAnswer'
import { encodeKey, type RawKey } from './keys'
import type { AnimationScreen, Content, Problem, Question, Screen } from './types'

const show = (v: unknown) => JSON.stringify(v)

function mismatch(file: string, id: string, field: string, stored: unknown, engine: unknown): Problem {
  return { file, id, field, message: `The stored ${field} is ${show(stored)}, but the engine works out ${show(engine)}.` }
}

/** A stored `shape` ([key, left, right] lists) as an engine tree. */
export function treeFromShape(shape: unknown): Tree {
  if (!Array.isArray(shape) || shape.length === 0) return null
  const [key, left, right] = shape as [number | string, unknown, unknown]
  return makeNode(encodeKey(key), treeFromShape(left), treeFromShape(right))
}

const sorted = (keys: readonly Key[]) => [...keys].sort((a, b) => a - b)

/** Every stored answer agrees with the engine's (D95), for every question type. */
export function checkQuestion(file: string, q: Question): Problem[] {
  if (q.expected === undefined) return []
  let a
  try {
    a = engineAnswer(q)
  } catch (e) {
    return [{ file, id: q.id, field: 'operation', message: `The engine cannot work out this question: ${(e as Error).message}.` }]
  }
  const e = q.expected as Record<string, unknown> & unknown[]
  const problems: Problem[] = []
  if (a.kind === 'values') {
    if (show(a.values) !== show(e)) problems.push(mismatch(file, q.id, 'expected', e, a.values))
    if (a.unbalanced !== undefined && show(sorted(a.unbalanced)) !== show(sorted(((q.expectedUnbalanced as RawKey[]) ?? []).map(encodeKey))))
      problems.push(mismatch(file, q.id, 'expectedUnbalanced', q.expectedUnbalanced, a.unbalanced))
    if (a.isAvl !== undefined && a.isAvl !== q.expectedIsAvl) problems.push(mismatch(file, q.id, 'expectedIsAvl', q.expectedIsAvl, a.isAvl))
  } else if (a.kind === 'nodes') {
    const stored = ((e.nodes as RawKey[]) ?? []).map(encodeKey)
    if (show(sorted(stored)) !== show(sorted(a.nodes))) problems.push(mismatch(file, q.id, 'expected.nodes', e.nodes, a.nodes))
    if (e.side !== undefined && a.side !== undefined && e.side !== a.side) problems.push(mismatch(file, q.id, 'expected.side', e.side, a.side))
  } else if (a.kind === 'trace') {
    const stored = ((e.path as RawKey[]) ?? []).map(encodeKey)
    if (show(stored) !== show(a.path) || e.found !== a.found) problems.push(mismatch(file, q.id, 'expected', e, { path: a.path, found: a.found }))
  } else if (a.kind === 'tree') {
    const { formatKey } = startTree(q)
    const stored = shapeString(treeFromShape(e.shape), formatKey)
    const engine = shapeString(a.tree, formatKey)
    if (stored !== engine) problems.push(mismatch(file, q.id, 'expected.shape', stored, engine))
  }
  return problems
}

function checkAnimation(file: string, s: AnimationScreen): Problem[] {
  const problems: Problem[] = []
  const parts: { label: string; tree: AnimationScreen['tree']; operation: AnimationScreen['operation']; steps?: string[]; result?: string }[] = [
    { label: '', tree: s.tree, operation: s.operation, steps: s.steps, result: s.result },
  ]
  if (s.compareWith?.operation !== undefined) parts.push({ label: 'compareWith.', tree: s.compareWith.tree, operation: s.compareWith.operation, steps: s.compareWith.steps })
  for (const p of parts) {
    let played
    try {
      played = playOperation(p.tree, p.operation)
    } catch (e) {
      problems.push({ file, id: s.id, field: `${p.label}operation`, message: `The engine cannot play this operation: ${(e as Error).message}.` })
      continue
    }
    const captions = played.captions.map((c) => c.text)
    if (p.steps !== undefined && show(captions) !== show(p.steps)) problems.push(mismatch(file, s.id, `${p.label}steps`, p.steps, captions))
    const shape = shapeString(played.end, played.formatKey)
    if (p.result !== undefined && shape !== p.result) problems.push(mismatch(file, s.id, `${p.label}result`, p.result, shape))
  }
  return problems
}

/** Predict screens whose answer is the engine's: the most comparisons a search can need, height + 1 (ID 7.2 C2, C4). */
function checkPredict(file: string, s: Screen): Problem[] {
  if (s.type !== 'predict' || s.answerFrom !== 'engine' || s.tree === undefined) return []
  const { tree } = buildTree(s.tree)
  const engine = String(height(tree) + 1)
  return s.answer === engine ? [] : [mismatch(file, s.id, 'answer', s.answer, engine)]
}

export function crossCheck(content: Content, fileOf: (lessonId: string) => string): Problem[] {
  const problems: Problem[] = []
  for (const l of content.lessons) {
    const file = fileOf(l.id)
    for (const s of [...l.screens, ...(l.refresher?.screens ?? [])]) {
      if (s.type === 'animation') problems.push(...checkAnimation(file, s as AnimationScreen))
      problems.push(...checkPredict(file, s))
      const extra = s as { task?: unknown; transfer?: unknown }
      for (const q of [extra.task, extra.transfer]) if (q !== undefined && typeof q === "object") problems.push(...checkQuestion(file, q as Question))
    }
  }
  for (const [file, qs] of [
    ['questions/checks.json', content.checks.questions],
    ['questions/diagnostic.json', content.diagnostic.questions],
    ['questions/readiness.json', content.readiness.questions],
  ] as const) {
    for (const q of qs) problems.push(...checkQuestion(file, q))
  }
  return problems
}
