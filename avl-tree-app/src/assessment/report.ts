// The C9 readiness report and the bring-to-the-lecture list (add-readiness-c9, design decisions 5
// and 6; FR-RDY-01, FR-RDY-02, D4, D8, D14). Pure: both are computed from the stored attempts and
// lecture questions, so the summary always matches what is stored.
import { CHECKS } from '../content/questions/checks'
import { MISCONCEPTIONS } from '../content/questions/misconceptions'
import { OUTCOMES } from '../content/questions/outcomes'
import { READINESS, lectureListText } from '../content/questions/readiness'
import { OUTCOME_TEXT, readinessCopy } from '../content/readiness'
import { OWN_LECTURE_QUESTION } from '../modules/config'
import type { Attempt, LectureQuestion, ModuleId } from '../state/learnerState'
import { LO_IDS, type LoId, type MisconceptionId, type OutcomeTag } from './ids'
import type { BankItem } from './types'

export type ItemState = 'secure' | 'developing' | 'not-yet' | 'unassessed'
export type Verdict = 'ready' | 'revise'

export interface OutcomeReport {
  outcome: LoId
  verdict: Verdict
  state: ItemState
  items: { itemId: string; state: ItemState }[]
  /** Wrong answers rated "sure", over the module checks and C9 (FR-ASM-05). */
  confidentErrors: number
  /** The worked examples to go back to (ID C9). */
  links: { module: ModuleId; activity: 'example' }[]
  /** False for LO8: shown, but never holds back the overall verdict (D4). */
  blocksReady: boolean
}

export interface ReadinessReport {
  outcomes: OutcomeReport[]
  overall: Verdict
}

export interface Banks {
  readiness: readonly BankItem[]
  checks: readonly BankItem[]
}

const DEFAULT_BANKS: Banks = { readiness: READINESS, checks: CHECKS }
/** Lowest first: an outcome takes the lowest state of its assessed items. */
const RANK: Record<Exclude<ItemState, 'unassessed'>, number> = { 'not-yet': 0, developing: 1, secure: 2 }

/** Attempts in time order; the stored order breaks ties. */
function inTimeOrder(attempts: readonly Attempt[]): Attempt[] {
  return attempts
    .map((a, n) => ({ a, n, t: Date.parse(a.at) }))
    .sort((x, y) => x.t - y.t || x.n - y.n)
    .map((x) => x.a)
}

/** D8 from the attempts on one item, oldest first. */
function itemState(mine: readonly Attempt[]): ItemState {
  const last = mine[mine.length - 1]
  if (last === undefined) return 'unassessed'
  if (!last.correct) return 'not-yet'
  const before = mine[mine.length - 2]
  return before !== undefined && !before.correct ? 'developing' : 'secure'
}

export function readinessReport(attempts: readonly Attempt[], banks: Banks = DEFAULT_BANKS): ReadinessReport {
  const ordered = inTimeOrder(attempts)
  const byItem = new Map<string, Attempt[]>()
  for (const a of ordered) byItem.set(a.questionId, [...(byItem.get(a.questionId) ?? []), a])
  const outcomeOf = new Map<string, OutcomeTag>([...banks.checks, ...banks.readiness].map((i) => [i.id, i.outcome]))

  const outcomes = LO_IDS.map((lo): OutcomeReport => {
    const mine = banks.readiness.filter((i) => i.outcome === lo)
    const items = mine.map((i) => ({ itemId: i.id, state: itemState(byItem.get(i.id) ?? []) }))
    const assessed = items.map((i) => i.state).filter((s): s is Exclude<ItemState, 'unassessed'> => s !== 'unassessed')
    const state: ItemState = assessed.length === 0 ? 'unassessed' : assessed.reduce((x, y) => (RANK[x] <= RANK[y] ? x : y))
    const verdict: Verdict = state === 'secure' || state === 'developing' ? 'ready' : 'revise'
    const confidentErrors = ordered.filter((a) => outcomeOf.get(a.questionId) === lo && !a.correct && a.confidence === 'sure').length
    // D4 lives in the content: the outcome whose own readiness item is optional never blocks.
    const blocksReady = !mine.some((i) => i.optional === true && i.combined !== true)
    const links = OUTCOMES[lo].modules.map((module) => ({ module, activity: 'example' as const }))
    return { outcome: lo, verdict, state, items, confidentErrors, links, blocksReady }
  })
  const overall: Verdict = outcomes.every((o) => !o.blocksReady || o.verdict === 'ready') ? 'ready' : 'revise'
  return { outcomes, overall }
}

