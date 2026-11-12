// Attempt policy and record (add-question-model-and-bank, design decision 7; D9, D21). The numbers
// live in src/modules/config.ts only.
import { PRACTICE_HINTS, RETRY_CAP } from '../modules/config'
import type { Attempt, Confidence } from '../state/learnerState'
import type { Instance, Mark, Response } from './types'

export type AttemptContext = 'check' | 'practice'

export type AttemptPolicy =
  /** Checks: capped attempts, hints from the scaffold ladder (change 21). */
  | { retryCap: number; hints: 'ladder' }
  /** Practice: unlimited retries, a fixed number of hints, then review is offered. */
  | { retryCap: null; hints: number; afterHints: 'offer-review' }

export function attemptPolicy(context: AttemptContext): AttemptPolicy {
  return context === 'check'
    ? { retryCap: RETRY_CAP, hints: 'ladder' }
    : { retryCap: null, hints: PRACTICE_HINTS, afterHints: 'offer-review' }
}

export interface AttemptMeta {
  hintsUsed: number
  confidence?: Confidence
  /** ISO time of the answer. */
  at: string
}

/** The learner-storage record of one marked answer, or null when the input was unreadable. */
export function attemptRecord(inst: Instance, response: Response, mark: Mark, meta: AttemptMeta): Attempt | null {
  if (mark.status === 'unreadable') return null
  const answer = 'choice' in response ? response.choice : 'number' in response ? response.number : response.tree
  const record: Attempt = { questionId: inst.itemId, at: meta.at, answer, correct: mark.status === 'correct', hintsUsed: meta.hintsUsed }
  if (meta.confidence !== undefined) record.confidence = meta.confidence
  if (mark.misconceptionId !== undefined) record.misconceptionId = mark.misconceptionId
  return record
}
