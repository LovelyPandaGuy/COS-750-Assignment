import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { avlInsert, avlInsertTrace } from '../../src/engine/avl'
import { searchTrace, type SearchForm } from '../../src/engine/search'
import { replay } from '../../src/engine/trace'
import { balanceFactorOf, makeNode, subtreeAt, type Key, type Tree } from '../../src/engine/tree'
import {
  explainAt,
  initReplay,
  replayReducer,
  rolesAt,
  traceFor,
  treeAt,
  visitedAt,
  type Operation,
  type ReplayAction,
  type ReplayState,
} from '../../src/replay/replay'

// Spec: add-replay-and-pseudocode / step-replay. Requirement IDs: FR-VIS-03, FR-VIS-02, FR-VIS-07, FR-VIS-11, FR-ENG-06, FR-ENG-09.

const leaf = (k: Key) => makeNode(k, null, null)
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const keysArb = fc.uniqueArray(fc.integer({ min: 0, max: 100 }), { maxLength: 15 })
const keyArb = fc.integer({ min: -2, max: 102 })
const formArb = fc.constantFrom<SearchForm>('loop', 'recursive')

const CHAIN = makeNode(30, leaf(20), null) // insert 10: LL, 9 steps
const BAL = makeNode(20, leaf(10), leaf(30))

const run = (state: ReplayState, ...actions: ReplayAction[]) => actions.reduce(replayReducer, state)

describe('FR-VIS-03 replay positions come from the trace', () => {
  const op: Operation = { kind: 'insert', tree: CHAIN, key: 10 }
  const { trace } = traceFor(op, 'loop')

  it('the LL example has the nine steps in order', () => {
    expect(trace.map((s) => [s.kind, s.nodes])).toEqual([
      ['compare', [30]],
      ['descend', [30, 20]],
      ['compare', [20]],
      ['descend', [20]],
      ['insert', [10]],
      ['update-height', [20]],
      ['update-height', [30]],
      ['imbalance', [30, 20]],
      ['rotation', [30, 20]],
    ])
  })

  it('position 0 is the start tree, 5 the left chain, 9 the balanced result', () => {
    expect(treeAt(CHAIN, trace, 0)).toBe(CHAIN)
    const p5 = treeAt(CHAIN, trace, 5)!
    expect([p5.key, p5.left?.key, p5.left?.left?.key, p5.right]).toEqual([30, 20, 10, null])
    const p9 = treeAt(CHAIN, trace, 9)!
    expect([p9.key, p9.left?.key, p9.right?.key]).toEqual([20, 10, 30])
  })

  it('opens at position 0, paused, at 1x', () => {
    expect(initReplay(9)).toMatchObject({ position: 0, length: 9, playing: false, speed: 1, held: false })
  })

  it('property: every position equals replay of the prefix, and n equals the result', () => {
    fc.assert(
      fc.property(keysArb, keyArb, (keys, key) => {
        const T = avl(keys)
        const r = avlInsertTrace(T, key)
        const { trace: t } = traceFor({ kind: 'insert', tree: T, key }, 'loop')
        expect(t).toEqual(r.trace)
        for (let p = 1; p <= t.length; p++) expect(treeAt(T, t, p)).toEqual(replay(T, t.slice(0, p)))
        expect(treeAt(T, t, t.length)).toEqual(r.tree)
      }),
    )
  })
})

describe('FR-VIS-03 step forward and step back', () => {
  it('property: Back restores exactly the tree shown before the last Step', () => {
    fc.assert(
      fc.property(keysArb, keyArb, fc.nat(), (keys, key, pick) => {
        const T = avl(keys)
        const { trace } = traceFor({ kind: 'insert', tree: T, key }, 'loop')
        const p = 1 + (pick % trace.length)
        const before = run(initReplay(trace.length), { type: 'jumpTo', stepIndex: p - 2 })
        expect(before.position).toBe(p - 1)
        const stepped = run(before, { type: 'step' })
        const back = run(stepped, { type: 'back' })
        expect(stepped.position).toBe(p)
        expect(treeAt(T, trace, back.position)).toEqual(treeAt(T, trace, p - 1))
      }),
    )
  })

  it('bounds: Back does nothing at 0 and Step does nothing at n', () => {
    expect(run(initReplay(9), { type: 'back' }).position).toBe(0)
    const end = run(initReplay(9), { type: 'jumpTo', stepIndex: 8 })
    expect(end.position).toBe(9)
    expect(run(end, { type: 'step' }).position).toBe(9)
  })

  it('stepping either way pauses playback', () => {
    const playing = run(initReplay(9), { type: 'play' }, { type: 'tick' })
    expect(playing.playing).toBe(true)
    expect(run(playing, { type: 'step' }).playing).toBe(false)
    expect(run(playing, { type: 'back' }).playing).toBe(false)
  })
})

