import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, expect, it } from 'vitest'
import { lessonCopy } from '../../src/content/lesson'
import { loadContent, lessonById } from '../../src/live/load'
import type { Attempt, LearnerState } from '../../src/state/learnerState'
import { LEARNER_KEY } from '../../src/state/storage'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-live-lesson-questions / lesson-questions, lesson-checks, check-feedback, lesson-player.
// ID 7.2, 8.1, 9.1, 9.2, 9.4, 9.5, 10.1, 10.2, 12.2.

const c = lessonCopy.controls
const q = lessonCopy.questions
const content = loadContent().content!

const right = (questionId: string): Attempt => ({ questionId, at: '2026-11-14T10:00:00.000Z', answer: null, correct: true, hintsUsed: 0, attempt: 1 })
const state = (attempts: Attempt[] = []): LearnerState => progressState({ attempts })
/** Every check question answered rightly, so Next passes every check. */
const allChecks = () => content.checks.questions.map((x) => right(x.id))

function openAt(lesson: string, screenId: string, attempts: Attempt[] = allChecks()) {
  const backend = backendWith(state(attempts))
  const r = renderRoutes(backend, `/module/${lesson.toUpperCase()}`)
  const n = lessonById(lesson)!.screens.findIndex((s) => s.id === screenId)
  for (let i = 0; i < n; i++) fireEvent.click(screen.getByRole('button', { name: c.next }))
  return { ...r, backend, stored: () => JSON.parse(backend.getItem(LEARNER_KEY)!) as LearnerState }
}
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const radio = (name: string | RegExp) => screen.getByRole('radio', { name })
const field = (label: string | RegExp) => screen.getByRole('textbox', { name: label })
const feedback = () => screen.getByRole('status', { name: q.feedbackLabel })
const node = (root: Element, key: number) => root.querySelector(`[data-key="${key}"]`) as SVGGElement
const sure = () => fireEvent.click(radio('Sure'))
const wrongC2 = 'The tree is balanced, because the keys are placed one after another'
const rightC2 = /chain of height 5/
const check = () => fireEvent.click(btn(q.checkAnswer))

describe('lesson-questions: interactive screens ask their question', () => {
  it('recall question', () => {
    openAt('c3', 'c3-s03')
    expect(screen.getByText('What is the height of a leaf?')).toBeInTheDocument()
    expect(screen.getAllByRole('radio')).toHaveLength(3)
    expect(btn(q.checkAnswer)).toBeDisabled()
  })

  it('practice on a tree: balance factors hidden, one field per target', () => {
    const r = openAt('c3', 'c3-s09')
    expect(node(r.container, 50).querySelector('.tree-metrics')!.textContent).toMatch(/bf \?/)
    expect(screen.getAllByRole('textbox')).toHaveLength(7)
    expect(field('Node 20: balance factor')).toBeInTheDocument()
  })
})

describe('lesson-questions: one component per question type (ID 9.5)', () => {
  it('same choice control in practice and in a check', () => {
    const a = openAt('c2', 'c2-s10')
    const practice = a.container.querySelector('.q-choices')!.className
    a.unmount()
    const b = openAt('c2', 'c2-s12', [])
    expect(b.container.querySelector('.q-choices')!.className).toBe(practice)
  })

  it('many or none: several nodes and a None button', () => {
    const r = openAt('c3', 'c3-s12', [right('chk3-01')])
    expect(screen.getByText(q.questionOf(2, 2))).toBeInTheDocument()
    fireEvent.click(node(r.container, 20))
    fireEvent.click(node(r.container, 30))
    expect(screen.getByText('Selected: 20, 30.')).toBeInTheDocument()
    expect(btn('None')).toBeInTheDocument()
  })
})

describe('lesson-questions: values are typed as the ID writes them', () => {
  it('a true minus sign is read, and the sign mistake is named', () => {
    const r = openAt('c3', 'c3-s11')
    fireEvent.change(field('Node 10: balance factor'), { target: { value: '−4' } })
    check()
    expect(feedback()).toHaveTextContent(/^.?\s*Not quite\./)
    expect(feedback()).toHaveTextContent('The sign is reversed.')
    expect(r.stored().attempts.at(-1)).toMatchObject({ questionId: 'c3-s11-task', correct: false, misconceptionId: 'misc-bf-sign', attempt: 1 })
    fireEvent.click(btn('Try again'))
    fireEvent.change(field('Node 10: balance factor'), { target: { value: '+4' } })
    check()
    expect(feedback()).toHaveTextContent("That’s right.")
  })

  it('unreadable: a prompt and no attempt', () => {
    const r = openAt('c3', 'c3-s11')
    const before = r.stored().attempts.length
    fireEvent.change(field('Node 10: balance factor'), { target: { value: 'four' } })
    check()
    expect(screen.getByRole('alert')).toHaveTextContent(q.readPrompt)
    expect(r.stored().attempts).toHaveLength(before)
  })
})

