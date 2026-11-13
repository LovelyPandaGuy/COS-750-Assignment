import { useEffect, useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { instantiate } from '../assessment/instantiate'
import { checkSeed } from '../assessment/session'
import { conventionsWording } from '../content/modules/conventionsWording'
import { diagnosticCopy } from '../content/diagnostic'
import { DIAGNOSTIC } from '../content/questions/diagnostic'
import { screenCopy } from '../content/screens'
import { diagnosticPhase } from '../navigation/diagnostic'
import { paths } from '../routes'
import { useLearner } from '../state/LearnerContext'
import type { Attempt } from '../state/learnerState'
import { DiagnosticQuestion } from '../ui/module/check/DiagnosticQuestion'

type Screen = { kind: 'intro' } | { kind: 'conventions' } | { kind: 'question'; itemId: string; attempt: number }

const w = conventionsWording()

/** The warm-up check (wireframe 1c): how it works, the conventions card, then one question per screen (FR-DIA-01 to -05). */
export function WarmUpCheck() {
  const { learner, recordAttempt, completeModule, setPath } = useLearner()
  const navigate = useNavigate()
  const phase = diagnosticPhase(learner.attempts)
  const heading = useRef<HTMLHeadingElement>(null)
  const shown = useRef<number | null>(null)

  // The screens: the first round has two getting-started screens; the re-check is the weak items as attempt 1.
  const screens: Screen[] =
    phase.name === 'recheck'
      ? phase.itemIds.map((itemId) => ({ kind: 'question', itemId, attempt: 1 }))
      : [{ kind: 'intro' }, { kind: 'conventions' }, ...DIAGNOSTIC.map((i): Screen => ({ kind: 'question', itemId: i.id, attempt: 0 }))]
  const [pos, setPos] = useState(() => {
    if (phase.name === 'recheck') return phase.index
    if (phase.name === 'questions') return phase.index === 0 && learner.attempts.every((a) => !a.questionId.startsWith('dx-')) ? 0 : 2 + phase.index
    return 0
  })

  useEffect(() => {
    if (shown.current !== null && shown.current !== pos) heading.current?.focus()
    shown.current = pos
  }, [pos])

  if (phase.name === 'done') return <Navigate to={paths.warmUpResult()} replace />

  const screen = screens[Math.min(pos, screens.length - 1)]
  const questions = screens.filter((s) => s.kind === 'question')
  const skip = () => {
    setPath('diagnostic-skipped', 'C2')
    navigate(paths.module('C2'))
  }
  const submit = (attempt: Attempt) => {
    recordAttempt(attempt)
    const after = diagnosticPhase([...learner.attempts, attempt])
    if (after.name === 'done') completeModule('C1')
    if (after.name === 'done' || (phase.name === 'questions' && after.name !== 'questions')) navigate(paths.warmUpResult())
    else setPos(pos + 1)
  }

  return (
    <div className="screen-stack module-player">
      <h1 tabIndex={-1}>{screenCopy.activity.warmUpCheck}</h1>
      <section className="module-step">
        {screen.kind === 'intro' && (
          <>
            <h2 ref={heading} tabIndex={-1}>{diagnosticCopy.intro.heading}</h2>
            {diagnosticCopy.intro.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </>
        )}
        {screen.kind === 'conventions' && (
          <>
            <h2 ref={heading} tabIndex={-1}>{diagnosticCopy.conventions.heading}</h2>
            <p>{diagnosticCopy.conventions.intro}</p>
            <p>{diagnosticCopy.conventions.height(w)}</p>
            <p>{diagnosticCopy.conventions.balance(w)}</p>
          </>
        )}
        {screen.kind === 'question' &&
          (() => {
            const item = DIAGNOSTIC.find((i) => i.id === screen.itemId)!
            const inst = instantiate(item, checkSeed(learner.profileId, item.id), screen.attempt)
            const stored = learner.attempts.filter((a) => a.questionId === item.id)[screen.attempt] ?? null
            const n = questions.indexOf(screen) + 1
            return (
              <>
                <h2 ref={heading} tabIndex={-1}>{diagnosticCopy.question(n, questions.length)}</h2>
                <DiagnosticQuestion
                  key={`${item.id}-${screen.attempt}`}
                  inst={inst}
                  answered={stored}
                  onSubmit={submit}
                  onForward={() => setPos(pos + 1)}
                  nextLabel={diagnosticCopy.next}
                />
              </>
            )
          })()}
      </section>
      <div role="group" aria-label="Warm-up controls" className="control-strip">
        <div className="control-strip-side">
          {pos > 0 && (
            <button type="button" className="module-button module-button-secondary" onClick={() => setPos(pos - 1)}>
              {diagnosticCopy.back}
            </button>
          )}
          {screen.kind !== 'question' && (
            <button type="button" className="module-button module-button-primary" onClick={() => setPos(pos + 1)}>
              {diagnosticCopy.next}
            </button>
          )}
          <button type="button" className="module-button module-button-quiet" onClick={skip}>
            {diagnosticCopy.skip}
          </button>
        </div>
      </div>
    </div>
  )
}
