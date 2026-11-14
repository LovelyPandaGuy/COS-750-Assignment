import { describe, expect, it } from 'vitest'
import { learnerReducer, type SessionState } from '../../src/state/learnerReducer'
import { OWN_LECTURE_QUESTION, OWN_QUESTION_MAX_LENGTH, freshLearnerState, type LectureQuestion } from '../../src/state/learnerState'
import { createLearnerStorage, memoryBackend } from '../../src/state/storage'

// Spec: revamp-readiness / learner-session "Own lecture questions can be edited and removed". FR-RDY-02, D143.

const own = (at: string, text: string): LectureQuestion => ({ questionId: OWN_LECTURE_QUESTION, module: 'C9', at, text })
const T1 = '2026-11-14T10:00:00.000Z'
const T2 = '2026-11-14T10:01:00.000Z'
const T3 = '2026-11-14T10:02:00.000Z'
const drafted: LectureQuestion = { questionId: 'chk3-01', module: 'C3', at: T3, text: 'Drafted text' }
const start = (): SessionState => ({
  learner: { ...freshLearnerState('p1'), lectureQuestions: [own(T1, 'First'), own(T2, 'Second'), drafted] },
  loadStatus: 'fresh',
  persistent: true,
})

describe('FR-RDY-02 own lecture questions can be edited and removed', () => {
  it('edit: trimmed, only that question, and it saves', () => {
    const s = learnerReducer(start(), { type: 'lecture-question-edited', at: T1, text: '  New text ' })
    expect(s.learner.lectureQuestions.map((q) => q.text)).toEqual(['New text', 'Second', 'Drafted text'])
    const backend = memoryBackend()
    createLearnerStorage(backend).save(s.learner)
    expect(createLearnerStorage(backend).load().state.lectureQuestions[0].text).toBe('New text')
  })

  it('edit: capped like a new own question', () => {
    const s = learnerReducer(start(), { type: 'lecture-question-edited', at: T1, text: 'x'.repeat(OWN_QUESTION_MAX_LENGTH + 50) })
    expect(s.learner.lectureQuestions[0].text).toHaveLength(OWN_QUESTION_MAX_LENGTH)
  })

  it('a blank edit changes nothing', () => {
    const before = start()
    expect(learnerReducer(before, { type: 'lecture-question-edited', at: T1, text: '   ' })).toBe(before)
  })

  it('remove: only that question', () => {
    const s = learnerReducer(start(), { type: 'lecture-question-removed', at: T2 })
    expect(s.learner.lectureQuestions.map((q) => q.text)).toEqual(['First', 'Drafted text'])
  })

  it('drafted questions are never edited or removed', () => {
    const before = start()
    expect(learnerReducer(before, { type: 'lecture-question-edited', at: T3, text: 'x' }).learner.lectureQuestions).toEqual(before.learner.lectureQuestions)
    expect(learnerReducer(before, { type: 'lecture-question-removed', at: T3 }).learner.lectureQuestions).toEqual(before.learner.lectureQuestions)
  })
})
