import { fireEvent, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { lessonCopy } from '../../src/content/lesson'
import { lessonById, loadContent } from '../../src/live/load'
import type { Attempt } from '../../src/state/learnerState'
import { paths } from '../../src/routes'
import { BREAKPOINTS } from '../../src/ui/breakpoints'
import { firstBlockingIndex, isOpen, outlineOf } from '../../src/ui/lesson/outline'
import { read, rule, stripComments } from './base/css-helpers'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-lesson-outline / lesson-outline. ID 8.2 (lesson list, Back always free, no skip past a check),
// ID 8.3 (revealed structure, controllability), ID 11.1, 11.2, NFR-02, D20, D118, D154.

const o = lessonCopy.outline
const word = (p: keyof typeof lessonCopy.phase) => lessonCopy.phase[p]
const content = () => loadContent().content!
const c3 = () => lessonById('c3')!
const c6 = () => lessonById('c6')!

const at = (when: string): Attempt => ({ questionId: '', at: when, answer: null, correct: true, hintsUsed: 0, attempt: 1 })
/** Every lesson-check question answered rightly, so every check is finished (lesson-checks). */
const checksDone = () => content().checks.questions.map((q) => ({ ...at('2026-11-14T10:00:00.000Z'), questionId: q.id }))

const open = (lesson: string, attempts: Attempt[] = []) =>
  renderRoutes(backendWith(progressState({ attempts })), paths.module(lesson.toUpperCase() as 'C3'))
const next = (times = 1) => {
  for (let i = 0; i < times; i++) fireEvent.click(screen.getByRole('button', { name: lessonCopy.controls.next }))
}
const outline = () => screen.getByRole('navigation', { name: o.label })
/** Opens the narrow-width disclosure (closed by default). */
const expand = () => fireEvent.click(within(outline()).getByText(o.summary(c3().screens.length), { exact: false }).closest('summary')!)
const expandAny = () => fireEvent.click(outline().querySelector('summary')!)
const entries = () => Array.from(outline().querySelectorAll<HTMLButtonElement>('.lesson-outline-entry'))
const entry = (title: string) => entries().find((b) => b.querySelector('.lesson-outline-title')?.textContent === title)!
const phases = () => Array.from(outline().querySelectorAll('.lesson-outline-phase')).map((p) => p.textContent)
const h2 = () => screen.getByRole('heading', { level: 2 })

/** jsdom has no layout: report the desktop width as matched, as a 1366 px window would. */
const wide = () =>
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes(`min-width: ${BREAKPOINTS.desktop}px`) || query.includes('prefers-reduced-motion: reduce'),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }))
afterEach(() => vi.unstubAllGlobals())

describe('lesson-outline: outlineOf and the open rule (unit; ID 8.2, 8.3)', () => {
  it('C3: 13 screens in lesson order under five phase words', () => {
    const groups = outlineOf(c3().screens, word)
    expect(groups.map((g) => g.label)).toEqual(['Problem', 'Recall', 'Learn', 'Practise', 'Check and summary'])
    const flat = groups.flatMap((g) => g.entries)
    expect(flat).toHaveLength(13)
    expect(flat.map((e) => e.index)).toEqual([...Array(13).keys()])
    expect(flat.map((e) => e.title)).toEqual(c3().screens.map((s) => s.title))
  })

  it('C6: a phase that comes back appears twice', () => {
    expect(outlineOf(c6().screens, word).map((g) => g.label)).toEqual(['Problem', 'Recall', 'Learn', 'Practise', 'Learn', 'Check and summary'])
  })

  it('the first unfinished check or question set blocks; a finished one does not', () => {
    const lesson = c3().screens
    const check = lesson.findIndex((s) => s.type === 'check')
    expect(firstBlockingIndex(lesson, [], content())).toBe(check)
    expect(firstBlockingIndex(lesson, checksDone(), content())).toBe(-1)
    const c1 = lessonById('c1')!.screens
    expect(firstBlockingIndex(c1, [], content())).toBe(c1.findIndex((s) => s.type === 'question-set'))
  })

  it('open: every screen up to the current one, and forward up to and including the blocking screen', () => {
    expect(isOpen(0, 3, 11)).toBe(true)
    expect(isOpen(3, 3, 11)).toBe(true)
    expect(isOpen(11, 0, 11)).toBe(true)
    expect(isOpen(12, 0, 11)).toBe(false)
    expect(isOpen(12, 0, -1)).toBe(true)
    // Back is always free (D20), even past a check that is somehow unfinished behind the student.
    expect(isOpen(12, 12, 11)).toBe(true)
  })
})

describe('lesson-outline: the outline lists the lesson screens (ID 8.3 "revealed structure")', () => {
  it('C3 outline', () => {
    open('c3')
    expect(outline()).toBeInTheDocument()
    expand()
    expect(phases()).toEqual(['Problem', 'Recall', 'Learn', 'Practise', 'Check and summary'])
    const titles = entries().map((b) => b.querySelector('.lesson-outline-title')?.textContent)
    expect(titles).toHaveLength(13)
    expect(titles).toEqual(c3().screens.map((s) => s.title))
  })

  it('a phase twice (C6)', () => {
    open('c6')
    expandAny()
    expect(phases().filter((p) => p === 'Learn')).toHaveLength(2)
  })

  it('every lesson shows it, C1 to C9 and the refresher', () => {
    for (const id of ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'c9']) {
      const r = open(id)
      expect(screen.getByRole('navigation', { name: o.label }), id).toBeInTheDocument()
      r.unmount()
    }
    renderRoutes(backendWith(progressState()), paths.activity('C1', 'refresher'))
    expect(outline()).toBeInTheDocument()
  })
})

