import { fireEvent, screen, within } from '@testing-library/react'
import { axe } from 'vitest-axe'
import { describe, it, expect } from 'vitest'
import { checksFor, checkSeed } from '../../src/assessment/session'
import { instantiate } from '../../src/assessment/instantiate'
import type { Instance } from '../../src/assessment/types'
import { checkCopy } from '../../src/content/check'
import { navigationCopy } from '../../src/content/navigation'
import { playerCopy } from '../../src/content/modules/player'
import { screenCopy } from '../../src/content/screens'
import type { ModuleId } from '../../src/state/learnerState'
import { backendWith, progressState, renderRoutes } from './learner-fixtures'

// Spec: add-checks-and-feedback / module-checks, check-feedback, route-choice.
// Requirement IDs: FR-ASM-01, FR-ASM-03, FR-ASM-04, FR-ASM-07, FR-LRN-05, D4, D20, D21, D27, NFR-02.

const PROFILE = 'profile-abc'
const start = (m: ModuleId = 'C2') => progressState({ currentModule: m, completedModules: [], attempts: [] })
const next = () => fireEvent.click(screen.getByRole('button', { name: playerCopy.next }))
const btn = (name: string | RegExp) => screen.getByRole('button', { name })
const inst = (id: string, attempt = 0): Instance => {
  const item = checksFor(id.startsWith('chk2') ? 'C2' : id.startsWith('chk3') ? 'C3' : id.startsWith('chk6') ? 'C6' : 'C7').find((i) => i.id === id)!
  return instantiate(item, checkSeed(PROFILE, id), attempt)
}
const feedback = () => screen.getByRole('status', { name: checkCopy.feedbackLabel })
const stored = (storage: ReturnType<typeof renderRoutes>['storage']) => storage.load().state

function open(module: ModuleId, step: number, state = start(module)) {
  const r = renderRoutes(backendWith(state), `/module/${module}/check`)
  for (let i = 1; i < step; i++) next()
  return r
}

/** Choose or type a response. `right` picks the correct answer; otherwise a wrong one. */
function respond(i: Instance, right: boolean) {
  if (i.type === 'choice') {
    const o = i.options!.find((x) => x.correct === right)!
    fireEvent.click(screen.getByRole('radio', { name: o.text }))
  } else {
    const n = i.answer as number
    fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: String(right ? n : n + 100) } })
  }
}
const check = () => fireEvent.click(btn(checkCopy.checkAnswer))

describe('FR-ASM-01 the Check activity shows the bank items', () => {
  it('C3: intro, three items, summary; no coming line', () => {
    renderRoutes(backendWith(start('C3')), '/module/C3/check')
    expect(screen.getByText(/^Step 1 of 5$/)).toBeInTheDocument()
    expect(screen.queryByText(screenCopy.coming)).toBeNull()
    next()
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(checkCopy.question(1, 3))
    expect(screen.getByText(inst('chk3-height').stem)).toBeInTheDocument()
  })
  it('every module from C2 to C8 has no coming line on any check step', () => {
    for (const m of ['C2', 'C4', 'C5', 'C8'] as const) {
      const { unmount } = renderRoutes(backendWith(start(m)), `/module/${m}/check`)
      expect(screen.queryByText(screenCopy.coming), m).toBeNull()
      unmount()
    }
  })
})

describe('answer controls', () => {
  it('choice: a radio group, Check answer disabled until one is chosen', () => {
    open('C2', 2)
    expect(screen.getAllByRole('radio').length).toBeGreaterThanOrEqual(2)
    expect(btn(checkCopy.checkAnswer)).toBeDisabled()
    respond(inst('chk2-height'), true)
    expect(btn(checkCopy.checkAnswer)).toBeEnabled()
  })
  it('number: unreadable input gets a prompt and no attempt', () => {
    const { storage } = open('C3', 2)
    fireEvent.change(screen.getByRole('textbox', { name: checkCopy.numberLabel }), { target: { value: 'two' } })
    check()
    expect(screen.getByText(checkCopy.unreadable)).toBeInTheDocument()
    expect(stored(storage).attempts).toEqual([])
  })
})

