// The steps the player shows (add-checks-and-feedback, design decision 1). A Check activity gets one
// question step per bank item after its intro step; every other activity is the content's own steps.
import { checksFor } from '../assessment/session'
import { checkCopy } from '../content/check'
import { activityOf, stepsFor, type ModuleContent, type Step, type StepActivity } from './schema'

export function playerSteps(content: ModuleContent, activity: StepActivity): Step[] {
  const own = stepsFor(content, activity)
  if (activity !== 'check') return own
  const items = checksFor(content.id)
  return own.flatMap((step) =>
    step.event !== 'check'
      ? [step]
      : [
          step,
          ...items.map(
            (item, i): Step => ({
              id: `${content.id}-q-${item.id}`,
              event: 'check',
              heading: checkCopy.question(i + 1, items.length),
              primary: 'text',
              text: () => [],
              checkItem: item.id,
            }),
          ),
        ],
  )
}

export const isCheckStep = (step: Step): boolean => step.checkItem !== undefined && activityOf(step) === 'check'
