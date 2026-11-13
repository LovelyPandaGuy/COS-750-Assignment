import { diagnosticCopy } from '../content/diagnostic'
import type { SkillStatusView } from '../navigation/diagnostic'

/** One line per prerequisite skill: the skill, a symbol and the word Secure or Needs review (FR-DIA-02). No total. */
export function SkillStatusList({ statuses }: { statuses: readonly SkillStatusView[] }) {
  return (
    <ul className="skill-status" aria-label={diagnosticCopy.result.skillsLabel}>
      {statuses.map(({ skill, status }) => (
        <li key={skill} data-status={status}>
          <span aria-hidden="true">{status === 'secure' ? '✓' : '○'} </span>
          {diagnosticCopy.skills[skill]}: <strong>{status === 'secure' ? diagnosticCopy.status.secure : diagnosticCopy.status.needsReview}</strong>
        </li>
      ))}
    </ul>
  )
}
