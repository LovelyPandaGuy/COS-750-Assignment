import { useId } from 'react'
import { moduleLabel } from '../content/modules'
import { startCopy } from '../content/start'
import type { ModuleId } from '../state/learnerState'

/** Shown on a return visit only (wireframe 1b note 2; FR-ONB-03). */
export function ResumeCard({ module, onResume }: { module: ModuleId; onResume: () => void }) {
  const headingId = useId()
  return (
    <section className="resume-card" aria-labelledby={headingId}>
      <div className="resume-card-text">
        <h2 id={headingId}>{startCopy.resumeHeading}</h2>
        <p>{startCopy.resumeLine.replace('{module}', moduleLabel(module))}</p>
      </div>
      <button type="button" className="button-primary" onClick={onResume}>
        {startCopy.resumeButton}
      </button>
    </section>
  )
}
