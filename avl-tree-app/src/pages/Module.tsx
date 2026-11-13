import { Link } from 'react-router-dom'
import '../ui/screens.css'
import { ActivityList } from '../components/ActivityList'
import { PrerequisiteNote } from '../components/PrerequisiteNote'
import { moduleLabel } from '../content/modules'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import type { ModuleId } from '../state/learnerState'

/** A module's screen: its D1 title, the soft prerequisite note (D20) and its activities. No learning content. */
export function Module({ id }: { id: ModuleId }) {
  return (
    <div className="screen-stack">
      <h1 tabIndex={-1}>{moduleLabel(id)}</h1>
      <PrerequisiteNote module={id} />
      <ActivityList module={id} />
      <Link className="screen-link" to={paths.hub()}>
        {screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
