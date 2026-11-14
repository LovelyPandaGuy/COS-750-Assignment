// The shapes of the files in src/live_content/ (ID 12.1, 12.3), as the loader reads them.
// Only the fields the app uses are typed closely; the validator checks every field (live-content).
import type { RawKey } from './keys'

/** An explicit tree for one no insertion can build (not a BST, or a result to judge): [key, left, right]. */
export type RawStructure = [RawKey, (RawStructure | null)?, (RawStructure | null)?]

export interface RawTree {
  insert?: RawKey[]
  structure?: RawStructure
  /** false gives a plain BST (ID 12.4 `rebalance`); default true. */
  rebalance?: boolean
}

export type MerrillPhase = 'problem' | 'activation' | 'demonstration' | 'application' | 'integration'

export type Representation = 'text' | 'static-diagram' | 'written-rule' | 'worked-example' | 'animated-tree' | 'interactive-task' | 'pseudocode'

export type ShowItem = 'height' | 'balanceFactor' | 'balanceFactor:root'

export type OperationName = 'search' | 'insert' | 'insert-sequence' | 'rotations' | 'delete'

export interface Operation {
  name: OperationName
  key?: RawKey
  keys?: RawKey[]
  steps?: { about: RawKey; dir: 'left' | 'right' }[]
  rebalance?: boolean
}

interface ScreenBase {
  id: string
  type: string
  gagneEvent: number | number[]
  merrillPhase: MerrillPhase
  representation: Representation
  title?: string
  text?: string
  caption?: string
  points?: string[]
  showRule?: string
  hint?: string
  show?: ShowItem[]
  tree?: RawTree
}

export interface ObjectivesScreen extends ScreenBase {
  type: 'objectives'
  objectives?: string[]
}
export interface RuleScreen extends ScreenBase {
  type: 'rule'
  chart?: 'cases'
}
export interface DiagramScreen extends ScreenBase {
  type: 'diagram'
  compareWith?: { tree: RawTree }
}
export interface WorkedExampleScreen extends ScreenBase {
  type: 'worked-example'
  steps: string[]
  order?: 'post-order'
}
export interface AnimationScreen extends ScreenBase {
  type: 'animation'
  tree: RawTree
  operation: Operation
  steps: string[]
  result?: string
  compareWith?: { tree: RawTree; operation?: Operation; steps?: string[] }
  roleSteps?: string[]
  inorderCheck?: boolean
  pseudocode?: 'search-loop' | 'search-recursive'
  pauseAt?: string
  guided?: { askNode?: boolean; askCase?: boolean }
}
export interface PseudocodeScreen extends ScreenBase {
  type: 'pseudocode'
  pseudocode: ('search-loop' | 'search-recursive')[]
}
export interface SummaryScreen extends ScreenBase {
  type: 'summary'
  format?: 'short-box'
  transfer?: Question
}
/** A screen the questions change makes interactive (predict, recall, task, practice, check …). */
export interface OtherScreen extends ScreenBase {
  type: 'predict' | 'recall' | 'task' | 'practice' | 'check' | 'intro' | 'info' | 'conventions' | 'settings' | 'question-set' | 'route' | 'report' | 'free-text' | 'certificate'
  task?: Question
  options?: string[]
  answer?: string
  answerFrom?: 'engine'
  reveal?: string
  operation?: Operation
  checkId?: string
  [field: string]: unknown
}

export type Screen = ObjectivesScreen | RuleScreen | DiagramScreen | WorkedExampleScreen | AnimationScreen | PseudocodeScreen | SummaryScreen | OtherScreen

export interface Lesson {
  id: string
  title: string
  outcomeIds: string[]
  estimatedMinutes: number
  checkId?: string
  optional?: boolean
  gagneFull?: boolean
  questionSet?: string
  refresher?: { id: string; title: string; screens: Screen[] }
  screens: Screen[]
}

export interface Option {
  id: string
  text: string
  misconceptionId?: string
  explanation: string
}

export interface Question {
  id: string
  set: string
  lessonId: string
  type: string
  outcomeId: string
  criteria: string[]
  subSkill: string
  level: string
  concept: string
  stem: string
  hint: string
  tree?: RawTree
  options?: Option[]
  correctOptionId?: string
  operation?: Operation
  target?: string
  targets?: { node: RawKey; quantity: 'bf' | 'height' }[]
  expected?: unknown
  wrongAnswers?: { misconceptionId?: string; [k: string]: unknown }[]
  [field: string]: unknown
}

export interface Check {
  id: string
  lessonId: string
  outcomeId: string
  optional: boolean
  questionIds: string[]
  reviewQuestionIds: Record<string, string[]>
  challengeId: string
  attemptsPerQuestion: number
  scoring: string
}

export interface Misconception {
  id: string
  description: string
  lessons: string[]
  appResponse: string
  lectureQuestion: string
}

export interface Scaffold {
  subSkill: string
  criterion: string
  concept: string
  workedExample: Record<string, unknown>
  stepThrough: Record<string, unknown>
}

/** All content, in manifest order. */
export interface Content {
  lessons: Lesson[]
  checks: { checks: Check[]; questions: Question[] }
  diagnostic: { questionIds: string[]; recheckIds: Record<string, string>; questions: Question[]; [k: string]: unknown }
  readiness: { questionIds: string[]; returnIds: Record<string, string>; objectiveOf: Record<string, string>; questions: Question[]; [k: string]: unknown }
  misconceptions: Misconception[]
  scaffolds: Scaffold[]
  rewards: Record<string, unknown>
  conventions: Record<string, unknown>
}

/** One content error: which file, which item and field, and a plain sentence (live-content). */
export interface Problem {
  file: string
  id?: string
  field?: string
  message: string
}
