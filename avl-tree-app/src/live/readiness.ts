// C9's readiness questions and report (lesson-c9; ID 7.2 C9, ID 9.1, 9.2, 10.4, readiness.json
// readyRule, rewards.json titles and overallTitle). Pure: computed from stored attempts, so the C9
// report screen and /readiness always agree.
import type { Attempt, LectureQuestion } from '../state/learnerState'
import type { Content, Question } from './types'

export type Verdict = 'ready' | 'revise'

export interface Title {
  rank: string
  title: string
  minShare: number
  band: string
  message: string
}

/** The rewards.json title for a share of criteria met: the highest with minShare at or below it. */
export function titleFor(share: number, content: Content): Title {
  const titles = [...((content.rewards as { titles: Title[] }).titles ?? [])].sort((a, b) => b.minShare - a.minShare)
  return titles.find((t) => share >= t.minShare) ?? titles[titles.length - 1]
}

const attemptsAt = (attempts: readonly Attempt[], id: string) => attempts.filter((a) => a.questionId === id)
const rightAt = (attempts: readonly Attempt[], id: string) => attemptsAt(attempts, id).some((a) => a.correct)

/** The readiness questions still to ask, in order: the first pass, then each missed one's return form once. */
export function readinessQueue(attempts: readonly Attempt[], content: Content): string[] {
  const r = content.readiness
  const first = r.questionIds.filter((id) => attemptsAt(attempts, id).length === 0)
  if (first.length > 0) return first
  const missed = r.questionIds
    .filter((id) => !attemptsAt(attempts, id)[0]?.correct)
    .map((id) => ({ id: r.returnIds[id], at: Date.parse(attemptsAt(attempts, id)[0]?.at ?? '') }))
    .sort((a, b) => a.at - b.at)
    .map((x) => x.id)
  return missed.filter((id) => id !== undefined && attemptsAt(attempts, id).length === 0)
}

export interface ObjectiveRow {
  outcome: string
  verdict: Verdict
  optional: boolean
  /** A wrong answer given as Sure, on any question of this objective (ID 9.2). */
  flagged: boolean
  /** The lesson that teaches it (ID 7.1), for the link back. */
  lesson: string
}

export interface ReadinessReport {
  rows: ObjectiveRow[]
  overall: Verdict
  share: number
  title: Title
  lectureQuestions: string[]
  listenFor: string[]
  done: boolean
}

const LESSON_OF: Record<string, string> = { LO1: 'c2', LO2: 'c3', LO3: 'c4', LO4: 'c5', LO5: 'c6', LO6: 'c8', LO7: 'c7' }

function allQuestions(content: Content): Question[] {
  return [
    ...content.checks.questions,
    ...content.readiness.questions,
    ...content.lessons.flatMap((l) => l.screens.flatMap((s) => [(s as { task?: Question }).task, (s as { transfer?: Question }).transfer].filter((q): q is Question => q !== undefined))),
  ]
}

export function readinessReport(attempts: readonly Attempt[], content: Content): ReadinessReport {
  const r = content.readiness
  const report = (content.lessons.find((l) => l.id === 'c9')?.screens.find((s) => s.type === 'report') as { report?: { perObjective: string[]; optionalObjectives: string[]; listenFor: string[] } } | undefined)?.report
  const perObjective = report?.perObjective ?? ['LO1', 'LO2', 'LO3', 'LO4', 'LO5', 'LO6', 'LO7']
  const optional = new Set(report?.optionalObjectives ?? ['LO7'])
  // Right first time or in its return form (readyRule).
  const met = (id: string) => rightAt(attempts, id) || (r.returnIds[id] !== undefined && rightAt(attempts, r.returnIds[id]))
  const own = (lo: string) => r.questionIds.filter((id) => r.objectiveOf[id] === lo)
  // The combined questions also count: the build towards LO5, the search towards LO3 (readyRule).
  const combined: Record<string, string[]> = { LO5: ['rdy-08'], LO3: ['rdy-09'] }
  const outcomeOf = new Map(allQuestions(content).map((q) => [q.id, q.outcomeId]))
  const rows = perObjective.map((lo): ObjectiveRow => {
    const ids = [...own(lo), ...(combined[lo] ?? [])]
    const ready = ids.length > 0 && ids.every(met)
    const flagged = attempts.some((a) => !a.correct && a.confidence === 'sure' && outcomeOf.get(a.questionId) === lo)
    return { outcome: lo, verdict: ready ? 'ready' : 'revise', optional: optional.has(lo), flagged, lesson: LESSON_OF[lo] }
  })
  const overall: Verdict = rows.every((row) => row.optional || row.verdict === 'ready') ? 'ready' : 'revise'
  const byId = new Map(r.questions.map((q) => [q.id, q]))
  let total = 0
  let metCount = 0
  for (const id of r.questionIds) {
    const n = byId.get(id)?.criteria.length ?? 0
    total += n
    if (met(id)) metCount += n
  }
  const share = total === 0 ? 0 : metCount / total
  return { rows, overall, share, title: titleFor(share, content), lectureQuestions: lectureQuestions(attempts, content), listenFor: report?.listenFor ?? [], done: readinessQueue(attempts, content).length === 0 }
}

/**
 * One lecture question (misconceptions.json lectureQuestion) for each misconception of a wrong answer
 * with no later right answer on a question of the same sub-skill, in the order first seen (ID 7.2).
 */
export function lectureQuestions(attempts: readonly Attempt[], content: Content): string[] {
  const skillOf = new Map(allQuestions(content).map((q) => [q.id, q.subSkill]))
  const text = new Map(content.misconceptions.map((m) => [m.id, m.lectureQuestion]))
  const out: string[] = []
  attempts.forEach((a, i) => {
    if (a.correct || a.misconceptionId === undefined) return
    const skill = skillOf.get(a.questionId)
    const putRight = attempts.slice(i + 1).some((b) => b.correct && skillOf.get(b.questionId) === skill)
    const q = text.get(a.misconceptionId)
    if (!putRight && q !== undefined && !out.includes(q)) out.push(q)
  })
  return out
}

/** The student's own questions (FR-RDY-02): lecture questions stored with the id `own`. */
export const ownQuestions = (stored: readonly LectureQuestion[]) => stored.filter((q) => q.questionId === 'own').map((q) => q.text)
