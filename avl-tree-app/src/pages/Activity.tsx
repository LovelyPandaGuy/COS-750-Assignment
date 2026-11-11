import { activityLabel } from '../content/screens'
import { SkeletonScreen } from '../components/SkeletonScreen'
import type { Activity as ActivityName } from '../routes'
import type { ModuleId } from '../state/learnerState'

/** Explore, worked example, check or refresher (wireframes 1f, 1i). Skeleton until each has its change. */
export function Activity({ module, activity }: { module: ModuleId; activity: ActivityName }) {
  return <SkeletonScreen heading={activityLabel(module, activity)} />
}
