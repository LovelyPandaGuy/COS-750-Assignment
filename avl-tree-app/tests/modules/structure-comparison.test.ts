import { describe, it, expect } from 'vitest'
import {
  COST_CLASSES,
  NEED_IDS,
  STRUCTURE_IDS,
  answersOf,
  binarySearchProbes,
  reasonOf,
  type Scenario,
} from '../../src/modules/compare'
import { NEEDS, SCENARIOS, STRUCTURES, structureSummary } from '../../src/content/modules/structures'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { computeFacts } from '../../src/modules/facts'
import { pickScenario } from '../../src/modules/generators'
import type { ModuleContent, Step } from '../../src/modules/schema'
import { validateModule, validateScenarios } from '../../src/modules/validate'

// Spec: add-module-c8-choosing / structure-comparison.
// Requirement IDs: FR-LRN-02, FR-ASM-03 (in part), D21, D27. Outcomes: LO9, LO5.

const MARKS = ['ID', 'beyond ID']
const SOURCE_FIELDS = ['search', 'insert', 'inOrder', 'costs', 'meets'] as const
const scenarioList = (): Scenario[] => Object.values(SCENARIOS)

const step = (id: string, event: Step['event'], extra: Partial<Step> = {}): Step => ({
  id,
  event,
  heading: id,
  primary: 'text',
  text: () => [],
  ...extra,
})
const moduleWith = (content: Step): ModuleContent => ({
  id: 'C8',
  steps: [step('h', 'hook'), step('g', 'goals'), step('r', 'recall'), content, step('e', 'example'), step('k', 'check'), step('s', 'summary')],
})

describe('LO9 one record describes the four structures', () => {
  it('has exactly the four structures, every cost cell a cost class, every need answered', () => {
    expect(Object.keys(STRUCTURES).sort()).toEqual([...STRUCTURE_IDS].sort())
    expect(STRUCTURE_IDS).toHaveLength(4)
    for (const id of STRUCTURE_IDS) {
      const s = STRUCTURES[id]
      expect(s.name.length, id).toBeGreaterThan(0)
      for (const c of [s.search.typical, s.search.worst, s.insert.typical, s.insert.worst]) expect(COST_CLASSES, id).toContain(c)
      for (const n of NEED_IDS) expect(typeof s.meets[n], `${id} ${n}`).toBe('boolean')
      expect(typeof s.inOrder, id).toBe('boolean')
    }
  })

  it('ID rows are marked, and every other entry carries a source mark', () => {
    expect(STRUCTURES.avl.search.worst).toBe('O(log2 n)')
    expect(STRUCTURES.avl.insert.worst).toBe('O(log2 n)')
    expect(STRUCTURES.avl.source.search).toBe('ID')
    expect(STRUCTURES.avl.source.insert).toBe('ID')
    expect(STRUCTURES.bst.search.worst).toBe('O(n)')
    expect(STRUCTURES.bst.source.search).toBe('ID')
    for (const id of STRUCTURE_IDS) for (const f of SOURCE_FIELDS) expect(MARKS, `${id}.${f}`).toContain(STRUCTURES[id].source[f])
  })

  it('every need has a label and an unmet sentence that names the structure', () => {
    for (const n of NEED_IDS) {
      expect(NEEDS[n].label.length, n).toBeGreaterThan(0)
      expect(NEEDS[n].unmet('Thing X')).toContain('Thing X')
    }
  })
})

describe('LO9 the AVL trade-off is in the record (ID C8)', () => {
  it('AVL is O(log2 n) in the worst case and the plain BST O(n); only AVL has the two costs', () => {
    expect(STRUCTURES.avl.search.worst).toBe('O(log2 n)')
    expect(STRUCTURES.bst.search.worst).toBe('O(n)')
    const costs = STRUCTURES.avl.costs.join(' ')
    expect(costs).toMatch(/height in each node/i)
    expect(costs).toMatch(/rotation work/i)
    for (const id of STRUCTURE_IDS.filter((s) => s !== 'avl')) {
      expect(STRUCTURES[id].costs.join(' '), id).not.toMatch(/height in each node|rotation work/i)
    }
    expect(STRUCTURES.bst.costs).toEqual([])
  })

  it('the summary has one sentence per structure, each naming it', () => {
    const summary = structureSummary()
    expect(summary).toHaveLength(4)
    STRUCTURE_IDS.forEach((id) => expect(summary.some((s) => s.includes(STRUCTURES[id].name)), id).toBe(true))
  })
})

