import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import fc from 'fast-check'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { avlInsert } from '../../src/engine/avl'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { traceFor, treeAt, type Operation } from '../../src/replay/replay'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'
import { layoutTree } from '../../src/ui/tree/layout'
import { TREE_TRANSITION_MS } from '../../src/ui/tree/motion'

// Spec: revamp-tree-controls / ui-tree-controls "Stable steps in the replay": "Keys keep their x",
// "Rotation moves nodes vertically only", "Steps snap under reduced motion", "Back restores the previous tree".
// FR-VIS-01, FR-VIS-03, NFR-03 ([OPEN] confirm the ID), D103, quality bar 9.
// Harness as tests/ui/tree-motion.test.tsx: fake timers including requestAnimationFrame, and a matchMedia stub.

const T = TREE_TRANSITION_MS
const FRAME = 16
const SETTLE = T + 4 * FRAME

let reduced = true
beforeEach(() => {
  reduced = true
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date', 'performance', 'requestAnimationFrame', 'cancelAnimationFrame'] })
  vi.stubGlobal('matchMedia', (query: string) => ({
    get matches() {
      return query.includes('prefers-reduced-motion') && reduced
    },
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const leaf = (k: Key) => makeNode(k, null, null)
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const inOrder = (t: Tree): Key[] => (t === null ? [] : [...inOrder(t.left), t.key, ...inOrder(t.right)])
const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms))
const step = () => fireEvent.click(screen.getByRole('button', { name: 'Step' }))
const back = () => fireEvent.click(screen.getByRole('button', { name: 'Back' }))

/** Drawn positions of every node, from each node's transform="translate(x y)". */
function drawn(): Map<Key, { x: number; y: number }> {
  const out = new Map<Key, { x: number; y: number }>()
  for (const g of document.querySelectorAll('.tree-view [data-key]')) {
    const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(g.getAttribute('transform') ?? '')
    if (m) out.set(Number(g.getAttribute('data-key')), { x: Number(m[1]), y: Number(m[2]) })
  }
  return out
}
/** Drawn keys with their h · bf annotations. */
const annotations = () => [...document.querySelectorAll('.tree-view [data-key]')].map((g) => `${g.getAttribute('data-key')}:${g.querySelector('.tree-metrics')?.textContent}`).sort()

const CHAIN = makeNode(30, leaf(20), null)
const INSERT: Operation = { kind: 'insert', tree: CHAIN, key: 10 }

describe('FR-VIS-01 D103 keys keep their x at every replay position', () => {
  it('property: over insert traces of up to 15 keys, each key x is the same wherever it is drawn', () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { maxLength: 14 }), fc.integer({ min: 1, max: 99 }), (keys, key) => {
        cleanup() // a failed run (or a shrink) leaves its render behind
        const op: Operation = { kind: 'insert', tree: avl(keys), key }
        const { trace } = traceFor(op, 'loop')
        render(<ReplayPlayer operation={op} label="Tree" />)
        const xs = new Map<Key, number>()
        for (let p = 0; p <= trace.length; p++) {
          if (p > 0) step()
          advance(SETTLE)
          for (const [k, { x }] of drawn()) {
            if (!xs.has(k)) xs.set(k, x)
            expect(x, `key ${k} at position ${p}`).toBe(xs.get(k))
          }
        }
        cleanup()
      }),
      { numRuns: 20 },
    )
  }, 60_000)
})

describe('FR-VIS-01 NFR-03 a rotation step slides nodes vertically only', () => {
  it('insert 10 into 30, 20: from position 8 to the rotation at 9, no x changes, y slides then settles', () => {
    reduced = false
    const { trace } = traceFor(INSERT, 'loop')
    const r = trace.length // the rotation is the last step of this trace
    expect(trace[r - 1].rebalanceCase).toBeDefined()
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    for (let p = 1; p < r; p++) {
      step()
      advance(SETTLE)
    }
    const before = drawn()
    step()
    advance(T / 2)
    const mid = drawn()
    advance(SETTLE)
    const after = drawn()
    const slots = inOrder(treeAt(CHAIN, trace, trace.length))
    const target = new Map(layoutTree(treeAt(CHAIN, trace, r), { slots }).nodes.map((n) => [n.key, n]))
    let movedY = 0
    for (const [k, b] of before) {
      expect(mid.get(k)!.x, `key ${k} mid`).toBe(b.x)
      expect(after.get(k)!.x, `key ${k} after`).toBe(b.x)
      expect(after.get(k)!.y).toBe(target.get(k)!.y)
      if (after.get(k)!.y !== b.y) {
        movedY++
        const [lo, hi] = [Math.min(b.y, after.get(k)!.y), Math.max(b.y, after.get(k)!.y)]
        expect(mid.get(k)!.y > lo && mid.get(k)!.y < hi, `key ${k} slides`).toBe(true)
      }
    }
    expect(movedY).toBeGreaterThan(0)
  })
})

describe('QB9 D103 steps snap under reduced motion', () => {
  it('every node is at its final place in the same frame as the Step', () => {
    reduced = true
    const { trace } = traceFor(INSERT, 'loop')
    const slots = inOrder(treeAt(CHAIN, trace, trace.length))
    render(<ReplayPlayer operation={INSERT} label="Tree" />)
    for (let p = 1; p <= trace.length; p++) {
      step()
      const want = layoutTree(treeAt(CHAIN, trace, p), { slots }).nodes
      const got = drawn()
      for (const n of want) expect(got.get(n.key), `key ${n.key} at ${p}`).toEqual({ x: n.x, y: n.y })
    }
  })

  it('the replay stylesheet declares no transition or animation', () => {
    const css = readFileSync('src/ui/replay/replay.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/(^|[;{\s])(transition|animation)[a-z-]*\s*:/)
  })
})

describe('FR-VIS-03 Back shows exactly the previous tree', () => {
  it('property: over insert traces, Back from p draws the keys, heights and balance factors of p − 1', () => {
    reduced = false
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { maxLength: 10 }), fc.integer({ min: 1, max: 99 }), fc.nat(), (keys, key, pick) => {
        const op: Operation = { kind: 'insert', tree: avl(keys), key }
        const { trace } = traceFor(op, 'loop')
        if (trace.length === 0) return
        const p = 1 + (pick % trace.length)
        cleanup() // a failed run (or a shrink) leaves its render behind
        render(<ReplayPlayer operation={op} label="Tree" />)
        for (let i = 1; i < p; i++) step()
        advance(SETTLE)
        const at = { notes: annotations(), pos: drawn() }
        step()
        advance(SETTLE)
        back()
        advance(SETTLE)
        expect(annotations()).toEqual(at.notes)
        expect(drawn()).toEqual(at.pos)
        cleanup()
      }),
      { numRuns: 20 },
    )
  }, 60_000)
})
