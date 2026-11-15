// Shared types for the progress components (revamp-progress-and-hub, design decision 1).
// The states are given by the screen; no component here decides whether a lesson is locked (D133).
import type { MasteryState } from '../base'

/** A lesson's place on the path: done, where the student is, open to enter, or not yet open. */
export type LessonState = 'done' | 'current' | 'open' | 'locked'

interface LessonBase {
  /** Module ID, for example "C4". */
  id: string
  title: string
  /** C7 (ID 7.2): shows the optional word. */
  optional?: boolean
  /** Shown as a separate MasteryBadge under a done lesson; done itself stays neutral ink. */
  mastery?: MasteryState
  /** The lesson whose screen is being viewed: marked aria-current="page" (lesson sidebar, D155). */
  page?: boolean
}

/** A lesson that can be entered has a link; a locked one has a reason in text instead (ID 8.2). */
export type LessonItem =
  | (LessonBase & { state: 'done' | 'current' | 'open'; href: string })
  | (LessonBase & { state: 'locked'; reason: string })

/** The words and text symbols for each state; never icon-only (D25). */
export interface StateLabels {
  words: Record<LessonState, string>
  symbols: Record<LessonState, string>
  optional: string
}

/** A phase of the current lesson on the hub (D96: lessons are screens grouped by phase). */
export type PhaseState = 'done' | 'next' | 'to-do'

export interface PhaseLabels {
  words: Record<PhaseState, string>
  symbols: Record<PhaseState, string>
}