describe('LO5 sorted array search steps come from the model', () => {
  it('probes 40, 60, 70 for 70 in 10 to 70', () => {
    expect(binarySearchProbes([10, 20, 30, 40, 50, 60, 70], 70)).toEqual({ probes: [40, 60, 70], found: true })
  })

  it('a missing key is reported not found', () => {
    expect(binarySearchProbes([10, 20, 30], 25).found).toBe(false)
    expect(binarySearchProbes([], 5)).toEqual({ probes: [], found: false })
  })

  it('probe count is at most floor(log2 n) + 1 for every key of arrays of size 1 to 64', () => {
    for (let n = 1; n <= 64; n++) {
      const keys = Array.from({ length: n }, (_, i) => (i + 1) * 3)
      const bound = Math.floor(Math.log2(n)) + 1
      for (const k of keys) {
        const r = binarySearchProbes(keys, k)
        expect(r.found, `${k} in ${n}`).toBe(true)
        expect(r.probes.length, `${k} in ${n}`).toBeLessThanOrEqual(bound)
        expect(r.probes[r.probes.length - 1]).toBe(k)
      }
    }
  })

  it('array facts give the sorted keys, probes, count and found', () => {
    const s = step('a', 'content', { arrays: [{ id: 'arr', keys: [70, 10, 50, 30, 20, 60, 40], searchKey: 70, label: 'Array' }] })
    expect(computeFacts(s).arrays.arr).toEqual({
      id: 'arr',
      sorted: [10, 20, 30, 40, 50, 60, 70],
      searchKey: 70,
      probes: [40, 60, 70],
      probeCount: 3,
      found: true,
    })
  })

  it('a typed probe count that differs from the facts is a number problem', () => {
    const arrays = [{ id: 'arr', keys: [10, 20, 30, 40, 50, 60, 70], searchKey: 70, label: 'Array' }]
    const ok = step('a', 'content', { arrays, text: (f) => [`Binary search takes ${f.arrays.arr.probeCount} probes.`] })
    expect(validateModule(moduleWith(ok))).toEqual([])
    const typed = step('a', 'content', { arrays, text: () => ['Binary search takes 5 probes.'] })
    expect(validateModule(moduleWith(typed))).toContainEqual(expect.objectContaining({ kind: 'number', value: 5 }))
  })
})

describe('LO9 scenario answers are computed', () => {
  it('in order, typical log insert and no balancing: only the plain BST; the others have reasons', () => {
    const sc: Scenario = { id: 'fixture', text: 'A situation.', needs: ['in-order', 'insert-typical-log', 'no-balancing'] }
    expect(answersOf(sc)).toEqual(['bst'])
    for (const id of STRUCTURE_IDS.filter((s) => s !== 'bst')) {
      const need = reasonOf(sc, id)
      expect(need, id).not.toBeNull()
      expect(sc.needs).toContain(need)
      expect(STRUCTURES[id].meets[need!]).toBe(false)
    }
    expect(reasonOf(sc, 'bst')).toBeNull()
  })

  it('the reason is the first listed need the structure does not meet', () => {
    const sc: Scenario = { id: 'fixture', text: 'A situation.', needs: ['search-worst-log', 'in-order'] }
    expect(reasonOf(sc, 'hash-table')).toBe('search-worst-log')
  })

  it('every structure is the answer to at least one scenario in the record', () => {
    const answers = new Set(scenarioList().flatMap((s) => answersOf(s)))
    expect([...answers].sort()).toEqual([...STRUCTURE_IDS].sort())
  })

  it('the record has at least six scenarios', () => {
    expect(scenarioList().length).toBeGreaterThanOrEqual(6)
  })
})