describe('lesson-questions: the tree builder (ID 8.3, D3)', () => {
  it('place a key by its branch (revamp-tree-editor, D132)', () => {
    openAt('c2', 'c2-s01')
    fireEvent.click(btn('Place 10'))
    expect(screen.getAllByRole('button', { name: /^Empty (branch|tree)/ })).toHaveLength(1)
    fireEvent.click(btn('Empty tree, root'))
    fireEvent.click(btn('Place 20'))
    expect(btn('Empty branch, left of 10')).toBeInTheDocument()
    expect(btn('Empty branch, right of 10')).toBeInTheDocument()
  })

  it('no target button list (revamp-tree-editor)', () => {
    openAt('c2', 'c2-s01')
    expect(screen.queryAllByRole('button', { name: /^Put / })).toHaveLength(0)
  })

  it('one primary action in the question: Check answer (D41)', () => {
    const r = openAt('c6', 'c6-s10', [right('chk6-01'), right('chk6-03'), right('chk6-02')])
    const primary = r.container.querySelector('.q-card')!.querySelectorAll('.module-button-primary')
    expect(primary).toHaveLength(1)
    expect(primary[0]).toHaveTextContent(q.checkAnswer)
  })

  it('rotate and undo', () => {
    const r = openAt('c5', 'c5-s13', [right('chk5-01'), right('chk5-02')])
    const describe = () => r.container.querySelector('.q-builder .tree-description')!.textContent
    const before = describe()
    fireEvent.click(node(r.container.querySelector('.q-builder')!, 40))
    fireEvent.click(btn('Rotate right at 40'))
    expect(describe()).not.toBe(before)
    fireEvent.click(btn('Undo'))
    expect(describe()).toBe(before)
  })

  it('keyboard: place, select by Enter, rotate, check (chk6-04)', () => {
    const r = openAt('c6', 'c6-s10', [right('chk6-01'), right('chk6-03'), right('chk6-02')])
    const builder = r.container.querySelector('.q-builder')!
    btn('Place 27').focus()
    fireEvent.click(btn('Place 27'))
    const slot = btn('Empty branch, right of 25')
    slot.focus()
    fireEvent.keyDown(slot, { key: 'Enter' })
    // Within the control bar, arrows move between buttons (revamp-tree-controls, D137).
    btn(/^Place/).focus()
    fireEvent.keyDown(btn(/^Place/), { key: 'ArrowRight' })
    expect(document.activeElement).toBe(btn('Undo'))
    for (const [key, dir] of [[30, /rotate right/i], [20, /rotate left/i]] as const) {
      const item = node(builder, key)
      item.focus()
      fireEvent.keyDown(item, { key: 'Enter' })
      fireEvent.click(btn(dir))
    }
    sure()
    check()
    expect(feedback()).toHaveTextContent("That’s right.")
  })
})

describe('lesson-questions: practice allows unlimited tries (ID 10.2)', () => {
  it('try again as often as needed', () => {
    openAt('c2', 'c2-s10')
    for (let i = 0; i < 3; i++) {
      fireEvent.click(radio('1, 2, 3, 4, 5, 6, 7'))
      check()
      expect(btn('Try again')).toBeInTheDocument()
      expect(btn(c.next)).toBeEnabled()
      fireEvent.click(btn('Try again'))
    }
  })
})

describe('lesson-questions: predict screens (ID 8.1)', () => {
  it('engine prediction', () => {
    openAt('c4', 'c4-s01')
    fireEvent.click(radio('5'))
    fireEvent.click(btn(q.reveal))
    expect(screen.getByRole('status')).toHaveTextContent("That’s right.")
  })

  it('conceptual prediction', () => {
    openAt('c6', 'c6-s01')
    fireEvent.click(radio('Nothing: the tree is fine'))
    fireEvent.click(btn(q.reveal))
    expect(screen.getByRole('status')).toHaveTextContent('Not quite.')
    expect(btn(c.next)).toBeEnabled()
  })
})

