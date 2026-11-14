// Stubs for the components not built yet (add-ui-foundation). See src/ui/contracts.ts.
import type { ComponentType } from 'react'
import type { StubbedName } from '../contracts'
import { DiagnosticStepper } from './DiagnosticStepper'
import { DiagnosticResult } from './DiagnosticResult'
import { RouteRecommendation } from './RouteRecommendation'
import { PathModeToggle } from './PathModeToggle'
import { RepresentationSwitcher } from './RepresentationSwitcher'
import { TaskPrompt } from './TaskPrompt'
import { CheckHeader } from './CheckHeader'
import { GuidedStepThrough } from './GuidedStepThrough'
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
  CheckHeader,
  GuidedStepThrough,
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
  CheckHeader,
  GuidedStepThrough,
  LiveBalanceReadout,
  SkillStatusList,
  PredictPrompt,
  PredictionReveal,
  ScaffoldLadder,
}
