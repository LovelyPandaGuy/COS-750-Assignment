import { act, fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import { walkthroughs } from '../../src/content/walkthrough'
import { lessonById } from '../../src/live/load'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-lesson-walkthroughs / lesson-blocks "How the app works is a walkthrough" (D170) and
// "Animation comparison" (D171). ID 7.2 C1, ID 8.1, ID 8.2, ID 8.3, ID 11, FR-VIS-03, LO1.

const at = (lesson: string, id: string) => {
  const r = renderRoutes(backendWith(progressState()), `/module/${lesson.toUpperCase()}`)
  const n = lessonById(lesson)!.screens.findIndex((s) => s.id === id)
  for (let i = 0; i < n; i++) fireEvent.click(screen.getByRole('button', { name: 'Next' }))
  return r
}
afterEach(() => vi.useRealTimers())

describe('lesson-blocks: How the app works is a walkthrough (D170)', () => {
  const points = (lessonById('c1')!.screens.find((s) => s.id === 'c1-s03') as unknown as { points: string[] }).points
  const walk = () => document.querySelector('.walkthrough') as HTMLElement
  const caption = () => walk().querySelector('.walkthrough-caption')!.textContent
  const step = () => fireEvent.click(within(walk()).getByRole('button', { name: /^Step/ }))
  const lit = () => [...walk().querySelectorAll('[data-lit]')].map((e) => e.getAttribute('data-part'))

  it('steps follow the points, word for word, and step 4 lights the answer row', () => {
    at('c1', 'c1-s03')
    const shown: string[] = []
    for (let i = 0; i < points.length; i++) {
      step()
      shown.push(caption()!)
      if (i === 3) expect(lit()).toEqual(['confidence'])
    }
    expect(shown).toEqual(points)
  })

  it('the mapping has one entry per point, each naming parts the mini-screen draws', () => {
    at('c1', 'c1-s03')
    const map = walkthroughs['c1-s03']
    expect(map).toHaveLength(points.length)
    for (const parts of map) for (const p of parts) expect(walk().querySelector(`[data-part="${p}"]`), p).not.toBeNull()
    for (const p of ['lessons', 'title-bar', 'tree', 'back', 'replay', 'rule', 'hint', 'next', 'confidence', 'check', 'title']) expect(walk().querySelector(`[data-part="${p}"]`), p).not.toBeNull()
  })

  it('not colour alone: the lit part carries "▶ here" and its own ring style', () => {
    at('c1', 'c1-s03')
    step()
    const part = walk().querySelector('[data-lit]') as HTMLElement
    expect(part.textContent).toContain('▶ here')
    const css = readFileSync('src/ui/lesson/walkthrough.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).toMatch(/\[data-lit\][^{]*\{[^}]*(border|outline)-(style|width)[^}]*\}/)
  })

  it('the list on demand', () => {
    at('c1', 'c1-s03')
    const b = within(walk()).getByRole('button', { name: 'Show all as a list' })
    expect(b).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(b)
    expect(b).toHaveAttribute('aria-expanded', 'true')
    expect(within(walk()).getByRole('list').querySelectorAll('li')).toHaveLength(points.length)
    expect([...within(walk()).getByRole('list').querySelectorAll('li')].map((li) => li.textContent)).toEqual(points)
  })

  it('Play steps on its own', () => {
    vi.useFakeTimers()
    at('c1', 'c1-s03')
    fireEvent.click(within(walk()).getByRole('button', { name: /^Play/ }))
    act(() => void vi.advanceTimersByTime(5000))
    expect(points).toContain(caption())
  })

  it('accessible: one labelled image, a polite caption, axe clean when played and with the list open', async () => {
    const { container } = at('c1', 'c1-s03')
    expect(within(walk()).getByRole('img', { name: 'A lesson screen with its controls' })).toBeInTheDocument()
    expect(walk().querySelector('.walkthrough-caption')).toHaveAttribute('aria-live', 'polite')
    expect(walk().querySelectorAll('[role="img"] button, [role="img"] [tabindex]')).toHaveLength(0)
    for (let i = 0; i < points.length; i++) step()
    fireEvent.click(within(walk()).getByRole('button', { name: 'Show all as a list' }))
    expect(await axe(container)).toHaveNoViolations()
  }, 60_000)

  it('reduced motion: any transition is only for users who allow motion', () => {
    const css = readFileSync('src/ui/lesson/walkthrough.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    const outside = css.replace(/@media\s*\(prefers-reduced-motion:\s*no-preference\)\s*\{[\s\S]*?\n\}/g, '')
    expect(outside).not.toMatch(/transition|animation/)
  })
})

describe('lesson-blocks: search animations show where they are, on both diagrams (D171)', () => {
  const diagrams = () => [...document.querySelectorAll('.lesson-animation')] as HTMLElement[]
  const framed = (d: HTMLElement) => d.querySelector('.tree-selected-frame')?.closest('[data-key]')?.querySelector('.tree-key')?.textContent ?? null
  const nextOn = (d: HTMLElement) => fireEvent.click(within(d).getByRole('button', { name: 'Next step' }))
  const prevOn = (d: HTMLElement) => fireEvent.click(within(d).getByRole('button', { name: 'Previous step' }))

  it('C2 screen 6: each diagram frames the node being compared', () => {
    at('c2', 'c2-s06')
    const [chain, bushy] = diagrams()
    expect(framed(chain)).toBeNull()
    expect(framed(bushy)).toBeNull()
    nextOn(chain)
    nextOn(chain)
    expect(framed(chain)).toBe('D')
    nextOn(bushy)
    expect(framed(bushy)).toBe('E')
    prevOn(chain)
    expect(framed(chain)).toBe('A')
  })

  it('C2 screen 6: both end on Z', () => {
    at('c2', 'c2-s06')
    for (const d of diagrams()) {
      while (!within(d).getByRole('button', { name: 'Next step' }).hasAttribute('disabled')) nextOn(d)
      expect(framed(d)).toBe('Z')
    }
  })

  it('C4: a found search frames its path, a missed one ends on the last node compared', () => {
    at('c4', 'c4-s04')
    const [d] = diagrams()
    nextOn(d)
    expect(framed(d)).toBe('20')
    while (!within(d).getByRole('button', { name: 'Next step' }).hasAttribute('disabled')) nextOn(d)
    expect(framed(d)).toBe('30')
  })
})