export interface LectureList {
  /** One question per unresolved misconception, in the order each first appeared. */
  generated: { misconceptionId: MisconceptionId; text: string }[]
  /** Questions drafted at the retry cap (D81). */
  drafted: LectureQuestion[]
  /** The student's own questions (D14). */
  own: LectureQuestion[]
  /** C9 can finish only once the student has written one. */
  needsOwn: boolean
}

/**
 * A misconception is unresolved when a wrong attempt carries it and no later attempt on an item of
 * the same sub-skill is correct, judged from its latest wrong attempt (FR-RDY-02). Attempts on
 * items in neither bank are ignored.
 */
export function lectureList(attempts: readonly Attempt[], lectureQuestions: readonly LectureQuestion[], banks: Banks = DEFAULT_BANKS): LectureList {
  const subSkillOf = new Map<string, string>([...banks.checks, ...banks.readiness].map((i) => [i.id, i.subSkill]))
  const ordered = inTimeOrder(attempts).filter((a) => subSkillOf.has(a.questionId))

  const firstSeen = new Map<MisconceptionId, number>()
  const lastWrong = new Map<MisconceptionId, number>()
  ordered.forEach((a, n) => {
    if (a.correct || a.misconceptionId === undefined) return
    if (!firstSeen.has(a.misconceptionId)) firstSeen.set(a.misconceptionId, n)
    lastWrong.set(a.misconceptionId, n)
  })

  const generated = [...firstSeen.keys()]
    .filter((m) => {
      const n = lastWrong.get(m)!
      const skill = subSkillOf.get(ordered[n].questionId)
      return !ordered.slice(n + 1).some((b) => b.correct && subSkillOf.get(b.questionId) === skill)
    })
    .map((m) => ({ misconceptionId: m, text: lectureListText(MISCONCEPTIONS[m]?.label ?? m) }))

  const own = lectureQuestions.filter((q) => q.questionId === OWN_LECTURE_QUESTION)
  const drafted = lectureQuestions.filter((q) => q.questionId !== OWN_LECTURE_QUESTION)
  return { generated, drafted, own, needsOwn: own.length === 0 }
}

/** Plain text of the summary for save and copy (FR-RDY-03). No profile ID (NFR-05). */
export function summaryText(report: ReadinessReport, list: LectureList): string {
  const t = readinessCopy.text
  const word = (v: Verdict) => (v === 'ready' ? readinessCopy.states.ready : readinessCopy.states.revise)
  const rows = report.outcomes.map(
    (o) => `${o.outcome}: ${word(o.verdict)}. ${OUTCOME_TEXT[o.outcome]}${o.blocksReady ? '' : ` (${readinessCopy.optional})`}${o.confidentErrors > 0 ? ` (${readinessCopy.flag}.)` : ''}`,
  )
  const lecture = [...list.drafted.map((q) => q.text), ...list.generated.map((g) => g.text)]
  const bullets = (xs: readonly string[]) => (xs.length === 0 ? [t.none] : xs.map((x) => `- ${x}`))
  return [t.title, readinessCopy.overall(word(report.overall)), '', ...rows, '', t.lecture, ...bullets(lecture), '', t.own, ...bullets(list.own.map((q) => q.text))].join('\n')
}
