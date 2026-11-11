import { useId } from 'react'
import { Link } from 'react-router-dom'
import '../ui/start.css'
import '../ui/screens.css'
import { ActivityList } from '../components/ActivityList'
import { ProgressMap } from '../components/ProgressMap'
import { moduleLabel } from '../content/modules'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'

const copy = screenCopy.hub

/** Screen 3, "Your path" (wireframe 1e): the progress map, the current module and the sandbox. */
export function Hub() {
  const { learner } = useLearner()
  const current = learner.currentModule
  const cardId = useId()
  const sandboxId = useId()
  return (
    <div className="screen-stack">
      <h1 tabIndex={-1}>{copy.heading}</h1>
      <ProgressMap current={current} completed={learner.completedModules} />
      <section className="screen-card" aria-labelledby={cardId}>
        <h2 id={cardId}>{moduleLabel(current)}</h2>
        <ActivityList module={current} />
        <Link className="button-primary" to={paths.module(current)}>
          {copy.continue(moduleLabel(current))}
        </Link>
      </section>
      <section className="screen-card" aria-labelledby={sandboxId}>
        <h2 id={sandboxId}>{copy.sandboxHeading}</h2>
        <p>{copy.sandboxText}</p>
        <Link className="screen-link" to={paths.sandbox()}>
          {copy.sandboxLink}
        </Link>
      </section>
    </div>
  )
}
