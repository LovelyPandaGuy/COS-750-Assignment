// The lesson outline, derived from the screens and the stored attempts (add-lesson-outline, design 1;
// ID 8.2, 8.3, D20, D154). Nothing here is stored: the outline and the check screens read the same
// attempts through the same functions, so they cannot disagree.
import { diagnosticResult } from '../../live/diagnostic'
import { readinessQueue } from '../../live/readiness'
import type { Content, Lesson, MerrillPhase } from '../../live/types'
import type { Attempt } from '../../state/learnerState'
import { isFinished } from './questions/draft'

type Screen = Lesson['screens'][number]

export interface OutlineEntry {
  index: number
  id: string
  title: string
}

export interface OutlineGroup {
  phase: MerrillPhase
  label: string
  entries: OutlineEntry[]
}

/** Consecutive screens with the same Merrill phase form one group, in lesson order; a phase can come back. */
export function outlineOf(screens: readonly Screen[], phaseWord: (phase: MerrillPhase) => string): OutlineGroup[] {
  const groups: OutlineGroup[] = []
  screens.forEach((s, index) => {
    const last = groups[groups.length - 1]
    const entry = { index, id: s.id, title: s.title }
    if (last !== undefined && last.phase === s.merrillPhase) last.entries.push(entry)
    else groups.push({ phase: s.merrillPhase, label: phaseWord(s.merrillPhase), entries: [entry] })
  })
  return groups
}

/**
 * Whether a check or question-set screen is finished, by the rule its runner uses for Next:
 * a check when every question is finished (CheckRunner), a question set when its queue is empty (QuestionSet).
 * Every other screen is never blocking.
 */
export function isScreenFinished(screen: Screen, attempts: readonly Attempt[], content: Content): boolean {
  const s = screen as Screen & { checkId?: string; questionSet?: string }
  if (s.type === 'check' && s.checkId !== undefined) {
    const check = content.checks.checks.find((c) => c.id === s.checkId)
    if (check === undefined) return true
    return check.questionIds.every((id) => {
      const q = content.checks.questions.find((x) => x.id === id)
      return q === undefined || isFinished(q, attempts, check.attemptsPerQuestion)
    })
  }
  if (s.type === 'question-set') {
    const answered = (id: string) => attempts.some((a) => a.questionId === id)
    if (s.questionSet === 'diagnostic') return content.diagnostic.questionIds.every(answered)
    if (s.questionSet === 'recheck') return diagnosticResult(attempts, content).recheck.every(answered)
    if (s.questionSet === 'readiness') return readinessQueue(attempts, content).length === 0
  }
  return true
}

/** The first check or question-set screen that is not finished, or -1 when there is none (or no content). */
export function firstBlockingIndex(screens: readonly Screen[], attempts: readonly Attempt[], content: Content | undefined): number {
  return screens.findIndex((s) => content !== undefined && (s.type === 'check' || s.type === 'question-set') && !isScreenFinished(s, attempts, content))
}

/** Back is always free; forward up to and including the blocking screen (ID 8.2, D20). */
export function isOpen(index: number, current: number, blocking: number): boolean {
  return index <= current || blocking === -1 || index <= blocking
}
