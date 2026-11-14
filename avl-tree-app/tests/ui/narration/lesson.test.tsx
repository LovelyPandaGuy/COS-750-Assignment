import { act, fireEvent, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { lessonCopy } from '../../../src/content/lesson'
import { narrationCopy } from '../../../src/content/narration'
import { loadContent, lessonById } from '../../../src/live/load'
import type { Attempt } from '../../../src/state/learnerState'
import { fakeEngine } from './fake'
import { renderNarrated } from './render'

// Spec: add-narration / narration "Read aloud on every lesson screen when narration is on", "Reads the
// visible screen in reading order, words from the screen only", "Pause, resume and stop". ID 8.1, D145,
// D146, D148.

const c = lessonCopy.controls
const q = lessonCopy.questions
const content = loadContent().content!
const right = (questionId: string): Attempt => ({ questionId, at: '2026-11-14T10:00:00.000Z', answer: null, correct: true, hintsUsed: 0, attempt: 1 })
const allChecks = () => content.checks.questions.map((x) => right(x.id))
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const read = () => fireEvent.click(btn(narrationCopy.readAloud))
const spokenText = (e: ReturnType<typeof fakeEngine>) => e.spoken[e.spoken.length - 1].join(' ')

afterEach(() => {
  window.location.hash = ''
})

describe('ID 8.1 D145 Read aloud on lesson screens', () => {
  it('after the heading, and nothing spoken until pressed, also after Next', () => {
    const e = fakeEngine()
    renderNarrated({ lesson: 'c1', screenId: 'c1-s03', engine: e })
    const h2 = screen.getByRole('heading', { level: 2 })
    const control = btn(narrationCopy.readAloud)
    expect(h2.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    fireEvent.click(btn(c.next))
    expect(e.spoken).toEqual([])
  })

  it('narration off: no control', () => {
    renderNarrated({ lesson: 'c1', screenId: 'c1-s03', engine: fakeEngine(), narration: false })
    expect(screen.queryByRole('button', { name: narrationCopy.readAloud })).toBeNull()
  })
})

describe('D146 reads the visible screen in order, words from the screen only', () => {
  it('text screen: heading, text and the two points, no button label', () => {
    const e = fakeEngine()
    renderNarrated({ lesson: 'c1', screenId: 'c1-s05', engine: e })
    read()
    const s = lessonById('c1')!.screens.find((x) => x.id === 'c1-s05') as { title: string; text: string; points: string[] }
    expect(e.spoken[0]).toEqual([s.title, s.text, ...s.points])
  })

  it('tree screen: the tree description, word for word', () => {
    const e = fakeEngine()
    renderNarrated({ lesson: 'c2', screenId: 'c2-s09', engine: e })
    read()
    const description = screen.getByText((_, el) => el?.classList.contains('tree-description') ?? false).textContent!
    expect(description.length).toBeGreaterThan(10)
    expect(spokenText(e)).toContain(description)
  })

  it('a closed hint is not read; once opened it is', () => {
    const e = fakeEngine()
    renderNarrated({ lesson: 'c2', screenId: 'c2-s10', engine: e, attempts: allChecks() })
    const hint = 'This checks that you can link insertion order to tree height'
    read()
    expect(spokenText(e)).not.toContain(hint)
    fireEvent.click(btn(narrationCopy.stop))
    fireEvent.click(btn(c.hint))
    read()
    expect(spokenText(e)).toContain(hint)
  })

  it('an answered question: stem, options, then feedback', () => {
    const e = fakeEngine()
    renderNarrated({ lesson: 'c2', screenId: 'c2-s10', engine: e, attempts: allChecks() })
    fireEvent.click(screen.getByRole('radio', { name: '1, 2, 3, 4, 5, 6, 7' }))
    const sure = screen.queryByRole('radio', { name: 'Sure' })
    if (sure) fireEvent.click(sure)
    fireEvent.click(btn(q.checkAnswer))
    const feedback = screen.getByRole('status', { name: q.feedbackLabel })
    read()
    const parts = e.spoken[0]
    const at = (t: string) => parts.findIndex((p) => p.includes(t))
    expect(at('Which insertion order of the keys 1 to 7 gives the shortest BST?')).toBeGreaterThan(-1)
    expect(at('4, 2, 6, 1, 3, 5, 7')).toBeGreaterThan(at('Which insertion order'))
    expect(at('a chain of height 6')).toBeGreaterThan(at('4, 2, 6, 1, 3, 5, 7'))
    expect(parts.join(' ')).toContain(within(feedback).getByText(/chain of height 6/).textContent!.trim())
    for (const label of [q.checkAnswer, c.next, c.back, c.hint, narrationCopy.readAloud]) expect(parts).not.toContain(label)
  })
})

describe('D148 speech stops on a screen change', () => {
  it('Next cancels, and the new screen starts idle', () => {
    const e = fakeEngine()
    renderNarrated({ lesson: 'c1', screenId: 'c1-s03', engine: e })
    read()
    const before = e.calls.cancel
    fireEvent.click(btn(c.next))
    expect(e.calls.cancel).toBeGreaterThan(before)
    expect(btn(narrationCopy.readAloud)).toBeInTheDocument()
    act(() => e.finish())
  })
})

describe('D146 every block type is marked', () => {
  // The first screen of each type in a lesson's main sequence, opened with every check passed.
  const firsts = new Map<string, { lesson: string; screenId: string }>()
  for (const l of content.lessons) for (const s of l.screens) if (!firsts.has(s.type)) firsts.set(s.type, { lesson: l.id, screenId: s.id })

  for (const [type, at] of firsts) {
    it(`${type} (${at.screenId}) reads more than its heading`, () => {
      const e = fakeEngine()
      const r = renderNarrated({ ...at, engine: e, attempts: [...allChecks(), ...diagnosticAndReadiness()] })
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent((lessonById(at.lesson)!.screens.find((s) => s.id === at.screenId) as { title: string }).title)
      read()
      expect(e.spoken[0].length, e.spoken[0].join(' | ')).toBeGreaterThan(1)
      r.unmount()
    })
  }
})

function diagnosticAndReadiness(): Attempt[] {
  const ids = [...content.diagnostic.questionIds, ...content.readiness.questionIds]
  return ids.map(right)
}
