import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { avlInsert, avlInsertTrace, INSERT_LINES } from '../../src/engine/avl'
import { analyseTree } from '../../src/engine/analyse'
import { LEAF_HEIGHT } from '../../src/engine/conventions'
import type { TraceStep } from '../../src/engine/trace'
import type { Key, Tree, TreeNode } from '../../src/engine/tree'

// LO7 (C6): the engine side of watching an insert happen.

const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)

const summary = (trace: TraceStep[]) =>
  trace.map((s) => `${s.kind}:${s.nodes.join('>')}${s.rebalanceCase ? `:${s.rebalanceCase}` : ''}`)

const find = (tree: Tree, key: Key): TreeNode | null => {
  let node = tree
  while (node !== null && node.key !== key) node = key < node.key ? node.left : node.right
  return node
}

const keysArb = fc.uniqueArray(fc.integer({ min: 0, max: 100 }), { maxLength: 15 })
const keyArb = fc.integer({ min: -2, max: 102 })

describe('FR-ENG-04 / FR-ENG-06: insert trace steps', () => {
  it('single rotation at the root (RR)', () => {
    const r = avlInsertTrace(avl([10, 20]), 30)
    expect(summary(r.trace)).toEqual([
      'compare:10',
      'descend:10>20',
      'compare:20',
      'descend:20',
      'insert:30',
      'update-height:20',
      'update-height:10',
      'imbalance:10>20:RR',
      'rotation:10>20:RR',
    ])
    expect(r.tree?.key).toBe(20)
    expect(r.tree?.left?.key).toBe(10)
    expect(r.tree?.right?.key).toBe(30)
  })

  it('double rotation at the root (LR)', () => {
    const r = avlInsertTrace(avl([30, 10]), 20)
    expect(summary(r.trace).slice(4)).toEqual([
      'insert:20',
      'update-height:10',
      'update-height:30',
      'imbalance:30>10:LR',
      'rotation:10>20:LR',
      'rotation:30>20:LR',
    ])
    expect(r.tree?.key).toBe(20)
    expect(r.tree?.left?.key).toBe(10)
    expect(r.tree?.right?.key).toBe(30)
  })

  it('hand-worked example: 10, 20, 30, 40, 50 then 25 (RL)', () => {
    const r = avlInsertTrace(avl([10, 20, 30, 40, 50]), 25)
    const s = r.trace
    expect(s.filter((x) => x.kind === 'compare').map((x) => x.nodes[0])).toEqual([20, 40, 30])
    expect(s.filter((x) => x.kind === 'update-height').map((x) => x.nodes[0])).toEqual([30, 40, 20])
    expect(summary(s.filter((x) => x.kind === 'imbalance' || x.kind === 'rotation'))).toEqual([
      'imbalance:20>40:RL',
      'rotation:40>30:RL',
      'rotation:20>30:RL',
    ])
    expect(r.tree?.key).toBe(30)
  })

  it('imbalance below the root stops the walk', () => {
    const r = avlInsertTrace(avl([20, 10, 30, 40]), 50)
    const s = r.trace
    expect(s.filter((x) => x.kind === 'update-height').map((x) => x.nodes[0])).toEqual([40, 30])
    const at = s.findIndex((x) => x.kind === 'imbalance')
    expect(summary(s.slice(at))).toEqual(['imbalance:30>40:RR', 'rotation:30>40:RR'])
    expect(s.slice(at).some((x) => x.nodes.includes(20))).toBe(false)
  })

  it('no imbalance', () => {
    const s = avlInsertTrace(avl([20, 10, 30]), 5).trace
    const at = s.findIndex((x) => x.kind === 'insert')
    expect(summary(s.slice(at))).toEqual(['insert:5', 'update-height:10', 'update-height:20'])
  })

  it('duplicate key', () => {
    const T = avl([20, 10, 30])
    const r = avlInsertTrace(T, 10)
    expect(summary(r.trace)).toEqual(['compare:20', 'descend:20>10', 'compare:10', 'found:10'])
    expect(r.inserted).toBe(false)
    for (const step of r.trace) {
      expect(step.before).toBe(T)
      expect(step.after).toBe(T)
    }
  })

  it('empty tree', () => {
    const r = avlInsertTrace(null, 7)
    expect(summary(r.trace)).toEqual(['insert:7'])
    expect(r.trace[0].before).toBeNull()
    expect(r.trace[0].after).toEqual({ key: 7, height: LEAF_HEIGHT, left: null, right: null })
  })

  it('heights update one node at a time', () => {
    const s = avlInsertTrace(avl([10, 20]), 30).trace
    const ins = s.find((x) => x.kind === 'insert')!
    expect(find(ins.after, 20)?.height).toBe(LEAF_HEIGHT)
    expect(find(ins.after, 10)?.height).toBe(LEAF_HEIGHT + 1)
    expect(analyseTree(ins.after).heightMismatches.map((m) => m.key).sort()).toEqual([10, 20])

    const [u20, u10] = s.filter((x) => x.kind === 'update-height')
    expect(find(u20.after, 20)?.height).toBe(LEAF_HEIGHT + 1)
    expect(find(u20.after, 10)?.height).toBe(LEAF_HEIGHT + 1)
    expect(find(u10.after, 10)?.height).toBe(LEAF_HEIGHT + 2)
  })
})

