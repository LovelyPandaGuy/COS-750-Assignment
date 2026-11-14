// C1 and C9 screens (lesson-c1, lesson-c9; ID 7.2, 9.1, 9.2, 9.3, 10.4): the question sets, the C1
// result and route, the readiness report, the student's own question and the certificate.
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { lessonCopy } from '../../content/lesson'
import { MODULE_TITLES } from '../../content/modules'
import { navigationCopy } from '../../content/navigation'
import { CONVENTIONS } from '../../engine/conventions'
import { diagnosticResult } from '../../live/diagnostic'
import { loadContent } from '../../live/load'
import { OUTCOMES, type OutcomeId } from '../../live/outcomes'
import { ownQuestions, readinessQueue, readinessReport } from '../../live/readiness'
import { emitRouteEvent, type RouteTarget } from '../../navigation/routeEvents'
import { paths } from '../../routes'
import { useLearner } from '../../state/LearnerContext'
import type { ModuleId } from '../../state/learnerState'
import type { CheckNav } from './questions/CheckRunner'
import { QuestionCard } from './questions/QuestionCard'

const q = lessonCopy.questions
const labels = CONVENTIONS.labels as unknown as { secure: string; needsReview: string; ready: string; revise: string }

/** C1's readiness questions, the refresher's re-check, or C9's readiness questions, one at a time. */
export function QuestionSet({
  set,
  hintsUsedFor,
  onReview,
  onNav,
}: {
  set: 'diagnostic' | 'recheck' | 'readiness'
  hintsUsedFor: (id: string) => number
  onReview: (screenId: string) => void
  onNav: (nav: CheckNav | null) => void
}) {
  const { learner, completeModule } = useLearner()
  const content = loadContent().content!
  const answered = (id: string) => learner.attempts.some((a) => a.questionId === id)
  const result = diagnosticResult(learner.attempts, content)
  const list = set === 'diagnostic' ? content.diagnostic.questionIds : set === 'recheck' ? result.recheck : readinessQueue(learner.attempts, content)
  const queue = set === 'readiness' ? list : list.filter((id) => !answered(id))
  // C9 keeps an answered question on screen with its feedback until Continue (ID 10.2).
  const [held, setHeld] = useState<string | null>(null)
  const currentId = held ?? queue[0]
  const bank = set === 'readiness' ? content.readiness.questions : content.diagnostic.questions
  const current = currentId === undefined ? undefined : bank.find((x) => x.id === currentId)
  const done = current === undefined
  const quiet = set !== 'readiness'
  const total = set === 'readiness' && content.readiness.questionIds.includes(currentId ?? '') ? content.readiness.questionIds.length : list.length
  const position = set === 'readiness' ? (content.readiness.questionIds.includes(currentId ?? '') ? content.readiness.questionIds.indexOf(currentId!) + 1 : 1) : total - queue.length + 1

  // Completion: C1 when the re-check is done, C9 when its questions are done (lesson-c1, lesson-c9).
  const module: ModuleId | null = set === 'readiness' ? 'C9' : set === 'recheck' ? 'C1' : null
  const finished = done && (set !== 'recheck' || result.complete)
  useEffect(() => {
    if (finished && module !== null && !learner.completedModules.includes(module)) completeModule(module)
  }, [finished, module, learner.completedModules, completeModule])

  useEffect(() => {
    onNav({
      question: current,
      canNext: done || (held !== null && !quiet),
      next: () => {
        if (held !== null) {
          setHeld(null)
          return readinessQueue(learner.attempts, content).length > 0
        }
        return false
      },
    })
  }, [current, done, held, quiet, onNav, learner.attempts, content])
  useEffect(() => () => onNav(null), [onNav])

  if (done)
    return <p className="q-status">{set === 'readiness' ? lessonCopy.c9.setDone : set === 'recheck' ? (list.length === 0 ? lessonCopy.c1.recheckNone : lessonCopy.c1.recheckDone) : lessonCopy.c1.setDone}</p>
  return (
    <div className="q-check">
      <p className="lesson-counter">{q.questionOf(position, total)}</p>
      <QuestionCard
        key={current.id}
        q={current}
        mode="check"
        attemptsAllowed={1}
        hintsUsed={hintsUsedFor(current.id)}
        onReview={onReview}
        label={lessonCopy.treeLabel(q.questionOf(position, total))}
        quiet={quiet}
        onAnswered={() => {
          if (!quiet) setHeld(current.id)
        }}
        onContinue={set === 'readiness' ? () => setHeld(null) : undefined}
        continueLabel={q.nextQuestion}
      />
    </div>
  )
}

