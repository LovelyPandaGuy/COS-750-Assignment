// The readiness model (add-readiness-c9, design decision 2; FR-RDY-01, FR-RDY-02, D8, D14). Pure:
// everything is derived from stored attempts.
import { ALL_ITEMS } from '../content/questions/bank'
import { PRIMARY_ITEM, READINESS } from '../content/questions/readiness'
import { OUTCOME_TEXT, readinessCopy } from '../content/readiness'
import { RETRY_CAP } from '../modules/config'
import type { Attempt, LectureQuestion } from '../state/learnerState'
import { LO_IDS, type LoId } from './ids'
import { instantiate } from './instantiate'
import { lectureQuestionFor } from './scaffold'
import { checkSeed } from './session'

export type OutcomeState = 'ready' | 'revise' | 'not-tried'
export interface OutcomeStatus {
  outcome: LoId
  state: OutcomeState
}

const itemOf = (id: string) => ALL_ITEMS.find((i) => i.id === id)
const attemptsAt = (attempts: readonly Attempt[], id: string) => attempts.filter((a) => a.questionId === id)

/** Ready when the latest attempt at each tried sub-skill of the outcome is right; LO8 never tried reads not-tried (D4). */
export function outcomeStatus(attempts: readonly Attempt[]): OutcomeStatus[] {
  return LO_IDS.map((outcome) => {
    const skills = new Set(ALL_ITEMS.filter((i) => i.outcome === outcome).map((i) => i.subSkill))
    const latest = [...skills]
      .map((skill) => {
        const ids = new Set(ALL_ITEMS.filter((i) => i.subSkill === skill).map((i) => i.id))
        const mine = attempts.filter((a) => ids.has(a.questionId))
        return mine[mine.length - 1]
      })
      .filter((a) => a !== undefined)
    if (latest.length === 0) return { outcome, state: outcome === 'LO8' ? 'not-tried' : 'revise' }
    return { outcome, state: latest.every((a) => a.correct) ? 'ready' : 'revise' }
  })
}

/** Outcomes with a wrong answer given with confidence "sure" (FR-ASM-05). */
export function confidentErrors(attempts: readonly Attempt[]): Set<LoId> {
  const out = new Set<LoId>()
  for (const a of attempts) {
    const outcome = itemOf(a.questionId)?.outcome
    if (!a.correct && a.confidence === 'sure' && outcome !== undefined && outcome !== 'PRE') out.add(outcome)
  }
  return out
}

/** Recorded lecture questions, then one per misconception still unresolved at its item, without duplicates (FR-RDY-02). */
export function lectureList(attempts: readonly Attempt[], recorded: readonly LectureQuestion[], profileId: string): string[] {
  const out = new Set(recorded.map((q) => q.text))
  for (const item of ALL_ITEMS) {
    const mine = attemptsAt(attempts, item.id)
    mine.forEach((a, k) => {
      if (a.correct || a.misconceptionId === undefined || mine.slice(k + 1).some((b) => b.correct)) return
      out.add(lectureQuestionFor(item, instantiate(item, checkSeed(profileId, item.id), k), a.misconceptionId))
    })
  }
  return [...out]
}

export interface SummaryInput {
  statuses: readonly OutcomeStatus[]
  flags: ReadonlySet<LoId>
  lecture: readonly string[]
  own: readonly string[]
}

const stateWord = (s: OutcomeState) => (s === 'ready' ? readinessCopy.states.ready : s === 'revise' ? readinessCopy.states.revise : readinessCopy.states.notTried)

/** Plain text for save and copy (FR-RDY-03). No profile ID. */
export function summaryText({ statuses, flags, lecture, own }: SummaryInput): string {
  const t = readinessCopy.text
  const rows = statuses.map(
    ({ outcome, state }) => `${outcome}: ${stateWord(state)}. ${OUTCOME_TEXT[outcome]}${flags.has(outcome) ? ` (${readinessCopy.flag}.)` : ''}`,
  )
  const bullets = (xs: readonly string[]) => (xs.length === 0 ? [t.none] : xs.map((x) => `- ${x}`))
  return [t.title, '', ...rows, '', t.lecture, ...bullets(lecture), '', t.own, ...bullets(own)].join('\n')
}

/** Index, among the item's attempts, of the one that finished its first pass (right, or the cap); null while unfinished. */
export function firstPassEnd(attempts: readonly Attempt[], itemId: string): number | null {
  const mine = attemptsAt(attempts, itemId)
  const right = mine.slice(0, RETRY_CAP).findIndex((a) => a.correct)
  if (right >= 0) return right
  return mine.length >= RETRY_CAP ? RETRY_CAP - 1 : null
}

/** Every required C9 item is finished (LO8's is optional, D4). */
export const firstPassDone = (attempts: readonly Attempt[]): boolean =>
  READINESS.filter((i) => i.optional !== true).every((i) => firstPassEnd(attempts, i.id) !== null)

export interface RecycleItem {
  itemId: string
  /** Attempts at the item from this index on belong to the return question. */
  since: number
}

/** Outcomes not Ready at the end of the first pass bring their item back once (D14). Stable across reloads. */
export function recycleItems(attempts: readonly Attempt[]): RecycleItem[] {
  if (!firstPassDone(attempts)) return []
  const c9 = new Set(READINESS.map((i) => i.id))
  const seen = new Map<string, number>()
  const base = attempts.filter((a) => {
    if (!c9.has(a.questionId)) return true
    const k = seen.get(a.questionId) ?? 0
    seen.set(a.questionId, k + 1)
    const end = firstPassEnd(attempts, a.questionId)
    return end === null || k <= end
  })
  return outcomeStatus(base)
    .filter((s) => s.state === 'revise')
    .map(({ outcome }) => {
      const itemId = PRIMARY_ITEM[outcome]
      const end = firstPassEnd(attempts, itemId)
      return { itemId, since: end === null ? attemptsAt(base, itemId).length : end + 1 }
    })
}

const runFinished = (attempts: readonly Attempt[], { itemId, since }: RecycleItem) => {
  const run = attemptsAt(attempts, itemId).slice(since)
  return run.some((a) => a.correct) || run.length >= RETRY_CAP
}

/** C9 completes when the first pass is done and every return question is finished (D20). */
export const readinessComplete = (attempts: readonly Attempt[]): boolean =>
  firstPassDone(attempts) && recycleItems(attempts).every((r) => runFinished(attempts, r))
