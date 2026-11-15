import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { avlInsert, avlInsertTrace } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { captionsFor } from '../../src/engine/captions'
import { insertSequenceTrace, leafDeleteTrace, rotationSequenceTrace, TraceError } from '../../src/engine/lessonTrace'
import { searchTrace } from '../../src/engine/search'
import { shapeString } from '../../src/engine/shape'
import { replay } from '../../src/engine/trace'
import type { Tree } from '../../src/engine/tree'
import { encodeKey, formatFor, keyKind, type RawKey } from '../../src/live/keys'

// Spec: add-live-lesson-content / avl-engine (Integer and letter keys, Shape notation, the three
// lesson traces, Step captions). ID 7.2, 7.3, 8.2, 12.2.

const LESSONS = join(__dirname, '../../src/live_content/lessons')

function build(raw: { insert: RawKey[]; rebalance?: boolean }) {
  const kind = keyKind(raw.insert)
  const k = formatFor(kind === 'letter' ? 'letter' : 'integer')
  const tree = raw.insert.map(encodeKey).reduce<Tree>((t, key) => (raw.rebalance === false ? insert(t, key).tree : avlInsert(t, key).tree), null)
  return { tree, k }
}

interface Op {
  name: string
  key?: RawKey
  keys?: RawKey[]
  steps?: { about: RawKey; dir: 'left' | 'right' }[]
}

function play(tree: Tree, op: Op) {
  const key = op.key === undefined ? undefined : encodeKey(op.key)
  switch (op.name) {
    case 'search': {
      const r = searchTrace(tree, key!)
      return { trace: r.trace, end: tree, caption: 'search' as const }
    }
    case 'insert': {
      const r = avlInsertTrace(tree, key!)
      return { trace: r.trace, end: r.tree, caption: 'insert' as const }
    }
    case 'insert-sequence': {
      const r = insertSequenceTrace(tree, op.keys!.map(encodeKey))
      return { trace: r.trace, end: r.tree, caption: 'insert' as const }
    }
    case 'rotations': {
      const r = rotationSequenceTrace(tree, op.steps!.map((s) => ({ about: encodeKey(s.about), dir: s.dir })))
      return { trace: r.trace, end: r.tree, caption: 'rotations' as const }
    }
    case 'delete': {
      const r = leafDeleteTrace(tree, key!)
      return { trace: r.trace, end: r.tree, caption: 'delete' as const }
    }
  }
  throw new Error(`unknown operation ${op.name}`)
}

const animations = readdirSync(LESSONS)
  .flatMap((f) => (JSON.parse(readFileSync(join(LESSONS, f), 'utf8')).screens as Record<string, unknown>[]))
  .filter((s) => s.type === 'animation')

describe('ID 12.2 step captions equal every lesson animation', () => {
  for (const s of animations) {
    const parts = [s, ...(s.compareWith && (s.compareWith as Record<string, unknown>).operation ? [s.compareWith as Record<string, unknown>] : [])]
    for (const [n, part] of parts.entries()) {
      it(`${s.id as string}${n === 1 ? ' (compareWith)' : ''}`, () => {
        const { tree, k } = build(part.tree as { insert: RawKey[]; rebalance?: boolean })
        const op = part.operation as Op
        const r = play(tree, op)
        const caps = captionsFor(r.caption, r.trace, op.key === undefined ? undefined : encodeKey(op.key), k).map((c) => c.text)
        expect(caps).toEqual(part.steps)
        expect(shapeString(replay(tree, r.trace), k)).toBe(shapeString(r.end, k))
        if (n === 0 && typeof s.result === 'string') expect(shapeString(r.end, k)).toBe(s.result)
      })
    }
  }
})

describe('avl-engine: integer and letter keys', () => {
  it('letters build a chain and search Z visits 5 nodes', () => {
    const { tree, k } = build({ insert: ['A', 'D', 'E', 'F', 'Z'], rebalance: false })
    expect(shapeString(tree, k)).toBe('A(·, D(·, E(·, F(·, Z))))')
    expect(searchTrace(tree, encodeKey('Z')).steps).toBe(5)
  })

  it('letters in an AVL tree', () => {
    const { tree, k } = build({ insert: ['G', 'C', 'H', 'B', 'D', 'A'] })
    expect(shapeString(tree, k)).toBe('C(B(A, ·), G(D, H))')
  })

  it('a mixed list is reported', () => {
    expect(keyKind([10, 'A'])).toBe('mixed')
  })
})

