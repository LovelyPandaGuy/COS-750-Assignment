import { describe, it, expect } from 'vitest'
import { STRUCTURE_IDS, answersOf } from '../../src/modules/compare'
import { NEEDS, SCENARIOS, STRUCTURES } from '../../src/content/modules/structures'
import { computeFacts } from '../../src/modules/facts'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { renderStep } from '../../src/modules/render'
import { SKIPPABLE_EVENTS, stepsFor, type Step } from '../../src/modules/schema'
import { validateModule } from '../../src/modules/validate'

// Spec: add-module-c8-choosing / module-c8-choosing.
// Requirement IDs: FR-LRN-01, FR-LRN-05, D10, D15, D19, D20, D27. Outcomes: LO9, LO5.

const c8 = () => {
  const m = MODULE_CONTENT.C8
  expect(m).toBeDefined()
  return m!
}
const byId = (id: string): Step => {
  const s = c8().steps.find((x) => x.id === id)
  expect(s, id).toBeDefined()
  return s!
}
const text = (id: string) => renderStep(byId(id)).paragraphs.join(' ')
const allText = (id: string) => {
  const r = renderStep(byId(id))
  return [r.heading, ...r.paragraphs, r.rule ?? '', ...r.labels].join(' ')
}

describe('LO9 C8 follows the module order', () => {
  it('is registered and valid', () => {
    expect(validateModule(c8())).toEqual([])
  })

  it('has the planned steps in each activity', () => {
    expect(stepsFor(c8(), 'explore').map((s) => s.id)).toEqual([
      'c8-hook',
      'c8-goals',
      'c8-recall',
      'c8-array',
      'c8-hash',
      'c8-tradeoff',
      'c8-compare',
      'c8-red-black',
    ])
    expect(stepsFor(c8(), 'example').map((s) => s.id)).toEqual(['c8-worked', 'c8-practice-1', 'c8-practice-2'])
    expect(stepsFor(c8(), 'check').map((s) => s.id)).toEqual(['c8-check', 'c8-summary'])
  })

  it('goals state LO9 and LO5', () => {
    expect(text('c8-goals')).toContain('pick a structure for a scenario')
    expect(text('c8-goals')).toContain('explain why AVL search is O(log2 n) but a plain BST can be O(n)')
  })

  it('every Explore step after recall is a content step, so skip lands in Worked example', () => {
    expect(stepsFor(c8(), 'explore').slice(3).every((s) => s.event === 'content')).toBe(true)
  })
})

describe('LO5 C8 opens with the same keys in two trees', () => {
  it('a plain BST and an AVL tree of the same keys, step counts from the facts', () => {
    const figs = byId('c8-hook').figures ?? []
    expect(figs.map((f) => f.source.kind)).toEqual(['bst', 'avl'])
    const [bst, avl] = figs.map((f) => computeFacts(byId('c8-hook')).figures[f.id])
    expect(avl.keys).toEqual(bst.keys)
    expect(bst.searchSteps).toBe(bst.keys.length)
    expect(avl.searchSteps!).toBeLessThan(bst.searchSteps!)
    expect(text('c8-hook')).toMatch(new RegExp(`\\b${bst.searchSteps}\\b`))
    expect(text('c8-hook')).toMatch(new RegExp(`\\b${avl.searchSteps}\\b`))
    expect(byId('c8-hook').claims).toEqual(
      expect.arrayContaining([
        { figure: figs[0].id, is: 'not-avl' },
        { figure: figs[1].id, is: 'avl' },
      ]),
    )
  })
})

describe('LO9 C8 shows a sorted array and binary search', () => {
  it("an array of the hook's keys, searched for the same key; probe count from the facts", () => {
    const hook = byId('c8-hook').figures![0]
    const hookKeys = hook.source.kind === 'bst' ? hook.source.keys : []
    const arrays = byId('c8-array').arrays ?? []
    expect(arrays).toHaveLength(1)
    expect([...arrays[0].keys]).toEqual([...hookKeys])
    expect(arrays[0].searchKey).toBe(hook.searchKey)
    const f = computeFacts(byId('c8-array')).arrays[arrays[0].id]
    expect(text('c8-array')).toMatch(new RegExp(`\\b${f.probeCount}\\b`))
    expect(text('c8-array')).toContain(STRUCTURES['sorted-array'].insert.worst)
  })
})

