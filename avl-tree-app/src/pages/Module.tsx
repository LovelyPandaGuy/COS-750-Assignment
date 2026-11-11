import { Link } from 'react-router-dom'
import '../ui/screens.css'
import { ActivityList } from '../components/ActivityList'
import { moduleLabel } from '../content/modules'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import type { ModuleId } from '../state/learnerState'

/** A module's screen: its D1 title and its activities. No learning content yet. */
export function Module({ id }: { id: ModuleId }) {
  return (
    <div className="screen-stack">
      <h1 tabIndex={-1}>{moduleLabel(id)}</h1>
      <ActivityList module={id} />
      <Link className="screen-link" to={paths.hub()}>
        {screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
