// Routing from the C1 diagnostic (add-diagnostic-c1-and-routing, design decisions 4 and 5; FR-DIA-02,
// FR-DIA-03, D6). Pure: derived from stored attempts, nothing here reads or writes state.
import { DIAGNOSTIC } from '../content/questions/diagnostic'
import { DIAGNOSTIC_ROUTE_MIN } from '../modules/config'
import type { Attempt } from '../state/learnerState'

export type DiagnosticRoute = 'c2' | 'refresher'

/** The four prerequisite sub-skills, in the order the result lists them (FR-DIA-01). */
export const DIAGNOSTIC_SKILLS = ['bst-terminology', 'bst-insert', 'bst-search', 'tree-height'] as const
export type DiagnosticSkill = (typeof DIAGNOSTIC_SKILLS)[number]

/** Four or five of five correct goes to C2; fewer to the refresher first. Order does not matter. */
export function diagnosticRoute(results: readonly boolean[]): DiagnosticRoute {
  return results.filter(Boolean).length >= DIAGNOSTIC_ROUTE_MIN ? 'c2' : 'refresher'
}

const attemptsAt = (attempts: readonly Attempt[], id: string) => attempts.filter((a) => a.questionId === id)

export interface SkillStatusView {
  skill: DiagnosticSkill
  status: 'secure' | 'needs-review'
}

/** Secure when the latest attempt at every item of the skill is correct, so a right re-check shows secure. */
export function skillStatuses(attempts: readonly Attempt[]): SkillStatusView[] {
  return DIAGNOSTIC_SKILLS.map((skill) => {
    const items = DIAGNOSTIC.filter((i) => i.subSkill === skill)
    const secure = items.every((i) => {
      const mine = attemptsAt(attempts, i.id)
      return mine.length > 0 && mine[mine.length - 1].correct
    })
    return { skill, status: secure ? 'secure' : 'needs-review' }
  })
}

export type DiagnosticPhase =
  /** The five questions, `index` being the next unanswered. */
  | { name: 'questions'; index: number }
  /** The re-check of the weak skills' items, `index` being the next unanswered. */
  | { name: 'recheck'; itemIds: string[]; index: number }
  | { name: 'done' }

/** The route the first round gives, or null while it is unfinished. */
export function firstRoundRoute(attempts: readonly Attempt[]): DiagnosticRoute | null {
  const firsts = DIAGNOSTIC.map((i) => attemptsAt(attempts, i.id)[0])
  return firsts.some((a) => a === undefined) ? null : diagnosticRoute(firsts.map((a) => a.correct))
}

/** The items a student routed to the refresher is re-checked on: those of any skill missed first time. */
export function weakItemIds(attempts: readonly Attempt[]): string[] {
  const weak = new Set(DIAGNOSTIC.filter((i) => attemptsAt(attempts, i.id)[0]?.correct === false).map((i) => i.subSkill))
  return DIAGNOSTIC.filter((i) => weak.has(i.subSkill)).map((i) => i.id)
}

export function diagnosticPhase(attempts: readonly Attempt[]): DiagnosticPhase {
  const answered = DIAGNOSTIC.findIndex((i) => attemptsAt(attempts, i.id).length === 0)
  if (answered !== -1) return { name: 'questions', index: answered }
  if (firstRoundRoute(attempts) === 'c2') return { name: 'done' }
  const itemIds = weakItemIds(attempts)
  const index = itemIds.findIndex((id) => attemptsAt(attempts, id).length < 2)
  return index === -1 ? { name: 'done' } : { name: 'recheck', itemIds, index }
}
