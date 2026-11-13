import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { analyseTree } from '../../src/engine/analyse'
import type { Key, Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { computeFacts } from '../../src/modules/facts'
import { renderStep } from '../../src/modules/render'
import { stepsFor } from '../../src/modules/schema'
import { validateModule } from '../../src/modules/validate'
import { drawDeletePractice, markAfterDelete } from '../../src/modules/deletePractice'
import { insert, remove } from '../../src/engine/bst'
import { practiceModuleCopy as copy } from '../../src/content/modules/practice'

// Spec: add-module-c7-delete / module-c7-delete. Learning outcome LO8; ID C7; D4, D19, D21, D27.

const c7 = MODULE_CONTENT.C7!
const byId = (id: string) => {
  const s = c7.steps.find((x) => x.id === id)
  if (!s) throw new Error(`no step ${id}`)
  return s
}
const keysOf = (t: Tree): Key[] => (t === null ? [] : [...keysOf(t.left), t.key, ...keysOf(t.right)])
const bst = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')

describe('D10 FR-LRN-01 C7 follows the Gagné order', () => {
  it('the validator reports no problem for C7', () => {
    expect(validateModule(c7)).toEqual([])
  })

  it('activities: worked example holds the example and the practice; check holds placeholder and summary', () => {
    expect(stepsFor(c7, 'explore').slice(0, 3).map((s) => s.event)).toEqual(['hook', 'goals', 'recall'])
    expect(stepsFor(c7, 'example').map((s) => s.event)).toEqual(['example', 'practice'])
    expect(stepsFor(c7, 'check').map((s) => s.event)).toEqual(['check', 'summary'])
  })
})

describe('LO8 C7 recaps BST delete', () => {
  it('leaf, one child, two children: 0, 1 and 2 children, before and after', () => {
    const counts = ['c7-delete-leaf', 'c7-delete-one-child', 'c7-delete-two-children'].map((id) => {
      const step = byId(id)
      expect(step.figures).toHaveLength(2)
      const f = Object.values(computeFacts(step).figures).find((x) => x.deletes !== undefined)!
      return f.deletes![0].children
    })
    expect(counts).toEqual([0, 1, 2])
  })

  it('the two-children step names the successor from the facts', () => {
    const r = renderStep(byId('c7-delete-two-children'))
    const d = Object.values(r.facts.figures).find((x) => x.deletes !== undefined)!.deletes![0]
    expect(d.successor).not.toBeNull()
    expect(r.paragraphs.join(' ')).toContain(String(d.successor))
  })
})

describe('LO8 C7 shows rebalancing on the way up', () => {
  it('a plain delete leaves one node out of balance; the AVL delete fixes it with one rebalance there', () => {
    const f = computeFacts(byId('c7-rebalance-up')).figures
    const [plain, fixed] = Object.values(f)
    expect(plain.violations).toHaveLength(1)
    expect(fixed.isAvl).toBe(true)
    expect(fixed.deletes![0].rebalances.map((r) => r.node)).toEqual(plain.violations)
  })
})

describe('ID C7 a delete can need more than one rotation', () => {
  it('claims more than one rebalance and names each node from the facts', () => {
    const step = byId('c7-more-than-one')
    expect(step.claims).toContainEqual(expect.objectContaining({ is: 'multi-rebalance' }))
    const r = renderStep(step)
    const fixed = Object.values(r.facts.figures).find((x) => x.deletes?.[0].rebalances.length)!
    const nodes = fixed.deletes![0].rebalances.map((x) => x.node)
    expect(nodes.length).toBeGreaterThanOrEqual(2)
    for (const n of nodes) expect(r.paragraphs.join(' ')).toContain(String(n))
  })

  it('D19 no case names and no sign wording anywhere in C7', () => {
    const src = strip(readFileSync('src/content/modules/c7.ts', 'utf8'))
    expect(src).not.toMatch(/\b(LL|RR|LR|RL|left-left|right-right|left-right|right-left|caseName)\b/)
  })
})

describe('LO8 find the unbalanced node: seeded problems', () => {
  it('seeds 0 to 199: AVL before tree of 7 to 10 keys from 1 to 99, key in it, after tree unbalanced', () => {
    for (let seed = 0; seed < 200; seed++) {
      const { before, key, after } = drawDeletePractice(seed)
      const keys = keysOf(before)
      expect(analyseTree(before).isAvl, `seed ${seed}`).toBe(true)
      expect(keys.length).toBeGreaterThanOrEqual(7)
      expect(keys.length).toBeLessThanOrEqual(10)
      expect(keys.every((k) => k >= 1 && k <= 99)).toBe(true)
      expect(keys).toContain(key)
      expect(keysOf(after)).toEqual(keysOf(remove(before, key).tree))
      expect(analyseTree(after).balanceViolations.length, `seed ${seed}`).toBeGreaterThan(0)
    }
  })

  it('marking: the lowest violation is right, a higher one is "higher", a node in range is "in-balance"', () => {
    // 50 > 30 > 20 > 10 chain-ish: violations lowest first are 30, then 50.
    const after = bst([50, 30, 60, 20, 10])
    const v = analyseTree(after).balanceViolations.map((x) => x.key)
    expect(v.length).toBeGreaterThanOrEqual(2)
    expect(markAfterDelete(after, v[0])).toMatchObject({ kind: 'right', answer: v[0] })
    expect(markAfterDelete(after, v[1])).toMatchObject({ kind: 'higher', answer: v[0] })
    expect(markAfterDelete(after, 60)).toMatchObject({ kind: 'in-balance', answer: v[0] })
  })
})

describe('D21 D27 practice wording', () => {
  it('two hints and calm feedback', () => {
    expect(copy.afterDelete.hints).toHaveLength(2)
    const r = markAfterDelete(bst([50, 30, 60, 20, 10]), 60)
    expect(copy.afterDelete.why(r)).not.toMatch(/\b(wrong|fail\w*)\b|✗/i)
    expect(copy.afterDelete.why(markAfterDelete(bst([50, 30, 60, 20, 10]), 50))).toMatch(/lower/i)
  })

  it('no wrong, fail or cross glyph in the C7 content', () => {
    expect(strip(readFileSync('src/content/modules/c7.ts', 'utf8'))).not.toMatch(/\b(wrong|fail\w*)\b|✗/i)
  })
})
