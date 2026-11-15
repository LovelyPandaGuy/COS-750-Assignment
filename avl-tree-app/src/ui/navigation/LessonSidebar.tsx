// The Lessons sidebar on every screen (lesson-sidebar; revamp-navigation design 1 to 3, D155; ID 8.2 lesson
// list). C1 to C9 and nothing else, each a link (nothing is hard-locked, D20), its state in a word and a symbol.
// From the tablet breakpoint a sticky column; below, the same list behind a Lessons button (LessonMenu).
import './sidebar.css'
import { MODULE_TITLES } from '../../content/modules'
import { shellCopy } from '../../content/shell'
import type { ModuleId } from '../../state/learnerState'
import { MODULE_IDS } from '../../state/learnerState'
import { LessonLink } from '../progress/LessonLink'
import { LessonMenu } from '../progress/LessonMenu'
import type { LessonItem, StateLabels } from '../progress/types'

const copy = shellCopy.sidebar
const LABELS: StateLabels = { words: copy.words, symbols: copy.symbols, optional: copy.optional }

export interface LessonSidebarProps {
  completed: readonly ModuleId[]
  current: ModuleId
  /** The lesson whose screen is shown, if any. */
  viewing: ModuleId | null
  hrefOf: (id: ModuleId) => string
}

function lessonItems({ completed, current, viewing, hrefOf }: LessonSidebarProps): LessonItem[] {
  return MODULE_IDS.map((id) => ({
    id,
    title: MODULE_TITLES[id],
    state: completed.includes(id) ? 'done' : id === current ? 'current' : 'open',
    href: hrefOf(id),
    optional: id === 'C7',
    page: id === viewing,
  }))
}

export function LessonSidebar(props: LessonSidebarProps) {
  const lessons = lessonItems(props)
  return (
    <div className="lesson-sidebar">
      <div className="lesson-sidebar-menu">
        <LessonMenu buttonLabel={copy.menuButton} panelLabel={copy.menuPanel} lessons={lessons} labels={LABELS} />
      </div>
      <nav className="lesson-sidebar-column" aria-label={copy.label}>
        <ol className="lesson-sidebar-list">
          {lessons.map((lesson) => (
            <li key={lesson.id}>
              <LessonLink lesson={lesson} labels={LABELS} />
            </li>
          ))}
        </ol>
      </nav>
    </div>
  )
}
