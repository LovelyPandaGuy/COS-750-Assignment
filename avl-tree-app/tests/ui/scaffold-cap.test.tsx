import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { instantiate } from '../../src/assessment/instantiate'
import { hintFor, lectureQuestionFor, stepsOf, workedExampleFor } from '../../src/assessment/scaffold'
import { checksFor, checkSeed } from '../../src/assessment/session'
import type { Instance } from '../../src/assessment/types'
import { checkCopy } from '../../src/content/check'
import { navigationCopy } from '../../src/content/navigation'
import { playerCopy } from '../../src/content/modules/player'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-scaffold-ladder-and-retry-cap / scaffold-ladder, retry-cap, module-checks, check-feedback.
// Requirement IDs: FR-SCA-02, FR-SCA-03, FR-LRN-05, D21, D27, NFR-02.

const PROFILE = 'profile-abc'
const start = () => progressState({ currentModule: 'C2', completedModules: [], attempts: [], subSkillStatus: {}, lectureQuestions: [] })
const next = () => fireEvent.click(screen.getByRole('button', { name: playerCopy.next }))
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const item = (id: string) => checksFor('C2').find((i) => i.id === id)!
const inst = (id: string, attempt = 0): Instance => instantiate(item(id), checkSeed(PROFILE, id), attempt)
const ladder = () => screen.getByRole('region', { name: checkCopy.ladder.region })
const check = () => fireEvent.click(btn(checkCopy.checkAnswer))
const stored = (r: ReturnType<typeof renderRoutes>) => r.storage.load().state

function open(step = 2) {
  const r = renderRoutes(backendWith(start()), '/module/C2/check')
  for (let i = 1; i < step; i++) next()
  return r
}
function answerWrong(id: string, attempt: number) {
  const i = inst(id, attempt)
  if (i.type === 'choice') fireEvent.click(screen.getByRole('radio', { name: i.options!.find((o) => !o.correct)!.text }))
  else fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: String((i.answer as number) + 100) } })
  check()
}
const wrongMis = (id: string, attempt: number) => inst(id, attempt).options?.find((o) => !o.correct)?.misconceptionId

describe('FR-SCA-02 the ladder escalates with wrong attempts', () => {
  it('hint after the first, worked example after the second, step-through after the third', () => {
    open()
    const id = 'chk2-height'
    answerWrong(id, 0)
    const hint = hintFor(item(id), inst(id, 0), wrongMis(id, 0))
    expect(within(ladder()).getByText(hint)).toBeInTheDocument()
    expect(within(ladder()).queryByText(workedExampleFor(item(id), inst(id, 0)).stem)).toBeNull()

    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong(id, 1)
    expect(within(ladder()).getByText(workedExampleFor(item(id), inst(id, 1)).stem)).toBeInTheDocument()

    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong(id, 2)
    expect(within(ladder()).getByText(stepsOf(inst(id, 2))[0])).toBeInTheDocument()
  })
})

describe('order and requests', () => {
  it('before any answer only the hint can be asked for; the next level follows the hint', () => {
    open()
    const l = within(ladder())
    expect(l.getByRole('button', { name: checkCopy.ladder.hint })).toBeEnabled()
    expect(l.queryByRole('button', { name: checkCopy.ladder.worked })).toBeNull()
    expect(l.queryByRole('button', { name: checkCopy.ladder.walk })).toBeNull()
    fireEvent.click(l.getByRole('button', { name: checkCopy.ladder.hint }))
    expect(within(ladder()).getByRole('button', { name: checkCopy.ladder.worked })).toBeEnabled()
    expect(within(ladder()).queryByRole('button', { name: checkCopy.ladder.walk })).toBeNull()
  })
  it('a hint asked for counts as one hint used on the next attempt', () => {
    const r = open()
    fireEvent.click(within(ladder()).getByRole('button', { name: checkCopy.ladder.hint }))
    answerWrong('chk2-height', 0)
    expect(stored(r).attempts[0].hintsUsed).toBe(1)
  })
  it('asking for the step-through shows the answer and is recorded as three hints', () => {
    const r = open()
    for (const name of [checkCopy.ladder.hint, checkCopy.ladder.worked, checkCopy.ladder.walk]) {
      fireEvent.click(within(ladder()).getByRole('button', { name }))
    }
    expect(within(ladder()).getByText(stepsOf(inst('chk2-height'))[0])).toBeInTheDocument()
    answerWrong('chk2-height', 0)
    expect(stored(r).attempts[0].hintsUsed).toBe(3)
  })
  it('the step-through shows one step at a time', () => {
    open()
    const id = 'chk2-height'
    answerWrong(id, 0)
    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong(id, 1)
    fireEvent.click(btn(checkCopy.tryAgain))
    fireEvent.click(within(ladder()).getByRole('button', { name: checkCopy.ladder.walk }))
    const steps = stepsOf(inst(id, 2))
    expect(within(ladder()).getByText(steps[0])).toBeInTheDocument()
    if (steps.length > 1) {
      expect(within(ladder()).queryByText(steps[1])).toBeNull()
      fireEvent.click(within(ladder()).getByRole('button', { name: checkCopy.ladder.nextStep }))
      expect(within(ladder()).getByText(steps[1])).toBeInTheDocument()
    }
  })
})

