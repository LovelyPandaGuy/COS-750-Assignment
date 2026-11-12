import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { EMPTY_HEIGHT, LEAF_HEIGHT, isOutOfBalance } from '../../src/engine/conventions'
import { insert } from '../../src/engine/bst'
import { analyseTree } from '../../src/engine/analyse'
import { balanceFactorOf, type Key, type Tree } from '../../src/engine/tree'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { renderStep } from '../../src/modules/render'
import { generateFillInTree, generateRootLooksFine } from '../../src/modules/generators'
import { markBalanceFactor, markSpot } from '../../src/modules/practice'
import { PRACTICE_HINTS } from '../../src/modules/config'
import { conventionsWording } from '../../src/content/modules/conventionsWording'
import { practiceModuleCopy as copy } from '../../src/content/modules/practice'
import { signed } from '../../src/ui/tree/describe'

// Spec: add-modules-c2-c3 / module-c3-avl-property. Learning outcomes LO2, LO3; D19, D21, D27.

const c3 = MODULE_CONTENT.C3!
const byId = (id: string) => {
  const s = c3.steps.find((x) => x.id === id)
  if (!s) throw new Error(`no step ${id}`)
  return s
}
const bst = (keys: Key[]): Tree => keys.reduce<Tree>((t, k) => insert(t, k).tree, null)
const size = (t: Tree): number => (t === null ? 0 : 1 + size(t.left) + size(t.right))
const w = conventionsWording()

describe('LO2 C3 teaches height and balance factor', () => {
  it('goals state LO2 and LO3 as written in the ID', () => {
    const text = renderStep(byId('c3-goals')).paragraphs.join(' ')
    expect(text).toContain('height, balance factor and the AVL property')
    expect(text).toContain('work out balance factors')
  })

  it('height step shows the convention values from the module', () => {
    const text = renderStep(byId('c3-height')).paragraphs.join(' ')
    expect(text).toContain(w.heightRule)
    expect(text).toContain(signed(LEAF_HEIGHT))
    expect(text).toContain(signed(EMPTY_HEIGHT))
  })

  it('balance-factor rule is the conventions formula and the step text holds none', () => {
    const r = renderStep(byId('c3-bf'))
    expect(r.rule).toBe(w.formula)
    expect(r.paragraphs.join(' ')).not.toContain(w.formula)
  })
})

describe('LO2 the AVL rule at every node', () => {
  it('"need not be perfect" tree is AVL and not perfect', () => {
    const f = renderStep(byId('c3-not-perfect')).facts.figures.tree
    expect(f.isAvl).toBe(true)
    expect(f.isPerfect).toBe(false)
  })

  it('bound step states 1.44 log2 n with a declared allowance', () => {
    const s = byId('c3-bound')
    const text = renderStep(s).paragraphs.join(' ')
    expect(text).toContain('1.44')
    expect(text).toContain('log2 n')
    expect(s.allow).toEqual([{ value: 1.44, reason: 'ID C3, stated without proof (D13)' }])
  })
})

describe('FR-SCA-04 C3 works one balance factor through', () => {
  it('node 20 of 30, 20, 40, 10: heights 0 and −1, balance factor +1', () => {
    const r = renderStep(byId('c3-worked'))
    expect(r.facts.figures.tree.keys).toEqual([30, 20, 40, 10])
    const n = r.facts.figures.tree.nodes[20]
    expect([n.leftHeight, n.rightHeight, n.balanceFactor]).toEqual([0, -1, 1])
    const text = r.paragraphs.join(' ')
    for (const s of ['0', '−1', '+1']) expect(text, s).toContain(s)
  })
})

