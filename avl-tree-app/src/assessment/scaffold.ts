// The scaffold ladder and the retry cap for a check question (add-scaffold-ladder-and-retry-cap;
// FR-SCA-02, FR-SCA-03, FR-ASM-07, D9, D21). Pure, no React: change 20 drives it with useReducer.
// The session holds only IDs and numbers; each instance is rebuilt from the item, the seed and the
// attempt, which the question model makes deterministic.
import { conventionsWording, type ConventionsWording } from '../content/modules/conventionsWording'
import { MISCONCEPTIONS } from '../content/questions/misconceptions'
import { GENERAL_HINTS, HINTS, lectureQuestionText, type HintEntry } from '../content/questions/scaffolds'
import { variantSeed } from '../engine/generate'
import type { TraceStep } from '../engine/trace'
import { RETRY_CAP, SCAFFOLD_LADDER } from '../modules/config'
import type { Attempt, Confidence, LectureQuestion } from '../state/learnerState'
import { attemptRecord } from './attempt'
import type { MisconceptionId } from './ids'
import { instantiate } from './instantiate'
import { mark } from './mark'
import type { BankItem, Instance, Mark, Response } from './types'

export type Rung = (typeof SCAFFOLD_LADDER)[number]

export interface CheckSession {
  itemId: string
  seed: number
  /** The attempt the student is on, from 0. A capped session stays on its last attempt. */
  attempt: number
  /** How many rungs of SCAFFOLD_LADDER are open; they are always its first `rungs`. */
  rungs: number
  /** Misconception of the latest wrong answer, if the mark named one. */
  lastMisconception?: MisconceptionId
  outcome: 'open' | 'correct' | 'capped'
  /** Drafted at the cap. */
  lectureQuestion?: LectureQuestion
}

export type CheckAction =
  | { type: 'answer'; response: Response; at: string; confidence?: Confidence }
  | { type: 'help' }

export interface CheckStepResult {
  session: CheckSession
  /** Present when an answer was marked, including an unreadable one. */
  mark?: Mark
  /** The learner-storage record of a readable answer. */
  attempt?: Attempt
}

export interface ScaffoldOptions {
  wording?: ConventionsWording
  hints?: Record<MisconceptionId, HintEntry>
  generalHints?: Record<string, HintEntry>
}

export interface WorkedExample {
  instance: Instance
  answer: Instance['answer']
  explanation: string
}

export type GuidedStep = { kind: 'trace'; step: TraceStep } | { kind: 'text'; text: string }

export type OpenScaffold =
  | { rung: 'hint'; text: string }
  | { rung: 'worked-example'; example: WorkedExample }
  | { rung: 'guided'; steps: GuidedStep[] }

/** Keeps the worked example's seeds apart from the attempts' variant seeds. */
const WORKED_EXAMPLE_SALT = 0x3c6ef372
/** Seeds tried for a worked example whose problem differs from every attempt's. */
const WORKED_EXAMPLE_TRIES = 50
const TOP = SCAFFOLD_LADDER.length

export function startCheck(item: BankItem, seed: number): CheckSession {
  return { itemId: item.id, seed, attempt: 0, rungs: 0, outcome: 'open' }
}

export function currentInstance(item: BankItem, session: CheckSession, options: ScaffoldOptions = {}): Instance {
  return instantiate(item, session.seed, session.attempt, { wording: options.wording })
}

export function openRungs(session: CheckSession): Rung[] {
  return SCAFFOLD_LADDER.slice(0, session.rungs)
}

/** A closed session (correct or capped) lets the student move on. */
export function canContinue(session: CheckSession): boolean {
  return session.outcome !== 'open'
}

function draftLectureQuestion(item: BankItem, inst: Instance, misconception: MisconceptionId | undefined, at: string): LectureQuestion {
  const label = misconception !== undefined ? MISCONCEPTIONS[misconception]?.label : undefined
  const question: LectureQuestion = { questionId: item.id, module: item.module, at, text: lectureQuestionText(label, inst.stem) }
  if (misconception !== undefined) question.misconceptionId = misconception
  return question
}

