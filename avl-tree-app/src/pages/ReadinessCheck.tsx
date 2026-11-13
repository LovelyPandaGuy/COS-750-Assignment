import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import '../ui/module/module.css'
import { c9RunFinished, readinessInstance, readinessStep, startReadiness, type ReadinessSession } from '../assessment/readiness'
import { lectureList } from '../assessment/report'
import { checkSeed } from '../assessment/session'
import type { Instance, Mark } from '../assessment/types'
import { OUTCOMES } from '../content/questions/outcomes'
import { READINESS } from '../content/questions/readiness'
import { readinessCopy } from '../content/readiness'
import { screenCopy } from '../content/screens'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'
import { ReadinessQuestion } from '../ui/module/check/ReadinessQuestion'

const copy = readinessCopy.c9

/** A question on screen: the session it was asked in, so its instance stays put while its feedback shows. */
interface Shown {
  session: ReadinessSession
  inst: Instance
  marked: Mark | null
}

/**
 * The C9 check (ID C9, D14, add-readiness-c9): every readiness item once with one try, then each
 * missed item once more as a new problem, then the summary link. C9 completes once the run is over
 * and the student has written a question of their own (decision 11).
 */
export function ReadinessCheck() {
  const { learner, recordAttempt, completeModule } = useLearner()
  const [started, setStarted] = useState(false)
  const [session, setSession] = useState<ReadinessSession>(() => startReadiness(checkSeed(learner.profileId, 'C9')))
  const [shown, setShown] = useState<Shown | null>(null)
  /** Questions already finished, for Back (D20); answers there are read-only, since C9 has one try. */
  const [past, setPast] = useState<Shown[]>([])
  const [viewing, setViewing] = useState<number | null>(null)
  const [returnsTotal, setReturnsTotal] = useState(0)
  const heading = useRef<HTMLHeadingElement>(null)
  const live: Shown | null = shown ?? (session.queue.length === 0 ? null : { session, inst: readinessInstance(session)!, marked: null })
  const current = viewing !== null ? past[viewing] : live
  const done = started && current === null
  const firstPass = READINESS.length

  useEffect(() => {
    heading.current?.focus()
  }, [started, session, viewing])

  useEffect(() => {
    if (c9RunFinished(learner.attempts) && !lectureList(learner.attempts, learner.lectureQuestions).needsOwn && !learner.completedModules.includes('C9')) {
      completeModule('C9')
    }
  }, [learner.attempts, learner.lectureQuestions, learner.completedModules, completeModule])

  const answer: Parameters<typeof ReadinessQuestion>[0]['onAnswer'] = (response, confidence) => {
    const step = readinessStep(session, { type: 'answer', response, at: new Date().toISOString(), ...(confidence !== null ? { confidence } : {}) })
    if (step.mark === undefined) return
    if (step.mark.status === 'unreadable') return setShown({ session, inst: current!.inst, marked: step.mark })
    if (step.attempt !== undefined) recordAttempt(step.attempt)
    setShown({ session, inst: current!.inst, marked: step.mark })
    move(step.session)
  }
  const move = (to: ReadinessSession) => {
    if (session.phase === 'first' && to.phase === 'returns') setReturnsTotal(to.queue.length)
    setSession(to)
  }
  const next = () => {
    if (viewing !== null) return setViewing(viewing + 1 < past.length ? viewing + 1 : null)
    if (shown !== null) setPast([...past, shown])
    setShown(null)
  }
  const skip = () => {
    setShown(null)
    move(readinessStep(session, { type: 'skip' }).session)
  }
  const back = () => setViewing(viewing === null ? past.length - 1 : Math.max(0, viewing - 1))

  const title =
    current === null
      ? ''
      : current.session.phase === 'returns'
        ? copy.returnsHeading(returnsTotal - current.session.queue.length + 1, returnsTotal)
        : copy.question(firstPass - current.session.queue.length + 1, firstPass)

  return (
    <div className="screen-stack module-player">
      <h1 tabIndex={-1}>{screenCopy.activity.labels.check}</h1>
      <section className="module-step">
        {!started && (
          <>
            <h2 ref={heading} tabIndex={-1}>{copy.introHeading}</h2>
            <p>{copy.intro}</p>
            <button type="button" className="module-button module-button-primary" onClick={() => setStarted(true)}>
              {copy.start}
            </button>
          </>
        )}
        {started && current !== null && (
          <>
            <h2 ref={heading} tabIndex={-1}>{title}</h2>
            <ReadinessQuestion
              key={`${current.inst.itemId}-${current.inst.attempt}`}
              inst={current.inst}
              marked={current.marked}
              optional={READINESS.find((i) => i.id === current.inst.itemId)?.optional === true}
              reviewTo={paths.activity(OUTCOMES[READINESS.find((i) => i.id === current.inst.itemId)!.outcome].modules[0], 'example')}
              isLast={viewing === null && current.marked !== null && session.queue.length === 0}
              onAnswer={answer}
              onSkip={skip}
              onNext={next}
            />
          </>
        )}
        {done && (
          <>
            <h2 ref={heading} tabIndex={-1}>{copy.endHeading}</h2>
            <p>{copy.endText}</p>
            {lectureList(learner.attempts, learner.lectureQuestions).needsOwn && <p>{copy.endNeedsOwn}</p>}
            <Link className="module-button module-button-primary" to={paths.readiness()}>
              {copy.toSummary}
            </Link>
          </>
        )}
      </section>
      {started && past.length > 0 && viewing !== 0 && (
        <div className="control-strip">
          <button type="button" className="module-button module-button-secondary" onClick={back}>
            {copy.back}
          </button>
        </div>
      )}
    </div>
  )
}
