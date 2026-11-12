import { activityLabel } from '../content/screens'
import { SkeletonScreen } from '../components/SkeletonScreen'
import { MODULE_CONTENT } from '../modules/registry'
import { STEP_ACTIVITIES, type StepActivity } from '../modules/schema'
import type { Activity as ActivityName } from '../routes'
import type { ModuleId } from '../state/learnerState'
import { ModulePlayer } from '../ui/module/ModulePlayer'

const isStepActivity = (a: ActivityName): a is StepActivity => (STEP_ACTIVITIES as readonly string[]).includes(a)

/**
 * Explore, worked example, check or refresher (wireframes 1f, 1i). Modules with content play
 * their steps (add-modules-c2-c3); the rest stay skeletons until their change.
 */
export function Activity({ module, activity }: { module: ModuleId; activity: ActivityName }) {
  const content = MODULE_CONTENT[module]
  if (content !== undefined && isStepActivity(activity)) {
    // Keyed so the step index starts again in each activity.
    return <ModulePlayer key={`${module}-${activity}`} content={content} activity={activity} />
  }
  return <SkeletonScreen heading={activityLabel(module, activity)} />
}
