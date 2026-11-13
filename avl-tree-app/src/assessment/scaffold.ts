// The scaffold ladder and the retry cap (add-scaffold-ladder-and-retry-cap; FR-SCA-02, FR-SCA-03, D21).
// Pure: derived from stored attempts and the bank; nothing here reads or writes state.
import { conventionsWording, type ConventionsWording } from '../content/modules/conventionsWording'
import { SCAFFOLDS } from '../content/questions/scaffolds'
import { variantSeed } from '../engine/generate'
import { LADDER_LEVELS, RETRY_CAP } from '../modules/config'
import type { Attempt } from '../state/learnerState'
import { instantiate } from './instantiate'
import type { BankItem, Instance } from './types'

export type LadderLevel = 0 | 1 | 2 | 3

const attemptsAt = (attempts: readonly Attempt[], id: string) => attempts.filter((a) => a.questionId === id)

/** Three marked attempts with none correct: the question is over (FR-SCA-03). */
export function capped(attempts: readonly Attempt[], itemId: string): boolean {
  const mine = attemptsAt(attempts, itemId)
  return mine.length >= RETRY_CAP && !mine.some((a) => a.correct)
}

/** Correct, or capped: the item no longer blocks its module (D20, assumed). */
export const finished = (attempts: readonly Attempt[], itemId: string): boolean =>
  attemptsAt(attempts, itemId).some((a) => a.correct) || capped(attempts, itemId)

/** The level shown: a wrong attempt opens the next level; a request can raise it (never lower). */
export function ladderLevel(wrongAttempts: number, requested: number): LadderLevel {
  return Math.min(LADDER_LEVELS, Math.max(wrongAttempts, requested)) as LadderLevel
}

/** Level 1: the misconception's hint, else the sub-skill's. */
export function hintFor(item: BankItem, inst: Instance, misconceptionId?: string, w: ConventionsWording = conventionsWording()): string {
  const fn = (misconceptionId !== undefined ? SCAFFOLDS.hints[misconceptionId] : undefined) ?? SCAFFOLDS.subSkillHints[item.subSkill]
  return fn(inst.facts, w)
}

/** Level 2: another variant of the same item, which the engine solves. */
export function workedExampleFor(item: BankItem, inst: Instance): Instance {
  let ex = instantiate(item, variantSeed(inst.seed, 7001), 0)
  for (let k = 1; k <= 10 && ex.signature === inst.signature; k++) ex = instantiate(item, variantSeed(inst.seed, 7001 + k), 0)
  return ex
}

/** Level 3: the explanation of the correct answer, a sentence per step. */
export function stepsOf(inst: Instance): string[] {
  return inst.correctExplanation.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)
}

/** The question recorded at the cap: the misconception's, else the sub-skill's. */
export function lectureQuestionFor(item: BankItem, inst: Instance, misconceptionId?: string, w: ConventionsWording = conventionsWording()): string {
  const fn = (misconceptionId !== undefined ? SCAFFOLDS.lecture[misconceptionId] : undefined) ?? SCAFFOLDS.subSkillLecture[item.subSkill]
  return fn(inst.facts, w)
}
