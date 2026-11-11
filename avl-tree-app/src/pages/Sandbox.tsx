import { screenCopy } from '../content/screens'
import { SkeletonScreen } from '../components/SkeletonScreen'

/** Wireframe 1n. Skeleton until the sandbox change. */
export function Sandbox() {
  return <SkeletonScreen heading={screenCopy.headings.sandbox} arrowBack />
}