describe('lesson-questions: be the algorithm (ID 7.2 C4)', () => {
  it('counter and lit line', () => {
    const r = openAt('c4', 'c4-s09')
    const picker = r.container.querySelector('.q-picker')!
    fireEvent.click(node(picker, 7))
    fireEvent.click(node(picker, 13))
    expect(screen.getByText(/Comparisons: 2/)).toBeInTheDocument()
    const items = within(screen.getByRole('region', { name: /^pseudocode/i })).getAllByRole('listitem')
    expect(items.findIndex((li) => li.getAttribute('aria-current') === 'step') + 1).toBe(8)
  })
})

describe('lesson-player: hint follows the screen’s question (ID 9.4)', () => {
  it('hint on a practice screen counts as used', () => {
    const r = openAt('c3', 'c3-s11')
    fireEvent.click(btn(c.hint))
    expect(r.container.querySelector('.lesson-hint-panel')).toHaveTextContent('This checks heights and balance factors')
    fireEvent.change(field('Node 10: balance factor'), { target: { value: '4' } })
    check()
    expect(r.stored().attempts.at(-1)).toMatchObject({ questionId: 'c3-s11-task', hintsUsed: 1 })
  })
})

describe('lesson-questions: accessible (NFR-02)', () => {
  const cases: [string, string, () => void][] = [
    ['c2', 'c2-s10', () => fireEvent.click(radio('1, 2, 3, 4, 5, 6, 7'))],
    ['c3', 'c3-s11', () => fireEvent.change(field('Node 10: balance factor'), { target: { value: '3' } })],
    ['c3', 'c3-s10', () => fireEvent.click(btn('None'))],
    ['c4', 'c4-s09', () => fireEvent.click(btn('Not found'))],
  ]
  for (const [lesson, id, answer] of cases) {
    it(`${id}: axe before and after a wrong answer`, async () => {
      const r = openAt(lesson, id)
      expect(await axe(r.container)).toHaveNoViolations()
      answer()
      if (!btn(q.checkAnswer).hasAttribute('disabled')) check()
      expect(await axe(r.container)).toHaveNoViolations()
    }, 60_000)
  }

  it('the builder is axe clean (c2-s01, c5-s10)', async () => {
    for (const [lesson, id] of [['c2', 'c2-s01'], ['c5', 'c5-s10']]) {
      const r = openAt(lesson, id)
      expect(await axe(r.container), id).toHaveNoViolations()
      r.unmount()
    }
  }, 60_000)
})

describe('lesson-checks (ID 9.1, 9.2)', () => {
  it('the check screen plays the lesson’s check', () => {
    openAt('c4', 'c4-s11', [])
    expect(screen.getByText(q.questionOf(1, 4))).toBeInTheDocument()
    expect(screen.getByText(content.checks.questions.find((x) => x.id === 'chk4-01')!.stem)).toBeInTheDocument()
  })

  it('one question per criterion', () => {
    const counts = ['c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'].map((id) => {
      const s = lessonById(id)!.screens.find((x) => x.type === 'check')!
      const r = openAt(id, s.id, [])
      const m = /Question 1 of (\d)/.exec(r.container.textContent!)![1]
      r.unmount()
      return Number(m)
    })
    expect(counts).toEqual([2, 2, 4, 4, 4, 3, 2])
  })

  it('second attempt right: two attempts, numbered 1 and 2', () => {
    const r = openAt('c2', 'c2-s12', [])
    fireEvent.click(radio(wrongC2))
    sure()
    check()
    fireEvent.click(btn('Try again'))
    fireEvent.click(radio(rightC2))
    sure()
    check()
    const mine = r.stored().attempts.filter((a) => a.questionId === 'chk2-01')
    expect(mine.map((a) => [a.attempt, a.correct])).toEqual([[1, false], [2, true]])
  })

  it('no third attempt', () => {
    openAt('c2', 'c2-s12', [])
    for (let i = 0; i < 2; i++) {
      fireEvent.click(radio(wrongC2))
      sure()
      check()
      if (i === 0) fireEvent.click(btn('Try again'))
    }
    expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull()
    expect(feedback()).toHaveTextContent('You can open the review for this idea at any time from the lesson list.')
    expect(btn(c.next)).toBeEnabled()
  })

  it('confidence required', () => {
    openAt('c2', 'c2-s12', [])
    fireEvent.click(radio(rightC2))
    expect(btn(q.checkAnswer)).toBeDisabled()
    sure()
    expect(btn(q.checkAnswer)).toBeEnabled()
  })

  it('Next waits on an unanswered check question', () => {
    openAt('c3', 'c3-s12', [])
    expect(btn(c.next)).toBeDisabled()
  })

  it('C3 completes when its check is finished', () => {
    const r = openAt('c3', 'c3-s12', [])
    fireEvent.change(field('Node 20: height'), { target: { value: '2' } })
    fireEvent.change(field('Node 20: balance factor'), { target: { value: '1' } })
    sure()
    check()
    fireEvent.click(btn(q.nextQuestion))
    const picker = r.container.querySelector('.q-picker')!
    for (const k of [20, 30, 50]) fireEvent.click(node(picker, k))
    sure()
    check()
    expect(r.stored().completedModules).toContain('C3')
    expect(r.stored().currentModule).toBe('C4')
  })

  it('reload keeps the check', () => {
    openAt('c4', 'c4-s11', [right('chk4-01')])
    expect(screen.getByText(q.questionOf(2, 4))).toBeInTheDocument()
  })
})