describe('avl-engine: shape notation', () => {
  it('examples', () => {
    const t = build({ insert: [10, 20, 30, 40, 50] }).tree
    expect(shapeString(t)).toBe('20(10, 40(30, 50))')
    expect(shapeString(leafDeleteTrace(t, 50).tree)).toBe('20(10, 40(30, ·))')
  })
})

describe('avl-engine: lesson traces', () => {
  it('insert sequence: the running example has four rebalances', () => {
    const r = insertSequenceTrace(null, [3, 2, 1, 4, 5, 6, 7])
    expect(r.trace.filter((s) => s.kind === 'imbalance').map((s) => s.nodes[0])).toEqual([3, 3, 2, 5])
    expect(shapeString(r.tree)).toBe('4(2(1, 3), 6(5, 7))')
    expect(r.trace.map((s) => s.index)).toEqual(r.trace.map((_, i) => i))
  })

  it('rotation sequence: double rotation as two singles', () => {
    const { tree, k } = build({ insert: ['G', 'C', 'H', 'B', 'D', 'E'], rebalance: false })
    const r = rotationSequenceTrace(tree, [
      { about: encodeKey('C'), dir: 'left' },
      { about: encodeKey('G'), dir: 'right' },
    ])
    expect(r.trace.map((s) => k(s.nodes[1]))).toEqual(['D', 'D'])
    expect(shapeString(r.tree, k)).toBe('D(C(B, ·), G(E, H))')
  })

  it('rotation sequence: an impossible rotation is reported', () => {
    expect(() => rotationSequenceTrace(build({ insert: [20, 10] }).tree, [{ about: 20, dir: 'left' }])).toThrow(TraceError)
  })

  it('leaf delete: no rotation, one rotation, not a leaf', () => {
    const t = build({ insert: [20, 10, 40, 30, 50] }).tree
    const none = leafDeleteTrace(t, 50)
    expect(none.trace.some((s) => s.kind === 'rotation')).toBe(false)
    const one = leafDeleteTrace(t, 10)
    expect(one.trace.filter((s) => s.kind === 'rotation')).toHaveLength(1)
    expect(shapeString(one.tree)).toBe('40(20(·, 30), 50)')
    expect(() => leafDeleteTrace(t, 40)).toThrow(/only leaf deletion/)
  })
})

// Spec: align-sandbox-explanations / avl-engine "Plain leaf deletion trace", "Step captions" (D161, LO7).
describe('avl-engine: plain leaf deletion trace (D161)', () => {
  const five = () => [20, 10, 40, 30, 50].reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

  it('removes the leaf and updates up to the root, with no rotation even when unbalanced', () => {
    const r = leafDeleteTrace(five(), 10, { rebalance: false })
    expect(shapeString(r.tree)).toBe('20(·, 40(30, 50))')
    expect(r.trace.some((st) => st.kind === 'rotation' || st.kind === 'imbalance')).toBe(false)
  })

  it('a node with children is outside the scope', () => {
    expect(() => leafDeleteTrace(five(), 40, { rebalance: false })).toThrow(TraceError)
  })

  it('no false closing line after a plain deletion', () => {
    const r = leafDeleteTrace(five(), 10, { rebalance: false })
    expect(captionsFor('delete', r.trace, 10).map((c) => c.text)).toEqual(['10 is a leaf: remove it.', 'Node 20: bf = 1 − (−1) = +2.'])
  })

  it('a rebalancing deletion still closes with the balanced line', () => {
    const r = leafDeleteTrace(five(), 10)
    expect(captionsFor('delete', r.trace, 10).map((c) => c.text).at(-1)).toBe('Every node has a balance factor of −1, 0 or +1.')
  })
})