describe('lesson-outline: the outline marks where the student is (ID 8.3, 11.1)', () => {
  it('marks after two screens, in words', () => {
    open('c3')
    next(2)
    expand()
    const [first, second, third] = entries()
    expect(first).toHaveTextContent(o.done)
    expect(second).toHaveTextContent(o.done)
    expect(third).toHaveTextContent(o.here)
    expect(third).toHaveAttribute('aria-current', 'step')
    expect(entries().filter((b) => b.hasAttribute('aria-current'))).toHaveLength(1)
    expect(entries()[3]).not.toHaveTextContent(o.done)
  })
})

describe('lesson-outline: moving with the outline (ID 8.2, D20)', () => {
  it('back to any screen, focus on its heading', () => {
    open('c3')
    next(7)
    expect(h2()).toHaveTextContent(c3().screens[7].title)
    expand()
    fireEvent.click(entry('Height'))
    expect(h2()).toHaveTextContent('Height')
    expect(screen.getByText('Screen 4 of 13')).toBeInTheDocument()
    expect(document.activeElement).toBe(h2())
  })

  it('not past an unfinished check', () => {
    open('c3')
    expand()
    expect(entry('Lesson check')).toBeEnabled()
    const summary = entry('Summary')
    expect(summary).toBeDisabled()
    expect(summary).toHaveAccessibleName(expect.stringContaining(o.closed))
    fireEvent.click(summary)
    expect(h2()).toHaveTextContent('Spot the problem')
  })

  it('forward to the check itself is allowed', () => {
    open('c3')
    expand()
    fireEvent.click(entry('Lesson check'))
    expect(h2()).toHaveTextContent('Lesson check')
  })

  it('open after the check', () => {
    open('c3', checksDone())
    expand()
    expect(entry('Summary')).toBeEnabled()
    expect(entry('Summary')).not.toHaveTextContent(o.closed)
  })
})

describe('lesson-outline: placement (ID 8.3, D3, D118)', () => {
  it('narrow: a closed disclosure above the frame, labelled with the screen count', () => {
    const r = open('c3')
    const details = outline().querySelector('details')!
    expect(details).not.toBeNull()
    expect(details.open).toBe(false)
    expect(details.querySelector('summary')).toHaveTextContent(o.summary(13))
    expect(entries()).toHaveLength(0)
    const frame = r.container.querySelector('.lesson')!
    expect(outline().compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('wide: the list without a disclosure, beside the frame', () => {
    wide()
    const r = open('c3')
    expect(outline().querySelector('details')).toBeNull()
    expect(entries()).toHaveLength(13)
    const layout = r.container.querySelector('.lesson-layout')!
    expect(layout).toContainElement(outline())
    expect(layout).toContainElement(r.container.querySelector('.lesson') as HTMLElement)
  })

  it('CSS: one column by default, outline and frame side by side from the desktop width only', () => {
    const css = stripComments(read('src/ui/lesson/lesson.css'))
    expect(rule(css, '.lesson-layout')).toMatch(/display:\s*grid/)
    expect(rule(css, '.lesson-layout')).not.toMatch(/grid-template-columns:[^;]*\s\S+\s*;/)
    const desktop = [...css.matchAll(/@media \(min-width: (\d+)px\)\s*\{([\s\S]*?)\n\}/g)].filter((m) => m[2].includes('.lesson-layout'))
    expect(desktop.map((m) => Number(m[1]))).toEqual([BREAKPOINTS.desktop])
    expect(rule(desktop[0][2], '.lesson-layout')).toMatch(/grid-template-columns:\s*minmax\([^)]*\)\s+minmax\(0,\s*1fr\)/)
    // No horizontal scroll at the phone width: grid children may shrink.
    expect(rule(css, '.lesson-layout > *')).toMatch(/min-width:\s*0/)
  })
})

describe('lesson-outline: accessible (NFR-02, ID 11.2)', () => {
  it('axe with the outline closed and open, narrow and wide', async () => {
    const r = open('c3')
    expect(await axe(r.container)).toHaveNoViolations()
    expand()
    expect(await axe(r.container)).toHaveNoViolations()
    r.unmount()
    wide()
    const w = open('c3')
    expect(await axe(w.container)).toHaveNoViolations()
  })

  it('keyboard: the disclosure and an entry by Enter; axe before and after', async () => {
    const user = userEvent.setup()
    const r = open('c3')
    next(3)
    const summary = outline().querySelector('summary')!
    // A summary is natively focusable and opens on Enter or Space in browsers; jsdom and user-event do not
    // turn a key on a summary into a click, so the click is fired directly here. Enter on the summary is
    // checked in Chromium (task 3.2).
    summary.focus()
    expect(document.activeElement).toBe(summary)
    await user.click(summary)
    expect(entries()).toHaveLength(13)
    expect(await axe(r.container)).toHaveNoViolations()
    for (const b of entries()) expect(b.tabIndex).toBe(0)
    entry('Goal').focus()
    await user.keyboard('{Enter}')
    expect(h2()).toHaveTextContent('Goal')
    expect(document.activeElement).toBe(h2())
    expect(await axe(r.container)).toHaveNoViolations()
  })

  it('CSS: entries are at least the target size', () => {
    const css = stripComments(read('src/ui/lesson/lesson.css'))
    expect(rule(css, '.lesson-outline-entry')).toMatch(/min-height:\s*var\(--target-min\)/)
  })
})
