import { act, render } from '@testing-library/react'
import { StrictMode, useEffect } from 'react'
import { describe, it, expect } from 'vitest'
import { LearnerProvider, useLearner } from '../../src/state/LearnerContext'
import { LEARNER_KEY, STORAGE_INVENTORY } from '../../src/state/storage'
import { OWN_LECTURE_QUESTION } from '../../src/modules/config'
import type { Attempt, LectureQuestion } from '../../src/state/learnerState'
import { backendWith, boot, progressState } from '../ui/learner-fixtures'

// Spec: add-scaffold-ladder-and-retry-cap / learner-storage, learner-session, mastery.
// Requirement IDs: FR-SCA-01, FR-SCA-03, NFR-06, NFR-05, D8.

let seen: ReturnType<typeof useLearner>
function Probe() {
  const s = useLearner()
  useEffect(() => {
    seen = s
  })
  return null
}
const base = () => progressState({ currentModule: 'C2', completedModules: ['C1'], attempts: [], subSkillStatus: {} })
function mount(backend = backendWith(base())) {
  const booted = boot(backend)
  render(
    <StrictMode>
      <LearnerProvider storage={booted.storage} initial={booted.initial}>
        <Probe />
      </LearnerProvider>
    </StrictMode>,
  )
  return { backend, booted }
}
const q: LectureQuestion = { questionId: 'chk2-height', module: 'C2', misconceptionId: 'M-HEIGHT-NODES', text: 'Why do we count height in edges?', at: '2026-11-13T10:00:00.000Z' }
const attempt = (correct: boolean, id = 'chk2-height'): Attempt => ({ questionId: id, at: '2026-11-13T10:00:00.000Z', answer: 'x', correct, hintsUsed: 0 })

describe('lecture questions in storage', () => {
  it('an older save with no list loads as empty, restored', () => {
    const b = boot(backendWith(base()))
    expect(b.initial.status).toBe('restored')
    expect(b.initial.state.lectureQuestions).toEqual([])
  })
  it('round trip', () => {
    const { backend } = mount()
    act(() => seen.recordLectureQuestion(q))
    expect(boot(backend).initial.state.lectureQuestions).toEqual([q])
  })
  it('a tampered list or entry is corrupt', () => {
    for (const bad of ['nope', [{ text: 'x', at: q.at }], [{ ...q, questionId: '' }]]) {
      const raw = JSON.stringify({ ...base(), lectureQuestions: bad })
      expect(boot(backendWith(raw)).initial.status).toBe('reset-corrupt')
    }
  })
  it('the inventory mentions lecture questions', () => {
    expect(STORAGE_INVENTORY.find((k) => k.key === LEARNER_KEY)!.description).toMatch(/lecture question/i)
  })
})

describe('session', () => {
  it('records a lecture question once', () => {
    const { backend } = mount()
    act(() => seen.recordLectureQuestion(q))
    const stored = backend.getItem(LEARNER_KEY)
    act(() => seen.recordLectureQuestion({ ...q, text: 'another' }))
    expect(seen.learner.lectureQuestions).toEqual([q])
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })
  it('an attempt updates its sub-skill status in the same saved change', () => {
    const { backend } = mount()
    act(() => seen.recordAttempt(attempt(false)))
    expect(seen.learner.subSkillStatus).toEqual({ 'bst-shape': 'not-yet' })
    act(() => seen.recordAttempt(attempt(true)))
    expect(seen.learner.subSkillStatus['bst-shape']).toBe('developing')
    act(() => seen.recordAttempt(attempt(true, 'chk2-worst')))
    expect(seen.learner.subSkillStatus['bst-shape']).toBe('developing')
    expect(seen.learner.subSkillStatus['search-cost']).toBe('secure')
    expect(boot(backend).initial.state.subSkillStatus).toEqual(seen.learner.subSkillStatus)
  })
  it('reset clears questions and status', () => {
    mount()
    act(() => {
      seen.recordLectureQuestion(q)
      seen.recordAttempt(attempt(true))
    })
    act(() => seen.reset())
    expect(seen.learner.lectureQuestions).toEqual([])
    expect(seen.learner.subSkillStatus).toEqual({})
  })
})

describe('add-diagnostic-c1-and-routing: setPath', () => {
  it('sets the path and optionally the current module, saved, and a repeat writes nothing', () => {
    const { backend } = mount()
    act(() => seen.setPath('diagnostic-skipped', 'C2'))
    expect(seen.learner.path).toBe('diagnostic-skipped')
    expect(seen.learner.currentModule).toBe('C2')
    expect(boot(backend).initial.state.path).toBe('diagnostic-skipped')
    const stored = backend.getItem(LEARNER_KEY)
    act(() => seen.setPath('diagnostic-skipped', 'C2'))
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
  })
})

describe('add-readiness-c9 (D91): own questions are lecture questions with ID own', () => {
  const owns = () => seen.learner.lectureQuestions.filter((x) => x.questionId === OWN_LECTURE_QUESTION).map((x) => x.text)
  it('trimmed, capped, saved, several allowed; blank writes nothing; inventory says not to type a name', () => {
    const { backend } = mount()
    act(() => seen.addOwnQuestion('  Why rotate at the lowest node?  '))
    expect(owns()).toEqual(['Why rotate at the lowest node?'])
    expect(boot(backend).initial.state.lectureQuestions.map((x) => x.text)).toEqual(['Why rotate at the lowest node?'])
    const stored = backend.getItem(LEARNER_KEY)
    act(() => seen.addOwnQuestion('   '))
    expect(backend.getItem(LEARNER_KEY)).toBe(stored)
    act(() => seen.addOwnQuestion('x'.repeat(400)))
    expect(owns()[1]).toHaveLength(300)
    expect(STORAGE_INVENTORY.find((k) => k.key === LEARNER_KEY)!.description).toMatch(/student number/i)
  })
})
