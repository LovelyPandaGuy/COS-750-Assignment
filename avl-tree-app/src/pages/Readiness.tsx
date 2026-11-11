import { screenCopy } from '../content/screens'
import { SkeletonScreen } from '../components/SkeletonScreen'

/** Wireframe 1o, which also holds the lecture questions list. Skeleton until the readiness change. */
export function Readiness() {
  return <SkeletonScreen heading={screenCopy.headings.readiness} />
}
