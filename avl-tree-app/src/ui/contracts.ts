// Component contracts (add-ui-foundation, design decision 5): one props type for every component the
// design index names in wireframe frames 1b to 1o, so both lanes build against the same shapes.
// - Built components: the contract IS the component's own props (re-exported, never redeclared).
// - Not built yet: an interface holding only what the frame shows, and a stub in src/ui/stubs/.
//   When a real component is built, it takes this interface, leaves STUBBED, and its stub is deleted;
//   tests/ui/contracts.test.tsx fails until it does. Widening a contract is a type change at every caller.
// Text props are strings the screen passes in from src/content/; no contract holds wording.
import type { ComponentProps, ReactNode } from 'react'
import type { ItemState, ReadinessReport } from '../assessment/report'
import type { GuidedStep } from '../assessment/scaffold'
import type { Tree } from '../engine/tree'
import type { Representation } from '../modules/schema'
import type { LearnerPath, LectureQuestion, ModuleId } from '../state/learnerState'
import type { ActivityList } from '../components/ActivityList'
import type { ConfirmDialog } from '../components/ConfirmDialog'
import type { ProgressMap } from '../components/ProgressMap'
import type { ResumeCard } from '../components/ResumeCard'
import type { SkillStatusList } from '../components/SkillStatusList'
import type { ScaffoldLadder } from './module/check/ScaffoldLadder'
import type { FeedbackPanel } from './practice/FeedbackPanel'
import type { InOrderStrip } from './practice/InOrderStrip'
import type { PredictionReveal } from './practice/PredictionReveal'
import type { PredictPrompt } from './practice/PredictPrompt'
import type { RotationMenu } from './practice/RotationMenu'
import type { PseudocodePanel } from './replay/PseudocodePanel'
import type { StepControls } from './replay/StepControls'
import type { StepExplanation } from './replay/StepExplanation'
import type { EventLog } from './sandbox/EventLog'
import type { InsertControl } from './sandbox/InsertControl'
import type { RebalanceSwitch } from './sandbox/RebalanceSwitch'
import type { TreeStats } from './sandbox/TreeStats'
import type { TreeView } from './tree/TreeView'
import type { QuestionItem } from './learn/QuestionItem'
import type { ConfidenceRating } from './learn/ConfidenceRating'
import type { FullAnswer } from './learn/FullAnswer'
import type { LectureQuestionDraft } from './learn/LectureQuestionDraft'

type Mastery = Exclude<ItemState, 'unassessed'>

// ---- Built (23): the components' own props ----
export type ResumeCardProps = ComponentProps<typeof ResumeCard>
export type ConfirmDialogProps = ComponentProps<typeof ConfirmDialog>
export type SkillStatusListProps = ComponentProps<typeof SkillStatusList>
export type ProgressMapProps = ComponentProps<typeof ProgressMap>
export type ActivityListProps = ComponentProps<typeof ActivityList>
export type TreeViewProps = ComponentProps<typeof TreeView>
export type StepControlsProps = ComponentProps<typeof StepControls>
export type PseudocodePanelProps = ComponentProps<typeof PseudocodePanel>
export type StepExplanationProps = ComponentProps<typeof StepExplanation>
export type PredictPromptProps = ComponentProps<typeof PredictPrompt>
export type PredictionRevealProps = ComponentProps<typeof PredictionReveal>
export type RotationMenuProps = ComponentProps<typeof RotationMenu>
export type InOrderStripProps = ComponentProps<typeof InOrderStrip>
export type FeedbackPanelProps = ComponentProps<typeof FeedbackPanel>
export type ScaffoldLadderProps = ComponentProps<typeof ScaffoldLadder>
export type InsertControlProps = ComponentProps<typeof InsertControl>
export type RebalanceSwitchProps = ComponentProps<typeof RebalanceSwitch>
export type TreeStatsProps = ComponentProps<typeof TreeStats>
export type EventLogProps = ComponentProps<typeof EventLog>
// revamp-question-and-feedback (D103): built in src/ui/learn/. FeedbackPanel above is still the practice
// rotation panel; the design's check panel is src/ui/learn/FeedbackPanel.tsx until the wiring change (D104).
export type QuestionItemProps = ComponentProps<typeof QuestionItem>
export type ConfidenceRatingProps = ComponentProps<typeof ConfidenceRating>
export type FullAnswerProps = ComponentProps<typeof FullAnswer>
export type LectureQuestionDraftProps = ComponentProps<typeof LectureQuestionDraft>

// ---- Not built yet (22): only what the frame shows ----

