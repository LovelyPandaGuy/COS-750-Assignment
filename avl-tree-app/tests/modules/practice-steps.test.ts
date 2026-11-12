import { describe, it, expect } from 'vitest'
import { analyseTree } from '../../src/engine/analyse'
import { avlInsert } from '../../src/engine/avl'
import { insert } from '../../src/engine/bst'
import { REBALANCE_CASES } from '../../src/engine/conventions'
import { makeNode, type Key, type Tree } from '../../src/engine/tree'
import { rotationsNeeded } from '../../src/practice/rotate'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { practiceModuleCopy } from '../../src/content/modules/practice'
import { ROTATION_PRACTICE_KEYS } from '../../src/modules/config'
import { computeFacts } from '../../src/modules/facts'
import { generateRotationProblem } from '../../src/modules/generators'
import { rotationHintFacts } from '../../src/modules/practice'
import type { FigureSpec, ModuleContent, Step } from '../../src/modules/schema'
import { validateModule } from '../../src/modules/validate'

// Spec: add-modules-c5-c6 / module-practice-steps. Requirement IDs: FR-ENG-03, FR-LRN-04, FR-VIS-06, D9, D19, D21. Outcome: LO6.

const w = conventionsWording()
const leaf = (k: Key) => makeNode(k, null, null)
const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])

const step = (id: string, event: Step['event'], extra: Partial<Step> = {}): Step => ({
  id,
  event,
  heading: id,
  primary: 'text',
  text: () => [],
  ...extra,
})

/** A minimal valid module with one content step under test. */
const moduleWith = (content: Step): ModuleContent => ({
  id: 'C5',
  steps: [
    step('h', 'hook'),
    step('g', 'goals'),
    step('r', 'recall'),
    content,
    step('e', 'example'),
    step('k', 'check'),
    step('s', 'summary'),
  ],
})

const figureFacts = (figures: FigureSpec[]) => computeFacts(step('x', 'content', { figures })).figures

describe('FR-ENG-03 rotated trees as figures', () => {
  it('single left rotation: root 20, height 1, valid AVL', () => {
    const { a } = figureFacts([{ id: 'a', label: 'a', source: { kind: 'rotated', keys: [10, 20, 30], rotations: [{ dir: 'left', at: 10 }] } }])
    expect(a.rootKey).toBe(20)
    expect(a.height).toBe(1)
    expect(a.isAvl).toBe(true)
  })

  it('two rotations apply in order', () => {
    const { one, two } = figureFacts([
      { id: 'one', label: 'one', source: { kind: 'rotated', keys: [30, 10, 20], rotations: [{ dir: 'left', at: 10 }] } },
      {
        id: 'two',
        label: 'two',
        source: { kind: 'rotated', keys: [30, 10, 20], rotations: [{ dir: 'left', at: 10 }, { dir: 'right', at: 30 }] },
      },
    ])
    expect([one.rootKey, one.height]).toEqual([30, 2])
    expect([two.rootKey, two.height]).toEqual([20, 1])
  })
})

describe('FR-ENG-03 impossible rotations are reported', () => {
  const sourceProblems = (rotations: { dir: 'left' | 'right'; at: Key }[]) =>
    validateModule(
      moduleWith(step('rot', 'content', { figures: [{ id: 'fig', label: 'fig', source: { kind: 'rotated', keys: [10, 20, 30], rotations } }] })),
    ).filter((p) => p.kind === 'source')

  it('no child to lift', () => {
    const p = sourceProblems([{ dir: 'right', at: 10 }])
    expect(p).toHaveLength(1)
    expect(p[0].step).toBe('rot')
    expect(p[0].message).toMatch(/fig/)
  })

  it('missing key', () => {
    const p = sourceProblems([{ dir: 'left', at: 40 }])
    expect(p).toHaveLength(1)
    expect(p[0].step).toBe('rot')
    expect(p[0].message).toMatch(/fig/)
  })

  it('a possible rotation is not a problem', () => {
    expect(sourceProblems([{ dir: 'left', at: 10 }])).toEqual([])
  })
})

describe('LO6 rebalance facts', () => {
  const facts = (keys: Key[]) => figureFacts([{ id: 'f', label: 'f', source: { kind: 'bst', keys } }]).f

  it('one rebalance, single rotation, AVL root 20', () => {
    const f = facts([10, 20, 30])
    expect(f.rebalances).toEqual([{ key: 30, node: 10, case: avlInsert(insert(insert(null, 10).tree, 20).tree, 30).rebalance!.case, rotations: 1 }])
    expect(f.avlRootKey).toBe(20)
  })

  it('double rotation counted as 2', () => {
    const f = facts([30, 10, 20])
    expect(f.rebalances).toHaveLength(1)
    expect(f.rebalances[0]).toMatchObject({ key: 20, node: 30, rotations: 2 })
  })

  it('several rebalances in order', () => {
    expect(facts([10, 20, 30, 40, 50]).rebalances.map((r) => r.key)).toEqual([30, 50])
  })

  it('no rebalance gives an empty list', () => {
    expect(facts([20, 10, 30]).rebalances).toEqual([])
  })

  it('rebalance numbers count as facts for the validator', () => {
    const s = step('n', 'content', {
      figures: [{ id: 'f', label: 'Plain BST', source: { kind: 'bst', keys: [30, 10, 20] } }],
      text: ({ figures: { f } }) => [`It uses ${f.rebalances[0].rotations} rotations at node ${f.rebalances[0].node}.`],
    })
    expect(validateModule(moduleWith(s)).filter((p) => p.kind === 'number')).toEqual([])
  })
})

