import { describe, it, expect } from 'vitest'
import { C1_REFRESHER } from '../../src/content/modules/c1Refresher'
import { diagnosticCopy } from '../../src/content/diagnostic'
import { renderStep } from '../../src/modules/render'
import { computeFacts } from '../../src/modules/facts'
import { validateSequence } from '../../src/modules/validate'
import { VALIDATION_WORDING } from '../../src/modules/validate'

// Spec: add-diagnostic-c1-and-routing / bst-refresher, diagnostic-c1. Requirement IDs: FR-DIA-03, FR-DIA-05, D2, D7, D19.

const JUDGING = /\b(?:mark|marks|marked|grade|graded|pass|fail|failed|test|tests|score|scored|points)\b/i
const texts = () =>
  C1_REFRESHER.steps.flatMap((s) => {
    const r = renderStep(s, 0, computeFacts(s, 0), VALIDATION_WORDING)
    return [r.heading, ...r.paragraphs]
  })

describe('the refresher sequence', () => {
  it('is 5 to 7 steps covering terms, ordering, search, insert and height, in order', () => {
    expect(C1_REFRESHER.steps.length).toBeGreaterThanOrEqual(5)
    expect(C1_REFRESHER.steps.length).toBeLessThanOrEqual(7)
    const joined = C1_REFRESHER.steps.map((s) => s.heading.toLowerCase()).join(' | ')
    const at = ['terms', 'order', 'search', 'insert', 'height'].map((w) => joined.indexOf(w))
    expect(at.every((n) => n >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
  })
  it('validates with no problem', () => {
    expect(validateSequence(C1_REFRESHER)).toEqual([])
  })
  it('a missing hook is caught', () => {
    const noHook = { ...C1_REFRESHER, steps: C1_REFRESHER.steps.filter((s) => s.event !== 'hook') }
    expect(validateSequence(noHook).some((p) => p.kind === 'order')).toBe(true)
  })
  it('needs no check or summary step', () => {
    expect(C1_REFRESHER.steps.some((s) => s.event === 'check')).toBe(false)
  })
  it('content steps can be skipped', () => {
    expect(C1_REFRESHER.steps.some((s) => s.event === 'content')).toBe(true)
  })
})

describe('FR-DIA-05 private practice wording', () => {
  it('the refresher text has no mark, grade, pass, fail, test, score or points', () => {
    for (const t of texts()) expect(t, t).not.toMatch(JUDGING)
  })
  it('the diagnostic copy has none either, and the first screen says private practice', () => {
    expect(JSON.stringify(diagnosticCopy)).not.toMatch(JUDGING)
    expect(diagnosticCopy.intro.paragraphs.join(' ')).toMatch(/private practice/i)
  })
})