describe('FR-VIS-03 play, pause and speed (state)', () => {
  it('ticks advance and playback stops at n', () => {
    let s = run(initReplay(3), { type: 'play' })
    s = run(s, { type: 'tick' }, { type: 'tick' })
    expect(s).toMatchObject({ position: 2, playing: true })
    s = run(s, { type: 'tick' })
    expect(s).toMatchObject({ position: 3, playing: false })
  })

  it('pause keeps the position and a tick while paused does nothing', () => {
    const s = run(initReplay(9), { type: 'play' }, { type: 'tick' }, { type: 'tick' }, { type: 'tick' }, { type: 'pause' })
    expect(s).toMatchObject({ position: 3, playing: false })
    expect(run(s, { type: 'tick' }).position).toBe(3)
  })

  it('toggle flips between playing and paused', () => {
    const s = run(initReplay(9), { type: 'toggle' })
    expect(s.playing).toBe(true)
    expect(run(s, { type: 'toggle' }).playing).toBe(false)
  })

  it('Play at the end returns to 0 and plays', () => {
    const end = run(initReplay(9), { type: 'jumpTo', stepIndex: 8 })
    expect(run(end, { type: 'play' })).toMatchObject({ position: 0, playing: true })
  })

  it('speeds run 0.5, 1, 2 and stop at each end', () => {
    const s = initReplay(9)
    expect(run(s, { type: 'faster' }).speed).toBe(2)
    expect(run(s, { type: 'faster' }, { type: 'faster' }).speed).toBe(2)
    expect(run(s, { type: 'slower' }).speed).toBe(0.5)
    expect(run(s, { type: 'slower' }, { type: 'slower' }).speed).toBe(0.5)
    expect(run(s, { type: 'setSpeed', speed: 2 }).speed).toBe(2)
  })
})

describe('FR-VIS-05 replay waits for a prediction and can jump to a step', () => {
  it('held: position 0, and step, play and tick do nothing', () => {
    const s = run(initReplay(9), { type: 'step' }, { type: 'hold', held: true })
    expect(s).toMatchObject({ position: 0, held: true, playing: false })
    expect(run(s, { type: 'step' }, { type: 'play' }, { type: 'toggle' }, { type: 'tick' })).toMatchObject({ position: 0, playing: false })
    expect(run(s, { type: 'hold', held: false }, { type: 'step' }).position).toBe(1)
  })

  it('jumpTo a trace index shows the position after that step, paused', () => {
    const s = run(initReplay(9), { type: 'play' }, { type: 'jumpTo', stepIndex: 7 })
    expect(s).toMatchObject({ position: 8, playing: false })
  })

  it('reset returns to 0, paused, with the new length', () => {
    const s = run(initReplay(9), { type: 'step' }, { type: 'play' }, { type: 'reset', length: 4 })
    expect(s).toMatchObject({ position: 0, playing: false, length: 4 })
  })
})

describe('FR-VIS-02 roles during the replay', () => {
  const { trace } = traceFor({ kind: 'insert', tree: CHAIN, key: 10 }, 'loop')

  it('no roles before the insert step', () => {
    for (const p of [0, 1, 4]) expect(rolesAt(trace, p)).toEqual({})
  })

  it('new from the insert step on', () => {
    expect(rolesAt(trace, 5)).toEqual({ 10: 'new' })
    expect(rolesAt(trace, 7)).toEqual({ 10: 'new' })
  })

  it('z and y on the imbalance and rotation steps', () => {
    expect(rolesAt(trace, 8)).toEqual({ 10: 'new', 30: 'z', 20: 'y' })
    expect(rolesAt(trace, 9)).toEqual({ 10: 'new', 30: 'z', 20: 'y' })
  })
})

