// Stubs for the components not built yet (add-ui-foundation). See src/ui/contracts.ts.
import type { ComponentType } from 'react'
import type { StubbedName } from '../contracts'
import { DiagnosticStepper } from './DiagnosticStepper'
import { DiagnosticResult } from './DiagnosticResult'
import { RouteRecommendation } from './RouteRecommendation'
import { PathModeToggle } from './PathModeToggle'
import { RepresentationSwitcher } from './RepresentationSwitcher'
import { TaskPrompt } from './TaskPrompt'
import { KeyboardHelp } from './KeyboardHelp'
import { CheckHeader } from './CheckHeader'
import { GuidedStepThrough } from './GuidedStepThrough'
import { TreeEditorToolbar } from './TreeEditorToolbar'
import { EditLog } from './EditLog'
import { LiveBalanceReadout } from './LiveBalanceReadout'
import { SkillStatusList } from './SkillStatusList'
import { PredictPrompt } from './PredictPrompt'
import { PredictionReveal } from './PredictionReveal'
import { ScaffoldLadder } from './ScaffoldLadder'

export const STUBS: Record<StubbedName, ComponentType<never>> = {
  DiagnosticStepper,
  DiagnosticResult,
  RouteRecommendation,
  PathModeToggle,
  RepresentationSwitcher,
  TaskPrompt,
  KeyboardHelp,
  CheckHeader,
  GuidedStepThrough,
  TreeEditorToolbar,
  EditLog,
  LiveBalanceReadout,
  SkillStatusList,
  PredictPrompt,
  PredictionReveal,
  ScaffoldLadder,
}

export {
  DiagnosticStepper,
  DiagnosticResult,
  RouteRecommendation,
  PathModeToggle,
  RepresentationSwitcher,
  TaskPrompt,
  KeyboardHelp,
  CheckHeader,
  GuidedStepThrough,
  TreeEditorToolbar,
  EditLog,
  LiveBalanceReadout,
  SkillStatusList,
  PredictPrompt,
  PredictionReveal,
  ScaffoldLadder,
}
