import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { makeNode, type Key } from '../../src/engine/tree'

// Spec: revamp-tree-controls / ui-tree-controls "Case and range wording come from the conventions",
// scenario "Wording follows a convention change"; pseudocode-panel "Case named beside the line". D19, D2.
// The conventions wording is replaced with a different case naming, range text and number format. The
// caption, the case beside the pseudocode line and the insert listing must all follow it.
vi.mock('../../src/content/modules/conventionsWording', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../src/content/modules/conventionsWording')>()
  return {
    ...actual,
    conventionsWording: (...args: Parameters<typeof actual.conventionsWording>) => ({
      ...actual.conventionsWording(...args),
      caseName: (c: string) => (c === 'LL' ? 'left-left' : `mock-${c}`),
      rangeText: 'RANGE-MOCK',
      num: (n: number) => `<${n}>`,
    }),
  }
})

import { pseudocode } from '../../src/content/pseudocode'
import { ReplayPlayer } from '../../src/ui/replay/ReplayPlayer'

const leaf = (k: Key) => makeNode(k, null, null)
const CHAIN = makeNode(30, leaf(20), null)
const caption = () => screen.getAllByRole('status').filter((el) => !el.closest('.tree-view'))[0]
const steps = (n: number) => {
  for (let i = 0; i < n; i++) fireEvent.click(screen.getByRole('button', { name: 'Step' }))
}
const currentLine = () =>
  within(screen.getByRole('region', { name: /^pseudocode/i }))
    .getAllByRole('listitem')
    .find((li) => li.getAttribute('aria-current') === 'step')!

describe('D19 replay wording follows the conventions wording', () => {
  it('imbalance step: caption and panel say the mocked case name and range, never the code', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    steps(8)
    const t = caption().textContent!
    expect(t).toContain('left-left')
    expect(t).toContain('RANGE-MOCK')
    expect(t).not.toMatch(/\bLL\b/)
    expect(currentLine().textContent).toContain('left-left')
    expect(currentLine().textContent).not.toMatch(/\bLL\b/)
  })

  it('rotation step: caption and panel say the mocked case name', () => {
    render(<ReplayPlayer operation={{ kind: 'insert', tree: CHAIN, key: 10 }} label="Tree" />)
    steps(9)
    expect(caption().textContent).toContain('left-left')
    expect(currentLine().textContent).toContain('left-left')
  })

  it('insert listing line 3 builds its out-of-range values with the conventions number format', () => {
    expect(pseudocode.insert[2]).toContain('<2>')
    expect(pseudocode.insert[2]).toContain('<-2>')
    expect(pseudocode.insert).toHaveLength(5)
  })
})
