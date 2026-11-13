import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { analyseTree } from '../../src/engine/analyse'
import { avlInsert } from '../../src/engine/avl'
import { searchTrace } from '../../src/engine/search'
import type { Key, Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { computeFacts } from '../../src/modules/facts'
import { renderStep } from '../../src/modules/render'
import { stepsFor } from '../../src/modules/schema'
import { validateModule } from '../../src/modules/validate'
import { SEARCH_PRACTICE_KEYS } from '../../src/modules/config'
import { drawSearchPractice, markPick, searchPath } from '../../src/modules/searchPractice'
import { pseudocode } from '../../src/content/pseudocode'
import { practiceModuleCopy as copy } from '../../src/content/modules/practice'

// Spec: add-module-c4-search / module-c4-search. Learning outcomes LO4, LO5; D10, D13, D21, D27.

const c4 = MODULE_CONTENT.C4!
const byId = (id: string) => {
  const s = c4.steps.find((x) => x.id === id)
  if (!s) throw new Error(`no step ${id}`)
  return s
}
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

describe('D10 FR-LRN-01 C4 follows the Gagné order', () => {
  it('the validator reports no problem for C4', () => {
    expect(validateModule(c4)).toEqual([])
  })

  it('activities: none empty; worked example and two practices; check placeholder and summary', () => {
    const explore = stepsFor(c4, 'explore')
    const example = stepsFor(c4, 'example')
    const check = stepsFor(c4, 'check')
    expect(explore.length).toBeGreaterThan(0)
    expect(example.map((s) => s.event)).toEqual(['example', 'example', 'practice', 'practice'])
    expect(check.map((s) => s.event)).toEqual(['check', 'summary'])
    expect(explore.map((s) => s.event).slice(0, 3)).toEqual(['hook', 'goals', 'recall'])
  })
})

describe('LO4 C4 shows search is BST search', () => {
  it('the algorithm step plays a search on an AVL figure and says balance factors are not used', () => {
    const step = byId('c4-algorithm')
    expect(step.replay).toBeDefined()
    const fig = step.figures!.find((f) => f.id === step.replay!.figure)!
    expect(fig.source.kind).toBe('avl')
    expect(fig.searchKey).toBeDefined()
    expect(step.primary).toBe('animation')
    expect(renderStep(step).paragraphs.join(' ')).toMatch(/(does not|doesn't) use balance factors/i)
  })
})

describe('AL-Strategies 3 loop and recursive side by side', () => {
  it('names the loop listing, then the recursive one, every line from the ID', () => {
    const step = byId('c4-versions')
    expect(step.listings).toEqual(['searchLoop', 'searchRecursive'])
    expect(step.primary).toBe('pseudocode')
    expect(pseudocode.searchLoop).toHaveLength(7)
    expect(pseudocode.searchRecursive).toHaveLength(5)
  })
})

describe('LO5 D13 C4 states the step bound from the engine', () => {
  it('the million-key text contains 28 and 1,000,000, both from the bounds', () => {
    const step = byId('c4-bound')
    const r = renderStep(step)
    const b = r.facts.bounds.find((x) => x.n === 1_000_000)!
    expect(b.avlWorst).toBe(28)
    expect(b.worst).toBe(1_000_000)
    const text = r.paragraphs.join(' ')
    expect(text).toContain('28')
    expect(text).toContain('1,000,000')
  })

  it('the bound figure searches in at most height + 1 steps', () => {
    const facts = computeFacts(byId('c4-bound'))
    const figs = Object.values(facts.figures).filter((f) => f.searchSteps !== undefined)
    expect(figs.length).toBeGreaterThan(0)
    for (const f of figs) expect(f.searchSteps!).toBeLessThanOrEqual(f.height + 1)
  })
})

describe('LO4 worked example covers found and not found', () => {
  it('one example key is in its tree and one is not, each played as a replay', () => {
    const outcomes = ['c4-example-found', 'c4-example-missing'].map((id) => {
      const step = byId(id)
      expect(step.event).toBe('example')
      expect(step.replay).toBeDefined()
      const f = computeFacts(step).figures[step.replay!.figure]
      const trace = searchTrace(f.tree, f.searchKey!)
      expect(trace.trace[trace.trace.length - 1].kind).toBe(trace.found ? 'found' : 'not-found')
      return trace.found
    })
    expect(outcomes).toEqual([true, false])
  })
})

describe('LO4 be the algorithm: seeded trees and marking', () => {
  it('the two practice steps draw a found and a missing key', () => {
    expect(byId('c4-practice-found')).toMatchObject({ event: 'practice', practice: 'trace-search', searchPractice: 'found' })
    expect(byId('c4-practice-missing')).toMatchObject({ event: 'practice', practice: 'trace-search', searchPractice: 'missing' })
  })

  it('seeds 0 to 199: valid AVL trees of 7 distinct keys from 1 to 99; found key in, missing key out', () => {
    expect(SEARCH_PRACTICE_KEYS).toBe(7)
    for (let seed = 0; seed < 200; seed++) {
      for (const which of ['found', 'missing'] as const) {
        const { tree, key } = drawSearchPractice(seed, which)
        const keys = keysOf(tree)
        expect(analyseTree(tree).isAvl, `seed ${seed}`).toBe(true)
        expect(new Set(keys).size).toBe(7)
        expect(keys.every((k) => k >= 1 && k <= 99)).toBe(true)
        expect(key >= 1 && key <= 99).toBe(true)
        expect(keys.includes(key), `seed ${seed} ${which}`).toBe(which === 'found')
      }
    }
  })

  const T = avl([50, 30, 70, 20, 40, 60, 80])

  it('searchPath follows the engine: nodes compared, in order', () => {
    expect(searchPath(T, 40)).toEqual({ path: [50, 30, 40], found: true })
    expect(searchPath(T, 45)).toEqual({ path: [50, 30, 40], found: false })
    const t = searchTrace(T, 45)
    expect(searchPath(T, 45).path).toEqual(t.trace.filter((s) => s.kind === 'compare').map((s) => s.nodes[0]))
  })

  it('the root is the first pick; anything else is not yet, with the move named', () => {
    expect(markPick(T, 40, [], 50)).toMatchObject({ kind: 'right' })
    expect(markPick(T, 40, [], 30)).toMatchObject({ kind: 'not-yet', move: { kind: 'start' } })
  })

  it('a wrong pick names whether the key is smaller or larger than the current node', () => {
    expect(markPick(T, 40, [50], 70)).toMatchObject({ kind: 'not-yet', move: { kind: 'go', at: 50, smaller: true } })
    expect(markPick(T, 60, [50], 30)).toMatchObject({ kind: 'not-yet', move: { kind: 'go', at: 50, smaller: false } })
    expect(markPick(T, 40, [50], 30)).toMatchObject({ kind: 'right' })
  })

  it('"not in the tree" is right only once the path has run off the tree', () => {
    expect(markPick(T, 45, [50, 30], 'not-in-tree')).toMatchObject({ kind: 'not-yet' })
    expect(markPick(T, 45, [50, 30, 40], 'not-in-tree')).toMatchObject({ kind: 'right', move: { kind: 'off', at: 40 } })
    expect(markPick(T, 40, [50, 30, 40], 'not-in-tree')).toMatchObject({ kind: 'not-yet', move: { kind: 'found', at: 40 } })
  })
})

describe('D21 D27 be the algorithm wording', () => {
  it('two hints: a nudge, then the direction from the engine', () => {
    expect(copy.search.hints).toHaveLength(2)
    const move = { kind: 'go', at: 50, smaller: true } as const
    expect(copy.search.hints[1](40, move)).toMatch(/smaller/)
    expect(copy.search.hints[1](40, move)).toContain('50')
  })

  it('wrong-pick feedback names smaller or larger', () => {
    expect(copy.search.why({ kind: 'not-yet', picked: 70, move: { kind: 'go', at: 50, smaller: true } }, 40)).toMatch(/smaller/)
    expect(copy.search.why({ kind: 'not-yet', picked: 30, move: { kind: 'go', at: 50, smaller: false } }, 60)).toMatch(/larger/)
  })

  it('no wrong, fail or cross glyph in the C4 content or practice wording', () => {
    for (const f of ['src/content/modules/c4.ts', 'src/content/modules/practice.ts']) {
      expect(strip(readFileSync(f, 'utf8')), f).not.toMatch(/\b(wrong|fail\w*)\b|✗|❌/i)
    }
  })
})
