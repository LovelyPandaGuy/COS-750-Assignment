// A step rendered to text with its facts, for the player and the validator.
import { conventionsWording } from '../content/modules/conventionsWording'
import { computeFacts, type StepFacts } from './facts'
import type { Step } from './schema'

export interface RenderedStep {
  heading: string
  paragraphs: string[]
  rule: string | null
  /** Accessible names of the step's drawings. */
  labels: string[]
  facts: StepFacts
}

export function renderStep(step: Step, seed = 0, facts: StepFacts = computeFacts(step, seed)): RenderedStep {
  const w = conventionsWording()
  return {
    heading: step.heading,
    paragraphs: step.text(facts, w),
    rule: step.rule ? step.rule(w, facts) : null,
    labels: (step.figures ?? []).map((f) => f.label),
    facts,
  }
}