describe('LO9 C8 describes a hash table', () => {
  it('costs come from the record and the step draws nothing', () => {
    const h = STRUCTURES['hash-table']
    const t = text('c8-hash')
    for (const c of [h.search.typical, h.insert.typical, h.search.worst]) expect(t).toContain(c)
    expect(byId('c8-hash').figures ?? []).toEqual([])
    expect(byId('c8-hash').arrays ?? []).toEqual([])
  })
})

describe('LO5 C8 states the AVL trade-off', () => {
  it('shows an AVL figure and the rotation count the engine made', () => {
    const figs = byId('c8-tradeoff').figures ?? []
    expect(figs.map((f) => f.source.kind)).toEqual(['avl'])
    const f = computeFacts(byId('c8-tradeoff')).figures[figs[0].id]
    expect(f.rebalances.length).toBeGreaterThan(0)
    const t = text('c8-tradeoff')
    expect(t).toMatch(new RegExp(`\\b${f.rebalances.length}\\b`))
    expect(t).toMatch(/height/i)
    expect(t).toMatch(/rotation/i)
    expect(t).toContain('O(log2 n)')
  })
})

describe('LO9 C8 compares the four structures', () => {
  it('shows the table, and the rule names every structure', () => {
    expect(byId('c8-compare').table).toBe('structures')
    const rule = renderStep(byId('c8-compare')).rule
    expect(rule).not.toBeNull()
    for (const id of STRUCTURE_IDS) expect(rule!).toContain(STRUCTURES[id].name)
  })
})

describe('LO9 C8 mentions Red-Black trees', () => {
  it('exactly one step says Red-Black; no row and no option does', () => {
    const steps = c8().steps.filter((s) => /red-black/i.test(allText(s.id)))
    expect(steps.map((s) => s.id)).toEqual(['c8-red-black'])
    for (const id of STRUCTURE_IDS) expect(STRUCTURES[id].name).not.toMatch(/red-black/i)
    for (const sc of Object.values(SCENARIOS)) expect(sc.text).not.toMatch(/red-black/i)
  })
})

describe('LO9 C8 works one scenario through', () => {
  it('rules out three structures with a need each, and names the computed answer', () => {
    const s = byId('c8-worked')
    expect(s.event).toBe('example')
    expect(s.scenario).toBeDefined()
    const f = computeFacts(s).scenarios[s.scenario!]
    expect(f.ruledOut).toHaveLength(3)
    const t = text('c8-worked')
    expect(t).toContain(STRUCTURES[f.answer!].name)
    for (const r of f.ruledOut) {
      expect(t).toContain(STRUCTURES[r.structure].name)
      expect(t).toContain(NEEDS[r.need].label)
    }
  })
})

describe('LO9 C8 scenario practice', () => {
  it('two scenario practice steps whose scenarios cover all four structures', () => {
    const steps = ['c8-practice-1', 'c8-practice-2'].map(byId)
    for (const s of steps) expect(s).toMatchObject({ event: 'practice', practice: 'scenario' })
    const answers = new Set(steps.flatMap((s) => (s.scenarios ?? []).flatMap((id) => answersOf(SCENARIOS[id]))))
    expect([...answers].sort()).toEqual([...STRUCTURE_IDS].sort())
  })

  it('practice is never skippable (D20)', () => {
    expect(SKIPPABLE_EVENTS).not.toContain(byId('c8-practice-1').event)
  })
})

describe('LO9 C8 check placeholder and summary', () => {
  it('the check is the placeholder, then the summary restates the trade-off', () => {
    expect(byId('c8-check').event).toBe('check')
    const t = text('c8-summary')
    expect(t).toMatch(/height in each node/i)
    expect(t).toMatch(/rotation work/i)
    expect(t).toContain('O(log2 n)')
  })
})

describe('D27 D19 calm wording in C8', () => {
  it('no step says wrong, incorrect, fail or ✗', () => {
    for (const s of c8().steps) expect(allText(s.id), s.id).not.toMatch(/wrong|incorrect|fail|✗/i)
  })
})