describe('LO3 practice trees', () => {
  it('fill-in trees have 5 to 7 nodes', () => {
    for (let seed = 0; seed < 50; seed++) {
      const n = size(generateFillInTree(seed).tree)
      expect(n, String(seed)).toBeGreaterThanOrEqual(5)
      expect(n, String(seed)).toBeLessThanOrEqual(7)
    }
  })

  it('spot-the-problem generator guarantees, seeds 0 to 199', () => {
    for (let seed = 0; seed < 200; seed++) {
      const { tree } = generateRootLooksFine(seed)
      const a = analyseTree(tree)
      expect(size(tree), String(seed)).toBeLessThanOrEqual(9)
      expect(isOutOfBalance(balanceFactorOf(tree)), String(seed)).toBe(false)
      expect(a.balanceViolations, String(seed)).toHaveLength(1)
      expect(a.balanceViolations[0].key, String(seed)).not.toBe(tree!.key)
    }
  })

  it('generators are deterministic per seed', () => {
    expect(generateRootLooksFine(7)).toEqual(generateRootLooksFine(7))
    expect(generateFillInTree(7)).toEqual(generateFillInTree(7))
  })
})

describe('D27 practice marking', () => {
  const chain = bst([30, 20, 10])

  it('right answer', () => {
    expect(markBalanceFactor(chain, 30, 2)).toMatchObject({ kind: 'right', key: 30, correct: 2 })
  })

  it('negative of a non-zero answer is a sign slip, with engine heights', () => {
    expect(markBalanceFactor(chain, 30, -2)).toMatchObject({ kind: 'sign-slip', correct: 2, leftHeight: 1, rightHeight: -1 })
  })

  it('other answers are not yet; zero is never a sign slip', () => {
    expect(markBalanceFactor(chain, 30, 3).kind).toBe('not-yet')
    expect(markBalanceFactor(bst([20, 10, 30]), 20, 0).kind).toBe('right')
    expect(markBalanceFactor(bst([20, 10, 30]), 10, -0).kind).toBe('right')
  })

  it('spot the problem', () => {
    const t = bst([50, 30, 70, 20, 80, 10])
    expect(markSpot(t, 30)).toMatchObject({ kind: 'right', picked: 30, answer: 30 })
    expect(markSpot(t, 50)).toMatchObject({ kind: 'not-yet', picked: 50, answer: 30 })
  })
})

describe('D27 calm wording', () => {
  const banned = /wrong|incorrect|fail|✗/i

  it('rendered feedback for every kind is calm and starts with the verdict', () => {
    const chain = bst([30, 20, 10])
    const right = copy.fillIn.why(markBalanceFactor(chain, 30, 2), w)
    const slip = copy.fillIn.why(markBalanceFactor(chain, 30, -2), w)
    const other = copy.fillIn.why(markBalanceFactor(chain, 30, 5), w)
    const t = bst([50, 30, 70, 20, 80, 10])
    const spotRight = copy.spot.why(markSpot(t, 30), w)
    const spotOther = copy.spot.why(markSpot(t, 50), w)
    for (const s of [copy.verdict.right, copy.verdict.notYet, right, slip, other, spotRight, spotOther, copy.tryAgain, copy.review]) {
      expect(s).not.toMatch(banned)
    }
    expect(copy.verdict.right).toMatch(/^That's right/)
    expect(copy.verdict.notYet).toMatch(/^Not quite yet/)
    expect(slip).toMatch(/sign/i)
    expect(slip).toMatch(/other way round/i)
    expect(slip).toContain('1')
    expect(slip).toContain('−1')
  })

  it('module content and player files contain no judging words', () => {
    for (const f of ['src/content/modules/practice.ts', 'src/content/modules/player.ts', 'src/content/modules/c2.ts', 'src/content/modules/c3.ts']) {
      const text = readFileSync(f, 'utf8').replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '')
      expect(text, f).not.toMatch(banned)
    }
  })
})

describe('D21 practice hints', () => {
  it('two hints per practice kind: a nudge, then one built from engine facts', () => {
    expect(PRACTICE_HINTS).toBe(2)
    expect(copy.fillIn.hints).toHaveLength(PRACTICE_HINTS)
    expect(copy.spot.hints).toHaveLength(PRACTICE_HINTS)
    const fuller = copy.fillIn.hints[1]({ key: 30, leftHeight: 1, rightHeight: -1 }, w)
    expect(fuller).toContain('30')
    expect(fuller).toContain('−1')
  })
})