/** C1's result: each prerequisite as Secure or Needs review, no total, and the route (ID 7.2, 9.3). */
export function RouteResult({ route }: { route: { passMessage: string; failMessage: string } }) {
  const { learner, completeModule } = useLearner()
  const content = loadContent().content!
  const r = diagnosticResult(learner.attempts, content)
  const recommended: RouteTarget = r.route === 'c2' || r.complete ? 'C2' : 'C1'
  const logged = useRef(false)
  useEffect(() => {
    if (!r.answered || logged.current) return
    logged.current = true
    emitRouteEvent({ type: 'route_recommended', from: 'C1', recommended, at: new Date().toISOString() })
  }, [r.answered, recommended])
  useEffect(() => {
    if (r.complete && !learner.completedModules.includes('C1')) completeModule('C1')
  }, [r.complete, learner.completedModules, completeModule])
  if (!r.answered) return <p>{lessonCopy.c1.answerFirst}</p>
  const choose = (chosen: RouteTarget) => () => emitRouteEvent({ type: 'route_chosen', from: 'C1', recommended, chosen, at: new Date().toISOString() })
  const word = (label: string, suggested: boolean) => (suggested ? navigationCopy.suggested(label) : label)
  const c = lessonCopy.c1
  return (
    <div className="lesson-route">
      <h3>{c.skillsHeading}</h3>
      <ul className="lesson-skills">
        {r.skills.map((s) => (
          <li key={s.questionId} data-status={s.status}>
            <span aria-hidden="true">{s.status === 'secure' ? '✓ ' : '↻ '}</span>
            {s.name}: <strong>{s.status === 'secure' ? labels.secure : labels.needsReview}</strong>
          </li>
        ))}
      </ul>
      <p>{recommended === 'C2' ? route.passMessage : route.failMessage}</p>
      <nav className="route-choice" aria-label={c.routeLabel}>
        <Link className="module-button module-button-secondary" to={paths.module('C2')} onClick={choose('C2')}>
          {word(c.toC2(MODULE_TITLES.C2), recommended === 'C2')}
        </Link>
        <Link className="module-button module-button-secondary" to={paths.activity('C1', 'refresher')} onClick={choose('C1')}>
          {word(c.toRefresher, recommended === 'C1')}
        </Link>
      </nav>
    </div>
  )
}