describe('FR-ASM-03 / D27 four-part feedback', () => {
  it('a wrong choice: Not quite yet, its explanation, Review, Try again; one attempt stored with confidence', () => {
    const { storage } = open('C2', 2)
    const i = inst('chk2-height')
    const wrong = i.options!.find((o) => !o.correct)!
    fireEvent.click(btn(checkCopy.unsure))
    respond(i, false)
    check()
    const f = feedback()
    expect(f.textContent!.startsWith(checkCopy.verdict.notYet)).toBe(true)
    expect(within(f).getByText(wrong.explanation)).toBeInTheDocument()
    expect(within(f).getByRole('link', { name: checkCopy.review })).toHaveAttribute('href', '/module/C2/explore')
    expect(within(f).getByRole('button', { name: checkCopy.tryAgain })).toBeInTheDocument()
    const a = stored(storage).attempts
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ questionId: 'chk2-height', correct: false, confidence: 'unsure', misconceptionId: wrong.misconceptionId, hintsUsed: 0 })
  })
  it('a right answer: That\'s right, a brief why, Review, Next question', () => {
    open('C2', 2)
    const i = inst('chk2-height')
    respond(i, true)
    check()
    const f = feedback()
    expect(f.textContent!.startsWith(checkCopy.verdict.right)).toBe(true)
    expect(within(f).getByText(i.correctExplanation)).toBeInTheDocument()
    expect(within(f).getByRole('link', { name: checkCopy.review })).toBeInTheDocument()
    expect(within(f).getByRole('button', { name: checkCopy.nextQuestion })).toBeInTheDocument()
  })
  it('a number with no known misconception shows the general explanation', () => {
    open('C3', 2)
    const i = inst('chk3-height')
    respond(i, false)
    check()
    expect(feedback().textContent).toContain(i.otherExplanation!)
  })
  it('the wording has no cross glyph, red or judging words', () => {
    expect(JSON.stringify(checkCopy)).not.toMatch(/[✗✘×❌]|\bwrong\b|incorrect|\bfail|\bred\b/i)
  })
})

describe('FR-ASM-07 retries are new variants', () => {
  it('Try again shows attempt 1 of the same item', () => {
    open('C2', 2)
    const a0 = inst('chk2-height')
    respond(a0, false)
    check()
    fireEvent.click(btn(checkCopy.tryAgain))
    const a1 = inst('chk2-height', 1)
    expect(screen.getByText(a1.stem)).toBeInTheDocument()
    expect(screen.getAllByRole('radio').map((r) => r.closest('label')!.textContent)).toEqual(a1.options!.map((o) => o.text))
    expect(btn(checkCopy.checkAnswer)).toBeDisabled()
  })
  it('a reload shows the same learner\'s next variant', () => {
    const first = open('C2', 2)
    respond(inst('chk2-height'), false)
    check()
    first.unmount()
    renderRoutes(backendWith(first.storage.load().state), '/module/C2/check')
    next()
    expect(screen.getByText(inst('chk2-height', 1).stem)).toBeInTheDocument()
  })
})

describe('FR-LRN-05 completion only through the check', () => {
  const answerAll = (m: ModuleId, ids: string[]) => {
    ids.forEach((id, k) => {
      const i = inst(id)
      respond(i, true)
      check()
      if (k < ids.length - 1) fireEvent.click(btn(checkCopy.nextQuestion))
    })
  }
  it('C2 completes on the last right answer, and currentModule moves to C3', () => {
    const { storage } = open('C2', 2)
    answerAll('C2', ['chk2-height', 'chk2-worst'])
    expect(stored(storage).completedModules).toEqual(['C2'])
    expect(stored(storage).currentModule).toBe('C3')
  })
  it('one right answer is not enough', () => {
    const { storage } = open('C2', 2)
    answerAll('C2', ['chk2-height'])
    expect(stored(storage).completedModules).toEqual([])
  })
  it('passing through without answering completes nothing', () => {
    const { storage } = open('C2', 1)
    next()
    next()
    next()
    expect(stored(storage).completedModules).toEqual([])
  })
  it('C7 left unanswered is not completed', () => {
    const { storage } = open('C7', 1)
    for (let i = 0; i < 4; i++) next()
    expect(stored(storage).completedModules).toEqual([])
  })
})

