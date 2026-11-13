import { Link } from 'react-router-dom'
import { C1_REFRESHER } from '../content/modules/c1Refresher'
import { MODULE_TITLES } from '../content/modules'
import { diagnosticCopy } from '../content/diagnostic'
import { diagnosticPhase } from '../navigation/diagnostic'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'
import { ModulePlayer } from '../ui/module/ModulePlayer'

/** The BST refresher screen: the step player under its own heading, ending at the re-check or C2. */
export function Refresher() {
  const { learner } = useLearner()
  const recheck = diagnosticPhase(learner.attempts).name === 'recheck'
  const to = recheck ? paths.activity('C1', 'check') : paths.module('C2')
  return (
    <ModulePlayer
      content={C1_REFRESHER}
      activity="explore"
      heading="BST refresher"
      finishTo={to}
      endPanel={
        <section className="route-choice" aria-label={diagnosticCopy.refresher.endHeading}>
          <Link className="module-button module-button-secondary" to={to}>
            {recheck ? diagnosticCopy.refresher.toRecheck : `${diagnosticCopy.refresher.toC2} ${MODULE_TITLES.C2}`}
          </Link>
        </section>
      }
    />
  )
}
