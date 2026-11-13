import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { itemSeed } from '../../src/assessment/readiness'
import { checkSeed } from '../../src/assessment/session'
import type { Instance } from '../../src/assessment/types'
import { checkCopy } from '../../src/content/check'
import { MISCONCEPTIONS } from '../../src/content/questions/misconceptions'
import { READINESS, lectureListText } from '../../src/content/questions/readiness'
import { readinessCopy } from '../../src/content/readiness'
import { OWN_LECTURE_QUESTION } from '../../src/modules/config'
import type { Attempt, LectureQuestion } from '../../src/state/learnerState'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-readiness-c9 / readiness-check, readiness-report, readiness-summary.
// Requirement IDs: FR-ASM-06, FR-RDY-01 to FR-RDY-03, D4, D14, D20, NFR-02.
// Rewritten at the 13 Nov merge: C9 follows this branch's rules (one try, each missed item returns
// once, the readiness report's verdicts, the own question stored as a lecture question).

const PROFILE = 'profile-abc'
const at = '2026-11-13T10:00:00.000Z'
const fresh = (attempts: Attempt[] = [], lectureQuestions: LectureQuestion[] = []) =>
  progressState({ currentModule: 'C9', completedModules: [], attempts, subSkillStatus: {}, lectureQuestions })
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const stored = (r: ReturnType<typeof renderRoutes>) => r.storage.load().state
const index = (id: string) => READINESS.findIndex((i) => i.id === id)
/** The C9 instance of an item, as the page's session draws it. */
const inst = (id: string, attempt = 0): Instance => {
  const item = READINESS[index(id)]
  return instantiate(item, itemSeed(checkSeed(PROFILE, 'C9'), item, index(id)), attempt)
}
const own = (text: string): LectureQuestion => ({ questionId: OWN_LECTURE_QUESTION, module: 'C9', at, text })
const ok = (questionId: string): Attempt => ({ questionId, at, answer: 'x', correct: true, hintsUsed: 0 })

/** Right or not; a tree item is always answered with the empty tree, which is not the answer. */
function answer(i: Instance, right: boolean) {
  if (i.type === 'choice') fireEvent.click(screen.getByRole('radio', { name: i.options!.find((o) => o.correct === right)!.text }))
  else if (i.type === 'number')
    fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: String(right ? (i.answer as number) : (i.answer as number) + 100) } })
  fireEvent.click(btn(checkCopy.checkAnswer))
}
const onward = () => fireEvent.click(screen.queryByRole('button', { name: checkCopy.nextQuestion }) ?? btn(checkCopy.continue))

afterEach(() => vi.restoreAllMocks())

describe('FR-ASM-06 the C9 check', () => {
  it('intro, every item once with one try, the missed build item returns once as a new problem, then the summary link', () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C9/check')
    expect(screen.getByText(readinessCopy.c9.intro)).toBeInTheDocument()
    fireEvent.click(btn(readinessCopy.c9.start))
    READINESS.forEach((i, n) => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.question(n + 1, READINESS.length))
      answer(inst(i.id), i.id !== 'rdy-build')
      expect(screen.queryByRole('button', { name: checkCopy.tryAgain })).toBeNull()
      onward()
    })
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.returnsHeading(1, 1))
    expect(screen.getByText(inst('rdy-build', 1).stem)).toBeInTheDocument()
    expect(inst('rdy-build', 1).signature).not.toBe(inst('rdy-build', 0).signature)
    answer(inst('rdy-build', 1), false)
    onward()
    expect(screen.getByRole('link', { name: readinessCopy.c9.toSummary })).toHaveAttribute('href', '/readiness')
    expect(stored(r).attempts.filter((a) => a.questionId === 'rdy-build')).toHaveLength(2)
    expect(stored(r).attempts).toHaveLength(READINESS.length + 1)
    // D91: C9 is not finished until the student has written a question of their own.
    expect(screen.getByText(readinessCopy.c9.endNeedsOwn)).toBeInTheDocument()
    expect(stored(r).completedModules).not.toContain('C9')
  }, 60_000)

  it('D87: no ladder and no Try again in C9; the answer is stored with no hints', () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C9/check')
    fireEvent.click(btn(readinessCopy.c9.start))
    answer(inst(READINESS[0].id), false)
    expect(screen.queryByRole('region', { name: checkCopy.ladder.region })).toBeNull()
    expect(screen.queryByRole('button', { name: checkCopy.tryAgain })).toBeNull()
    expect(stored(r).attempts).toHaveLength(1)
    expect(stored(r).attempts[0].hintsUsed).toBe(0)
  })

  it('D4, D20: only the LO8 item can be skipped, and a skip records nothing', () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C9/check')
    fireEvent.click(btn(readinessCopy.c9.start))
    for (const i of READINESS) {
      if (i.id === 'rdy-lo8') {
        fireEvent.click(btn(readinessCopy.c9.skip))
        break
      }
      expect(screen.queryByRole('button', { name: readinessCopy.c9.skip })).toBeNull()
      answer(inst(i.id), true)
      onward()
    }
    expect(stored(r).attempts.some((a) => a.questionId === 'rdy-lo8')).toBe(false)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.question(index('rdy-lo8') + 2, READINESS.length))
  }, 60_000)

  it('D20: Back shows the previous question with its feedback, and Next returns', () => {
    renderRoutes(backendWith(fresh()), '/module/C9/check')
    fireEvent.click(btn(readinessCopy.c9.start))
    answer(inst(READINESS[0].id), true)
    onward()
    fireEvent.click(btn(readinessCopy.c9.back))
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.question(1, READINESS.length))
    expect(screen.getByText(checkCopy.verdict.right, { exact: false })).toBeInTheDocument()
    onward()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.question(2, READINESS.length))
  }, 30_000)
})

