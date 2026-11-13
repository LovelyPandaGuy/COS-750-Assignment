// Rules that connect the check bank to the learner's attempts (add-checks-and-feedback, D2 to D5).
// Pure: no React, no storage.
import { CHECKS } from '../content/questions/checks'
import { RETRY_CAP, REVIEW_AFTER_MISSES } from '../modules/config'
import type { Attempt, ModuleId } from '../state/learnerState'
import type { BankItem } from './types'

const attemptsAt = (attempts: readonly Attempt[], id: string) => attempts.filter((a) => a.questionId === id)

/** RETRY_CAP stored attempts at the item and none correct: the question is over (FR-SCA-03). */
export function capped(attempts: readonly Attempt[], itemId: string): boolean {
  const mine = attemptsAt(attempts, itemId)
  return mine.length >= RETRY_CAP && !mine.some((a) => a.correct)
}

/** Correct, or capped: the item no longer blocks its module (D20). */
export const finished = (attempts: readonly Attempt[], itemId: string): boolean => attemptsAt(attempts, itemId).some((a) => a.correct) || capped(attempts, itemId)

/** The bank items of a module's check, in bank order. C1 and C9 have none. */
export function checksFor(module: ModuleId): BankItem[] {
  return CHECKS.filter((i) => i.module === module)
}

/** The seed a learner sees an item with: the same on every visit, different across learners and items (D9). */
export function checkSeed(profileId: string, itemId: string): number {
  let h = 0x811c9dc5
  for (const ch of `${profileId}\u0000${itemId}`) {
    h ^= ch.codePointAt(0)!
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

/** A module completes when every one of its check items is finished: right, or at the retry cap (FR-LRN-05, FR-SCA-03, D20). C1 and C9 never do here. */
export function checkComplete(module: ModuleId, attempts: readonly Attempt[]): boolean {
  const items = checksFor(module)
  return items.length > 0 && items.every((i) => finished(attempts, i.id))
}

/** Required items whose earliest stored attempt was not correct. Optional items (C7, D4) never count. */
export function firstAttemptMisses(module: ModuleId, attempts: readonly Attempt[]): number {
  return checksFor(module).filter((i) => {
    if (i.optional === true) return false
    const first = attempts.find((a) => a.questionId === i.id)
    return first !== undefined && !first.correct
  }).length
}

/** True when the result says to look over the module again. */
export const needsReview = (module: ModuleId, attempts: readonly Attempt[]): boolean =>
  firstAttemptMisses(module, attempts) >= REVIEW_AFTER_MISSES