/** The readiness report (lesson-c9): title, Ready or Revise per objective, flags, links, lists. */
export function ReadinessReportView({ level = 3 }: { level?: 2 | 3 }) {
  const H = `h${level}` as 'h2' | 'h3'
  const { learner } = useLearner()
  const content = loadContent().content!
  const r = readinessReport(learner.attempts, content)
  const c = lessonCopy.c9
  const word = (v: 'ready' | 'revise') => (v === 'ready' ? labels.ready : labels.revise)
  const own = ownQuestions(learner.lectureQuestions)
  return (
    <div className="lesson-report">
      {!r.done && <p className="q-status">{c.answerFirst}</p>}
      <section aria-labelledby="report-title" className="lesson-box">
        <H id="report-title">{c.titleHeading}</H>
        <p className="q-stem">{r.title.title}</p>
        <p>{r.title.message}</p>
        <p>
          <strong>{c.overall(word(r.overall))}</strong>
        </p>
      </section>
      <section aria-labelledby="report-objectives">
        <H id="report-objectives">{c.objectivesHeading}</H>
        <ul className="lesson-report-rows">
          {r.rows.map((row) => {
            const module = row.lesson.toUpperCase() as ModuleId
            return (
              <li key={row.outcome} data-verdict={row.verdict}>
                <p>
                  <span aria-hidden="true">{row.verdict === 'ready' ? '✓ ' : '↻ '}</span>
                  <strong>
                    {row.outcome}: {word(row.verdict)}
                  </strong>
                  {row.optional && ` (${c.optional})`}. {OUTCOMES[row.outcome as OutcomeId]?.statement}
                </p>
                {row.flagged && <p className="q-status">{c.flag}</p>}
                <Link className="screen-link" to={paths.module(module)}>
                  {c.see(`${module} ${MODULE_TITLES[module]}`)}
                </Link>
              </li>
            )
          })}
        </ul>
      </section>
      <section aria-labelledby="report-lecture">
        <H id="report-lecture">{c.lectureHeading}</H>
        {r.lectureQuestions.length + own.length === 0 ? (
          <p>{c.noneYet}</p>
        ) : (
          <ul className="lesson-points">
            {[...r.lectureQuestions, ...own].map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        )}
      </section>
      <section aria-labelledby="report-listen">
        <H id="report-listen">{c.listenHeading}</H>
        <ul className="lesson-points">
          {r.listenFor.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}

/** The student's own lecture question (lesson-c9; FR-RDY-02). */
export function OwnQuestion() {
  const { learner, addOwnQuestion } = useLearner()
  const [draft, setDraft] = useState('')
  const [saved, setSaved] = useState(false)
  const c = lessonCopy.c9
  const own = ownQuestions(learner.lectureQuestions)
  return (
    <div className="q-card">
      <label className="q-stem" htmlFor="own-question">
        {c.ownLabel}
      </label>
      <textarea id="own-question" className="lesson-textarea" rows={3} value={draft} onChange={(e) => (setDraft(e.target.value), setSaved(false))} />
      <button
        type="button"
        className="module-button module-button-primary"
        disabled={draft.trim() === ''}
        onClick={() => {
          addOwnQuestion(draft)
          setDraft('')
          setSaved(true)
        }}
      >
        {c.ownSave}
      </button>
      <p role="status" className="q-status">
        {saved ? c.ownSaved : ''}
      </p>
      {own.length > 0 && (
        <section aria-labelledby="own-list">
          <h3 id="own-list">{c.ownHeading}</h3>
          <ul className="lesson-points">
            {own.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

/** The certificate of completion (lesson-c9; ID 10.4). The name lives only in this component's state. */
export function Certificate() {
  const { learner } = useLearner()
  const content = loadContent().content!
  const [name, setName] = useState('')
  const [shown, setShown] = useState(false)
  const c = lessonCopy.c9
  const text = (content.rewards as { certificateText: { heading: string; body: string; footer: string; bonusNote: string } }).certificateText
  const title = readinessReport(learner.attempts, content).title.title
  const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const fill = (t: string) =>
    t.replace(/\{(\w+)\}/g, (w, k: string) => ({ studentName: name.trim(), lessonsCompleted: String(learner.completedModules.length), title, date })[k] ?? w)
  return (
    <div className="q-card">
      <label className="q-stem" htmlFor="certificate-name">
        {c.nameLabel}
      </label>
      <input id="certificate-name" className="lesson-input" type="text" autoComplete="off" value={name} onChange={(e) => (setName(e.target.value), setShown(false))} />
      <button type="button" className="module-button module-button-primary" disabled={name.trim() === ''} onClick={() => setShown(true)}>
        {c.generate}
      </button>
      {shown && (
        <>
          <section className="certificate" aria-label={c.certificateLabel}>
            <h3>{text.heading}</h3>
            <p className="q-stem">{fill(text.body)}</p>
            <p>{fill(text.footer)}</p>
            <p className="q-status">{text.bonusNote}</p>
          </section>
          <button type="button" className="module-button module-button-secondary" onClick={() => window.print()}>
            {c.print}
          </button>
        </>
      )}
    </div>
  )
}
