// Component contracts (add-ui-foundation, design decision 5): one props type for every component the
// design index names in wireframe frames 1b to 1o, so both lanes build against the same shapes.
// - Built components: the contract IS the component's own props (re-exported, never redeclared).
// - Not built yet: an interface holding only what the frame shows, and a stub in src/ui/stubs/.
//   When a real component is built, it takes this interface, leaves STUBBED, and its stub is deleted;
//   tests/ui/contracts.test.tsx fails until it does. Widening a contract is a type change at every caller.
// Text props are strings the screen passes in from src/content/; no contract holds wording.
import type { ComponentProps, ReactNode } from 'react'
import type { Key, Tree } from '../engine/tree'
import type { SkillStatus } from '../live/diagnostic'
import type { Question, Representation, Scaffold } from '../live/types'
import type { LearnerPath, ModuleId } from '../state/learnerState'
import type { ActivityList } from './progress/ActivityList'
import type { OutcomeStatusTable } from './readiness/OutcomeStatusTable'
import type { ConfidenceFlags } from './readiness/ConfidenceFlags'
import type { LectureQuestionsList } from './readiness/LectureQuestionsList'
import type { ExportActions } from './readiness/ExportActions'
import type { StartPanel } from './progress/StartPanel'
import type { PrivacyNotice } from './progress/PrivacyNotice'
import type { ResetProgressLink } from './progress/ResetProgressLink'
import type { UnitCard } from './progress/UnitCard'
import type { SandboxCard } from './progress/SandboxCard'
import type { LectureQuestionsCard } from './progress/LectureQuestionsCard'
import type { ConfirmDialog } from '../components/ConfirmDialog'
import type { ProgressMap } from './progress/ProgressMap'
import type { ResumeCard } from './progress/ResumeCard'
import type { InOrderStrip } from './practice/InOrderStrip'
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
import type { FeedbackPanel } from './learn/FeedbackPanel'

// ---- Built (19): the components' own props ----
export type ResumeCardProps = ComponentProps<typeof ResumeCard>
export type ConfirmDialogProps = ComponentProps<typeof ConfirmDialog>
export type ProgressMapProps = ComponentProps<typeof ProgressMap>
export type ActivityListProps = ComponentProps<typeof ActivityList>
// revamp-progress-and-hub (D132): built in src/ui/progress/.
export type StartPanelProps = ComponentProps<typeof StartPanel>
export type PrivacyNoticeProps = ComponentProps<typeof PrivacyNotice>
export type ResetProgressLinkProps = ComponentProps<typeof ResetProgressLink>
export type UnitCardProps = ComponentProps<typeof UnitCard>
export type SandboxCardProps = ComponentProps<typeof SandboxCard>
export type LectureQuestionsCardProps = ComponentProps<typeof LectureQuestionsCard>
export type TreeViewProps = ComponentProps<typeof TreeView>
export type StepControlsProps = ComponentProps<typeof StepControls>
export type PseudocodePanelProps = ComponentProps<typeof PseudocodePanel>
export type StepExplanationProps = ComponentProps<typeof StepExplanation>
export type RotationMenuProps = ComponentProps<typeof RotationMenu>
export type InOrderStripProps = ComponentProps<typeof InOrderStrip>
export type InsertControlProps = ComponentProps<typeof InsertControl>
export type RebalanceSwitchProps = ComponentProps<typeof RebalanceSwitch>
export type TreeStatsProps = ComponentProps<typeof TreeStats>
export type EventLogProps = ComponentProps<typeof EventLog>
// revamp-question-and-feedback (D128): built in src/ui/learn/. FeedbackPanel is the design's check panel
// (src/ui/learn/FeedbackPanel.tsx); the old practice panel that D129 kept it apart from was removed with the
// old assessment layer at the merge with main (14 Nov).
export type QuestionItemProps = ComponentProps<typeof QuestionItem>
export type ConfidenceRatingProps = ComponentProps<typeof ConfidenceRating>
export type FullAnswerProps = ComponentProps<typeof FullAnswer>
export type LectureQuestionDraftProps = ComponentProps<typeof LectureQuestionDraft>
export type FeedbackPanelProps = ComponentProps<typeof FeedbackPanel>
// revamp-readiness (D138): built in src/ui/readiness/.
export type OutcomeStatusTableProps = ComponentProps<typeof OutcomeStatusTable>
export type ConfidenceFlagsProps = ComponentProps<typeof ConfidenceFlags>
export type LectureQuestionsListProps = ComponentProps<typeof LectureQuestionsList>
export type ExportActionsProps = ComponentProps<typeof ExportActions>

