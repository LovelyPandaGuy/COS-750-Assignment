import fc from 'fast-check'
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { analyseTree } from '../../src/engine/analyse'
import { avlInsert } from '../../src/engine/avl'
import { REBALANCE_CASES, caseFor, leanOf } from '../../src/engine/conventions'
import { insert } from '../../src/engine/bst'
import type { Key, Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { computeFacts } from '../../src/modules/facts'
import { ROTATION_PRACTICE_KEYS } from '../../src/modules/config'
import { practiceProblem, rotationsFor } from '../../src/modules/generators'
import { renderStep } from '../../src/modules/render'
import { stepsFor } from '../../src/modules/schema'
import { validateModule } from '../../src/modules/validate'
import { caseProblem, markCase } from '../../src/modules/casePractice'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { practiceModuleCopy as copy } from '../../src/content/modules/practice'
import { pseudocode } from '../../src/content/pseudocode'

// Spec: add-module-c6-insertion-and-rebalancing / module-c6-insertion. Learning outcome LO7; ID C6; D10, D13, D19, D21, D27.

const c6 = MODULE_CONTENT.C6!
const w = conventionsWording()
const byId = (id: string) => {
  const s = c6.steps.find((x) => x.id === id)
  if (!s) throw new Error(`no step ${id}`)
  return s
}
const avl = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => avlInsert(t, k).tree, null)
const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')
const CONTENT_FILES = ['src/content/modules/c6.ts']

describe('D10 FR-LRN-01 C6 follows the Gagné order', () => {
  it('the validator reports no problem for C6', () => {
    expect(validateModule(c6)).toEqual([])
  })

  it('activities: three examples then the practice; check placeholder then summary', () => {
    expect(stepsFor(c6, 'explore').slice(0, 3).map((s) => s.event)).toEqual(['hook', 'goals', 'recall'])
    expect(stepsFor(c6, 'example').map((s) => s.event)).toEqual(['example', 'example', 'example', 'practice'])
    expect(stepsFor(c6, 'check').map((s) => s.event)).toEqual(['check', 'summary'])
  })
})

describe('ID C6 the five steps', () => {
  it('the outline shows the insert listing: five lines, no line lit', () => {
    const step = byId('c6-outline')
    expect(step.listings).toEqual(['insert'])
    expect(step.primary).toBe('pseudocode')
    expect(pseudocode.insert).toHaveLength(5)
  })

  it('one content step for each of the five steps, in the ID order, each with a tree', () => {
    const ids = stepsFor(c6, 'explore')
      .filter((s) => s.event === 'content')
      .map((s) => s.id)
    const five = ['c6-insert', 'c6-heights', 'c6-lowest', 'c6-case', 'c6-rotate']
    expect(ids.filter((id) => five.includes(id))).toEqual(five)
    for (const id of five) expect(byId(id).figures?.length ?? 0, id).toBeGreaterThan(0)
  })
})

describe('ID C6 heights update on the way up', () => {
  it('two figures: the AVL tree and the plain insert, which has one more node and is at least as tall', () => {
    const f = computeFacts(byId('c6-heights')).figures
    const [before, after] = [f.before, f.after]
    expect(after.nodeCount).toBe(before.nodeCount + 1)
    expect(after.height).toBeGreaterThanOrEqual(before.height)
    expect(before.isAvl).toBe(true)
  })
})

describe('LO7 the lowest unbalanced node comes from the engine', () => {
  it('more than one node is out of balance; the lowest is the AVL insert node; the AVL figure is valid', () => {
    const f = computeFacts(byId('c6-lowest')).figures
    expect(f.plain.violations.length).toBeGreaterThanOrEqual(2)
    expect(f.plain.violations[0]).toBe(f.plain.insert!.node)
    expect(f.fixed.isAvl).toBe(true)
  })

  it('the text names that node', () => {
    const r = renderStep(byId('c6-lowest'))
    expect(r.paragraphs.join(' ')).toContain(String(r.facts.figures.plain.violations[0]))
  })
})

