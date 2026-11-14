// A lesson's check (lesson-checks; ID 9.1, 9.2): its questions one at a time, two attempts each,
// confidence required, Next only when finished, resume from stored attempts, completion on finish.
import { useEffect, useMemo, useState } from 'react'
import { lessonCopy } from '../../../content/lesson'
import { loadContent } from '../../../live/load'
import type { Question } from '../../../live/types'
import { useLearner } from '../../../state/LearnerContext'
import { MODULE_IDS, type ModuleId } from '../../../state/learnerState'
import { isFinished } from './draft'
import { QuestionCard } from './QuestionCard'

export interface CheckNav {
  /** The question shown, for the Hint control (none once a question set is done). */
  question?: Question
  /** True when the strip's Next may move on (the current question is finished). */
  canNext: boolean
  /** Moves to the next question; false when every question is finished (the strip then moves to the next screen). */
  next: () => boolean
}

export function CheckRunner({
  checkId,
  lessonId,
  hintsUsedFor,
  onReview,
  onNav,
}: {
  checkId: string
  lessonId: string
  hintsUsedFor: (questionId: string) => number
  onReview: (screenId: string) => void
  onNav: (nav: CheckNav | null) => void
}) {
  const { learner, completeModule } = useLearner()
  const content = loadContent().content!
  const check = content.checks.checks.find((c) => c.id === checkId)!
  const questions = useMemo(() => check.questionIds.map((id) => content.checks.questions.find((q) => q.id === id)!), [check, content])
  const allowed = check.attemptsPerQuestion
  const finished = questions.map((q) => isFinished(q, learner.attempts, allowed))
  const firstOpen = finished.indexOf(false)
  const [index, setIndex] = useState(() => (firstOpen === -1 ? questions.length - 1 : firstOpen))
  const allFinished = finished.every(Boolean)
  const module = lessonId.toUpperCase() as ModuleId

  // Finishing the check completes the lesson (ID 9.1; C7's optional check completes C7 when finished).
  useEffect(() => {
    if (allFinished && MODULE_IDS.includes(module) && !learner.completedModules.includes(module)) completeModule(module)
  }, [allFinished, module, learner.completedModules, completeModule])

  const q = questions[index]
  const current = finished[index]
  useEffect(() => {
    onNav({
      question: q,
      canNext: current,
      next: () => {
        if (index < questions.length - 1) {
          setIndex(index + 1)
          return true
        }
        return false
      },
    })
  }, [q, current, index, questions.length, onNav])
  useEffect(() => () => onNav(null), [onNav])

  const c = lessonCopy.questions
  return (
    <div className="q-check">
      <p className="lesson-counter">{c.questionOf(index + 1, questions.length)}</p>
      <QuestionCard
        key={q.id}
        q={q}
        mode="check"
        attemptsAllowed={allowed}
        hintsUsed={hintsUsedFor(q.id)}
        onReview={onReview}
        label={lessonCopy.treeLabel(c.questionOf(index + 1, questions.length))}
        onContinue={index < questions.length - 1 ? () => setIndex(index + 1) : undefined}
        continueLabel={c.nextQuestion}
      />
    </div>
  )
}
