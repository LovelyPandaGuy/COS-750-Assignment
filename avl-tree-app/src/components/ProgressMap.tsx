import { Link } from 'react-router-dom'
import { moduleLabel } from '../content/modules'
import { screenCopy } from '../content/screens'
import { mapStatuses } from '../progress'
import { paths } from '../routes'
import { MODULE_IDS, type ModuleId } from '../state/learnerState'

const copy = screenCopy.hub

/** The nine modules in order, each a link, never locked (wireframe 1e). Status is symbol, word and border. */
export function ProgressMap({ current, completed }: { current: ModuleId; completed: readonly ModuleId[] }) {
  const status = mapStatuses(current, completed)
  return (
    <nav aria-label={copy.mapLabel}>
      <ol className="progress-map">
        {MODULE_IDS.map((id) => (
          <li
            key={id}
            className="progress-item"
            data-status={status[id]}
            aria-current={status[id] === 'current' ? 'step' : undefined}
          >
            <Link className="progress-link" to={paths.module(id)}>
              <span className="progress-status">
                <span aria-hidden="true">{copy.status[status[id]].symbol}</span> {copy.status[status[id]].word}
              </span>
              <span>{moduleLabel(id)}</span>
              {id === 'C7' && <span className="progress-optional">{copy.optional}</span>}
            </Link>
          </li>
        ))}
        <li className="progress-item" data-status="summary">
          <Link className="progress-link" to={paths.readiness()}>
            {copy.summaryLink}
          </Link>
        </li>
      </ol>
    </nav>
  )
}