describe('ID C6 D19 the case from the engine, named through the wording', () => {
  it('one single and one double rotation, with different cases', () => {
    const f = computeFacts(byId('c6-case')).figures
    expect([f.single.insert!.rotations, f.double.insert!.rotations]).toEqual([1, 2])
    expect(f.single.insert!.case).not.toBe(f.double.insert!.case)
  })

  it('each case name in the text is the wording\'s name for the engine\'s case', () => {
    const r = renderStep(byId('c6-case'), 0, undefined, w)
    const text = r.paragraphs.join(' ')
    for (const fig of [r.facts.figures.single, r.facts.figures.double]) expect(text).toContain(w.caseName(fig.insert!.case!))
  })

  it('no case names and no sign wording in the C6 content', () => {
    for (const f of CONTENT_FILES) {
      expect(strip(readFileSync(f, 'utf8')), f).not.toMatch(/\b(LL|RR|LR|RL|left-left|right-right|left-right|right-left|left minus right|leans left|leans right)\b/)
    }
  })

  it('rotating keeps the in-order keys: the rotate step claims it and passes', () => {
    const step = byId('c6-rotate')
    expect(step.claims).toContainEqual(expect.objectContaining({ is: 'same-order' }))
    const f = computeFacts(step).figures
    expect(f.plain.inOrder).toEqual(f.fixed.inOrder)
  })
})

describe('ID C6 D13 one rotation is enough', () => {
  it('the million-key walk-up bound is the computed 28, and 1,000,000 is typed nowhere', () => {
    const r = renderStep(byId('c6-enough'))
    const b = r.facts.bounds.find((x) => x.n === 1_000_000)!
    expect(b.avlWorst).toBe(28)
    const text = r.paragraphs.join(' ')
    expect(text).toContain('28')
    expect(text).toContain('1,000,000')
  })

  it('every insert into an AVL tree records at most one rebalance, of 1 or 2 rotations (property)', () => {
    fc.assert(
      fc.property(fc.uniqueArray(fc.integer({ min: 1, max: 99 }), { maxLength: 40 }), (keys) => {
        let t: Tree = null
        for (const k of keys) {
          const r = avlInsert(t, k)
          if (r.rebalance !== null) expect([1, 2]).toContain(rotationsFor(r.rebalance.case))
          t = r.tree
        }
        expect(analyseTree(t).isAvl).toBe(true)
      }),
    )
  })
})

describe('FR-VIS-05 FR-VIS-06 the worked examples fade', () => {
  const examples = () => ['c6-example-watch', 'c6-example-node', 'c6-example-case'].map(byId)

  it('done for you, then a node prediction, then a case prediction with the switch', () => {
    const [watch, node, kase] = examples()
    expect(watch.replay).toMatchObject({ figure: expect.any(String), insert: expect.any(Number) })
    expect(watch.replay!.predict).toBeUndefined()
    expect(watch.replay!.doItYourself).toBeFalsy()
    expect(node.replay!.predict).toBe('node')
    expect(kase.replay!.predict).toBe('case')
    expect(kase.replay!.doItYourself).toBe(true)
    expect(stepsFor(c6, 'example').slice(0, 3).map((s) => s.id)).toEqual(examples().map((s) => s.id))
  })

  it('every example rebalances, with at least two different cases between them', () => {
    const cases = examples().map((s) => {
      const f = computeFacts(s).figures[s.replay!.figure]
      expect(f.insert!.rebalanced, s.id).toBe(true)
      expect(f.isAvl, s.id).toBe(true)
      return f.insert!.case
    })
    expect(new Set(cases).size).toBeGreaterThanOrEqual(2)
  })

  it('the example keys differ', () => {
    const keys = examples().map((s) => `${s.figures![0].source.kind === 'avl' ? (s.figures![0].source as { keys: Key[] }).keys.join(',') : ''}+${s.replay!.insert}`)
    expect(new Set(keys).size).toBe(3)
  })
})