describe('FR-SCA-03 the retry cap', () => {
  const capIt = (id = 'chk2-height') => {
    for (let a = 0; a < 3; a++) {
      answerWrong(id, a)
      if (a < 2) fireEvent.click(btn(checkCopy.tryAgain))
    }
  }
  it('two wrong answers can retry; the third cannot', () => {
    open()
    answerWrong('chk2-height', 0)
    expect(btn(checkCopy.tryAgain)).toBeInTheDocument()
    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong('chk2-height', 1)
    expect(btn(checkCopy.tryAgain)).toBeInTheDocument()
    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong('chk2-height', 2)
    expect(screen.queryByRole('button', { name: checkCopy.tryAgain })).toBeNull()
    expect(btn(checkCopy.continue)).toBeInTheDocument()
  })
  it('the capped screen shows the answer steps and the lecture question, and records it once', () => {
    const r = open()
    capIt()
    const mis = wrongMis('chk2-height', 2)
    const q = lectureQuestionFor(item('chk2-height'), inst('chk2-height', 2), mis)
    expect(screen.getByText(checkCopy.ladder.lectureLabel)).toBeInTheDocument()
    expect(screen.getByText(q)).toBeInTheDocument()
    expect(stored(r).lectureQuestions).toHaveLength(1)
    expect(stored(r).lectureQuestions![0]).toMatchObject({ questionId: 'chk2-height', text: q })
  })
  it('a reload shows the capped screen again and records nothing more', () => {
    const first = open()
    capIt()
    first.unmount()
    const again = renderRoutes(backendWith(stored(first)), '/module/C2/check')
    next()
    expect(screen.getByText(checkCopy.ladder.lectureLabel)).toBeInTheDocument()
    expect(stored(again).lectureQuestions).toHaveLength(1)
  })
  it('unreadable answers do not count towards the cap', () => {
    const r = renderRoutes(backendWith(start()), '/module/C3/check')
    next()
    next()
    expect(screen.getByRole('textbox', { name: checkCopy.numberLabel })).toBeInTheDocument()
    for (let i = 0; i < 4; i++) {
      fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: 'two' } })
      check()
    }
    expect(stored(r).attempts).toEqual([])
    expect(screen.getByRole('button', { name: checkCopy.checkAnswer })).toBeInTheDocument()
  })
  it('every question capped: each offers a way on and the check ends', () => {
    open()
    capIt('chk2-height')
    fireEvent.click(btn(checkCopy.continue))
    capIt('chk2-worst')
    fireEvent.click(btn(checkCopy.continue))
    expect(screen.getByRole('heading', { level: 3, name: navigationCopy.whereNext })).toBeInTheDocument()
  })
  it('C2 completes with a capped item, and look over C2 again is the suggestion', () => {
    const r = open()
    answerWrong('chk2-height', 0)
    fireEvent.click(btn(checkCopy.tryAgain))
    // finish the first item properly on attempt 1
    const i1 = inst('chk2-height', 1)
    if (i1.type === 'choice') fireEvent.click(screen.getByRole('radio', { name: i1.options!.find((o) => o.correct)!.text }))
    else fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: String(i1.answer) } })
    check()
    fireEvent.click(btn(checkCopy.nextQuestion))
    capIt('chk2-worst')
    expect(stored(r).completedModules).toEqual(['C2'])
    fireEvent.click(btn(checkCopy.continue))
    const suggested = screen.getAllByRole('button').find((b) => b.textContent!.includes(navigationCopy.suggestedWord))!
    expect(suggested.textContent).toMatch(/Look over C2/)
  })
  it('the sub-skill status is stored after the attempts', () => {
    const r = open()
    answerWrong('chk2-height', 0)
    expect(stored(r).subSkillStatus['bst-shape']).toBe('not-yet')
  })
})

describe('calm and accessible', () => {
  it('ladder wording has no cross, red or judging words', () => {
    expect(JSON.stringify(checkCopy.ladder)).not.toMatch(/[✗✘×❌]|\bwrong\b|incorrect|\bfail|\bred\b/i)
  })
  it('axe: a question with the ladder open, and the capped screen', async () => {
    const r = open()
    answerWrong('chk2-height', 0)
    expect(await axe(r.container)).toHaveNoViolations()
    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong('chk2-height', 1)
    fireEvent.click(btn(checkCopy.tryAgain))
    answerWrong('chk2-height', 2)
    expect(await axe(r.container)).toHaveNoViolations()
  }, 60_000)
})