const fixture = (): Attempt[] => [
  { questionId: 'rdy-lo2', at, answer: 'x', correct: true, hintsUsed: 0 },
  { questionId: 'rdy-lo3', at, answer: 'x', correct: false, hintsUsed: 0, confidence: 'sure', misconceptionId: 'M-BF-SIGN' },
]
const row = (lo: string) => screen.getByRole('row', { name: new RegExp(`^${lo}\\b`) })

describe('FR-RDY-01 FR-RDY-02 the readiness summary', () => {
  it('rows follow the readiness report; LO8 is listed as optional; links go back to every module the ID names', () => {
    renderRoutes(backendWith(fresh(fixture())), '/readiness')
    expect(within(row('LO2')).getByText(readinessCopy.states.ready)).toBeInTheDocument()
    expect(within(row('LO3')).getByText(readinessCopy.states.revise)).toBeInTheDocument()
    expect(row('LO8').textContent).toContain(readinessCopy.optional)
    expect(within(row('LO6')).getByRole('link')).toHaveAttribute('href', '/module/C5/example')
    expect(within(row('LO5')).getAllByRole('link').map((l) => l.getAttribute('href'))).toEqual(['/module/C4/example', '/module/C8/example'])
  })
  it('D4: the overall verdict is Ready when every outcome but LO8 is', () => {
    const attempts = READINESS.filter((i) => i.id !== 'rdy-lo8').map((i) => ok(i.id))
    renderRoutes(backendWith(fresh(attempts)), '/readiness')
    expect(screen.getByText(readinessCopy.overall(readinessCopy.states.ready))).toBeInTheDocument()
  })
  it('flags the confident error and lists the unresolved misconception', () => {
    renderRoutes(backendWith(fresh(fixture())), '/readiness')
    expect(row('LO3').textContent).toContain(readinessCopy.flag)
    expect(row('LO2').textContent).not.toContain(readinessCopy.flag)
    const q = lectureListText(MISCONCEPTIONS['M-BF-SIGN'].label)
    expect(within(screen.getByRole('list', { name: readinessCopy.lectureHeading })).getByText(q)).toBeInTheDocument()
  })
  it('export waits for an own question; the question is kept after reload as a lecture question with ID own', () => {
    const first = renderRoutes(backendWith(fresh()), '/readiness')
    expect(btn(readinessCopy.print)).toBeDisabled()
    expect(btn(readinessCopy.save)).toBeDisabled()
    expect(btn(readinessCopy.copy)).toBeDisabled()
    expect(screen.getByText(readinessCopy.exportNeedsOwn)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: readinessCopy.ownLabel }), { target: { value: '  Why rotate at the lowest node?  ' } })
    fireEvent.click(btn(readinessCopy.ownAdd))
    expect(btn(readinessCopy.copy)).toBeEnabled()
    expect(stored(first).lectureQuestions).toEqual([expect.objectContaining({ questionId: OWN_LECTURE_QUESTION, module: 'C9', text: 'Why rotate at the lowest node?' })])
    first.unmount()
    renderRoutes(backendWith(stored(first)), '/readiness')
    expect(screen.getByText('Why rotate at the lowest node?')).toBeInTheDocument()
    expect(btn(readinessCopy.print)).toBeEnabled()
  })
  it('decision 11: C9 completes once the run is over and an own question is written', () => {
    const attempts = READINESS.filter((i) => i.optional !== true).map((i) => ok(i.id))
    const r = renderRoutes(backendWith(fresh(attempts)), '/readiness')
    expect(stored(r).completedModules).not.toContain('C9')
    fireEvent.change(screen.getByRole('textbox', { name: readinessCopy.ownLabel }), { target: { value: 'Mine?' } })
    fireEvent.click(btn(readinessCopy.ownAdd))
    expect(stored(r).completedModules).toContain('C9')
  })
  it('FR-RDY-03 copy puts the text on the clipboard and says so; save makes a text file; print prints', async () => {
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const createObjectURL = vi.fn(() => 'blob:x')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    renderRoutes(backendWith(fresh(fixture(), [own('Mine?')])), '/readiness')
    fireEvent.click(btn(readinessCopy.copy))
    expect(await screen.findByText(readinessCopy.copied)).toBeInTheDocument()
    expect(writeText.mock.calls[0][0]).toContain('Mine?')
    expect(writeText.mock.calls[0][0]).not.toContain(PROFILE)
    fireEvent.click(btn(readinessCopy.save))
    expect(createObjectURL).toHaveBeenCalledTimes(1)
    fireEvent.click(btn(readinessCopy.print))
    expect(print).toHaveBeenCalledTimes(1)
  })
  it('the print stylesheet hides the top bar and the controls', () => {
    const css = readFileSync('src/ui/readiness.css', 'utf8')
    expect(css).toMatch(/@media print/)
    expect(css).toMatch(/\.topbar/)
    expect(css).toMatch(/\.readiness-actions/)
  })
  it('NFR-02 calm wording and axe clean, fresh and with attempts', async () => {
    expect(JSON.stringify(readinessCopy)).not.toMatch(/\b(?:score|points|rank|grade|pass|fail)\b/i)
    for (const s of [fresh(), fresh(fixture())]) {
      const { container, unmount } = renderRoutes(backendWith(s), '/readiness')
      expect(await axe(container)).toHaveNoViolations()
      unmount()
    }
  }, 60_000)
})