export function checkStep(item: BankItem, session: CheckSession, action: CheckAction, options: ScaffoldOptions = {}): CheckStepResult {
  if (session.outcome !== 'open') return { session }
  if (action.type === 'help') {
    return session.rungs >= TOP ? { session } : { session: { ...session, rungs: session.rungs + 1 } }
  }

  const inst = currentInstance(item, session, options)
  const m = mark(inst, action.response)
  if (m.status === 'unreadable') return { session, mark: m }

  const meta = { hintsUsed: session.rungs, at: action.at, ...(action.confidence !== undefined ? { confidence: action.confidence } : {}) }
  const attempt = attemptRecord(inst, action.response, m, meta) ?? undefined
  if (m.status === 'correct') return { session: { ...session, outcome: 'correct' }, mark: m, attempt }

  // The latest wrong answer decides the hint: keep its misconception, or clear the previous one.
  const next: CheckSession = { ...session }
  if (m.misconceptionId !== undefined) next.lastMisconception = m.misconceptionId
  else delete next.lastMisconception
  if (session.attempt + 1 >= RETRY_CAP) {
    const lectureQuestion = draftLectureQuestion(item, inst, m.misconceptionId, action.at)
    return { session: { ...next, outcome: 'capped', rungs: TOP, lectureQuestion }, mark: m, attempt }
  }
  return { session: { ...next, attempt: session.attempt + 1, rungs: Math.min(session.rungs + 1, TOP) }, mark: m, attempt }
}

/** The hint for the latest misconception, or the sub-skill's general hint, for the current problem. */
export function hintFor(item: BankItem, session: CheckSession, options: ScaffoldOptions = {}): string {
  const hints = options.hints ?? HINTS
  const general = options.generalHints ?? GENERAL_HINTS
  const entry = (session.lastMisconception !== undefined ? hints[session.lastMisconception] : undefined) ?? general[item.subSkill]
  if (entry === undefined) return ''
  return entry.text(currentInstance(item, session, options).facts, options.wording ?? conventionsWording())
}

/** A solved sibling problem of the same item, different from every attempt the session can reach. */
export function workedExample(item: BankItem, seed: number, options: ScaffoldOptions = {}): WorkedExample {
  const taken = new Set<string>()
  for (let a = 0; a < RETRY_CAP; a++) taken.add(instantiate(item, seed, a).signature)
  for (let k = 0; k < WORKED_EXAMPLE_TRIES; k++) {
    const instance = instantiate(item, variantSeed(seed, WORKED_EXAMPLE_SALT + k), 0, { wording: options.wording })
    if (!taken.has(instance.signature)) {
      return { instance, answer: instance.answer, explanation: instance.correctExplanation }
    }
  }
  throw new RangeError(`no worked example for ${item.id} seed ${seed} differs from its attempts`)
}

/** Sentences of a text, split after ., ? or ! and whitespace. Joining with single spaces gives the text back. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).filter((s) => s !== '')
}

/** The current (or, once capped, the last) problem in steps: the trace for tree items, else the explanation. */
export function guidedSteps(item: BankItem, session: CheckSession, options: ScaffoldOptions = {}): GuidedStep[] {
  const inst = currentInstance(item, session, options)
  if (inst.trace !== undefined) return inst.trace.map((step) => ({ kind: 'trace', step }))
  return sentences(inst.correctExplanation).map((text) => ({ kind: 'text', text }))
}

/** One entry per open rung, in ladder order. */
export function scaffolds(item: BankItem, session: CheckSession, options: ScaffoldOptions = {}): OpenScaffold[] {
  return openRungs(session).map((rung): OpenScaffold => {
    switch (rung) {
      case 'hint':
        return { rung, text: hintFor(item, session, options) }
      case 'worked-example':
        return { rung, example: workedExample(item, session.seed, options) }
      case 'guided':
        return { rung, steps: guidedSteps(item, session, options) }
    }
  })
}
