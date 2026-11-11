import { screenCopy } from '../content/screens'
import { SkeletonScreen } from '../components/SkeletonScreen'

/** Wireframe 1c, the diagnostic question screen. Skeleton until the diagnostic change. */
export function WarmUpCheck() {
  return <SkeletonScreen heading={screenCopy.activity.warmUpCheck} />
}
