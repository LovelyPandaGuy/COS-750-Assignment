// A lesson's title (lesson-celebration "The lesson's title on its summary"; revamp-lesson-frame design 3,
// D169; ID 10.4, ID 9.3). Pure: from stored attempts. Null until every check question is finished (right,
// or every attempt used: D106, D111); then the rewards.json title for the share of criteria met, a question
// counting as met when either attempt was right.
import type { Attempt } from '../state/learnerState'
import { titleFor, type Title } from './readiness'
import type { Content } from './types'

export function lessonTitle(checkId: string, attempts: readonly Attempt[], content: Content): Title | null {
  const check = content.checks.checks.find((c) => c.id === checkId)
  if (check === undefined) return null
  let met = 0
  let all = 0
  for (const id of check.questionIds) {
    const q = content.checks.questions.find((x) => x.id === id)
    const tries = attempts.filter((a) => a.questionId === id)
    const right = tries.some((a) => a.correct)
    if (!right && tries.length < check.attemptsPerQuestion) return null
    const criteria = q?.criteria?.length ?? 1
    all += criteria
    if (right) met += criteria
  }
  return all === 0 ? null : titleFor(met / all, content)
}