/** 1b: purpose, start or resume, and the hero diagram slot. */
export interface StartPanelProps {
  heading: string
  intro: string
  startLabel: string
  onStart: () => void
  /** The chain-versus-balanced hero diagram (a TreeView pair), passed in by the screen. */
  hero?: ReactNode
}
/** 1b: always visible on Start, not behind a link. */
export interface PrivacyNoticeProps {
  text: string
}
/** 1b: a deliberate two-step: the link opens a ConfirmDialog. */
export interface ResetProgressLinkProps {
  label: string
  onRequestReset: () => void
}
/** 1c: "Question 3 of 6" and the sub-skill steps, current one marked. */
export interface DiagnosticStepperProps {
  current: number
  total: number
  steps: readonly { id: string; label: string }[]
  currentStepId: string
}
/** 1d: secure or needs review per sub-skill, then the route recommendation. */
export interface DiagnosticResultProps {
  heading: string
  skills: readonly { id: string; label: string; state: Mastery }[]
  recommendation: ReactNode
}
/** 1d, after a check (D20, D28): recommend, and let the student choose. */
export interface RouteRecommendationProps {
  recommended: { label: string; onChoose: () => void }
  others: readonly { label: string; onChoose: () => void }[]
}
/** 1e: one module on the hub; done, current or upcoming. */
export interface UnitCardProps {
  module: ModuleId
  title: string
  status: 'done' | 'current' | 'upcoming'
  onOpen: () => void
  /** The soft prerequisite note (D20); never a lock. */
  note?: string
}
/** 1e: Guided path or Choose my own (D20), never locked. */
export interface PathModeToggleProps {
  mode: LearnerPath | 'own'
  onChange: (mode: LearnerPath | 'own') => void
}
/** 1e: the way into the sandbox. */
export interface SandboxCardProps {
  title: string
  text: string
  onOpen: () => void
}
/** 1e: the lecture questions gathered so far. */
export interface LectureQuestionsCardProps {
  questions: readonly LectureQuestion[]
  onOpen: () => void
}
/** 1f (D22): one primary representation per step; the rest are toggles. */
export interface RepresentationSwitcherProps {
  primary: Representation
  shown: readonly Representation[]
  onToggle: (representation: Representation) => void
}
/** 1h, 1m: what to do, in one line. */
export interface TaskPromptProps {
  text: string
}
/** 1h, 1m: the keys for the tree. */
export interface KeyboardHelpProps {
  heading: string
  keys: readonly { keys: string; action: string }[]
}
/** 1i to 1l: position and attempt markers, with no cross glyph (D27). */
export interface CheckHeaderProps {
  module: ModuleId
  current: number
  total: number
  attempt: number
  maxAttempts: number
}
/** 1k: the guided step-through, one step at a time. */
export interface GuidedStepThroughProps {
  steps: readonly GuidedStep[]
  step: number
  onStep: (step: number) => void
}
/** 1m: insert, rotations, undo and reset for the tree being edited. */
export interface TreeEditorToolbarProps {
  nextKey: number | null
  onInsert: () => void
  canUndo: boolean
  onUndo: () => void
  onReset: () => void
  disabled: boolean
}
/** 1m: the student's edits, in order. */
export interface EditLogProps {
  heading: string
  entries: readonly string[]
  emptyText: string
}
/** 1m: balance factors of the tree as the student edits it, from the engine. */
export interface LiveBalanceReadoutProps {
  tree: Tree
}
/** 1o: one row per outcome, from the readiness report. */
export interface OutcomeStatusTableProps {
  report: ReadinessReport
}
/** 1o: the outcomes answered with confidence but not yet right. */
export interface ConfidenceFlagsProps {
  outcomes: readonly string[]
}
/** 1o: the questions to bring to the lecture. */
export interface LectureQuestionsListProps {
  heading: string
  questions: readonly LectureQuestion[]
}
/** 1o: print, save and copy. */
export interface ExportActionsProps {
  onPrint: () => void
  onSave: () => void
  onCopy: () => void
  /** Export waits for the student's own question (D91). */
  disabled: boolean
}

export const BUILT = [
  'ResumeCard', 'ConfirmDialog', 'SkillStatusList', 'ProgressMap', 'ActivityList', 'TreeView', 'StepControls',
  'PseudocodePanel', 'StepExplanation', 'PredictPrompt', 'PredictionReveal', 'RotationMenu', 'InOrderStrip',
  'FeedbackPanel', 'ScaffoldLadder', 'InsertControl', 'RebalanceSwitch', 'TreeStats', 'EventLog',
  'QuestionItem', 'ConfidenceRating', 'FullAnswer', 'LectureQuestionDraft',
] as const

export const STUBBED = [
  'StartPanel', 'PrivacyNotice', 'ResetProgressLink', 'DiagnosticStepper',
  'DiagnosticResult', 'RouteRecommendation', 'UnitCard', 'PathModeToggle', 'SandboxCard', 'LectureQuestionsCard',
  'RepresentationSwitcher', 'TaskPrompt', 'KeyboardHelp', 'CheckHeader', 'GuidedStepThrough',
  'TreeEditorToolbar', 'EditLog', 'LiveBalanceReadout', 'OutcomeStatusTable',
  'ConfidenceFlags', 'LectureQuestionsList', 'ExportActions',
] as const

export type StubbedName = (typeof STUBBED)[number]

/** Every component the design index names in frames 1b to 1o. */
export const CONTRACT_NAMES = [...BUILT, ...STUBBED] as const