describe('LO7 name the case: seeded problems and marking', () => {
  const SOURCE = { kind: 'practice', generator: 'insert-rebalance' } as const
  const practiceStep = () => byId('c6-practice')

  it('the practice step is a name-case step on the insert-rebalance generator', () => {
    expect(practiceStep()).toMatchObject({ event: 'practice', practice: 'name-case' })
    expect(practiceStep().figures![0].source).toEqual(SOURCE)
  })

  it('seeds 0 to 199: AVL base of the configured size, a key whose plain insert unbalances it; single and double both occur', () => {
    const sizes = new Set<number>()
    for (let seed = 0; seed < 200; seed++) {
      const p = practiceProblem(SOURCE, seed)!
      expect(p, `seed ${seed}`).not.toBeNull()
      expect(analyseTree(p.base).isAvl).toBe(true)
      expect(keysOf(p.base)).toHaveLength(ROTATION_PRACTICE_KEYS)
      expect(keysOf(p.base)).not.toContain(p.key)
      expect(analyseTree(insert(p.base, p.key).tree).balanceViolations.length, `seed ${seed}`).toBeGreaterThan(0)
      const c = caseProblem(p.base, p.key)
      expect(REBALANCE_CASES).toContain(c.answer)
      sizes.add(rotationsFor(c.answer))
    }
    expect([...sizes].sort()).toEqual([1, 2])
  })

  it('the answer, z and y come from the engine and agree with caseFor over the leans', () => {
    for (let seed = 0; seed < 200; seed++) {
      const p = practiceProblem(SOURCE, seed)!
      const c = caseProblem(p.base, p.key)
      const engine = avlInsert(p.base, p.key).rebalance!
      expect(c.answer).toBe(engine.case)
      expect(c.z).toBe(engine.node)
      expect(caseFor(leanOf(c.zBalance) === 'left-heavy', leanOf(c.yBalance) === 'left-heavy')).toBe(c.answer)
      expect(keysOf(c.tree)).toEqual(keysOf(insert(p.base, p.key).tree))
    }
  })

  const T = avl([30, 20])
  it('marking: the engine\'s case is right, any other is not yet, and the result carries the engine facts', () => {
    const c = caseProblem(T, 10)
    expect(markCase(c, c.answer)).toMatchObject({ kind: 'right', answer: c.answer, z: c.z, y: c.y })
    for (const other of REBALANCE_CASES.filter((x) => x !== c.answer)) {
      expect(markCase(c, other)).toMatchObject({ kind: 'not-yet', picked: other, answer: c.answer, zBalance: c.zBalance, yBalance: c.yBalance })
    }
  })
})

describe('D21 D27 practice wording', () => {
  const c = caseProblem(avl([30, 20]), 10)
  const hintFacts = { z: c.z, y: c.y, zBalance: c.zBalance, yBalance: c.yBalance }
  const wrong = markCase(c, REBALANCE_CASES.find((x) => x !== c.answer)!)

  it('two hints: the nodes first, then which way each leans from the wording', () => {
    expect(copy.nameCase.hints).toHaveLength(2)
    const [h1, h2] = copy.nameCase.hints.map((h) => h(hintFacts, w))
    expect(h1).toContain(String(c.z))
    expect(h1).toContain(String(c.y))
    expect(h2).toContain(w.leanPhrase(c.zBalance))
    expect(h2).toContain(w.leanPhrase(c.yBalance))
  })

  it('a wrong answer names the nodes and their balance factors, never the case, and is calm', () => {
    const text = copy.nameCase.why(wrong, w)
    expect(text).toContain(String(c.z))
    expect(text).toContain(String(c.y))
    expect(text).toContain(w.num(c.zBalance))
    expect(text).not.toContain(w.caseName(c.answer))
    expect(text).not.toMatch(/\b(wrong|fail\w*)\b|✗/i)
  })

  it('a right answer names the case through the wording', () => {
    expect(copy.nameCase.why(markCase(c, c.answer), w)).toContain(w.caseName(c.answer))
  })

  it('no wrong, fail or cross glyph in the C6 content or practice wording', () => {
    for (const f of [...CONTENT_FILES, 'src/content/modules/practice.ts']) {
      expect(strip(readFileSync(f, 'utf8')), f).not.toMatch(/\b(wrong|fail\w*)\b|✗|❌/i)
    }
  })
})