describe('LO9 scenarios are validated', () => {
  it('record scenarios are valid', () => {
    expect(validateScenarios(scenarioList())).toEqual([])
  })

  it('two answers are rejected, naming both structures', () => {
    const p = validateScenarios([{ id: 'two', text: 'A situation.', needs: ['search-worst-log'] }])
    expect(p).toHaveLength(1)
    expect(p[0].kind).toBe('scenario')
    expect(p[0].message).toContain(STRUCTURES.avl.name)
    expect(p[0].message).toContain(STRUCTURES['sorted-array'].name)
  })

  it('no answer is rejected', () => {
    const p = validateScenarios([{ id: 'none', text: 'A situation.', needs: ['keys-only', 'lookup-typical-constant'] }])
    expect(p.map((x) => x.kind)).toEqual(['scenario'])
  })

  it('an unknown need is rejected', () => {
    const p = validateScenarios([{ id: 'odd', text: 'A situation.', needs: ['made-up' as never] }])
    expect(p.some((x) => x.kind === 'scenario')).toBe(true)
  })

  it('a scenario that names a structure or Red-Black trees is rejected', () => {
    for (const text of ['Use a hash table for this.', 'Like an AVL tree would.', 'A Red-Black tree fits.']) {
      const p = validateScenarios([{ id: 'named', text, needs: ['lookup-typical-constant'] }])
      expect(p.map((x) => x.kind), text).toEqual(['scenario'])
    }
  })

  it('validateModule reports a step that lists an unknown scenario', () => {
    const s = step('p', 'practice', { practice: 'scenario', scenarios: ['no-such-scenario'] })
    const m = moduleWith(step('c', 'content'))
    m.steps.splice(4, 0, s)
    expect(validateModule(m)).toContainEqual(expect.objectContaining({ kind: 'scenario', step: 'p' }))
  })
})

describe('D21 scenario practice is seeded', () => {
  const ids = Object.keys(SCENARIOS)
  const practiceStep = step('p', 'practice', { practice: 'scenario', scenarios: ids })

  it('the same seed gives the same scenario and order; some other seed differs', () => {
    const a = pickScenario(practiceStep, 7)
    expect(pickScenario(practiceStep, 7)).toEqual(a)
    expect(ids).toContain(a.scenario)
    expect([...a.order].sort()).toEqual([...STRUCTURE_IDS].sort())
    const differs = Array.from({ length: 50 }, (_, i) => pickScenario(practiceStep, i + 100)).some(
      (b) => b.scenario !== a.scenario || b.order.join() !== a.order.join(),
    )
    expect(differs).toBe(true)
  })

  it('avoiding the current scenario always gives a different one when there is more than one', () => {
    for (let seed = 0; seed < 100; seed++) {
      const first = pickScenario(practiceStep, seed)
      expect(pickScenario(practiceStep, seed + 1, first.scenario).scenario, String(seed)).not.toBe(first.scenario)
    }
  })

  it('scenario facts give needs, the answer and three structures ruled out', () => {
    const id = ids[0]
    const f = computeFacts(step('w', 'example', { scenario: id })).scenarios[id]
    expect(f.needs).toEqual(SCENARIOS[id].needs)
    expect(f.answer).toBe(answersOf(SCENARIOS[id])[0])
    expect(f.ruledOut).toHaveLength(3)
    for (const r of f.ruledOut) expect(STRUCTURES[r.structure].meets[r.need]).toBe(false)
  })
})

describe('D27 calm scenario feedback and hints', () => {
  it('no feedback or hint for any scenario and choice says wrong, incorrect, fail or ✗', () => {
    const copy = practiceModuleCopy.scenario
    const calm = /wrong|incorrect|fail|✗/i
    for (const sc of scenarioList()) {
      const answer = answersOf(sc)[0]
      const texts: string[] = [copy.why.right(answer, sc), copy.hints[0](sc), copy.hints[1](sc)]
      for (const s of STRUCTURE_IDS) if (s !== answer) texts.push(copy.why.notYet(s, sc))
      for (const t of texts) expect(t, sc.id).not.toMatch(calm)
    }
    for (const t of [copy.choose, copy.legend, copy.newScenario, copy.done]) expect(t).not.toMatch(calm)
  })

  it('Not quite yet names an unmet need; That is right names every need', () => {
    const copy = practiceModuleCopy.scenario
    for (const sc of scenarioList()) {
      const answer = answersOf(sc)[0]
      const right = copy.why.right(answer, sc)
      for (const n of sc.needs) expect(right, sc.id).toContain(NEEDS[n].label)
      for (const s of STRUCTURE_IDS.filter((x) => x !== answer)) {
        expect(copy.why.notYet(s, sc), `${sc.id} ${s}`).toContain(NEEDS[reasonOf(sc, s)!].unmet(STRUCTURES[s].name))
      }
    }
  })

  it('the nudge lists the needs and the fuller hint names each structure ruled out', () => {
    const copy = practiceModuleCopy.scenario
    for (const sc of scenarioList()) {
      const answer = answersOf(sc)[0]
      for (const n of sc.needs) expect(copy.hints[0](sc), sc.id).toContain(NEEDS[n].label)
      for (const s of STRUCTURE_IDS.filter((x) => x !== answer)) expect(copy.hints[1](sc), sc.id).toContain(STRUCTURES[s].name)
    }
  })
})
