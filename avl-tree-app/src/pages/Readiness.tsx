import { Link } from 'react-router-dom'
import '../ui/lesson/lesson.css'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import { OwnQuestion, ReadinessReportView } from '../ui/lesson/c1c9'

/** /readiness: the same report as C9's report screen, from the stored attempts (lesson-c9; FR-RDY-01). */
export function Readiness() {
  return (
    <div className="screen-stack lesson">
      <h1 tabIndex={-1}>{screenCopy.headings.readiness}</h1>
      <ReadinessReportView level={2} />
      <OwnQuestion />
      <Link className="screen-link" to={paths.hub()}>
        {screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
