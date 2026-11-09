import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { searchTrace, LOOP_LINES, RECURSIVE_LINES } from '../../src/engine/search'
import { search, insert } from '../../src/engine/bst'
import { avlInsert } from '../../src/engine/avl'
import { height, type Tree } from '../../src/engine/tree'
import { build } from './helpers'

const forms = ['loop', 'recursive'] as const
const T = build([20, 10, 30, 5, 15])

const summary = (t: ReturnType<typeof searchTrace>['trace']) =>
  t.map((s) => `${s.kind}:${s.nodes.join('>')}`)

describe('FR-ENG-09: search trace steps', () => {
  for (const form of forms) {
    describe(form, () => {
      it('found key 15', () => {
        const r = searchTrace(T, 15, form)
        expect(r.found).toBe(true)
        expect(summary(r.trace)).toEqual([
          'compare:20',
          'descend:20>10',
          'compare:10',
          'descend:10>15',
          'compare:15',
          'found:15',
        ])
        expect(r.trace.map((s) => s.index)).toEqual([0, 1, 2, 3, 4, 5])
      })

      it('missing key 12', () => {
        const r = searchTrace(T, 12, form)
        expect(r.found).toBe(false)
        expect(summary(r.trace)).toEqual([
          'compare:20',
          'descend:20>10',
          'compare:10',
          'descend:10>15',
          'compare:15',
          'descend:15',
          'not-found:15',
        ])
      })

      it('root key 20', () => {
        expect(summary(searchTrace(T, 20, form).trace)).toEqual(['compare:20', 'found:20'])
      })

      it('empty tree: only not-found, zero steps', () => {
        const r = searchTrace(null, 7, form)
        expect(r.found).toBe(false)
        expect(r.steps).toBe(0)
        expect(summary(r.trace)).toEqual(['not-found:'])
      })

      it('before and after are the unchanged tree and no rebalance case is set', () => {
        const copy = structuredClone(T)
        for (const key of [15, 12, 20]) {
          for (const s of searchTrace(T, key, form).trace) {
            expect(s.before).toBe(T)
            expect(s.after).toBe(T)
            expect(s.rebalanceCase).toBeUndefined()
          }
        }
        expect(T).toEqual(copy)
      })

      it('step counts for the root, a leaf and a missing key are 1, 3 and 3', () => {
        expect([20, 5, 12].map((k) => searchTrace(T, k, form).steps)).toEqual([1, 3, 3])
      })
    })
  }
})

describe('FR-ENG-09: pseudocode line maps', () => {
  it('loop form uses the loop map', () => {
    const lines = searchTrace(T, 12, 'loop').trace.map((s) => s.pseudocodeLine)
    // compare 20, descend left (10 < 20), compare 10, descend right (15 > 10),
    // compare 15, descend left (12 < 15), not-found
    expect(lines).toEqual([
      LOOP_LINES.compare,
      LOOP_LINES.descendLeft,
      LOOP_LINES.compare,
      LOOP_LINES.descendRight,
      LOOP_LINES.compare,
      LOOP_LINES.descendLeft,
      LOOP_LINES.notFound,
    ])
  })
  it('recursive form uses the recursive map', () => {
    const lines = searchTrace(T, 12, 'recursive').trace.map((s) => s.pseudocodeLine)
    expect(lines).toEqual([
      RECURSIVE_LINES.compare,
      RECURSIVE_LINES.descendLeft,
      RECURSIVE_LINES.compare,
      RECURSIVE_LINES.descendRight,
      RECURSIVE_LINES.compare,
      RECURSIVE_LINES.descendLeft,
      RECURSIVE_LINES.notFound,
    ])
  })
  it('found uses the same line as compare in both maps (one line in the ID)', () => {
    expect(LOOP_LINES.found).toBe(LOOP_LINES.compare)
    expect(RECURSIVE_LINES.found).toBe(RECURSIVE_LINES.compare)
    const found = searchTrace(T, 15, 'loop').trace.at(-1)
    expect(found?.pseudocodeLine).toBe(LOOP_LINES.found)
  })
  it('pinned layout from the ID (open question 1: check against the PDF)', () => {
    expect(LOOP_LINES).toEqual({ compare: 4, found: 4, descendLeft: 5, descendRight: 6, notFound: 7 })
    expect(RECURSIVE_LINES).toEqual({ compare: 3, found: 3, descendLeft: 4, descendRight: 5, notFound: 2 })
  })
  it('the two forms differ only in pseudocode lines', () => {
    for (const key of [15, 12, 20, 5, 99]) {
      const a = searchTrace(T, key, 'loop').trace
      const b = searchTrace(T, key, 'recursive').trace
      expect(a.map((s) => [s.index, s.kind, s.nodes])).toEqual(b.map((s) => [s.index, s.kind, s.nodes]))
    }
  })
})

describe('FR-ENG-09: step counts', () => {
  it('at most height + 1 in an AVL tree of 1..15, for keys 0 to 16', () => {
    let tree: Tree = null
    for (let k = 1; k <= 15; k++) tree = avlInsert(tree, k).tree
    for (let k = 0; k <= 16; k++) {
      for (const form of forms) {
        expect(searchTrace(tree, k, form).steps).toBeLessThanOrEqual(height(tree) + 1)
      }
    }
    expect(height(tree)).toBe(3)
  })
  it('key 15 in the plain chain 1..15 takes 15 steps', () => {
    const chain = Array.from({ length: 15 }, (_, i) => i + 1).reduce<Tree>((t, k) => insert(t, k).tree, null)
    expect(searchTrace(chain, 15, 'loop').steps).toBe(15)
  })
  it('property: found agrees with plain search and steps equal the nodes on the path', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.integer({ min: 0, max: 60 }), { maxLength: 25 }),
        fc.integer({ min: -2, max: 62 }),
        (keys, target) => {
          const tree = keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
          let pathLength = 0
          for (let n = tree; n !== null; n = target < n.key ? n.left : n.right) {
            pathLength++
            if (n.key === target) break
          }
          for (const form of forms) {
            const r = searchTrace(tree, target, form)
            expect(r.found).toBe(search(tree, target).found)
            expect(r.steps).toBe(pathLength)
            expect(r.trace.filter((s) => s.kind === 'compare')).toHaveLength(pathLength)
          }
        },
      ),
    )
  })
})