describe('D19 case names reach text only through the conventions wording', () => {
  it('caseName returns the conventions name for each case', () => {
    for (const c of REBALANCE_CASES) expect(w.caseName(c)).toBe(c)
  })

  it('case name built through the wording passes the validator', () => {
    const s = step('ok', 'content', {
      figures: [{ id: 'f', label: 'Plain BST', source: { kind: 'bst', keys: [10, 20, 30] } }],
      text: ({ figures: { f } }, wording) => [`This is the ${wording.caseName(f.rebalances[0].case)} case.`],
    })
    expect(validateModule(moduleWith(s)).filter((p) => p.kind === 'wording')).toEqual([])
  })

  it('typed case name is still rejected', () => {
    const s = step('typed', 'content', { text: () => ['This is the RR case.'] })
    const p = validateModule(moduleWith(s)).filter((x) => x.kind === 'wording')
    expect(p).toHaveLength(1)
    expect(p[0].step).toBe('typed')
  })
})

describe('C5 order facts and claims', () => {
  const orderStep = (bKeys: Key[], rotate: boolean) =>
    step('order', 'content', {
      figures: [
        { id: 'a', label: 'a', source: { kind: 'bst', keys: [10, 20, 30] } },
        {
          id: 'b',
          label: 'b',
          source: rotate ? { kind: 'rotated', keys: bKeys, rotations: [{ dir: 'left', at: 10 }] } : { kind: 'bst', keys: bKeys },
        },
      ],
      claims: [
        { figure: 'b', is: 'bst' },
        { figure: 'b', is: 'same-order', as: 'a' },
      ],
    })

  it('rotation keeps the order', () => {
    const s = orderStep([10, 20, 30], true)
    expect(validateModule(moduleWith(s)).filter((p) => p.kind === 'claim')).toEqual([])
    const f = computeFacts(s).figures
    expect(f.a.inOrder).toEqual([10, 20, 30])
    expect(f.b.inOrder).toEqual([10, 20, 30])
  })

  it('false order claim reported', () => {
    const p = validateModule(moduleWith(orderStep([10, 20, 40], false))).filter((x) => x.kind === 'claim')
    expect(p).toHaveLength(1)
    expect(p[0].step).toBe('order')
    expect(p[0].value).toBe('same-order')
  })
})

describe('D9 seeded rotation practice trees', () => {
  for (const [size, rotations] of [
    ['single', 1],
    ['double', 2],
  ] as const) {
    it(`${size}-rotation problems over seeds 0 to 199`, () => {
      for (let seed = 0; seed < 200; seed++) {
        const { base, key } = generateRotationProblem(seed, size)
        const keys = keysOf(base)
        expect(analyseTree(base).isAvl, `seed ${seed}`).toBe(true)
        expect(keys, `seed ${seed}`).toHaveLength(ROTATION_PRACTICE_KEYS)
        expect(keys.every((k) => k >= 1 && k <= 99) && key >= 1 && key <= 99, `seed ${seed}`).toBe(true)
        expect(keys, `seed ${seed}`).not.toContain(key)
        expect(analyseTree(insert(base, key).tree).isAvl, `seed ${seed}`).toBe(false)
        const r = avlInsert(base, key).rebalance
        expect(r, `seed ${seed}`).not.toBeNull()
        expect(r!.case[0] === r!.case[1] ? 1 : 2, `seed ${seed}`).toBe(rotations)
        expect(rotationsNeeded(base, key), `seed ${seed}`).toBe(rotations)
      }
    })
  }

  it('same seed, same problem; another seed differs', () => {
    expect(generateRotationProblem(42, 'single')).toEqual(generateRotationProblem(42, 'single'))
    const seen = new Set(Array.from({ length: 10 }, (_, s) => JSON.stringify(generateRotationProblem(s, 'double'))))
    expect(seen.size).toBeGreaterThan(1)
  })
})

describe('D21 rotation practice hints', () => {
  const base = makeNode(30, leaf(10), null)

  it('engine facts for 30, 10 then 20', () => {
    expect(rotationHintFacts(base, 20)).toMatchObject({
      z: 30,
      y: 10,
      rotations: [
        { dir: 'left', at: 10 },
        { dir: 'right', at: 30 },
      ],
    })
  })

  it('the fuller hint names z, y and both rotations', () => {
    const hint = practiceModuleCopy.rotate.hints[1](rotationHintFacts(base, 20), w)
    expect(hint).toMatch(/\b30\b/)
    expect(hint).toMatch(/\b10\b/)
    expect(hint).toMatch(/rotate left at 10\b.*right at 30\b/i)
  })

  it('two hints, nudge first, calm wording', () => {
    const f = rotationHintFacts(base, 20)
    expect(practiceModuleCopy.rotate.hints).toHaveLength(2)
    const nudge = practiceModuleCopy.rotate.hints[0](f, w)
    expect(nudge).not.toMatch(/at 10\b/)
    for (const h of practiceModuleCopy.rotate.hints) expect(h(f, w)).not.toMatch(/wrong|incorrect|fail|✗/i)
  })
})
