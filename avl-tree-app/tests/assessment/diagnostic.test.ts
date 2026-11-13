import { describe, it, expect } from 'vitest'
import { analyseTree } from '../../src/engine/analyse'
import { instantiate } from '../../src/assessment/instantiate'
import { KINDS } from '../../src/assessment/kinds'
import { validateBank } from '../../src/assessment/validate'
import { ALL_ITEMS } from '../../src/content/questions/bank'
import { CHECKS } from '../../src/content/questions/checks'
import { DIAGNOSTIC } from '../../src/content/questions/diagnostic'
import { SUB_SKILLS } from '../../src/content/questions/subSkills'
import { OUTCOMES } from '../../src/content/questions/outcomes'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { SCAFFOLDS } from '../../src/content/questions/scaffolds'
import { OUTCOME_TAGS } from '../../src/assessment/ids'
import type { Tree } from '../../src/engine/tree'
import { pathTo } from '../../src/assessment/kinds/shared'
import { SEEDS } from './helpers'

// Spec: add-diagnostic-c1-and-routing / diagnostic-c1, question-bank, question-model.
// Requirement IDs: FR-DIA-01, FR-ASM-02, D7, D19.

const leaves = (t: Tree): number => (t === null ? 0 : t.left === null && t.right === null ? 1 : leaves(t.left) + leaves(t.right))
const count = (t: Tree): number => (t === null ? 0 : 1 + count(t.left) + count(t.right))

describe('FR-DIA-01 five items, four prerequisite sub-skills', () => {
  it('five C1 items tagged PRE, none optional, covering the four sub-skills', () => {
    expect(DIAGNOSTIC).toHaveLength(5)
    for (const i of DIAGNOSTIC) {
      expect(i.module).toBe('C1')
      expect(i.outcome).toBe('PRE')
      expect(i.optional).not.toBe(true)
    }
    const by = new Map<string, number>()
    for (const i of DIAGNOSTIC) by.set(i.subSkill, (by.get(i.subSkill) ?? 0) + 1)
    expect([...by.entries()].sort()).toEqual([['bst-insert', 1], ['bst-search', 1], ['bst-terminology', 2], ['tree-height', 1]])
  })
  it('PRE is an outcome with its own levels, and the sub-skills belong to it', () => {
    expect(OUTCOME_TAGS).toContain('PRE')
    expect(OUTCOMES.PRE.levels.length).toBeGreaterThan(0)
    for (const s of ['bst-terminology', 'bst-insert', 'bst-search', 'tree-height']) expect(SUB_SKILLS[s].outcome).toBe('PRE')
  })
  it('the whole bank (checks and diagnostic) validates, with five at C1', () => {
    expect(ALL_ITEMS).toHaveLength(CHECKS.length + 5 + 11)
    expect(validateBank(ALL_ITEMS)).toEqual([])
  }, 30_000)
  it('a prerequisite sub-skill tagged with an LO is a tag problem', () => {
    const bad = { ...DIAGNOSTIC[0], outcome: 'LO4' as const }
    const problems = validateBank([bad, ...DIAGNOSTIC.slice(1), ...CHECKS])
    expect(problems.some((p) => p.kind === 'tag' && p.value === 'subSkill')).toBe(true)
  })
})

describe('the new kinds are built by the engine', () => {
  it('tree-terms: the answer is the leaf count and both wrong values differ', () => {
    for (const seed of SEEDS) {
      const inst = instantiate(DIAGNOSTIC.find((i) => i.kind === 'tree-terms')!, seed)
      expect(inst.type).toBe('number')
      expect(inst.answer).toBe(leaves(inst.facts.tree))
      const wrong = inst.known!.map((k) => k.value)
      expect(wrong).toContain(count(inst.facts.tree))
      expect(new Set([inst.answer, ...wrong]).size).toBe(1 + wrong.length)
    }
  })
  it('is-bst: yes or no from the engine, with both answers over the seeds', () => {
    const answers = new Set<unknown>()
    for (const seed of SEEDS) {
      const inst = instantiate(DIAGNOSTIC.find((i) => i.kind === 'is-bst')!, seed)
      expect(inst.answer).toBe(analyseTree(inst.facts.tree).isBst ? 'yes' : 'no')
      answers.add(inst.answer)
      expect(inst.options!.filter((o) => o.correct)).toHaveLength(1)
    }
    expect([...answers].sort()).toEqual(['no', 'yes'])
  })
  it('insert-parent: the answer is the parent the engine finds, the key is not in the tree', () => {
    for (const seed of SEEDS) {
      const inst = instantiate(DIAGNOSTIC.find((i) => i.kind === 'insert-parent')!, seed)
      const k = inst.facts.target!
      const path = pathTo(inst.facts.tree, k)
      expect(inst.answer).toBe(path[path.length - 1])
      expect(inst.facts.keys).not.toContain(k)
    }
  })
  it('retries differ for every diagnostic item (the re-check is a new variant)', () => {
    for (const item of DIAGNOSTIC) {
      for (const seed of SEEDS.slice(0, 30)) {
        expect(instantiate(item, seed, 1).signature, `${item.id} ${seed}`).not.toBe(instantiate(item, seed, 0).signature)
      }
    }
  })
  it('every kind used is registered', () => {
    for (const i of DIAGNOSTIC) expect(KINDS[i.kind]).toBeDefined()
  })
})

describe('the new misconceptions are catalogued and scaffolded', () => {
  it('six new, each with a hint and a lecture question', () => {
    const fresh = ['M-LEAVES-COUNT-ALL', 'M-LEAVES-COUNT-PARENTS', 'M-BST-PARENT-ONLY', 'M-BST-NEEDS-BALANCE', 'M-INSERT-NEAR-VALUE', 'M-INSERT-AT-ROOT']
    for (const m of fresh) {
      expect(MISCONCEPTIONS[m], m).toBeDefined()
      expect(SCAFFOLDS.hints[m], m).toBeTypeOf('function')
      expect(SCAFFOLDS.lecture[m], m).toBeTypeOf('function')
    }
  })
})