describe('check-feedback (ID 10.1)', () => {
  const earlierC6 = [right('chk6-01'), right('chk6-03')]

  it('wrong answer: four parts in order', () => {
    openAt('c6', 'c6-s10', earlierC6)
    fireEvent.click(radio('Right rotation about n'))
    sure()
    check()
    const text = feedback().textContent!
    const order = ['Not quite.', 'One rotation only fixes the outside cases', 'Review: the four cases', 'Try again']
    const at = order.map((t) => text.indexOf(t))
    expect(at.every((x) => x >= 0)).toBe(true)
    expect([...at].sort((a, b) => a - b)).toEqual(at)
  })

  it('right answer', () => {
    openAt('c2', 'c2-s12', [])
    fireEvent.click(radio(rightC2))
    sure()
    check()
    expect(feedback()).toHaveTextContent(/That’s right\..*Each key is larger.*Review: why BSTs go lopsided.*Next question/)
  })

  it('no misconception recognised: the general explanation', () => {
    openAt('c3', 'c3-s12', [])
    fireEvent.change(field('Node 20: height'), { target: { value: '9' } })
    fireEvent.change(field('Node 20: balance factor'), { target: { value: '9' } })
    sure()
    check()
    expect(feedback()).toHaveTextContent((content.checks.questions.find((x) => x.id === 'chk3-01')!.feedback as { incorrect: string }).incorrect)
  })

  it('wording scan over the content: none of conventions.feedback.neverSay (ID 10.2)', () => {
    const texts = [...content.checks.questions, ...content.readiness.questions, ...content.diagnostic.questions].flatMap((x) => [
      ...(x.options ?? []).map((o) => o.explanation),
      ...(x.wrongAnswers ?? []).map((w) => String(w.feedback ?? '')),
      ...Object.values((x.feedback ?? {}) as Record<string, string>),
    ])
    for (const t of texts) expect(t).not.toMatch(/✗|❌|Wrong!|Incorrect!|\bFail\b/)
  })

  it('tree divergence: the missed rotation is explained', () => {
    openAt('c6', 'c6-s10', [...earlierC6, right('chk6-02')])
    fireEvent.click(btn('Place 27'))
    fireEvent.click(btn('Empty branch, right of 25'))
    sure()
    check()
    expect(feedback()).toHaveTextContent(/Not quite\..*rotat/i)
  })

  it('review keeps work', () => {
    const r = openAt('c3', 'c3-s11')
    fireEvent.change(field('Node 10: balance factor'), { target: { value: '-4' } })
    check()
    fireEvent.click(btn('Review: balance factors'))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Balance factor')
    expect(r.stored().attempts.some((a) => a.questionId === 'c3-s11-task')).toBe(true)
  })
})

describe('lesson-questions: guided pauses (ID 7.2 C6)', () => {
  it('C6 Example 2 stops at the first imbalance until n and the case are named', () => {
    const r = openAt('c6', 'c6-s06')
    const step = () => within(r.container.querySelector('.lesson-animation')!).getAllByRole('button', { name: lessonCopy.animation.next })[0]
    let guard = 0
    while (!(step() as HTMLButtonElement).disabled && guard++ < 40) fireEvent.click(step())
    const pause = screen.getByRole('region', { name: q.guided.legend })
    expect(step()).toBeDisabled()
    fireEvent.click(node(pause, 16))
    fireEvent.click(within(pause).getByRole('radio', { name: 'Case 3 (RL)' }))
    fireEvent.click(within(pause).getByRole('button', { name: q.checkAnswer }))
    expect(within(pause).getByRole('status')).toHaveTextContent('Not quite.')
    fireEvent.click(node(pause, 7))
    fireEvent.click(within(pause).getByRole('button', { name: q.checkAnswer }))
    expect(screen.queryByRole('region', { name: q.guided.legend })).toBeNull()
    expect(step()).toBeEnabled()
  })
})
