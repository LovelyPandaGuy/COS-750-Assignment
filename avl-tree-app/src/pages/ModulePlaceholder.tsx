import { useEffect, useRef } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { moduleLabel } from '../content/modules'
import { MODULE_IDS, type ModuleId } from '../state/learnerState'

/** Navigation state set by Start and Resume so the new screen takes focus (WCAG 2.4.3). */
export interface ModuleNavState {
  focusHeading?: boolean
}

/** Placeholder until the module screens exist: the D1 title only (SE §6.5). */
export function ModulePlaceholder() {
  const { moduleId } = useParams()
  const location = useLocation()
  const heading = useRef<HTMLHeadingElement>(null)
  const focusHeading = (location.state as ModuleNavState | null)?.focusHeading === true
  const known = (MODULE_IDS as readonly string[]).includes(moduleId ?? '')

  useEffect(() => {
    // Focus only after an in-app move, so a direct load keeps the skip link first.
    if (known && focusHeading) heading.current?.focus()
  }, [known, focusHeading, moduleId])

  if (!known) return <Navigate to="/" replace />
  return (
    <h1 ref={heading} tabIndex={-1}>
      {moduleLabel(moduleId as ModuleId)}
    </h1>
  )
}
