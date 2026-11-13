import { Link } from 'react-router-dom'
import { moduleLabel } from '../content/modules'
import { navigationCopy } from '../content/navigation'
import { entryPolicy } from '../navigation/policy'
import { paths } from '../routes'
import type { ModuleId } from '../state/learnerState'
import { useLearner } from '../state/LearnerContext'

/**
 * The soft prerequisite note on a module screen (D20). Shown only when the entry policy names a
 * prerequisite; it never blocks the module's activities.
 */
export function PrerequisiteNote({ module }: { module: ModuleId }) {
  const { learner } = useLearner()
  const { prerequisite } = entryPolicy(module, learner)
  if (prerequisite === null) return null
  const label = moduleLabel(prerequisite)
  return (
    <div role="note" className="prerequisite-note">
      <p>
        <span aria-hidden="true">ℹ </span>
        {navigationCopy.note(label)}
      </p>
      <Link className="screen-link" to={paths.module(prerequisite)}>
        {navigationCopy.noteLink(label)}
      </Link>
    </div>
  )
}
