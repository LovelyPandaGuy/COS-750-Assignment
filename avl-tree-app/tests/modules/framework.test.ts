import { describe, it, expect } from 'vitest'
import type { ModuleContent, Step, TreeSource } from '../../src/modules/schema'
import { EVENT_ACTIVITY, stepsFor } from '../../src/modules/schema'
import { computeFacts, maxAvlHeight, searchBounds } from '../../src/modules/facts'
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
    expect(searchBounds(5)).toMatchObject({ n: 5, best: 3, worst: 5 })
    expect(searchBounds(1_000_000)).toMatchObject({ n: 1_000_000, best: 20, worst: 1_000_000 })
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

// Spec: add-module-c4-search / module-framework delta. D13, FR-ENG-03.
describe('D13 AVL worst-case search bound for a size', () => {
  /** Minimum node count of an AVL tree of each height: 1, 2, then the two before plus one. */
  const minNodes = (upTo: number): number[] => {
    const m = [1, 2]
    while (m[m.length - 1] <= upTo) m.push(m[m.length - 1] + m[m.length - 2] + 1)
    return m
  }

  it('a million keys: height at most 27, so at most 28 steps', () => {
    expect(maxAvlHeight(1_000_000)).toBe(27)
    expect(searchBounds(1_000_000).avlWorst).toBe(28)
  })

  it('matches the minimum node counts for every n from 1 to 2,000', () => {
    const m = minNodes(2000)
    for (let n = 1; n <= 2000; n++) {
      const h = m.reduce((best, count, i) => (count <= n ? i : best), -1)
      expect(searchBounds(n).avlWorst, `n = ${n}`).toBe(h + 1)
    }
  })

  it('an empty tree has height -1 and no steps', () => {
    expect(maxAvlHeight(0)).toBe(-1)
    expect(searchBounds(0).avlWorst).toBe(0)
  })
})

// Spec: add-module-c7-delete / module-framework delta. FR-ENG-03, FR-ENG-06, ID C7.
describe('FR-ENG-06 delete figures and their facts', () => {
  const RECAP = [50, 30, 70, 20, 40, 60, 80]
  const MULTI = [8, 5, 11, 3, 7, 10, 12, 2, 4, 6, 9, 1]
  const fig = (source: TreeSource) => computeFacts(step('d', 'content', { figures: [{ id: 't', source, label: 't' }] })).figures.t

  it('two children: the successor takes its place', () => {
    const f = fig({ kind: 'deleted', build: 'bst', keys: RECAP, remove: [50], rebalance: false })
    expect(f.deletes).toEqual([{ key: 50, children: 2, successor: 60, rebalances: [] }])
    expect(f.rootKey).toBe(60)
    expect(f.inOrder).not.toContain(50)
  })

  it('rebalances are the engine ones, at 11 then 8, and the tree stays AVL', () => {
    const f = fig({ kind: 'deleted', build: 'avl', keys: MULTI, remove: [12], rebalance: true })
    expect(f.deletes![0].rebalances.map((r) => r.node)).toEqual([11, 8])
    expect(f.isAvl).toBe(true)
  })

  it('without rebalancing nothing is recorded and 20 is out of balance', () => {
    const f = fig({ kind: 'deleted', build: 'avl', keys: [20, 10, 30, 40], remove: [10], rebalance: false })
    expect(f.deletes![0]).toMatchObject({ key: 10, children: 0, successor: null, rebalances: [] })
    expect(f.violations).toEqual([20])
  })

  it('deleting a key that is not there is a source problem', () => {
    const m = valid()
    m.steps[3] = step('c', 'content', { figures: [{ id: 't', source: { kind: 'deleted', build: 'bst', keys: [1, 2], remove: [9], rebalance: false }, label: 't' }] })
    expect(kinds(m)).toContain('source')
  })

  it('the multi-rebalance claim passes for two rebalances and is reported for one', () => {
    const claimed = (keys: number[], remove: number) => {
      const m = valid()
      m.steps[3] = step('c', 'content', {
        figures: [{ id: 't', source: { kind: 'deleted', build: 'avl', keys, remove: [remove], rebalance: true }, label: 't' }],
        claims: [{ figure: 't', is: 'multi-rebalance' }],
      })
      return validateModule(m).filter((p) => p.kind === 'claim')
    }
    expect(claimed(MULTI, 12)).toEqual([])
    const bad = claimed([20, 10, 30, 40], 10)
    expect(bad).toHaveLength(1)
    expect(bad[0].step).toBe('c')
  })

  it('delete numbers are accepted by the number check', () => {
    const m = valid()
    m.steps[3] = step('c', 'content', {
      figures: [{ id: 't', source: { kind: 'deleted', build: 'bst', keys: RECAP, remove: [50], rebalance: false }, label: 't' }],
      text: ({ figures: { t } }) => [`Deleting ${t.deletes![0].key}: it had ${t.deletes![0].children} children, so ${t.deletes![0].successor} moves up.`],
    })
    expect(kinds(m)).not.toContain('number')
  })
})
