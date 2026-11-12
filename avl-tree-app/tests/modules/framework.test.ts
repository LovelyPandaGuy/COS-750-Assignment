import { describe, it, expect } from 'vitest'
import type { ModuleContent, Step } from '../../src/modules/schema'
import { EVENT_ACTIVITY, stepsFor } from '../../src/modules/schema'
import { computeFacts, searchBounds } from '../../src/modules/facts'
import { validateModule } from '../../src/modules/validate'
import { MODULE_CONTENT } from '../../src/modules/registry'

// Spec: add-modules-c2-c3 / module-framework. Requirement IDs: FR-LRN-01, FR-LRN-05, FR-ENG-03, D10, D19.

const step = (id: string, event: Step['event'], extra: Partial<Step> = {}): Step => ({
  id,
  event,
  heading: id,
  primary: 'text',
  text: () => [],
  ...extra,
})

const valid = (): ModuleContent => ({
  id: 'C2',
  steps: [
    step('h', 'hook'),
    step('g', 'goals'),
    step('r', 'recall'),
    step('c', 'content'),
    step('e', 'example'),
    step('k', 'check'),
    step('s', 'summary'),
  ],
})

const kinds = (m: ModuleContent) => validateModule(m).map((p) => p.kind)

describe('D10 steps follow the Gagné order', () => {
  it('C2 and C3 have no order problem', () => {
    for (const id of ['C2', 'C3'] as const) {
      const m = MODULE_CONTENT[id]
      expect(m, id).toBeDefined()
      expect(validateModule(m!).filter((p) => p.kind === 'order'), id).toEqual([])
    }
  })

  it('a valid fixture has no problems at all', () => {
    expect(validateModule(valid())).toEqual([])
  })

  it('summary before check names the summary step', () => {
    const m = valid()
    m.steps = [...m.steps.slice(0, 5), step('s', 'summary'), step('k', 'check')]
    const problems = validateModule(m).filter((p) => p.kind === 'order')
    expect(problems.length).toBeGreaterThan(0)
    expect(problems[0].step).toBe('s')
  })

  it('a missing hook is reported', () => {
    const m = valid()
    m.steps = m.steps.filter((s) => s.event !== 'hook')
    const problems = validateModule(m).filter((p) => p.kind === 'order')
    expect(problems.some((p) => /hook/i.test(p.message))).toBe(true)
  })
})

describe('FR-LRN-05 steps belong to activities', () => {
  it('event to activity table', () => {
    expect(EVENT_ACTIVITY).toEqual({
      hook: 'explore',
      goals: 'explore',
      recall: 'explore',
      content: 'explore',
      example: 'example',
      practice: 'example',
      check: 'check',
      summary: 'check',
    })
  })

  it('C2 steps grouped by activity, in module order, none empty', () => {
    const m = MODULE_CONTENT.C2!
    for (const activity of ['explore', 'example', 'check'] as const) {
      const list = stepsFor(m, activity)
      expect(list.length, activity).toBeGreaterThan(0)
      for (const s of list) expect(EVENT_ACTIVITY[s.event]).toBe(activity)
      const positions = list.map((s) => m.steps.indexOf(s))
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
    }
  })

  it('practice placed among Explore steps is an activity problem naming it', () => {
    const m = valid()
    m.steps = [
      step('h', 'hook'),
      step('g', 'goals'),
      step('r', 'recall'),
      step('p', 'practice'),
      step('c', 'content'),
      step('e', 'example'),
      step('k', 'check'),
      step('s', 'summary'),
    ]
    const problems = validateModule(m).filter((p) => p.kind === 'activity')
    expect(problems.map((p) => p.step)).toContain('p')
  })
})

describe('FR-ENG-03 facts come from the engine', () => {
  it('chain facts', () => {
    const f = computeFacts(step('x', 'content', { figures: [{ id: 'chain', source: { kind: 'bst', keys: [10, 20, 30, 40, 50] }, searchKey: 50, label: 'chain' }] }))
    const chain = f.figures.chain
    expect(chain.height).toBe(4)
    expect(chain.nodeCount).toBe(5)
    expect(chain.searchSteps).toBe(5)
  })

  it('AVL facts', () => {
    const f = computeFacts(step('x', 'content', { figures: [{ id: 'avl', source: { kind: 'avl', keys: [10, 20, 30, 40, 50] }, label: 'avl' }] }))
    expect(f.figures.avl.rootKey).toBe(20)
    expect(f.figures.avl.height).toBe(2)
    expect(f.figures.avl.isAvl).toBe(true)
  })

  it('bounds for a size', () => {
    expect(searchBounds(5)).toEqual({ n: 5, best: 3, worst: 5 })
    expect(searchBounds(1_000_000)).toEqual({ n: 1_000_000, best: 20, worst: 1_000_000 })
    const f = computeFacts(step('x', 'content', { bounds: [5, 1_000_000] }))
    expect(f.bounds.map((b) => b.best)).toEqual([3, 20])
  })
})

