import { describe, it, expect } from 'vitest'
import { MODULE_CONTENT } from '../../src/modules/registry'
import { renderStep } from '../../src/modules/render'
import { stepsFor } from '../../src/modules/schema'

// Spec: add-modules-c2-c3 / module-c2-lopsided-bsts. Learning outcome LO1.

const c2 = MODULE_CONTENT.C2!
const byId = (id: string) => {
  const s = c2.steps.find((x) => x.id === id)
  if (!s) throw new Error(`no step ${id}`)
  return s
}
const all = (id: string) => {
  const r = renderStep(byId(id))
  return [r.heading, ...r.paragraphs].join(' ')
}

describe('LO1 C2 opens with the chain problem', () => {
  it('hook: chain of 5 rooted at 10, names 50 and the engine step count 5', () => {
    const r = renderStep(byId('c2-hook'))
    const chain = r.facts.figures.chain
    expect(chain.nodeCount).toBe(5)
    expect(chain.rootKey).toBe(10)
    expect(chain.height).toBe(4)
    expect(chain.searchKey).toBe(50)
    expect(chain.searchSteps).toBe(5)
    const text = all('c2-hook')
    expect(text).toContain('50')
    expect(text).toMatch(/\b5\b/)
    expect(text.toLowerCase()).toContain('million')
  })

  it('goals state LO1 as written in the ID', () => {
    const text = all('c2-goals')
    expect(text).toContain('why BST height')
    expect(text).toContain('insertion order can make a BST lopsided')
  })
})

describe('LO1 search cost follows height', () => {
  it('bounds step gives best and worst for 5 keys and for a million', () => {
    const text = all('c2-bounds')
    for (const s of ['3', '5', '20', '1,000,000']) expect(text, s).toContain(s)
    expect(text).toContain('log2 n')
  })
})

describe('LO1 insertion order decides the shape', () => {
  it('two orders, two heights from the engine', () => {
    const r = renderStep(byId('c2-order'))
    expect(r.facts.figures.shuffled.keys).toEqual([30, 20, 40, 10, 50])
    expect(r.facts.figures.shuffled.height).toBe(2)
    expect(r.facts.figures.chain.height).toBe(4)
    const text = r.paragraphs.join(' ')
    expect(text).toMatch(/\b2\b/)
    expect(text).toMatch(/\b4\b/)
  })
})

describe('LO1 preview of the AVL shape', () => {
  it('AVL tree rooted at 20 with height 2 beside the chain of height 4', () => {
    const r = renderStep(byId('c2-preview'))
    expect(r.facts.figures.avl.rootKey).toBe(20)
    expect(r.facts.figures.avl.height).toBe(2)
    expect(r.facts.figures.chain.height).toBe(4)
    expect(r.paragraphs.join(' ').toLowerCase()).not.toContain('rotat')
  })
})

describe('D10 C2 closes with a summary', () => {
  it('check activity is the placeholder then the summary', () => {
    expect(stepsFor(c2, 'check').map((s) => s.event)).toEqual(['check', 'summary'])
  })
})
