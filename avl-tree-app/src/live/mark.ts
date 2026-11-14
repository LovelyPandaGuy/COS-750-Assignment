// The marker for the ID's questions (lesson-questions; ID 9.5, 9.6, 10.1, 12.2). Every answer is
// marked against the engine (engineAnswer); a wrong answer is matched to the content's explanation and
// misconception. Pure: no React, no storage.
import { avlInsertTrace } from '../engine/avl'
import { leafDeleteTrace } from '../engine/lessonTrace'
import { shapeString } from '../engine/shape'
import type { Key, Tree } from '../engine/tree'
import { treeFromShape } from './crossCheck'
import { engineAnswer, keysToInsert, startTree, workTree } from './engineAnswer'
import { encodeKey, type RawKey } from './keys'
import type { Question } from './types'

export type Verdict = 'right' | 'partial' | 'not-yet'

/** One step the student took in the tree builder (D110). */
export type BuilderStep =
  | { type: 'place'; key: Key; parent: Key | null; side: 'left' | 'right' | null }
  | { type: 'rotate'; about: Key; dir: 'left' | 'right' }
  | { type: 'delete'; key: Key }

export type Response =
  | { kind: 'option'; id: string }
  | { kind: 'values'; values: (number | null)[]; unbalanced?: Key[]; isAvl?: boolean }
  | { kind: 'nodes'; nodes: Key[] }
  | { kind: 'trace'; path: Key[]; found: boolean | null }
  | { kind: 'tree'; tree: Tree; log: BuilderStep[] }

export interface Mark {
  verdict: Verdict
  /** The content's explanation for this answer (ID 10.1 "the reason"). */
  reason: string
  misconceptionId?: string
}

/** A typed value: whole numbers with an optional +, - or true minus sign; anything else is null. */
export function parseValue(text: string): number | null {
  const t = text.trim().replace(/^−/, '-')
  return /^[+-]?\d+$/.test(t) ? Number(t) : null
}

interface Wrong {
  misconceptionId?: string
  feedback?: string
  target?: number
  value?: number
  node?: RawKey
  shape?: unknown
  pattern?: string
  unbalanced?: RawKey[]
}

const wrongs = (q: Question) => (q.wrongAnswers ?? []) as Wrong[]
const feedbackOf = (q: Question) => (q.feedback ?? {}) as { correct?: string; incorrect?: string }
const sameSet = (a: readonly Key[], b: readonly Key[]) => a.length === b.length && [...a].sort((x, y) => x - y).every((k, i) => k === [...b].sort((x, y) => x - y)[i])

function fromWrong(w: Wrong, verdict: Verdict = 'not-yet'): Mark {
  const m: Mark = { verdict, reason: w.feedback ?? '' }
  if (w.misconceptionId !== undefined) m.misconceptionId = w.misconceptionId
  return m
}

const right = (reason: string): Mark => ({ verdict: 'right', reason })
const general = (q: Question, verdict: Verdict = 'not-yet'): Mark => ({ verdict, reason: feedbackOf(q).incorrect ?? '' })

/** The engine's rotations for a build or rotation question: [about, the child that moves up] in order. */
function engineRotations(q: Question): { about: Key; dir: 'left' | 'right' }[] {
  const op = q.operation
  let trace
  if (op?.name === 'delete' && op.key !== undefined) trace = leafDeleteTrace(startTree(q).tree, encodeKey(op.key)).trace
  else {
    let tree = startTree(q).tree
    trace = []
    for (const k of keysToInsert(q)) {
      const r = avlInsertTrace(tree, k)
      trace.push(...r.trace)
      tree = r.tree
    }
  }
  return trace.filter((s) => s.kind === 'rotation').map((s) => ({ about: s.nodes[0], dir: s.nodes[1] < s.nodes[0] ? 'right' : 'left' }))
}

/** The patterns of conventions.wrongAnswerPatterns that a builder log shows (design 2). */
function treePatterns(q: Question, log: readonly BuilderStep[], root: Key | null): Set<string> {
  const found = new Set<string>()
  const engine = engineRotations(q)
  const mine = log.filter((s): s is Extract<BuilderStep, { type: 'rotate' }> => s.type === 'rotate')
  const n = engine.at(-1)?.about
  if (n === undefined) return found
  if (mine.some((r) => r.about === root && root !== n)) found.add('rotated-at-root')
  for (const r of mine) {
    const e = engine.find((x) => x.about === r.about)
    if (e !== undefined && e.dir !== r.dir) found.add('rotated-wrong-direction')
  }
  if (engine.length === 2) {
    const child = engine[0].about
    const iN = mine.findIndex((r) => r.about === n)
    const iChild = mine.findIndex((r) => r.about === child)
    // The right rotation about n, but before the one about its child. The wrong way about n is
    // "rotated the wrong direction" instead.
    if (iN !== -1 && mine[iN].dir === engine[1].dir && (iChild === -1 || iN < iChild)) found.add('double-wrong-order')
  }
  const iFixed = mine.findIndex((r) => r.about === n)
  if (iFixed !== -1 && mine.slice(iFixed + 1).some((r) => r.about !== n && !engine.some((e) => e.about === r.about))) found.add('rotated-again-above-n')
  return found
}

