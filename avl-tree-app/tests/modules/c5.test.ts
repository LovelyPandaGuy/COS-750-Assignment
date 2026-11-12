import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { REBALANCE_CASES } from '../../src/engine/conventions'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { computeFacts } from '../../src/modules/facts'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { renderStep } from '../../src/modules/render'
import { stepsFor, type Step, type TreeSource } from '../../src/modules/schema'
import { validateModule } from '../../src/modules/validate'

// Spec: add-modules-c5-c6 / module-c5-rotations. Requirement IDs: FR-LRN-01, FR-LRN-05, FR-VIS-06, D10, D19, D27. Outcome: LO6.

const w = conventionsWording()
const c5 = () => {
  const m = MODULE_CONTENT.C5
  expect(m).toBeDefined()
  return m!
}
const byId = (id: string): Step => {
  const s = c5().steps.find((x) => x.id === id)
  expect(s, id).toBeDefined()
  return s!
}
const text = (id: string) => renderStep(byId(id)).paragraphs.join(' ')
const sources = (id: string): TreeSource[] => (byId(id).figures ?? []).map((f) => f.source)

describe('LO6 C5 follows the module order', () => {
  it('is registered and valid', () => {
    expect(validateModule(c5())).toEqual([])
  })

  it('has the planned steps in each activity', () => {
    expect(stepsFor(c5(), 'explore').map((s) => s.id)).toEqual(['c5-hook', 'c5-goals', 'c5-recall', 'c5-single', 'c5-double', 'c5-order'])
    expect(stepsFor(c5(), 'example').map((s) => s.id)).toEqual(['c5-cases', 'c5-practice-single', 'c5-practice-double'])
    expect(stepsFor(c5(), 'check').map((s) => s.id)).toEqual(['c5-check', 'c5-summary'])
  })

  it('goals state LO6', () => {
    expect(text('c5-goals')).toContain('do single and double rotations')
  })

  it('every Explore step after recall is a content step, so skip lands in Worked example', () => {
    expect(stepsFor(c5(), 'explore').slice(3).every((s) => s.event === 'content')).toBe(true)
  })
})

describe('LO6 C5 opens with a tree that breaks the rule', () => {
  it('hook draws 10, 20, 30 as a plain BST, claims not AVL, and states node 10 from the engine', () => {
    expect(sources('c5-hook')).toEqual([{ kind: 'bst', keys: [10, 20, 30] }])
    expect(byId('c5-hook').claims).toContainEqual(expect.objectContaining({ is: 'not-avl' }))
    const f = Object.values(computeFacts(byId('c5-hook')).figures)[0]
    expect(text('c5-hook')).toContain(w.num(f.nodes[10].balanceFactor))
  })
})

describe('LO6 C5 teaches single rotations', () => {
  it('left and right rotations, before and after, root 20, after figures AVL', () => {
    const s = sources('c5-single')
    expect(s).toContainEqual({ kind: 'bst', keys: [10, 20, 30] })
    expect(s).toContainEqual({ kind: 'rotated', keys: [10, 20, 30], rotations: [{ dir: 'left', at: 10 }] })
    expect(s).toContainEqual({ kind: 'bst', keys: [30, 20, 10] })
    expect(s).toContainEqual({ kind: 'rotated', keys: [30, 20, 10], rotations: [{ dir: 'right', at: 30 }] })
    const facts = computeFacts(byId('c5-single')).figures
    const rotated = Object.values(facts).filter((f) => f.keys.length === 3 && f.rootKey === 20)
    expect(rotated).toHaveLength(2)
    const claimed = (byId('c5-single').claims ?? []).filter((c) => c.is === 'avl').map((c) => facts[c.figure].rootKey)
    expect(claimed).toEqual([20, 20])
    expect(text('c5-single')).toMatch(/\b20\b/)
  })
})

describe('LO6 C5 teaches double rotations as two singles', () => {
  it('three figures from 30, 10, 20; roots 30 then 20; last claimed AVL', () => {
    const figs = byId('c5-double').figures ?? []
    expect(figs.map((f) => f.source)).toEqual([
      { kind: 'bst', keys: [30, 10, 20] },
      { kind: 'rotated', keys: [30, 10, 20], rotations: [{ dir: 'left', at: 10 }] },
      { kind: 'rotated', keys: [30, 10, 20], rotations: [{ dir: 'left', at: 10 }, { dir: 'right', at: 30 }] },
    ])
    const facts = computeFacts(byId('c5-double')).figures
    expect(facts[figs[1].id].rootKey).toBe(30)
    expect(facts[figs[2].id].rootKey).toBe(20)
    expect(byId('c5-double').claims).toContainEqual({ figure: figs[2].id, is: 'avl' })
    expect(text('c5-double')).toMatch(/two single rotations/i)
  })
})

describe('LO6 C5 shows that rotations keep the BST order', () => {
  it('claims bst and same-order, and lists the in-order keys', () => {
    const claims = byId('c5-order').claims ?? []
    expect(claims.some((c) => c.is === 'bst')).toBe(true)
    expect(claims.some((c) => c.is === 'same-order')).toBe(true)
    const f = Object.values(computeFacts(byId('c5-order')).figures)[0]
    expect(text('c5-order')).toContain(f.inOrder.join(', '))
  })
})

describe('LO6 C5 example: four orders, one result', () => {
  const orders = [
    [30, 20, 10],
    [10, 20, 30],
    [30, 10, 20],
    [10, 30, 20],
  ]

  it('four figures, four distinct cases, two single and two double', () => {
    expect(sources('c5-cases').map((s) => ('keys' in s ? s.keys : null))).toEqual(orders)
    const facts = Object.values(computeFacts(byId('c5-cases')).figures)
    expect(facts.every((f) => f.rebalances.length === 1)).toBe(true)
    expect(new Set(facts.map((f) => f.rebalances[0].case)).size).toBe(4)
    expect(facts.map((f) => f.rebalances[0].rotations).sort()).toEqual([1, 1, 2, 2])
  })

  it('same root every time, given from the facts', () => {
    const facts = Object.values(computeFacts(byId('c5-cases')).figures)
    expect(facts.map((f) => f.avlRootKey)).toEqual([20, 20, 20, 20])
    expect(text('c5-cases')).toMatch(/\b20\b/)
  })

  it('case names come from the conventions, none typed in c5.ts', () => {
    const t = text('c5-cases')
    for (const c of REBALANCE_CASES) expect(t).toContain(w.caseName(c))
    const source = readFileSync('src/content/modules/c5.ts', 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(source).not.toMatch(/\b(?:LL|RR|LR|RL)\b/)
  })
})

describe('LO6 C5 practice on seeded trees', () => {
  it('single then double rotation practice', () => {
    expect(byId('c5-practice-single')).toMatchObject({ event: 'practice', practice: 'rotate' })
    expect(byId('c5-practice-double')).toMatchObject({ event: 'practice', practice: 'rotate' })
    expect(sources('c5-practice-single')).toEqual([{ kind: 'practice', generator: 'single-rotation' }])
    expect(sources('c5-practice-double')).toEqual([{ kind: 'practice', generator: 'double-rotation' }])
  })
})

describe('D27 calm wording in C5', () => {
  it('no step says wrong, incorrect, fail or ✗', () => {
    for (const s of c5().steps) {
      const r = renderStep(s)
      for (const t of [r.heading, ...r.paragraphs, r.rule ?? '', ...r.labels]) expect(t, s.id).not.toMatch(/wrong|incorrect|fail|✗/i)
    }
  })
})
