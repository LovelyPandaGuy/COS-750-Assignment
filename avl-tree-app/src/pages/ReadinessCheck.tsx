import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../ui/module/module.css'
import { readinessComplete, recycleItems } from '../assessment/readiness'
import { READINESS } from '../content/questions/readiness'
import { OUTCOME_MODULE, readinessCopy } from '../content/readiness'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'
import { CheckItem } from '../ui/module/check/CheckItem'

type Step = { kind: 'intro' } | { kind: 'item'; itemId: string; since: number; heading: string } | { kind: 'end' }
const copy = readinessCopy.c9

/** The C9 check (ID C9, D14): eleven questions, then any outcome not yet Ready comes back once, then the summary link. */
export function ReadinessCheck() {
  const { learner, completeModule } = useLearner()
  const [pos, setPos] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const shown = useRef(pos)
  const recycle = recycleItems(learner.attempts)
  const done = readinessComplete(learner.attempts)

  const steps: Step[] = [
    { kind: 'intro' },
    ...READINESS.map((i, n): Step => ({ kind: 'item', itemId: i.id, since: 0, heading: copy.question(n + 1, READINESS.length) })),
    ...recycle.map((r, n): Step => ({ kind: 'item', itemId: r.itemId, since: r.since, heading: copy.recycleHeading(n + 1, recycle.length) })),
    { kind: 'end' },
  ]
  const step = steps[Math.min(pos, steps.length - 1)]

  useEffect(() => {
    if (shown.current !== pos) heading.current?.focus()
    shown.current = pos
  }, [pos])

  useEffect(() => {
    if (done && !learner.completedModules.includes('C9')) completeModule('C9')
  }, [done, learner.completedModules, completeModule])

  return (
    <div className="screen-stack module-player">
      <h1 tabIndex={-1}>{screenCopy.activity.labels.check}</h1>
      <section className="module-step">
        {step.kind === 'intro' && (
          <>
            <h2 ref={heading} tabIndex={-1}>{copy.introHeading}</h2>
            <p>{copy.intro}</p>
            <button type="button" className="module-button module-button-primary" onClick={() => setPos(1)}>
              {copy.start}
            </button>
          </>
        )}
        {step.kind === 'item' &&
          (() => {
            const item = READINESS.find((i) => i.id === step.itemId)!
            return (
              <>
                <h2 ref={heading} tabIndex={-1}>{step.heading}</h2>
                <CheckItem
                  key={`${item.id}-${step.since}`}
                  item={item}
                  since={step.since}
                  isLast={pos === steps.length - 2}
                  reviewTo={paths.activity(OUTCOME_MODULE[item.outcome as keyof typeof OUTCOME_MODULE], 'example')}
                  onNext={() => setPos(pos + 1)}
                />
              </>
            )
          })()}
        {step.kind === 'end' && (
          <>
            <h2 ref={heading} tabIndex={-1}>{copy.endHeading}</h2>
            <p>{copy.endText}</p>
            <Link className="module-button module-button-primary" to={paths.readiness()}>
              {copy.toSummary}
            </Link>
          </>
        )}
      </section>
      {pos > 0 && (
        <div className="control-strip">
          <button type="button" className="module-button module-button-secondary" onClick={() => setPos(pos - 1)}>
            {copy.back}
          </button>
        </div>
      )}
    </div>
  )
}
