import { fireEvent, screen, within } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import { axe } from 'vitest-axe'
import { afterEach, describe, it, expect, vi } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { lectureQuestionFor } from '../../src/assessment/scaffold'
import { checkSeed } from '../../src/assessment/session'
import type { Instance } from '../../src/assessment/types'
import { checkCopy } from '../../src/content/check'
import { readinessCopy } from '../../src/content/readiness'
import { ALL_ITEMS } from '../../src/content/questions/bank'
import { READINESS } from '../../src/content/questions/readiness'
import type { Attempt } from '../../src/state/learnerState'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-readiness-c9 / readiness-check, readiness-summary. Requirement IDs: FR-RDY-01 to FR-RDY-03, D14, NFR-02.

const PROFILE = 'profile-abc'
const at = '2026-11-13T10:00:00.000Z'
const fresh = (attempts: Attempt[] = []) => progressState({ currentModule: 'C9', completedModules: [], attempts, subSkillStatus: {}, lectureQuestions: [] })
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const stored = (r: ReturnType<typeof renderRoutes>) => r.storage.load().state
const item = (id: string) => ALL_ITEMS.find((i) => i.id === id)!
const inst = (id: string, attempt = 0): Instance => instantiate(item(id), checkSeed(PROFILE, id), attempt)

function answer(i: Instance, right: boolean) {
  if (i.type === 'choice') fireEvent.click(screen.getByRole('radio', { name: i.options!.find((o) => o.correct === right)!.text }))
  else fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: String(right ? (i.answer as number) : (i.answer as number) + 100) } })
  fireEvent.click(btn(checkCopy.checkAnswer))
}
const onward = () => fireEvent.click(screen.queryByRole('button', { name: checkCopy.nextQuestion }) ?? btn(checkCopy.continue))

afterEach(() => vi.restoreAllMocks())

describe('the C9 check', () => {
  it('intro, eleven items, then the summary link; C9 completes', () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C9/check')
    expect(screen.getByText(readinessCopy.c9.intro)).toBeInTheDocument()
    fireEvent.click(btn(readinessCopy.c9.start))
    READINESS.forEach((i, n) => {
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.question(n + 1, READINESS.length))
      answer(inst(i.id), true)
      onward()
    })
    expect(screen.getByRole('link', { name: readinessCopy.c9.toSummary })).toHaveAttribute('href', '/readiness')
    expect(stored(r).completedModules).toContain('C9')
  }, 30_000)
  it('a capped outcome comes back once as a new variant, then C9 completes', () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C9/check')
    fireEvent.click(btn(readinessCopy.c9.start))
    for (const i of READINESS) {
      if (i.id === 'r-lo3') {
        for (let a = 0; a < 3; a++) {
          answer(inst(i.id, a), false)
          if (a < 2) fireEvent.click(btn(checkCopy.tryAgain))
        }
      } else answer(inst(i.id), true)
      onward()
    }
    expect(stored(r).completedModules).not.toContain('C9')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(readinessCopy.c9.recycleHeading(1, 1))
    expect(screen.getByText(inst('r-lo3', 3).stem)).toBeInTheDocument()
    answer(inst('r-lo3', 3), true)
    onward()
    expect(stored(r).completedModules).toContain('C9')
    expect(screen.getByRole('link', { name: readinessCopy.c9.toSummary })).toBeInTheDocument()
  }, 30_000)
  it('a C9 item uses the ladder and the cap', () => {
    const r = renderRoutes(backendWith(fresh()), '/module/C9/check')
    fireEvent.click(btn(readinessCopy.c9.start))
    answer(inst(READINESS[0].id), false)
    expect(screen.getByRole('region', { name: checkCopy.ladder.region })).toBeInTheDocument()
    expect(stored(r).attempts).toHaveLength(1)
  })
})

const fixture = (): Attempt[] => [
  { questionId: 'chk3-height', at, answer: 'x', correct: true, hintsUsed: 0 },
  { questionId: 'chk3-bf', at, answer: 'x', correct: false, hintsUsed: 0, confidence: 'sure', misconceptionId: 'M-BF-SIGN' },
]
const row = (lo: string) => screen.getByRole('row', { name: new RegExp(`^${lo}\\b`) })

describe('the readiness summary', () => {
  it('rows match the attempts, LO8 is not tried and optional, links go back', () => {
    renderRoutes(backendWith(fresh(fixture())), '/readiness')
    expect(within(row('LO2')).getByText(readinessCopy.states.ready)).toBeInTheDocument()
    expect(within(row('LO3')).getByText(readinessCopy.states.revise)).toBeInTheDocument()
    expect(within(row('LO8')).getByText(readinessCopy.states.notTried)).toBeInTheDocument()
    expect(row('LO8').textContent).toContain(readinessCopy.optional)
    expect(within(row('LO6')).getByRole('link')).toHaveAttribute('href', '/module/C5/example')
  })
  it('flags the confident error and lists the unresolved misconception', () => {
    renderRoutes(backendWith(fresh(fixture())), '/readiness')
    expect(row('LO3').textContent).toContain(readinessCopy.flag)
    expect(row('LO2').textContent).not.toContain(readinessCopy.flag)
    const q = lectureQuestionFor(item('chk3-bf'), instantiate(item('chk3-bf'), checkSeed(PROFILE, 'chk3-bf'), 0), 'M-BF-SIGN')
    expect(within(screen.getByRole('list', { name: readinessCopy.lectureHeading })).getByText(q)).toBeInTheDocument()
  })
  it('export waits for an own question; the question is kept after reload', () => {
    const first = renderRoutes(backendWith(fresh()), '/readiness')
    expect(btn(readinessCopy.print)).toBeDisabled()
    expect(btn(readinessCopy.save)).toBeDisabled()
    expect(btn(readinessCopy.copy)).toBeDisabled()
    expect(screen.getByText(readinessCopy.exportNeedsOwn)).toBeInTheDocument()
    fireEvent.change(screen.getByRole('textbox', { name: readinessCopy.ownLabel }), { target: { value: 'Why rotate at the lowest node?' } })
    fireEvent.click(btn(readinessCopy.ownAdd))
    expect(btn(readinessCopy.copy)).toBeEnabled()
    first.unmount()
    renderRoutes(backendWith(stored(first)), '/readiness')
    expect(screen.getByText('Why rotate at the lowest node?')).toBeInTheDocument()
    expect(btn(readinessCopy.print)).toBeEnabled()
  })
  it('copy puts the text on the clipboard and says so; save makes a text file; print prints', async () => {
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    const createObjectURL = vi.fn(() => 'blob:x')
    Object.defineProperty(URL, 'createObjectURL', { value: createObjectURL, configurable: true })
    Object.defineProperty(URL, 'revokeObjectURL', { value: vi.fn(), configurable: true })
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    renderRoutes(backendWith({ ...fresh(fixture()), ownQuestions: [{ text: 'Mine?', at }] }), '/readiness')
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
  it('calm wording and axe clean, fresh and with attempts', async () => {
    expect(JSON.stringify(readinessCopy)).not.toMatch(/\b(?:score|points|rank|grade|pass|fail)\b/i)
    for (const s of [fresh(), fresh(fixture())]) {
      const { container, unmount } = renderRoutes(backendWith(s), '/readiness')
      expect(await axe(container)).toHaveNoViolations()
      unmount()
    }
  }, 60_000)
})
