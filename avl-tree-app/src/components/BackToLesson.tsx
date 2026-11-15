// "← Back to C3 The AVL property": the link back to the student's current lesson, replacing "Back to path"
// now that the path page is removed (remove-path-page, D159). Outside a learner session it points at C1.
import { Link } from 'react-router-dom'
import { moduleLabel } from '../content/modules'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import { useOptionalLearner } from '../state/LearnerContext'

export function BackToLesson() {
  const current = useOptionalLearner()?.learner.currentModule ?? 'C1'
  return (
    <Link className="screen-link" to={paths.module(current)}>
      {screenCopy.links.backToLesson(moduleLabel(current))}
    </Link>
  )
}