function tracePatterns(q: Question, path: readonly Key[]): Set<string> {
  const found = new Set<string>()
  const engine = engineAnswer(q)
  if (engine.kind !== 'trace') return found
  const key = encodeKey(q.searchKey as RawKey)
  const tree = startTree(q).tree
  let node = tree
  for (let i = 0; i < path.length; i++) {
    if (node === null) break
    if (path[i] !== node.key) {
      // The student left the search path here: compare with the two children of the previous node.
      const prev = i === 0 ? null : findNode(tree, path[i - 1])
      if (prev !== null && (prev.left?.key === path[i] || prev.right?.key === path[i])) found.add('goes-wrong-direction')
      break
    }
    if (key === node.key) break
    node = key < node.key ? node.left : node.right
  }
  if (path.some((k) => !engine.path.includes(k))) found.add('visits-extra-nodes')
  return found
}

function findNode(tree: Tree, key: Key): Tree {
  let n = tree
  while (n !== null && n.key !== key) n = key < n.key ? n.left : n.right
  return n
}

export function markQuestion(q: Question, response: Response): Mark {
  const engine = engineAnswer(q)
  const fb = feedbackOf(q)
  switch (response.kind) {
    case 'option': {
      const chosen = (q.options ?? []).find((o) => o.id === response.id)
      const isRight = engine.kind === 'option' && response.id === engine.id
      const m: Mark = { verdict: isRight ? 'right' : 'not-yet', reason: chosen?.explanation ?? '' }
      if (!isRight && chosen?.misconceptionId !== undefined) m.misconceptionId = chosen.misconceptionId
      return m
    }
    case 'values': {
      if (engine.kind !== 'values') return general(q)
      const valuesRight = engine.values.map((v, i) => v === response.values[i])
      const unbalancedRight = engine.unbalanced === undefined || sameSet(engine.unbalanced, response.unbalanced ?? [])
      const avlRight = engine.isAvl === undefined || engine.isAvl === response.isAvl
      if (valuesRight.every(Boolean) && unbalancedRight && avlRight) return right(fb.correct ?? '')
      const verdict: Verdict = valuesRight.some(Boolean) || (valuesRight.every(Boolean) && (!unbalancedRight || !avlRight)) ? 'partial' : 'not-yet'
      for (const [i, ok] of valuesRight.entries()) {
        if (ok) continue
        const w = wrongs(q).find((x) => x.target === i && x.value === response.values[i])
        if (w !== undefined) return fromWrong(w, verdict)
      }
      if (!unbalancedRight) {
        const w = wrongs(q).find((x) => x.unbalanced !== undefined && sameSet(x.unbalanced.map(encodeKey), response.unbalanced ?? []))
        if (w !== undefined) return fromWrong(w, verdict)
      }
      return general(q, verdict)
    }
    case 'nodes': {
      if (engine.kind !== 'nodes') return general(q)
      if (sameSet(engine.nodes, response.nodes)) return right(fb.correct ?? '')
      for (const k of response.nodes) {
        if (engine.nodes.includes(k)) continue
        const w = wrongs(q).find((x) => x.node !== undefined && encodeKey(x.node) === k)
        if (w !== undefined) return fromWrong(w)
      }
      return general(q)
    }
    case 'trace': {
      if (engine.kind !== 'trace') return general(q)
      const pathRight = response.path.length === engine.path.length && response.path.every((k, i) => k === engine.path[i])
      if (pathRight && response.found === engine.found) return right(fb.correct ?? '')
      const patterns = tracePatterns(q, response.path)
      const w = wrongs(q).find((x) => x.pattern !== undefined && patterns.has(x.pattern))
      if (w !== undefined) return fromWrong(w)
      return general(q, pathRight ? 'partial' : 'not-yet')
    }
    case 'tree': {
      if (engine.kind !== 'tree') return general(q)
      const mine = shapeString(response.tree)
      if (mine === shapeString(engine.tree)) return right(fb.correct ?? '')
      const byShape = wrongs(q).find((x) => x.shape !== undefined && shapeString(treeFromShape(x.shape)) === mine)
      if (byShape !== undefined) return fromWrong(byShape)
      const patterns = treePatterns(q, response.log, workTree(q)?.key ?? null)
      const byPattern = wrongs(q).find((x) => x.pattern !== undefined && patterns.has(x.pattern))
      if (byPattern !== undefined) return fromWrong(byPattern)
      return general(q)
    }
  }
}
