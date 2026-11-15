import { lessonCopy } from '../../content/lesson'
import type { Problem } from '../../live/types'
import { BackToLesson } from '../../components/BackToLesson'

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
      <BackToLesson />
    </div>
  )
}
