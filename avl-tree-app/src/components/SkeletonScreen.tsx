import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import '../ui/screens.css'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'

export interface SkeletonScreenProps {
  heading: string
  /** The sandbox draws its back link with an arrow (wireframe 1n). */
  arrowBack?: boolean
  children?: ReactNode
}

/** A screen that exists but has no content yet: heading, one line, a way back (FR-LRN-04). */
export function SkeletonScreen({ heading, arrowBack = false, children }: SkeletonScreenProps) {
  return (
    <div className="screen-stack">
      <h1 tabIndex={-1}>{heading}</h1>
      <p>{screenCopy.coming}</p>
      {children}
      <Link className="screen-link" to={paths.hub()}>
        {arrowBack ? screenCopy.links.backToPathSandbox : screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
