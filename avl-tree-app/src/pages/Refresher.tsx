import { Link } from 'react-router-dom'
import { MODULE_TITLES } from '../content/modules'
import { lessonCopy } from '../content/lesson'
import { lessonById, loadContent } from '../live/load'
import { paths } from '../routes'
import { ContentProblem } from '../ui/lesson/ContentProblem'
import { LessonPlayer } from '../ui/lesson/LessonPlayer'

/**
 * The BST refresher: the refresher screens of lessons/c1.json on the lesson player (bst-refresher). Its
 * last screen is the re-check of the missed skills (lesson-c1); the way on is C2.
 */
export function Refresher() {
  const loaded = loadContent()
  const c1 = lessonById('c1')
  if (loaded.problems.length > 0 || c1?.refresher === undefined) return <ContentProblem problems={loaded.problems} />
  return (
    <LessonPlayer
      lesson={c1}
      sequence={c1.refresher}
      finishTo={paths.module('C2')}
      endPanel={
        <section className="route-choice" aria-label={lessonCopy.c1.routeLabel}>
          <Link className="module-button module-button-secondary" to={paths.module('C2')}>
            {lessonCopy.c1.toC2(MODULE_TITLES.C2)}
          </Link>
        </section>
      }
    />
  )
}
