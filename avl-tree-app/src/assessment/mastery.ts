// Mastery per sub-skill (add-scaffold-ladder-and-retry-cap, design decision 4; FR-SCA-01, D8). Pure.
import { CHECKS } from '../content/questions/checks'
import { MASTERY_CORRECT, MASTERY_WINDOW } from '../modules/config'
import type { Attempt, SubSkillStatus } from '../state/learnerState'
import type { BankItem } from './types'

/**
 * The status from the last MASTERY_WINDOW attempts at the sub-skill's items, in stored order:
 * secure when MASTERY_CORRECT of them (or all, with fewer attempts) are right, developing when at
 * least one is, not yet otherwise. No attempts, no status.
 */
export function subSkillStatus(attempts: readonly Attempt[], subSkill: string, items: readonly BankItem[] = CHECKS): SubSkillStatus | null {
  const ids = new Set(items.filter((i) => i.subSkill === subSkill).map((i) => i.id))
  const recent = attempts.filter((a) => ids.has(a.questionId)).slice(-MASTERY_WINDOW)
  if (recent.length === 0) return null
  const right = recent.filter((a) => a.correct).length
  if (right >= Math.min(MASTERY_CORRECT, recent.length)) return 'secure'
  return right > 0 ? 'developing' : 'not-yet'
}