// ---- Not built yet (26): only what the frame shows ----
// SkillStatusList, PredictPrompt, PredictionReveal and ScaffoldLadder were built on the old assessment layer;
// the live content (D94 to D116) removed them, so they are stubs again on the src/live types.

/** 1d: one line per prerequisite skill, with its word (Secure or Needs review) and a symbol; no total. */
export interface SkillStatusListProps {
  statuses: readonly { id: string; label: string; status: SkillStatus }[]
}
/** 1f: the prediction asked before a replay; the replay starts only after onProceed. */
export interface PredictPromptProps {
  tree: Tree
  keyToInsert: Key
  onProceed: () => void
}
/** 1f: what the student predicted next to what happened, with a jump to the imbalance step. */
export interface PredictionRevealProps {
  tree: Tree
  keyToInsert: Key
  /** What the student locked in; null means they skipped, and nothing is shown. */
  choice: string | null
  onReplayStep: (stepIndex: number) => void
}
/** 1j, 1k: the support ladder, hint then worked example then guided step-through (D21). */
export interface ScaffoldLadderProps {
  /** Rungs open, 0 to 3. */
  level: number
  question: Question
  scaffold: Scaffold
  /** The retry cap is reached: every rung is open. */
  capped: boolean
  onOpenNext: () => void
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
  skills: readonly { id: string; label: string; status: SkillStatus }[]
  recommendation: ReactNode
}
/** 1d, after a check (D20, D28): recommend, and let the student choose. */
export interface RouteRecommendationProps {
  recommended: { label: string; onChoose: () => void }
  others: readonly { label: string; onChoose: () => void }[]
}
/** 1e: Guided path or Choose my own (D20), never locked. */
export interface PathModeToggleProps {
  mode: LearnerPath | 'own'
  onChange: (mode: LearnerPath | 'own') => void
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
/** 1h, 1m: the keys for the tree (built: src/ui/controls/, revamp-tree-controls). */
export type KeyboardHelpProps = ComponentProps<typeof KeyboardHelp>
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
  /** The step-through from the scaffold (`Scaffold.stepThrough`), one sentence per step. */
  steps: readonly string[]
  step: number
  onStep: (step: number) => void
}
/** 1m: place, undo, reset and delete for the tree being edited (built: src/ui/editor/, revamp-tree-editor). */
export type TreeEditorToolbarProps = ComponentProps<typeof TreeEditorToolbar>
/** 1m: the student's edits, in order (built: src/ui/editor/, revamp-tree-editor). */
export type EditLogProps = ComponentProps<typeof EditLog>
/** 1m: balance factors of the tree as the student edits it, from the engine. */
export interface LiveBalanceReadoutProps {
  tree: Tree
}

export const BUILT = [
  'ResumeCard', 'ConfirmDialog', 'ProgressMap', 'ActivityList', 'TreeView', 'StepControls', 'PseudocodePanel',
  'StepExplanation', 'RotationMenu', 'InOrderStrip', 'InsertControl', 'RebalanceSwitch', 'TreeStats', 'EventLog',
  'QuestionItem', 'ConfidenceRating', 'FullAnswer', 'LectureQuestionDraft', 'FeedbackPanel',
  'StartPanel', 'PrivacyNotice', 'ResetProgressLink', 'UnitCard', 'SandboxCard', 'LectureQuestionsCard',
  'OutcomeStatusTable', 'ConfidenceFlags', 'LectureQuestionsList', 'ExportActions',
] as const

export const STUBBED = [
  'DiagnosticStepper',
  'DiagnosticResult', 'RouteRecommendation', 'PathModeToggle',
  'RepresentationSwitcher', 'TaskPrompt', 'KeyboardHelp', 'CheckHeader', 'GuidedStepThrough',
  'TreeEditorToolbar', 'EditLog', 'LiveBalanceReadout', 'SkillStatusList', 'PredictPrompt', 'PredictionReveal',
  'ScaffoldLadder',
] as const

export type StubbedName = (typeof STUBBED)[number]

/** Every component the design index names in frames 1b to 1o. */
export const CONTRACT_NAMES = [...BUILT, ...STUBBED] as const
