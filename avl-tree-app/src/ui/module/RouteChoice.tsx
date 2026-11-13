import { useEffect, useId, useRef } from 'react'
import { moduleLabel } from '../../content/modules'
import { navigationCopy } from '../../content/navigation'
import { emitRouteEvent } from '../../navigation/routeEvents'
import { MODULE_IDS, type ModuleId } from '../../state/learnerState'

export interface RouteChoiceProps {
  module: ModuleId
  recommended: ModuleId
  /** Called after `route_chosen` is emitted; the player navigates. */
  onChoose: (target: ModuleId) => void
}

/**
 * "Where next?" on the last step of a module's Check activity (D20). Suggests a route and lets the
 * student choose; Next in the control strip stays the third way on, to the path. Logs D28 events.
 */
export function RouteChoice({ module, recommended, onChoose }: RouteChoiceProps) {
  const headingId = useId()
  const logged = useRef(false)

  // Once per time the panel is shown; the ref keeps a re-run of the effect from logging twice.
  useEffect(() => {
    if (logged.current) return
    logged.current = true
    emitRouteEvent({ type: 'route_recommended', from: module, recommended, at: new Date().toISOString() })
  }, [module, recommended])

  // The forward module, and this module again; the recommendation marks one of them (D20).
  const forward = MODULE_IDS[MODULE_IDS.indexOf(module) + 1]
  const choose = (chosen: ModuleId) => {
    emitRouteEvent({ type: 'route_chosen', from: module, recommended, chosen, at: new Date().toISOString() })
    onChoose(chosen)
  }

  return (
    <section className="route-choice" aria-labelledby={headingId}>
      <h3 id={headingId}>{navigationCopy.whereNext}</h3>
      <p>{navigationCopy.intro}</p>
      <div className="route-choice-options">
        {forward !== undefined && (
          <button type="button" className="module-button module-button-secondary" onClick={() => choose(forward)}>
            {recommended === forward ? navigationCopy.suggested(moduleLabel(forward)) : navigationCopy.goTo(moduleLabel(forward))}
          </button>
        )}
        <button type="button" className="module-button module-button-secondary" onClick={() => choose(module)}>
          {recommended === module ? navigationCopy.suggested(navigationCopy.lookAgain(moduleLabel(module))) : navigationCopy.lookAgain(moduleLabel(module))}
        </button>
      </div>
    </section>
  )
}
