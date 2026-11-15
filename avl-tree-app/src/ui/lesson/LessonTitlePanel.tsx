import { lessonCopy } from '../../content/lesson'
import { lessonTitle } from '../../live/lessonTitle'
import { loadContent } from '../../live/load'
import { useLearner } from '../../state/LearnerContext'

/** The lesson's title once its check is finished (lesson-celebration, D169; ID 10.4). Encouragement only. */
export function LessonTitlePanel({ checkId }: { checkId: string }) {
  const { learner } = useLearner()
  const content = loadContent().content
  const title = content === null ? null : lessonTitle(checkId, learner.attempts, content)
  if (title === null) return null
  return (
    <section className="lesson-title-panel" aria-labelledby={`${checkId}-title`}>
      <h3 id={`${checkId}-title`}>{lessonCopy.titleHeading}</h3>
      <p className="lesson-title-name">{title.title}</p>
      <p>{title.message}</p>
    </section>
  )
}

