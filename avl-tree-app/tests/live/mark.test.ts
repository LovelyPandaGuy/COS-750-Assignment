import { describe, expect, it } from 'vitest'
import { rotateLeft, rotateRight } from '../../src/engine/rotations'
import { replaceAt, type Key, type Tree } from '../../src/engine/tree'
import { treeFromShape } from '../../src/live/crossCheck'
import { engineAnswer, workTree } from '../../src/live/engineAnswer'
import { encodeKey, type RawKey } from '../../src/live/keys'
import { loadContent } from '../../src/live/load'
import { markQuestion, parseValue, type BuilderStep, type Response } from '../../src/live/mark'
import type { Question } from '../../src/live/types'

// Spec: add-live-lesson-questions / lesson-questions (marking, wrong answers, values). ID 9.5, 9.6, 10.1, 12.2.

const content = loadContent().content!
const all: Question[] = [
  ...content.checks.questions,
  ...content.diagnostic.questions,
  ...content.readiness.questions,
  ...content.lessons.flatMap((l) => [...l.screens, ...(l.refresher?.screens ?? [])].flatMap((s) => [(s as { task?: Question }).task, (s as { transfer?: Question }).transfer].filter((q): q is Question => q !== undefined))),
]
const byId = (id: string) => all.find((q) => q.id === id)!

/** The engine's right answer as a response. */
function rightResponse(q: Question): Response {
  const a = engineAnswer(q)
  switch (a.kind) {
    case 'option':
      return { kind: 'option', id: a.id }
    case 'values':
      return { kind: 'values', values: a.values, unbalanced: a.unbalanced, isAvl: a.isAvl }
    case 'nodes':
      return { kind: 'nodes', nodes: a.nodes }
    case 'trace':
      return { kind: 'trace', path: a.path, found: a.found }
    case 'tree':
      return { kind: 'tree', tree: a.tree, log: [] }
  }
}

const rotate = (t: Tree, about: Key, dir: 'left' | 'right') => replaceAt(t, about, dir === 'right' ? rotateRight : rotateLeft)
const parentOf = (t: Tree, key: Key): Key | null => {
  let n = t
  let p: Key | null = null
  while (n !== null && n.key !== key) {
    p = n.key
    n = key < n.key ? n.left : n.right
  }
  return p
}

describe('ID 12.2 the engine marks every answer', () => {
  it('every question is right when answered with the engine’s answer', () => {
    for (const q of all) expect(markQuestion(q, rightResponse(q)).verdict, q.id).toBe('right')
  })

  it('balance factors from the engine', () => {
    expect(markQuestion(byId('c3-s11-task'), { kind: 'values', values: [4] }).verdict).toBe('right')
  })

  it('a tree marked by shape', () => {
    const tree = treeFromShape([40, [25, [20, [10]], [30, [27], [35]]], [50, null, [60]]])
    expect(markQuestion(byId('chk6-04'), { kind: 'tree', tree, log: [] }).verdict).toBe('right')
  })

  it('part right: Almost there', () => {
    expect(markQuestion(byId('chk3-01'), { kind: 'values', values: [2, -1] }).verdict).toBe('partial')
  })
})

describe('ID 9.6 wrong answers name their misconception', () => {
  it('sign mistake', () => {
    const m = markQuestion(byId('c3-s11-task'), { kind: 'values', values: [-4] })
    expect(m.misconceptionId).toBe('misc-bf-sign')
    expect(m.reason).toMatch(/^The sign is reversed/)
  })

  it('wrong direction in a trace', () => {
    const m = markQuestion(byId('chk4-01'), { kind: 'trace', path: [50, 70], found: null })
    expect(m.misconceptionId).toBe('misc-bst-order-reversed')
  })

  it('single rotation for an inside case', () => {
    const q = byId('chk5-03')
    const tree = rotate(workTree(q), 20, 'left')
    const m = markQuestion(q, { kind: 'tree', tree, log: [{ type: 'rotate', about: 20, dir: 'left' }] })
    expect(m.misconceptionId).toBe('misc-single-for-inside')
  })

  it('every wrongAnswers entry in the content can be reached', () => {
    const misses: string[] = []
    for (const q of all) {
      for (const w of (q.wrongAnswers ?? []) as Record<string, unknown>[]) {
        const r = wrongResponse(q, w)
        if (r === null) {
          misses.push(`${q.id}: cannot build an answer for ${JSON.stringify(w).slice(0, 80)}`)
          continue
        }
        const m = markQuestion(q, r)
        if (m.verdict === 'right' || m.misconceptionId !== w.misconceptionId) misses.push(`${q.id}: ${String(w.pattern ?? w.node ?? w.value ?? 'shape')} gave ${m.misconceptionId ?? m.verdict}, expected ${String(w.misconceptionId)}`)
      }
    }
    if (misses.length > 0) throw new Error(misses.join(' || '))
  })
})

