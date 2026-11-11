import { Link } from 'react-router-dom'
import { activityLabel, screenCopy } from '../content/screens'
import { ACTIVITIES_BY_MODULE, paths } from '../routes'
import type { ModuleId } from '../state/learnerState'

const copy = screenCopy.activity

/** A module's activities as links, in default order, each saying its place ("1 of 3"). */
export function ActivityList({ module }: { module: ModuleId }) {
  const list = ACTIVITIES_BY_MODULE[module]
  return (
    <ol className="activity-list" aria-label={copy.listLabel}>
      {list.map((activity, i) => (
        <li key={activity}>
          <Link className="screen-link" to={paths.activity(module, activity)}>
            {copy.place(activityLabel(module, activity), i + 1, list.length)}
          </Link>
        </li>
      ))}
    </ol>
  )
}
