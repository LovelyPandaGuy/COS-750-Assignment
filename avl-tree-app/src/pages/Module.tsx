import '../ui/screens.css'
import { ActivityList } from '../components/ActivityList'
import { PrerequisiteNote } from '../components/PrerequisiteNote'
import { moduleLabel } from '../content/modules'
import { lessonById, loadContent } from '../live/load'
import { isLesson } from '../routes'
import type { ModuleId } from '../state/learnerState'
import { ContentProblem } from '../ui/lesson/ContentProblem'
import { LessonPlayer } from '../ui/lesson/LessonPlayer'
import { BackToLesson } from '../components/BackToLesson'

/**
 * A module's screen. C2 to C8: the lesson, played from its lesson file (module-hub "Module screen").
 * C1 and C9: the title, the soft prerequisite note (D20) and the activities.
 */
export function Module({ id }: { id: ModuleId }) {
  if (isLesson(id)) {
    const loaded = loadContent()
    if (loaded.problems.length > 0) return <ContentProblem problems={loaded.problems} />
    const lesson = lessonById(id.toLowerCase())
    if (lesson !== undefined) return <LessonPlayer key={lesson.id} lesson={lesson} note={<PrerequisiteNote module={id} />} />
  }
  return (
    <div className="screen-stack">
      <h1 tabIndex={-1}>{moduleLabel(id)}</h1>
      <PrerequisiteNote module={id} />
      <ActivityList module={id} />
      <BackToLesson />
    </div>
  )
}