/** An answer that should match this wrongAnswers entry, or null when one cannot be built. */
function wrongResponse(q: Question, w: Record<string, unknown>): Response | null {
  const a = engineAnswer(q)
  if (typeof w.target === 'number' && a.kind === 'values') {
    const values = [...a.values]
    values[w.target] = w.value as number
    return { kind: 'values', values, unbalanced: a.unbalanced, isAvl: a.isAvl }
  }
  if (Array.isArray(w.unbalanced) && a.kind === 'values') return { kind: 'values', values: a.values, unbalanced: (w.unbalanced as RawKey[]).map(encodeKey), isAvl: a.isAvl }
  if (w.node !== undefined && a.kind === 'nodes') return { kind: 'nodes', nodes: [encodeKey(w.node as RawKey)] }
  if (w.shape !== undefined) return { kind: 'tree', tree: treeFromShape(w.shape), log: [] }
  if (a.kind === 'trace') {
    const tree = workTree(q)
    if (w.pattern === 'visits-extra-nodes') {
      const extra = [tree?.left?.key, tree?.right?.key, ...a.path].find((k) => k !== undefined && !a.path.includes(k))
      return extra === undefined ? null : { kind: 'trace', path: [...a.path, extra], found: a.found }
    }
    if (w.pattern === 'goes-wrong-direction') {
      const root = tree!
      const other = a.path[1] === root.left?.key ? root.right?.key : root.left?.key
      return other === undefined ? null : { kind: 'trace', path: [root.key, other], found: null }
    }
  }
  if (a.kind === 'tree' && typeof w.pattern === 'string') {
    const start = workTree(q)
    const eng = engineRots(q)
    const n = eng.at(-1)
    if (n === undefined) return null
    const opp = (d: 'left' | 'right') => (d === 'left' ? 'right' : 'left')
    const insertKeys = keysFor(q)
    let t = start
    const log: BuilderStep[] = []
    for (const k of insertKeys) {
      t = plainPlace(t, k)
      log.push({ type: 'place', key: k, parent: parentOf(t, k), side: null })
    }
    if (q.operation?.name === 'delete' && q.operation.key !== undefined) {
      t = replaceAt(t, encodeKey(q.operation.key), () => null)
      log.push({ type: 'delete', key: encodeKey(q.operation.key) })
    }
    const doRot = (about: Key, dir: 'left' | 'right') => {
      t = rotate(t, about, dir)
      log.push({ type: 'rotate', about, dir })
    }
    if (w.pattern === 'rotated-at-root') {
      const root = t!.key
      if (root === n.about) return null
      doRot(root, t!.left !== null ? 'right' : 'left')
    } else if (w.pattern === 'rotated-wrong-direction') doRot(n.about, opp(n.dir))
    else if (w.pattern === 'double-wrong-order') {
      if (eng.length !== 2) return null
      doRot(n.about, n.dir)
      doRot(eng[0].about, eng[0].dir)
    } else if (w.pattern === 'rotated-again-above-n') {
      for (const r of eng) doRot(r.about, r.dir)
      const above = parentOf(t, eng.at(-1)!.about === t!.key ? t!.key : t!.key)
      const anc = parentOf(t, n.about) ?? above
      const target = anc ?? t!.key
      doRot(target, t!.left !== null ? 'right' : 'left')
    } else return null
    return { kind: 'tree', tree: t, log }
  }
  return null
}

import { avlInsertTrace } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { leafDeleteTrace } from '../../src/engine/lessonTrace'
import { startTree, keysToInsert } from '../../src/live/engineAnswer'

const keysFor = (q: Question) => (q.type === 'perform-rotation' ? [] : keysToInsert(q))
const plainPlace = (t: Tree, k: Key) => insert(t, k).tree
function engineRots(q: Question) {
  let trace
  const op = q.operation
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
  return trace.filter((s) => s.kind === 'rotation').map((s) => ({ about: s.nodes[0], dir: (s.nodes[1] < s.nodes[0] ? 'right' : 'left') as 'left' | 'right' }))
}

describe('values are typed as the ID writes them', () => {
  it('minus forms', () => {
    expect(['−4', '-4', '+4'].map(parseValue)).toEqual([-4, -4, 4])
  })
  it('unreadable', () => {
    expect(parseValue('four')).toBeNull()
    expect(parseValue('')).toBeNull()
  })
})