describe('claims are checked against the engine', () => {
  const withClaims = (s: Step): ModuleContent => {
    const m = valid()
    m.steps[3] = s
    return m
  }

  it('a true claim passes', () => {
    const s = step('c', 'content', {
      figures: [{ id: 't', source: { kind: 'avl', keys: [20, 10, 30, 5] }, label: 't' }],
      claims: [{ figure: 't', is: 'avl' }, { figure: 't', is: 'not-perfect' }],
    })
    expect(kinds(withClaims(s))).not.toContain('claim')
  })

  it('a false claim is reported with the step and the claim', () => {
    const s = step('c', 'content', {
      figures: [{ id: 't', source: { kind: 'bst', keys: [10, 20, 30] }, label: 't' }],
      claims: [{ figure: 't', is: 'avl' }],
    })
    const problems = validateModule(withClaims(s)).filter((p) => p.kind === 'claim')
    expect(problems).toHaveLength(1)
    expect(problems[0].step).toBe('c')
    expect(problems[0].message).toMatch(/avl/i)
  })
})

describe('guardrail: no typed numbers in step text', () => {
  const chainStep = (text: Step['text']) =>
    step('c', 'content', {
      figures: [{ id: 'chain', source: { kind: 'bst', keys: [10, 20, 30, 40, 50] }, searchKey: 50, label: 'Plain BST from 10, 20, 30, 40, 50' }],
      text,
    })
  const withStep = (s: Step) => {
    const m = valid()
    m.steps[3] = s
    return m
  }

  it('engine numbers are accepted', () => {
    const s = chainStep((f) => [`Finding 50 takes ${f.figures.chain.searchSteps} steps, in log2 n terms too.`])
    expect(kinds(withStep(s))).not.toContain('number')
  })

  it('a typed answer is rejected', () => {
    const s = chainStep(() => ['The chain has height 7.'])
    const problems = validateModule(withStep(s)).filter((p) => p.kind === 'number')
    expect(problems).toHaveLength(1)
    expect(problems[0].step).toBe('c')
    expect(problems[0].value).toBe(7)
  })

  it('a declared allowance is accepted', () => {
    const s = step('c', 'content', {
      text: () => ['Height is at most about 1.44 log2 n.'],
      allow: [{ value: 1.44, reason: 'ID C3, stated without proof (D13)' }],
    })
    expect(kinds(withStep(s))).not.toContain('number')
  })
})

describe('D19 no sign, lean or case wording in module content', () => {
  const withText = (line: string) => {
    const m = valid()
    m.steps[3] = step('c', 'content', { text: () => [line] })
    return m
  }

  it('C2 and C3 are clean', () => {
    for (const id of ['C2', 'C3'] as const) {
      expect(validateModule(MODULE_CONTENT[id]!).filter((p) => p.kind === 'wording'), id).toEqual([])
    }
  })

  it.each([
    'balance factor = left minus right',
    'it is right minus left',
    'bf = height(left) - height(right)',
    'a positive number means it leans left',
    'this node is right-heavy',
    'this is the LR case',
    'a left-right shape',
  ])('rejects "%s"', (line) => {
    const problems = validateModule(withText(line)).filter((p) => p.kind === 'wording')
    expect(problems).toHaveLength(1)
    expect(problems[0].step).toBe('c')
  })

  it('does not flag ordinary words', () => {
    expect(kinds(withText("We'll walk down the left subtree, then the right one."))).not.toContain('wording')
  })
})

describe('every registered module validates cleanly (content validator)', () => {
  it('no problems in any module', () => {
    for (const [id, m] of Object.entries(MODULE_CONTENT)) expect(validateModule(m!), id).toEqual([])
  })
})
