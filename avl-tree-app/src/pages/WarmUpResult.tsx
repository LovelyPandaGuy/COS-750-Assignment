import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MODULE_TITLES } from '../content/modules'
import { diagnosticCopy } from '../content/diagnostic'
import { navigationCopy } from '../content/navigation'
import { screenCopy } from '../content/screens'
import { SkillStatusList } from '../components/SkillStatusList'
import { diagnosticPhase, firstRoundRoute, skillStatuses } from '../navigation/diagnostic'
import { emitRouteEvent, type RouteTarget } from '../navigation/routeEvents'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'

/**
 * Wireframe 1d: a status for each prerequisite skill, no total, and the way on (FR-DIA-02, FR-DIA-03).
 * It recommends C2 or the refresher and lets the student choose; the refresher is always linked (FR-DIA-04).
 */
export function WarmUpResult() {
  const { learner } = useLearner()
  const taken = firstRoundRoute(learner.attempts) !== null
  const phase = diagnosticPhase(learner.attempts)
  // C2 when four or five were right, or once the re-check is finished; otherwise the refresher (as C1).
  const recommended: RouteTarget = !taken || firstRoundRoute(learner.attempts) === 'c2' || phase.name === 'done' ? 'C2' : 'C1'
  const recheck = taken && phase.name === 'recheck'
  const logged = useRef(false)

  useEffect(() => {
    if (!taken || logged.current) return
    logged.current = true
    emitRouteEvent({ type: 'route_recommended', from: 'C1', recommended, at: new Date().toISOString() })
  }, [taken, recommended])

  const choose = (chosen: RouteTarget) => () => {
    if (taken) emitRouteEvent({ type: 'route_chosen', from: 'C1', recommended, chosen, at: new Date().toISOString() })
  }
  const word = (label: string, suggested: boolean) => (suggested ? navigationCopy.suggested(label) : label)
  const c2Label = `${diagnosticCopy.refresher.toC2} ${MODULE_TITLES.C2}`

  return (
    <div className="screen-stack">
      <h1 tabIndex={-1}>{screenCopy.headings.warmUpResult}</h1>
      {taken ? (
        <>
          <p>{diagnosticCopy.result.intro}</p>
          <SkillStatusList statuses={skillStatuses(learner.attempts)} />
          <p>{recommended === 'C2' ? diagnosticCopy.result.secureNote : diagnosticCopy.result.reviewNote}</p>
        </>
      ) : (
        <p>{diagnosticCopy.result.notTaken}</p>
      )}
      <nav className="route-choice" aria-label={diagnosticCopy.result.routeLabel}>
        {!taken && (
          <Link className="screen-link" to={paths.activity('C1', 'check')}>
            {diagnosticCopy.result.takeIt}
          </Link>
        )}
        <Link className="screen-link" to={paths.module('C2')} onClick={choose('C2')}>
          {word(c2Label, taken && recommended === 'C2')}
        </Link>
        <Link className="screen-link" to={paths.activity('C1', 'refresher')} onClick={choose('C1')}>
          {word(screenCopy.links.toRefresher, taken && recommended === 'C1')}
        </Link>
        {recheck && (
          <Link className="screen-link" to={paths.activity('C1', 'check')} onClick={choose('C1')}>
            {diagnosticCopy.result.recheck}
          </Link>
        )}
      </nav>
      <Link className="screen-link" to={paths.hub()}>
        {screenCopy.links.backToPath}
      </Link>
    </div>
  )
}
