// Shared types for the readiness components (revamp-readiness, design decision 1). Results are given by
// the screen; nothing here works out readiness (D113).
import type { MasteryState } from '../base'

/** Ready or Revise per objective (ID 9.1, D113, proposal question 3). */
export type ReadinessStatus = 'ready' | 'revise'

/** One Bloom level: the level key (a chip level, or another such as evaluate) and its word. */
export interface LevelTag {
  level: string
  word: string
}

export interface ObjectiveRow {
  /** Objective ID, for example "LO2". */
  id: string
  name: string
  /** ID 5.1: one or more levels (LO3 has two). */
  levels: readonly LevelTag[]
  status: ReadinessStatus
  /** Change since the student's own earlier attempt, already worded; none shows nothing (question 7). */
  note?: string
  /** Secondary detail only; the wiring does not pass it (question 3). */
  mastery?: MasteryState
  /** LO7 (ID 5.1): never changes the headline. */
  optional?: boolean
  review: { href: string; label: string }
}

export interface StatusLabels {
  words: Record<ReadinessStatus, string>
  symbols: Record<ReadinessStatus, string>
  optional: string
}

export interface ColumnLabels {
  caption: string
  objective: string
  level: string
  status: string
  change: string
  review: string
}

export interface FlagItem {
  id: string
  text: string
  link: { href: string; label: string }
}

export interface QuestionItem {
  id: string
  text: string
  editable?: boolean
  removable?: boolean
}

export interface QuestionLabels {
  heading: string
  empty: string
  edit: string
  remove: string
  save: string
  cancel: string
  field: string
}

export interface ExportLabels {
  group: string
  print: string
  copy: string
  save: string
  copied: string
  saved: string
  fallback: string
  fallbackLabel: string
}

/** The headline: words and message only, so a rank letter or share cannot be passed (question 6). */
export interface Headline {
  status: ReadinessStatus
  heading: string
  line?: string
  title?: { words: string; message: string }
}
