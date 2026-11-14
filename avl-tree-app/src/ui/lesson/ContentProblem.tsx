import { Link } from 'react-router-dom'
import { lessonCopy } from '../../content/lesson'
import { screenCopy } from '../../content/screens'
import type { Problem } from '../../live/types'
import { paths } from '../../routes'

const copy = lessonCopy.problems

/** Shown instead of a lesson when the content does not validate (live-content). */
export function ContentProblem({ problems }: { problems: readonly Problem[] }) {
  return (
    <div className="screen-stack lesson-problems">
      <h1 tabIndex={-1}>{copy.heading}</h1>
      <p>{copy.intro}</p>
      <ul>
        {problems.map((p, i) => (
          <li key={i}>
            <strong>{copy.item(p.file, p.id, p.field)}</strong>: {p.message}
          </li>
        ))}
      </ul>
      <Link className="screen-link" to={paths.hub()}>
        {screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