describe('FR-ENG-04 / FR-ENG-06: AVL insert trace', () => {
  it('property: agrees with AVL insert and leaves the input unchanged', () => {
    fc.assert(
      fc.property(keysArb, keyArb, (keys, key) => {
        const T = avl(keys)
        const copy = structuredClone(T)
        const traced = avlInsertTrace(T, key)
        const plain = avlInsert(T, key)
        expect(traced.tree).toEqual(plain.tree)
        expect(traced.inserted).toBe(plain.inserted)
        expect(traced.rebalance).toEqual(plain.rebalance)
        expect(T).toEqual(copy)
      }),
    )
  })

  it('property: snapshots chain from start to result', () => {
    fc.assert(
      fc.property(keysArb, keyArb, (keys, key) => {
        const T = avl(keys)
        const r = avlInsertTrace(T, key)
        expect(r.trace.length).toBeGreaterThan(0)
        expect(r.trace.map((s) => s.index)).toEqual(r.trace.map((_, i) => i))
        expect(r.trace[0].before).toEqual(T)
        for (let i = 1; i < r.trace.length; i++) expect(r.trace[i].before).toEqual(r.trace[i - 1].after)
        expect(r.trace[r.trace.length - 1].after).toEqual(r.tree)
      }),
    )
  })

  it('property: step structure', () => {
    fc.assert(
      fc.property(keysArb, keyArb, (keys, key) => {
        const r = avlInsertTrace(avl(keys), key)
        const imbalances = r.trace.filter((s) => s.kind === 'imbalance')
        const rotations = r.trace.filter((s) => s.kind === 'rotation')
        expect(imbalances.length).toBeLessThanOrEqual(1)
        if (imbalances.length === 0) {
          expect(rotations).toEqual([])
          expect(r.rebalance).toBeNull()
        } else {
          const [im] = imbalances
          expect(r.rebalance).toEqual({ case: im.rebalanceCase, node: im.nodes[0] })
          const single = im.rebalanceCase === 'LL' || im.rebalanceCase === 'RR'
          expect(rotations.length).toBe(single ? 1 : 2)
          for (const rot of rotations) expect(rot.rebalanceCase).toBe(im.rebalanceCase)
        }
        for (const s of r.trace) {
          if (s.kind !== 'imbalance' && s.kind !== 'rotation') expect(s.rebalanceCase).toBeUndefined()
        }
        expect(analyseTree(r.tree).heightMismatches).toEqual([])
      }),
    )
  })
})

describe('FR-VIS-04 / FR-ENG-04: insert pseudocode line map', () => {
  it('pins the C6 outline numbering', () => {
    expect(INSERT_LINES).toEqual({
      compare: 1,
      descend: 1,
      found: 1,
      insert: 1,
      'update-height': 2,
      imbalance: 3,
      rotation: 5,
    })
  })

  it('lines by step kind', () => {
    const s = avlInsertTrace(avl([10, 20, 30, 40, 50]), 25).trace
    const lineOf = (k: TraceStep['kind']) => [...new Set(s.filter((x) => x.kind === k).map((x) => x.pseudocodeLine))]
    expect(lineOf('compare')).toEqual([INSERT_LINES.compare])
    expect(lineOf('descend')).toEqual([INSERT_LINES.descend])
    expect(lineOf('insert')).toEqual([INSERT_LINES.insert])
    expect(lineOf('update-height')).toEqual([INSERT_LINES['update-height']])
    expect(lineOf('imbalance')).toEqual([INSERT_LINES.imbalance])
    expect(lineOf('rotation')).toEqual([INSERT_LINES.rotation])
  })

  it('duplicate uses the BST-insert line', () => {
    for (const s of avlInsertTrace(avl([20, 10, 30]), 10).trace) {
      expect(s.pseudocodeLine).toBe(INSERT_LINES.insert)
    }
  })
})
