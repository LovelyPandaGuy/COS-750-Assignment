// C1's readiness questions: the per-skill result and the route (lesson-c1; ID 7.2 C1, ID 9.1).
// Pure: everything is read from the stored attempts and diagnostic.json.
import type { Attempt } from '../state/learnerState'
import { PREREQUISITES } from './outcomes'
import type { Content } from './types'

export type SkillStatus = 'secure' | 'needs-review'

export interface DiagnosticResult {
  skills: { questionId: string; name: string; status: SkillStatus }[]
  /** Right answers in the first round of five. */
  right: number
  /** Every first-round question is answered. */
  answered: boolean
  /** c2 with at least minCorrect right; the refresher otherwise (ID 7.2). */
  route: 'c2' | 'refresher'
  /** The return forms of the missed questions (the re-check after the refresher). */
  recheck: string[]
  /** Every re-check question is answered. */
  recheckDone: boolean
  /** C1 is complete: routed to C2, or the re-check is done. */
  complete: boolean
}

const firstOf = (attempts: readonly Attempt[], id: string) => attempts.find((a) => a.questionId === id)

export function diagnosticResult(attempts: readonly Attempt[], content: Content): DiagnosticResult {
  const d = content.diagnostic
  const route = d.route as { minCorrect: number }
  const byId = new Map(d.questions.map((q) => [q.id, q]))
  const firsts = d.questionIds.map((id) => firstOf(attempts, id))
  const right = firsts.filter((a) => a?.correct === true).length
  const answered = firsts.every((a) => a !== undefined)
  const missed = d.questionIds.filter((_id, i) => firsts[i]?.correct !== true)
  const recheck = missed.map((id) => d.recheckIds[id])
  const recheckDone = recheck.every((id) => firstOf(attempts, id) !== undefined)
  const skills = d.questionIds.map((id) => {
    const criterion = byId.get(id)?.criteria[0] ?? ''
    const secure = firstOf(attempts, id)?.correct === true || firstOf(attempts, d.recheckIds[id])?.correct === true
    return { questionId: id, name: PREREQUISITES[criterion] ?? criterion, status: (secure ? 'secure' : 'needs-review') as SkillStatus }
  })
  const toC2 = right >= route.minCorrect
  return { skills, right, answered, route: toC2 ? 'c2' : 'refresher', recheck, recheckDone, complete: answered && (toC2 || recheckDone) }
}
