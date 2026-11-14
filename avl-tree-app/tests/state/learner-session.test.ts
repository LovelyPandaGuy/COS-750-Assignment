import { describe, expect, it } from 'vitest'
import { learnerReducer, type SessionState } from '../../src/state/learnerReducer'
import { freshLearnerState, type LectureQuestion } from '../../src/state/learnerState'
import { createLearnerStorage, memoryBackend } from '../../src/state/storage'

// Spec: live-c1-and-c9 / learner-session "Screens can record lecture questions, and status follows attempts". FR-RDY-02.
const start = (): SessionState => ({ learner: freshLearnerState('p1'), loadStatus: 'fresh', persistent: true })
const drafted: LectureQuestion = { questionId: 'chk3-01', module: 'C3', at: '2026-11-14T10:00:00.000Z', text: 'Why is the sign negative?' }

describe('learner-session: lecture questions and attempts', () => {
  it('recorded once', () => {
    const once = learnerReducer(start(), { type: 'lecture-question', question: drafted })
    const twice = learnerReducer(once, { type: 'lecture-question', question: drafted })
    expect(twice).toBe(once)
    expect(twice.learner.lectureQuestions).toHaveLength(1)
  })

  it('survives reload', () => {
    const backend = memoryBackend()
    const s = learnerReducer(start(), { type: 'lecture-question', question: drafted })
    createLearnerStorage(backend).save(s.learner)
    expect(createLearnerStorage(backend).load().state.lectureQuestions).toEqual([drafted])
  })

  it('status in the same change: the attempt only, no sub-skill status', () => {
    const s = learnerReducer(start(), { type: 'attempt-recorded', attempt: { questionId: 'chk3-01', at: '2026-11-14T10:00:00.000Z', answer: null, correct: true, hintsUsed: 0, attempt: 1 } })
    expect(s.learner.attempts).toHaveLength(1)
    expect('subSkillStatus' in s.learner).toBe(false)
  })
})