describe('FR-VIS-11 search replays with a step count', () => {
  it('found: 4 steps, count 2', () => {
    const r = traceFor({ kind: 'search', tree: BAL, key: 30 }, 'loop')
    expect(r.trace).toHaveLength(4)
    expect(visitedAt(r.trace, 4)).toBe(2)
    expect(explainAt({ kind: 'search', tree: BAL, key: 30 }, r.trace, 4).tag).toBe('found')
  })

  it('not found: 5 steps, count 2', () => {
    const r = traceFor({ kind: 'search', tree: BAL, key: 25 }, 'loop')
    expect(r.trace).toHaveLength(5)
    expect(visitedAt(r.trace, 5)).toBe(2)
    expect(explainAt({ kind: 'search', tree: BAL, key: 25 }, r.trace, 5).tag).toBe('not-found')
  })

  it('count grows with the compare steps', () => {
    const r = traceFor({ kind: 'search', tree: BAL, key: 30 }, 'loop')
    expect([0, 1, 2, 3, 4].map((p) => visitedAt(r.trace, p))).toEqual([0, 1, 1, 2, 2])
  })

  it('property: count at n equals the engine step count', () => {
    fc.assert(
      fc.property(keysArb, keyArb, formArb, (keys, key, form) => {
        const T = avl(keys)
        const r = traceFor({ kind: 'search', tree: T, key }, form)
        expect(visitedAt(r.trace, r.trace.length)).toBe(searchTrace(T, key, form).steps)
        expect(r.steps).toBe(searchTrace(T, key, form).steps)
      }),
    )
  })
})

describe('FR-VIS-07 a sentence for each step (data)', () => {
  it('position 0 is the start', () => {
    const op: Operation = { kind: 'insert', tree: CHAIN, key: 10 }
    expect(explainAt(op, traceFor(op, 'loop').trace, 0)).toMatchObject({ tag: 'start' })
  })

  it('the imbalance step names z, its bf, y and the case', () => {
    const op: Operation = { kind: 'insert', tree: CHAIN, key: 10 }
    const e = explainAt(op, traceFor(op, 'loop').trace, 8)
    expect(e).toMatchObject({ tag: 'imbalance', key: 30, other: 20, balanceFactor: 2, rebalanceCase: 'LL' })
  })

  it('the rotation step names the case and direction', () => {
    const op: Operation = { kind: 'insert', tree: CHAIN, key: 10 }
    const e = explainAt(op, traceFor(op, 'loop').trace, 9)
    expect(e).toMatchObject({ tag: 'rotation', key: 30, other: 20, direction: 'right', rebalanceCase: 'LL' })
  })

  it('descend with no child and duplicate inserts have their own tags', () => {
    const op: Operation = { kind: 'insert', tree: CHAIN, key: 10 }
    const t = traceFor(op, 'loop').trace
    expect(explainAt(op, t, 4)).toMatchObject({ tag: 'descend-none', key: 20, direction: 'left' })
    expect(explainAt(op, t, 2)).toMatchObject({ tag: 'descend', key: 30, other: 20, direction: 'left' })
    const dup: Operation = { kind: 'insert', tree: BAL, key: 30 }
    const d = traceFor(dup, 'loop').trace
    expect(explainAt(dup, d, d.length).tag).toBe('duplicate')
  })

  it('property: every position has a tag, and every number is read from the after snapshot', () => {
    const check = (op: Operation, form: SearchForm) => {
      const { trace } = traceFor(op, form)
      for (let p = 0; p <= trace.length; p++) {
        const e = explainAt(op, trace, p)
        expect(typeof e.tag).toBe('string')
        if (p === 0) continue
        const after = trace[p - 1].after
        if (e.balanceFactor !== undefined) expect(e.balanceFactor).toBe(balanceFactorOf(subtreeAt(after, e.key!)))
        if (e.height !== undefined) expect(e.height).toBe(subtreeAt(after, e.key!)!.height)
      }
    }
    fc.assert(
      fc.property(keysArb, keyArb, formArb, (keys, key, form) => {
        const T = avl(keys)
        check({ kind: 'insert', tree: T, key }, 'loop')
        check({ kind: 'search', tree: T, key }, form)
      }),
    )
  })
})