describe('D20 Where next follows the result', () => {
  const suggestedButton = () => screen.getAllByRole('button').find((b) => b.textContent!.includes(navigationCopy.suggestedWord))!
  it('all right first time: C3 is suggested', () => {
    open('C2', 2)
    for (const [id, label] of [['chk2-height', checkCopy.nextQuestion], ['chk2-worst', checkCopy.continue]]) {
      respond(inst(id), true)
      check()
      fireEvent.click(btn(label))
    }
    expect(suggestedButton().textContent).toMatch(/C3/)
  })
  it('a first-attempt miss: looking over C2 again is suggested', () => {
    open('C2', 2)
    respond(inst('chk2-height'), false)
    check()
    fireEvent.click(btn(checkCopy.tryAgain))
    respond(inst('chk2-height', 1), true)
    check()
    fireEvent.click(btn(checkCopy.nextQuestion))
    respond(inst('chk2-worst'), true)
    check()
    fireEvent.click(btn(checkCopy.continue))
    expect(suggestedButton().textContent).toMatch(/Look over C2/)
  })
  it('no panel on a question step', () => {
    open('C2', 2)
    expect(screen.queryByRole('heading', { level: 3, name: navigationCopy.whereNext })).toBeNull()
  })
})

describe('FR-ASM-04 trace-an-insert editor (C6)', () => {
  const i = () => inst('chk6-tree')
  const openEditor = () => open('C6', 4)
  const item = (k: number) => screen.getByRole('treeitem', { name: new RegExp(`^Node ${k}\\b`) })
  const insert = () => fireEvent.click(btn(checkCopy.editor.insert(i().facts.target!)))
  const rotations = () => i().trace!.filter((s) => s.kind === 'rotation')
  const rotateAll = (viaKeyboard: boolean) => {
    for (const s of rotations()) {
      const [at, pivot] = s.nodes
      const dir = pivot < at ? 'right' : 'left'
      fireEvent.click(item(at))
      if (viaKeyboard) fireEvent.keyDown(item(at), { key: dir === 'right' ? 'r' : 'l' })
      else fireEvent.click(btn(new RegExp(`rotate ${dir} at ${at}\\b`, 'i')))
    }
  }
  it('shows the stem, the key to insert and an Insert button', () => {
    openEditor()
    expect(screen.getByText(i().stem)).toBeInTheDocument()
    expect(btn(checkCopy.editor.insert(i().facts.target!))).toBeInTheDocument()
  })
  it('insert, rotate the right way, check: right', () => {
    const { storage } = openEditor()
    insert()
    rotateAll(false)
    check()
    expect(feedback().textContent!.startsWith(checkCopy.verdict.right)).toBe(true)
    expect(stored(storage).attempts[0]).toMatchObject({ questionId: 'chk6-tree', correct: true })
  })
  it('the same with the keyboard', () => {
    openEditor()
    insert()
    rotateAll(true)
    check()
    expect(feedback().textContent!.startsWith(checkCopy.verdict.right)).toBe(true)
  })
  it('stopping after the insert: Not quite yet, with the forgot-to-rebalance explanation and the first step not reached', () => {
    const { storage } = openEditor()
    insert()
    check()
    const f = feedback()
    expect(f.textContent!.startsWith(checkCopy.verdict.notYet)).toBe(true)
    const known = i().known!.find((k) => k.misconception === 'M-FORGETS-REBALANCE')!
    expect(f.textContent).toContain(known.explanation)
    expect(f.textContent).toContain(checkCopy.editor.diverged('rotation'))
    expect(stored(storage).attempts[0].misconceptionId).toBe('M-FORGETS-REBALANCE')
  })
  it('Undo and Reset are offered and Check answer works before any edit', () => {
    openEditor()
    expect(btn(/^Undo/)).toBeInTheDocument()
    expect(btn(/^Reset/)).toBeInTheDocument()
    check()
    expect(feedback().textContent!.startsWith(checkCopy.verdict.notYet)).toBe(true)
  })
})

describe('NFR-02 axe on check steps', () => {
  it('a choice step and a number step, before and after an answer', async () => {
    const a = open('C2', 2)
    expect(await axe(a.container)).toHaveNoViolations()
    respond(inst('chk2-height'), false)
    check()
    expect(await axe(a.container)).toHaveNoViolations()
    a.unmount()
    const b = open('C3', 2)
    expect(await axe(b.container)).toHaveNoViolations()
    respond(inst('chk3-height'), false)
    check()
    expect(await axe(b.container)).toHaveNoViolations()
  }, 60_000)
  it('the editor step', async () => {
    const r = open('C6', 4)
    expect(await axe(r.container)).toHaveNoViolations()
  }, 60_000)
})
